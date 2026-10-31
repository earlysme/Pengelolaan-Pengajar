"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TabModul = "pengajar" | "ketersediaan" | "jadwal" | "pemantauan" | "verifikasi" | "honor";

interface PengajarData {
  _id: string;
  nama: string;
  nip?: string;
  nomorTelepon: string;
  email?: string;
  alamat?: string;
  foto?: string;
  deskripsi?: string;
  pendidikan?: string;
  status: "Aktif" | "Cuti" | "Nonaktif";
  mataPelajaran: string[];
  jenjang: string[];
  jenisKelas: string[];
  jadwalTersedia?: string[];
  dokumenStatus?: string;
  catatanInternal?: string;
  akunDiaktifkanPada?: string;
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
  const [jenjangFilter, setJenjangFilter] = useState("Semua");
  const [isPengajarModalOpen, setIsPengajarModalOpen] = useState(false);
  const [isEditingPengajar, setIsEditingPengajar] = useState(false);
  const [currentPengajarId, setCurrentPengajarId] = useState<string | null>(null);

  // Form Pengajar
  const [formNama, setFormNama] = useState("");
  const [formTelepon, setFormTelepon] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formFoto, setFormFoto] = useState("");
  const [formStatus, setFormStatus] = useState<"Aktif" | "Cuti" | "Nonaktif">("Aktif");
  const [formMapel, setFormMapel] = useState<string[]>([]);
  const [formJenjang, setFormJenjang] = useState<string[]>(["SMA"]);
  const [formJenisKelas, setFormJenisKelas] = useState<string[]>(["Reguler"]);
  const [formCatatan, setFormCatatan] = useState("");
  const [formPendidikan, setFormPendidikan] = useState("");
  const [submittingPengajar, setSubmittingPengajar] = useState(false);
  const [errorPengajar, setErrorPengajar] = useState("");
  const [undangan, setUndangan] = useState<{
    nama: string;
    link: string;
    waUrl: string;
    berlakuHingga: string;
  } | null>(null);
  const [undanganLoadingId, setUndanganLoadingId] = useState<string | null>(null);
  const [linkTersalin, setLinkTersalin] = useState(false);

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

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setDbError("");

      const resP = await fetch("/api/pengajar");
      const jsonP = await resP.json();
      if (jsonP.success) setPengajarList(jsonP.data);

      const resK = await fetch("/api/ketersediaan");
      const jsonK = await resK.json();
      if (jsonK.success) setKetersediaanList(jsonK.data);

      const resJ = await fetch("/api/jadwal");
      const jsonJ = await resJ.json();
      if (jsonJ.success) setJadwalList(jsonJ.data);

      const resS = await fetch("/api/sesi");
      const jsonS = await resS.json();
      if (jsonS.success) {
        setSesiList(jsonS.data);
        if (jsonS.stats) setHonorStats(jsonS.stats);
      }
    } catch {
      setDbError("Tidak dapat terhubung ke server database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Halaman ini khusus koordinator: cek sesi server dulu.
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.role === "koordinator") fetchAllData();
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, []);

  const handleBuatUndangan = async (p: PengajarData) => {
    try {
      setUndanganLoadingId(p._id);
      const res = await fetch(`/api/pengajar/${p._id}/undangan`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setLinkTersalin(false);
        setUndangan({ nama: p.nama, ...json.data });
      } else {
        alert(json.error || "Gagal membuat undangan.");
      }
    } catch {
      alert("Koneksi gagal.");
    } finally {
      setUndanganLoadingId(null);
    }
  };

  const handleSalinLink = async () => {
    if (!undangan) return;
    try {
      await navigator.clipboard.writeText(undangan.link);
      setLinkTersalin(true);
    } catch {
      alert("Gagal menyalin. Salin manual dari kolom link.");
    }
  };

  // --- Handlers Modul 1 (Pengajar) ---
  const handleOpenAddPengajar = () => {
    setIsEditingPengajar(false);
    setCurrentPengajarId(null);
    setFormNama("");
    setFormTelepon("");
    setFormEmail("");
    setFormFoto("");
    setFormPendidikan("");
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
    setFormFoto(p.foto || "");
    setFormPendidikan(p.pendidikan || "");
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
    if (formJenjang.length === 0) {
      setErrorPengajar("Pilih minimal 1 jenjang bimbingan.");
      return;
    }

    try {
      setSubmittingPengajar(true);
      setErrorPengajar("");
      const payload = {
        nama: formNama.trim(),
        nomorTelepon: formTelepon.trim(),
        email: formEmail.trim() || undefined,
        foto: formFoto.trim() || undefined,
        pendidikan: formPendidikan.trim() || undefined,
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
    if (!confirm(`Hapus atau arsipkan data tutor: ${nama}?`)) return;
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
    catatan?: string,
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
    setJadwalNamaKelas("");
    setJadwalMapel("Matematika");
    setJadwalJenjang("SMA");
    setJadwalPengajarId(pengajarList[0]?._id || "");
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
    if (!jadwalNamaKelas.trim() || !jadwalPengajarId) {
      setErrorJadwal("Nama kelas dan pengajar wajib dipilih.");
      return;
    }

    const tutorSelected = pengajarList.find((p) => p._id === jadwalPengajarId);
    if (!tutorSelected) {
      setErrorJadwal("Data tutor tidak valid.");
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
    catatan?: string,
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // Filtered views
  const filteredPengajar = pengajarList.filter((p) => {
    if (statusFilter !== "Semua" && p.status !== statusFilter) return false;
    if (jenjangFilter !== "Semua" && !p.jenjang.includes(jenjangFilter)) return false;
    if (searchPengajar.trim()) {
      const q = searchPengajar.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.nomorTelepon.includes(q) ||
        (p.nip && p.nip.toLowerCase().includes(q)) ||
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

  const pendingVerifikasi = sesiList.filter((s) => s.statusVerifikasi === "Menunggu Verifikasi").length;

  return (
    <div className="bg-[#faf8f5] font-sans text-[#172421] min-h-screen selection:bg-[#F2D5A8] selection:text-[#173F3A]">
      {/* Top Navbar Sederhana & Bersih */}
      <header className="fixed top-0 w-full z-50 bg-[#faf8f5]/85 backdrop-blur-xl border-b border-[#173F3A]/10 shadow-[0_1px_8px_rgba(23,63,58,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
              <img src="/logo.svg" alt="Gen Plasma" className="w-8 h-8 object-contain" />
              <div className="flex flex-col">
                <span className="font-serif text-[1.25rem] leading-none tracking-tight text-[#173F3A] select-none font-bold">
                  Gen Plasma
                </span>
                <span className="text-[0.62rem] tracking-wider uppercase text-[#B74E2C] font-semibold">
                  Alur Selaras
                </span>
              </div>
            </Link>
            <span className="text-[#173F3A]/20 hidden sm:inline">•</span>
            <span className="text-[0.75rem] font-semibold text-[#173F3A] uppercase tracking-wider hidden sm:inline bg-[#F2D5A8]/50 px-3 py-1 rounded-full border border-[#D88A32]/30">
              Panel Koordinator
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[0.8125rem]">
            {(
              [

              ] as [TabModul, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`transition-colors py-1 ${activeTab === key
                  ? "font-semibold text-black border-b-2 border-black"
                  : "text-[#444748] hover:text-black"
                  }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSeedAll}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-[0.75rem] font-semibold transition-colors"
              title="Isi database dengan data demo"
            >
              <span className="material-symbols-outlined text-[16px]">database</span>
              <span>Data Demo</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[#444748] hover:text-black text-[0.8125rem] transition-colors px-2 py-1"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>Lihat Publik</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-[#efeeec] hover:bg-red-50 hover:text-[#ba1a1a] flex items-center justify-center transition-colors"
              title="Keluar dari panel"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full bg-[#faf9f7] min-h-[calc(100vh-140px)] pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <div className="flex flex-col w-full">
            {dbError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-rose-600">error</span>
                  <span className="text-[0.875rem] font-medium">{dbError}</span>
                </div>
                <button
                  type="button"
                  onClick={fetchAllData}
                  className="text-[0.8125rem] font-semibold underline hover:text-rose-950 px-2 py-1"
                >
                  Muat Ulang
                </button>
              </div>
            )}
            {/* Editorial Page Intro Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-[#444748] text-[0.75rem] font-semibold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-black"></span>
                  Direktori &amp; Tata Kelola Pendidik
                </div>
                <h1 className="font-serif text-[2.25rem] lg:text-[2.5rem] text-[#1a1c1b] font-normal tracking-tight leading-tight">
                  Basis Data Pengajar &amp; Rekam Kinerja
                </h1>
                <p className="text-[0.9375rem] text-[#444748] leading-relaxed">
                  Kendali terpadu profil pendidik, verifikasi kualifikasi, alokasi jam mengajar, serta pemantauan
                  integritas Berita Acara Pembelajaran (BAP).
                </p>
              </div>

              {/* Quick Actions Top Bar */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-[0.875rem] font-semibold transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  Ekspor Laporan
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddPengajar}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-[0.875rem] font-semibold shadow-sm transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Tambah Tutor Baru
                </button>
              </div>
            </div>

            {/* Operational Flow Segmented Nav (Tabs 01 - 06) */}
            <div className="w-full overflow-x-auto pb-2 mb-8">
              <div className="inline-flex xl:flex items-center p-1.5 bg-[#f4f3f1] rounded-full shadow-xs gap-1 min-w-max xl:min-w-0 xl:w-full border border-[#e3e2e0]/60">
                {(
                  [
                    ["pengajar", "01. Database Tutor", `${pengajarList.length}`],
                    ["ketersediaan", "02. Ketersediaan Waktu", `${ketersediaanList.length} Entri`],
                    ["jadwal", "03. Jadwal Resmi", `${jadwalList.length} Sesi`],
                    ["pemantauan", "04. Pemantauan Sesi", "live"],
                    ["verifikasi", "05. Verifikasi BAP", "review"],
                    ["honor", "06. Rekap Honorarium", ""],
                  ] as [TabModul, string, string][]
                ).map(([key, label, badge]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 xl:px-3 py-2 rounded-full text-[0.8125rem] font-semibold transition-all whitespace-nowrap ${activeTab === key
                      ? "bg-black text-white shadow-xs"
                      : "text-[#444748] hover:text-black hover:bg-white/50"
                      }`}
                  >
                    <span>{label}</span>
                    {badge === "live" ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#efeeec] text-[#444748] text-[0.7rem]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Live
                      </span>
                    ) : badge === "review" ? (
                      pendingVerifikasi > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[0.7rem]">
                          {pendingVerifikasi} Review
                        </span>
                      )
                    ) : badge ? (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[0.7rem] ${activeTab === key ? "bg-[#333] text-white" : "bg-[#e3e2e0] text-black"
                          }`}
                      >
                        {badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Operational Stat Indicators (Editorial Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-6 rounded-2xl bg-white border border-[#e3e2e0] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#444748] mb-3">
                  <span className="text-[0.75rem] font-semibold uppercase tracking-wider">Total Tutor Terdaftar</span>
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-[2.25rem] text-[#1a1c1b] leading-none">{pengajarList.length}</span>
                  <span className="text-[0.8125rem] text-[#444748]">Pendidik</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#efeeec] flex items-center justify-between text-[0.75rem] text-[#444748]">
                  <span>{pengajarList.filter((p) => p.status === "Aktif").length} Aktif Mengajar</span>
                  <span className="font-medium text-black">
                    {pengajarList.filter((p) => p.status !== "Aktif").length} Nonaktif/Cuti
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e3e2e0] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#444748] mb-3">
                  <span className="text-[0.75rem] font-semibold uppercase tracking-wider">Alokasi Jadwal Resmi</span>
                  <span className="material-symbols-outlined text-[20px]">event_available</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-[2.25rem] text-[#1a1c1b] leading-none">{jadwalList.length}</span>
                  <span className="text-[0.8125rem] text-[#444748]">Kelas Terjadwal</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#efeeec] flex items-center justify-between text-[0.75rem] text-[#444748]">
                  <span>Moda Offline &amp; Online</span>
                  <span className="font-medium text-black">Terkoordinasi</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e3e2e0] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#444748] mb-3">
                  <span className="text-[0.75rem] font-semibold uppercase tracking-wider">
                    Verifikasi Sesi &amp; BAP
                  </span>
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-[2.25rem] text-[#1a1c1b] leading-none">
                    {honorStats.terverifikasi} / {honorStats.totalSesi}
                  </span>
                  <span className="text-[0.8125rem] text-[#444748]">BAP Disetujui</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#efeeec] flex items-center justify-between text-[0.75rem] text-[#444748]">
                  <span>Standar Pembelajaran</span>
                  <span className="font-medium text-emerald-800">Valid</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e3e2e0] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#444748] mb-3">
                  <span className="text-[0.75rem] font-semibold uppercase tracking-wider">Total Honorarium Terbit</span>
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[1rem] font-semibold text-[#1a1c1b]">Rp</span>
                  <span className="font-serif text-[2rem] text-[#1a1c1b] leading-none">
                    {(honorStats.totalHonor || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#efeeec] flex items-center justify-between text-[0.75rem] text-[#444748]">
                  <span>Akumulasi Semester</span>
                  <span className="font-medium text-black">Siap Cair</span>
                </div>
              </div>
            </div>

            {/* TAB 01: DATABASE PENGAJAR */}
            {activeTab === "pengajar" && (
              <div className="space-y-6">
                {/* Search & Filter Strip */}
                <div className="p-4 rounded-2xl bg-white border border-[#e3e2e0] shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747878] text-[20px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchPengajar}
                      onChange={(e) => setSearchPengajar(e.target.value)}
                      placeholder="Cari nama tutor, NIP, keahlian mata pelajaran, atau nomor WhatsApp..."
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#f4f3f1] text-[#1a1c1b] placeholder:text-[#67645f] text-[0.875rem] focus:outline-none focus:bg-white focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-[#f4f3f1] text-[#1a1c1b] text-[0.8125rem] font-medium cursor-pointer focus:outline-none"
                      >
                        <option value="Semua">Semua Status</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Cuti">Cuti</option>
                        <option value="Nonaktif">Nonaktif</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#747878] pointer-events-none text-[18px]">
                        expand_more
                      </span>
                    </div>

                    <div className="relative">
                      <select
                        value={jenjangFilter}
                        onChange={(e) => setJenjangFilter(e.target.value)}
                        className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-[#f4f3f1] text-[#1a1c1b] text-[0.8125rem] font-medium cursor-pointer focus:outline-none"
                      >
                        <option value="Semua">Semua Jenjang</option>
                        {DAFTAR_JENJANG.map((j) => (
                          <option key={j} value={j}>
                            {j}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#747878] pointer-events-none text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Editorial Table */}
                <div className="rounded-2xl bg-white border border-[#e3e2e0] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f4f3f1] text-[#444748] text-[0.75rem] uppercase tracking-wider border-b border-[#e3e2e0]">
                          <th className="py-4 pl-6 pr-4 font-semibold">Nama &amp; Rekam Profil</th>
                          <th className="py-4 px-4 font-semibold">Mata Pelajaran</th>
                          <th className="py-4 px-4 font-semibold">Jenjang &amp; Kelas</th>
                          <th className="py-4 px-4 font-semibold">Ketersediaan Hari</th>
                          <th className="py-4 px-4 font-semibold">Status</th>
                          <th className="py-4 pl-4 pr-6 text-right font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#efeeec] text-[0.875rem]">
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-[#67645f]">
                              <span className="material-symbols-outlined text-[28px] animate-spin block mb-2">
                                progress_activity
                              </span>
                              Memuat basis data pendidik...
                            </td>
                          </tr>
                        ) : filteredPengajar.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-[#67645f]">
                              Tidak ada pengajar yang sesuai dengan kriteria pencarian.
                            </td>
                          </tr>
                        ) : (
                          filteredPengajar.map((p) => (
                            <tr key={p._id} className="hover:bg-[#faf9f7] transition-colors">
                              <td className="py-4 pl-6 pr-4 align-top">
                                <div className="flex items-start gap-3.5">
                                  <div className="w-12 h-14 rounded-xl overflow-hidden bg-[#e3e2e0] shrink-0 shadow-xs">
                                    <img
                                      src={
                                        p.foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
                                      }
                                      alt={p.nama}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="space-y-1 max-w-sm">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-[#1a1c1b]">{p.nama}</span>
                                      <span
                                        className="material-symbols-outlined text-[16px] text-black"
                                        title="Pendidik Terverifikasi"
                                      >
                                        verified
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[0.75rem] text-[#67645f]">
                                      <span>NIP: {p.nip || "LB-TUT"}</span>
                                      <span>•</span>
                                      <a
                                        href={`https://wa.me/${p.nomorTelepon.replace(/^0/, "62")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-0.5 text-black hover:underline font-medium"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">chat</span>
                                        {p.nomorTelepon}
                                      </a>
                                    </div>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-medium border ${p.akunDiaktifkanPada
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                          : "bg-amber-50 text-amber-800 border-amber-200"
                                        }`}
                                    >
                                      {p.akunDiaktifkanPada ? "Akun aktif" : "Belum aktivasi"}
                                    </span>
                                    {p.pendidikan && (
                                      <p className="text-[0.75rem] text-[#444748] truncate max-w-xs">{p.pendidikan}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4 align-top">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {p.mataPelajaran.map((m, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-full bg-[#efeeec] text-[0.75rem] font-medium text-[#1a1c1b]"
                                    >
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="py-4 px-4 align-top">
                                <div className="space-y-0.5 text-[0.8125rem]">
                                  <div className="font-medium text-[#1a1c1b]">{p.jenjang.join(", ")}</div>
                                  <div className="text-[0.75rem] text-[#67645f]">
                                    {p.jenisKelas.join(", ") || "Reguler"}
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4 align-top">
                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                  {p.jadwalTersedia && p.jadwalTersedia.length > 0 ? (
                                    p.jadwalTersedia.slice(0, 3).map((j, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-full bg-[#f4f3f1] text-[0.72rem] text-[#444748] border border-[#e3e2e0]"
                                      >
                                        {j}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[0.75rem] text-[#8e9191] italic">
                                      Belum diatur tutor
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-4 px-4 align-top">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.75rem] font-semibold ${p.status === "Aktif"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : p.status === "Cuti"
                                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                                      : "bg-neutral-100 text-neutral-600 border border-neutral-300"
                                    }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${p.status === "Aktif" ? "bg-emerald-600" : "bg-neutral-400"
                                      }`}
                                  ></span>
                                  {p.status}
                                </span>
                              </td>

                              <td className="py-4 pl-4 pr-6 align-top text-right">
                                <div className="inline-flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleBuatUndangan(p)}
                                    disabled={undanganLoadingId === p._id}
                                    className="px-3 py-1 rounded-full bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-[0.75rem] font-medium transition-colors disabled:opacity-50"
                                    title="Buat link undangan untuk atur email & password"
                                  >
                                    {undanganLoadingId === p._id
                                      ? "..."
                                      : p.akunDiaktifkanPada
                                        ? "Reset akses"
                                        : "Undang"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditPengajar(p)}
                                    className="p-1 rounded-full hover:bg-[#efeeec] text-[#444748] hover:text-black transition-colors"
                                    title="Sunting data profil pengajar"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePengajar(p._id, p.nama)}
                                    className="p-1 rounded-full hover:bg-red-50 text-[#747878] hover:text-[#ba1a1a] transition-colors"
                                    title="Hapus data pengajar"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="p-4 bg-[#f4f3f1] border-t border-[#e3e2e0] flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.8125rem] text-[#67645f]">
                    <span>
                      Menampilkan <strong className="text-black">{filteredPengajar.length}</strong> dari{" "}
                      <strong className="text-black">{pengajarList.length}</strong> total tutor
                    </span>
                    <span className="text-[0.75rem]">Sinkronisasi data langsung dengan MongoDB Atlas</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 02: KETERSEDIAAN WAKTU */}
            {activeTab === "ketersediaan" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e3e2e0]">
                  <div>
                    <h2 className="font-serif text-[1.25rem] text-[#1a1c1b]">Pemeriksaan Slot Waktu Mengajar Tutor</h2>
                    <p className="text-[0.8125rem] text-[#444748]">
                      Validasi ketersediaan jam mengajar mandiri yang diajukan oleh para tutor.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={ketersediaanFilter}
                      onChange={(e) => setKetersediaanFilter(e.target.value)}
                      className="px-3.5 py-2 rounded-full bg-[#f4f3f1] text-[#1a1c1b] text-[0.8125rem] font-medium focus:outline-none"
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
                    <div className="col-span-2 py-12 text-center text-[#67645f] bg-white rounded-2xl border border-[#e3e2e0]">
                      Belum ada data pengajuan ketersediaan waktu.
                    </div>
                  ) : (
                    filteredKetersediaan.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl p-6 border border-[#e3e2e0] shadow-xs space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-[#1a1c1b] text-[1.05rem]">{item.namaPengajar}</h3>
                            <p className="text-[0.75rem] text-[#67645f]">Periode: {item.periode}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[0.72rem] font-semibold border ${item.statusKonfirmasi === "Terkonfirmasi"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : item.statusKonfirmasi === "Menunggu Pemeriksaan"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-red-50 text-red-800 border-red-200"
                              }`}
                          >
                            {item.statusKonfirmasi}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[0.72rem] font-semibold uppercase tracking-wider text-[#67645f] block">
                            Slot Waktu Diajukan:
                          </span>
                          <div className="space-y-1.5">
                            {item.slots.map((s, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-[0.8125rem] bg-[#f4f3f1] px-3 py-2 rounded-xl"
                              >
                                <span className="font-medium text-[#1a1c1b]">
                                  {s.hari}: {s.jamMulai} - {s.jamSelesai}
                                </span>
                                <span className="text-[0.72rem] bg-white px-2 py-0.5 rounded-md font-semibold text-[#444748] border border-[#e3e2e0]">
                                  {s.moda}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {item.catatanKoordinator && (
                          <p className="text-[0.75rem] text-[#444748] bg-[#efeeec] p-2.5 rounded-xl">
                            Catatan: {item.catatanKoordinator}
                          </p>
                        )}

                        <div className="pt-2 border-t border-[#efeeec] flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const note = prompt("Catatan permintaan pembaruan:");
                              if (note !== null) {
                                handleUpdateStatusKetersediaan(item._id, "Perlu Diperbarui", note);
                              }
                            }}
                            className="px-3.5 py-1.5 text-[0.75rem] font-semibold text-[#ba1a1a] hover:bg-red-50 rounded-full transition-colors"
                          >
                            Minta Revisi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatusKetersediaan(item._id, "Terkonfirmasi")}
                            className="px-4 py-1.5 text-[0.75rem] font-semibold bg-black hover:bg-neutral-800 text-white rounded-full transition-colors shadow-xs"
                          >
                            Setujui Slot
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 03: JADWAL RESMI */}
            {activeTab === "jadwal" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e3e2e0]">
                  <div>
                    <h2 className="font-serif text-[1.25rem] text-[#1a1c1b]">Jadwal Kelas Resmi &amp; Penugasan</h2>
                    <p className="text-[0.8125rem] text-[#444748]">
                      Alokasi resmi pengajar ke kelas belajar dengan deteksi bentrok ruangan &amp; jam.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddJadwal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-[0.875rem] font-semibold shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>+ Buat Jadwal Baru
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {jadwalList.length === 0 ? (
                    <div className="col-span-3 py-12 text-center text-[#67645f] bg-white rounded-2xl border border-[#e3e2e0]">
                      Belum ada jadwal kelas resmi yang dibuat.
                    </div>
                  ) : (
                    jadwalList.map((j) => (
                      <div
                        key={j._id}
                        className="bg-white rounded-2xl p-5 border border-[#e3e2e0] shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="text-[0.72rem] font-semibold uppercase tracking-wider bg-[#efeeec] px-2.5 py-0.5 rounded-full text-[#1a1c1b]">
                              {j.mataPelajaran} • {j.jenjang}
                            </span>
                            <span className="text-[0.75rem] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {j.status}
                            </span>
                          </div>

                          <h3 className="font-serif text-[1.2rem] text-[#1a1c1b] leading-tight">{j.namaKelas}</h3>

                          <div className="space-y-1 text-[0.8125rem] text-[#444748] pt-1">
                            <div className="flex items-center gap-2 text-black font-medium">
                              <span className="material-symbols-outlined text-[16px] text-[#67645f]">person</span>
                              <span>{j.namaPengajar}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-[#67645f]">schedule</span>
                              <span>
                                {j.hari}, {j.jamMulai} - {j.jamSelesai}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-[#67645f]">meeting_room</span>
                              <span>
                                {j.ruangan} ({j.moda})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-[#67645f]">groups</span>
                              <span>{j.jumlahSiswa} Siswa Terdaftar</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#efeeec] flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteJadwal(j._id, j.namaKelas)}
                            className="text-[0.75rem] font-medium text-[#ba1a1a] hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
                          >
                            Hapus Jadwal
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 04: PEMANTAUAN SESI */}
            {activeTab === "pemantauan" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white border border-[#e3e2e0] flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-[1.25rem] text-[#1a1c1b]">
                      Pemantauan Pelaksanaan Sesi Belajar Real-Time
                    </h2>
                    <p className="text-[0.8125rem] text-[#444748]">
                      Log presensi mengajar, materi ajar yang disampaikan, dan progres siswa.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[0.75rem] font-semibold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    Live Tracking
                  </span>
                </div>

                <div className="rounded-2xl bg-white border border-[#e3e2e0] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[0.875rem]">
                      <thead>
                        <tr className="bg-[#f4f3f1] text-[#444748] text-[0.75rem] uppercase tracking-wider border-b border-[#e3e2e0]">
                          <th className="py-3.5 pl-6 pr-4 font-semibold">Kelas &amp; Tutor</th>
                          <th className="py-3.5 px-4 font-semibold">Tanggal &amp; Waktu</th>
                          <th className="py-3.5 px-4 font-semibold">Materi yang Diajarkan</th>
                          <th className="py-3.5 px-4 font-semibold">Presensi</th>
                          <th className="py-3.5 pl-4 pr-6 text-right font-semibold">Status BAP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#efeeec]">
                        {sesiList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-[#67645f]">
                              Belum ada catatan pelaksanaan sesi bimbingan.
                            </td>
                          </tr>
                        ) : (
                          sesiList.map((s) => (
                            <tr key={s._id} className="hover:bg-[#faf9f7] transition-colors">
                              <td className="py-3.5 pl-6 pr-4 align-top">
                                <span className="font-semibold text-[#1a1c1b] block">{s.namaKelas}</span>
                                <span className="text-[0.75rem] text-[#67645f]">
                                  {s.namaPengajar} • {s.mataPelajaran}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 align-top text-[0.8125rem]">
                                <div>{s.tanggal}</div>
                                <div className="text-[0.75rem] text-[#67645f]">
                                  {s.waktuMulai} - {s.waktuSelesai}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 align-top max-w-xs text-[0.8125rem]">
                                <p className="text-[#1a1c1b] font-medium">{s.materiAjar}</p>
                                {s.capaianSiswa && (
                                  <p className="text-[0.75rem] text-[#67645f] truncate mt-0.5">
                                    Capaian: {s.capaianSiswa}
                                  </p>
                                )}
                              </td>
                              <td className="py-3.5 px-4 align-top">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[0.72rem] font-semibold border ${s.statusKehadiran === "Hadir"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                    }`}
                                >
                                  {s.statusKehadiran}
                                </span>
                              </td>
                              <td className="py-3.5 pl-4 pr-6 align-top text-right">
                                <span
                                  className={`px-3 py-1 rounded-full text-[0.75rem] font-semibold border inline-block ${s.statusVerifikasi === "Terverifikasi"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : s.statusVerifikasi === "Menunggu Verifikasi"
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : "bg-red-50 text-red-800 border-red-200"
                                    }`}
                                >
                                  {s.statusVerifikasi}
                                </span>
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

            {/* TAB 05: VERIFIKASI BAP */}
            {activeTab === "verifikasi" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white border border-[#e3e2e0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-[1.25rem] text-[#1a1c1b]">Antrean Verifikasi Berita Acara (BAP)</h2>
                    <p className="text-[0.8125rem] text-[#444748]">
                      Validasi bukti kehadiran dan catatan bimbingan sebelum honorarium disetujui.
                    </p>
                  </div>
                  <select
                    value={verifikasiFilter}
                    onChange={(e) => setVerifikasiFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-full bg-[#f4f3f1] text-[#1a1c1b] text-[0.8125rem] font-medium focus:outline-none"
                  >
                    <option value="Semua">Semua Status BAP</option>
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                    <option value="Terverifikasi">Terverifikasi</option>
                    <option value="Perlu Revisi">Perlu Revisi</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSesi.length === 0 ? (
                    <div className="col-span-2 py-12 text-center text-[#67645f] bg-white rounded-2xl border border-[#e3e2e0]">
                      Tidak ada data BAP yang menunggu verifikasi.
                    </div>
                  ) : (
                    filteredSesi.map((s) => (
                      <div
                        key={s._id}
                        className="bg-white rounded-2xl p-6 border border-[#e3e2e0] shadow-xs space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[0.72rem] font-semibold uppercase tracking-wider text-[#67645f]">
                                {s.namaPengajar}
                              </span>
                              <h3 className="font-serif text-[1.2rem] text-[#1a1c1b] leading-tight">{s.namaKelas}</h3>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-[0.72rem] font-semibold border ${s.statusVerifikasi === "Terverifikasi"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : s.statusVerifikasi === "Menunggu Verifikasi"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-red-50 text-red-800 border-red-200"
                                }`}
                            >
                              {s.statusVerifikasi}
                            </span>
                          </div>

                          <div className="bg-[#f4f3f1] rounded-xl p-3.5 space-y-1.5 text-[0.8125rem]">
                            <div>
                              <span className="text-[#67645f]">Tanggal: </span>
                              <span className="font-semibold text-black">
                                {s.tanggal} ({s.waktuMulai} - {s.waktuSelesai})
                              </span>
                            </div>
                            <div>
                              <span className="text-[#67645f]">Materi: </span>
                              <span className="text-black">{s.materiAjar}</span>
                            </div>
                            {s.capaianSiswa && (
                              <div>
                                <span className="text-[#67645f]">Capaian: </span>
                                <span className="text-black">{s.capaianSiswa}</span>
                              </div>
                            )}
                            {s.kendala && (
                              <div>
                                <span className="text-[#67645f]">Kendala: </span>
                                <span className="text-black">{s.kendala}</span>
                              </div>
                            )}
                          </div>

                          {s.buktiFoto && (
                            <div>
                              <a
                                href={s.buktiFoto}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-black hover:underline"
                              >
                                <span className="material-symbols-outlined text-[16px]">attachment</span>
                                Lihat Bukti Foto Pembelajaran
                              </a>
                            </div>
                          )}

                          {s.catatanVerifikasi && (
                            <p className="text-[0.75rem] text-[#ba1a1a] bg-red-50 p-2.5 rounded-xl border border-red-100">
                              Catatan Revisi: {s.catatanVerifikasi}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[#efeeec] flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const note = prompt("Tuliskan catatan revisi untuk tutor:");
                              if (note !== null) {
                                handleVerifikasiSesi(s._id, "Perlu Revisi", note);
                              }
                            }}
                            className="px-4 py-1.5 text-[0.75rem] font-semibold text-[#ba1a1a] hover:bg-red-50 rounded-full transition-colors"
                          >
                            Minta Revisi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifikasiSesi(s._id, "Terverifikasi")}
                            className="px-5 py-1.5 text-[0.75rem] font-semibold bg-black hover:bg-neutral-800 text-white rounded-full transition-colors shadow-xs"
                          >
                            Verifikasi Selesai
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 06: REKAP HONORARIUM */}
            {activeTab === "honor" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white border border-[#e3e2e0] flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-[1.25rem] text-[#1a1c1b]">
                      Laporan &amp; Rekapitulasi Honorarium Pengajar
                    </h2>
                    <p className="text-[0.8125rem] text-[#444748]">
                      Perhitungan honor otomatis berdasarkan sesi terverifikasi (Standar: Rp 150.000 / sesi).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black hover:bg-neutral-800 text-white text-[0.8125rem] font-semibold transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    Cetak Rekap
                  </button>
                </div>

                <div className="rounded-2xl bg-white border border-[#e3e2e0] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[0.875rem]">
                      <thead>
                        <tr className="bg-[#f4f3f1] text-[#444748] text-[0.75rem] uppercase tracking-wider border-b border-[#e3e2e0]">
                          <th className="py-4 pl-6 pr-4 font-semibold">Nama Tutor</th>
                          <th className="py-4 px-4 font-semibold">Total Sesi Diajukan</th>
                          <th className="py-4 px-4 font-semibold">Sesi Terverifikasi</th>
                          <th className="py-4 px-4 font-semibold">Total Jam Efektif</th>
                          <th className="py-4 pl-4 pr-6 text-right font-semibold">Total Honorarium</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#efeeec]">
                        {pengajarList.map((p) => {
                          const tutorSesi = sesiList.filter((s) => s.pengajarId === p._id);
                          const verifiedSesi = tutorSesi.filter((s) => s.statusVerifikasi === "Terverifikasi");
                          const totalJam = verifiedSesi.reduce((acc, curr) => acc + (curr.durasiJam || 1.5), 0);
                          const totalHonor = verifiedSesi.reduce((acc, curr) => acc + (curr.honorPerSesi || 150000), 0);

                          return (
                            <tr key={p._id} className="hover:bg-[#faf9f7] transition-colors">
                              <td className="py-4 pl-6 pr-4 align-top">
                                <span className="font-semibold text-[#1a1c1b] block">{p.nama}</span>
                                <span className="text-[0.75rem] text-[#67645f]">{p.nomorTelepon}</span>
                              </td>
                              <td className="py-4 px-4 align-top">{tutorSesi.length} Sesi</td>
                              <td className="py-4 px-4 align-top">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[0.75rem] font-semibold border border-emerald-200">
                                  {verifiedSesi.length} Terverifikasi
                                </span>
                              </td>
                              <td className="py-4 px-4 align-top">{totalJam.toFixed(1)} Jam</td>
                              <td className="py-4 pl-4 pr-6 align-top text-right font-serif text-[1.125rem] text-[#1a1c1b] font-medium">
                                Rp {totalHonor.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Editorial Note / Operational Quality Banner */}
            <div className="mt-8 p-6 rounded-2xl bg-[#f4f3f1] border border-[#e3e2e0]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 text-black">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[0.875rem] font-semibold text-[#1a1c1b]">
                    Prosedur Kurasi &amp; Penjaminan Mutu Tutor Lentera Belajar
                  </h2>
                  <p className="text-[0.8125rem] text-[#444748] leading-relaxed">
                    Setiap pendidik melalui telaah kualifikasi pedagogis, verifikasi ketersediaan hari, serta validasi
                    Berita Acara Pembelajaran sebelum rekonsiliasi honor bulanan diterbitkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Tambah / Edit Tutor */}
      {undangan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e3e2e0] p-6 shadow-xl space-y-4">
            <div>
              <h3 className="font-serif text-[1.5rem] text-[#1a1c1b]">Undangan untuk {undangan.nama}</h3>
              <p className="text-[0.8125rem] text-[#444748] mt-1">
                Link ini sekali pakai, berlaku sampai{" "}
                {new Date(undangan.berlakuHingga).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                . Membuat undangan baru membatalkan link sebelumnya. Kirim hanya ke nomor WhatsApp tutor yang
                bersangkutan.
              </p>
            </div>

            <input
              readOnly
              value={undangan.link}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full px-3.5 py-2.5 text-[0.75rem] font-mono bg-[#faf9f7] border border-[#e3e2e0] rounded-xl"
            />

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={handleSalinLink}
                className="px-4 py-2 rounded-full bg-[#efeeec] hover:bg-[#e3e2e0] text-[0.8125rem] font-medium"
              >
                {linkTersalin ? "Tersalin ✓" : "Salin link"}
              </button>
              <a
                href={undangan.waUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-black hover:bg-neutral-800 text-white text-[0.8125rem] font-medium"
              >
                Kirim via WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setUndangan(null)}
                className="px-4 py-2 rounded-full text-[0.8125rem] font-medium text-[#444748] hover:text-black"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {isPengajarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#e3e2e0] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#efeeec] pb-4">
              <h2 className="font-serif text-[1.5rem] text-[#1a1c1b]">
                {isEditingPengajar ? "Sunting Profil Tutor" : "Tambah Tutor Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsPengajarModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#efeeec] flex items-center justify-center text-[#747878] hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {errorPengajar && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#ba1a1a] rounded-xl text-[0.8125rem]">
                {errorPengajar}
              </div>
            )}

            <form onSubmit={handleSubmitPengajar} className="space-y-4">
              <div>
                <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">
                  Nama Lengkap &amp; Gelar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahmawati, M.Si."
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none focus:border-black font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Status Pendidik</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Aktif" | "Cuti" | "Nonaktif")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none focus:border-black"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">
                  Latar Belakang Pendidikan &amp; Almamater
                </label>
                <input
                  type="text"
                  placeholder="Contoh: S1 Kimia UI • S2 ITB"
                  value={formPendidikan}
                  onChange={(e) => setFormPendidikan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">
                  Tautan URL Foto Profil
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formFoto}
                  onChange={(e) => setFormFoto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">
                  Mata Pelajaran (Pilih yang relevan)
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DAFTAR_MAPEL.map((m) => {
                    const selected = formMapel.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setFormMapel((prev) => (selected ? prev.filter((item) => item !== m) : [...prev, m]));
                        }}
                        className={`px-3 py-1 rounded-full text-[0.75rem] font-medium transition-colors ${selected
                          ? "bg-black text-white"
                          : "bg-[#f4f3f1] text-[#444748] hover:bg-[#efeeec] border border-[#e3e2e0]"
                          }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">
                  Jenjang Bimbingan (Bisa pilih lebih dari 1)
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DAFTAR_JENJANG.map((j) => {
                    const selected = formJenjang.includes(j);
                    return (
                      <button
                        key={j}
                        type="button"
                        onClick={() => {
                          setFormJenjang((prev) =>
                            selected ? prev.filter((item) => item !== j) : [...prev, j]
                          );
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-medium transition-colors ${selected
                          ? "bg-black text-white shadow-xs"
                          : "bg-[#f4f3f1] text-[#444748] hover:bg-[#efeeec] border border-[#e3e2e0]"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {selected ? "check" : "add"}
                        </span>
                        <span>{j}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#efeeec] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPengajarModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-[0.8125rem] font-semibold text-[#444748] hover:bg-[#efeeec] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingPengajar}
                  className="px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-[0.8125rem] font-semibold transition-colors shadow-xs disabled:opacity-50"
                >
                  {submittingPengajar ? "Menyimpan..." : "Simpan Data Tutor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Buat Jadwal Baru */}
      {isJadwalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#e3e2e0] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#efeeec] pb-4">
              <h2 className="font-serif text-[1.5rem] text-[#1a1c1b]">Buat Jadwal Kelas Resmi</h2>
              <button
                type="button"
                onClick={() => setIsJadwalModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#efeeec] flex items-center justify-center text-[#747878] hover:text-black transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {errorJadwal && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#ba1a1a] rounded-xl text-[0.8125rem]">
                {errorJadwal}
              </div>
            )}

            <form onSubmit={handleSubmitJadwal} className="space-y-4">
              <div>
                <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: XII MIPA Intensif UTBK 1"
                  value={jadwalNamaKelas}
                  onChange={(e) => setJadwalNamaKelas(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Tutor Pengajar</label>
                <select
                  value={jadwalPengajarId}
                  onChange={(e) => setJadwalPengajarId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none focus:border-black"
                >
                  {pengajarList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nama} ({p.mataPelajaran.join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Mata Pelajaran</label>
                  <select
                    value={jadwalMapel}
                    onChange={(e) => setJadwalMapel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none focus:border-black"
                  >
                    {DAFTAR_MAPEL.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Jenjang</label>
                  <select
                    value={jadwalJenjang}
                    onChange={(e) => setJadwalJenjang(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none focus:border-black"
                  >
                    {DAFTAR_JENJANG.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Hari</label>
                  <select
                    value={jadwalHari}
                    onChange={(e) => setJadwalHari(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.8125rem] focus:outline-none focus:border-black"
                  >
                    {DAFTAR_HARI.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Mulai</label>
                  <input
                    type="time"
                    value={jadwalMulai}
                    onChange={(e) => setJadwalMulai(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.8125rem] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Selesai</label>
                  <input
                    type="time"
                    value={jadwalSelesai}
                    onChange={(e) => setJadwalSelesai(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.8125rem] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Ruangan / Link</label>
                  <input
                    type="text"
                    value={jadwalRuangan}
                    onChange={(e) => setJadwalRuangan(e.target.value)}
                    placeholder="Ruang A1 / Zoom Link"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">Jumlah Siswa</label>
                  <input
                    type="number"
                    value={jadwalSiswa}
                    onChange={(e) => setJadwalSiswa(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e3e2e0] text-[0.875rem] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#efeeec] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsJadwalModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-[0.8125rem] font-semibold text-[#444748] hover:bg-[#efeeec] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingJadwal}
                  className="px-6 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white text-[0.8125rem] font-semibold transition-colors shadow-xs disabled:opacity-50"
                >
                  {submittingJadwal ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-[#f2efe9] border-t border-[#173F3A]/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] text-[#67645f]">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Gen Plasma" className="w-6 h-6 object-contain" />
            <span className="font-serif text-[1.25rem] text-[#173F3A] font-bold">Gen Plasma</span>
            <span className="text-[#B74E2C] font-semibold">• Alur Selaras</span>
            <span className="ml-2 text-[#444748]">• Tata Kelola &amp; Pembinaan Pengajar</span>
          </div>
          <p>© 2025 - 2026 Gen Plasma — Alur Selaras. Hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}