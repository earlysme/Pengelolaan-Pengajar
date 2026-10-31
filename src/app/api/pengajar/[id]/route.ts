import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import { getSession } from "@/lib/auth";

// Field yang boleh diubah tutor untuk profilnya sendiri
const FIELD_TUTOR = ["foto", "deskripsi", "pendidikan", "alamat", "nomorTelepon", "jadwalTersedia"];

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
    const { id } = await params;
    const session = await getSession();
    const isKoordinator = session?.role === "koordinator";
    const isDiriSendiri = session?.role === "tutor" && session.sub === id;
    if (!isKoordinator && !isDiriSendiri) {
      return NextResponse.json({ success: false, error: "Tidak punya akses." }, { status: 401 });
    }

    await connectDB();
    let body = await request.json();

    if (isKoordinator) {
      // Field autentikasi tidak boleh di-set lewat API ini
      delete body.passwordHash;
      delete body.aktivasiTokenHash;
      delete body.aktivasiKadaluarsa;
      delete body.akunDiaktifkanPada;
    } else {
      body = Object.fromEntries(Object.entries(body).filter(([k]) => FIELD_TUTOR.includes(k)));
    }

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
    if ((await getSession())?.role !== "koordinator") {
      return NextResponse.json({ success: false, error: "Akses khusus koordinator." }, { status: 401 });
    }
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

