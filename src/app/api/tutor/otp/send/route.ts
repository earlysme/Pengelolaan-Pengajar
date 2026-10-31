import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import { getSession, hashToken, nomorWaInternasional } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "tutor" || !session.sub) {
      return NextResponse.json({ success: false, error: "Akses tidak sah." }, { status: 401 });
    }

    const body = await request.json();
    const channel = body?.channel === "email" ? "email" : "whatsapp";

    await connectDB();
    const tutor = await Pengajar.findById(session.sub);
    if (!tutor) {
      return NextResponse.json({ success: false, error: "Akun tutor tidak ditemukan." }, { status: 404 });
    }

    if (channel === "email" && !tutor.email) {
      return NextResponse.json(
        { success: false, error: "Alamat email belum terdaftar di profil Anda." },
        { status: 400 }
      );
    }

    // Generate 6 digit angka OTP acak
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKadaluarsa = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    tutor.otpCodeHash = hashToken(otp);
    tutor.otpKadaluarsa = otpKadaluarsa;
    await tutor.save();

    const targetFormatted =
      channel === "whatsapp"
        ? tutor.nomorTelepon
        : tutor.email || "email Anda";

    const pesanWa =
      `*Kode OTP Gen Plasma*\n\n` +
      `Kode verifikasi Anda untuk mengubah password adalah: *${otp}*\n\n` +
      `Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.`;

    const waUrl = `https://wa.me/${nomorWaInternasional(tutor.nomorTelepon)}?text=${encodeURIComponent(
      pesanWa
    )}`;

    return NextResponse.json({
      success: true,
      channel,
      target: targetFormatted,
      waUrl,
      // devOtp disediakan agar di masa development/demo tetap bisa dicoba tanpa gateway berbayar
      devOtp: otp,
      message: `Kode OTP verifikasi berhasil dibuat untuk ${channel === "whatsapp" ? "WhatsApp" : "Email"}.`,
    });
  } catch (error) {
    console.error("Error kirim OTP:", error);
    return NextResponse.json({ success: false, error: "Gagal mengirim kode OTP." }, { status: 500 });
  }
}

