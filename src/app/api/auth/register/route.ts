import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { attachSessionCookie } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { serializeUser } from "@/lib/serializers";
import { User } from "@/models/User";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  await connectDb();
  const body = registerSchema.parse(await request.json());
  const email = body.email.toLowerCase();

  const existed = await User.findOne({ email });
  if (existed) {
    return NextResponse.json({ message: "Email đã tồn tại." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await User.create({
    name: body.name,
    email,
    passwordHash,
    role: "customer",
  });

  const response = NextResponse.json({ user: serializeUser(user) }, { status: 201 });
  await attachSessionCookie(response, serializeUser(user));
  return response;
}
