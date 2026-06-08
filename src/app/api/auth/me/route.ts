import { readSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await readSession();
  return NextResponse.json({ user });
}
