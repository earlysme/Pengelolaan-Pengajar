import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CatatanMateri from "@/models/CatatanMateri";

// DELETE -> hapus catatan (penulisnya sendiri atau koordinator)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Belum login." }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const catatan = await CatatanMateri.findById(id);
  if (!catatan) {
    return NextResponse.json({ success: false, error: "Catatan tidak ditemukan." }, { status: 404 });
  }

  const penulis = String(catatan.tutorId) === String(session.sub);
  if (!penulis && session.role !== "koordinator") {
    return NextResponse.json({ success: false, error: "Tidak punya akses." }, { status: 403 });
  }

  await catatan.deleteOne();
  return NextResponse.json({ success: true });
}
