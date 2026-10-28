"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PengajarData {
  _id: string;
  nama: string;
  nomorTelepon: string;
  foto?: string;
  deskripsi?: string;
  pendidikan?: string;
  mataPelajaran: string[];
  jenjang: string[];
  status: string;
}

interface JadwalData {
  _id: string;
  namaKelas: string;
  mataPelajaran: string;
  jenjang: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
  moda: string;
  jumlahSiswa: number;
}

interface SesiData {
  _id: string;
  namaKelas: string;
  mataPelajaran: string;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  statusKehadiran: string;
  materiAjar: string;
  statusVerifikasi: string;
  catatanVerifikasi?: string;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
];

const DAFTAR_HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function AreaTutor() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profil" | "ketersediaan" | "jadwal" | "bap">("profil");
  const [tutors, setTutors] = useState<PengajarData[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [loading, setLoading] = useState(true);

  // Tab 1: Form Profil
  const [foto, setFoto] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [pendidikan, setPendidikan] = useState("");
  const [savingProfil, setSavingProfil] = useState(false);
  const [profilMsg, setProfilMsg] = useState("");

  // Tab 2: Ketersediaan
  const [slots, setSlots] = useState<
    { hari: string; jamMulai: string; jamSelesai: string; moda: "Online" | "Offline" | "Fleksibel" }[]
  >([
    { hari: "Senin", jamMulai: "16:00", jamSelesai: "18:00", moda: "Offline" },
    { hari: "Rabu", jamMulai: "18:30", jamSelesai: "20:30", moda: "Offline" },
  ]);
  const [statusKonfirmasi, setStatusKonfirmasi] = useState("Menunggu Pemeriksaan");
  const [catatanKoordinator, setCatatanKoordinator] = useState("");
  const [savingKetersediaan, setSavingKetersediaan] = useState(false);
  const [ketersediaanMsg, setKetersediaanMsg] = useState("");

  // Tab 3: Jadwal Tugas
  const [jadwalSaya, setJadwalSaya] = useState<JadwalData[]>([]);

  // Tab 4: Presensi & BAP
  const [sesiSaya, setSesiSaya] = useState<SesiData[]>([]);
  const [bapKelas, setBapKelas] = useState("");
  const [bapMapel, setBapMapel] = useState("");
  const [bapTanggal, setBapTanggal] = useState("");
  const [bapMulai, setBapMulai] = useState("16:00");
  const [bapSelesai, setBapSelesai] = useState("18:00");
  const [bapStatusHadir, setBapStatusHadir] = useState<"Hadir" | "Terlambat" | "Izin">("Hadir");
  const [bapMateri, setBapMateri] = useState("");
  const [bapCapaian, setBapCapaian] = useState("");
  const [bapKendala, setBapKendala] = useState("");
  const [bapBukti, setBapBukti] = useState("");
  const [submittingBap, setSubmittingBap] = useState(false);
  const [bapMsg, setBapMsg] = useState("");

  useEffect(() => {
    setBapTanggal(new Date().toISOString().split("T")[0]);
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pengajar");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setTutors(json.data);
        const savedTutorId = localStorage.getItem("tutorId");
        const found = json.data.find((t: PengajarData) => t._id === savedTutorId);
        if (found) {
          handleSelectTutor(found);
        } else {
          handleSelectTutor(json.data[0]);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTutor = async (t: PengajarData) => {
    setSelectedTutorId(t._id);
    setFoto(t.foto || PRESET_AVATARS[0]);
    setDeskripsi(t.deskripsi || "");
    setPendidikan(t.pendidikan || "");
    setProfilMsg("");
    setKetersediaanMsg("");
    setBapMsg("");

    // Load Ketersediaan
    try {
      const resK = await fetch(`/api/ketersediaan?pengajarId=${t._id}`);
      const jsonK = await resK.json();
      if (jsonK.success && jsonK.data.length > 0) {
        const item = jsonK.data[0];
        setSlots(item.slots || []);
        setStatusKonfirmasi(item.statusKonfirmasi || "Menunggu Pemeriksaan");
        setCatatanKoordinator(item.catatanKoordinator || "");
      }
    } catch {
      // Ignore
    }

    // Load Jadwal
    try {
      const resJ = await fetch(`/api/jadwal?pengajarId=${t._id}`);
      const jsonJ = await resJ.json();
      if (jsonJ.success) {
        setJadwalSaya(jsonJ.data);
        if (jsonJ.data.length > 0) {
          setBapKelas(jsonJ.data[0].namaKelas);
          setBapMapel(jsonJ.data[0].mataPelajaran);
        } else {
          setBapKelas(`Kelas ${t.mataPelajaran[0] || "Reguler"}`);
          setBapMapel(t.mataPelajaran[0] || "Umum");
        }
      }
    } catch {
      // Ignore
    }

    // Load Sesi
    try {
      const resS = await fetch(`/api/sesi?pengajarId=${t._id}`);
      const jsonS = await resS.json();
      if (jsonS.success) {
        setSesiSaya(jsonS.data);
      }
    } catch {
      // Ignore
    }
  };

  const currentTutor = tutors.find((t) => t._id === selectedTutorId);

  // Simpan Profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorId) return;

    try {
      setSavingProfil(true);
      setProfilMsg("");
      const res = await fetch(`/api/pengajar/${selectedTutorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto, deskripsi, pendidikan }),
      });
      const json = await res.json();
      if (json.success) {
        setProfilMsg("Profil berhasil disimpan dan diperbarui di katalog publik.");
      } else {
        setProfilMsg("Gagal menyimpan profil.");
      }
    } catch {
      setProfilMsg("Kendala koneksi.");
    } finally {
      setSavingProfil(false);
    }
  };

  // Simpan Ketersediaan
  const handleSaveKetersediaan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTutor) return;

    try {
      setSavingKetersediaan(true);
      setKetersediaanMsg("");
      const res = await fetch("/api/ketersediaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pengajarId: currentTutor._id,
          namaPengajar: currentTutor.nama,
          nomorTelepon: currentTutor.nomorTelepon,
          periode: "Semester Ganjil 2026/2027",
          slots,
          statusKonfirmasi: "Menunggu Pemeriksaan",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusKonfirmasi("Menunggu Pemeriksaan");
        setKetersediaanMsg("Ketersediaan berhasil dikirimkan ke koordinator untuk diverifikasi.");
      } else {
        setKetersediaanMsg("Gagal menyimpan ketersediaan.");
      }
    } catch {
      setKetersediaanMsg("Kendala koneksi.");
    } finally {
      setSavingKetersediaan(false);
    }
  };

  // Kirim BAP / Laporan Sesi
  const handleSubmitBAP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTutor || !bapMateri.trim()) {
      setBapMsg("Materi pembelajaran wajib diisi.");
      return;
    }

    try {
      setSubmittingBap(true);
      setBapMsg("");
      const payload = {
        pengajarId: currentTutor._id,
        namaPengajar: currentTutor.nama,
        nomorTeleponPengajar: currentTutor.nomorTelepon,
        namaKelas: bapKelas,
        mataPelajaran: bapMapel,
        tanggal: bapTanggal,
        waktuMulai: bapMulai,
        waktuSelesai: bapSelesai,
        durasiJam: 2,
        statusKehadiran: bapStatusHadir,
        materiAjar: bapMateri.trim(),
        capaianSiswa: bapCapaian.trim() || undefined,
        kendala: bapKendala.trim() || undefined,
        buktiFoto: bapBukti.trim() || undefined,
        honorPerSesi: 150000,
      };

      const res = await fetch("/api/sesi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setBapMsg("Berita Acara Pembelajaran (BAP) berhasil dikirim untuk diverifikasi!");
        setBapMateri("");
        setBapCapaian("");
        setBapKendala("");
        setBapBukti("");
        // Reload list sesi
        const resS = await fetch(`/api/sesi?pengajarId=${currentTutor._id}`);
        const jsonS = await resS.json();
        if (jsonS.success) setSesiSaya(jsonS.data);
      } else {
        setBapMsg(json.error || "Gagal mengirim BAP.");
      }
    } catch {
      setBapMsg("Kendala koneksi.");
    } finally {
      setSubmittingBap(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("tutorId");
    localStorage.removeItem("userName");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              L
            </span>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-none">
                Lentera Belajar
              </span>
              <span className="text-[11px] text-slate-500">Area Mandiri Tutor</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Lihat Publik
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabs Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Memuat area tutor...</div>
        ) : tutors.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <p className="font-semibold text-slate-800">Belum ada akun pengajar terdaftar.</p>
            <Link
              href="/koordinator"
              className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Buka Panel Pengelola
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Profil Aktif Selector Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={foto || PRESET_AVATARS[0]}
                  alt="Tutor"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-50"
                />
                <div>
                  <h1 className="font-bold text-slate-900 text-base">{currentTutor?.nama}</h1>
                  <p className="text-xs text-blue-600 font-medium">
                    {currentTutor?.mataPelajaran.join(", ")} • WA: {currentTutor?.nomorTelepon}
                  </p>
                </div>
              </div>

              {/* Selector Akun jika ingin ganti akun simulasi */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Akun:</span>
                <select
                  value={selectedTutorId}
                  onChange={(e) => {
                    const found = tutors.find((t) => t._id === e.target.value);
                    if (found) handleSelectTutor(found);
                  }}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium"
                >
                  {tutors.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Navigation Tabs Tutor */}
            <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("profil")}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === "profil"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                01. Profil Publik Saya
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ketersediaan")}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "ketersediaan"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>02. Ketersediaan Waktu</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
                  {statusKonfirmasi}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("jadwal")}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "jadwal"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>03. Jadwal Tugas Resmi</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
                  {jadwalSaya.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bap")}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === "bap"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>04. Presensi &amp; Berita Acara (BAP)</span>
              </button>
            </div>

            {/* TAB 1: EDIT PROFIL */}
            {activeTab === "profil" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                {profilMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                    {profilMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilihan Avatar Foto Profil:
                    </label>
                    <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                      {PRESET_AVATARS.map((avatarUrl, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setFoto(avatarUrl)}
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 shrink-0 ${
                            foto === avatarUrl
                              ? "border-blue-600 ring-2 ring-blue-200"
                              : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={avatarUrl}
                            alt={`Avatar ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <input
                      type="url"
                      placeholder="Atau masukkan URL foto khusus..."
                      value={foto}
                      onChange={(e) => setFoto(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Latar Belakang Pendidikan / Gelar / Almamater
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: S1 Pendidikan Fisika UI"
                      value={pendidikan}
                      onChange={(e) => setPendidikan(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deskripsi Pengantar Mengajar (Tampil di Katalog Publik)
                    </label>
                    <textarea
                      rows={4}
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingProfil}
                      className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      {savingProfil ? "Menyimpan..." : "Simpan Profil Saya"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: KETERSEDIAAN WAKTU (MODUL 2) */}
            {activeTab === "ketersediaan" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div>
                  <h2 className="font-bold text-sm text-slate-900">
                    Formulir Ketersediaan Mengajar Mandiri
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tentukan slot hari dan jam Anda yang lowong untuk periode semester ini agar dapat
                    dijadwalkan oleh koordinator.
                  </p>
                </div>

                {ketersediaanMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                    {ketersediaanMsg}
                  </div>
                )}

                {catatanKoordinator && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium">
                    Pesan Koordinator: {catatanKoordinator}
                  </div>
                )}

                <form onSubmit={handleSaveKetersediaan} className="space-y-4">
                  <div className="space-y-3">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs"
                      >
                        <div className="w-28">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Hari
                          </label>
                          <select
                            value={slot.hari}
                            onChange={(e) => {
                              const newSlots = [...slots];
                              newSlots[idx].hari = e.target.value;
                              setSlots(newSlots);
                            }}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          >
                            {DAFTAR_HARI.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Jam Mulai
                          </label>
                          <input
                            type="time"
                            value={slot.jamMulai}
                            onChange={(e) => {
                              const newSlots = [...slots];
                              newSlots[idx].jamMulai = e.target.value;
                              setSlots(newSlots);
                            }}
                            className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Jam Selesai
                          </label>
                          <input
                            type="time"
                            value={slot.jamSelesai}
                            onChange={(e) => {
                              const newSlots = [...slots];
                              newSlots[idx].jamSelesai = e.target.value;
                              setSlots(newSlots);
                            }}
                            className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white font-mono"
                          />
                        </div>

                        <div className="w-28">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Moda
                          </label>
                          <select
                            value={slot.moda}
                            onChange={(e) => {
                              const newSlots = [...slots];
                              newSlots[idx].moda = e.target.value as "Online" | "Offline" | "Fleksibel";
                              setSlots(newSlots);
                            }}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          >
                            <option value="Offline">Offline</option>
                            <option value="Online">Online</option>
                            <option value="Fleksibel">Fleksibel</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSlots(slots.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold self-end pb-1.5"
                        >
                          Hapus Slot
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSlots([
                        ...slots,
                        { hari: "Senin", jamMulai: "16:00", jamSelesai: "18:00", moda: "Offline" },
                      ])
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    + Tambah Slot Hari Lain
                  </button>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={savingKetersediaan}
                      className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs disabled:opacity-50"
                    >
                      {savingKetersediaan ? "Mengirim..." : "Kirim Ketersediaan ke Koordinator"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: JADWAL RESMI SAYA (MODUL 3) */}
            {activeTab === "jadwal" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h2 className="font-bold text-sm text-slate-900">
                    Jadwal Penugasan Resmi Mengajar
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daftar kelas yang resmi ditugaskan kepada Anda oleh koordinator bimbel.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jadwalSaya.length === 0 ? (
                    <div className="col-span-2 py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                      Belum ada jadwal kelas yang ditugaskan kepada Anda.
                    </div>
                  ) : (
                    jadwalSaya.map((j) => (
                      <div
                        key={j._id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">{j.namaKelas}</h3>
                            <p className="text-blue-600 font-semibold text-xs mt-0.5">
                              {j.mataPelajaran} ({j.jenjang})
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                            {j.moda}
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-600 pt-1 border-t border-slate-200/60">
                          <p>
                            Waktu: <strong className="text-slate-800">{j.hari}</strong>,{" "}
                            <span className="font-mono">{j.jamMulai} - {j.jamSelesai}</span>
                          </p>
                          <p>
                            Ruangan / Akses:{" "}
                            <strong className="text-slate-800">{j.ruangan}</strong>
                          </p>
                          <p>Kapasitas Siswa: {j.jumlahSiswa} Siswa Terdaftar</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: PRESENSI & BAP (MODUL 4) */}
            {activeTab === "bap" && (
              <div className="space-y-5">
                {/* Form Input BAP */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">
                      Input Presensi &amp; Berita Acara Pembelajaran (BAP)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Catat materi riil yang diajarkan hari ini, presensi, capaian siswa, dan bukti sesi.
                    </p>
                  </div>

                  {bapMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                      {bapMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmitBAP} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Nama Kelas
                        </label>
                        <input
                          type="text"
                          required
                          value={bapKelas}
                          onChange={(e) => setBapKelas(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Mata Pelajaran
                        </label>
                        <input
                          type="text"
                          required
                          value={bapMapel}
                          onChange={(e) => setBapMapel(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Tanggal Sesi
                        </label>
                        <input
                          type="date"
                          required
                          value={bapTanggal}
                          onChange={(e) => setBapTanggal(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Waktu Mulai
                        </label>
                        <input
                          type="time"
                          required
                          value={bapMulai}
                          onChange={(e) => setBapMulai(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Waktu Selesai
                        </label>
                        <input
                          type="time"
                          required
                          value={bapSelesai}
                          onChange={(e) => setBapSelesai(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Status Kehadiran
                        </label>
                        <select
                          value={bapStatusHadir}
                          onChange={(e) =>
                            setBapStatusHadir(e.target.value as "Hadir" | "Terlambat" | "Izin")
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        >
                          <option value="Hadir">Hadir Tepat Waktu</option>
                          <option value="Terlambat">Hadir Terlambat</option>
                          <option value="Izin">Izin / Sakit</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Ringkasan Materi Ajar (BAP) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Contoh: Pembahasan Soal HOTS Dinamika Partikel & Gerak Melingkar Beraturan..."
                        value={bapMateri}
                        onChange={(e) => setBapMateri(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Capaian / Pemahaman Siswa
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Siswa tuntas 90% latihan soal mandiri"
                          value={bapCapaian}
                          onChange={(e) => setBapCapaian(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Kendala Lapangan (Jika Ada)
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: 1 siswa izin, proyektor sempat mati 5 menit"
                          value={bapKendala}
                          onChange={(e) => setBapKendala(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Link / URL Bukti Foto Presensi
                      </label>
                      <input
                        type="url"
                        placeholder="https://... Link Google Drive atau foto presensi kelas"
                        value={bapBukti}
                        onChange={(e) => setBapBukti(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submittingBap}
                        className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs disabled:opacity-50"
                      >
                        {submittingBap ? "Mengirim Laporan..." : "Kirim Berita Acara Sesi (BAP)"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Riwayat Sesi Saya */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <h3 className="font-bold text-sm text-slate-900">
                    Riwayat Laporan Sesi Pembelajaran Saya
                  </h3>
                  <div className="space-y-2">
                    {sesiSaya.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        Belum ada laporan sesi yang dikirimkan.
                      </p>
                    ) : (
                      sesiSaya.map((s) => (
                        <div
                          key={s._id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{s.namaKelas}</span>
                            <span className="text-slate-400 mx-1.5">•</span>
                            <span className="text-slate-600">{s.tanggal} ({s.waktuMulai} - {s.waktuSelesai})</span>
                            <p className="text-slate-700 mt-1">{s.materiAjar}</p>
                            {s.catatanVerifikasi && (
                              <p className="text-red-700 text-[11px] mt-1 font-medium">
                                Catatan Koordinator: {s.catatanVerifikasi}
                              </p>
                            )}
                          </div>

                          <span
                            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                              s.statusVerifikasi === "Terverifikasi"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : s.statusVerifikasi === "Menunggu Verifikasi"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-red-50 text-red-800 border-red-200"
                            }`}
                          >
                            {s.statusVerifikasi}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
