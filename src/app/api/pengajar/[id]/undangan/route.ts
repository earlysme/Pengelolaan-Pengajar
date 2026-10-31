import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import {
  AKTIVASI_BERLAKU_MS,
  generateAktivasiToken,
  nomorWaInternasional,
  requireKoordinator,
} from "@/lib/auth";

// POST: koordinator membuat link undangan aktivasi akun untuk satu tutor.
// Token lama otomatis tidak berlaku lagi. Token asli hanya dikembalikan di respons ini,
// di database hanya tersimpan hash-nya.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireKoordinator())) {
      return NextResponse.json({ success: false, error: "Akses khusus koordinator." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const tutor = await Pengajar.findById(id);
    if (!tutor) {
      return NextResponse.json({ success: false, error: "Pengajar tidak ditemukan" }, { status: 404 });
    }

    const { token, tokenHash } = generateAktivasiToken();
    await Pengajar.updateOne(
      { _id: tutor._id },
      { $set: { aktivasiTokenHash: tokenHash, aktivasiKadaluarsa: new Date(Date.now() + AKTIVASI_BERLAKU_MS) } }
    );

    const origin = new URL(request.url).origin;
    const link = `${origin}/aktivasi?token=${token}`;
    const pesan =
      `Halo ${tutor.nama}, akun tutor Lentera Belajar Anda sudah dibuat.\n\n` +
      `Silakan atur email dan password Anda lewat link berikut (berlaku 72 jam, hanya untuk Anda):\n${link}`;

    return NextResponse.json({
      success: true,
      data: {
        link,
        waUrl: `https://wa.me/${nomorWaInternasional(tutor.nomorTelepon)}?text=${encodeURIComponent(pesan)}`,
        berlakuHingga: new Date(Date.now() + AKTIVASI_BERLAKU_MS).toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Gagal membuat undangan." }, { status: 500 });
  }
}
