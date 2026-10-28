import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";

export async function POST() {
  try {
    await connectDB();
    const count = await Pengajar.countDocuments();

    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: `Database sudah memiliki ${count} data pengajar.`,
      });
    }

    const dummyPengajar = [
      {
        nama: "Rizky Firmansyah, S.Pd.",
        nomorTelepon: "081234567890",
        email: "rizky.f@gmail.com",
        alamat: "Jl. Margonda Raya No. 45, Depok",
        status: "Aktif",
        mataPelajaran: ["Matematika", "Fisika"],
        jenjang: ["SMA", "UTBK/Kedinasan"],
        jenisKelas: ["Reguler", "Privat"],
        dokumenStatus: "Lengkap",
        catatanInternal: "Sangat komunikatif, tutor unggulan persiapan UTBK SNBT.",
      },
      {
        nama: "Siti Rahmawati, M.Si.",
        nomorTelepon: "082198765432",
        email: "siti.rahma@gmail.com",
        alamat: "Jl. Tebet Barat Dalam No. 12, Jakarta Selatan",
        status: "Aktif",
        mataPelajaran: ["Kimia", "Biologi"],
        jenjang: ["SMP", "SMA"],
        jenisKelas: ["Reguler", "Semi-Privat"],
        dokumenStatus: "Lengkap",
        catatanInternal: "Fokus persiapan olimpiade & kelas intensif IPA.",
      },
      {
        nama: "Dimas Prasetyo, S.S.",
        nomorTelepon: "085712349988",
        email: "dimas.prasetyo@gmail.com",
        alamat: "Jl. Salemba Tengah No. 8, Jakarta Pusat",
        status: "Cuti",
        mataPelajaran: ["Bahasa Inggris"],
        jenjang: ["SD", "SMP", "SMA"],
        jenisKelas: ["Privat", "Online"],
        dokumenStatus: "Lengkap",
        catatanInternal: "Sedang cuti studi lanjut s/d bulan depan.",
      },
      {
        nama: "Aulia Nurul Hidayah, S.Pd.",
        nomorTelepon: "081377889900",
        email: "aulia.nurul@gmail.com",
        alamat: "Jl. Veteran No. 20, Bogor",
        status: "Aktif",
        mataPelajaran: ["Bahasa Indonesia", "Matematika"],
        jenjang: ["SD", "SMP"],
        jenisKelas: ["Reguler", "Privat"],
        dokumenStatus: "Lengkap",
        catatanInternal: "Sabar dalam membimbing siswa jenjang SD dan SMP awal.",
      },
    ];

    await Pengajar.insertMany(dummyPengajar);

    return NextResponse.json({
      success: true,
      message: "4 data contoh pengajar berhasil ditambahkan!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal seed data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
