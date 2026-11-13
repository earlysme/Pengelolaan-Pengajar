"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Catatan {
  _id: string;
  mapel: string;
  jenjang: string;
  tanggal: string;
  materi: string;
  catatan?: string;
  rencanaBerikutnya?: string;
  tutorId: string;
  tutorNama: string;
}

interface Props {
  /** Dari data tutor yang login (currentTutor.mataPelajaran / .jenjang / ._id) */
  mataPelajaran: string[];
  jenjang: string[];
  tutorId: string;
  /** Fungsi yang sama dengan di page.tsx tutor (Bearer token dari localStorage) */
  getAuthHeader: () => Record<string, string>;
  showToast: (pesan: string) => void;
}

const labelMapel = (nama: string) => nama.replace(/\s*\/?\s*utbk/gi, "").trim();

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const hariIni = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const fieldWrap =
  "bg-[#f4f3f1] rounded-xl px-3.5 py-3 focus-within:bg-[#efeeec] transition-colors";
const fieldInput =
  "w-full bg-transparent outline-none text-[0.875rem] text-[#1a1c1b] placeholder:text-[#67645f]/70";

export default function CatatanMateriTab({
  mataPelajaran,
  jenjang,
  tutorId,
  getAuthHeader,
  showToast,
}: Props) {
  // getAuthHeader di page.tsx dibuat ulang tiap render; simpan di ref agar tidak memicu fetch berulang.
  const authRef = useRef(getAuthHeader);
  authRef.current = getAuthHeader;

  const [mapel, setMapel] = useState(mataPelajaran[0] ?? "");
  const [jenjangDipilih, setJenjangDipilih] = useState(jenjang[0] ?? "");
  const [daftar, setDaftar] = useState<Catatan[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMuat, setErrorMuat] = useState("");

  const [tanggal, setTanggal] = useState(hariIni());
  const [materi, setMateri] = useState("");
  const [catatan, setCatatan] = useState("");
  const [rencana, setRencana] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  const muat = useCallback(async () => {
    if (!mapel || !jenjangDipilih) return;
    setLoading(true);
    setErrorMuat("");
    try {
      const qs = new URLSearchParams({ mapel, jenjang: jenjangDipilih });
      const res = await fetch(`/api/catatan-materi?${qs}`, {
        headers: authRef.current(),
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal memuat catatan.");
      setDaftar(json.data);
    } catch (e) {
      setDaftar([]);
      setErrorMuat(e instanceof Error ? e.message : "Gagal memuat catatan.");
    } finally {
      setLoading(false);
    }
  }, [mapel, jenjangDipilih]);

  useEffect(() => {
    muat();
  }, [muat]);

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materi.trim()) {
      showToast("Isi materi yang dibahas dulu.");
      return;
    }
    setMenyimpan(true);
    try {
      const res = await fetch("/api/catatan-materi", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authRef.current() },
        credentials: "include",
        body: JSON.stringify({
          mapel,
          jenjang: jenjangDipilih,
          tanggal,
          materi,
          catatan,
          rencanaBerikutnya: rencana,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal menyimpan catatan.");
      setMateri("");
      setCatatan("");
      setRencana("");
      showToast("Catatan disimpan.");
      await muat();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menyimpan catatan.");
    } finally {
      setMenyimpan(false);
    }
  };

  const hapus = async (id: string) => {
    if (!window.confirm("Hapus catatan ini?")) return;
    try {
      const res = await fetch(`/api/catatan-materi/${id}`, {
        method: "DELETE",
        headers: authRef.current(),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Gagal menghapus catatan.");
      showToast("Catatan dihapus.");
      setDaftar((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal menghapus catatan.");
    }
  };

  const terakhir = daftar[0];

  if (mataPelajaran.length === 0 || jenjang.length === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-[#173F3A]/10 text-center">
        <p className="font-serif text-[1.25rem] text-[#1a1c1b]">Belum ada kelas untuk dicatat</p>
        <p className="text-[0.8125rem] text-[#444748] mt-1">
          Lengkapi mata pelajaran dan jenjang di profil, lalu kembali ke sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Pemilih kelas */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-[#173F3A]/10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="max-w-xl">
          <h2 className="font-serif text-[1.35rem] sm:text-[1.5rem] text-[#1a1c1b]">
            Catatan materi kelas reguler
          </h2>
          <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#444748] mt-1 leading-relaxed">
            Catatan ini milik kelasnya, bukan milik satu tutor. Tutor yang mengajar berikutnya bisa
            langsung melanjutkan dari catatan terakhir.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[22rem]">
          <label className="space-y-1.5">
            <span className="text-[0.75rem] text-[#444748]">Mata pelajaran</span>
            <div className={fieldWrap}>
              <select
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                className={`${fieldInput} cursor-pointer`}
              >
                {mataPelajaran.map((m) => (
                  <option key={m} value={m}>
                    {labelMapel(m)}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="space-y-1.5">
            <span className="text-[0.75rem] text-[#444748]">Jenjang</span>
            <div className={fieldWrap}>
              <select
                value={jenjangDipilih}
                onChange={(e) => setJenjangDipilih(e.target.value)}
                className={`${fieldInput} cursor-pointer`}
              >
                {jenjang.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
      </div>

      {/* Posisi terakhir kelas: ini yang paling dibutuhkan tutor sebelum masuk kelas */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#173F3A] text-white p-5 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#F2D5A8]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          {loading ? (
            <p className="text-[0.875rem] text-white/80">Memuat catatan...</p>
          ) : terakhir ? (
            <>
              <p className="text-[0.8125rem] text-[#F2D5A8]">
                Terakhir dibahas, {formatTanggal(terakhir.tanggal)} oleh {terakhir.tutorNama}
              </p>
              <p className="font-serif text-[1.5rem] sm:text-[2rem] leading-tight mt-1.5">
                {terakhir.materi}
              </p>
              {terakhir.rencanaBerikutnya && (
                <p className="text-[0.875rem] sm:text-[0.9375rem] text-white/85 mt-3 leading-relaxed max-w-2xl">
                  <span className="text-[#F2D5A8] font-semibold">Rencana pertemuan berikutnya: </span>
                  {terakhir.rencanaBerikutnya}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-serif text-[1.35rem] sm:text-[1.75rem] leading-tight">
                Belum ada catatan untuk {labelMapel(mapel)} {jenjangDipilih}
              </p>
              <p className="text-[0.875rem] text-white/80 mt-2 max-w-xl leading-relaxed">
                Tulis catatan pertama setelah mengajar. Itu akan jadi patokan bagi tutor yang masuk
                kelas ini berikutnya.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Form tambah catatan (di mobile tampil lebih dulu) */}
        <form
          onSubmit={simpan}
          className="lg:col-span-5 lg:order-last lg:sticky lg:top-28 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-[#173F3A]/10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4"
        >
          <div>
            <h3 className="font-serif text-[1.2rem] text-[#1a1c1b]">Tambah catatan</h3>
            <p className="text-[0.75rem] text-[#444748] mt-0.5">
              Untuk {labelMapel(mapel)} {jenjangDipilih}, program reguler.
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[0.75rem] text-[#444748]">Tanggal mengajar</span>
            <div className={fieldWrap}>
              <input
                type="date"
                value={tanggal}
                max={hariIni()}
                onChange={(e) => setTanggal(e.target.value)}
                className={fieldInput}
                required
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[0.75rem] text-[#444748]">Materi yang dibahas</span>
            <div className={fieldWrap}>
              <input
                type="text"
                value={materi}
                maxLength={200}
                onChange={(e) => setMateri(e.target.value)}
                placeholder="Contoh: Trigonometri, identitas sudut"
                className={fieldInput}
                required
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="flex items-center justify-between text-[0.75rem] text-[#444748]">
              <span>Catatan kelas</span>
              <span className="text-[#67645f]">{catatan.length} / 1000</span>
            </span>
            <div className={fieldWrap}>
              <textarea
                rows={3}
                value={catatan}
                maxLength={1000}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Bagian yang sudah dipahami dan yang perlu diulang"
                className={`${fieldInput} resize-none`}
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[0.75rem] text-[#444748]">Rencana pertemuan berikutnya</span>
            <div className={fieldWrap}>
              <textarea
                rows={2}
                value={rencana}
                maxLength={500}
                onChange={(e) => setRencana(e.target.value)}
                placeholder="Lanjut ke bab apa, atau apa yang perlu diulang"
                className={`${fieldInput} resize-none`}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={menyimpan}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#173F3A] text-white text-[0.875rem] font-semibold px-7 py-3 rounded-full hover:bg-[#112F2B] transition-all shadow-[0_4px_16px_rgba(23,63,58,0.2)] disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>{menyimpan ? "Menyimpan..." : "Simpan catatan"}</span>
          </button>
        </form>

        {/* Riwayat catatan */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="font-serif text-[1.2rem] text-[#1a1c1b]">Riwayat pertemuan</h3>

          {errorMuat && (
            <p className="text-[0.8125rem] text-[#ba1a1a] bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {errorMuat}
            </p>
          )}

          {!loading && !errorMuat && daftar.length === 0 && (
            <p className="text-[0.8125rem] text-[#444748] bg-white border border-dashed border-[#173F3A]/20 rounded-2xl px-5 py-8 text-center">
              Belum ada riwayat. Catatan yang kamu simpan akan muncul di sini.
            </p>
          )}

          <ul className="space-y-3">
            {daftar.map((c) => (
              <li
                key={c._id}
                className="bg-white border border-[#173F3A]/10 rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(23,63,58,0.03)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.75rem] text-[#67645f]">
                      {formatTanggal(c.tanggal)}, {c.tutorNama}
                    </p>
                    <p className="font-serif text-[1.15rem] text-[#1a1c1b] leading-snug mt-0.5">
                      {c.materi}
                    </p>
                  </div>
                  {String(c.tutorId) === String(tutorId) && (
                    <button
                      type="button"
                      onClick={() => hapus(c._id)}
                      title="Hapus catatan"
                      className="shrink-0 p-1.5 rounded-full text-[#67645f] hover:text-[#ba1a1a] hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
                {c.catatan && (
                  <p className="text-[0.8125rem] sm:text-[0.875rem] text-[#444748] leading-relaxed mt-2 whitespace-pre-line">
                    {c.catatan}
                  </p>
                )}
                {c.rencanaBerikutnya && (
                  <p className="text-[0.8125rem] text-[#173F3A] mt-2 pt-2 border-t border-[#efeeec] leading-relaxed">
                    <span className="font-semibold">Berikutnya: </span>
                    {c.rencanaBerikutnya}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
