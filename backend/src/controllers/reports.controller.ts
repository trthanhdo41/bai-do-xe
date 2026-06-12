import { Request, Response } from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { ParkingSession, ParkingSessionDocument } from "../models/ParkingSession.js";
import { Transaction } from "../models/Transaction.js";

function formatDateInput(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function getDateRange(request: Request) {
  const today = new Date();
  const defaultDate = today.toISOString().slice(0, 10);
  const fromText = formatDateInput(request.query.from) || defaultDate;
  const toText = formatDateInput(request.query.to) || fromText;
  const from = new Date(`${fromText}T00:00:00.000`);
  const to = new Date(`${toText}T23:59:59.999`);

  return { fromText, toText, from, to };
}

function sessionRow(session: ParkingSessionDocument) {
  return {
    "Mã phiên": session._id.toString(),
    "Biển số": session.plate,
    "Chủ xe": session.ownerName,
    "Loại xe": session.vehicleType,
    "Vị trí": session.slot,
    "Trạng thái": session.status,
    "Giờ vào": session.checkInAt.toLocaleString("vi-VN"),
    "Giờ ra": session.checkOutAt?.toLocaleString("vi-VN") || "",
    "Tổng phút": session.feeBreakdown?.totalMinutes ?? "",
    "Giờ tính phí": session.feeBreakdown?.billableHours ?? "",
    "Đơn giá giờ": session.feeBreakdown?.hourlyRate ?? "",
    "Phí gửi": session.feeBreakdown?.parkingFee ?? session.fee,
    "Phí phạt": session.feeBreakdown?.overdueFine ?? 0,
    "Tổng tiền": session.fee,
    "Match": session.matchStatus || "",
    "AI biển vào": session.entryDetectedPlate || "",
    "AI biển ra": session.exitDetectedPlate || "",
  };
}

export async function getReportSummary(request: Request, response: Response) {
  const { fromText, toText, from, to } = getDateRange(request);
  const [entryCount, exitSessions, activeCount] = await Promise.all([
    ParkingSession.countDocuments({ checkInAt: { $gte: from, $lte: to } }),
    ParkingSession.find({
      status: "Đã hoàn thành",
      checkOutAt: { $gte: from, $lte: to },
    }),
    ParkingSession.countDocuments({ status: "Đang gửi" }),
  ]);

  const revenue = exitSessions.reduce((sum, session) => sum + session.fee, 0);
  const freeSessionCount = exitSessions.filter((session) => session.fee === 0).length;
  const paidSessionCount = exitSessions.filter((session) => session.fee > 0).length;

  response.json({
    summary: {
      from: fromText,
      to: toText,
      entryCount,
      exitCount: exitSessions.length,
      activeCount,
      revenue,
      freeSessionCount,
      paidSessionCount,
    },
  });
}

export async function exportReport(request: Request, response: Response) {
  const { fromText, toText, from, to } = getDateRange(request);
  const type = request.query.type === "revenue" ? "revenue" : "sessions";
  const format = request.query.format === "pdf" ? "pdf" : "xlsx";
  const sessions =
    type === "revenue"
      ? await ParkingSession.find({
          status: "Đã hoàn thành",
          checkOutAt: { $gte: from, $lte: to },
        }).sort({ checkOutAt: -1 })
      : await ParkingSession.find({ checkInAt: { $gte: from, $lte: to } }).sort({ checkInAt: -1 });
  const rows = sessions.map(sessionRow);

  if (format === "pdf") {
    const transactions = await Transaction.find({
      createdAt: { $gte: from, $lte: to },
      status: "paid",
    });
    const totalPaid = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const buffer = await buildPdfReport({
      title: type === "revenue" ? "Bao cao doanh thu iPARK" : "Bao cao phien do xe iPARK",
      fromText,
      toText,
      sessions,
      totalPaid,
    });

    response.setHeader(
      "Content-Disposition",
      `attachment; filename="ipark-${type}-${fromText}-${toText}.pdf"`,
    );
    response.setHeader("Content-Type", "application/pdf");
    response.end(buffer);
    return;
  }

  const normalizedRows = rows.length ? rows : [{ "Không có dữ liệu": "" }];
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(type === "revenue" ? "Doanh thu" : "Phiên đỗ xe");
  worksheet.columns = Object.keys(normalizedRows[0]).map((key) => ({
    header: key,
    key,
    width: Math.max(16, key.length + 4),
  }));
  worksheet.addRows(normalizedRows);
  worksheet.getRow(1).font = { bold: true };
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

  response.setHeader(
    "Content-Disposition",
    `attachment; filename="ipark-${type}-${fromText}-${toText}.xlsx"`,
  );
  response.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  response.end(buffer);
}

function buildPdfReport(values: {
  title: string;
  fromText: string;
  toText: string;
  sessions: ParkingSessionDocument[];
  totalPaid: number;
}) {
  return new Promise<Buffer>((resolve) => {
    const document = new PDFDocument({ margin: 42, size: "A4" });
    const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));

    const revenue = values.sessions.reduce((sum, session) => sum + session.fee, 0);
    document.fontSize(20).text(values.title, { align: "center" });
    document.moveDown(0.5);
    document.fontSize(11).text(`Khoang ngay: ${values.fromText} - ${values.toText}`);
    document.text(`Tong phien: ${values.sessions.length}`);
    document.text(`Doanh thu checkout: ${revenue.toLocaleString("vi-VN")} VND`);
    document.text(`Da xac nhan thanh toan: ${values.totalPaid.toLocaleString("vi-VN")} VND`);
    document.moveDown();

    document.fontSize(12).text("Danh sach phien gan nhat", { underline: true });
    document.moveDown(0.5);
    values.sessions.slice(0, 40).forEach((session, index) => {
      document
        .fontSize(9)
        .text(
          `${index + 1}. ${session.plate} | ${session.ownerName} | ${session.status} | ${session.fee.toLocaleString(
            "vi-VN",
          )} VND`,
        );
    });

    if (!values.sessions.length) {
      document.fontSize(10).text("Khong co du lieu trong khoang ngay da chon.");
    }

    document.end();
  });
}
