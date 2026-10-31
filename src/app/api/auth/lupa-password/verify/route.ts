import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import { hashPassword, hashToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tutorId = typeof body?.tutorId === "string" ? body.tutorId : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!tutorId || !otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Lengkapi data verifikasi dan 6 digit kode OTP." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password baru minimal 8 karakter." },
        { status: 400 }
      );
    }

    await connectDB();
    const tutor = await Pengajar.findById(tutorId).select("+otpCodeHash +otpKadaluarsa");
    if (!tutor) {
      return NextResponse.json({ success: false, error: "Data tutor tidak ditemukan." }, { status: 404 });
    }

    if (!tutor.otpCodeHash || !tutor.otpKadaluarsa) {
      return NextResponse.json(
        { success: false, error: "Belum ada permintaan OTP atau kode sudah kedaluwarsa. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(tutor.otpKadaluarsa)) {
      return NextResponse.json(
        { success: false, error: "Kode OTP sudah kedaluwarsa (lebih dari 10 menit). Minta kode baru." },
        { status: 400 }
      );
    }

    const inputHash = hashToken(otp);
    if (inputHash !== tutor.otpCodeHash) {
      return NextResponse.json({ success: false, error: "Kode OTP salah. Periksa kembali kode Anda." }, { status: 400 });
    }

    // Perbarui password
    tutor.passwordHash = hashPassword(password);
    tutor.otpCodeHash = undefined;
    tutor.otpKadaluarsa = undefined;
    if (!tutor.akunDiaktifkanPada) {
      tutor.akunDiaktifkanPada = new Date();
    }
    await tutor.save();

    return NextResponse.json({
      success: true,
      message: "Password Anda berhasil diperbarui. Silakan login dengan password baru.",
    });
  } catch (error) {
    console.error("Error verify lupa password OTP:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

