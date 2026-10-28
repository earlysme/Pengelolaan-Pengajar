"use client";
// src/app/page.tsx
import { useState, useEffect } from "react";

interface PengajarData {
  _id: string;
  nama: string;
  nomorTelepon: string;
  email?: string;
  alamat?: string;
  status: "Aktif" | "Cuti" | "Nonaktif";
  mataPelajaran: string[];
  jenjang: string[];
  jenisKelas: string[];
  dokumenStatus?: string;
  catatanInternal?: string;
}

interface StatsData {
  total: number;
  aktif: number;
  cuti: number;
  nonaktif: number;
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

export default function DashboardPengajar() {
  const [pengajarList, setPengajarList] = useState<PengajarData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    aktif: 0,
    cuti: 0,
    nonaktif: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form State
  const [formNama, setFormNama] = useState("");
  const [formTelepon, setFormTelepon] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"Aktif" | "Cuti" | "Nonaktif">("Aktif");
  const [formMapel, setFormMapel] = useState<string[]>([]);
  const [formJenjang, setFormJenjang] = useState<string[]>(["SMA"]);
  const [formJenisKelas, setFormJenisKelas] = useState<string[]>(["Reguler"]);
  const [formCatatan, setFormCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "Semua") params.append("status", statusFilter);

      const res = await fetch(`/api/pengajar?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPengajarList(json.data);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormNama("");
    setFormTelepon("");
    setFormEmail("");
    setFormStatus("Aktif");
    setFormMapel(["Matematika"]);
    setFormJenjang(["SMA"]);
    setFormJenisKelas(["Reguler"]);
    setFormCatatan("");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: PengajarData) => {
    setIsEditing(true);
    setCurrentId(p._id);
    setFormNama(p.nama);
    setFormTelepon(p.nomorTelepon);
    setFormEmail(p.email || "");
    setFormStatus(p.status);
    setFormMapel(p.mataPelajaran || []);
    setFormJenjang(p.jenjang || ["SMA"]);
    setFormJenisKelas(p.jenisKelas || ["Reguler"]);
    setFormCatatan(p.catatanInternal || "");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleToggleMapel = (m: string) => {
    setFormMapel((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  const handleToggleJenjang = (j: string) => {
    setFormJenjang((prev) =>
      prev.includes(j) ? prev.filter((item) => item !== j) : [...prev, j]
    );
  };

  const handleToggleKelas = (k: string) => {
    setFormJenisKelas((prev) =>
      prev.includes(k) ? prev.filter((item) => item !== k) : [...prev, k]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formTelepon.trim()) {
      setErrorMessage("Nama dan nomor WhatsApp wajib diisi.");
      return;
    }
    if (formMapel.length === 0) {
      setErrorMessage("Pilih minimal 1 mata pelajaran.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

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

      const url = isEditing ? `/api/pengajar/${currentId}` : "/api/pengajar";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        setErrorMessage(json.error || "Gagal menyimpan data.");
      }
    } catch {
      setErrorMessage("Terjadi kendala koneksi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus data pengajar: ${nama}?`)) return;

    try {
      const res = await fetch(`/api/pengajar/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error || "Gagal menghapus.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      alert(json.message);
      fetchData();
    } catch {
      alert("Gagal menambahkan contoh data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              B
            </div>
            <div>
              <h1 className="font-semibold text-base leading-tight">
                Koordinator Tutor Bimbel
              </h1>
              <p className="text-xs text-slate-500">Database & Profil Pengajar</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Cloud Atlas Aktif
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Ringkasan Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Pengajar
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              👥
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Pengajar Aktif
              </p>
              <p className="text-2xl font-bold text-teal-600 mt-1">{stats.aktif}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              ✓
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Sedang Cuti
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.cuti}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              ⏸
            </div>
          </div>
        </div>

        {/* Action Bar: Search, Filter, Tambah */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              placeholder="Cari nama, mapel, atau nomor WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-xs px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 font-medium text-slate-700"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Cuti">Cuti</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {pengajarList.length === 0 && !loading && (
              <button
                type="button"
                onClick={handleSeedData}
                className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                + Isi Data Contoh
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="text-base leading-none">+</span> Tambah Pengajar
            </button>
          </div>
        </div>

        {/* Tabel Data Pengajar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama & Kontak</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Jenjang & Kelas</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Memuat data pengajar...
                    </td>
                  </tr>
                ) : pengajarList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <p className="text-slate-500 font-medium">
                        Belum ada data pengajar yang sesuai.
                      </p>
                      <button
                        type="button"
                        onClick={handleSeedData}
                        className="mt-3 px-4 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        Tambahkan Data Contoh Sekarang
                      </button>
                    </td>
                  </tr>
                ) : (
                  pengajarList.map((p) => {
                    const waClean = p.nomorTelepon.replace(/^0/, "62").replace(/[^0-9]/g, "");
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{p.nama}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <a
                              href={`https://wa.me/${waClean}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-mono"
                              title="Buka WhatsApp"
                            >
                              📱 {p.nomorTelepon}
                            </a>
                            {p.email && (
                              <span className="text-xs text-slate-400">
                                • {p.email}
                              </span>
                            )}
                          </div>
                          {p.catatanInternal && (
                            <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
                              📌 {p.catatanInternal}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.mataPelajaran.map((m, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {p.jenjang?.map((j, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.2 text-[11px] font-semibold bg-teal-50 text-teal-800 rounded border border-teal-200"
                                >
                                  {j}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-slate-500">
                              {p.jenisKelas?.join(", ") || "Reguler"}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
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
                              onClick={() => handleOpenEditModal(p)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p._id, p.nama)}
                              className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
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
      </main>

      {/* Modal Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-base">
                {isEditing ? "Edit Data Pengajar" : "Tambah Pengajar Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorMessage && (
                <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Nama & Telepon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso, S.Pd."
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Email & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="budi@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Keaktifan
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "Aktif" | "Cuti" | "Nonaktif")
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                  >
                    <option value="Aktif">Aktif (Siap Mengajar)</option>
                    <option value="Cuti">Cuti (Sementara Tidak Mengajar)</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Pilihan Mata Pelajaran */}
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
                        onClick={() => handleToggleMapel(m)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors border ${
                          isSelected
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? `✓ ${m}` : m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jenjang Pendidikan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jenjang Mengajar
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAFTAR_JENJANG.map((j) => {
                    const isSelected = formJenjang.includes(j);
                    return (
                      <button
                        type="button"
                        key={j}
                        onClick={() => handleToggleJenjang(j)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors border ${
                          isSelected
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? `✓ ${j}` : j}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jenis Kelas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jenis Kelas yang Diampu
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAFTAR_KELAS.map((k) => {
                    const isSelected = formJenisKelas.includes(k);
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => handleToggleKelas(k)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors border ${
                          isSelected
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? `✓ ${k}` : k}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Khusus Koordinator */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Khusus Koordinator (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Spesialis UTBK TPS, sangat komunikatif..."
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Tombol Simpan & Batal */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan Pengajar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
