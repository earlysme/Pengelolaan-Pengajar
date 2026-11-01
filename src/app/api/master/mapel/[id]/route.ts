import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MataPelajaran from "@/models/MataPelajaran";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (session?.role !== "koordinator") {
      return NextResponse.json({ success: false, error: "Akses khusus koordinator" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const deleted = await MataPelajaran.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Mata pelajaran berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus mata pelajaran";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
