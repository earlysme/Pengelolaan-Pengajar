import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ketersediaan from "@/models/Ketersediaan";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const pengajarId = searchParams.get("pengajarId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (pengajarId) query.pengajarId = pengajarId;
    if (status && status !== "Semua") query.statusKonfirmasi = status;

    const data = await Ketersediaan.find(query).sort({ updatedAt: -1 });

    const total = await Ketersediaan.countDocuments();
    const terkonfirmasi = await Ketersediaan.countDocuments({
      statusKonfirmasi: "Terkonfirmasi",
    });
    const menunggu = await Ketersediaan.countDocuments({
      statusKonfirmasi: "Menunggu Pemeriksaan",
    });
    const perluUpdate = await Ketersediaan.countDocuments({
      statusKonfirmasi: "Perlu Diperbarui",
    });

    return NextResponse.json({
      success: true,
      data,
      stats: { total, terkonfirmasi, menunggu, perluUpdate },
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

    // Cek apakah sudah pernah ada ketersediaan untuk pengajar ini pada periode yang sama
    const existing = await Ketersediaan.findOne({
      pengajarId: body.pengajarId,
      periode: body.periode || "Periode Berjalan 2026/2027",
    });

    if (existing) {
      existing.slots = body.slots;
      existing.statusKonfirmasi = body.statusKonfirmasi || "Menunggu Pemeriksaan";
      if (body.catatanKoordinator) existing.catatanKoordinator = body.catatanKoordinator;
      existing.tanggalKonfirmasi = new Date();
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    const baru = await Ketersediaan.create({
      ...body,
      tanggalKonfirmasi: new Date(),
    });

    return NextResponse.json({ success: true, data: baru }, { status: 201 });
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
    const { id, statusKonfirmasi, catatanKoordinator } = body;

    const updated = await Ketersediaan.findByIdAndUpdate(
      id,
      {
        ...(statusKonfirmasi && { statusKonfirmasi }),
        ...(catatanKoordinator !== undefined && { catatanKoordinator }),
        tanggalKonfirmasi: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Data ketersediaan tidak ditemukan" },
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

