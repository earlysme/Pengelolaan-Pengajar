import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";

// GET: pemeriksaan konfigurasi server tanpa membocorkan nilai rahasia.
// Dipakai untuk memastikan deployment (mis. Vercel) sudah punya env yang lengkap
// dan bisa menjangkau database. Hanya melaporkan ada/tidak, bukan isinya.
// Catatan: `export const dynamic` tidak boleh dipakai di proyek ini karena
// next.config.ts mengaktifkan cacheComponents.
export async function GET() {
  const terisi = (nama: string) => Boolean(process.env[nama]?.trim());

  const env = {
    MONGODB_URI: terisi("MONGODB_URI"),
    SESSION_SECRET: terisi("SESSION_SECRET"),
    ADMIN_USERNAME: terisi("ADMIN_USERNAME"),
    ADMIN_PASSWORD: terisi("ADMIN_PASSWORD"),
  };

  const masalah: string[] = [];
  if (!env.MONGODB_URI) masalah.push("MONGODB_URI belum diset.");
  if (!env.SESSION_SECRET) {
    masalah.push(
      process.env.NODE_ENV === "production"
        ? "SESSION_SECRET belum diset — sesi memakai kunci turunan MONGODB_URI. Isi SESSION_SECRET agar kunci sesi tidak ikut berubah saat rotasi database."
        : "SESSION_SECRET belum diset (development memakai secret sementara)."
    );
  }
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    masalah.push(
      process.env.NODE_ENV === "production"
        ? "ADMIN_USERNAME/ADMIN_PASSWORD belum diset — login koordinator tidak bisa dipakai."
        : "ADMIN_USERNAME/ADMIN_PASSWORD belum diset (development memakai admin/admin123)."
    );
  }

  let database: { ok: boolean; jumlahPengajar?: number; error?: string } = { ok: false };
  try {
    await connectDB();
    database = { ok: true, jumlahPengajar: await Pengajar.countDocuments() };
  } catch (error) {
    database = { ok: false, error: error instanceof Error ? error.message : String(error) };
    if (!masalah.some((m) => m.startsWith("MONGODB_URI"))) masalah.push("Koneksi MongoDB gagal dari server ini.");
  }

  return NextResponse.json({
    success: database.ok && env.MONGODB_URI && env.SESSION_SECRET && env.ADMIN_USERNAME && env.ADMIN_PASSWORD,
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      wilayah: process.env.VERCEL_REGION ?? null,
    },
    env,
    database,
    masalah,
  });
}