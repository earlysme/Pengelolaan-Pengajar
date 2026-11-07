import { NextResponse } from "next/server";
import { clearSessionCookie, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  const res = NextResponse.json({ success: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
