
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MasterSesi, {
  DEFAULT_SESI_SENIN_KAMIS,
  DEFAULT_SESI_JUMAT,
  DEFAULT_SESI_SABTU,
} from "@/models/MasterSesi";
import { getSession } from "@/lib/auth";

// GET: Ambil semua master slot sesi
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const hari = searchParams.get("hari");

    let query: Record<string, unknown> = { aktif: true };
    if (hari && hari !== "Semua") {
      query = { aktif: true, hari: hari };
    }

    let data = await MasterSesi.find(query).sort({ urutan: 1, jamMulai: 1 }).lean();

    // Auto-seed default sesi jika database masih kosong
    if (data.length === 0 && (!hari || hari === "Semua")) {
      try {
        await MasterSesi.insertMany(
          [...DEFAULT_SESI_SENIN_KAMIS, ...DEFAULT_SESI_JUMAT, ...DEFAULT_SESI_SABTU],
          { ordered: false }
        );
      } catch {
        // Abaikan duplicate
      }
      data = await MasterSesi.find(query).sort({ urutan: 1, jamMulai: 1 }).lean();
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat master sesi";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST: Tambah slot sesi baru (khusus koordinator)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "koordinator") {
      return NextResponse.json({ success: false, error: "Akses khusus koordinator" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const nama = (body.nama || "").trim();
    const jamMulai = (body.jamMulai || "").trim();
    const jamSelesai = (body.jamSelesai || "").trim();
    const hari = Array.isArray(body.hari) && body.hari.length > 0
      ? body.hari
      : ["Senin", "Selasa", "Rabu", "Kamis"];
    const hariGroup = body.hariGroup?.trim() || "Senin - Kamis";
    const waktuLabel = body.waktuLabel?.trim() || `${jamMulai} - ${jamSelesai}`;
    const durasiMenit = Number(body.durasiMenit) || 75;
    const urutan = Number(body.urutan) || 1;

    if (!nama || !jamMulai || !jamSelesai) {
      return NextResponse.json(
        { success: false, error: "Nama sesi, jam mulai, dan jam selesai wajib diisi" },
        { status: 400 }
      );
    }

    const created = await MasterSesi.create({
      nama,
      hariGroup,
      hari,
      jamMulai,
      jamSelesai,
      waktuLabel,
      durasiMenit,
      urutan,
      aktif: true,
    });

    return NextResponse.json(
      { success: true, data: created, message: `Slot ${nama} berhasil ditambahkan` },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambahkan slot sesi";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

