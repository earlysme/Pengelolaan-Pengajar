"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface TutorItem {
  _id: string;
  nama: string;
  jabatan: string;
  mataPelajaran: string[];
  jenjang?: string[];
  kategori: "mipa" | "bahasa" | "soshum";
  almamater: string;
  ipk?: string;
  pengalaman: string;
  rating: number;
  foto: string;
  nomorTelepon: string;
  deskripsi?: string;
  jadwal?: string[];
  iconType?: "school" | "psychology";
  ctaText?: string;
}

const cleanImageUrl = (url?: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  const gDriveIdMatch =
    trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/drive\.google\.com\/thumbnail\?.*id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (gDriveIdMatch && gDriveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveIdMatch[1]}`;
  }

  if (trimmed.includes("dropbox.com")) {
    return trimmed.replace(/[?&]dl=0/, "").concat(trimmed.includes("?") ? "&raw=1" : "?raw=1");
  }

  return trimmed;
};

interface ParsedJadwalGroup {
  hari: string;
  slots: { jam: string; label?: string }[];
}

const extractJenjangFromJadwal = (jadwal?: string[]): string[] => {
  if (!jadwal || jadwal.length === 0) return [];
  const found = new Set<string>();
  for (const item of jadwal) {
    if (/\bsd\b/i.test(item)) found.add("SD");
    if (/\bsmp\b/i.test(item)) found.add("SMP");
    if (/\bsma\b/i.test(item)) found.add("SMA");
    if (/\bkedinasan\b/i.test(item)) found.add("Kedinasan");
  }
  return Array.from(found);
};

const parseJadwalList = (jadwal?: string[]): ParsedJadwalGroup[] => {
  if (!jadwal || jadwal.length === 0) return [];
  const map = new Map<string, { jam: string; label?: string }[]>();

  for (const item of jadwal) {
    if (!item) continue;
    let hari = "Lainnya";
    let sisa = item;
    const colonIdx = item.indexOf(":");
    if (colonIdx !== -1) {
      hari = item.substring(0, colonIdx).trim();
      sisa = item.substring(colonIdx + 1).trim();
    } else {
      const match = item.match(/^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)\s+(.*)/i);
      if (match) {
        hari = match[1];
        sisa = match[2];
      }
    }

    let label = "";
    const parenMatch = sisa.match(/\((.*?)\)/);
    if (parenMatch) {
      label = parenMatch[1].trim();
      sisa = sisa.replace(/\(.*?\)/, "").trim();
    }

    const jam = sisa.replace(/\s*WIB/i, "").trim();

    if (!map.has(hari)) {
      map.set(hari, []);
    }
    map.get(hari)!.push({ jam: jam || sisa, label });
  }

  const orderDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const result: ParsedJadwalGroup[] = [];

  for (const d of orderDays) {
    for (const [key, slots] of map.entries()) {
      if (key.toLowerCase() === d.toLowerCase()) {
        result.push({ hari: key, slots });
        map.delete(key);
      }
    }
  }

  for (const [key, slots] of map.entries()) {
    result.push({ hari: key, slots });
  }

  return result;
};

const getJadwalSummary = (jadwal?: string[]) => {
  if (!jadwal || jadwal.length === 0) return { sesi: 0, hari: 0 };
  const parsed = parseJadwalList(jadwal);
  return {
    hari: parsed.length,
    sesi: jadwal.length,
  };
};

const FILTER_ITEMS = [
  { id: "all", label: "Semua Pengajar" },
  { id: "mipa", label: "MIPA & Sains" },
  { id: "bahasa", label: "Bahasa & Literasi" },
  { id: "soshum", label: "IPS & Humaniora" },
];

interface DBPengajarItem {
  _id: string;
  nama: string;
  status?: string;
  pendidikan?: string;
  ipk?: string;
  mataPelajaran?: string[];
  jenjang?: string[];
  foto?: string;
  nomorTelepon?: string;
  deskripsi?: string;
  jadwalTersedia?: string[];
}

const cleanPendidikan = (text?: string): string => {
  if (!text) return "Pengajar Bimbel";
  // Hapus semua teks '• Berpengalaman...', '- Berpengalaman...', atau kata 'Berpengalaman...'
  const clean = text
    .split(/•|\|/)[0]
    .replace(/[-–—]?\s*berpengalaman.*$/i, "")
    .trim();
  return clean || text;
};

const extractJenjangTags = (label?: string, fallbackJenjang?: string[]): string[] => {
  if (label) {
    const list: string[] = [];
    if (/\bsd\b/i.test(label)) list.push("SD");
    if (/\bsmp\b/i.test(label)) list.push("SMP");
    if (/\bsma\b/i.test(label)) list.push("SMA");
    if (/\bkedinasan\b/i.test(label)) list.push("Kedinasan");
    if (/\butbk\b/i.test(label)) list.push("UTBK");
    if (list.length > 0) return list;
  }
  return fallbackJenjang && fallbackJenjang.length > 0 ? fallbackJenjang : [];
};

const extractProgramTags = (label?: string): string[] => {
  if (!label) return [];
  const progs: string[] = [];
  if (/\breguler\b/i.test(label)) progs.push("Reguler");
  if (/\bprivate\b|\bprivat\b/i.test(label)) progs.push("Private");
  return progs;
};

const mapDBToTutor = (p: DBPengajarItem): TutorItem => {
  const jenjangList = p.jenjang && p.jenjang.length > 0 ? p.jenjang : extractJenjangFromJadwal(p.jadwalTersedia);
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama)}&background=173F3A&color=ffffff&bold=true`;
  const cleanEdu = cleanPendidikan(p.pendidikan);

  return {
    _id: p._id,
    nama: p.nama,
    jabatan: cleanEdu,
    mataPelajaran: p.mataPelajaran && p.mataPelajaran.length > 0 ? p.mataPelajaran : ["Bimbingan Belajar"],
    jenjang: jenjangList,
    kategori: (p.mataPelajaran?.some((m: string) => /inggris|indonesia|bahasa|ielts|toefl|literasi/i.test(m))
      ? "bahasa"
      : p.mataPelajaran?.some((m: string) => /ekonomi|sosiologi|sejarah|geografi|akuntansi|ips|soshum/i.test(m))
        ? "soshum"
        : "mipa") as TutorItem["kategori"],
    almamater: cleanEdu,
    ipk: p.ipk || "",
    pengalaman: "Pengajar Aktif",
    rating: 5.0,
    foto: p.foto ? cleanImageUrl(p.foto) : avatarFallback,
    nomorTelepon: p.nomorTelepon || "",
    deskripsi: p.deskripsi || "",
    jadwal: p.jadwalTersedia || [],
    iconType: "school",
    ctaText: "Jadwal",
  };
};

