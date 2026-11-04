
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MataPelajaran from "@/models/MataPelajaran";
import { getSession } from "@/lib/auth";

const DEFAULT_MAPEL = [
  "Matematika",
  "Fisika",
  "Kimia",
  "Biologi",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Ekonomi",
  "Geografi",
  "Sosiologi",
  "Sejarah",
  "TPS",
];

// GET: Ambil semua mata pelajaran
export async function GET() {
  try {
    await connectDB();
    let data = await MataPelajaran.find({ aktif: true }).sort({ nama: 1 }).lean();

    // Auto-seed default mapel jika database masih kosong
    if (data.length === 0) {
      const docs = DEFAULT_MAPEL.map((nama) => ({ nama, aktif: true }));
      try {
        await MataPelajaran.insertMany(docs, { ordered: false });
      } catch {
        // Abaikan duplicate error saat concurrent insert
      }
      data = await MataPelajaran.find({ aktif: true }).sort({ nama: 1 }).lean();
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat mata pelajaran";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST: Tambah mata pelajaran baru (hanya koordinator)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "koordinator") {
      return NextResponse.json({ success: false, error: "Akses khusus koordinator" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const nama = (body.nama || "").trim();

    if (!nama) {
      return NextResponse.json({ success: false, error: "Nama mata pelajaran wajib diisi" }, { status: 400 });
    }

    // Cek apakah sudah ada (case-insensitive)
    const exists = await MataPelajaran.findOne({
      nama: { $regex: new RegExp(`^${nama}$`, "i") },
    });

    if (exists) {
      if (!exists.aktif) {
        exists.aktif = true;
        await exists.save();
        return NextResponse.json({ success: true, data: exists, message: "Mata pelajaran diaktifkan kembali" });
      }
      return NextResponse.json(
        { success: false, error: `Mata pelajaran "${nama}" sudah terdaftar` },
        { status: 400 }
      );
    }

    const created = await MataPelajaran.create({
      nama,
      deskripsi: body.deskripsi?.trim() || undefined,
      aktif: true,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambahkan mata pelajaran";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
