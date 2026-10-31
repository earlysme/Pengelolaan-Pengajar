import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import { requireKoordinator } from "@/lib/auth";

// GET: Mengambil semua data pengajar dengan pencarian & filter
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const mapel = searchParams.get("mapel") || "";

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { nama: { $regex: search, $options: "i" } },
        { nomorTelepon: { $regex: search, $options: "i" } },
        { mataPelajaran: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "Semua") {
      query.status = status;
    }

    if (mapel && mapel !== "Semua") {
      query.mataPelajaran = mapel;
    }

    const data = await Pengajar.find(query).sort({ createdAt: -1 });

    // Hitung ringkasan status untuk kartu dashboard
    const total = await Pengajar.countDocuments();
    const aktif = await Pengajar.countDocuments({ status: "Aktif" });
    const cuti = await Pengajar.countDocuments({ status: "Cuti" });
    const nonaktif = await Pengajar.countDocuments({ status: "Nonaktif" });

    return NextResponse.json({
      success: true,
      stats: { total, aktif, cuti, nonaktif },
      data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Menambahkan data pengajar baru
export async function POST(request: Request) {
  try {
    if (!(await requireKoordinator())) {
      return NextResponse.json({ success: false, error: "Akses khusus koordinator." }, { status: 401 });
    }
    await connectDB();
    const body = await request.json();
    // Field autentikasi tidak boleh di-set lewat API ini
    delete body.passwordHash;
    delete body.aktivasiTokenHash;
    delete body.aktivasiKadaluarsa;
    delete body.akunDiaktifkanPada;

    if (!body.nama || !body.nomorTelepon) {
      return NextResponse.json(
        { success: false, error: "Nama dan nomor telepon wajib diisi." },
        { status: 400 }
      );
    }

    if (!body.jadwalTersedia) {
      body.jadwalTersedia = [];
    }

    const pengajarBaru = await Pengajar.create(body);
    return NextResponse.json({ success: true, data: pengajarBaru }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan validasi";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
