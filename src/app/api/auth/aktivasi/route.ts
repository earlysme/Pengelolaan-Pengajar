import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import {
  EMAIL_REGEX,
  hashPassword,
  hashToken,
  setSessionCookie,
  getSessionCookieOptions,
  SESSION_COOKIE,
  validatePasswordBaru,
} from "@/lib/auth";

async function cariByToken(token: string) {
  if (!token || token.length < 20) return null;
  const tutor = await Pengajar.findOne({
    aktivasiTokenHash: hashToken(token),
    aktivasiKadaluarsa: { $gt: new Date() },
  }).select("+aktivasiTokenHash +aktivasiKadaluarsa +passwordHash");
  return tutor;
}

// GET ?token=... : cek apakah link undangan masih valid (dipakai halaman /aktivasi)
export async function GET(request: Request) {
  try {
    await connectDB();
    const token = new URL(request.url).searchParams.get("token") || "";
    const tutor = await cariByToken(token);
    if (!tutor) {
      return NextResponse.json(
        { success: false, error: "Link tidak valid atau sudah kedaluwarsa. Minta koordinator mengirim ulang undangan." },
        { status: 400 }
      );
    }
    const isReset = Boolean(tutor.statusResetPassword || (tutor.akunDiaktifkanPada && tutor.passwordHash));
    return NextResponse.json({
      success: true,
      data: {
        nama: tutor.nama,
        email: tutor.email || "",
        sudahPunyaPassword: !!tutor.passwordHash,
        isResetPassword: isReset,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// POST : tutor mengisi email + password baru memakai token undangan (sekali pakai)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const token = String(body?.token ?? "");
    let email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    const pesanPassword = validatePasswordBaru(password);
    if (pesanPassword) {
      return NextResponse.json({ success: false, error: pesanPassword }, { status: 400 });
    }

    const tutor = await cariByToken(token);
    if (!tutor) {
      return NextResponse.json(
        { success: false, error: "Link tidak valid atau sudah kedaluwarsa. Minta koordinator mengirim ulang undangan." },
        { status: 400 }
      );
    }

    const isReset = Boolean(tutor.statusResetPassword || (tutor.akunDiaktifkanPada && tutor.passwordHash));

    if (isReset && tutor.email) {
      email = tutor.email.toLowerCase();
    } else {
      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json({ success: false, error: "Format email tidak valid." }, { status: 400 });
      }
      const dipakai = await Pengajar.exists({ email, _id: { $ne: tutor._id } });
      if (dipakai) {
        return NextResponse.json({ success: false, error: "Email sudah dipakai akun lain." }, { status: 409 });
      }
      tutor.email = email;
    }

    tutor.passwordHash = hashPassword(password);
    tutor.statusResetPassword = false;
    tutor.akunDiaktifkanPada = tutor.akunDiaktifkanPada || new Date();
    tutor.aktivasiTokenHash = undefined; // token hangus setelah dipakai
    tutor.aktivasiKadaluarsa = undefined;
    tutor.aktivasiLink = undefined;
    tutor.aktivasiWaUrl = undefined;
    await tutor.save();

    const tokenSession = await setSessionCookie({ role: "tutor", sub: String(tutor._id), nama: tutor.nama });
    const res = NextResponse.json({
      success: true,
      data: { id: String(tutor._id), nama: tutor.nama, role: "tutor", token: tokenSession },
    });
    res.cookies.set(SESSION_COOKIE, tokenSession, getSessionCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
