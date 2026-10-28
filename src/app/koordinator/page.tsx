"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TabModul = "pengajar" | "ketersediaan" | "jadwal" | "pemantauan" | "verifikasi" | "honor";

interface PengajarData {
  _id: string;
  nama: string;
  nomorTelepon: string;
  email?: string;
  alamat?: string;
  foto?: string;
  deskripsi?: string;
  status: "Aktif" | "Cuti" | "Nonaktif";
  mataPelajaran: string[];
  jenjang: string[];
  jenisKelas: string[];
  dokumenStatus?: string;
  catatanInternal?: string;
}

interface KetersediaanData {
  _id: string;
  pengajarId: string;
  namaPengajar: string;
  nomorTelepon: string;
  periode: string;
  statusKonfirmasi: "Belum Diisi" | "Menunggu Pemeriksaan" | "Terkonfirmasi" | "Perlu Diperbarui";
  catatanKoordinator?: string;
  slots: {
    hari: string;
    jamMulai: string;
    jamSelesai: string;
    moda: "Online" | "Offline" | "Fleksibel";
    catatan?: string;
  }[];
  tanggalKonfirmasi?: string;
}

interface JadwalData {
  _id: string;
  namaKelas: string;
  mataPelajaran: string;
  jenjang: string;
  pengajarId: string;
  namaPengajar: string;
  nomorTeleponPengajar?: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
  moda: "Online" | "Offline";
  jumlahSiswa: number;
  status: "Terjadwal" | "Berjalan" | "Selesai" | "Dibatalkan";
}

interface SesiData {
  _id: string;
  pengajarId: string;
  namaPengajar: string;
  nomorTeleponPengajar?: string;
  namaKelas: string;
  mataPelajaran: string;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  durasiJam: number;
  statusKehadiran: "Hadir" | "Terlambat" | "Izin" | "Digantikan";
  materiAjar: string;
  capaianSiswa?: string;
  kendala?: string;
  buktiFoto?: string;
  statusVerifikasi: "Menunggu Verifikasi" | "Terverifikasi" | "Perlu Revisi";
  catatanVerifikasi?: string;
  honorPerSesi: number;
}

const DAFTAR_MAPEL = [
  "Matematika",
  "Fisika",
  "Kimia",
  "Biologi",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Ekonomi",
  "Geografi",
  "Sosiologi",
  "Sejarah",
  "TPS / UTBK",
];

