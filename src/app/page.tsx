"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface TutorItem {
  _id: string;
  nama: string;
  jabatan: string;
  mataPelajaran: string[];
  kategori: "mipa" | "bahasa" | "kedokteran" | "soshum" | "psikologi";
  almamater: string;
  pengalaman: string;
  rating: number;
  foto: string;
  nomorTelepon: string;
  deskripsi?: string;
  jadwal?: string[];
  iconType?: "school" | "psychology";
  ctaText?: string;
}

const MASTER_TUTORS: TutorItem[] = [
  {
    _id: "tutor-1",
    nama: "Dr. Hendra Wijaya",
    jabatan: "Kepala Kurikulum & Fisika ITB",
    mataPelajaran: ["Fisika", "UTBK & SNBT"],
    kategori: "mipa",
    almamater: "Alumni ITB",
    pengalaman: "9 Thn",
    rating: 4.98,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPSslSYYnfoV2BdHniraBvf-zFTY0_nnKDvhTyDKr-ePxazX-evrLx9wkLIMu0JmsGzBaNJV08G9BbP71H_bY_x70-6a470DOucz6qd81hdQe2fZkfE_9-kHxHKatJzcVMLQR_jtPJ2AlYAehZ1HU5QK2otmJ_KLN4NOpZfPAH9yhBkrG4P1PWOi7WdWCPGob4JPR1d0_-M5DebT8wLuTYErUmYzDEpBDERMac1Xm3",
    nomorTelepon: "081249829011",
    deskripsi: "Pakar fisika terapan dengan metode pengajaran intuitif berbasis visualisasi konsep dan problem solving olimpiade.",
    jadwal: ["Senin: 16:00 - 18:00 WIB (Intensif)", "Kamis: 18:30 - 20:30 WIB (Klinik Soal)"],
    iconType: "school",
    ctaText: "Jadwal",
  },
  {
    _id: "tutor-2",
    nama: "Dra. Ratna Kartika, M.Pd.",
    jabatan: "Master Tutor Kimia & UTBK UI",
    mataPelajaran: ["Kimia", "Sains"],
    kategori: "mipa",
    almamater: "Alumni UI",
    pengalaman: "11 Thn",
    rating: 5.0,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLORKz5cdb-b6Sr6iQlkZnWwaR4Wien9clgtQ_4naSaUQAyFF1M8VRzvd4ctrFL2I_zTWxbLy5l5Be2KsLfTDWB7RHoLTzkIehkUjMz5Pi-XHPSSRcgpn7QWLovBwA1xpaK90HqTOVA18yW6RiEP0Vg3HsYK5_eEp3N1eRwIlGmWLylsqJI97PY9sbsTThI-kln8L1bQqnIF1Tlm_hMUHIHdd59EEZ1WrVvP_G7ndK",
    nomorTelepon: "082198765432",
    deskripsi: "Berpengalaman mendampingi ratusan siswa menembus jurusan kedokteran & teknik dengan drilling soal terstruktur.",
    jadwal: ["Selasa: 15:30 - 17:30 WIB", "Jumat: 16:00 - 18:00 WIB"],
    iconType: "school",
    ctaText: "Jadwal",
  },
  {
    _id: "tutor-3",
    nama: "Kevin Pratama, M.Mat.",
    jabatan: "Medalis Emas OSN Matematika",
    mataPelajaran: ["Matematika", "Kalkulus"],
    kategori: "mipa",
    almamater: "Alumni ITB",
    pengalaman: "6 Thn",
    rating: 4.97,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMzpCwKO7dTXYJHybvMdaPcbeAiwkqw2shc9nkAkY6HpOuanEnWPOUAvIAZqtGdtb7zHGoEHTMjra-MHJ5KcgidGvYixdUooSScyKxPc9qPcXWSEhigbVrOlNyh0c2inmxj6Rxvv27wCjvjozEJkSZJzs2pD9AgnBax2xFI48VUkpQZX_OEGJA8hi0iOI26MjM7CA8Ytit4e4wnvcTv-SOUB5ZJXr-qzHXD7t6KY4M",
    nomorTelepon: "081299887766",
    deskripsi: "Spesialis logika matematika, aljabar linear, dan strategi penalaran cepat tes UTBK SNBT.",
    jadwal: ["Rabu: 18:30 - 20:30 WIB", "Sabtu: 09:00 - 11:30 WIB"],
    iconType: "school",
    ctaText: "Jadwal",
  },
  {
    _id: "tutor-4",
    nama: "drg. Nadia Safira, S.KG.",
    jabatan: "Mentor Masuk Kedokteran FKG UI",
    mataPelajaran: ["Biologi", "Kedokteran Dasar"],
    kategori: "kedokteran",
    almamater: "FKG UI",
    pengalaman: "5 Thn",
    rating: 4.99,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGuy447MXo2kjeNpyEMYzbakob825Ov0Mzr_AoHY7OF_8T2utmJMn4Yjvwfk2omND1BUp8TVfh9O2d8g659-O6PUbvZNDrvhzocBSnd0DD5jZHWL-CnCtwqqME0VF_r11X5NDgbQuqm4qxP7DZRjLsqNP7FbMY6OS_UvVOEbFwjvfqKL_RY5E6TBS8_nWBJa9WHSjPEsj6izlX_ClmQCkOwtDdw1skYZ1UtxK_qMWB",
    nomorTelepon: "081377889900",
    deskripsi: "Fokus pada pendampingan intensif masuk Fakultas Kedokteran & Kedokteran Gigi PTN unggulan nasional.",
    jadwal: ["Selasa: 16:30 - 18:30 WIB", "Sabtu: 13:00 - 15:30 WIB"],
    iconType: "school",
    ctaText: "Jadwal",
  },
  {
    _id: "tutor-5",
    nama: "Sarah Elizabeth, M.A.",
    jabatan: "Master Bahasa Inggris & IELTS UGM",
    mataPelajaran: ["Bahasa Inggris", "IELTS"],
    kategori: "bahasa",
    almamater: "Alumni UGM",
    pengalaman: "8 Thn",
    rating: 4.95,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm0XBC9ojBinLHY1otLK2OkdrHFXr8DYPkcDfiN6for5hQho4p_kjv-GxtOyjQBVExdKe1_bVh9cII47Ozvye8W3vaRgppWaqiDySMg6aPE2qhLTlMUcMQHZPJ1v1OsghQwrozQYswyytWJVFLm_JRBbYt7yYA-io24srTjjNKkRvfmqd3f_jFGiVhi6h7Stx8N8w0da3rpblGeYuqNeX_Sh3How3nw055w21s83M4",
    nomorTelepon: "081988223344",
    deskripsi: "Pelatih sertifikasi IELTS Band 7.5+ dan kemampuan menulis esai akademik berstandar internasional.",
    jadwal: ["Senin: 19:00 - 20:30 WIB", "Kamis: 19:00 - 20:30 WIB"],
    iconType: "school",
    ctaText: "Jadwal",
  },
  {
    _id: "tutor-6",
    nama: "Rizky Ramadhan, S.E.",
    jabatan: "Ekonomi & SIMAK UI Spesialis",
    mataPelajaran: ["Ekonomi", "Soshum"],
    kategori: "soshum",
    almamater: "FEB UI",
    pengalaman: "7 Thn",
    rating: 4.96,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuBihIIL8OHDv5plKshRoJYK1h8E6mH-_SV-pcRqOQizylclRjYdzHU87cfPChGSahQvPDlCpLka4EOTuC4DWpbiFiKZ9RkRcfYUg8hKjuSdoTmg-ZCPcA_T2rgwY5nfcOuqxFxovOejirXrJR814WfLGYzchJcohDJqXPDm-yEuF4r51O2OaooAa_VCbWqdjzoD3uZPTnUuWX8xTakgJ4K_HUvI3pTem2Gh3O34ORjU",
    nomorTelepon: "085712349988",
    deskripsi: "Pakar analisis makro-mikro ekonomi serta kurikulum SIMAK UI dan Ujian Masuk PTN klaster Soshum.",
    jadwal: ["Rabu: 16:00 - 18:00 WIB", "Jumat: 14:00 - 16:00 WIB"],
    iconType: "school",
    ctaText: "Jadwal",
  },
  {
    _id: "tutor-7",
    nama: "Fadhila Anindita, M.Psi.",
    jabatan: "Psikolog Pendampingan Belajar",
    mataPelajaran: ["Konseling", "Psikologi"],
    kategori: "psikologi",
    almamater: "Psikologi UI",
    pengalaman: "6 Thn",
    rating: 5.0,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbSN3hI6xayPEzaRiXUdNW04vN7yHtSBSJxZ24Eqlr-i45aDoRaA8iOQGwfJFlIloGvP14s49Hmj34_2oEx1k7MzTczima3IzGp2TVmCnzkVsZoqoNHUIQ5CKQiGj1XC7S5HvSohdATcS06cXqh7ZpQb1DjXEYx76_-aFsY_fUSxA8m50H9p_rMneLe9apXNB-HCW_i5txrO_sjdJPBnCltpCOe2RYxQyu1LShV4yo",
    nomorTelepon: "081344556677",
    deskripsi: "Membimbing kesiapan mental, manajemen stres ujian, dan tes pemetaan minat bakat jurusan kuliah.",
    jadwal: ["Selasa: 14:00 - 16:00 WIB", "Sabtu: 10:00 - 12:00 WIB"],
    iconType: "psychology",
    ctaText: "Konseling",
  },
  {
    _id: "tutor-8",
    nama: "Bagas Pratama, S.Si.",
    jabatan: "Biologi Terapan & Kedokteran Unair",
    mataPelajaran: ["Biologi", "Sains"],
    kategori: "mipa",
    almamater: "Alumni Unair",
    pengalaman: "5 Thn",
    rating: 4.97,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCTi8bN5APIh7vXalz2gT3e_2KG33lMKwXWg5u5eOnPByHw7TZX6zncgYC40_uMA8lVBNJz0yJb3GtIko9yVzivDgRKt_sDlrHMbptxQBwi39PgnDtLd02jlWQeLwkVkikPNo7Abeih5aE5rM8vmkNam4XStknrWbB2IszE_s4C7j8VwzCAZ7PJxvxVGuBy3VmwPLkiFUwt1pmuWLZtWGbsA0PMem8zV0FCcpFUR8t",
    nomorTelepon: "081249829011",
    deskripsi: "Fokus pada pendalaman biologi sel, genetika, dan fisiologi tubuh untuk seleksi ketat program sains.",
    jadwal: ["Kamis: 16:00 - 18:00 WIB", "Minggu: 09:00 - 11:30 WIB"],
    iconType: "school",
    ctaText: "Jadwal",
  },
];

