import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import {
  EMAIL_REGEX,
  hashPassword,
  hashToken,
  setSessionCookie,
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
    return NextResponse.json({
      success: true,
      data: { nama: tutor.nama, email: tutor.email || "", sudahPunyaPassword: !!tutor.passwordHash },
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
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: "Format email tidak valid." }, { status: 400 });
    }
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

    const dipakai = await Pengajar.exists({ email, _id: { $ne: tutor._id } });
    if (dipakai) {
      return NextResponse.json({ success: false, error: "Email sudah dipakai akun lain." }, { status: 409 });
    }

    tutor.email = email;
    tutor.passwordHash = hashPassword(password);
    tutor.akunDiaktifkanPada = new Date();
    tutor.aktivasiTokenHash = undefined; // token hangus setelah dipakai
    tutor.aktivasiKadaluarsa = undefined;
    await tutor.save();

    await setSessionCookie({ role: "tutor", sub: String(tutor._id), nama: tutor.nama });
    return NextResponse.json({ success: true, data: { id: String(tutor._id), nama: tutor.nama } });
  } catch {
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
