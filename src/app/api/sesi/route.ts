import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sesi from "@/models/Sesi";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const pengajarId = searchParams.get("pengajarId");
    const statusVerifikasi = searchParams.get("statusVerifikasi");

    const query: Record<string, unknown> = {};
    if (pengajarId) query.pengajarId = pengajarId;
    if (statusVerifikasi && statusVerifikasi !== "Semua") {
      query.statusVerifikasi = statusVerifikasi;
    }

    const data = await Sesi.find(query).sort({ tanggal: -1, waktuMulai: -1 });

    // Statistik untuk verifikasi & honor
    const totalSesi = await Sesi.countDocuments(query);
    const terverifikasi = await Sesi.countDocuments({
      ...query,
      statusVerifikasi: "Terverifikasi",
    });
    const menunggu = await Sesi.countDocuments({
      ...query,
      statusVerifikasi: "Menunggu Verifikasi",
    });
    const perluRevisi = await Sesi.countDocuments({
      ...query,
      statusVerifikasi: "Perlu Revisi",
    });

    // Total honor sesi yang sudah terverifikasi
    const verifiedSessions = await Sesi.find({
      ...query,
      statusVerifikasi: "Terverifikasi",
    });
    const totalHonor = verifiedSessions.reduce(
      (sum, s) => sum + (s.honorPerSesi || 150000),
      0
    );
    const totalJam = verifiedSessions.reduce(
      (sum, s) => sum + (s.durasiJam || 2),
      0
    );

    return NextResponse.json({
      success: true,
      data,
      stats: {
        totalSesi,
        terverifikasi,
        menunggu,
        perluRevisi,
        totalHonor,
        totalJam,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const sesiBaru = await Sesi.create({
      ...body,
      statusVerifikasi: "Menunggu Verifikasi",
    });

    return NextResponse.json({ success: true, data: sesiBaru }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, statusVerifikasi, catatanVerifikasi, honorPerSesi } = body;

    const updated = await Sesi.findByIdAndUpdate(
      id,
      {
        ...(statusVerifikasi && { statusVerifikasi }),
        ...(catatanVerifikasi !== undefined && { catatanVerifikasi }),
        ...(honorPerSesi && { honorPerSesi }),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Data sesi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

