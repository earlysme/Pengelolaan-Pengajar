"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PengajarData {
  _id: string;
  nama: string;
  nip?: string;
  nomorTelepon: string;
  email?: string;
  foto?: string;
  deskripsi?: string;
  pendidikan?: string;
  mataPelajaran: string[];
  jenjang: string[];
  status: string;
  alamat?: string;
  jadwalTersedia?: string[];
}

const PRESET_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC_m5DP1BIO_Q-qsuUAqTmcv4kueJcNR4SQNqhdQLR8ELgHzxRrIqLEsixkl0IA2UHjbmIdqsnZQVdekL5AaC5RbhI_cUixhbrpECjOdxXwld1yoMP3fl4xbaROETACVuNH7ZexZDz3HNqshlEd2xFtmVlL_yhUVePiNdB-PngGIJR5zAH67beOUo7gAjwoFUfsbiDOykw28YYfJlc1sFtygyj2PvO-bw2MJ-mD1-N4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDaWuJy7vu8MeGSV-L8ziXfK_UDEk247NvvuiFDoO6ALIf64haRtliwMGFuUcHVzVl0WdZKWgnatPxjJ5pAQl-h0aEJ3Mb37oH55PB3tl-sdC7RP7QUMxwXTvmdmZn3Qg187ngOKnDYQNU-XRl5inGThJRgKnhr6XgTMLRDOrb60laahQ0cXMBz4bpb6-9roqxpt3aA8hh4GKkjT-vt0cuTfZQ127YXlwlscaPA-8ww",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDDiEJGUyyuR30LiC8Rl6agVELH3qpsOPoTIWZTgo_IrWaLL2Y9G5VpPUfSuOlGpl2OYri7aPQX13G8xyCik3FHuv8-h6fjBav1Bv6emuNVzrAnQM0_FrdTeFOdXNIuLx8a66NZAesWSeoC2EnhwaV2x-qiHDQEd-oajcyTQUz9z0O6AQP_muN1rr0GigMz6_rvOFJIqqK-hKJBgvI7jHTuh5wb3HNgn1EDqcocR32J",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA3fwfN42rUPz7L2HAvSBbL_LRO_Jv1wpi7EAarU2emDcptT2GvztEkFQM8hWb-sgN9hGC64XdKC5PV9TgHTTAuzzykstOlhRSXyXYepZwBhgH-dMtMGWbbf_bLk_J0yoY0UNmopJIi2nHXiGVkNecHITpOggRhNDDyeFNcmVxGBenbj3UT52NIp5lOrKYCFC1uGKzT2DD-1tHcbvkHdFEe_hROnrcW08EcjCGIWAUg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwUEa5yq3-JBJJf8ATEEq02ZSgWi1LB5k3woETx36D7-ARZXzIo2hHFlXOghS0PqJUBhA_G1ZCj4syFKGz_epMMD4TC53FjE-rrWrAP95LbMXSzI2P2Rq1mgU1UVFJuwfJFQqXDehIjrFyJy519jXnL2JJ5yP6Loapn4mGcz9e_pVi_jyUdw233WBUfYBTysM6LdW9Y9dO11T46jpHRB9VPXYA4-TvBSk78k6fn9Wz",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHB51zhe7ysp42hrFuGrCikXhhJO5DN2gO8JqKp2yu12nNSMQjZmRglPQkjFjSKmhPGQ-tFodkfG-0yooYJBUkolpC1XulfmLDefheJeqKIRUwrYezHu6AwMmUND4OGzfxk2L9FHjQptypRRe0z-h4D5gf8xqpcUGrGVe_7t4ik20-JGh9I7mjTqVMj2xpHNplKu6S6fDlOVxHPj3zIi6DjM51tFaqYP7h5HOAgclN",
];