const DAFTAR_JENJANG = ["SD", "SMP", "SMA", "UTBK/Kedinasan"];
const DAFTAR_KELAS = ["Reguler", "Privat", "Semi-Privat", "Online"];
const DAFTAR_HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function PanelKoordinator() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabModul>("pengajar");
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState("");

  // Modul 1: State Pengajar
  const [pengajarList, setPengajarList] = useState<PengajarData[]>([]);
  const [searchPengajar, setSearchPengajar] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isPengajarModalOpen, setIsPengajarModalOpen] = useState(false);
  const [isEditingPengajar, setIsEditingPengajar] = useState(false);
  const [currentPengajarId, setCurrentPengajarId] = useState<string | null>(null);

  // Form Pengajar
  const [formNama, setFormNama] = useState("");
  const [formTelepon, setFormTelepon] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"Aktif" | "Cuti" | "Nonaktif">("Aktif");
  const [formMapel, setFormMapel] = useState<string[]>([]);
  const [formJenjang, setFormJenjang] = useState<string[]>(["SMA"]);
  const [formJenisKelas, setFormJenisKelas] = useState<string[]>(["Reguler"]);
  const [formCatatan, setFormCatatan] = useState("");
  const [submittingPengajar, setSubmittingPengajar] = useState(false);
  const [errorPengajar, setErrorPengajar] = useState("");

  // Modul 2: State Ketersediaan
  const [ketersediaanList, setKetersediaanList] = useState<KetersediaanData[]>([]);
  const [ketersediaanFilter, setKetersediaanFilter] = useState("Semua");

  // Modul 3: State Jadwal Resmi
  const [jadwalList, setJadwalList] = useState<JadwalData[]>([]);
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false);
  const [jadwalNamaKelas, setJadwalNamaKelas] = useState("");
  const [jadwalMapel, setJadwalMapel] = useState("Matematika");
  const [jadwalJenjang, setJadwalJenjang] = useState("SMA");
  const [jadwalPengajarId, setJadwalPengajarId] = useState("");
  const [jadwalHari, setJadwalHari] = useState("Senin");
  const [jadwalMulai, setJadwalMulai] = useState("16:00");
  const [jadwalSelesai, setJadwalSelesai] = useState("18:00");
  const [jadwalRuangan, setJadwalRuangan] = useState("Ruang A1");
  const [jadwalModa, setJadwalModa] = useState<"Online" | "Offline">("Offline");
  const [jadwalSiswa, setJadwalSiswa] = useState(15);
  const [submittingJadwal, setSubmittingJadwal] = useState(false);
  const [errorJadwal, setErrorJadwal] = useState("");

  // Modul 4 & 5: State Sesi & Verifikasi
  const [sesiList, setSesiList] = useState<SesiData[]>([]);
  const [verifikasiFilter, setVerifikasiFilter] = useState("Semua");
  const [verifikasiModalSesi, setVerifikasiModalSesi] = useState<SesiData | null>(null);
  const [catatanRevisi, setCatatanRevisi] = useState("");

  // Modul 6: Rekap Honor
  const [honorStats, setHonorStats] = useState({
    totalSesi: 0,
    terverifikasi: 0,
    totalHonor: 0,
    totalJam: 0,
  });

  // Fetch data sesuai tab
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setDbError("");

      // Fetch Pengajar
      const resP = await fetch("/api/pengajar");
      const jsonP = await resP.json();
      if (jsonP.success) {
        setPengajarList(jsonP.data);
      }

      // Fetch Ketersediaan
      const resK = await fetch("/api/ketersediaan");
      const jsonK = await resK.json();
      if (jsonK.success) {
        setKetersediaanList(jsonK.data);
      }

      // Fetch Jadwal
      const resJ = await fetch("/api/jadwal");
      const jsonJ = await resJ.json();
      if (jsonJ.success) {
        setJadwalList(jsonJ.data);
      }

      // Fetch Sesi & BAP
      const resS = await fetch("/api/sesi");
      const jsonS = await resS.json();
      if (jsonS.success) {
        setSesiList(jsonS.data);
        if (jsonS.stats) {
          setHonorStats(jsonS.stats);
        }
      }
    } catch {
      setDbError("Tidak dapat terhubung ke server database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Handlers Modul 1 (Pengajar) ---
  const handleOpenAddPengajar = () => {
    setIsEditingPengajar(false);
    setCurrentPengajarId(null);
    setFormNama("");
    setFormTelepon("");
    setFormEmail("");
    setFormStatus("Aktif");
    setFormMapel(["Matematika"]);
    setFormJenjang(["SMA"]);
    setFormJenisKelas(["Reguler"]);
    setFormCatatan("");
    setErrorPengajar("");
    setIsPengajarModalOpen(true);
  };

  const handleOpenEditPengajar = (p: PengajarData) => {
    setIsEditingPengajar(true);
    setCurrentPengajarId(p._id);
    setFormNama(p.nama);
    setFormTelepon(p.nomorTelepon);
    setFormEmail(p.email || "");
    setFormStatus(p.status);
    setFormMapel(p.mataPelajaran || []);
    setFormJenjang(p.jenjang || ["SMA"]);
    setFormJenisKelas(p.jenisKelas || ["Reguler"]);
    setFormCatatan(p.catatanInternal || "");
    setErrorPengajar("");
    setIsPengajarModalOpen(true);
  };

  const handleSubmitPengajar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formTelepon.trim()) {
      setErrorPengajar("Nama dan nomor WhatsApp wajib diisi.");
      return;
    }
    if (formMapel.length === 0) {
      setErrorPengajar("Pilih minimal 1 mata pelajaran.");
      return;
    }

    try {
      setSubmittingPengajar(true);
      setErrorPengajar("");
      const payload = {
        nama: formNama.trim(),
        nomorTelepon: formTelepon.trim(),
        email: formEmail.trim() || undefined,
        status: formStatus,
        mataPelajaran: formMapel,
        jenjang: formJenjang,
        jenisKelas: formJenisKelas,
        catatanInternal: formCatatan.trim() || undefined,
      };

      const url = isEditingPengajar ? `/api/pengajar/${currentPengajarId}` : "/api/pengajar";
      const method = isEditingPengajar ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setIsPengajarModalOpen(false);
        fetchAllData();
      } else {
        setErrorPengajar(json.error || "Gagal menyimpan pengajar.");
      }
    } catch {
      setErrorPengajar("Kendala koneksi.");
    } finally {
      setSubmittingPengajar(false);
    }
  };

  const handleDeletePengajar = async (id: string, nama: string) => {
    if (!confirm(`Hapus pengajar: ${nama}?`)) return;
    try {
      const res = await fetch(`/api/pengajar/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchAllData();
      } else {
        alert(json.error || "Gagal menghapus.");
      }
    } catch {
      alert("Kesalahan koneksi.");
    }
  };

  // --- Handlers Modul 2 (Ketersediaan Approval) ---
  const handleUpdateStatusKetersediaan = async (
    id: string,
    statusKonfirmasi: "Terkonfirmasi" | "Perlu Diperbarui",
    catatan?: string
  ) => {
    try {
      const res = await fetch("/api/ketersediaan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statusKonfirmasi, catatanKoordinator: catatan }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAllData();
      } else {
        alert(json.error || "Gagal memperbarui status.");
      }
    } catch {
      alert("Kendala koneksi.");
    }
  };

  // --- Handlers Modul 3 (Jadwal Resmi) ---
  const handleOpenAddJadwal = () => {
    if (pengajarList.length === 0) {
      alert("Tambahkan pengajar terlebih dahulu.");
      return;
    }
    setJadwalNamaKelas("");
    setJadwalMapel("Matematika");
    setJadwalJenjang("SMA");
    setJadwalPengajarId(pengajarList[0]._id);
    setJadwalHari("Senin");
    setJadwalMulai("16:00");
    setJadwalSelesai("18:00");
    setJadwalRuangan("Ruang A1");
    setJadwalModa("Offline");
    setJadwalSiswa(15);
    setErrorJadwal("");
    setIsJadwalModalOpen(true);
  };

  const handleSubmitJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    const tutorSelected = pengajarList.find((p) => p._id === jadwalPengajarId);
    if (!tutorSelected) {
      setErrorJadwal("Pilih pengajar penanggung jawab.");
      return;
    }

    try {
      setSubmittingJadwal(true);
      setErrorJadwal("");

      const payload = {
        namaKelas: jadwalNamaKelas,
        mataPelajaran: jadwalMapel,
        jenjang: jadwalJenjang,
        pengajarId: tutorSelected._id,
        namaPengajar: tutorSelected.nama,
        nomorTeleponPengajar: tutorSelected.nomorTelepon,
        hari: jadwalHari,
        jamMulai: jadwalMulai,
        jamSelesai: jadwalSelesai,
        ruangan: jadwalRuangan,
        moda: jadwalModa,
        jumlahSiswa: Number(jadwalSiswa) || 15,
        status: "Terjadwal",
      };

      const res = await fetch("/api/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setIsJadwalModalOpen(false);
        fetchAllData();
      } else {
        setErrorJadwal(json.error || "Gagal menyimpan jadwal.");
      }
    } catch {
      setErrorJadwal("Kendala koneksi.");
    } finally {
      setSubmittingJadwal(false);
    }
  };

  const handleDeleteJadwal = async (id: string, namaKelas: string) => {
    if (!confirm(`Hapus jadwal untuk ${namaKelas}?`)) return;
    try {
      const res = await fetch(`/api/jadwal?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchAllData();
      } else {
        alert(json.error || "Gagal menghapus jadwal.");
      }
    } catch {
      alert("Kesalahan koneksi.");
    }
  };

  // --- Handlers Modul 5 (Verifikasi Sesi) ---
  const handleVerifikasiSesi = async (
    id: string,
    statusVerifikasi: "Terverifikasi" | "Perlu Revisi",
    catatan?: string
  ) => {
    try {
      const res = await fetch("/api/sesi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statusVerifikasi, catatanVerifikasi: catatan }),
      });
      const json = await res.json();
      if (json.success) {
        setVerifikasiModalSesi(null);
        setCatatanRevisi("");
        fetchAllData();
      } else {
        alert(json.error || "Gagal memperbarui status verifikasi.");
      }
    } catch {
      alert("Kendala koneksi.");
    }
  };

  // --- Seed Data Helper ---
  const handleSeedAll = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
      } else {
        alert(json.error || "Gagal seed data.");
      }
      fetchAllData();
    } catch {
      alert("Koneksi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    router.push("/");
  };

  // Filtered views
  const filteredPengajar = pengajarList.filter((p) => {
    if (statusFilter !== "Semua" && p.status !== statusFilter) return false;
    if (searchPengajar.trim()) {
      const q = searchPengajar.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.nomorTelepon.includes(q) ||
        p.mataPelajaran.some((m) => m.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredKetersediaan = ketersediaanList.filter((k) => {
    if (ketersediaanFilter !== "Semua" && k.statusKonfirmasi !== ketersediaanFilter) {
      return false;
    }
    return true;
  });

  const filteredSesi = sesiList.filter((s) => {
    if (verifikasiFilter !== "Semua" && s.statusVerifikasi !== verifikasiFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              L
            </span>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">
                Lentera Belajar
              </span>
              <span className="text-[11px] text-slate-500 leading-none">
                Panel Koordinator Pengajar
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSeedAll}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              Isi Data Demo
            </button>
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

      {/* 6-Module Tab Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 py-1.5 min-w-max">
          <button
            type="button"
            onClick={() => setActiveTab("pengajar")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "pengajar"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>01. Database Tutor</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/40 font-bold">
              {pengajarList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ketersediaan")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "ketersediaan"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>02. Ketersediaan</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
              {ketersediaanList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("jadwal")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "jadwal"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>03. Jadwal Resmi</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/40 font-bold">
              {jadwalList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pemantauan")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "pemantauan"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>04. Pemantauan Sesi</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {sesiList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verifikasi")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "verifikasi"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>05. Verifikasi BAP</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {sesiList.filter((s) => s.statusVerifikasi === "Menunggu Verifikasi").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("honor")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "honor"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>06. Rekap Honor</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {dbError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <p className="font-semibold text-sm">Pemberitahuan Koneksi</p>
            <p className="text-amber-800 mt-0.5">{dbError}</p>
          </div>
        )}

        {/* ========================================================
            TAB 01: DATABASE PENGAJAR (MODUL 1)
        ======================================================== */}
        {activeTab === "pengajar" && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari nama tutor, mapel, atau nomor WA..."
                  value={searchPengajar}
                  onChange={(e) => setSearchPengajar(e.target.value)}
                  className="w-full sm:max-w-xs px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 focus:bg-white"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium text-slate-700"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenAddPengajar}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                + Tambah Tutor Baru
              </button>
            </div>

            {/* Tabel Pengajar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Nama &amp; Kontak</th>
                      <th className="py-3 px-4">Mata Pelajaran</th>
                      <th className="py-3 px-4">Jenjang &amp; Kelas</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          Memuat data tutor...
                        </td>
                      </tr>
                    ) : filteredPengajar.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          Belum ada data pengajar yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredPengajar.map((p) => {
                        const waClean = p.nomorTelepon.replace(/^0/, "62").replace(/[^0-9]/g, "");
                        return (
                          <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    p.foto ||
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                                  }
                                  alt={p.nama}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                />
                                <div>
                                  <p className="font-semibold text-slate-900">{p.nama}</p>
                                  <a
                                    href={`https://wa.me/${waClean}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-emerald-700 hover:underline font-mono"
                                  >
                                    WA: {p.nomorTelepon}
                                  </a>
                                  {p.catatanInternal && (
                                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                                      Catatan: {p.catatanInternal}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {p.mataPelajaran.map((m, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-medium text-slate-800">
                                {p.jenjang?.join(", ") || "SMA"}
                              </span>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {p.jenisKelas?.join(", ") || "Reguler"}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${
                                  p.status === "Aktif"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : p.status === "Cuti"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditPengajar(p)}
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePengajar(p._id, p.nama)}
                                  className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 02: KETERSEDIAAN TUTOR (MODUL 2)
        ======================================================== */}
        {activeTab === "ketersediaan" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Pemantauan Ketersediaan Waktu Mengajar
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review slot waktu yang diajukan oleh tutor untuk periode berjalan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={ketersediaanFilter}
                  onChange={(e) => setKetersediaanFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium"
                >
                  <option value="Semua">Semua Status Konfirmasi</option>
                  <option value="Menunggu Pemeriksaan">Menunggu Pemeriksaan</option>
                  <option value="Terkonfirmasi">Terkonfirmasi</option>
                  <option value="Perlu Diperbarui">Perlu Diperbarui</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKetersediaan.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
                  Belum ada data ketersediaan yang sesuai.
                </div>
              ) : (
                filteredKetersediaan.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{item.namaPengajar}</h3>
                        <p className="text-xs text-slate-500 font-mono">WA: {item.nomorTelepon}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Periode: {item.periode}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.statusKonfirmasi === "Terkonfirmasi"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : item.statusKonfirmasi === "Menunggu Pemeriksaan"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-red-50 text-red-800 border-red-200"
                        }`}
                      >
                        {item.statusKonfirmasi}
                      </span>
                    </div>

                    {/* Daftar Slot Waktu */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Slot Waktu Siap Mengajar
                      </span>
                      {item.slots.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between font-medium text-slate-700"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            <span>
                              <strong>{s.hari}:</strong> {s.jamMulai} - {s.jamSelesai}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {s.moda}
                          </span>
                        </div>
                      ))}
                    </div>

                    {item.catatanKoordinator && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-100">
                        Catatan Koordinator: {item.catatanKoordinator}
                      </p>
                    )}

                    {/* Tombol Approval */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          const note = prompt(
                            "Masukkan catatan perbaikan untuk tutor:",
                            "Mohon sesuaikan kembali jam yang bentrok."
                          );
                          if (note !== null) {
                            handleUpdateStatusKetersediaan(item._id, "Perlu Diperbarui", note);
                          }
                        }}
                        className="px-3 py-1.5 font-semibold text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200 transition-colors"
                      >
                        Minta Perbarui
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatusKetersediaan(item._id, "Terkonfirmasi")
                        }
                        className="px-3.5 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                      >
                        Setujui Ketersediaan
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 03: JADWAL RESMI & KELAS (MODUL 3)
        ======================================================== */}
        {activeTab === "jadwal" && (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Sinkronisasi Jadwal Resmi Bimbel
                </h2>
                <p className="text-xs text-slate-500">
                  Jadwal definitif kelas, penugasan tutor, ruangan, dan deteksi bentrok.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddJadwal}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                + Terbitkan Jadwal Baru
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Kelas &amp; Mapel</th>
                      <th className="py-3 px-4">Tutor Penanggung Jawab</th>
                      <th className="py-3 px-4">Hari &amp; Waktu</th>
                      <th className="py-3 px-4">Ruangan &amp; Moda</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jadwalList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Belum ada jadwal resmi yang diterbitkan.
                        </td>
                      </tr>
                    ) : (
                      jadwalList.map((j) => (
                        <tr key={j._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900">{j.namaKelas}</p>
                            <p className="text-slate-500 text-[11px]">
                              {j.mataPelajaran} ({j.jenjang}) • {j.jumlahSiswa} Siswa
                            </p>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {j.namaPengajar}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-blue-600">{j.hari}</span>
                            <p className="text-slate-500 font-mono text-[11px]">
                              {j.jamMulai} - {j.jamSelesai}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-700">{j.ruangan}</p>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {j.moda}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {j.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteJadwal(j._id, j.namaKelas)}
                              className="text-red-600 hover:text-red-800 font-semibold text-xs"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 04: PEMANTAUAN SESI & BAP (MODUL 4)
        ======================================================== */}
        {activeTab === "pemantauan" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Pemantauan Pelaksanaan Sesi Real-Time
                </h2>
                <p className="text-xs text-slate-500">
                  Presensi kehadiran tutor, materi ajar riil (BAP), dan kendala lapangan.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {sesiList.length === 0 ? (
                <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
                  Belum ada laporan pelaksanaan sesi yang masuk.
                </div>
              ) : (
                sesiList.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{s.namaKelas}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                            {s.mataPelajaran}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tutor: <strong className="text-slate-800">{s.namaPengajar}</strong> •
                          Tanggal: {s.tanggal} ({s.waktuMulai} - {s.waktuSelesai})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {s.statusKehadiran}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.statusVerifikasi === "Terverifikasi"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : s.statusVerifikasi === "Menunggu Verifikasi"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {s.statusVerifikasi}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Berita Acara Pembelajaran (Materi Riil):
                        </span>
                        <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                          {s.materiAjar}
                        </p>
                      </div>

                      {s.capaianSiswa && (
                        <p className="text-slate-600">
                          <strong className="text-slate-700">Capaian Siswa:</strong>{" "}
                          {s.capaianSiswa}
                        </p>
                      )}

                      {s.kendala && (
                        <p className="text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 font-medium">
                          Kendala: {s.kendala}
                        </p>
                      )}

                      {s.buktiFoto && (
                        <div className="pt-1 flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">Bukti Sesi:</span>
                          <a
                            href={s.buktiFoto}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline font-semibold text-xs"
                          >
                            Lihat Foto / Dokumen Presensi
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 05: VERIFIKASI SESI & APPROVAL (MODUL 5)
        ======================================================== */}
        {activeTab === "verifikasi" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Verifikasi Data Sesi &amp; Validasi Bukti
                </h2>
                <p className="text-xs text-slate-500">
                  Pastikan bukti sesi valid sebelum diteruskan ke rekapitulasi honorarium.
                </p>
              </div>

              <select
                value={verifikasiFilter}
                onChange={(e) => setVerifikasiFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium"
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Terverifikasi">Terverifikasi</option>
                <option value="Perlu Revisi">Perlu Revisi</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredSesi.length === 0 ? (
                <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
                  Tidak ada laporan sesi yang memerlukan verifikasi.
                </div>
              ) : (
                filteredSesi.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{s.namaPengajar}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-blue-600 text-xs">{s.namaKelas}</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.statusVerifikasi === "Terverifikasi"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : s.statusVerifikasi === "Menunggu Verifikasi"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {s.statusVerifikasi}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        {s.materiAjar}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Tanggal: {s.tanggal} ({s.waktuMulai} - {s.waktuSelesai})</span>
                        <span>•</span>
                        <span>Honor Sesi: Rp {s.honorPerSesi?.toLocaleString("id-ID")}</span>
                        {s.buktiFoto && (
                          <>
                            <span>•</span>
                            <a
                              href={s.buktiFoto}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              Bukti Foto
                            </a>
                          </>
                        )}
                      </div>

                      {s.catatanVerifikasi && (
                        <p className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-100">
                          Catatan Revisi: {s.catatanVerifikasi}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {s.statusVerifikasi !== "Terverifikasi" && (
                        <button
                          type="button"
                          onClick={() => handleVerifikasiSesi(s._id, "Terverifikasi")}
                          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                        >
                          Approve / Verifikasi
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const note = prompt(
                            "Tuliskan catatan perbaikan untuk tutor:",
                            "Mohon upload bukti presensi siswa."
                          );
                          if (note !== null) {
                            handleVerifikasiSesi(s._id, "Perlu Revisi", note);
                          }
                        }}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                      >
                        Minta Revisi
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 06: REKAP HONOR & LAPORAN (MODUL 6)
        ======================================================== */}
        {activeTab === "honor" && (
          <div className="space-y-5">
            {/* Ringkasan Keuangan Sesi */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Sesi Masuk
                </span>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">
                  {honorStats.totalSesi}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sesi Tervalidasi
                </span>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {honorStats.terverifikasi}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Jam Mengajar
                </span>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">
                  {honorStats.totalJam} Jam
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Honor Valid
                </span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  Rp {honorStats.totalHonor?.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Tabel Rincian Honor Per Sesi */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Rekapitulasi Honorarium Tutor Periode Ini
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hanya sesi berstatus <strong>Terverifikasi</strong> yang masuk kalkulasi honor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const csvRows = [
                      ["Nama Tutor", "Kelas", "Mapel", "Tanggal", "Durasi (Jam)", "Honor (Rp)"],
                      ...sesiList
                        .filter((s) => s.statusVerifikasi === "Terverifikasi")
                        .map((s) => [
                          s.namaPengajar,
                          s.namaKelas,
                          s.mataPelajaran,
                          s.tanggal,
                          s.durasiJam.toString(),
                          s.honorPerSesi.toString(),
                        ]),
                    ];
                    const csvContent =
                      "data:text/csv;charset=utf-8," +
                      csvRows.map((e) => e.join(",")).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "rekap_honor_tutor.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
                >
                  Ekspor ke CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Pengajar</th>
                      <th className="py-3 px-4">Kelas &amp; Mapel</th>
                      <th className="py-3 px-4">Tanggal Sesi</th>
                      <th className="py-3 px-4 text-center">Durasi</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Honorarium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sesiList.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {s.namaPengajar}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {s.namaKelas} ({s.mataPelajaran})
                        </td>
                        <td className="py-3 px-4 text-slate-500">{s.tanggal}</td>
                        <td className="py-3 px-4 text-center font-mono">{s.durasiJam} Jam</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              s.statusVerifikasi === "Terverifikasi"
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {s.statusVerifikasi}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900 font-mono">
                          Rp {s.honorPerSesi?.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Form Tambah / Edit Pengajar */}
      {isPengajarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-sm">
                {isEditingPengajar ? "Edit Data Tutor" : "Tambah Tutor Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsPengajarModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPengajar} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorPengajar && (
                <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
                  {errorPengajar}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Keaktifan
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Aktif" | "Cuti" | "Nonaktif")}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mata Pelajaran (Klik untuk pilih) *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAFTAR_MAPEL.map((m) => {
                    const isSelected = formMapel.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() =>
                          setFormMapel((prev) =>
                            prev.includes(m) ? prev.filter((i) => i !== m) : [...prev, m]
                          )
                        }
                        className={`px-2.5 py-1 text-xs rounded-md font-medium border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPengajarModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingPengajar}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {submittingPengajar ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Terbitkan Jadwal Baru */}
      {isJadwalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-sm">Terbitkan Jadwal Kelas Baru</h2>
              <button
                type="button"
                onClick={() => setIsJadwalModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitJadwal} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorJadwal && (
                <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
                  {errorJadwal}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Rombongan Belajar / Kelas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 12 Intensif UTBK Sains"
                  value={jadwalNamaKelas}
                  onChange={(e) => setJadwalNamaKelas(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={jadwalMapel}
                    onChange={(e) => setJadwalMapel(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  >
                    {DAFTAR_MAPEL.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang</label>
                  <select
                    value={jadwalJenjang}
                    onChange={(e) => setJadwalJenjang(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  >
                    {DAFTAR_JENJANG.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Tutor Penanggung Jawab *
                </label>
                <select
                  value={jadwalPengajarId}
                  onChange={(e) => setJadwalPengajarId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium"
                >
                  {pengajarList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nama} ({p.mataPelajaran.join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hari</label>
                  <select
                    value={jadwalHari}
                    onChange={(e) => setJadwalHari(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  >
                    {DAFTAR_HARI.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mulai</label>
                  <input
                    type="time"
                    required
                    value={jadwalMulai}
                    onChange={(e) => setJadwalMulai(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selesai</label>
                  <input
                    type="time"
                    required
                    value={jadwalSelesai}
                    onChange={(e) => setJadwalSelesai(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ruangan / Link
                  </label>
                  <input
                    type="text"
                    value={jadwalRuangan}
                    onChange={(e) => setJadwalRuangan(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Moda</label>
                  <select
                    value={jadwalModa}
                    onChange={(e) => setJadwalModa(e.target.value as "Online" | "Offline")}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  >
                    <option value="Offline">Tatap Muka (Offline)</option>
                    <option value="Online">Daring (Online)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJadwalModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingJadwal}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {submittingJadwal ? "Menerbitkan..." : "Terbitkan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
