import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { attachSessionCookie } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { serializeUser } from "@/lib/serializers";
import { User } from "@/models/User";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  await connectDb();
  const body = loginSchema.parse(await request.json());
  const user = await User.findOne({ email: body.email.toLowerCase() });

  if (!user || user.status === "Đã khóa") {
    return NextResponse.json({ message: "Email hoặc mật khẩu không đúng." }, { status: 401 });
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ message: "Email hoặc mật khẩu không đúng." }, { status: 401 });
  }

  const response = NextResponse.json({ user: serializeUser(user) });
  await attachSessionCookie(response, serializeUser(user));
  return response;
}
