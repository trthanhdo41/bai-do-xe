import PDFDocument from "pdfkit";
import { ParkingSession } from "../models/ParkingSession.js";
import { parkingConfig } from "../config/parking.js";

export type ReceiptData = {
  sessionId: string;
  plate: string;
  ownerName: string;
  slot: string;
  checkIn: string;
  checkOut: string;
  totalMinutes: number;
  billableHours: number;
  hourlyRate: number;
  parkingFee: number;
  overdueFine: number;
  discount: number;
  totalFee: number;
  paymentStatus: string;
  paymentMethod?: string;
};

export async function getReceiptData(sessionId: string): Promise<ReceiptData> {
  const session = await ParkingSession.findById(sessionId);
  if (!session) {
    const err = new Error("Phien khong ton tai.") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  if (session.status !== "Đã hoàn thành") {
    const err = new Error("Phien chua hoan thanh, khong the tao bien lai.") as Error & { status: number };
    err.status = 400;
    throw err;
  }

  return {
    sessionId: session._id.toString(),
    plate: session.plate,
    ownerName: session.ownerName,
    slot: session.slot,
    checkIn: session.checkInAt.toLocaleString("vi-VN"),
    checkOut: session.checkOutAt?.toLocaleString("vi-VN") || "",
    totalMinutes: session.feeBreakdown?.totalMinutes ?? 0,
    billableHours: session.feeBreakdown?.billableHours ?? 0,
    hourlyRate: session.feeBreakdown?.hourlyRate ?? 0,
    parkingFee: session.feeBreakdown?.parkingFee ?? 0,
    overdueFine: (session.feeBreakdown as any)?.overdueFine ?? 0,
    discount: session.discountAmount ?? 0,
    totalFee: session.fee,
    paymentStatus: session.paymentStatus,
    paymentMethod: session.paymentMethod,
  };
}

export async function generateReceiptPdf(sessionId: string): Promise<Buffer> {
  const data = await getReceiptData(sessionId);

  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: [300, 500] });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    // Header
    doc.fontSize(14).text(parkingConfig.brandName, { align: "center" });
    doc.fontSize(8).text(parkingConfig.address, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(11).text("BIEN LAI GIU XE", { align: "center" });
    doc.moveDown(0.5);

    // Separator
    doc.text("─".repeat(36));

    // Details
    doc.fontSize(9);
    doc.text(`Ma phien: ${data.sessionId}`);
    doc.text(`Bien so: ${data.plate}`);
    doc.text(`Chu xe: ${data.ownerName}`);
    doc.text(`Vi tri: ${data.slot}`);
    doc.text(`Gio vao: ${data.checkIn}`);
    doc.text(`Gio ra: ${data.checkOut}`);
    doc.moveDown(0.3);

    doc.text("─".repeat(36));

    // Fee breakdown
    doc.text(`Tong phut: ${data.totalMinutes}`);
    doc.text(`Gio tinh phi: ${data.billableHours}`);
    doc.text(`Don gia: ${data.hourlyRate.toLocaleString("vi-VN")} VND/h`);
    doc.text(`Phi gui: ${data.parkingFee.toLocaleString("vi-VN")} VND`);
    if (data.overdueFine > 0) {
      doc.text(`Phat qua han: ${data.overdueFine.toLocaleString("vi-VN")} VND`);
    }
    if (data.discount > 0) {
      doc.text(`Giam gia: -${data.discount.toLocaleString("vi-VN")} VND`);
    }
    doc.moveDown(0.3);
    doc.text("─".repeat(36));
    doc.fontSize(11).text(`TONG: ${data.totalFee.toLocaleString("vi-VN")} VND`, { align: "right" });
    doc.fontSize(9);
    doc.moveDown(0.3);
    doc.text(`Thanh toan: ${data.paymentStatus === "paid" ? "Da thanh toan" : "Chua thanh toan"}${data.paymentMethod ? ` (${data.paymentMethod})` : ""}`);

    doc.moveDown(1);
    doc.fontSize(8).text("Cam on quy khach!", { align: "center" });

    doc.end();
  });
}
