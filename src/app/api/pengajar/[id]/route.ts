import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";

// GET: Mengambil detail satu pengajar
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const pengajar = await Pengajar.findById(id);

    if (!pengajar) {
      return NextResponse.json(
        { success: false, error: "Pengajar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: pengajar });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Memperbarui data pengajar
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const pengajar = await Pengajar.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!pengajar) {
      return NextResponse.json(
        { success: false, error: "Pengajar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: pengajar });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui data";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// DELETE: Menghapus data pengajar
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const pengajar = await Pengajar.findByIdAndDelete(id);

    if (!pengajar) {
      return NextResponse.json(
        { success: false, error: "Pengajar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data pengajar berhasil dihapus",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