const DAFTAR_HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function AreaTutor() {
  const router = useRouter();
  const [currentTutor, setCurrentTutor] = useState<PengajarData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Profil Data
  const [foto, setFoto] = useState(PRESET_AVATARS[0]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [deskripsi, setDeskripsi] = useState("");
  const [pendidikan, setPendidikan] = useState("");
  const [tags, setTags] = useState<string[]>([
    "Kimia Organik & Stoikiometri SMA",
    "Penalaran Sains UTBK-SNBT",
    "Persiapan OSN Kimia Kabupaten/Provinsi",
    "Biologi Sel & Genetika Kedokteran",
  ]);
  const [domisili, setDomisili] = useState("Bandung & Jakarta Selatan (Fleksibel)");
  const [nomorWa, setNomorWa] = useState("");
  const [hariTersedia, setHariTersedia] = useState<string[]>(["Senin", "Rabu", "Jumat"]);

  const [savingProfil, setSavingProfil] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Melacak status apakah ada perubahan data (sedang mengedit)
  const [initialData, setInitialData] = useState<{
    foto: string;
    deskripsi: string;
    pendidikan: string;
    domisili: string;
    nomorWa: string;
    hariTersedia: string[];
    tags: string[];
  } | null>(null);

  const hasChanges = Boolean(
    initialData &&
      (foto !== initialData.foto ||
        deskripsi !== initialData.deskripsi ||
        pendidikan !== initialData.pendidikan ||
        domisili !== initialData.domisili ||
        nomorWa !== initialData.nomorWa ||
        JSON.stringify(hariTersedia) !== JSON.stringify(initialData.hariTersedia) ||
        JSON.stringify(tags) !== JSON.stringify(initialData.tags))
  );

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pengajar");
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        // Ambil tutor yang sedang login dari localStorage
        const savedTutorId = localStorage.getItem("tutorId");
        let active = json.data[0];

        if (savedTutorId) {
          const found = json.data.find((t: PengajarData) => t._id === savedTutorId);
          if (found) active = found;
        }

        populateTutor(active);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const populateTutor = (t: PengajarData) => {
    setCurrentTutor(t);
    setFoto(t.foto || PRESET_AVATARS[0]);
    setDeskripsi(
      t.deskripsi ||
        "Berpengalaman lebih dari 8 tahun membimbing siswa menembus Fakultas Kedokteran dan PTN impian dengan metode visualisasi konsep dan pembedahan nalar logika soal HOTS tanpa hafalan rumus mati."
    );
    setPendidikan(
      t.pendidikan || "S2 Magister Kimia ITB (Cumlaude) • S1 Pendidikan Kimia Universitas Indonesia"
    );
    setNomorWa(t.nomorTelepon ? t.nomorTelepon.replace(/^(\+62|62|0)/, "") : "");
    setDomisili(t.alamat || "Bandung & Jakarta Selatan (Fleksibel)");

    // Ekstrak hari ketersediaan dari data tutor
    let initialHari: string[] = ["Senin", "Rabu", "Jumat"];
    if (t.jadwalTersedia && t.jadwalTersedia.length > 0) {
      const parsedDays = DAFTAR_HARI.filter((hari) =>
        t.jadwalTersedia?.some((j) => j.toLowerCase().includes(hari.toLowerCase()))
      );
      initialHari = parsedDays.length > 0 ? parsedDays : ["Senin", "Rabu", "Jumat"];
    }
    setHariTersedia(initialHari);

    const initialFoto = t.foto || PRESET_AVATARS[0];
    const initialDesk =
      t.deskripsi ||
      "Berpengalaman lebih dari 8 tahun membimbing siswa menembus Fakultas Kedokteran dan PTN impian dengan metode visualisasi konsep dan pembedahan nalar logika soal HOTS tanpa hafalan rumus mati.";
    const initialPend =
      t.pendidikan || "S2 Magister Kimia ITB (Cumlaude) • S1 Pendidikan Kimia Universitas Indonesia";
    const initialWa = t.nomorTelepon ? t.nomorTelepon.replace(/^(\+62|62|0)/, "") : "";
    const initialDom = t.alamat || "Bandung & Jakarta Selatan (Fleksibel)";

    setInitialData({
      foto: initialFoto,
      deskripsi: initialDesk,
      pendidikan: initialPend,
      domisili: initialDom,
      nomorWa: initialWa,
      hariTersedia: initialHari,
      tags: [...tags],
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Handler Unggah Foto dari Perangkat
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Pilih file gambar valid (JPG, PNG, atau WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 800;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.88);
          setFoto(compressed);
          setSelectedPresetIndex(-1);
          showToast("Foto berhasil dimuat dari perangkat.");
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  };

  // Toggle pilihan hari ketersediaan
  const toggleHari = (hari: string) => {
    if (hariTersedia.includes(hari)) {
      setHariTersedia(hariTersedia.filter((h) => h !== hari));
    } else {
      const updated = [...hariTersedia, hari];
      updated.sort((a, b) => DAFTAR_HARI.indexOf(a) - DAFTAR_HARI.indexOf(b));
      setHariTersedia(updated);
    }
  };

  // Simpan Profil & Ketersediaan Hari
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentTutor) return;

    try {
      setSavingProfil(true);
      const res = await fetch(`/api/pengajar/${currentTutor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foto,
          deskripsi,
          pendidikan,
          alamat: domisili,
          nomorTelepon: nomorWa.startsWith("0") ? nomorWa : `0${nomorWa}`,
          jadwalTersedia: hariTersedia,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Profil dan ketersediaan hari mengajar berhasil diperbarui.");
        setInitialData({
          foto,
          deskripsi,
          pendidikan,
          domisili,
          nomorWa,
          hariTersedia,
          tags,
        });
        setCurrentTutor((prev) =>
          prev
            ? {
                ...prev,
                foto,
                deskripsi,
                pendidikan,
                alamat: domisili,
                nomorTelepon: nomorWa.startsWith("0") ? nomorWa : `0${nomorWa}`,
                jadwalTersedia: hariTersedia,
              }
            : null
        );
      } else {
        showToast("Gagal menyimpan profil.");
      }
    } catch {
      showToast("Kendala koneksi.");
    } finally {
      setSavingProfil(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("tutorId");
    router.push("/login");
  };

  const handleAddTag = () => {
    const tagName = prompt("Masukkan topik spesialisasi atau kurikulum baru:");
    if (tagName && tagName.trim()) {
      setTags([...tags, tagName.trim()]);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const previewPublicCard = () => {
    const card = document.getElementById("sidebar-live-portrait");
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.parentElement?.classList.add("ring-4", "ring-black/20");
      setTimeout(() => card.parentElement?.classList.remove("ring-4", "ring-black/20"), 1500);
    }
  };

  return (
    <div className="bg-[#faf9f7] font-sans text-[#1a1c1b] min-h-screen selection:bg-[#e3e2e0] selection:text-[#1a1c1b]">
      {/* Top Header Khusus Role Tutor */}
      <header className="fixed top-0 w-full z-50 bg-[#faf9f7]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <span className="material-symbols-outlined text-black text-[22px]">flare</span>
              <span className="font-serif text-[1.75rem] tracking-tight text-[#1a1c1b] select-none">
                Lentera Belajar
              </span>
            </Link>
            <span className="text-[#c4c7c7] hidden sm:inline">•</span>
            <span className="text-[0.75rem] font-semibold text-[#444748] uppercase tracking-wider hidden sm:inline bg-[#efeeec] px-3 py-1 rounded-full">
              Portal Tutor
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[0.875rem] font-medium text-[#444748] hover:text-[#1a1c1b] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#efeeec]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Katalog Publik</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-20 bg-[#faf9f7]">
        <div className="flex flex-col w-full">
          {/* Main Teacher Portal Wrapper */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full space-y-8">
            {/* Header & Profile Identity Bento Banner */}
            <header className="bg-[#f4f3f1] rounded-2xl p-6 lg:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#e7e2db]/40 blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Left: Portrait Thumbnail + Identity */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden bg-[#e3e2e0] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.12)]">
                      <img
                        src={foto}
                        alt={currentTutor?.nama || "Tutor"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className="absolute -bottom-2 -right-2 bg-black text-white rounded-full p-1.5 shadow-xs"
                      title="Tutor Terverifikasi"
                    >
                      <span className="material-symbols-outlined text-[16px] block">verified</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="bg-[#e3e2e0] text-[#1a1c1b] text-[0.75rem] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                        Profil Mandiri Tutor
                      </span>
                      <span className="bg-[#faf9f7] text-[#444748] text-[0.75rem] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <span className="w-2 h-2 rounded-full bg-[#1a1c1b]"></span> Akun Terverifikasi
                      </span>
                    </div>

                    <h1 className="font-serif text-[2.25rem] lg:text-[2.5rem] text-[#1a1c1b] tracking-tight leading-tight">
                      {currentTutor?.nama || "Siti Rahmawati, M.Si."}
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[0.8125rem] text-[#444748]">
                      <span className="flex items-center gap-1.5 font-medium text-[#1a1c1b]">
                        <span className="material-symbols-outlined text-[16px] text-[#444748]">
                          biotech
                        </span>
                        {currentTutor?.mataPelajaran.join(", ") || "Kimia, Biologi"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#444748]">
                          chat
                        </span>
                        WhatsApp:{" "}
                        <span className="text-[#1a1c1b] font-mono">
                          {currentTutor?.nomorTelepon || "082198765432"}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 truncate max-w-xs">
                        <span className="material-symbols-outlined text-[16px] text-[#444748]">
                          school
                        </span>
                        {pendidikan.split("•")[0] || "S2 Kimia ITB"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Personal Status & Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-[#faf9f7] text-[#1a1c1b] text-[0.875rem] font-semibold px-4 py-2.5 rounded-full hover:bg-[#e3e2e0] transition-colors shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    Lihat Publik
                  </Link>
                  {hasChanges && (
                    <button
                      type="button"
                      disabled={savingProfil}
                      onClick={() => handleSaveProfile()}
                      className="inline-flex items-center justify-center gap-2 bg-black text-white text-[0.875rem] font-semibold px-5 py-2.5 rounded-full hover:bg-[#444748] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.12)] disabled:opacity-50 animate-in fade-in zoom-in-95 duration-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      {savingProfil ? "Menyimpan..." : "Simpan Profil"}
                    </button>
                  )}
                </div>
              </div>

              {/* Performance Metrics Ribbon */}
              <div className="mt-8 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#faf9f7]/70 rounded-xl p-4 lg:p-5 backdrop-blur-xs">
                <div className="flex items-center gap-3.5 px-2">
                  <div className="w-10 h-10 rounded-full bg-[#efeeec] flex items-center justify-center text-black shrink-0">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </div>
                  <div>
                    <div className="font-serif text-[1.5rem] text-[#1a1c1b] leading-none">
                      4.98<span className="text-[0.8125rem] text-[#444748]">/5.0</span>
                    </div>
                    <div className="text-[0.75rem] text-[#67645f] mt-1 font-medium">
                      Kepuasan Siswa
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 px-2">
                  <div className="w-10 h-10 rounded-full bg-[#efeeec] flex items-center justify-center text-black shrink-0">
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  </div>
                  <div>
                    <div className="font-serif text-[1.5rem] text-[#1a1c1b] leading-none">
                      {hariTersedia.length}
                      <span className="text-[0.8125rem] text-[#444748]"> Hari</span>
                    </div>
                    <div className="text-[0.75rem] text-[#67645f] mt-1 font-medium">
                      Ketersediaan Mingguan
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 px-2">
                  <div className="w-10 h-10 rounded-full bg-[#efeeec] flex items-center justify-center text-black shrink-0">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                  </div>
                  <div>
                    <div className="font-serif text-[1.5rem] text-[#1a1c1b] leading-none">
                      24<span className="text-[0.8125rem] text-[#444748]"> Siswa</span>
                    </div>
                    <div className="text-[0.75rem] text-[#67645f] mt-1 font-medium">
                      Bimbingan Aktif
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 px-2">
                  <div className="w-10 h-10 rounded-full bg-[#efeeec] flex items-center justify-center text-black shrink-0">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                  <div>
                    <div className="font-serif text-[1.5rem] text-[#1a1c1b] leading-none">
                      Aktif
                    </div>
                    <div className="text-[0.75rem] text-[#67645f] mt-1 font-medium">
                      Status Mengajar
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* EDITORIAL PROFIL PUBLIK CANVAS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Primary Form Canvas (8 Columns) */}
              <form
                onSubmit={handleSaveProfile}
                className="lg:col-span-8 space-y-8 bg-white rounded-2xl p-6 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
              >
                {/* SECTION 1: Avatar Selection */}
                <fieldset className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <legend className="font-serif text-[1.5rem] text-[#1a1c1b]">
                        Foto &amp; Avatar Kurator
                      </legend>
                      <p className="text-[0.8125rem] text-[#444748] mt-1">
                        Unggah foto asli Anda langsung dari perangkat atau pilih potret studio kurasi.
                      </p>
                    </div>
                    <span className="font-mono text-[0.75rem] text-[#67645f]">BAGIAN 01/05</span>
                  </div>

                  {/* Opsi Unggah File Langsung dari Komputer / HP */}
                  <div className="p-4 sm:p-5 bg-[#f4f3f1] rounded-2xl border-2 border-dashed border-[#e3e2e0] hover:border-black/50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-black shrink-0">
                        <span className="material-symbols-outlined text-[26px]">add_a_photo</span>
                      </div>
                      <div>
                        <span className="text-[0.875rem] font-semibold text-[#1a1c1b] block">
                          Unggah Foto Asli dari Perangkat
                        </span>
                        <span className="text-[0.75rem] text-[#67645f]">
                          Pilih file JPG, PNG, atau WebP dari laptop / smartphone Anda
                        </span>
                      </div>
                    </div>
                    <label className="cursor-pointer shrink-0 inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-[0.8125rem] font-semibold px-5 py-2.5 rounded-full shadow-xs transition-all w-full sm:w-auto justify-center">
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      <span>Pilih File Gambar</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {/* Koleksi Studio Resmi */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[0.75rem] text-[#444748] font-semibold block">
                      Atau Pilih dari Koleksi Potret Studio Resmi:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3.5">
                      {PRESET_AVATARS.map((url, idx) => {
                        const isSelected = foto === url || selectedPresetIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFoto(url);
                              setSelectedPresetIndex(idx);
                            }}
                            className={`group relative rounded-xl overflow-hidden aspect-square bg-[#efeeec] shadow-xs p-0.5 transition-all ${
                              isSelected ? "bg-black" : "hover:bg-[#e3e2e0]"
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Preset ${idx + 1}`}
                              className="w-full h-full object-cover rounded-[10px]"
                            />
                            {isSelected && (
                              <span className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-[20px]">check</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tautan URL Mandiri */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[0.75rem] text-[#444748] flex items-center justify-between">
                      <span>Atau Masukkan Tautan URL Sumber Foto Mandiri</span>
                      <span className="text-[#67645f]">Mendukung format JPG/PNG/WebP</span>
                    </label>
                    <div className="flex items-center gap-2 bg-[#f4f3f1] rounded-xl px-4 py-2.5 focus-within:bg-[#efeeec] transition-colors">
                      <span className="material-symbols-outlined text-[#444748] text-[20px]">
                        link
                      </span>
                      <input
                        type="text"
                        value={foto}
                        onChange={(e) => {
                          setFoto(e.target.value);
                          setSelectedPresetIndex(-1);
                        }}
                        placeholder="https://..."
                        className="w-full bg-transparent text-[0.8125rem] text-[#1a1c1b] focus:outline-none placeholder:text-[#444748]/60"
                      />
                    </div>
                  </div>
                </fieldset>

                <div className="h-px w-full bg-[#efeeec]"></div>

                {/* SECTION 2: HARI KETERSEDIAAN MENGAJAR (FOKUS HANYA HARI SAJA) */}
                <fieldset className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <legend className="font-serif text-[1.5rem] text-[#1a1c1b]">
                        Hari Ketersediaan Mengajar
                      </legend>
                      <p className="text-[0.8125rem] text-[#444748] mt-1">
                        Pilih hari apa saja Anda siap membimbing siswa. Informasi ini tampil langsung di katalog publik.
                      </p>
                    </div>
                    <span className="font-mono text-[0.75rem] text-[#67645f]">BAGIAN 02/05</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {DAFTAR_HARI.map((hari) => {
                        const isSelected = hariTersedia.includes(hari);
                        return (
                          <button
                            key={hari}
                            type="button"
                            onClick={() => toggleHari(hari)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.75rem] font-medium transition-all ${
                              isSelected
                                ? "bg-black text-white shadow-xs"
                                : "bg-[#f4f3f1] text-[#444748] hover:bg-[#e9e8e6] border border-[#e3e2e0]"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-[14px] ${
                                isSelected ? "text-white" : "text-[#747878]"
                              }`}
                            >
                              {isSelected ? "check" : "calendar_today"}
                            </span>
                            <span>{hari}</span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[0.75rem] text-[#67645f] pt-1">
                      {hariTersedia.length > 0 ? (
                        <>
                          Hari terpilih: <strong className="text-black">{hariTersedia.join(", ")}</strong>
                        </>
                      ) : (
                        <span className="text-amber-700">
                          Belum ada hari yang dipilih. Klik salah satu hari di atas.
                        </span>
                      )}
                    </p>
                  </div>
                </fieldset>

                <div className="h-px w-full bg-[#efeeec]"></div>

                {/* SECTION 3: Academic Background */}
                <fieldset className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <legend className="font-serif text-[1.5rem] text-[#1a1c1b]">
                        Latar Belakang Pendidikan &amp; Gelar
                      </legend>
                      <p className="text-[0.8125rem] text-[#444748] mt-1">
                        Dicantumkan pada kartu ringkas tutor dan kurikulum silabus wali siswa.
                      </p>
                    </div>
                    <span className="font-mono text-[0.75rem] text-[#67645f]">BAGIAN 03/05</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-[0.75rem] text-[#444748]">
                      Gelar, Program Studi, &amp; Almamater Utama
                    </label>
                    <div className="bg-[#f4f3f1] rounded-xl px-4 py-3 focus-within:bg-[#efeeec] transition-colors">
                      <input
                        type="text"
                        value={pendidikan}
                        onChange={(e) => setPendidikan(e.target.value)}
                        placeholder="Contoh: S1 Pendidikan Fisika UI • S2 ITB"
                        className="w-full bg-transparent text-[0.9375rem] text-[#1a1c1b] focus:outline-none"
                      />
                    </div>
                    <p className="text-[0.8125rem] text-[#67645f]">
                      Gunakan tanda titik peluru (•) untuk memisahkan jenjang pendidikan berurutan.
                    </p>
                  </div>

                  {/* Tags Keahlian */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[0.75rem] text-[#444748]">
                      Fokus Materi &amp; Silabus yang Diberikan
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-[#efeeec] px-3 py-1.5 rounded-full text-[0.875rem] text-[#1a1c1b]"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(idx)}
                            className="text-[#444748] hover:text-[#1a1c1b]"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="inline-flex items-center gap-1 bg-[#e3e2e0] hover:bg-[#c4c7c7]/50 text-[#444748] px-3 py-1.5 rounded-full text-[0.875rem] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span> Tambah Tag
                      </button>
                    </div>
                  </div>
                </fieldset>

                <div className="h-px w-full bg-[#efeeec]"></div>

                {/* SECTION 4: Public Bio */}
                <fieldset className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <legend className="font-serif text-[1.5rem] text-[#1a1c1b]">
                        Deskripsi Pengantar Mengajar
                      </legend>
                      <p className="text-[0.8125rem] text-[#444748] mt-1">
                        Tampil secara utuh di Katalog Publik Pengajar Lentera Belajar.
                      </p>
                    </div>
                    <span className="font-mono text-[0.75rem] text-[#67645f]">BAGIAN 04/05</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[0.75rem]">
                      <span className="text-[#444748]">Narasi Pendekatan &amp; Filosofi Bimbingan</span>
                      <span className="text-[#67645f]">{deskripsi.length} / 600 Karakter</span>
                    </div>
                    <div className="bg-[#f4f3f1] rounded-xl p-4 focus-within:bg-[#efeeec] transition-colors">
                      <textarea
                        rows={5}
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        placeholder="Tuliskan pengalaman, gaya bimbingan personal, serta pesan penyemangat bagi calon anak didik..."
                        className="w-full bg-transparent text-[0.9375rem] text-[#1a1c1b] focus:outline-none resize-y leading-relaxed"
                      />
                    </div>

                    <div className="bg-[#e9e8e6]/60 rounded-xl p-3.5 flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#444748] text-[20px] shrink-0 mt-0.5">
                        lightbulb
                      </span>
                      <p className="text-[0.8125rem] text-[#444748] leading-relaxed">
                        <strong>Saran Editorial:</strong> Tuliskan dengan gaya bertutur hangat. Ceritakan bagaimana Anda mendampingi siswa yang kesulitan memahami konsep dasar.
                      </p>
                    </div>
                  </div>
                </fieldset>

                <div className="h-px w-full bg-[#efeeec]"></div>

                {/* SECTION 5: Contact & Preferences */}
                <fieldset className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <legend className="font-serif text-[1.5rem] text-[#1a1c1b]">
                        Kontak &amp; Domisili Bimbingan
                      </legend>
                      <p className="text-[0.8125rem] text-[#444748] mt-1">
                        Saluran komunikasi langsung dan kota jangkauan mengajar.
                      </p>
                    </div>
                    <span className="font-mono text-[0.75rem] text-[#67645f]">BAGIAN 05/05</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[0.75rem] text-[#444748]">
                        Nomor WhatsApp Resmi
                      </label>
                      <div className="bg-[#f4f3f1] rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <span className="text-[0.8125rem] text-[#67645f] font-mono">+62</span>
                        <input
                          type="tel"
                          value={nomorWa}
                          onChange={(e) => setNomorWa(e.target.value)}
                          className="w-full bg-transparent text-[0.9375rem] text-[#1a1c1b] focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[0.75rem] text-[#444748]">Domisili Home-Base Tutor</label>
                      <div className="bg-[#f4f3f1] rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#444748] text-[18px]">
                          location_on
                        </span>
                        <input
                          type="text"
                          value={domisili}
                          onChange={(e) => setDomisili(e.target.value)}
                          className="w-full bg-transparent text-[0.9375rem] text-[#1a1c1b] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Form Submission Footer */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[0.8125rem] text-[#67645f] order-2 sm:order-1">
                    {hasChanges ? (
                      <span className="text-amber-800 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Perubahan belum disimpan
                      </span>
                    ) : (
                      <span>
                        Status: <strong className="text-black">Tersimpan di Cloud</strong>
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={previewPublicCard}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-[0.875rem] font-semibold px-6 py-3 rounded-full transition-colors"
                    >
                      Pratinjau Kartu
                    </button>
                    {hasChanges && (
                      <button
                        type="submit"
                        disabled={savingProfil}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white text-[0.875rem] font-semibold px-7 py-3 rounded-full hover:bg-[#444748] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.15)] disabled:opacity-50 animate-in fade-in duration-200"
                      >
                        {savingProfil ? "Menyimpan..." : "Simpan Profil Saya"}
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Sidebar / Live Preview (4 Columns) */}
              <aside className="lg:col-span-4 space-y-6">
                {/* Live Card Preview */}
                <div className="bg-[#f4f3f1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-black"></span>
                      <h2 className="text-[0.875rem] font-semibold text-[#1a1c1b] uppercase tracking-wider">
                        Pratinjau Kartu Publik
                      </h2>
                    </div>
                    <span className="text-[0.75rem] text-[#444748]">Katalog</span>
                  </div>

                  <div className="relative w-full aspect-[3/4] rounded-[24px] overflow-hidden bg-[#e3e2e0] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)]">
                    <img
                      id="sidebar-live-portrait"
                      src={foto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                      <span className="bg-[#faf9f7]/90 backdrop-blur-md text-[#1a1c1b] text-[0.6875rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        {currentTutor?.mataPelajaran[0] || "Kimia"}
                      </span>
                      <span className="bg-[#faf9f7]/90 backdrop-blur-md text-[#1a1c1b] text-[0.6875rem] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        <span
                          className="material-symbols-outlined text-[13px] text-amber-600"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        5.0
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-lg space-y-1">
                      <h3 className="font-serif text-[1.125rem] text-[#1a1c1b] leading-tight">
                        {currentTutor?.nama || "Siti Rahmawati, M.Si."}
                      </h3>
                      <p className="text-[0.6875rem] text-[#444748] truncate">
                        {pendidikan.split("•")[0] || "S2 Kimia ITB"}
                      </p>
                    </div>
                  </div>

                  {/* Ketersediaan Hari Ringkas pada Pratinjau */}
                  <div className="bg-white rounded-xl p-4 border border-[#e3e2e0] space-y-2">
                    <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#67645f] block">
                      Hari Tersedia Mengajar
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hariTersedia.length > 0 ? (
                        hariTersedia.map((h) => (
                          <span
                            key={h}
                            className="bg-[#efeeec] text-[#1a1c1b] text-[0.75rem] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                            {h}
                          </span>
                        ))
                      ) : (
                        <span className="text-[0.75rem] text-[#67645f] italic">
                          Belum memilih hari ketersediaan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Hubungi */}
                  <div className="bg-[#faf9f7] rounded-xl p-3.5 border border-[#e3e2e0] flex items-center justify-between text-[0.8125rem]">
                    <span className="text-[#67645f]">Konsultasi Siswa:</span>
                    <span className="font-semibold text-[#1a1c1b] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-700">chat</span>
                      WhatsApp Langsung
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white text-[0.875rem] font-semibold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="material-symbols-outlined text-[18px]">done</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-[#f4f3f1] border-t border-[#e3e2e0]/60 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] text-[#67645f]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-[20px]">flare</span>
            <span className="font-serif text-[1.25rem] text-[#1a1c1b]">Lentera Belajar</span>
            <span className="ml-2 text-[#444748]">• Area Mandiri Pengajar</span>
          </div>
          <p>© 2025 - 2026 Lentera Belajar. Hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}
