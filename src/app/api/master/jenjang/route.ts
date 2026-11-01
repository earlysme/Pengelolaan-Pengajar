import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Jenjang from "@/models/Jenjang";
import { getSession } from "@/lib/auth";

const DEFAULT_JENJANG = ["SD", "SMP", "SMA", "UTBK/Kedinasan"];

// GET: Ambil semua jenjang
export async function GET() {
  try {
    await connectDB();
    let data = await Jenjang.find({ aktif: true }).sort({ createdAt: 1 }).lean();

    // Auto-seed default jenjang jika database masih kosong
    if (data.length === 0) {
      const docs = DEFAULT_JENJANG.map((nama) => ({ nama, aktif: true }));
      try {
        await Jenjang.insertMany(docs, { ordered: false });
      } catch {
        // Abaikan duplicate error
      }
      data = await Jenjang.find({ aktif: true }).sort({ createdAt: 1 }).lean();
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat jenjang";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST: Tambah jenjang baru
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
      return NextResponse.json({ success: false, error: "Nama jenjang wajib diisi" }, { status: 400 });
    }

    // Cek apakah sudah ada (case-insensitive)
    const exists = await Jenjang.findOne({
      nama: { $regex: new RegExp(`^${nama}$`, "i") },
    });

    if (exists) {
      if (!exists.aktif) {
        exists.aktif = true;
        await exists.save();
        return NextResponse.json({ success: true, data: exists, message: "Jenjang diaktifkan kembali" });
      }
      return NextResponse.json(
        { success: false, error: `Jenjang "${nama}" sudah terdaftar` },
        { status: 400 }
      );
    }

    const created = await Jenjang.create({
      nama,
      deskripsi: body.deskripsi?.trim() || undefined,
      aktif: true,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambahkan jenjang";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
