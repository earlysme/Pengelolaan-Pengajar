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

const PESAN_SALAH = "Email/Username atau password salah.";

function samaAman(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// POST: login terpadu (email atau username + password)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";
    const identitas = String(body?.identitas ?? body?.email ?? body?.username ?? "")
      .trim()
      .toLowerCase();

    if (!identitas || !password) {
      return NextResponse.json({ success: false, error: "Lengkapi data login." }, { status: 400 });
    }

    const kunci = `login:${identitas}`;
    if (terlaluBanyakGagal(kunci)) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." },
        { status: 429 }
      );
    }

    // 1. Cek kredensial Koordinator (Admin)
    const adminUser = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";

    const isKoordinator =
      !!adminUser && !!adminPass && samaAman(identitas, adminUser) && samaAman(password, adminPass);

    if (isKoordinator) {
      resetGagal(kunci);
      await setSessionCookie({ role: "koordinator", nama: "Koordinator Bimbel" });
      return NextResponse.json({
        success: true,
        data: { role: "koordinator", nama: "Koordinator Bimbel" },
      });
    }

    // 2. Cek kredensial Tutor (MongoDB berdasarkan email)
    await connectDB();
    const tutor = await Pengajar.findOne({ email: identitas }).select("+passwordHash");
    const okTutor = verifyPassword(password, tutor?.passwordHash);

    if (tutor && okTutor) {
      if (tutor.status === "Nonaktif") {
        return NextResponse.json(
          { success: false, error: "Akun ini dinonaktifkan. Hubungi koordinator." },
          { status: 403 }
        );
      }

      if (!tutor.akunDiaktifkanPada) {
        tutor.akunDiaktifkanPada = new Date();
        await tutor.save();
      }

      resetGagal(kunci);
      await setSessionCookie({ role: "tutor", sub: String(tutor._id), nama: tutor.nama });
      return NextResponse.json({
        success: true,
        data: { role: "tutor", id: String(tutor._id), nama: tutor.nama },
      });
    }

    // 3. Jika gagal
    catatGagal(kunci);
    return NextResponse.json({ success: false, error: PESAN_SALAH }, { status: 401 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server.";
    console.error("Login API error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
