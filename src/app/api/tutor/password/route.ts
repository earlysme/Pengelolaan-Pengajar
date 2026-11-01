import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import { getSession, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "tutor" || !session.sub) {
      return NextResponse.json({ success: false, error: "Akses tidak sah." }, { status: 401 });
    }

    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password baru minimal 8 karakter." },
        { status: 400 }
      );
    }

    await connectDB();
    const tutor = await Pengajar.findById(session.sub);
    if (!tutor) {
      return NextResponse.json({ success: false, error: "Akun tutor tidak ditemukan." }, { status: 404 });
    }

    tutor.passwordHash = hashPassword(password);
    await tutor.save();

    return NextResponse.json({ success: true, message: "Password berhasil diperbarui." });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memperbarui password";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
