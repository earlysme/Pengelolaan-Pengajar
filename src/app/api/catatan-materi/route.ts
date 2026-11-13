import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import CatatanMateri from "@/models/CatatanMateri";

const err = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status });

/** Pastikan tutor aktif dan memang mengajar mapel + jenjang tersebut. */
async function cekAkses(sub: string | undefined, mapel: string, jenjang: string) {
  const tutor = await Pengajar.findById(sub).select("mataPelajaran jenjang status nama");
  if (!tutor || tutor.status === "Nonaktif") return { error: err("Akun tidak aktif.", 403) };
  if (!tutor.mataPelajaran?.includes(mapel) || !tutor.jenjang?.includes(jenjang)) {
    return { error: err("Kamu tidak mengajar kelas ini.", 403) };
  }
  return { tutor };
}

// GET /api/catatan-materi?mapel=...&jenjang=...  -> riwayat catatan (terbaru dulu)
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return err("Belum login.", 401);

  const { searchParams } = new URL(request.url);
  const mapel = searchParams.get("mapel")?.trim();
  const jenjang = searchParams.get("jenjang")?.trim();
  if (!mapel || !jenjang) return err("Mapel dan jenjang wajib diisi.", 400);

  await connectDB();

  if (session.role === "tutor") {
    const akses = await cekAkses(session.sub, mapel, jenjang);
    if (akses.error) return akses.error;
  } else if (session.role !== "koordinator") {
    return err("Tidak punya akses.", 403);
  }

  const data = await CatatanMateri.find({ mapel, jenjang, program: "Reguler" })
    .sort({ tanggal: -1, createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(
    { success: true, data },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// POST -> tambah catatan baru (khusus tutor)
export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return err("Belum login.", 401);
  if (session.role !== "tutor") return err("Hanya tutor yang bisa menulis catatan.", 403);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return err("Data tidak valid.", 400);
  }

  const mapel = String(body.mapel ?? "").trim();
  const jenjang = String(body.jenjang ?? "").trim();
  const materi = String(body.materi ?? "").trim();
  const catatan = String(body.catatan ?? "").trim();
  const rencanaBerikutnya = String(body.rencanaBerikutnya ?? "").trim();
  const tanggal = body.tanggal ? new Date(body.tanggal) : new Date();

  if (!mapel || !jenjang) return err("Pilih mapel dan jenjang.", 400);
  if (!materi) return err("Isi materi yang dibahas.", 400);
  if (materi.length > 200 || catatan.length > 1000 || rencanaBerikutnya.length > 500) {
    return err("Teks terlalu panjang.", 400);
  }
  if (Number.isNaN(tanggal.getTime())) return err("Tanggal tidak valid.", 400);

  await connectDB();
  const akses = await cekAkses(session.sub, mapel, jenjang);
  if (akses.error) return akses.error;

  const dibuat = await CatatanMateri.create({
    mapel,
    jenjang,
    program: "Reguler",
    tanggal,
    materi,
    catatan,
    rencanaBerikutnya,
    tutorId: session.sub,
    tutorNama: akses.tutor!.nama || session.nama,
  });

  return NextResponse.json({ success: true, data: dibuat }, { status: 201 });
}
