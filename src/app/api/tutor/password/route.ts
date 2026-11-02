import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "tutor" || !session.sub) {
      return NextResponse.json({ success: false, error: "Akses tidak sah." }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : (body?.password || "");

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password baru minimal 8 karakter." },
        { status: 400 }
      );
    }

    await connectDB();
    const tutor = await Pengajar.findById(session.sub).select("+passwordHash");
    if (!tutor) {
      return NextResponse.json({ success: false, error: "Akun tutor tidak ditemukan." }, { status: 404 });
    }

    // Jika akun sudah memiliki password, wajib validasi password saat ini
    if (tutor.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Password saat ini wajib diisi." },
          { status: 400 }
        );
      }
      const isValid = verifyPassword(currentPassword, tutor.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Password saat ini salah." },
          { status: 400 }
        );
      }
    }

    if (currentPassword && currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: "Password baru tidak boleh sama dengan password saat ini." },
        { status: 400 }
      );
    }

    tutor.passwordHash = hashPassword(newPassword);
    await tutor.save();

    return NextResponse.json({ success: true, message: "Password berhasil diperbarui." });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memperbarui password";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

