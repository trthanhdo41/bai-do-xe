import { readSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { serializeUser } from "@/lib/serializers";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const user = await readSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Chỉ admin được xem người dùng." }, { status: 403 });
  }

  await connectDb();
  const users = await User.find().sort({ createdAt: -1 }).limit(200);
  return NextResponse.json({ users: users.map(serializeUser) });
}

export async function PATCH(request: Request) {
  const user = await readSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Chỉ admin được cập nhật người dùng." }, { status: 403 });
  }

  await connectDb();
  const body = z
    .object({
      id: z.string().min(1),
      role: z.enum(["admin", "staff", "customer"]).optional(),
      status: z.enum(["Đang hoạt động", "Đã khóa"]).optional(),
    })
    .parse(await request.json());

  const updated = await User.findByIdAndUpdate(
    body.id,
    {
      ...(body.role ? { role: body.role } : {}),
      ...(body.status ? { status: body.status } : {}),
    },
    { new: true },
  );

  if (!updated) {
    return NextResponse.json({ message: "Không tìm thấy người dùng." }, { status: 404 });
  }

  return NextResponse.json({ user: serializeUser(updated) });
}
