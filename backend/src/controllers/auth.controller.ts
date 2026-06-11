import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { signSession } from "../services/token.service.js";
import { serializeUser } from "../utils/serializers.js";

const cookieName = "parking_session";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8 * 1000,
    path: "/",
  };
}

export async function register(request: Request, response: Response) {
  const body = z
    .object({
      name: z.string().min(2),
      email: z.email(),
      password: z.string().min(6),
    })
    .parse(request.body);

  const email = body.email.toLowerCase();
  const existed = await User.findOne({ email });
  if (existed) {
    response.status(409).json({ message: "Email đã tồn tại." });
    return;
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await User.create({
    name: body.name,
    email,
    passwordHash,
    role: "customer",
  });
  const serialized = serializeUser(user);
  const token = await signSession(serialized);

  response.cookie(cookieName, token, cookieOptions()).status(201).json({ user: serialized });
}

export async function login(request: Request, response: Response) {
  const body = z
    .object({
      email: z.email(),
      password: z.string().min(1),
    })
    .parse(request.body);

  const user = await User.findOne({ email: body.email.toLowerCase() });
  if (!user || user.status === "Đã khóa") {
    response.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    return;
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    response.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    return;
  }

  const serialized = serializeUser(user);
  const token = await signSession(serialized);

  response.cookie(cookieName, token, cookieOptions()).json({ user: serialized });
}

export function logout(_request: Request, response: Response) {
  response.clearCookie(cookieName, { path: "/" }).json({ ok: true });
}

export function me(request: Request, response: Response) {
  response.json({ user: request.user ?? null });
}
