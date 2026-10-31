import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import { hashToken, nomorWaInternasional } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identitas = typeof body?.identitas === "string" ? body.identitas.trim() : "";
    const channel = body?.channel === "email" ? "email" : "whatsapp";

    if (!identitas) {
      return NextResponse.json(
        { success: false, error: "Masukkan email atau nomor WhatsApp terdaftar Anda." },
        { status: 400 }
      );
    }

    await connectDB();

    // Normalisasi pencarian: bisa via email atau nomor telepon
    const digitTelp = identitas.replace(/\D/g, "");
    const emailLower = identitas.toLowerCase();

    const tutor = await Pengajar.findOne({
      $or: [
        { email: emailLower },
        { nomorTelepon: identitas },
        ...(digitTelp.length >= 8 ? [{ nomorTelepon: { $regex: digitTelp.slice(-8) } }] : []),
      ],
    });

    if (!tutor) {
      return NextResponse.json(
        { success: false, error: "Data tutor dengan email atau nomor WhatsApp tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    if (tutor.status === "Nonaktif") {
      return NextResponse.json(
        { success: false, error: "Akun ini dinonaktifkan. Hubungi koordinator bimbel Anda." },
        { status: 403 }
      );
    }

    if (channel === "email" && !tutor.email) {
      return NextResponse.json(
        { success: false, error: "Akun ini belum memiliki email terdaftar. Gunakan WhatsApp untuk menerima OTP." },
        { status: 400 }
      );
    }

    // Generate 6 digit angka OTP acak
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKadaluarsa = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    tutor.otpCodeHash = hashToken(otp);
    tutor.otpKadaluarsa = otpKadaluarsa;
    await tutor.save();

    const pesanWa =
      `*Pemulihan Password Gen Plasma*\n\n` +
      `Halo ${tutor.nama},\n` +
      `Kode OTP pemulihan kata sandi Anda adalah: *${otp}*\n\n` +
      `Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.`;

    const waUrl = `https://wa.me/${nomorWaInternasional(tutor.nomorTelepon)}?text=${encodeURIComponent(pesanWa)}`;

    return NextResponse.json({
      success: true,
      tutorId: tutor._id,
      nama: tutor.nama,
      targetWa: tutor.nomorTelepon,
      targetEmail: tutor.email,
      channel,
      waUrl,
      devOtp: otp,
      message: `Kode OTP berhasil dibuat untuk ${channel === "whatsapp" ? "WhatsApp" : "Email"}.`,
    });
  } catch (error) {
    console.error("Error lupa password send OTP:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

