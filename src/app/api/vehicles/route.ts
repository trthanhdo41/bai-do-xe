import { readSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { serializeVehicle } from "@/lib/serializers";
import { Vehicle } from "@/models/Vehicle";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  await connectDb();
  const vehicles = await Vehicle.find().sort({ createdAt: -1 }).limit(100);
  return NextResponse.json({ vehicles: vehicles.map(serializeVehicle) });
}

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) {
    return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  }

  await connectDb();
  const body = z
    .object({
      plate: z.string().min(5),
      owner: z.string().min(2),
      vehicleType: z.literal("Ô tô").default("Ô tô"),
    })
    .parse(await request.json());

  const vehicle = await Vehicle.create({
    plate: body.plate,
    ownerName: body.owner,
    vehicleType: "Ô tô",
    status: user.role === "customer" ? "Cần duyệt" : "Đã đăng ký",
    userId: user.id,
  });

  return NextResponse.json({ vehicle: serializeVehicle(vehicle) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await readSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Chỉ admin được duyệt phương tiện." }, { status: 403 });
  }

  await connectDb();
  const body = z
    .object({
      id: z.string().min(1),
      status: z.enum(["Đã đăng ký", "Cần duyệt", "Blacklist"]),
    })
    .parse(await request.json());

  const vehicle = await Vehicle.findByIdAndUpdate(body.id, { status: body.status }, { new: true });
  if (!vehicle) {
    return NextResponse.json({ message: "Không tìm thấy phương tiện." }, { status: 404 });
  }

  return NextResponse.json({ vehicle: serializeVehicle(vehicle) });
}
