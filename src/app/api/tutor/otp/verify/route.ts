import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import { getSession, hashPassword, hashToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "tutor" || !session.sub) {
      return NextResponse.json({ success: false, error: "Akses tidak sah." }, { status: 401 });
    }

    const body = await request.json();
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Masukkan 6 digit kode OTP yang valid." },
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
    const tutor = await Pengajar.findById(session.sub).select("+otpCodeHash +otpKadaluarsa");
    if (!tutor) {
      return NextResponse.json({ success: false, error: "Akun tutor tidak ditemukan." }, { status: 404 });
    }

    if (!tutor.otpCodeHash || !tutor.otpKadaluarsa) {
      return NextResponse.json(
        { success: false, error: "Belum ada permintaan OTP atau kode sudah kedaluwarsa. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    if (new Date() > new Date(tutor.otpKadaluarsa)) {
      return NextResponse.json(
        { success: false, error: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    const inputHash = hashToken(otp);
    if (inputHash !== tutor.otpCodeHash) {
      return NextResponse.json({ success: false, error: "Kode OTP salah. Periksa kembali kode Anda." }, { status: 400 });
    }

    // Update password
    tutor.passwordHash = hashPassword(password);
    tutor.otpCodeHash = undefined;
    tutor.otpKadaluarsa = undefined;
    await tutor.save();

    return NextResponse.json({
      success: true,
      message: "Password Anda berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Error verifikasi OTP ubah password:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

