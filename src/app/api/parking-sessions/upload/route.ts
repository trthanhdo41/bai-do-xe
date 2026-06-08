import { detectVehicleImage } from "@/lib/ai";
import { readSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { platesMatch } from "@/lib/plate";
import { serializeParkingSession } from "@/lib/serializers";
import { saveUploadedImage } from "@/lib/upload";
import { ParkingSession } from "@/models/ParkingSession";
import { NextResponse } from "next/server";

function calculateFee(vehicleType: "Ô tô" | "Xe máy") {
  return vehicleType === "Ô tô" ? 35000 : 12000;
}

function getText(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const user = await readSession();
  if (!user || user.role === "customer") {
    return NextResponse.json({ message: "Không có quyền xử lý ảnh xe." }, { status: 403 });
  }

  await connectDb();
  const form = await request.formData();
  const action = getText(form, "action");
  const image = form.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ message: "Thiếu ảnh xe." }, { status: 400 });
  }

  const detection = await detectVehicleImage(image);
  if (!detection.plate) {
    return NextResponse.json(
      { message: "Không nhận diện được biển số. Vui lòng upload ảnh rõ hơn hoặc xác minh thủ công." },
      { status: 422 },
    );
  }

  if (action === "entry") {
    const imageUrl = await saveUploadedImage(image, "entry");
    const vehicleType = getText(form, "vehicleType") === "Xe máy" ? "Xe máy" : "Ô tô";
    const activeCount = await ParkingSession.countDocuments({ status: "Đang gửi" });
    const session = await ParkingSession.create({
      plate: detection.plate,
      ownerName: getText(form, "owner") || "Khách vãng lai",
      vehicleType,
      slot: vehicleType === "Ô tô" ? `A-${String((activeCount % 40) + 1).padStart(2, "0")}` : `B-${String((activeCount % 80) + 1).padStart(2, "0")}`,
      entryImageUrl: imageUrl,
      entryDetectedPlate: detection.plate,
      entryConfidence: detection.confidence,
      aiRawText: detection.rawText,
      createdBy: user.id,
    });

    return NextResponse.json({ session: serializeParkingSession(session), detection }, { status: 201 });
  }

  if (action === "exit") {
    const sessionId = getText(form, "sessionId");
    const session = await ParkingSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ message: "Không tìm thấy phiên đỗ xe." }, { status: 404 });
    }

    const matched = platesMatch(session.entryDetectedPlate || session.plate, detection.plate);
    const imageUrl = await saveUploadedImage(image, "exit");

    session.exitImageUrl = imageUrl;
    session.exitDetectedPlate = detection.plate;
    session.exitConfidence = detection.confidence;
    session.matchStatus = matched ? "Khớp" : "Không khớp";

    if (matched) {
      session.status = "Đã hoàn thành";
      session.checkOutAt = new Date();
      session.fee = calculateFee(session.vehicleType);
    }

    await session.save();
    return NextResponse.json({
      session: serializeParkingSession(session),
      detection,
      matched,
      message: matched ? "Biển số khớp, đã checkout." : "Biển số không khớp, cần xác minh thủ công.",
    });
  }

  return NextResponse.json({ message: "Action không hợp lệ." }, { status: 400 });
}