const FILTER_ITEMS = [
  { id: "all", label: "Semua Pengajar" },
  { id: "mipa", label: "MIPA & UTBK" },
  { id: "bahasa", label: "Bahasa & Literasi" },
  { id: "kedokteran", label: "Kedokteran & Sains" },
  { id: "soshum", label: "Sosial & Humaniora" },
  { id: "psikologi", label: "Konselor Belajar" },
];

export default function HalamanKatalog() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalTutor, setModalTutor] = useState<TutorItem | null>(null);
  const [tutorList, setTutorList] = useState<TutorItem[]>(MASTER_TUTORS);
  const [loadMoreState, setLoadMoreState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    // Muat data dari database jika ada pengajar baru
    const loadFromDB = async () => {
      try {
        const res = await fetch("/api/pengajar?status=Aktif");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Gabungkan atau gunakan pengajar dari database dengan mapping visual
          interface DBPengajarItem {
            _id: string;
            nama: string;
            pendidikan?: string;
            mataPelajaran?: string[];
            foto?: string;
            nomorTelepon?: string;
            deskripsi?: string;
            jadwalTersedia?: string[];
          }
          const dbMapped: TutorItem[] = (json.data as DBPengajarItem[]).map((p, idx) => {
            const fallback = MASTER_TUTORS[idx % MASTER_TUTORS.length];
            return {
              _id: p._id,
              nama: p.nama,
              jabatan: p.pendidikan || fallback.jabatan,
              mataPelajaran: p.mataPelajaran || fallback.mataPelajaran,
              kategori: (p.mataPelajaran?.some((m: string) => /inggris|indonesia|bahasa/i.test(m))
                ? "bahasa"
                : p.mataPelajaran?.some((m: string) => /kedokteran|biologi/i.test(m))
                ? "kedokteran"
                : p.mataPelajaran?.some((m: string) => /ekonomi|sosiologi|sejarah/i.test(m))
                ? "soshum"
                : "mipa") as TutorItem["kategori"],
              almamater: p.pendidikan ? p.pendidikan.split(" ")[0] + " • 5+ Thn" : fallback.almamater,
              pengalaman: "6 Thn",
              rating: 4.95,
              foto: p.foto || fallback.foto,
              nomorTelepon: p.nomorTelepon || fallback.nomorTelepon,
              deskripsi: p.deskripsi || fallback.deskripsi,
              jadwal: p.jadwalTersedia || fallback.jadwal,
              iconType: "school",
              ctaText: "Jadwal",
            };
          });
          setTutorList(dbMapped);
        }
      } catch {
        // Tetap menggunakan MASTER_TUTORS bawaan designpublik.html
      }
    };
    loadFromDB();
  }, []);

  const filteredTutors = useMemo(() => {
    if (activeFilter === "all") return tutorList;
    return tutorList.filter((t) => t.kategori === activeFilter);
  }, [tutorList, activeFilter]);

  const handleLoadMore = () => {
    setLoadMoreState("loading");
    setTimeout(() => {
      setLoadMoreState("done");
    }, 600);
  };

  return (
    <div className="bg-[#faf9f7] text-[#1a1c1b] min-h-screen selection:bg-[#e3e2e0] selection:text-[#1a1c1b]">
      {/* Header Sticky */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9f7]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <img src="/logo.svg" alt="Gen Plasma" className="w-9 h-9 object-contain" />
            <div className="flex flex-col">
              <span className="font-serif text-[1.4rem] leading-none tracking-tight text-[#173F3A] select-none font-bold">
                Gen Plasma
              </span>
              <span className="text-[0.68rem] tracking-wider uppercase text-[#B74E2C] font-semibold">
                Alur Selaras
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className="text-[0.875rem] font-semibold text-[#173F3A] border-b-2 border-[#173F3A] py-1"
            >
              Pengajar
            </Link>
            <Link
              href="/koordinator"
              className="text-[0.875rem] text-[#444748] hover:text-[#173F3A] transition-colors py-1 font-medium"
            >
              Koordinator
            </Link>
            <Link
              href="/tutor"
              className="text-[0.875rem] text-[#444748] hover:text-[#173F3A] transition-colors py-1 font-medium"
            >
              Area Tutor
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-[0.875rem] font-medium text-[#444748] hover:text-[#173F3A] transition-colors px-2 py-1"
            >
              Masuk
            </Link>
            <a
              href="https://wa.me/6281377889900?text=Halo%20Gen%20Plasma%2C%20saya%20ingin%20konsultasi%20pemilihan%20pengajar"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center bg-[#B74E2C] text-white text-[0.875rem] font-semibold px-5 py-2.5 rounded-full hover:bg-[#9c3e20] transition-colors shadow-[0_2px_8px_rgba(183,78,44,0.25)]"
            >
              Konsultasi Gratis
            </a>
            <Link
              href="/login"
              className="w-8 h-8 rounded-full bg-[#173F3A] flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
              title="Portal Masuk"
            >
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-20 bg-[#faf9f7]">
        <div className="flex flex-col w-full">
          {/* Top Editorial Header & Filters Section */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-12 flex flex-col items-center text-center">
            {/* Overline Metric Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2D5A8]/50 text-[#173F3A] text-[0.75rem] font-semibold border border-[#D88A32]/30 shadow-xs mb-6">
              <span className="inline-block w-2 h-2 rounded-full bg-[#B74E2C] animate-pulse"></span>
              <span>Kurasi Pengajar Terakreditasi 2025</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] text-[#173F3A] max-w-4xl tracking-tight leading-[1.1] mb-5 font-bold">
              Kenali pengajar yang membuat{" "}
              <span className="italic font-normal text-[#B74E2C]">keajaiban belajar</span> terjadi
            </h1>

            {/* Subtitle */}
            <p className="text-[1.125rem] text-[#444748] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Tim pendidik kuratorial lulusan almamater terkemuka, peraih medali olimpiade, dan
              mentor berdedikasi yang membimbing potensi setiap siswa dengan ketenangan dan ketepatan.
            </p>

            {/* Segmented Filter Bar */}
            <div className="w-full flex items-center justify-center overflow-x-auto no-scrollbar py-2">
              <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#eae6df] shadow-xs backdrop-blur-md max-w-full">
                {FILTER_ITEMS.map((item) => {
                  const isActive = activeFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveFilter(item.id)}
                      className={`px-4 py-2 rounded-full text-[0.875rem] transition-all duration-200 shrink-0 ${
                        isActive
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

          {/* 4-Column Portrait Cards Grid */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTutors.map((tutor) => (
                <article
                  key={tutor._id}
                  onClick={() => setModalTutor(tutor)}
                  className="group relative bg-white rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Photo Container 4/5 Aspect Ratio */}
                  <div className="relative w-full aspect-[4/5] bg-[#efeeec] overflow-hidden">
                    <img
                      src={tutor.foto}
                      alt={tutor.nama}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Star Rating Badge Top Right */}
                    <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-[#D88A32]/20">
                      <span
                        className="material-symbols-outlined text-[#D88A32] text-[15px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-[0.75rem] text-[#173F3A] font-bold">
                        {tutor.rating.toFixed(2)}
                      </span>
                    </div>

                    {/* Floating Pill Badge Nestled at Bottom */}
                    <div className="absolute inset-x-3 bottom-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-md text-center transition-transform duration-300 group-hover:-translate-y-1">
                      <h3 className="text-[0.875rem] text-[#1a1c1b] font-semibold truncate">
                        {tutor.nama}
                      </h3>
                      <p className="text-[0.8125rem] text-[#444748] truncate mt-0.5">
                        {tutor.jabatan}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Strip: School / Experience + Arrow Action */}
                  <div className="p-4 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-1.5 text-[#444748] text-[0.75rem]">
                      <span className="material-symbols-outlined text-[16px] text-black">
                        {tutor.iconType === "psychology" ? "psychology" : "school"}
                      </span>
                      <span>
                        {tutor.almamater} • {tutor.pengalaman}
                      </span>
                    </div>
                    <span className="text-[0.75rem] text-black group-hover:text-[#615e59] flex items-center gap-0.5 font-semibold transition-colors">
                      {tutor.ctaText || "Jadwal"}
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Centered Load More */}
            <div className="mt-14 flex flex-col items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadMoreState === "done"}
                className="inline-flex items-center gap-2 bg-white text-[#1a1c1b] hover:bg-[#e9e8e6] text-[0.875rem] font-semibold px-6 py-3 rounded-full shadow-xs hover:shadow-md transition-all disabled:opacity-75 disabled:pointer-events-none"
              >
                {loadMoreState === "idle" && (
                  <>
                    <span>Muat Lebih Banyak Pengajar</span>
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </>
                )}
                {loadMoreState === "loading" && (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    <span>Memuat Pengajar...</span>
                  </>
                )}
                {loadMoreState === "done" && (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    <span>Semua 48 Pengajar Ditampilkan</span>
                  </>
                )}
              </button>
              <p className="text-[0.8125rem] text-[#67645f]">
                Menampilkan {filteredTutors.length} dari 48 master tutor berlisensi
              </p>
            </div>
          </section>

          {/* High-End Value Strip / Minimalist Reassurance */}
          <section className="w-full bg-[#f4f3f1] py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div className="flex items-start gap-4 justify-center md:justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[0.875rem] text-[#1a1c1b] font-semibold">
                      100% Tutor Tersertifikasi
                    </h4>
                    <p className="text-[0.8125rem] text-[#444748] leading-relaxed">
                      Lulus seleksi ketat pedagogi, penguasaan materi, dan kepribadian empatik.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 justify-center md:justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[24px]">star</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[0.875rem] text-[#1a1c1b] font-semibold">
                      Rating Kepuasan 4.95 / 5.0
                    </h4>
                    <p className="text-[0.8125rem] text-[#444748] leading-relaxed">
                      Dinilai langsung oleh lebih dari 1.200 siswa dan orang tua dari seluruh
                      Indonesia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 justify-center md:justify-start">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[24px]">devices</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[0.875rem] text-[#1a1c1b] font-semibold">
                      Fleksibel &amp; Personal
                    </h4>
                    <p className="text-[0.8125rem] text-[#444748] leading-relaxed">
                      Tersedia sesi privat daring interaktif maupun tatap muka kuratorial di studio
                      kami.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Invitation Banner */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-16">
            <div className="relative overflow-hidden rounded-3xl bg-[#efeeec] p-8 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
              <div className="max-w-xl space-y-3 text-center lg:text-left">
                <span className="text-[0.75rem] text-[#67645f] tracking-wider uppercase font-semibold">
                  Bimbingan Yang Tepat Untuk Anda
                </span>
                <h3 className="font-serif text-[1.75rem] text-[#1a1c1b] leading-tight">
                  Bingung memilih pengajar yang paling cocok?
                </h3>
                <p className="text-[0.9375rem] text-[#444748] leading-relaxed">
                  Konselor akademik kami siap membantu memetakan gaya belajar dan kurikulum siswa
                  untuk mencocokkan tutor terbaik secara cuma-cuma.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <a
                  href="https://wa.me/6281377889900?text=Halo%20Lentera%20Belajar%2C%20saya%20ingin%20konsultasi%20penjurusan%20tutor"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center bg-black text-white text-[0.875rem] font-semibold px-6 py-3 rounded-full hover:bg-[#444748] transition-colors shadow-xs"
                >
                  Konsultasi Penjurusan Tutor
                </a>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center bg-white text-[#1a1c1b] text-[0.875rem] font-semibold px-6 py-3 rounded-full hover:bg-[#e9e8e6] transition-colors shadow-xs"
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
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-[#173F3A]/15">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Gen Plasma" className="w-8 h-8 object-contain" />
                <div className="flex flex-col">
                  <span className="font-serif text-[1.5rem] leading-none tracking-tight text-[#173F3A] font-bold">
                    Gen Plasma
                  </span>
                  <span className="text-[0.65rem] tracking-wider uppercase text-[#B74E2C] font-semibold">
                    Alur Selaras
                  </span>
                </div>
              </div>
              <p className="text-[0.8125rem] text-[#444748] max-w-sm leading-relaxed">
                Pendidikan kuratorial dan bimbingan terpadu yang dirancang dengan ketenangan,
                ketepatan, dan kehangatan manusiawi.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.75rem] text-[#444748]">
              <Link href="/" className="text-[#173F3A] font-semibold">
                Pengajar
              </Link>
              <Link href="/koordinator" className="hover:text-[#173F3A] transition-colors">
                Panel Koordinator
              </Link>
              <Link href="/tutor" className="hover:text-[#173F3A] transition-colors">
                Area Mandiri Tutor
              </Link>
              <Link href="/login" className="hover:text-[#173F3A] transition-colors">
                Portal Masuk
              </Link>
            </nav>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] text-[#67645f]">
            <p>© 2025 - 2026 Gen Plasma — Alur Selaras. Hak cipta dilindungi undang-undang.</p>
            <div className="flex items-center gap-6">
              <span>Jakarta • Yogyakarta • Bandung</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Detail / Jadwal Modal */}
      {modalTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#173F3A]/15 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="relative p-6 bg-[#faf8f5] border-b border-[#173F3A]/10 flex items-center gap-4">
              <img
                src={modalTutor.foto}
                alt={modalTutor.nama}
                className="w-16 h-20 rounded-2xl object-cover shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[#D88A32] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="text-[0.75rem] font-bold text-[#173F3A]">{modalTutor.rating.toFixed(2)}</span>
                  <span className="text-[0.75rem] text-[#67645f]">• {modalTutor.almamater}</span>
                </div>
                <h3 className="font-serif text-[1.35rem] font-bold text-[#173F3A] leading-tight truncate">
                  {modalTutor.nama}
                </h3>
                <p className="text-[0.8125rem] text-[#444748] mt-0.5">{modalTutor.jabatan}</p>
              </div>

              <button
                type="button"
                onClick={() => setModalTutor(null)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#444748] hover:text-[#173F3A] shadow-xs font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs text-[#444748]">
              {modalTutor.deskripsi && (
                <div>
                  <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#67645f] block mb-1">
                    Profil Akademik &amp; Pendekatan
                  </span>
                  <p className="text-[#173F3A] bg-[#faf8f5] border border-[#173F3A]/10 p-3.5 rounded-2xl leading-relaxed italic">
                    &quot;{modalTutor.deskripsi}&quot;
                  </p>
                </div>
              )}

              <div>
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#67645f] block mb-1.5">
                  Hari &amp; Jam Ketersediaan Mengajar
                </span>
                <div className="flex flex-wrap gap-2">
                  {(modalTutor.jadwal && modalTutor.jadwal.length > 0
                    ? modalTutor.jadwal
                    : ["Senin: 16:00 - 18:00 WIB", "Rabu: 16:00 - 18:00 WIB", "Jumat: 16:00 - 18:00 WIB"]
                  ).map((slot, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F2D5A8]/40 rounded-full border border-[#D88A32]/30 text-[0.8125rem]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B74E2C]"></span>
                      <span className="font-semibold text-[#173F3A]">{slot}</span>
                      <span className="text-[0.6875rem] text-[#173F3A] font-medium ml-1">
                        Tersedia
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#173F3A]/10 flex items-center justify-between text-[0.75rem]">
                <span className="text-[#67645f]">Konsultasi Penjadwalan:</span>
                <span className="font-semibold text-[#173F3A]">WhatsApp Langsung</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f2efe9] border-t border-[#173F3A]/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalTutor(null)}
                className="px-4 py-2 text-[0.8125rem] font-semibold text-[#444748] hover:bg-[#eae6df] rounded-full transition-colors"
              >
                Tutup
              </button>
              <a
                href={`https://wa.me/${modalTutor.nomorTelepon.replace(/^0/, "62").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Halo ${modalTutor.nama}, saya melihat profil Anda di Gen Plasma dan ingin berkonsultasi mengenai bimbingan belajar.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#173F3A] hover:bg-[#112F2B] text-white text-[0.8125rem] font-semibold px-5 py-2.5 rounded-full transition-colors shadow-xs"
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
