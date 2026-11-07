import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";

// GET: siapa yang sedang login (dibaca dari cookie sesi atau Authorization Bearer token)
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Belum login." }, { status: 401 });
  }

  // Jika sesi adalah akun tutor, periksa apakah password baru saja di-reset atau dinonaktifkan oleh koordinator
  if (session.role === "tutor" && session.sub) {
    try {
      await connectDB();
      const tutor = await Pengajar.findById(session.sub).select("status statusResetPassword");
      if (!tutor || tutor.status === "Nonaktif") {
        return NextResponse.json(
          { success: false, error: "Akun telah dinonaktifkan oleh koordinator." },
          { status: 403 }
        );
      }
      if (tutor.statusResetPassword) {
        return NextResponse.json(
          {
            success: false,
            isReset: true,
            error: "Akses akun Anda telah di-reset oleh koordinator. Password lama sudah tidak berlaku. Silakan gunakan link yang dikirimkan koordinator via WhatsApp untuk membuat password baru.",
          },
          { status: 401 }
        );
      }
    } catch {
      // Abaikan jika kendala koneksi sesaat
    }
  }

  return NextResponse.json(
    {
      success: true,
      data: { role: session.role, id: session.sub ?? null, nama: session.nama },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
