import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import {
  bersihkanEnv,
  setSessionCookie,
  getSessionCookieOptions,
  SESSION_COOKIE,
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
    const isDev = process.env.NODE_ENV !== "production";
    // Nilai env sering diketik lengkap dengan tanda kutip di dashboard hosting — bersihkan dulu.
    const adminUser = (bersihkanEnv(process.env.ADMIN_USERNAME) || (isDev ? "admin" : "")).toLowerCase();
    const adminPass = bersihkanEnv(process.env.ADMIN_PASSWORD) || (isDev ? "admin123" : "");

    // Di production TIDAK ADA kredensial bawaan. Kalau env belum diisi, login koordinator
    // mustahil berhasil — laporkan sebagai masalah konfigurasi, bukan "password salah".
    if (!adminUser || !adminPass) {
      console.error(
        "[login] ADMIN_USERNAME/ADMIN_PASSWORD belum diset di environment ini; login koordinator tidak dapat dipakai."
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Login koordinator belum dikonfigurasi di server (ADMIN_USERNAME/ADMIN_PASSWORD kosong). Hubungi pengelola sistem.",
        },
        { status: 503 }
      );
    }

    const isKoordinator = samaAman(identitas, adminUser) && samaAman(password, adminPass);

    if (isKoordinator) {
      resetGagal(kunci);
      const token = await setSessionCookie({ role: "koordinator", nama: "Koordinator Bimbel" });
      const res = NextResponse.json({
        success: true,
        data: { role: "koordinator", nama: "Koordinator Bimbel", token },
      });
      res.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
      return res;
    }

    // 2. Cek kredensial Tutor (MongoDB berdasarkan email atau nomor telepon)
    await connectDB();
    const cleanIdentitas = identitas.trim().toLowerCase();
    const cleanDigits = cleanIdentitas.replace(/\D/g, "");

    const tutor = await Pengajar.findOne({
      $or: [
        { email: cleanIdentitas },
        ...(cleanDigits.length >= 8 ? [{ nomorTelepon: cleanDigits }, { nomorTelepon: cleanIdentitas }] : []),
      ],
    }).select("+passwordHash +statusResetPassword");

    if (tutor) {
      if (tutor.status === "Nonaktif") {
        return NextResponse.json(
          { success: false, error: "Akun ini dinonaktifkan. Hubungi koordinator." },
          { status: 403 }
        );
      }

      // Jika koordinator telah me-reset password tutor
      if (tutor.statusResetPassword) {
        return NextResponse.json(
          {
            success: false,
            isReset: true,
            error: "Akses login akun Anda telah di-reset oleh koordinator. Password lama Anda sudah tidak berlaku lagi. Silakan buka tautan pemulihan/undangan yang dikirimkan oleh koordinator via WhatsApp untuk membuat password baru akun Anda.",
          },
          { status: 403 }
        );
      }

      // Jika akun baru dan belum pernah aktivasi sama sekali
      if (!tutor.passwordHash && !tutor.akunDiaktifkanPada) {
        return NextResponse.json(
          {
            success: false,
            isBelumAktivasi: true,
            error: "Akun Anda belum diaktivasi. Silakan buka tautan undangan yang dikirimkan koordinator via WhatsApp untuk membuat password pertama kali.",
          },
          { status: 403 }
        );
      }

      const okTutor = verifyPassword(password, tutor?.passwordHash);
      if (okTutor) {
        if (!tutor.akunDiaktifkanPada) {
          tutor.akunDiaktifkanPada = new Date();
          await tutor.save();
        }

        resetGagal(kunci);
        const token = await setSessionCookie({ role: "tutor", sub: String(tutor._id), nama: tutor.nama });
        const res = NextResponse.json({
          success: true,
          data: { role: "tutor", id: String(tutor._id), nama: tutor.nama, token },
        });
        res.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
        return res;
      }
    }

    // 3. Email terdaftar tapi password belum pernah dibuat (tutor lama / hasil seed).
    // Tanpa pesan khusus, pengguna selalu mengira "password salah" padahal akun belum aktif.
    if (tutor && !tutor.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Akun ini belum memiliki password. Minta koordinator mengirim link undangan/aktivasi, lalu atur password Anda.",
          kode: "BELUM_PUNYA_PASSWORD",
        },
        { status: 403 }
      );
    }

    // 4. Jika gagal
    catatGagal(kunci);
    return NextResponse.json({ success: false, error: PESAN_SALAH }, { status: 401 });
  } catch (error) {
    // Jangan telan error: tanpa log, kegagalan koneksi DB atau SESSION_SECRET yang hilang
    // muncul di UI hanya sebagai "terjadi kesalahan server" tanpa jejak penyebab.
    console.error("[login] gagal memproses login:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}