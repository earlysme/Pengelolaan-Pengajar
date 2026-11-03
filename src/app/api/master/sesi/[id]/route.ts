import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MasterSesi from "@/models/MasterSesi";
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
    const deleted = await MasterSesi.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Slot sesi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Slot sesi berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus slot sesi";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

