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

export interface JadwalSlot {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  keterangan: string;
}

let slotCounter = 0;
function createSlotId(hari: string): string {
  slotCounter += 1;
  return `slot-${hari.toLowerCase()}-${slotCounter}`;
}

const parseJadwalToSlots = (rawList?: string[]): JadwalSlot[] => {
  if (!rawList || rawList.length === 0) {
    return [
      { id: createSlotId("Senin"), hari: "Senin", jamMulai: "16:00", jamSelesai: "18:00", keterangan: "Intensif" },
      { id: createSlotId("Rabu"), hari: "Rabu", jamMulai: "16:00", jamSelesai: "18:00", keterangan: "Reguler" },
      { id: createSlotId("Jumat"), hari: "Jumat", jamMulai: "16:00", jamSelesai: "18:00", keterangan: "Klinik Soal" },
    ];
  }

  return rawList.map((str, index) => {
    const colonIdx = str.indexOf(":");
    if (colonIdx === -1) {
      const h = DAFTAR_HARI.find((d) => str.toLowerCase().includes(d.toLowerCase())) || str.trim();
      return {
        id: createSlotId(h || `day-${index}`),
        hari: h,
        jamMulai: "16:00",
        jamSelesai: "18:00",
        keterangan: "Reguler",
      };
    }

    const hari = str.slice(0, colonIdx).trim();
    const rest = str.slice(colonIdx + 1).trim();
    const timeMatch = rest.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    const jamMulai = timeMatch ? timeMatch[1] : "16:00";
    const jamSelesai = timeMatch ? timeMatch[2] : "18:00";
    const ketMatch = rest.match(/\((.*?)\)/);
    const keterangan = ketMatch ? ketMatch[1] : "";

    return {
      id: createSlotId(hari),
      hari,
      jamMulai,
      jamSelesai,
      keterangan,
    };
  });
};

