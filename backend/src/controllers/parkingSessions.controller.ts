import { Request, Response } from "express";
import { z } from "zod";
import { allocateCarSlot, calculateParkingFee, parkingConfig } from "../config/parking.js";
import { ParkingSession } from "../models/ParkingSession.js";
import { detectVehicleImage } from "../services/ai.service.js";
import { imageHashSimilarity, platesMatch } from "../services/plate.service.js";
import { saveUploadedImage } from "../services/upload.service.js";
import { serializeParkingSession } from "../utils/serializers.js";

export async function listParkingSessions(_request: Request, response: Response) {
  const sessions = await ParkingSession.find().sort({ createdAt: -1 }).limit(100);
  response.json({ sessions: sessions.map(serializeParkingSession) });
}

export async function createParkingSession(request: Request, response: Response) {
  const body = z
    .object({
      plate: z.string().min(5),
      owner: z.string().min(2),
      vehicleType: z.literal("Ô tô").default("Ô tô"),
    })
    .parse(request.body);

  const activeCount = await ParkingSession.countDocuments({ status: "Đang gửi" });
  if (activeCount >= parkingConfig.totalCapacity) {
    response.status(409).json({ message: "Bãi xe đã đủ 30 chỗ." });
    return;
  }

  const session = await ParkingSession.create({
    plate: body.plate,
    ownerName: body.owner,
    vehicleType: "Ô tô",
    slot: allocateCarSlot(activeCount),
    createdBy: request.user?.id,
  });

  response.status(201).json({ session: serializeParkingSession(session) });
}

export async function completeParkingSession(request: Request, response: Response) {
  const body = z.object({ id: z.string().min(1) }).parse(request.body);
  const session = await ParkingSession.findById(body.id);
  if (!session) {
    response.status(404).json({ message: "Không tìm thấy phiên." });
    return;
  }

  session.status = "Đã hoàn thành";
  session.checkOutAt = new Date();
  session.fee = calculateParkingFee(session.checkInAt, session.checkOutAt);
  await session.save();

  response.json({ session: serializeParkingSession(session) });
}

export async function uploadParkingImage(request: Request, response: Response) {
  const action = String(request.body.action || "");
  const image = request.file;

  if (!image) {
    response.status(400).json({ message: "Thiếu ảnh xe." });
    return;
  }

  const detection = await detectVehicleImage(image);
  if (!detection.plate) {
    response.status(422).json({
      message: "Không nhận diện được biển số. Vui lòng upload ảnh rõ hơn hoặc xác minh thủ công.",
    });
    return;
  }

  if (action === "entry") {
    const activeCount = await ParkingSession.countDocuments({ status: "Đang gửi" });
    if (activeCount >= parkingConfig.totalCapacity) {
      response.status(409).json({ message: "Bãi xe đã đủ 30 chỗ." });
      return;
    }

    const imageUrl = await saveUploadedImage(image, "entry");
    const session = await ParkingSession.create({
      plate: detection.plate,
      ownerName: String(request.body.owner || "Khách vãng lai"),
      vehicleType: "Ô tô",
      slot: allocateCarSlot(activeCount),
      entryImageUrl: imageUrl,
      entryDetectedPlate: detection.plate,
      entryConfidence: detection.confidence,
      entryImageHash: detection.imageHash,
      aiRawText: detection.rawText,
      createdBy: request.user?.id,
    });

    response.status(201).json({ session: serializeParkingSession(session), detection });
    return;
  }

  if (action === "exit") {
    const session = await ParkingSession.findById(String(request.body.sessionId || ""));
    if (!session) {
      response.status(404).json({ message: "Không tìm thấy phiên đỗ xe." });
      return;
    }

    const matched = platesMatch(session.entryDetectedPlate || session.plate, detection.plate);
    const vehicleScore = imageHashSimilarity(session.entryImageHash, detection.imageHash);
    const imageUrl = await saveUploadedImage(image, "exit");

    session.exitImageUrl = imageUrl;
    session.exitDetectedPlate = detection.plate;
    session.exitConfidence = detection.confidence;
    session.exitImageHash = detection.imageHash;
    session.vehicleMatchScore = vehicleScore;
    session.matchStatus = matched ? "Khớp" : "Không khớp";

    if (matched) {
      session.status = "Đã hoàn thành";
      session.checkOutAt = new Date();
      session.fee = calculateParkingFee(session.checkInAt, session.checkOutAt);
    }

    await session.save();
    response.json({
      session: serializeParkingSession(session),
      detection,
      matched,
      message: matched ? "Biển số khớp, đã checkout." : "Biển số không khớp, cần xác minh thủ công.",
    });
    return;
  }

  response.status(400).json({ message: "Action không hợp lệ." });
}
