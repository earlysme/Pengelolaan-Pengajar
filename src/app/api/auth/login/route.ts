import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import {
  setSessionCookie,
  verifyPassword,
  terlaluBanyakGagal,
  catatGagal,
  resetGagal,
} from "@/lib/auth";

const PESAN_SALAH = "Email atau password salah.";

function samaAman(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// POST: login tutor (email + password) atau koordinator (username + password)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body?.role === "koordinator" ? "koordinator" : "tutor";
    const password = typeof body?.password === "string" ? body.password : "";
    const identitas = String(role === "koordinator" ? body?.username ?? "" : body?.email ?? "")
      .trim()
      .toLowerCase();

    if (!identitas || !password) {
      return NextResponse.json({ success: false, error: "Lengkapi data login." }, { status: 400 });
    }

    const kunci = `${role}:${identitas}`;
    if (terlaluBanyakGagal(kunci)) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." },
        { status: 429 }
      );
    }

    if (role === "koordinator") {
      const isDev = process.env.NODE_ENV !== "production";
      const adminUser = (process.env.ADMIN_USERNAME || (isDev ? "admin" : "")).toLowerCase();
      const adminPass = process.env.ADMIN_PASSWORD || (isDev ? "admin123" : "");

      const valid =
        !!adminUser && !!adminPass && samaAman(identitas, adminUser) && samaAman(password, adminPass);

      if (!valid) {
        catatGagal(kunci);
        return NextResponse.json({ success: false, error: "Username atau password salah." }, { status: 401 });
      }

      resetGagal(kunci);
      await setSessionCookie({ role: "koordinator", nama: "Koordinator Bimbel" });
      return NextResponse.json({ success: true, data: { role: "koordinator", nama: "Koordinator Bimbel" } });
    }

    // Tutor
    await connectDB();
    const tutor = await Pengajar.findOne({ email: identitas }).select("+passwordHash");
    const ok = verifyPassword(password, tutor?.passwordHash);

    if (!tutor || !ok) {
      catatGagal(kunci);
      return NextResponse.json({ success: false, error: PESAN_SALAH }, { status: 401 });
    }

    if (tutor.status === "Nonaktif") {
      return NextResponse.json(
        { success: false, error: "Akun ini dinonaktifkan. Hubungi koordinator." },
        { status: 403 }
      );
    }

    resetGagal(kunci);
    await setSessionCookie({ role: "tutor", sub: String(tutor._id), nama: tutor.nama });
    return NextResponse.json({
      success: true,
      data: { role: "tutor", id: String(tutor._id), nama: tutor.nama },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