const formatSlotToString = (slot: JadwalSlot): string => {
  if (!slot.jamMulai || !slot.jamSelesai) {
    return slot.keterangan ? `${slot.hari}: Belum atur jam (${slot.keterangan})` : `${slot.hari}: Belum atur jam`;
  }
  const jam = `${slot.jamMulai} - ${slot.jamSelesai} WIB`;
  return slot.keterangan ? `${slot.hari}: ${jam} (${slot.keterangan})` : `${slot.hari}: ${jam}`;
};

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
  const [jadwalSlots, setJadwalSlots] = useState<JadwalSlot[]>([]);

  const [savingProfil, setSavingProfil] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // State Modal Ubah Password dengan OTP
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [otpChannel, setOtpChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSentData, setOtpSentData] = useState<{ target?: string; waUrl?: string; devOtp?: string } | null>(null);

  // Daftar hari unik dari slot yang aktif
  const hariTersedia = Array.from(new Set(jadwalSlots.map((s) => s.hari)));

  // Melacak status apakah ada perubahan data (sedang mengedit)
  const [initialData, setInitialData] = useState<{
    foto: string;
    deskripsi: string;
    pendidikan: string;
    domisili: string;
    nomorWa: string;
    jadwalSlots: JadwalSlot[];
    tags: string[];
  } | null>(null);

  const hasChanges = Boolean(
    initialData &&
    (foto !== initialData.foto ||
      deskripsi !== initialData.deskripsi ||
      pendidikan !== initialData.pendidikan ||
      domisili !== initialData.domisili ||
      nomorWa !== initialData.nomorWa ||
      JSON.stringify(jadwalSlots) !== JSON.stringify(initialData.jadwalSlots) ||
      JSON.stringify(tags) !== JSON.stringify(initialData.tags))
  );

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

    // Ekstrak slot ketersediaan dari data tutor
    const initialSlots = parseJadwalToSlots(t.jadwalTersedia);
    setJadwalSlots(initialSlots);

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
      jadwalSlots: initialSlots,
      tags: [...tags],
    });
  };

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      // Identitas diambil dari cookie sesi server, bukan dari localStorage.
      const me = await fetch("/api/auth/me");
      const meJson = await me.json();
      if (!me.ok || meJson.data?.role !== "tutor") {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/pengajar/${meJson.data.id}`);
      const json = await res.json();
      if (json.success) populateTutor(json.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const exists = jadwalSlots.some((s) => s.hari === hari);
  if (exists) {
    setJadwalSlots(jadwalSlots.filter((s) => s.hari !== hari));
  } else {
    // Ketika dicentang, slot waktu dimulai kosong agar tutor mengisi jam mereka sendiri
    const newSlot: JadwalSlot = {
      id: createSlotId(hari),
      hari,
      jamMulai: "",
      jamSelesai: "",
      keterangan: "Reguler",
    };
    const updated = [...jadwalSlots, newSlot];
    updated.sort((a, b) => DAFTAR_HARI.indexOf(a.hari) - DAFTAR_HARI.indexOf(b.hari));
    setJadwalSlots(updated);
  }
};

// Tambah slot jam baru pada hari tertentu
const addSlotForHari = (hari: string) => {
  const newSlot: JadwalSlot = {
    id: createSlotId(hari),
    hari,
    jamMulai: "",
    jamSelesai: "",
    keterangan: "",
  };
  const updated = [...jadwalSlots, newSlot];
  updated.sort((a, b) => DAFTAR_HARI.indexOf(a.hari) - DAFTAR_HARI.indexOf(b.hari));
  setJadwalSlots(updated);
};

// Ubah nilai pada slot tertentu
const updateSlot = (id: string, field: keyof JadwalSlot, val: string) => {
  setJadwalSlots(
    jadwalSlots.map((s) => (s.id === id ? { ...s, [field]: val } : s))
  );
};

// Hapus satu slot jam tertentu
const removeSlot = (id: string) => {
  setJadwalSlots(jadwalSlots.filter((s) => s.id !== id));
};

// Handler OTP Ubah Password
const handleRequestOtp = async () => {
  setOtpError("");
  setOtpLoading(true);
  try {
    const res = await fetch("/api/tutor/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: otpChannel }),
    });
    const json = await res.json();
    if (json.success) {
      setOtpSentData(json);
      setOtpStep("verify");
      showToast("Kode OTP verifikasi berhasil dibuat.");
    } else {
      setOtpError(json.error || "Gagal mengirim kode OTP.");
    }
  } catch {
    setOtpError("Terjadi kendala koneksi.");
  } finally {
    setOtpLoading(false);
  }
};

const handleVerifyOtpAndChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setOtpError("");

  if (newPassword !== confirmPassword) {
    setOtpError("Konfirmasi password baru tidak cocok.");
    return;
  }

  if (newPassword.length < 8) {
    setOtpError("Password baru minimal 8 karakter.");
    return;
  }

  setOtpLoading(true);
  try {
    const res = await fetch("/api/tutor/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp: otpInput, password: newPassword }),
    });
    const json = await res.json();
    if (json.success) {
      showToast("Password Anda berhasil diperbarui!");
      setIsPasswordModalOpen(false);
      setOtpStep("request");
      setOtpInput("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpSentData(null);
    } else {
      setOtpError(json.error || "Gagal memperbarui password.");
    }
  } catch {
    setOtpError("Terjadi kendala koneksi.");
  } finally {
    setOtpLoading(false);
  }
};

// Simpan Profil & Ketersediaan Hari & Jam
const handleSaveProfile = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  if (!currentTutor) return;

  const incomplete = jadwalSlots.some((s) => !s.jamMulai || !s.jamSelesai);
  if (incomplete) {
    showToast("Lengkapi jam mulai dan jam selesai untuk semua hari yang Anda pilih.");
    return;
  }

  try {
    setSavingProfil(true);
    const serializedJadwal = jadwalSlots
      .filter((s) => s.jamMulai && s.jamSelesai)
      .map(formatSlotToString);

    const res = await fetch(`/api/pengajar/${currentTutor._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foto,
        deskripsi,
        pendidikan,
        alamat: domisili,
        nomorTelepon: nomorWa.startsWith("0") ? nomorWa : `0${nomorWa}`,
        jadwalTersedia: serializedJadwal,
      }),
    });
    const json = await res.json();
    if (json.success) {
      showToast("Profil dan jam ketersediaan mengajar berhasil disimpan.");
      setInitialData({
        foto,
        deskripsi,
        pendidikan,
        domisili,
        nomorWa,
        jadwalSlots: [...jadwalSlots],
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
            jadwalTersedia: serializedJadwal,
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

const handleLogout = async () => {
  await fetch("/api/auth/logout", { method: "POST" });
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
  <div className="bg-[#faf8f5] font-sans text-[#172421] min-h-screen selection:bg-[#F2D5A8] selection:text-[#173F3A]">
    {/* Top Header Khusus Role Tutor */}
    <header className="fixed top-0 w-full z-50 bg-[#faf8f5]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(23,63,58,0.06)] border-b border-[#173F3A]/10">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <img src="/logo.svg" alt="Gen Plasma" className="w-9 h-9 object-contain" />
            <div className="flex flex-col">
              <span className="font-serif text-[1.4rem] leading-none tracking-tight text-[#173F3A] select-none font-bold">
                Gen Plasma
              </span>
              <span className="text-[0.65rem] tracking-wider uppercase text-[#B74E2C] font-semibold">
                Alur Selaras
              </span>
            </div>
          </Link>
          <span className="text-[#173F3A]/30 hidden sm:inline">•</span>
          <span className="text-[0.75rem] font-semibold text-[#173F3A] uppercase tracking-wider hidden sm:inline bg-[#F2D5A8]/60 px-3 py-1 rounded-full border border-[#D88A32]/30">
            Portal Tutor
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-[0.875rem] font-medium text-[#444748] hover:text-[#173F3A] transition-colors flex items-center gap-1.5 px-3.5 py-1.5 rounded-full hover:bg-[#F2D5A8]/40"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Katalog Publik</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setOtpStep("request");
              setOtpError("");
              setIsPasswordModalOpen(true);
            }}
            className="text-[0.8125rem] font-semibold text-[#173F3A] bg-[#F2D5A8]/50 hover:bg-[#F2D5A8] border border-[#D88A32]/30 transition-colors flex items-center gap-1.5 px-3.5 py-1.5 rounded-full"
            title="Ubah kata sandi akun via OTP"
          >
            <span className="material-symbols-outlined text-[16px]">lock_reset</span>
            <span className="hidden sm:inline">Ubah Password</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[0.8125rem] font-medium text-[#ba1a1a] hover:bg-red-50 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-200"
            title="Keluar dari akun tutor"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>

    {/* Main Container */}
    <main className="w-full pt-20 bg-[#faf8f5]">
      {loading && !currentTutor ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-[36px] text-[#173F3A] animate-spin">
              progress_activity
            </span>
            <p className="text-[0.875rem] text-[#444748] font-medium">
              Memuat data profil tutor...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {/* Main Teacher Portal Wrapper */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full space-y-8">
            {/* Header & Profile Identity Bento Banner */}
            <header className="bg-white border border-[#173F3A]/15 rounded-2xl p-6 lg:p-10 shadow-[0_4px_24px_-4px_rgba(23,63,58,0.06)] relative overflow-hidden">
              <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#F2D5A8]/30 blur-3xl pointer-events-none"></div>
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
                    className="inline-flex items-center justify-center gap-2 bg-[#faf8f5] text-[#173F3A] text-[0.875rem] font-semibold px-4 py-2.5 rounded-full hover:bg-[#F2D5A8]/50 border border-[#173F3A]/15 transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    Lihat Publik
                  </Link>
                  {hasChanges && (
                    <button
                      type="button"
                      disabled={savingProfil}
                      onClick={() => handleSaveProfile()}
                      className="inline-flex items-center justify-center gap-2 bg-[#173F3A] text-white text-[0.875rem] font-semibold px-5 py-2.5 rounded-full hover:bg-[#112F2B] transition-all shadow-[0_4px_12px_rgba(23,63,58,0.2)] disabled:opacity-50 animate-in fade-in zoom-in-95 duration-200"
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
                            className={`group relative rounded-xl overflow-hidden aspect-square bg-[#efeeec] shadow-xs p-0.5 transition-all ${isSelected ? "bg-black" : "hover:bg-[#e3e2e0]"
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

                {/* SECTION 2: HARI & JAM KETERSEDIAAN MENGAJAR */}
                <fieldset className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <legend className="font-serif text-[1.5rem] text-[#173F3A] font-bold">
                        Hari &amp; Jam Ketersediaan Mengajar
                      </legend>
                      <p className="text-[0.8125rem] text-[#444748] mt-1">
                        Tentukan hari dan jam Anda siap membimbing. Jam ini akan langsung tampil di kartu katalog publik dan modal penjadwalan siswa.
                      </p>
                    </div>
                    <span className="font-mono text-[0.75rem] text-[#B74E2C] font-semibold">BAGIAN 02/05</span>
                  </div>

                  {/* Pemilihan Hari */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[0.75rem] text-[#444748] font-semibold block">
                      1. Pilih Hari Aktif Mengajar:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {DAFTAR_HARI.map((hari) => {
                        const isSelected = hariTersedia.includes(hari);
                        return (
                          <button
                            key={hari}
                            type="button"
                            onClick={() => toggleHari(hari)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.8125rem] font-semibold transition-all ${isSelected
                              ? "bg-[#173F3A] text-white shadow-xs"
                              : "bg-[#faf8f5] text-[#444748] hover:bg-[#F2D5A8]/50 border border-[#173F3A]/15"
                              }`}
                          >
                            <span
                              className={`material-symbols-outlined text-[15px] ${isSelected ? "text-[#F2D5A8]" : "text-[#747878]"
                                }`}
                            >
                              {isSelected ? "check" : "calendar_today"}
                            </span>
                            <span>{hari}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pengaturan Jam per Hari */}
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.75rem] text-[#444748] font-semibold block">
                        2. Atur Jam &amp; Sesi untuk Hari Terpilih:
                      </span>
                      <span className="text-[0.72rem] text-[#67645f]">
                        Total {jadwalSlots.length} sesi mengajar
                      </span>
                    </div>

                    {hariTersedia.length === 0 ? (
                      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[0.8125rem] text-amber-900 flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-amber-700 text-[20px]">info</span>
                        <span>Silakan klik minimal satu hari di atas untuk mengatur jam mengajar Anda.</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {hariTersedia.map((hari) => {
                          const slotsHari = jadwalSlots.filter((s) => s.hari === hari);
                          return (
                            <div
                              key={hari}
                              className="p-4 bg-[#faf8f5] border border-[#173F3A]/15 rounded-2xl space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-[#173F3A]/10 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#B74E2C]"></span>
                                  <span className="font-serif text-[1.125rem] font-bold text-[#173F3A]">
                                    {hari}
                                  </span>
                                  <span className="text-[0.72rem] font-semibold px-2 py-0.5 rounded-full bg-[#F2D5A8]/60 text-[#173F3A]">
                                    {slotsHari.length} sesi
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addSlotForHari(hari)}
                                  className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-[#B74E2C] hover:text-[#9c3e20] bg-white px-3 py-1 rounded-full border border-[#B74E2C]/30 shadow-xs transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[15px]">add</span>
                                  Tambah Jam Lagi
                                </button>
                              </div>

                              <div className="space-y-3">
                                {slotsHari.map((slot, sIdx) => {
                                  const isFilled = Boolean(slot.jamMulai && slot.jamSelesai);
                                  return (
                                    <div
                                      key={slot.id}
                                      className="p-4 bg-white rounded-2xl border-2 border-[#173F3A]/15 hover:border-[#173F3A]/30 transition-all shadow-xs space-y-3"
                                    >
                                      <div className="flex items-center justify-between border-b border-[#173F3A]/10 pb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="w-6 h-6 rounded-full bg-[#173F3A] text-white text-[0.75rem] font-bold flex items-center justify-center">
                                            {sIdx + 1}
                                          </span>
                                          <span className="text-[0.875rem] font-bold text-[#173F3A]">
                                            Sesi Mengajar ke-{sIdx + 1} ({hari})
                                          </span>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => removeSlot(slot.id)}
                                          title="Hapus sesi ini"
                                          className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-full transition-colors"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">delete</span>
                                          <span>Hapus Sesi</span>
                                        </button>
                                      </div>

                                      {/* Baris Input Form Jam & Keterangan */}
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {/* Jam Mulai */}
                                        <div className="space-y-1">
                                          <label className="block text-[0.75rem] font-semibold text-[#444748] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-[#173F3A]">schedule</span>
                                            <span>Jam Mulai</span>
                                            <span className="text-rose-500">*</span>
                                          </label>
                                          <input
                                            type="time"
                                            value={slot.jamMulai}
                                            onChange={(e) => updateSlot(slot.id, "jamMulai", e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-[0.875rem] font-bold text-[#173F3A] bg-[#faf8f5] border-2 border-[#173F3A]/20 focus:border-[#173F3A] focus:bg-white rounded-xl focus:outline-none transition-colors"
                                          />
                                        </div>

                                        {/* Jam Selesai */}
                                        <div className="space-y-1">
                                          <label className="block text-[0.75rem] font-semibold text-[#444748] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-[#173F3A]">update</span>
                                            <span>Jam Selesai</span>
                                            <span className="text-rose-500">*</span>
                                          </label>
                                          <input
                                            type="time"
                                            value={slot.jamSelesai}
                                            onChange={(e) => updateSlot(slot.id, "jamSelesai", e.target.value)}
                                            className="w-full px-3.5 py-2.5 text-[0.875rem] font-bold text-[#173F3A] bg-[#faf8f5] border-2 border-[#173F3A]/20 focus:border-[#173F3A] focus:bg-white rounded-xl focus:outline-none transition-colors"
                                          />
                                        </div>

                                        {/* Keterangan Kelas */}
                                        <div className="space-y-1">
                                          <label className="block text-[0.75rem] font-semibold text-[#444748] flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] text-[#B74E2C]">label</span>
                                            <span>Jenis / Keterangan Sesi</span>
                                          </label>
                                          <input
                                            type="text"
                                            value={slot.keterangan}
                                            onChange={(e) => updateSlot(slot.id, "keterangan", e.target.value)}
                                            placeholder="Contoh: Reguler, Privat, Klinik Soal"
                                            className="w-full px-3.5 py-2.5 text-[0.8125rem] text-[#173F3A] bg-[#faf8f5] border border-[#173F3A]/20 focus:border-[#173F3A] focus:bg-white rounded-xl focus:outline-none transition-colors placeholder:text-[#67645f]/60"
                                          />
                                        </div>
                                      </div>

                                      {/* Status Indikator Sesi */}
                                      <div className="pt-2 border-t border-[#173F3A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[0.75rem]">
                                        {isFilled ? (
                                          <div className="flex items-center gap-1.5 text-emerald-700">
                                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                            <span className="font-semibold">
                                              Sesi aktif: {slot.jamMulai} - {slot.jamSelesai} WIB {slot.keterangan ? `(${slot.keterangan})` : ""}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1.5 text-amber-700">
                                            <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                                            <span>Silakan atur jam mulai dan jam selesai untuk sesi ini</span>
                                          </div>
                                        )}

                                        <span className="font-mono text-[0.72rem] text-[#173F3A] bg-[#F2D5A8]/50 px-2.5 py-0.5 rounded-full font-semibold self-start sm:self-auto">
                                          {formatSlotToString(slot)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

                <div className="h-px w-full bg-[#efeeec]"></div>

                {/* SECTION 6: KEAMANAN AKUN & UBAH PASSWORD */}
                <div className="p-5 bg-[#faf8f5] border border-[#173F3A]/15 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#F2D5A8] flex items-center justify-center text-[#173F3A] shrink-0">
                      <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                    </span>
                    <div>
                      <h4 className="font-serif text-[1rem] font-bold text-[#173F3A]">
                        Keamanan &amp; Kata Sandi Akun
                      </h4>
                      <p className="text-[0.75rem] text-[#444748]">
                        Ubah password login Anda kapan saja dengan verifikasi kode OTP via WhatsApp atau Email.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep("request");
                      setOtpError("");
                      setIsPasswordModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#173F3A] hover:bg-[#112F2B] text-white text-[0.8125rem] font-semibold rounded-full transition-all shadow-xs shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">key</span>
                    <span>Ubah Password via OTP</span>
                  </button>
                </div>

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
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#173F3A] text-white text-[0.875rem] font-semibold px-7 py-3 rounded-full hover:bg-[#112F2B] transition-all shadow-[0_4px_16px_rgba(23,63,58,0.2)] disabled:opacity-50 animate-in fade-in duration-200"
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
                <div className="bg-white rounded-2xl p-6 border border-[#173F3A]/15 shadow-[0_2px_12px_rgba(23,63,58,0.04)] space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#173F3A]"></span>
                      <h2 className="text-[0.875rem] font-semibold text-[#173F3A] uppercase tracking-wider">
                        Pratinjau Kartu Publik
                      </h2>
                    </div>
                    <span className="text-[0.75rem] text-[#444748]">Katalog</span>
                  </div>

                  <div className="relative w-full aspect-[3/4] rounded-[24px] overflow-hidden bg-[#faf8f5] shadow-[0_12px_32px_-8px_rgba(23,63,58,0.15)]">
                    <img
                      id="sidebar-live-portrait"
                      src={foto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                      <span className="bg-[#faf8f5]/90 backdrop-blur-md text-[#173F3A] text-[0.6875rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs border border-[#173F3A]/10">
                        {currentTutor?.mataPelajaran[0] || "Kimia"}
                      </span>
                      <span className="bg-[#faf8f5]/90 backdrop-blur-md text-[#173F3A] text-[0.6875rem] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-[#D88A32]/30">
                        <span
                          className="material-symbols-outlined text-[13px] text-[#D88A32]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        5.0
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-lg space-y-1 border border-[#173F3A]/10">
                      <h3 className="font-serif text-[1.125rem] text-[#173F3A] font-bold leading-tight">
                        {currentTutor?.nama || "Siti Rahmawati, M.Si."}
                      </h3>
                      <p className="text-[0.6875rem] text-[#444748] truncate">
                        {pendidikan.split("•")[0] || "S2 Kimia ITB"}
                      </p>
                    </div>
                  </div>

                  {/* Ketersediaan Hari & Jam Ringkas pada Pratinjau */}
                  <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#173F3A]/15 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#173F3A] block">
                        Jadwal &amp; Jam Mengajar Publik
                      </span>
                      <span className="text-[0.7rem] text-[#B74E2C] font-semibold">
                        {jadwalSlots.length} Sesi
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {jadwalSlots.length > 0 ? (
                        jadwalSlots.map((s) => (
                          <div
                            key={s.id}
                            className="bg-white text-[#173F3A] text-[0.72rem] font-medium px-2.5 py-1.5 rounded-lg border border-[#173F3A]/10 flex items-center justify-between gap-1 shadow-2xs"
                          >
                            <span className="font-semibold">{s.hari}:</span>
                            <span className="font-mono text-[0.7rem]">{s.jamMulai}-{s.jamSelesai}</span>
                            {s.keterangan && (
                              <span className="text-[0.65rem] bg-[#F2D5A8]/70 text-[#173F3A] px-1.5 py-0.5 rounded font-semibold">
                                {s.keterangan}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-[0.75rem] text-[#67645f] italic">
                          Belum memilih hari &amp; jam ketersediaan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Hubungi */}
                  <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#173F3A]/15 flex items-center justify-between text-[0.8125rem]">
                    <span className="text-[#67645f]">Konsultasi Siswa:</span>
                    <span className="font-semibold text-[#173F3A] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-700">chat</span>
                      WhatsApp Langsung
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      )}
    </main>

    {/* Modal Ubah Password dengan OTP */}
    {isPasswordModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-[#173F3A]/20 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#173F3A]/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-[#F2D5A8] flex items-center justify-center text-[#173F3A]">
                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
              </span>
              <div>
                <h3 className="font-serif text-[1.25rem] font-bold text-[#173F3A]">
                  Ubah Password Akun
                </h3>
                <p className="text-[0.75rem] text-[#67645f]">
                  Verifikasi identitas via kode OTP demi keamanan
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setOtpStep("request");
                setOtpError("");
              }}
              className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-[#444748]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {otpError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[0.8125rem]">
              {otpError}
            </div>
          )}

          {otpStep === "request" ? (
            <div className="space-y-5">
              <p className="text-[0.8125rem] text-[#444748] leading-relaxed">
                Pilih saluran untuk menerima 6 digit kode OTP verifikasi kata sandi:
              </p>

              <div className="space-y-2.5">
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    otpChannel === "whatsapp"
                      ? "border-[#173F3A] bg-[#173F3A]/5"
                      : "border-[#173F3A]/15 bg-white hover:bg-[#faf8f5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="otpChannel"
                      checked={otpChannel === "whatsapp"}
                      onChange={() => setOtpChannel("whatsapp")}
                      className="accent-[#173F3A]"
                    />
                    <div>
                      <div className="text-[0.875rem] font-bold text-[#173F3A] flex items-center gap-1.5">
                        <span>WhatsApp</span>
                        <span className="text-[0.7rem] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-normal">
                          Rekomendasi
                        </span>
                      </div>
                      <div className="text-[0.75rem] text-[#67645f]">
                        Kirim ke {nomorWa ? `0${nomorWa.replace(/^0+/, "")}` : "Nomor WhatsApp Anda"}
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-emerald-600">chat</span>
                </label>

                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    otpChannel === "email"
                      ? "border-[#173F3A] bg-[#173F3A]/5"
                      : "border-[#173F3A]/15 bg-white hover:bg-[#faf8f5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="otpChannel"
                      checked={otpChannel === "email"}
                      onChange={() => setOtpChannel("email")}
                      className="accent-[#173F3A]"
                    />
                    <div>
                      <div className="text-[0.875rem] font-bold text-[#173F3A]">Email</div>
                      <div className="text-[0.75rem] text-[#67645f]">
                        {currentTutor?.email || "Alamat email terdaftar"}
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#B74E2C]">mail</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={otpLoading}
                  className="w-full py-3 px-5 bg-[#173F3A] hover:bg-[#12312d] text-white rounded-full text-[0.875rem] font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Mengirim Kode OTP...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Kirim Kode OTP Verifikasi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtpAndChangePassword} className="space-y-4">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[0.8125rem] text-amber-900 font-medium">
                  <span>OTP dikirim ke {otpSentData?.target || "kontak Anda"}</span>
                  <button
                    type="button"
                    onClick={() => setOtpStep("request")}
                    className="text-[0.75rem] underline font-semibold text-[#173F3A]"
                  >
                    Ganti Saluran
                  </button>
                </div>

                {otpSentData?.waUrl && (
                  <div className="pt-1">
                    <a
                      href={otpSentData.waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">chat</span>
                      <span>Buka WhatsApp &amp; Salin OTP</span>
                    </a>
                  </div>
                )}

                {otpSentData?.devOtp && (
                  <div className="text-[0.75rem] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-mono">
                    Kode OTP: <strong>{otpSentData.devOtp}</strong> (Berlaku 10 menit)
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                  Masukkan 6 Digit Kode OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Contoh: 123456"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2.5 text-[1.125rem] font-mono tracking-widest text-center bg-[#faf8f5] border-2 border-[#173F3A]/20 rounded-xl text-[#173F3A] focus:outline-none focus:border-[#173F3A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-11 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl focus:outline-none focus:border-[#173F3A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67645f] hover:text-[#173F3A] p-1 flex items-center justify-center transition-colors"
                    title={showNewPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNewPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="Ulangi password baru Anda"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3.5 pr-11 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl focus:outline-none focus:border-[#173F3A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67645f] hover:text-[#173F3A] p-1 flex items-center justify-center transition-colors"
                    title={showConfirmPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setOtpStep("request");
                  }}
                  className="px-4 py-2 rounded-full text-[0.8125rem] font-medium text-[#444748] hover:bg-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="px-5 py-2.5 bg-[#173F3A] hover:bg-[#12312d] text-white rounded-full text-[0.8125rem] font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  {otpLoading ? "Memverifikasi..." : "Verifikasi & Simpan Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}

    {/* Floating Toast Notice */}
    {toastMessage && (
      <div className="fixed bottom-6 right-6 z-50 bg-[#173F3A] text-white text-[0.875rem] font-semibold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <span className="material-symbols-outlined text-[18px]">done</span>
        <span>{toastMessage}</span>
      </div>
    )}

    {/* Footer */}
    <footer className="w-full bg-[#f2efe9] border-t border-[#173F3A]/10 mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] text-[#67645f]">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Gen Plasma" className="w-6 h-6 object-contain" />
          <span className="font-serif text-[1.25rem] text-[#173F3A] font-bold">Gen Plasma</span>
          <span className="text-[#B74E2C] font-semibold">• Alur Selaras</span>
          <span className="ml-2 text-[#444748]">• Area Mandiri Pengajar</span>
        </div>
        <p>© 2025 - 2026 Gen Plasma — Alur Selaras. Hak cipta dilindungi undang-undang.</p>
      </div>
    </footer>
  </div>
  );
}