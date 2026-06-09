import { readSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { allocateCarSlot, calculateParkingFee } from "@/lib/parking-config";
import { serializeParkingSession } from "@/lib/serializers";
import { ParkingSession } from "@/models/ParkingSession";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSessionSchema = z.object({
  plate: z.string().min(5),
  owner: z.string().min(2),
  vehicleType: z.literal("Ô tô").default("Ô tô"),
});

export async function GET() {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  await connectDb();
  const sessions = await ParkingSession.find().sort({ createdAt: -1 }).limit(100);
  return NextResponse.json({ sessions: sessions.map(serializeParkingSession) });
}

export async function POST(request: Request) {
  const user = await readSession();
  if (!user || user.role === "customer") {
    return NextResponse.json({ message: "Không có quyền tạo phiên." }, { status: 403 });
  }

  await connectDb();
  const body = createSessionSchema.parse(await request.json());
  const activeCount = await ParkingSession.countDocuments({ status: "Đang gửi" });
  const session = await ParkingSession.create({
    plate: body.plate,
    ownerName: body.owner,
    vehicleType: "Ô tô",
    slot: allocateCarSlot(activeCount),
    createdBy: user.id,
  });

  return NextResponse.json({ session: serializeParkingSession(session) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await readSession();
  if (!user || user.role === "customer") {
    return NextResponse.json({ message: "Không có quyền hoàn thành phiên." }, { status: 403 });
  }

  await connectDb();
  const body = z.object({ id: z.string().min(1) }).parse(await request.json());
  const session = await ParkingSession.findById(body.id);
  if (!session) {
    return NextResponse.json({ message: "Không tìm thấy phiên." }, { status: 404 });
  }

  session.status = "Đã hoàn thành";
  session.checkOutAt = new Date();
  session.fee = calculateParkingFee(session.checkInAt, session.checkOutAt);
  await session.save();

  return NextResponse.json({ session: serializeParkingSession(session) });
}
