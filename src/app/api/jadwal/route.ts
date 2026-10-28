import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Jadwal from "@/models/Jadwal";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const pengajarId = searchParams.get("pengajarId");
    const hari = searchParams.get("hari");

    const query: Record<string, unknown> = {};
    if (pengajarId) query.pengajarId = pengajarId;
    if (hari && hari !== "Semua") query.hari = hari;

    const data = await Jadwal.find(query).sort({ hari: 1, jamMulai: 1 });
    return NextResponse.json({ success: true, data });
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

    // Deteksi bentrok sederhana untuk pengajar yang sama di hari & jam yang sama
    const bentrok = await Jadwal.findOne({
      pengajarId: body.pengajarId,
      hari: body.hari,
      jamMulai: body.jamMulai,
    });

    if (bentrok) {
      return NextResponse.json(
        {
          success: false,
          error: `Pengajar sudah memiliki jadwal di kelas ${bentrok.namaKelas} pada hari ${body.hari} pukul ${body.jamMulai}.`,
        },
        { status: 400 }
      );
    }

    const jadwalBaru = await Jadwal.create(body);
    return NextResponse.json({ success: true, data: jadwalBaru }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID Jadwal diperlukan" },
        { status: 400 }
      );
    }
    await Jadwal.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Jadwal berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

