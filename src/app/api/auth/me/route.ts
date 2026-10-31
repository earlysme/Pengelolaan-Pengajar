import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// GET: siapa yang sedang login (dibaca dari cookie sesi, bukan dari localStorage)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Belum login." }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    data: { role: session.role, id: session.sub ?? null, nama: session.nama },
  });
}