export default function HalamanKatalog() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalTutor, setModalTutor] = useState<TutorItem | null>(null);
  const parsedJadwalModal = useMemo(() => {
    return parseJadwalList(modalTutor?.jadwal);
  }, [modalTutor?.jadwal]);

  const [tutorList, setTutorList] = useState<TutorItem[]>([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadFromDB = async () => {
    try {
      const res = await fetch("/api/pengajar?t=" + Date.now(), {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      setLoadError("");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const validTutors = (json.data as DBPengajarItem[]).filter((p) => {
          if (p.status === "Nonaktif" || p.status === "Cuti") return false;
          // Hanya tampilkan tutor yang sudah mengatur minimal 1 sesi jadwal aktif
          const hasJadwal = Array.isArray(p.jadwalTersedia) && p.jadwalTersedia.length > 0;
          return hasJadwal;
        });
        setTutorList(validTutors.map(mapDBToTutor));
        setIsDbLoaded(true);
      } else {
        setTutorList([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tidak dapat terhubung ke database server";
      setLoadError(msg);
      setTutorList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ditunda ke task berikutnya agar setState tidak terjadi sinkron di body effect
    // (menghindari cascading render; state awal sudah "loading").
    const timer = setTimeout(() => {
      void loadFromDB();
    }, 0);
    const onFocus = () => void loadFromDB();
    window.addEventListener("focus", onFocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const filteredTutors = useMemo(() => {
    if (activeFilter === "all") return tutorList;
    return tutorList.filter((t) => t.kategori === activeFilter);
  }, [tutorList, activeFilter]);

  return (
    <div className="bg-[#faf9f7] text-[#1a1c1b] min-h-screen selection:bg-[#e3e2e0] selection:text-[#1a1c1b]">
      {/* Header Sticky */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9f7]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-85">
            <img src="/logo.svg" alt="Gen Plasma" className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="font-serif text-[1.25rem] sm:text-[1.4rem] leading-none tracking-tight text-[#173F3A] select-none font-bold translate-y-[2px]">
                Gen Plasma
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <button
              type="button"
              onClick={() => {
                document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-[0.875rem] text-[#444748] hover:text-[#173F3A] transition-colors py-1 font-medium cursor-pointer"
            >
              Katalog Pengajar
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById("konsultasi")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-[0.875rem] text-[#444748] hover:text-[#173F3A] transition-colors py-1 font-medium cursor-pointer"
            >
              Konsultasi
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#173F3A] hover:bg-[#112d2a] text-white text-[0.8125rem] sm:text-[0.875rem] font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Portal Pengajar
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-16 sm:pt-20 bg-[#faf9f7]">
        <div className="flex flex-col w-full">
          {/* Top Editorial Header & Filters Section */}
          <section id="katalog" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-8 sm:pb-12 flex flex-col items-center text-center scroll-mt-20">
            {/* Overline Metric Pill */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#F2D5A8]/50 text-[#173F3A] text-[0.7rem] sm:text-[0.75rem] font-semibold border border-[#D88A32]/30 shadow-xs mb-4 sm:mb-6">
              {/* <span className="inline-block w-2 h-2 rounded-full bg-[#B74E2C] animate-pulse"></span> */}
              <span>Pengajar Ahli & Berpengalaman</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-[1.85rem] sm:text-[3rem] lg:text-[4rem] text-[#173F3A] max-w-4xl tracking-tight leading-[1.15] mb-4 sm:mb-5 font-bold">
              Temukan pengajar terbaik untuk dampingi{" "}
              <span className="italic font-normal text-[#B74E2C]">prestasi belajar</span> Anda
            </h1>

            {/* Subtitle */}
            <p className="text-[0.9375rem] sm:text-[1.125rem] text-[#444748] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
              Belajar lebih efektif bersama tutor berdedikasi melalui pendekatan interaktif yang disesuaikan dengan ritme dan target belajar setiap siswa
            </p>

            {/* Segmented Filter Bar */}
            <div className="w-full overflow-x-auto no-scrollbar py-2 px-4 flex sm:justify-center">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-[#eae6df] shadow-xs backdrop-blur-md shrink-0">
                {FILTER_ITEMS.map((item) => {
                  const isActive = activeFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveFilter(item.id)}
                      className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[0.8125rem] sm:text-[0.875rem] transition-all duration-200 shrink-0 ${isActive
                        ? "bg-[#173F3A] text-white shadow-xs font-semibold"
                        : "text-[#444748] hover:text-[#173F3A] font-medium"
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 2-Column Mobile, 4-Column Desktop Cards Grid */}
          <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 pb-16 sm:pb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-[#173F3A]/10 animate-pulse flex flex-col"
                  >
                    <div className="w-full aspect-[4/5] bg-neutral-200/70" />
                    <div className="p-3 sm:p-4 space-y-2">
                      <div className="h-3.5 sm:h-4 bg-neutral-200/80 rounded-md w-3/4" />
                      <div className="h-3 bg-neutral-200/60 rounded-md w-1/2" />
                    </div>
                  </div>
                ))
              ) : filteredTutors.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#173F3A]/10 text-[#173F3A] flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[32px]">person_off</span>
                  </div>
                  <h3 className="font-serif text-[1.25rem] font-bold text-[#173F3A]">Belum Ada Pengajar</h3>
                  <p className="text-[0.875rem] text-[#67645f] mt-1 max-w-md mx-auto">
                    Tidak ada data pengajar aktif yang ditemukan untuk kategori ini.
                  </p>
                </div>
              ) : (
                filteredTutors.map((tutor) => (
                  <article
                    key={tutor._id}
                    onClick={() => setModalTutor(tutor)}
                    className="group relative rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer aspect-[4/5] bg-[#efeeec]"
                  >
                    {/* Full-bleed Photo */}
                    <img
                      src={cleanImageUrl(tutor.foto)}
                      alt={tutor.nama}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.nama)}&background=173F3A&color=ffffff&bold=true`;
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Gradient Overlay for subtle contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                    {/* Top Right: Ketersediaan Hari Badge */}
                    {(() => {
                      const summary = getJadwalSummary(tutor.jadwal);
                      if (summary.hari === 0) return null;
                      return (
                        <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 bg-white/95 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-xs border border-[#173F3A]/15 pointer-events-none z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[0.65rem] sm:text-[0.72rem] font-bold text-[#173F3A]">
                            Tersedia {summary.hari} Hari
                          </span>
                        </div>
                      );
                    })()}

                    {/* Floating Pill Badge Nestled at Bottom (Opsi A: Clean & Modern) */}
                    <div className="absolute inset-x-2.5 sm:inset-x-3 bottom-2.5 sm:bottom-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md shadow-lg text-center transition-all duration-300 group-hover:-translate-y-1 z-10">
                      <h3 className="text-[0.8125rem] sm:text-[0.9375rem] text-[#1a1c1b] font-bold truncate">
                        {tutor.nama}
                      </h3>
                      <p className="text-[0.7rem] sm:text-[0.78rem] text-[#444748] truncate mt-0.5 font-medium">
                        {tutor.jabatan}
                      </p>
                      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-[#efeeec]">
                        <div className="flex items-center gap-1 flex-wrap">
                          {tutor.jenjang && tutor.jenjang.map((j) => (
                            <span
                              key={j}
                              className="text-[0.62rem] sm:text-[0.68rem] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-[#173F3A]/10 text-[#173F3A]"
                            >
                              {j}
                            </span>
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-[0.68rem] sm:text-[0.72rem] font-bold text-[#173F3A] group-hover:text-emerald-700 transition-colors shrink-0">
                          <span>Jadwal</span>
                          <span className="material-symbols-outlined text-[12px] sm:text-[14px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Bottom Status Info */}
            {!loading && (
              <div className="mt-10 sm:mt-14 flex flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    void loadFromDB();
                  }}
                  className="inline-flex items-center gap-2 bg-white text-[#1a1c1b] hover:bg-[#e9e8e6] text-[0.8125rem] sm:text-[0.875rem] font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>Segarkan Data Pengajar</span>
                </button>
                <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#67645f] text-center">
                  Menampilkan {filteredTutors.length} dari {tutorList.length} pengajar terverifikasi
                  {isDbLoaded && (
                    <span className="ml-2 text-emerald-700 font-medium block sm:inline">• Database Terhubung Langsung</span>
                  )}
                </p>
                {loadError && (
                  <p className="text-[0.75rem] text-rose-600 text-center">
                    {loadError}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* High-End Value Strip / Minimalist Reassurance */}
          <section id="keunggulan" className="w-full bg-[#f4f3f1] py-10 sm:py-12 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
                <div className="flex items-start gap-4 justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[0.875rem] text-[#1a1c1b] font-semibold">
                      Standar Pengajar Terbaik
                    </h4>
                    <p className="text-[0.8125rem] text-[#444748] leading-relaxed">
                      Berdedikasi mendampingi siswa lewat pemahaman konsep yang kuat, metode komunikatif, dan pendekatan empatik.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[24px]">psychology</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[0.875rem] text-[#1a1c1b] font-semibold">
                      Pengajar Ahli &amp; Kompeten
                    </h4>
                    <p className="text-[0.8125rem] text-[#444748] leading-relaxed">
                      Berpengalaman di bidangnya dengan kemampuan adaptasi mengajar sesuai karakter dan kebutuhan belajar siswa.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[24px]">stars</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[0.875rem] text-[#1a1c1b] font-semibold">
                      Tutor Pilihan Berkualitas
                    </h4>
                    <p className="text-[0.8125rem] text-[#444748] leading-relaxed">
                      Teruji dalam penyampaian materi, bimbingan akademis terarah, dan komunikasi yang interaktif.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Invitation Banner */}
          <section id="konsultasi" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 scroll-mt-20">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#efeeec] p-6 sm:p-8 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 shadow-xs">
              <div className="max-w-xl space-y-2 sm:space-y-3 text-center lg:text-left">
                <span className="text-[0.7rem] sm:text-[0.75rem] text-[#67645f] tracking-wider uppercase font-semibold">
                  Bimbingan Yang Tepat Untuk Anda
                </span>
                <h3 className="font-serif text-[1.4rem] sm:text-[1.75rem] text-[#1a1c1b] leading-tight">
                  Bingung memilih pengajar yang paling cocok?
                </h3>
                <p className="text-[0.875rem] sm:text-[0.9375rem] text-[#444748] leading-relaxed">
                  Konselor akademik kami siap membantu memetakan gaya belajar dan kurikulum siswa
                  untuk mencocokkan tutor terbaik secara cuma-cuma.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                <a
                  href="https://wa.me/6281377889900?text=Halo%20Lentera%20Belajar%2C%20saya%20ingin%20konsultasi%20penjurusan%20tutor"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center bg-black text-white text-[0.8125rem] sm:text-[0.875rem] font-semibold px-5 sm:px-6 py-3 rounded-full hover:bg-[#444748] transition-colors shadow-xs text-center"
                >
                  Konsultasi Penjurusan Tutor
                </a>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center bg-white text-[#1a1c1b] text-[0.8125rem] sm:text-[0.875rem] font-semibold px-5 sm:px-6 py-3 rounded-full hover:bg-[#e9e8e6] transition-colors shadow-xs text-center"
                >
                  Portal Pengajar
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f2efe9] border-t border-[#173F3A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#173F3A]/15">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="Gen Plasma" className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0" />
                <div className="flex flex-col justify-center">
                  <span className="font-serif text-[1.125rem] sm:text-[1.25rem] leading-none tracking-tight text-[#173F3A] font-bold">
                    Gen Plasma
                  </span>
                </div>
              </div>
              <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#444748] max-w-sm leading-relaxed">
                Solusi bimbingan belajar terpadu untuk mendampingi langkah akademis siswa secara terarah, adaptif, dan menyenangkan.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-5 sm:gap-x-6 gap-y-2 text-[0.75rem] text-[#444748]">
              <button
                type="button"
                onClick={() => {
                  document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-[#173F3A] transition-colors cursor-pointer"
              >
                Katalog Pengajar
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("keunggulan")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-[#173F3A] transition-colors cursor-pointer"
              >
                Keunggulan
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("konsultasi")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-[#173F3A] transition-colors cursor-pointer"
              >
                Konsultasi
              </button>
              <Link href="/login" className="text-[#173F3A] font-semibold hover:underline">
                Portal Pengajar
              </Link>
            </nav>
          </div>

          <div className="pt-4 sm:pt-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[0.7rem] sm:text-[0.75rem] text-[#67645f] text-center sm:text-left">
            <p>© 2025 - 2026 Gen Plasma. Hak cipta dilindungi undang-undang.</p>
            <div className="flex items-center gap-4">
              <span>Cianjur</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Detail / Jadwal Modal */}
      {modalTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#173F3A]/15 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative p-4 sm:p-6 bg-[#faf8f5] border-b border-[#173F3A]/10 flex items-start sm:items-center gap-3 sm:gap-4">
              <img
                src={cleanImageUrl(modalTutor.foto)}
                alt={modalTutor.nama}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(modalTutor.nama)}&background=173F3A&color=ffffff&bold=true`;
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
                className="w-14 h-18 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl object-cover shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1 text-[#173F3A]">
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px]">school</span>
                  <span className="text-[0.7rem] sm:text-[0.75rem] font-medium text-[#444748] truncate">{modalTutor.almamater}</span>
                </div>
                <h3 className="font-serif text-[1.15rem] sm:text-[1.35rem] font-bold text-[#173F3A] leading-tight truncate">
                  {modalTutor.nama}
                </h3>
                <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#444748] truncate mt-0.5">{modalTutor.jabatan}</p>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">

                  {modalTutor.jenjang && modalTutor.jenjang.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-[0.6875rem] text-[#67645f]">Jenjang:</span>
                      <span className="text-[0.6875rem] font-semibold text-[#173F3A] bg-[#173F3A]/10 px-2 py-0.5 rounded-full border border-[#173F3A]/15">
                        {modalTutor.jenjang.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalTutor(null)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#444748] hover:text-[#173F3A] shadow-xs font-bold text-sm shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[58vh] sm:max-h-[62vh] text-xs text-[#444748]">
              {modalTutor.deskripsi && (
                <div>
                  <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#67645f] block mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#173F3A]">person</span>
                    Profil Akademik &amp; Pendekatan
                  </span>
                  <p className="text-[#173F3A] bg-[#faf8f5] border border-[#173F3A]/10 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl leading-relaxed italic text-[0.75rem] sm:text-[0.8125rem]">
                    &quot;{modalTutor.deskripsi}&quot;
                  </p>
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#67645f] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#173F3A]">calendar_month</span>
                    Ketersediaan Jadwal Mengajar
                  </span>
                  <span className="text-[0.6875rem] font-semibold text-[#173F3A] bg-[#173F3A]/10 px-2.5 py-0.5 rounded-full border border-[#173F3A]/15">
                    {modalTutor.jadwal?.length || 0} Sesi Terjadwal
                  </span>
                </div>

                {parsedJadwalModal.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {parsedJadwalModal.map((group) => {
                      const dayJenjang = Array.from(
                        new Set(
                          group.slots.flatMap((s) => extractJenjangTags(s.label, modalTutor.jenjang))
                        )
                      );

                      return (
                        <div
                          key={group.hari}
                          className="p-3 bg-[#faf8f5] rounded-2xl border border-[#173F3A]/10 flex flex-col gap-2 hover:border-[#173F3A]/25 transition-all"
                        >
                          <div className="flex items-center justify-between border-b border-[#173F3A]/5 pb-1.5 gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <span className="font-bold text-[#173F3A] text-[0.8125rem] flex items-center gap-1.5 shrink-0">
                                <span className="w-2 h-2 rounded-full bg-[#173F3A]"></span>
                                {group.hari}
                              </span>
                              {dayJenjang.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {dayJenjang.map((j) => (
                                    <span
                                      key={j}
                                      className="text-[0.625rem] px-1.5 py-0.5 rounded-md bg-[#173F3A]/10 text-[#173F3A] border border-[#173F3A]/15 font-bold"
                                    >
                                      {j}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-[0.65rem] font-semibold text-[#173F3A]/70 bg-white px-2 py-0.5 rounded-full border border-[#173F3A]/10 shrink-0">
                              {group.slots.length} Sesi
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {group.slots.map((s, idx) => {
                              const slotJenjang = extractJenjangTags(s.label, modalTutor.jenjang);
                              const slotProgram = extractProgramTags(s.label);
                              const otherLabel = s.label
                                ? s.label
                                  .replace(/\b(sd|smp|sma|kedinasan|utbk)\b/gi, "")
                                  .replace(/\b(reguler|private|privat)\b/gi, "")
                                  .replace(/[,•\s]+/g, " ")
                                  .trim()
                                : "";

                              return (
                                <div
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white border border-[#173F3A]/15 rounded-xl text-[0.72rem] text-[#173F3A] shadow-2xs font-medium flex-wrap"
                                >
                                  <span className="font-semibold">{s.jam}</span>
                                  {slotJenjang.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      {slotJenjang.map((j) => (
                                        <span
                                          key={j}
                                          className="text-[0.625rem] px-1.5 py-0.5 rounded-md bg-[#173F3A]/10 text-[#173F3A] border border-[#173F3A]/15 font-bold"
                                        >
                                          {j}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {slotProgram.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      {slotProgram.map((prog) => (
                                        <span
                                          key={prog}
                                          className="text-[0.625rem] px-1.5 py-0.5 rounded-md bg-[#F2D5A8]/70 text-[#173F3A] border border-[#D88A32]/30 font-bold"
                                        >
                                          {prog}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {otherLabel && (
                                    <span className="text-[0.625rem] px-1.5 py-0.5 rounded-md bg-[#faf8f5] text-[#173F3A] border border-[#173F3A]/15 font-medium">
                                      {otherLabel}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#173F3A]/10 text-center text-[#67645f]">
                    Jadwal fleksibel (dapat dikoordinasikan langsung via WhatsApp).
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-[#f2efe9] border-t border-[#173F3A]/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalTutor(null)}
                className="w-full sm:w-auto px-4 py-2.5 text-[0.8125rem] font-semibold text-[#444748] hover:bg-[#eae6df] rounded-full transition-colors text-center cursor-pointer"
              >
                Tutup
              </button>
              <a
                href={`https://wa.me/${modalTutor.nomorTelepon.replace(/^0/, "62").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Halo ${modalTutor.nama}, saya melihat profil Anda di Gen Plasma dan ingin berkonsultasi mengenai bimbingan belajar.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#173F3A] hover:bg-[#112F2B] text-white text-[0.8125rem] font-semibold px-5 py-2.5 rounded-full transition-colors shadow-xs text-center"
              >
                <span>Atur Jadwal via WhatsApp</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
