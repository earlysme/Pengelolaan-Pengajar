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
  ipk?: string;
  mataPelajaran: string[];
  jenjang: string[];
  status: string;
  alamat?: string;
  jadwalTersedia?: string[];
  fokusMateri?: string[];
}

const PRESET_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC_m5DP1BIO_Q-qsuUAqTmcv4kueJcNR4SQNqhdQLR8ELgHzxRrIqLEsixkl0IA2UHjbmIdqsnZQVdekL5AaC5RbhI_cUixhbrpECjOdxXwld1yoMP3fl4xbaROETACVuNH7ZexZDz3HNqshlEd2xFtmVlL_yhUVePiNdB-PngGIJR5zAH67beOUo7gAjwoFUfsbiDOykw28YYfJlc1sFtygyj2PvO-bw2MJ-mD1-N4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDaWuJy7vu8MeGSV-L8ziXfK_UDEk247NvvuiFDoO6ALIf64haRtliwMGFuUcHVzVl0WdZKWgnatPxjJ5pAQl-h0aEJ3Mb37oH55PB3tl-sdC7RP7QUMxwXTvmdmZn3Qg187ngOKnDYQNU-XRl5inGThJRgKnhr6XgTMLRDOrb60laahQ0cXMBz4bpb6-9roqxpt3aA8hh4GKkjT-vt0cuTfZQ127YXlwlscaPA-8ww",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDDiEJGUyyuR30LiC8Rl6agVELH3qpsOPoTIWZTgo_IrWaLL2Y9G5VpPUfSuOlGpl2OYri7aPQX13G8xyCik3FHuv8-h6fjBav1Bv6emuNVzrAnQM0_FrdTeFOdXNIuLx8a66NZAesWSeoC2EnhwaV2x-qiHDQEd-oajcyTQUz9z0O6AQP_muN1rr0GigMz6_rvOFJIqqK-hKJBgvI7jHTuh5wb3HNgn1EDqcocR32J",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA3fwfN42rUPz7L2HAvSBbL_LRO_Jv1wpi7EAarU2emDcptT2GvztEkFQM8hWb-sgN9hGC64XdKC5PV9TgHTTAuzzykstOlhRSXyXYepZwBhgH-dMtMGWbbf_bLk_J0yoY0UNmopJIi2nHXiGVkNecHITpOggRhNDDyeFNcmVxGBenbj3UT52NIp5lOrKYCFC1uGKzT2DD-1tHcbvkHdFEe_hROnrcW08EcjCGIWAUg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwUEa5yq3-JBJJf8ATEEq02ZSgWi1LB5k3woETx36D7-ARZXzIo2hHFlXOghS0PqJUBhA_G1ZCj4syFKGz_epMMD4TC53FjE-rrWrAP95LbMXSzI2P2Rq1mgU1UVFJuwfJFQqXDehIjrFyJy519jXnL2JJ5yP6Loapn4mGcz9e_pVi_jyUdw233WBUfYBTysM6LdW9Y9dO11T46jpHRB9VPXYA4-TvBSk78k6fn9Wz",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHB51zhe7ysp42hrFuGrCikXhhJO5DN2gO8JqKp2yu12nNSMQjZmRglPQkjFjSKmhPGQ-tFodkfG-0yooYJBUkolpC1XulfmLDefheJeqKIRUwrYezHu6AwMmUND4OGzfxk2L9FHjQptypRRe0z-h4D5gf8xqpcUGrGVe_7t4ik20-JGh9I7mjTqVMj2xpHNplKu6S6fDlOVxHPj3zIi6DjM51tFaqYP7h5HOAgclN",
];

const cleanMapelName = (name: string): string => {
  return name.replace(/\s*\/?\s*utbk/gi, "").trim();
};

/** Avatar netral dari inisial nama — dipakai selama tutor belum punya foto sendiri. */
const avatarFallbackUrl = (nama?: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(nama || "Tutor")}&background=173F3A&color=ffffff&bold=true`;

const DAFTAR_HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Periode tunggal yang dipakai modul "Ketersediaan" koordinator (lihat model Ketersediaan).
const PERIODE_KETERSEDIAAN = "Periode Berjalan 2026/2027";

export interface JadwalSlot {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  keterangan: string;
  jenjang?: string[];
}

let slotCounter = 0;
function createSlotId(hari: string): string {
  slotCounter += 1;
  return `slot-${hari.toLowerCase()}-${Date.now()}-${slotCounter}-${Math.random().toString(36).substring(2, 6)}`;
}

const parseJadwalToSlots = (rawList?: string[], defaultJenjang?: string[]): JadwalSlot[] => {
  const cleanDefault = (defaultJenjang || []).filter((j) => !/utbk/i.test(j));
  const fallback = cleanDefault.length > 0 ? cleanDefault : ["SMA"];

  if (!rawList || rawList.length === 0) {
    // Tidak ada jadwal di database = belum ada sesi. Jangan mengarang slot default,
    // karena slot karangan akan tampil berbeda dari panel koordinator dan ikut tersimpan.
    return [];
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
        jenjang: [...fallback],
      };
    }

    const hari = str.slice(0, colonIdx).trim();
    const rest = str.slice(colonIdx + 1).trim();
    const timeMatch = rest.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    const jamMulai = timeMatch ? timeMatch[1] : "16:00";
    const jamSelesai = timeMatch ? timeMatch[2] : "18:00";
    const ketMatch = rest.match(/\((.*?)\)/);
    const parenContent = ketMatch ? ketMatch[1] : "";
    const jenjangFound: string[] = [];
    if (/\bsd\b/i.test(parenContent)) jenjangFound.push("SD");
    if (/\bsmp\b/i.test(parenContent)) jenjangFound.push("SMP");
    if (/\bsma\b/i.test(parenContent)) jenjangFound.push("SMA");
    if (/\bkedinasan\b/i.test(parenContent)) jenjangFound.push("Kedinasan");

    const progFound: string[] = [];
    if (/reguler/i.test(parenContent)) progFound.push("Reguler");
    if (/private/i.test(parenContent)) progFound.push("Private");

    let slotJenjang: string[] = [];
    if (jenjangFound.length > 0) {
      slotJenjang = jenjangFound;
    } else {
      slotJenjang = [...fallback];
    }

    return {
      id: createSlotId(hari),
      hari,
      jamMulai,
      jamSelesai,
      keterangan: progFound.join(", "),
      jenjang: slotJenjang,
    };
  });
};

interface MasterSesiItem {
  _id: string;
  nama: string;
  hariGroup: string;
  hari: string[];
  jamMulai: string;
  jamSelesai: string;
  waktuLabel: string;
  durasiMenit: number;
  urutan: number;
  aktif: boolean;
}

const getPresetsByDay = (hari: string, masterList?: MasterSesiItem[]) => {
  if (masterList && masterList.length > 0) {
    const filtered = masterList.filter((m) => m.hari.includes(hari));
    if (filtered.length > 0) {
      return filtered.map((m) => ({
        label: `${m.nama} (${m.waktuLabel} WIB)`,
        jamMulai: m.jamMulai,
        jamSelesai: m.jamSelesai,
      }));
    }
  }

  // Fallback resmi database bimbingan belajar jika offline/loading:
  if (hari === "Sabtu") {
    return [
      { label: "Sesi 1 (09.00 - 10.15 WIB)", jamMulai: "09:00", jamSelesai: "10:15" },
      { label: "Sesi 2 (10.15 - 11.30 WIB)", jamMulai: "10:15", jamSelesai: "11:30" },
      { label: "Sesi 3 (11.30 - 12.45 WIB)", jamMulai: "11:30", jamSelesai: "12:45" },
      { label: "Sesi 4 (13.00 - 14.15 WIB)", jamMulai: "13:00", jamSelesai: "14:15" },
      { label: "Sesi 5 (14.15 - 15.30 WIB)", jamMulai: "14:15", jamSelesai: "15:30" },
      { label: "Sesi 6 (15.30 - 16.45 WIB)", jamMulai: "15:30", jamSelesai: "16:45" },
      { label: "Sesi 7 (16.45 - 18.00 WIB)", jamMulai: "16:45", jamSelesai: "18:00" },
      { label: "Sesi 8 (18.00 - 19.15 WIB)", jamMulai: "18:00", jamSelesai: "19:15" },
    ];
  }

  if (hari === "Jumat") {
    return [
      { label: "Sesi 1 (11.30 - 12.45 WIB)", jamMulai: "11:30", jamSelesai: "12:45" },
      { label: "Sesi 2 (13.00 - 14.15 WIB)", jamMulai: "13:00", jamSelesai: "14:15" },
      { label: "Sesi 3 (14.30 - 15.45 WIB)", jamMulai: "14:30", jamSelesai: "15:45" },
      { label: "Sesi 4 (16.00 - 17.15 WIB)", jamMulai: "16:00", jamSelesai: "17:15" },
      { label: "Sesi 5 (17.15 - 18.30 WIB)", jamMulai: "17:15", jamSelesai: "18:30" },
      { label: "Sesi 6 (18.45 - 20.00 WIB)", jamMulai: "18:45", jamSelesai: "20:00" },
    ];
  }

  // Default Senin s/d Kamis:
  return [
    { label: "Sesi 1 (13.00 - 14.15 WIB)", jamMulai: "13:00", jamSelesai: "14:15" },
    { label: "Sesi 2 (14.30 - 15.45 WIB)", jamMulai: "14:30", jamSelesai: "15:45" },
    { label: "Sesi 3 (16.00 - 17.15 WIB)", jamMulai: "16:00", jamSelesai: "17:15" },
    { label: "Sesi 4 (17.15 - 18.30 WIB)", jamMulai: "17:15", jamSelesai: "18:30" },
    { label: "Sesi 5 (18.45 - 20.00 WIB)", jamMulai: "18:45", jamSelesai: "20:00" },
  ];
};

const formatSlotToString = (slot: JadwalSlot): string => {
  const parts: string[] = [];
  if (slot.keterangan) parts.push(slot.keterangan);
  if (slot.jenjang && slot.jenjang.length > 0) parts.push(slot.jenjang.join(", "));
  const label = parts.length > 0 ? ` (${parts.join(" • ")})` : "";

  if (!slot.jamMulai || !slot.jamSelesai) {
    return `${slot.hari}: Belum atur jam${label}`;
  }
  const jam = `${slot.jamMulai} - ${slot.jamSelesai} WIB`;
  return `${slot.hari}: ${jam}${label}`;
};

export default function AreaTutor() {
  const router = useRouter();
  const [currentTutor, setCurrentTutor] = useState<PengajarData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Profil Data
  const [foto, setFoto] = useState("");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(-1);
  const [deskripsi, setDeskripsi] = useState("");
  const [pendidikan, setPendidikan] = useState("");
  const [ipk, setIpk] = useState("");
  const [tutorStatus, setTutorStatus] = useState<"Aktif" | "Cuti">("Aktif");
  const [tags, setTags] = useState<string[]>([]);
  const [domisili, setDomisili] = useState("");
  const [nomorWa, setNomorWa] = useState("");
  const [jadwalSlots, setJadwalSlots] = useState<JadwalSlot[]>([]);
  const [masterSesiList, setMasterSesiList] = useState<MasterSesiItem[]>([]);

  const [savingProfil, setSavingProfil] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);

  // State Modal Ubah Password Manual (Tanpa OTP)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showForgotInfo, setShowForgotInfo] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Daftar hari unik dari slot yang aktif
  const hariTersedia = Array.from(new Set(jadwalSlots.map((s) => s.hari)));

  // "Nonaktif" hanya bisa diubah koordinator; tampilkan apa adanya agar identik dengan panel koordinator.
  const akunDinonaktifkan = currentTutor?.status === "Nonaktif";
  const statusTampil = akunDinonaktifkan ? "Nonaktif" : tutorStatus;

  // Master jenjang bimbingan belajar (tutor bebas memilih semua jenjang di setiap sesinya)
  const [masterJenjangList, setMasterJenjangList] = useState<string[]>(["SD", "SMP", "SMA", "Kedinasan"]);
  const allJenjangOptions = (
    masterJenjangList && masterJenjangList.length > 0
      ? masterJenjangList
      : ["SD", "SMP", "SMA", "Kedinasan"]
  ).filter((j) => !/utbk/i.test(j));

  // Melacak status apakah ada perubahan data (sedang mengedit)
  const [initialData, setInitialData] = useState<{
    foto: string;
    deskripsi: string;
    pendidikan: string;
    ipk: string;
    domisili: string;
    nomorWa: string;
    status: "Aktif" | "Cuti";
    jadwalSlots: JadwalSlot[];
    tags: string[];
  } | null>(null);

  const hasChanges = Boolean(
    initialData &&
    (foto !== initialData.foto ||
      deskripsi !== initialData.deskripsi ||
      pendidikan !== initialData.pendidikan ||
      ipk !== initialData.ipk ||
      domisili !== initialData.domisili ||
      nomorWa !== initialData.nomorWa ||
      tutorStatus !== initialData.status ||
      JSON.stringify(jadwalSlots) !== JSON.stringify(initialData.jadwalSlots) ||
      JSON.stringify(tags) !== JSON.stringify(initialData.tags))
  );

  const populateTutor = (t: PengajarData) => {
    setCurrentTutor(t);

    // Semua nilai diambil apa adanya dari database — tidak ada lagi data karangan.
    // Dengan begitu yang dilihat tutor identik dengan yang dilihat koordinator.
    const initialFoto = t.foto || "";
    const initialDesk = t.deskripsi || "";
    const initialPend = t.pendidikan || "";
    const initialIpk = t.ipk || "";
    const initialWa = t.nomorTelepon ? t.nomorTelepon.replace(/^(\+62|62|0)/, "") : "";
    const initialDom = t.alamat || "";
    // Ekstrak slot ketersediaan dari data tutor (kosong jika belum pernah diatur)
    const initialSlots = parseJadwalToSlots(t.jadwalTersedia, t.jenjang);
    const initialTags = [...(t.fokusMateri || [])];

    setFoto(initialFoto);
    setSelectedPresetIndex(PRESET_AVATARS.indexOf(initialFoto));
    setTutorStatus(t.status === "Cuti" ? "Cuti" : "Aktif");
    setDeskripsi(initialDesk);
    setPendidikan(initialPend);
    setIpk(initialIpk);
    setNomorWa(initialWa);
    setDomisili(initialDom);
    setJadwalSlots(initialSlots);
    setTags(initialTags);

    setInitialData({
      foto: initialFoto,
      deskripsi: initialDesk,
      pendidikan: initialPend,
      ipk: initialIpk,
      domisili: initialDom,
      nomorWa: initialWa,
      status: t.status === "Cuti" ? "Cuti" : "Aktif",
      jadwalSlots: initialSlots,
      tags: initialTags,
    });
  };

  const getAuthHeader = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("genplasma_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.token) return { Authorization: `Bearer ${parsed.token}` };
      }
    } catch { }
    return {};
  };

  const fetchMyProfile = async (): Promise<PengajarData | null> => {
    try {
      const authHeader = getAuthHeader();
      const me = await fetch("/api/auth/me", {
        headers: authHeader,
        cache: "no-store",
        credentials: "include",
      });
      const meJson = await me.json();

      // Jika akses di-reset oleh koordinator, langsung keluarkan dan arahkan ke login dengan info jelas
      if (meJson.isReset) {
        if (typeof window !== "undefined") localStorage.removeItem("genplasma_session");
        router.push("/login?reason=reset");
        return null;
      }

      let tutorId = meJson.data?.id;

      if (!me.ok || meJson.data?.role !== "tutor") {
        // Cek fallback localStorage jika ada glitch jaringan saat refresh
        if (typeof window !== "undefined") {
          try {
            const saved = localStorage.getItem("genplasma_session");
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.role === "tutor" && parsed.id) {
                tutorId = parsed.id;
              }
            }
          } catch { }
        }

        if (!tutorId) {
          if (typeof window !== "undefined") localStorage.removeItem("genplasma_session");
          router.push("/login");
          return null;
        }
      }

      const res = await fetch(`/api/pengajar/${tutorId}`, {
        headers: authHeader,
        cache: "no-store",
      });
      const json = await res.json();
      return json.success ? (json.data as PengajarData) : null;
    } catch {
      // Fallback network error
      try {
        const saved = localStorage.getItem("genplasma_session");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.role === "tutor" && parsed.id) {
            const res = await fetch(`/api/pengajar/${parsed.id}`, { cache: "no-store" });
            const json = await res.json();
            return json.success ? (json.data as PengajarData) : null;
          }
        }
      } catch { }
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    void fetchMyProfile()
      .then((tutor) => {
        if (!cancelled && tutor) populateTutor(tutor);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Ambil master sesi bimbingan belajar dari database
    fetch("/api/master/sesi")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j.success && Array.isArray(j.data)) {
          setMasterSesiList(j.data);
        }
      })
      .catch(() => { });

    // Ambil master jenjang dari database agar pilihan selalu mutakhir
    fetch("/api/master/jenjang")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j.success && Array.isArray(j.data) && j.data.length > 0) {
          setMasterJenjangList(j.data.map((item: { nama: string }) => item.nama));
        }
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
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
    setJadwalSlots((prev) => {
      const exists = prev.some((s) => s.hari === hari);
      if (exists) {
        return prev.filter((s) => s.hari !== hari);
      } else {
        // Ketika dicentang, slot waktu dimulai kosong agar tutor mengisi jam mereka sendiri
        const newSlot: JadwalSlot = {
          id: createSlotId(hari),
          hari,
          jamMulai: "",
          jamSelesai: "",
          keterangan: "",
          jenjang: [],
        };
        const updated = [...prev, newSlot];
        updated.sort((a, b) => DAFTAR_HARI.indexOf(a.hari) - DAFTAR_HARI.indexOf(b.hari));
        return updated;
      }
    });
  };

  // Tambah slot jam baru pada hari tertentu
  const addSlotForHari = (hari: string) => {
    const newSlot: JadwalSlot = {
      id: createSlotId(hari),
      hari,
      jamMulai: "",
      jamSelesai: "",
      keterangan: "",
      jenjang: [],
    };
    setJadwalSlots((prev) => {
      const updated = [...prev, newSlot];
      updated.sort((a, b) => DAFTAR_HARI.indexOf(a.hari) - DAFTAR_HARI.indexOf(b.hari));
      return updated;
    });
  };

  // Ubah nilai pada slot tertentu
  const updateSlot = (id: string, updates: Partial<JadwalSlot>) => {
    setJadwalSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Hapus satu slot jam tertentu
  const removeSlot = (id: string) => {
    setJadwalSlots((prev) => prev.filter((s) => s.id !== id));
  };

  // Handler Ubah Password Manual (Tanpa OTP)
  const handleManualChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Password saat ini wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("Password baru tidak boleh sama dengan password saat ini.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/tutor/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Password akun Anda berhasil diperbarui!");
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowForgotInfo(false);
      } else {
        setPasswordError(json.error || "Gagal memperbarui password.");
      }
    } catch {
      setPasswordError("Terjadi kendala koneksi.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handler Ubah Status Ketersediaan Otomatis (Langsung sync ke MongoDB & Koordinator)
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const handleStatusChange = async (newStatus: "Aktif" | "Cuti") => {
    if (akunDinonaktifkan) return;
    setTutorStatus(newStatus);
    if (!currentTutor) return;
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/pengajar/${currentTutor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentTutor((prev) => (prev ? { ...prev, status: newStatus } : prev));
        showToast(
          newStatus === "Cuti"
            ? "Status berhasil diubah ke 'Sedang Cuti'. Akun tetap aktif di panel koordinator."
            : "Status berhasil diubah ke 'Aktif Mengajar'."
        );
      } else {
        showToast(json.error || "Gagal memperbarui status.");
        setTutorStatus(currentTutor.status === "Cuti" ? "Cuti" : "Aktif");
      }
    } catch {
      showToast("Gagal memperbarui status ketersediaan.");
      setTutorStatus(currentTutor.status === "Cuti" ? "Cuti" : "Aktif");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Simpan Profil & Ketersediaan Hari & Jam
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentTutor) return;

    // Validasi slot ketersediaan (harus sudah memilih sesi jadwal & memilih minimal satu program)
    for (const s of jadwalSlots) {
      if (!s.jamMulai || !s.jamSelesai) {
        const targetId = `slot-card-${s.id}`;
        setHighlightedFieldId(targetId);
        showToast(`Pilih jam sesi jadwal untuk hari ${s.hari}.`);
        const elem = document.getElementById(targetId);
        if (elem) elem.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setHighlightedFieldId(null), 4000);
        return;
      }
      if (!s.keterangan || s.keterangan.trim() === "") {
        const targetId = `slot-card-${s.id}`;
        setHighlightedFieldId(targetId);
        showToast(`Centang minimal 1 program (Reguler/Private) untuk sesi hari ${s.hari}.`);
        const elem = document.getElementById(targetId);
        if (elem) elem.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setHighlightedFieldId(null), 4000);
        return;
      }
      if (!s.jenjang || s.jenjang.length === 0) {
        const targetId = `slot-card-${s.id}`;
        setHighlightedFieldId(targetId);
        showToast(`Centang minimal 1 jenjang (${allJenjangOptions.join("/")}) untuk sesi hari ${s.hari}.`);
        const elem = document.getElementById(targetId);
        if (elem) elem.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setHighlightedFieldId(null), 4000);
        return;
      }
    }

    if (!nomorWa.trim()) {
      const targetId = "field-nomor-wa";
      setHighlightedFieldId(targetId);
      showToast("Nomor WhatsApp pengajar wajib diisi.");
      const elem = document.getElementById(targetId);
      if (elem) elem.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedFieldId(null), 4000);
      return;
    }

    if (!pendidikan.trim()) {
      const targetId = "field-pendidikan";
      setHighlightedFieldId(targetId);
      showToast("Latar belakang pendidikan wajib diisi.");
      const elem = document.getElementById(targetId);
      if (elem) elem.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedFieldId(null), 4000);
      return;
    }

    if (!deskripsi.trim()) {
      const targetId = "field-deskripsi";
      setHighlightedFieldId(targetId);
      showToast("Deskripsi / bio profil wajib diisi.");
      const elem = document.getElementById(targetId);
      if (elem) elem.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedFieldId(null), 4000);
      return;
    }

    try {
      setSavingProfil(true);
      const serializedJadwal = jadwalSlots
        .filter((s) => s.jamMulai && s.jamSelesai)
        .map(formatSlotToString);

      const derivedJenjang = Array.from(new Set(jadwalSlots.flatMap((s) => s.jenjang || [])));
      const finalJenjang = derivedJenjang.length > 0 ? derivedJenjang : (currentTutor?.jenjang && currentTutor.jenjang.length > 0 ? currentTutor.jenjang : allJenjangOptions);
      const finalNomor = nomorWa.startsWith("0") ? nomorWa : `0${nomorWa}`;
      // Status "Nonaktif" hanya boleh ditentukan koordinator — jangan pernah ditimpa dari sini.
      const dinonaktifkan = currentTutor.status === "Nonaktif";

      const res = await fetch(`/api/pengajar/${currentTutor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foto,
          deskripsi,
          pendidikan,
          ipk,
          jenjang: finalJenjang,
          alamat: domisili,
          nomorTelepon: finalNomor,
          jadwalTersedia: serializedJadwal,
          fokusMateri: tags,
          ...(dinonaktifkan ? {} : { status: tutorStatus }),
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Sinkronkan slot ke modul "Ketersediaan" koordinator agar kedua layar
        // membaca jam mengajar yang sama (sebelumnya tab itu tidak pernah terisi).
        try {
          await fetch("/api/ketersediaan", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({
              pengajarId: currentTutor._id,
              namaPengajar: currentTutor.nama,
              nomorTelepon: finalNomor,
              periode: PERIODE_KETERSEDIAAN,
              slots: jadwalSlots
                .filter((s) => s.jamMulai && s.jamSelesai)
                .map((s) => ({
                  hari: s.hari,
                  jamMulai: s.jamMulai,
                  jamSelesai: s.jamSelesai,
                  moda: "Fleksibel",
                })),
            }),
          });
        } catch {
          // Kegagalan sinkronisasi ketersediaan tidak boleh membatalkan simpan profil.
        }

        showToast("Profil dan jam ketersediaan mengajar berhasil disimpan.");
        setInitialData({
          foto,
          deskripsi,
          pendidikan,
          ipk,
          domisili,
          nomorWa,
          status: tutorStatus,
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
              ipk,
              alamat: domisili,
              nomorTelepon: finalNomor,
              jadwalTersedia: serializedJadwal,
              fokusMateri: [...tags],
              ...(dinonaktifkan ? {} : { status: tutorStatus }),
              jenjang: finalJenjang,
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
    try {
      if (typeof window !== "undefined") localStorage.removeItem("genplasma_session");
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { }
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

  const [confirmLeaveModalOpen, setConfirmLeaveModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Mencegah navigasi / reload browser yang tidak sengaja jika masih ada perubahan yang belum disimpan
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleLihatPublikClick = (e: React.MouseEvent) => {
    if (hasChanges) {
      e.preventDefault();
      setConfirmLeaveModalOpen(true);
    }
  };

  const previewPublicCard = () => {
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="bg-[#faf8f5] font-sans text-[#172421] min-h-screen selection:bg-[#F2D5A8] selection:text-[#173F3A]">
      {/* Top Header Khusus Role Tutor */}
      <header className="fixed top-0 w-full z-50 bg-[#faf8f5]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(23,63,58,0.06)] border-b border-[#173F3A]/10">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-85">
              <img src="/logo.svg" alt="Gen Plasma" className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0" />
              <div className="flex flex-col justify-center">
                <span className="font-serif text-[1.2rem] sm:text-[1.4rem] leading-none tracking-tight text-[#173F3A] select-none font-bold translate-y-[2px]">
                  Gen Plasma
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-[0.8125rem] font-semibold text-[#173F3A] hover:bg-[#F2D5A8]/50 px-3.5 py-1.5 rounded-full border border-[#173F3A]/20 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Kembali ke bagian atas dashboard"
            >
              <span className="material-symbols-outlined text-[17px]">dashboard</span>
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById("section-ketersediaan")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-[0.8125rem] font-semibold text-[#173F3A] hover:bg-[#F2D5A8]/50 px-3.5 py-1.5 rounded-full border border-[#173F3A]/20 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Navigasi ke ketersediaan hari & sesi mengajar"
            >
              <span className="material-symbols-outlined text-[17px]">event_available</span>
              <span>Ketersediaan Mengajar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById("section-profil-akun")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-[0.8125rem] font-semibold text-[#173F3A] hover:bg-[#F2D5A8]/50 px-3.5 py-1.5 rounded-full border border-[#173F3A]/20 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Navigasi ke latar belakang pendidikan, bio, kontak, & atur password"
            >
              <span className="material-symbols-outlined text-[17px]">manage_accounts</span>
              <span>Profil &amp; Akun</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="text-[0.8125rem] font-medium text-[#ba1a1a] hover:bg-red-50 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-200 shadow-2xs"
              title="Keluar dari akun tutor"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Keluar</span>
            </button>
          </div>

          {/* Mobile Right Actions: Tombol Simpan Cepat + Hamburger Menu */}
          <div className="flex sm:hidden items-center gap-2">
            {hasChanges && (
              <button
                type="button"
                disabled={savingProfil}
                onClick={() => handleSaveProfile()}
                className="inline-flex items-center gap-1 bg-[#173F3A] text-white text-[0.75rem] font-semibold px-3 py-1.5 rounded-full shadow-xs disabled:opacity-50 animate-pulse"
                title="Simpan perubahan profil"
              >
                <span className="material-symbols-outlined text-[15px]">save</span>
                <span>Simpan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Tutup menu tutor" : "Buka menu tutor"}
              aria-expanded={isMobileMenuOpen}
              className="w-9 h-9 rounded-xl bg-white border border-[#173F3A]/15 text-[#173F3A] flex items-center justify-center hover:bg-[#efeeec] active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[21px]">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Dropdown Menu */}
        <div
          className={`sm:hidden overflow-hidden transition-all duration-200 ease-out border-[#173F3A]/10 bg-[#faf8f5]/95 backdrop-blur-xl ${
            isMobileMenuOpen
              ? "max-h-[420px] opacity-100 border-t shadow-lg pointer-events-auto"
              : "max-h-0 opacity-0 border-t-0 pointer-events-none"
          }`}
        >
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-semibold bg-black text-white shadow-xs transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">dashboard</span>
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById("section-ketersediaan")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-semibold text-[#444748] hover:text-[#173F3A] hover:bg-[#efeeec] transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">event_available</span>
              <span>Ketersediaan Mengajar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById("section-profil-akun")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-semibold text-[#444748] hover:text-[#173F3A] hover:bg-[#efeeec] transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">manage_accounts</span>
              <span>Profil &amp; Akun</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setPasswordError("");
                setNewPassword("");
                setConfirmPassword("");
                setIsPasswordModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-semibold text-[#444748] hover:text-[#173F3A] hover:bg-[#efeeec] transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">lock_reset</span>
              <span>Keamanan Kata Sandi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                previewPublicCard();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-semibold text-[#444748] hover:text-[#173F3A] hover:bg-[#efeeec] transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">preview</span>
              <span>Pratinjau Kartu</span>
            </button>

            <Link
              href="/"
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleLihatPublikClick(e);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.875rem] font-semibold text-[#444748] hover:text-[#173F3A] hover:bg-[#efeeec] transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">visibility</span>
              <span>Halaman Publik</span>
            </Link>

            <div className="h-px bg-[#173F3A]/10 my-1.5" />

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-[0.875rem] font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Keluar</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Backdrop penutup dropdown saat klik area luar */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 top-16 sm:top-20 z-40 bg-black/15 backdrop-blur-[1px] sm:hidden"
        />
      )}

      {/* Main Container */}
      <main className="w-full pt-16 sm:pt-20 bg-[#faf8f5]">
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
            <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-12 py-5 sm:py-10 w-full space-y-6 sm:space-y-8">
              {/* Header & Profile Identity Bento Banner */}
              <header className="bg-white border border-[#173F3A]/15 rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-10 shadow-[0_4px_24px_-4px_rgba(23,63,58,0.06)] relative overflow-hidden">
                <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#F2D5A8]/30 blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                  {/* Left: Portrait Thumbnail + Identity */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden bg-[#e3e2e0] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.12)]">
                        <img
                          src={foto || avatarFallbackUrl(currentTutor?.nama)}
                          alt={currentTutor?.nama || "Tutor"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 sm:space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#e3e2e0] text-[#1a1c1b] text-[0.7rem] sm:text-[0.75rem] font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">
                          Profil Mandiri Tutor
                        </span>
                      </div>

                      <h1 className="font-serif text-[1.65rem] sm:text-[2.25rem] lg:text-[2.5rem] text-[#1a1c1b] tracking-tight leading-tight">
                        {currentTutor?.nama || "-"}
                      </h1>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[0.75rem] sm:text-[0.8125rem] text-[#444748]">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-[#444748]">
                            chat
                          </span>
                          WhatsApp:{" "}
                          <span className="text-[#1a1c1b] font-mono font-medium">
                            {nomorWa ? (nomorWa.startsWith("0") ? nomorWa : `0${nomorWa}`) : currentTutor?.nomorTelepon || "-"}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 truncate max-w-xs sm:max-w-sm">
                          <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-[#444748]">
                            school
                          </span>
                          {pendidikan ? pendidikan.split("•")[0].trim() : currentTutor?.pendidikan ? currentTutor.pendidikan.split("•")[0].trim() : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Personal Status & Actions */}
                  <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                    <Link
                      href="/"
                      onClick={handleLihatPublikClick}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#faf8f5] text-[#173F3A] text-[0.8125rem] sm:text-[0.875rem] font-semibold px-4 py-2.5 rounded-full hover:bg-[#F2D5A8]/50 border border-[#173F3A]/15 transition-colors shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      <span>Lihat Publik</span>
                    </Link>
                    {hasChanges && (
                      <button
                        type="button"
                        disabled={savingProfil}
                        onClick={() => handleSaveProfile()}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#173F3A] text-white text-[0.8125rem] sm:text-[0.875rem] font-semibold px-5 py-2.5 rounded-full hover:bg-[#112F2B] transition-all shadow-[0_4px_12px_rgba(23,63,58,0.2)] disabled:opacity-50 animate-in fade-in zoom-in-95 duration-200"
                      >
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        <span>{savingProfil ? "Menyimpan..." : "Simpan Profil"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Performance Metrics Ribbon */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 bg-[#faf9f7]/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 backdrop-blur-xs border border-[#173F3A]/10">
                  {/* Box 1: Mata Pelajaran */}
                  {(() => {
                    const tutorMapelList = (currentTutor?.mataPelajaran || [])
                      .map(cleanMapelName)
                      .filter(Boolean);
                    const tutorMapelText = tutorMapelList.length > 0 ? tutorMapelList.join(", ") : "-";
                    return (
                      <div className="bg-white/80 rounded-xl p-2 sm:p-3.5 border border-[#173F3A]/10 flex items-center gap-2 sm:gap-3.5 shadow-2xs">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#efeeec] flex items-center justify-center text-[#173F3A] shrink-0">
                          <span className="material-symbols-outlined text-[16px] sm:text-[20px]">menu_book</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-serif text-[0.82rem] sm:text-[1.15rem] text-[#1a1c1b] leading-tight truncate font-bold"
                            title={tutorMapelText}
                          >
                            {tutorMapelText}
                          </div>
                          <div className="text-[0.62rem] sm:text-[0.75rem] text-[#67645f] mt-0.5 font-medium truncate">
                            Mata Pelajaran
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Box 2: Jenjang Bimbingan */}
                  <div className="bg-white/80 rounded-xl p-2 sm:p-3.5 border border-[#173F3A]/10 flex items-center gap-2 sm:gap-3.5 shadow-2xs">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#efeeec] flex items-center justify-center text-[#173F3A] shrink-0">
                      <span className="material-symbols-outlined text-[16px] sm:text-[20px]">layers</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-serif text-[0.75rem] sm:text-[1.15rem] text-[#1a1c1b] leading-tight truncate font-bold tracking-tight"
                        title={
                          currentTutor?.jenjang && currentTutor.jenjang.length > 0
                            ? currentTutor.jenjang.filter((j) => !/utbk/i.test(j)).join(", ")
                            : "-"
                        }
                      >
                        {currentTutor?.jenjang && currentTutor.jenjang.length > 0
                          ? currentTutor.jenjang.filter((j) => !/utbk/i.test(j)).join(", ")
                          : "-"}
                      </div>
                      <div className="text-[0.62rem] sm:text-[0.75rem] text-[#67645f] mt-0.5 font-medium truncate">
                        Jenjang Bimbingan
                      </div>
                    </div>
                  </div>

                  {/* Box 3: Total Sesi & Hari Aktif */}
                  {(() => {
                    const totalSesi = jadwalSlots.filter((s) => s.jamMulai && s.jamSelesai).length;
                    return (
                      <div className="bg-white/80 rounded-xl p-2 sm:p-3.5 border border-[#173F3A]/10 flex items-center gap-2 sm:gap-3.5 shadow-2xs">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#efeeec] flex items-center justify-center text-[#173F3A] shrink-0">
                          <span className="material-symbols-outlined text-[16px] sm:text-[20px]">calendar_month</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-serif text-[0.82rem] sm:text-[1.15rem] text-[#1a1c1b] leading-tight truncate font-bold">
                            {totalSesi} Sesi
                          </div>
                          <div className="text-[0.62rem] sm:text-[0.75rem] text-[#67645f] mt-0.5 font-medium truncate">
                            {hariTersedia.length} Hari Mengajar
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Box 4: Status Ketersediaan Tutor */}
                  <div className="bg-white/80 rounded-xl p-2 sm:p-3.5 border border-[#173F3A]/10 flex items-center gap-2 sm:gap-3.5 shadow-2xs">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${statusTampil === "Aktif"
                        ? "bg-emerald-100 text-emerald-800"
                        : statusTampil === "Cuti"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[16px] sm:text-[20px]">
                        {statusTampil === "Aktif" ? "check_circle" : statusTampil === "Cuti" ? "pause_circle" : "block"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <select
                        value={statusTampil}
                        disabled={updatingStatus || akunDinonaktifkan}
                        onChange={(e) => handleStatusChange(e.target.value as "Aktif" | "Cuti")}
                        className={`text-[0.7rem] sm:text-[0.82rem] font-bold rounded-lg px-1.5 py-0.5 border cursor-pointer focus:outline-none transition-colors w-full ${statusTampil === "Aktif"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : statusTampil === "Cuti"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-rose-50 text-rose-800 border-rose-300"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={akunDinonaktifkan ? "Status akun ditentukan koordinator" : "Ubah status ketersediaan Anda"}
                      >
                        {akunDinonaktifkan && <option value="Nonaktif">Nonaktif</option>}
                        <option value="Aktif">Aktif Mengajar</option>
                        <option value="Cuti">Sedang Cuti</option>
                      </select>
                      <div className="text-[0.62rem] sm:text-[0.7rem] text-[#67645f] mt-0.5 font-medium truncate">
                        Status Ketersediaan
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {/* EDITORIAL PROFIL PUBLIK CANVAS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                {/* Primary Form Canvas (8 Columns) */}
                <form
                  onSubmit={handleSaveProfile}
                  className="lg:col-span-8 space-y-6 sm:space-y-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-[#173F3A]/10"
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

                  </fieldset>

                  <div className="h-px w-full bg-[#efeeec]"></div>

                  {/* SECTION 2: HARI & JAM KETERSEDIAAN MENGAJAR */}
                  <fieldset id="section-ketersediaan" className="space-y-5 scroll-mt-24">
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
                                className="p-3.5 sm:p-4 bg-[#faf8f5] border border-[#173F3A]/15 rounded-xl sm:rounded-2xl space-y-3"
                              >
                                <div className="flex items-center justify-between border-b border-[#173F3A]/10 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#B74E2C]"></span>
                                    <span className="font-serif text-[1.05rem] sm:text-[1.125rem] font-bold text-[#173F3A]">
                                      {hari}
                                    </span>
                                    <span className="text-[0.7rem] sm:text-[0.72rem] font-semibold px-2 py-0.5 rounded-full bg-[#F2D5A8]/60 text-[#173F3A]">
                                      {slotsHari.length} sesi
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => addSlotForHari(hari)}
                                    title="Tambah Sesi Jam"
                                    className="w-8 h-8 rounded-full border border-[#B74E2C]/30 bg-white text-[#B74E2C] hover:bg-[#B74E2C]/10 flex items-center justify-center transition-colors shadow-2xs"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                  </button>
                                </div>

                                <div className="space-y-2.5">
                                  {slotsHari.map((slot, sIdx) => {
                                    return (
                                      <div
                                        key={slot.id}
                                        id={`slot-card-${slot.id}`}
                                        className={`p-3 sm:p-4 bg-white rounded-xl border transition-all shadow-xs space-y-3 ${highlightedFieldId === `slot-card-${slot.id}` ? "field-highlight-fade ring-4 ring-rose-500/50" : "border-[#173F3A]/15 hover:border-[#173F3A]/30"}`}
                                      >
                                        <div className="flex items-center justify-between border-b border-[#173F3A]/10 pb-2">
                                          <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-[#173F3A] text-white text-[0.7rem] font-bold flex items-center justify-center">
                                              {sIdx + 1}
                                            </span>
                                            <span className="text-[0.8125rem] font-bold text-[#173F3A]">
                                              Sesi ke-{sIdx + 1}
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => removeSlot(slot.id)}
                                            title="Hapus sesi ini"
                                            className="w-7 h-7 rounded-full text-rose-600 hover:text-rose-800 hover:bg-rose-50 flex items-center justify-center transition-colors"
                                          >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                          </button>
                                        </div>

                                        {/* Dropdown Sesi & Pilihan Program & Pilihan Jenjang */}
                                        <div className="flex flex-wrap items-end gap-2.5 sm:gap-3">
                                          <div className="min-w-[min(215px,100%)] flex-[1.35_1_215px]">
                                            <label className="text-[0.72rem] font-semibold text-[#173F3A] mb-1.5 flex items-center gap-1 whitespace-nowrap">
                                              <span className="material-symbols-outlined text-[15px] shrink-0">schedule</span>
                                              <span>Pilih Sesi Jadwal</span>
                                            </label>
                                            {(() => {
                                              const presetsForDay = getPresetsByDay(slot.hari, masterSesiList);
                                              const currentSelected = presetsForDay.find(
                                                (p) => p.jamMulai === slot.jamMulai && p.jamSelesai === slot.jamSelesai
                                              );
                                              return (
                                                <select
                                                  value={currentSelected?.label || (slot.jamMulai && slot.jamSelesai ? "custom" : "")}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (!val) {
                                                      updateSlot(slot.id, { jamMulai: "", jamSelesai: "" });
                                                      return;
                                                    }
                                                    const selected = presetsForDay.find((p) => p.label === val);
                                                    if (selected && selected.jamMulai && selected.jamSelesai) {
                                                      updateSlot(slot.id, {
                                                        jamMulai: selected.jamMulai,
                                                        jamSelesai: selected.jamSelesai,
                                                      });
                                                    }
                                                  }}
                                                  className="w-full h-[38px] px-2.5 sm:px-3 py-1.5 text-[0.8125rem] font-medium text-[#173F3A] bg-[#faf8f5] border border-[#173F3A]/20 focus:border-[#173F3A] focus:bg-white rounded-xl focus:outline-none transition-colors"
                                                >
                                                  <option value="">— Pilih Sesi Jadwal —</option>
                                                  {presetsForDay.map((p, pIdx) => (
                                                    <option key={pIdx} value={p.label}>
                                                      {p.label}
                                                    </option>
                                                  ))}
                                                  {slot.jamMulai &&
                                                    slot.jamSelesai &&
                                                    !presetsForDay.some(
                                                      (p) => p.jamMulai === slot.jamMulai && p.jamSelesai === slot.jamSelesai
                                                    ) && (
                                                      <option value="custom">
                                                        {slot.jamMulai} - {slot.jamSelesai} WIB (Tersimpan)
                                                      </option>
                                                    )}
                                                </select>
                                              );
                                            })()}
                                          </div>

                                          <div className="min-w-[min(175px,100%)] flex-[1_1_175px]">
                                            <label className="text-[0.72rem] font-semibold text-[#173F3A] mb-1.5 flex items-center gap-1 whitespace-nowrap">
                                              <span className="material-symbols-outlined text-[15px] shrink-0">school</span>
                                              <span>Program (Centang Pilihan)</span>
                                            </label>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2 px-2.5 sm:px-3 bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl min-h-[38px]">
                                              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[0.8125rem] font-medium text-[#173F3A] whitespace-nowrap">
                                                <input
                                                  type="checkbox"
                                                  checked={/reguler/i.test(slot.keterangan || "")}
                                                  onChange={(e) => {
                                                    const hasPrivate = /private/i.test(slot.keterangan || "");
                                                    const isChecked = e.target.checked;
                                                    let nextVal = "";
                                                    if (isChecked && hasPrivate) nextVal = "Reguler, Private";
                                                    else if (isChecked) nextVal = "Reguler";
                                                    else if (hasPrivate) nextVal = "Private";
                                                    else nextVal = "";
                                                    updateSlot(slot.id, { keterangan: nextVal });
                                                  }}
                                                  className="w-4 h-4 rounded text-[#173F3A] focus:ring-[#173F3A] accent-[#173F3A] cursor-pointer shrink-0"
                                                />
                                                <span>Reguler</span>
                                              </label>

                                              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[0.8125rem] font-medium text-[#173F3A] whitespace-nowrap">
                                                <input
                                                  type="checkbox"
                                                  checked={/private/i.test(slot.keterangan || "")}
                                                  onChange={(e) => {
                                                    const hasReguler = /reguler/i.test(slot.keterangan || "");
                                                    const isChecked = e.target.checked;
                                                    let nextVal = "";
                                                    if (isChecked && hasReguler) nextVal = "Reguler, Private";
                                                    else if (isChecked) nextVal = "Private";
                                                    else if (hasReguler) nextVal = "Reguler";
                                                    else nextVal = "";
                                                    updateSlot(slot.id, { keterangan: nextVal });
                                                  }}
                                                  className="w-4 h-4 rounded text-[#173F3A] focus:ring-[#173F3A] accent-[#173F3A] cursor-pointer shrink-0"
                                                />
                                                <span>Private</span>
                                              </label>
                                            </div>
                                          </div>

                                          <div className="min-w-[min(190px,100%)] flex-[1.15_1_190px]">
                                            <label className="text-[0.72rem] font-semibold text-[#173F3A] mb-1.5 flex items-center gap-1 whitespace-nowrap">
                                              <span className="material-symbols-outlined text-[15px] shrink-0">layers</span>
                                              <span>Jenjang (Centang Pilihan)</span>
                                            </label>
                                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 py-2 px-2.5 sm:px-3 bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl min-h-[38px]">
                                              {allJenjangOptions.map((j) => {
                                                const isChecked = (slot.jenjang || []).includes(j);
                                                return (
                                                  <label key={j} className="inline-flex items-center gap-1 cursor-pointer select-none text-[0.8125rem] font-medium text-[#173F3A] whitespace-nowrap">
                                                    <input
                                                      type="checkbox"
                                                      checked={isChecked}
                                                      onChange={(e) => {
                                                        const currentJenjang = slot.jenjang || [];
                                                        const nextJenjang = e.target.checked
                                                          ? [...currentJenjang, j]
                                                          : currentJenjang.filter((item) => item !== j);
                                                        updateSlot(slot.id, { jenjang: nextJenjang });
                                                      }}
                                                      className="w-4 h-4 rounded text-[#173F3A] focus:ring-[#173F3A] accent-[#173F3A] cursor-pointer shrink-0"
                                                    />
                                                    <span>{j}</span>
                                                  </label>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Status Indikator Sesi */}
                                        <div className="pt-2 border-t border-[#173F3A]/10 flex items-start text-[0.75rem]">
                                          {slot.jamMulai && slot.jamSelesai && slot.keterangan && slot.jenjang && slot.jenjang.length > 0 ? (
                                            <div className="flex items-start gap-1.5 text-emerald-700 font-medium leading-tight">
                                              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">check_circle</span>
                                              <span>
                                                Aktif: {slot.jamMulai} - {slot.jamSelesai} WIB ({slot.keterangan} • {slot.jenjang.join(", ")})
                                              </span>
                                            </div>
                                          ) : !slot.jamMulai || !slot.jamSelesai ? (
                                            <div className="flex items-center gap-1.5 text-amber-700">
                                              <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
                                              <span>Pilih sesi jadwal di atas</span>
                                            </div>
                                          ) : !slot.keterangan ? (
                                            <div className="flex items-center gap-1.5 text-amber-700">
                                              <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
                                              <span>Pilih program (centang Reguler / Private)</span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-1.5 text-amber-700">
                                              <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
                                              <span>Pilih jenjang (centang {allJenjangOptions.join(" / ")})</span>
                                            </div>
                                          )}
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
                  <fieldset id="section-profil-akun" className="space-y-4 scroll-mt-24">
                    <div className="flex items-center justify-between">
                      <div>
                        <legend className="font-serif text-[1.35rem] sm:text-[1.5rem] text-[#1a1c1b]">
                          Latar Belakang Pendidikan &amp; Gelar
                        </legend>
                        <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#444748] mt-0.5 sm:mt-1">
                          Dicantumkan pada kartu ringkas tutor dan kurikulum silabus wali siswa.
                        </p>
                      </div>
                      <span className="font-mono text-[0.7rem] sm:text-[0.75rem] text-[#67645f]">BAGIAN 03/05</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="text-[0.75rem] text-[#444748]">
                        Gelar, Program Studi, &amp; Almamater Utama
                      </label>
                      <div id="field-pendidikan"
                        className={`bg-[#f4f3f1] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:bg-[#efeeec] transition-all ${highlightedFieldId === "field-pendidikan" ? "field-highlight-fade ring-4 ring-rose-500/50" : ""}`}>
                        <input
                          type="text"
                          value={pendidikan}
                          onChange={(e) => setPendidikan(e.target.value)}
                          placeholder="Contoh: S1 Pendidikan Fisika UI • S2 ITB"
                          className="w-full bg-transparent text-[0.875rem] sm:text-[0.9375rem] text-[#1a1c1b] focus:outline-none"
                        />
                      </div>
                      <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#67645f]">
                        Gunakan tanda titik peluru (•) untuk memisahkan jenjang pendidikan berurutan.
                      </p>
                    </div>

                    {/* Tags Keahlian */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[0.75rem] text-[#444748]">
                        Fokus Materi &amp; Silabus yang Diberikan
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 bg-[#efeeec] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[0.8125rem] sm:text-[0.875rem] text-[#1a1c1b]"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(idx)}
                              className="text-[#444748] hover:text-[#1a1c1b]"
                            >
                              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">close</span>
                            </button>
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="inline-flex items-center gap-1 bg-[#e3e2e0] hover:bg-[#c4c7c7]/50 text-[#444748] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[0.8125rem] sm:text-[0.875rem] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px] sm:text-[16px]">add</span> Tambah Tag
                        </button>
                      </div>
                    </div>
                  </fieldset>

                  <div className="h-px w-full bg-[#efeeec]"></div>

                  {/* SECTION 4: Public Bio */}
                  <fieldset className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <legend className="font-serif text-[1.35rem] sm:text-[1.5rem] text-[#1a1c1b]">
                          Deskripsi Pengantar Mengajar
                        </legend>
                        <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#444748] mt-0.5 sm:mt-1">
                          Tampil secara utuh di Katalog Publik Pengajar Lentera Belajar.
                        </p>
                      </div>
                      <span className="font-mono text-[0.7rem] sm:text-[0.75rem] text-[#67645f]">BAGIAN 04/05</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[0.75rem]">
                        <span className="text-[#444748]">Narasi Pendekatan &amp; Filosofi Bimbingan</span>
                        <span className="text-[#67645f]">{deskripsi.length} / 600 Karakter</span>
                      </div>
                      <div id="field-deskripsi"
                        className={`bg-[#f4f3f1] rounded-xl p-3.5 sm:p-4 focus-within:bg-[#efeeec] transition-all ${highlightedFieldId === "field-deskripsi" ? "field-highlight-fade ring-4 ring-rose-500/50" : ""}`}>
                        <textarea
                          rows={5}
                          value={deskripsi}
                          onChange={(e) => setDeskripsi(e.target.value)}
                          placeholder="Tuliskan pengalaman, gaya bimbingan personal, serta pesan penyemangat bagi calon anak didik..."
                          className="w-full bg-transparent text-[0.875rem] sm:text-[0.9375rem] text-[#1a1c1b] focus:outline-none resize-y leading-relaxed"
                        />
                      </div>

                      <div className="bg-[#e9e8e6]/60 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3">
                        <span className="material-symbols-outlined text-[#444748] text-[18px] sm:text-[20px] shrink-0 mt-0.5">
                          lightbulb
                        </span>
                        <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#444748] leading-relaxed">
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
                        <legend className="font-serif text-[1.35rem] sm:text-[1.5rem] text-[#1a1c1b]">
                          Kontak &amp; Domisili Bimbingan
                        </legend>
                        <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#444748] mt-0.5 sm:mt-1">
                          Saluran komunikasi langsung dan kota jangkauan mengajar.
                        </p>
                      </div>
                      <span className="font-mono text-[0.7rem] sm:text-[0.75rem] text-[#67645f]">BAGIAN 05/05</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[0.75rem] text-[#444748]">
                          Nomor WhatsApp Resmi
                        </label>
                        <div className="bg-[#f4f3f1] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
                          <span className="text-[0.8125rem] text-[#67645f] font-mono">+62</span>
                          <input
                            type="tel"
                            value={nomorWa}
                            onChange={(e) => setNomorWa(e.target.value)}
                            className="w-full bg-transparent text-[0.875rem] sm:text-[0.9375rem] text-[#1a1c1b] focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[0.75rem] text-[#444748]">Domisili Home-Base Tutor</label>
                        <div className="bg-[#f4f3f1] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#444748] text-[18px]">
                            location_on
                          </span>
                          <input
                            type="text"
                            value={domisili}
                            onChange={(e) => setDomisili(e.target.value)}
                            className="w-full bg-transparent text-[0.875rem] sm:text-[0.9375rem] text-[#1a1c1b] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  <div className="h-px w-full bg-[#efeeec]"></div>

                  {/* SECTION 6: KEAMANAN AKUN & UBAH PASSWORD */}
                  <div id="section-password" className="p-4 sm:p-5 bg-[#faf8f5] border border-[#173F3A]/15 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 scroll-mt-24">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-[#F2D5A8] flex items-center justify-center text-[#173F3A] shrink-0">
                        <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                      </span>
                      <div>
                        <h4 className="font-serif text-[0.95rem] sm:text-[1rem] font-bold text-[#173F3A]">
                          Keamanan &amp; Kata Sandi Akun
                        </h4>
                        <p className="text-[0.72rem] sm:text-[0.75rem] text-[#444748]">
                          Atur atau perbarui kata sandi login akun tutor Anda secara mandiri.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPasswordError("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setIsPasswordModalOpen(true);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-[#173F3A] hover:bg-[#112F2B] text-white text-[0.8125rem] font-semibold rounded-full transition-all shadow-xs shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">key</span>
                      <span>Ubah Password</span>
                    </button>
                  </div>

                  {/* Form Submission Footer */}
                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[0.8125rem] text-[#67645f] order-2 sm:order-1 text-center sm:text-left">
                      {hasChanges ? (
                        <span className="text-amber-800 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          Perubahan belum disimpan
                        </span>
                      ) : (
                        <span>
                          Status: <strong className="text-black">Tersimpan di Cloud</strong>
                        </span>
                      )}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
                      <button
                        type="button"
                        onClick={previewPublicCard}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#efeeec] hover:bg-[#e3e2e0] text-[#1a1c1b] text-[0.875rem] font-semibold px-6 py-2.5 sm:py-3 rounded-full transition-colors"
                      >
                        Pratinjau Kartu
                      </button>
                      {hasChanges && (
                        <button
                          type="submit"
                          disabled={savingProfil}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#173F3A] text-white text-[0.875rem] font-semibold px-7 py-2.5 sm:py-3 rounded-full hover:bg-[#112F2B] transition-all shadow-[0_4px_16px_rgba(23,63,58,0.2)] disabled:opacity-50 animate-in fade-in duration-200"
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

                    <div
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="group relative w-full rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer aspect-[3/4] sm:aspect-[4/5] bg-[#efeeec]"
                      title="Klik untuk melihat pratinjau detail modal publik"
                    >
                      {/* Full-bleed Photo matching Public Card */}
                      <img
                        id="sidebar-live-portrait"
                        src={foto || avatarFallbackUrl(currentTutor?.nama)}
                        alt={currentTutor?.nama || "Tutor"}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const fallback = avatarFallbackUrl(currentTutor?.nama);
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Gradient Overlay for subtle contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

                      {/* Top Right: Ketersediaan Hari Badge */}
                      {hariTersedia.length > 0 && (
                        <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs border border-[#173F3A]/15 pointer-events-none z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="text-[0.72rem] font-bold text-[#173F3A] whitespace-nowrap">
                            Tersedia {hariTersedia.length} Hari
                          </span>
                        </div>
                      )}

                      {/* Floating Pill Badge Nestled at Bottom */}
                      <div className="absolute inset-x-3 bottom-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg text-center transition-all duration-300 group-hover:-translate-y-1 z-10">
                        <h3 className="text-[0.9375rem] text-[#1a1c1b] font-bold truncate leading-snug">
                          {currentTutor?.nama || "-"}
                        </h3>
                        <p className="text-[0.78rem] text-[#444748] truncate mt-0.5 font-medium">
                          {pendidikan ? pendidikan.split("•")[0].trim() : currentTutor?.pendidikan ? currentTutor.pendidikan.split("•")[0].trim() : "-"}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[#efeeec]">
                          <div className="flex items-center gap-1 flex-wrap min-w-0">
                            {(() => {
                              const derived = Array.from(new Set(jadwalSlots.flatMap((s) => s.jenjang || [])));
                              const list = derived.length > 0 ? derived : (currentTutor?.jenjang || ["SMA"]);
                              return list.filter((j) => !/utbk/i.test(j)).map((j) => (
                                <span
                                  key={j}
                                  className="text-[0.68rem] font-bold px-2 py-0.5 rounded-md bg-[#173F3A]/10 text-[#173F3A] leading-tight"
                                >
                                  {j}
                                </span>
                              ));
                            })()}
                          </div>
                          <span className="inline-flex items-center gap-0.5 text-[0.72rem] font-bold text-[#173F3A] group-hover:text-emerald-700 transition-colors shrink-0">
                            <span>Jadwal</span>
                            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                          </span>
                        </div>
                      </div>
                    </div>

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
                  </div>
                </aside>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Modal Ubah Password Manual */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#173F3A]/20 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#173F3A]/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-[#F2D5A8] flex items-center justify-center text-[#173F3A]">
                  <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                </span>
                <div>
                  <h3 className="font-serif text-[1.25rem] font-bold text-[#173F3A]">
                    Ubah Kata Sandi
                  </h3>
                  <p className="text-[0.75rem] text-[#67645f]">
                    Atur kata sandi baru untuk akun tutor Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordError("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setShowForgotInfo(false);
                }}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-[#444748]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[0.8125rem]">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleManualChangePassword} className="space-y-4">
              {/* Input 1: Password Saat Ini */}
              <div>
                <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan password akun Anda saat ini"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-3.5 pr-11 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl focus:outline-none focus:border-[#173F3A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67645f] hover:text-[#173F3A] p-1 flex items-center justify-center transition-colors"
                    title={showCurrentPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showCurrentPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Input 2: Password Baru */}
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

              {/* Input 3: Konfirmasi Password Baru */}
              <div>
                <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                  Ulangi Password Baru
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

              {/* Opsi Lupa Password di Bawah 3 Inputan */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowForgotInfo(!showForgotInfo)}
                  className="text-[0.8125rem] font-semibold text-[#173F3A] hover:underline flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[17px]">help_outline</span>
                  <span>Lupa Password?</span>
                </button>

                {showForgotInfo && (
                  <div className="mt-2.5 p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-[0.8125rem] text-amber-900 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">info</span>
                      <div>
                        <p className="font-semibold text-amber-950">Lupa password saat ini?</p>
                        <p className="text-[0.75rem] text-amber-800 mt-0.5 leading-relaxed">
                          Anda dapat menghubungi <strong>Koordinator</strong> untuk mengirimkan link aktivasi/reset baru via WhatsApp, atau logout dan gunakan menu <strong>Lupa Password (Reset OTP)</strong> di halaman Login.
                        </p>
                      </div>
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href="/login"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#173F3A] hover:bg-[#12312d] text-white text-[0.75rem] font-medium transition-colors"
                      >
                        <span>Ke Halaman Login</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordError("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowForgotInfo(false);
                  }}
                  className="px-4 py-2 rounded-full text-[0.8125rem] font-medium text-[#444748] hover:bg-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-[#173F3A] hover:bg-[#12312d] text-white rounded-full text-[0.8125rem] font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  {passwordLoading ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Peringatan Perubahan Belum Disimpan */}
      {confirmLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined text-[26px]">warning</span>
              </div>
              <div>
                <h3 className="font-serif text-[1.25rem] text-[#173F3A] font-bold leading-snug">
                  Perubahan Belum Disimpan
                </h3>
                <p className="text-[0.875rem] text-[#444748] mt-1.5 leading-relaxed">
                  Anda telah mengubah foto, sesi jadwal, atau data profil lainnya tetapi belum menekan tombol <strong>Simpan Profil</strong>. Jika membuka halaman publik sekarang, perubahan tersebut belum muncul di publik.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmLeaveModalOpen(false)}
                className="px-4 py-2.5 rounded-full text-[0.8125rem] font-medium text-[#444748] hover:bg-neutral-100 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Batal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmLeaveModalOpen(false);
                  router.push("/");
                }}
                className="px-4 py-2.5 rounded-full text-[0.8125rem] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-colors"
              >
                Buka Tanpa Menyimpan
              </button>
              <button
                type="button"
                disabled={savingProfil}
                onClick={async () => {
                  await handleSaveProfile();
                  setConfirmLeaveModalOpen(false);
                  router.push("/");
                }}
                className="px-5 py-2.5 bg-[#173F3A] hover:bg-[#12312d] text-white rounded-full text-[0.8125rem] font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{savingProfil ? "Menyimpan..." : "Simpan & Buka"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Detail Publik Tutor */}
      {isPreviewModalOpen && currentTutor && (
        <div
          onClick={() => setIsPreviewModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl border border-[#173F3A]/15 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
          >
            {/* Mobile drag handle indicator */}
            <div className="bg-[#faf8f5] pt-2.5 pb-0.5 flex justify-center sm:hidden shrink-0">
              <span className="w-10 h-1 rounded-full bg-[#173F3A]/20" />
            </div>
            {/* Modal Header */}
            <div className="relative px-4 pt-2.5 pb-4 sm:p-6 bg-[#faf8f5] border-b border-[#173F3A]/10 flex items-start sm:items-center gap-3 sm:gap-4 shrink-0">
              <img
                src={foto || avatarFallbackUrl(currentTutor.nama)}
                alt={currentTutor.nama}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const fallback = avatarFallbackUrl(currentTutor.nama);
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
                className="w-14 h-18 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl object-cover shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1 text-[#173F3A]">
                  <span className="material-symbols-outlined text-[14px] sm:text-[16px]">school</span>
                  <span className="text-[0.7rem] sm:text-[0.75rem] font-medium text-[#444748] truncate">
                    {pendidikan ? pendidikan.split("•")[0].trim() : currentTutor.pendidikan ? currentTutor.pendidikan.split("•")[0].trim() : "-"}
                  </span>
                </div>
                <h3 className="font-serif text-[1.15rem] sm:text-[1.35rem] font-bold text-[#173F3A] leading-tight truncate">
                  {currentTutor.nama}
                </h3>
                <p className="text-[0.75rem] sm:text-[0.8125rem] text-[#444748] truncate mt-0.5">
                  {pendidikan ? pendidikan.split("•")[0].trim() : currentTutor.pendidikan ? currentTutor.pendidikan.split("•")[0].trim() : "Tutor Pengajar"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {(() => {
                    const derived = Array.from(new Set(jadwalSlots.flatMap((s) => s.jenjang || [])));
                    const list = (derived.length > 0 ? derived : (currentTutor.jenjang || ["SMA"])).filter((j) => !/utbk/i.test(j));
                    if (list.length === 0) return null;
                    return (
                      <div className="flex items-center gap-1">
                        <span className="text-[0.6875rem] text-[#67645f]">Jenjang:</span>
                        <span className="text-[0.6875rem] font-semibold text-[#173F3A] bg-[#173F3A]/10 px-2 py-0.5 rounded-full border border-[#173F3A]/15">
                          {list.join(", ")}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#444748] hover:text-[#173F3A] shadow-xs font-bold text-sm shrink-0 cursor-pointer"
                title="Tutup Pratinjau"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 min-h-0 max-h-[64vh] sm:max-h-[62vh] text-xs text-[#444748]">
              {/* Notif preview live data */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F2D5A8]/30 border border-[#D88A32]/25 text-[0.72rem] sm:text-[0.75rem] text-[#173F3A]">
                <span className="material-symbols-outlined text-[16px] text-[#D88A32] shrink-0">visibility</span>
                <span>Pratinjau langsung tampilan detail kartu Anda di halaman katalog publik.</span>
              </div>

              {deskripsi && (
                <div>
                  <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#67645f] block mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#173F3A]">person</span>
                    Profil Akademik &amp; Pendekatan
                  </span>
                  <p className="text-[#173F3A] bg-[#faf8f5] border border-[#173F3A]/10 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl leading-relaxed italic text-[0.75rem] sm:text-[0.8125rem]">
                    &quot;{deskripsi}&quot;
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
                    {jadwalSlots.filter((s) => s.jamMulai && s.jamSelesai).length} Sesi Terjadwal
                  </span>
                </div>

                {(() => {
                  const activeSlots = jadwalSlots.filter((s) => s.jamMulai && s.jamSelesai);
                  if (activeSlots.length === 0) {
                    return (
                      <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#173F3A]/10 text-center text-[#67645f]">
                        Jadwal fleksibel (belum ada sesi jadwal yang aktif dipilih).
                      </div>
                    );
                  }

                  const grouped = DAFTAR_HARI.map((hari) => ({
                    hari,
                    slots: activeSlots.filter((s) => s.hari === hari),
                  })).filter((g) => g.slots.length > 0);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {grouped.map((group) => (
                        <div
                          key={group.hari}
                          className="p-3 bg-[#faf8f5] rounded-2xl border border-[#173F3A]/10 flex flex-col gap-2 hover:border-[#173F3A]/25 transition-all"
                        >
                          <div className="flex items-center justify-between border-b border-[#173F3A]/5 pb-1.5 gap-2">
                            <span className="font-bold text-[#173F3A] text-[0.8125rem] flex items-center gap-1.5 shrink-0">
                              <span className="w-2 h-2 rounded-full bg-[#173F3A]"></span>
                              {group.hari}
                            </span>
                            <span className="text-[0.65rem] font-semibold text-[#173F3A]/70 bg-white px-2 py-0.5 rounded-full border border-[#173F3A]/10 shrink-0">
                              {group.slots.length} Sesi
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {group.slots.map((s) => {
                              const slotJenjang = (s.jenjang && s.jenjang.length > 0
                                ? s.jenjang
                                : currentTutor.jenjang || []
                              ).filter((j) => !/utbk/i.test(j));
                              const slotProgram: string[] = [];
                              if (s.keterangan && /\breguler\b/i.test(s.keterangan)) slotProgram.push("Reguler");
                              if (s.keterangan && /\bprivate\b|\bprivat\b/i.test(s.keterangan)) slotProgram.push("Private");
                              const otherLabel = s.keterangan
                                ? s.keterangan
                                  .replace(/\b(sd|smp|sma|kedinasan|utbk)\b/gi, "")
                                  .replace(/\b(reguler|private|privat)\b/gi, "")
                                  .replace(/[,•\s]+/g, " ")
                                  .trim()
                                : "";

                              return (
                                <div
                                  key={s.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white border border-[#173F3A]/15 rounded-xl text-[0.72rem] text-[#173F3A] shadow-2xs font-medium flex-wrap"
                                >
                                  <span className="font-semibold">
                                    {s.jamMulai} - {s.jamSelesai} WIB
                                  </span>
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
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-3 pb-5 sm:p-4 bg-[#f2efe9] border-t border-[#173F3A]/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 text-[0.8125rem] font-semibold text-[#444748] hover:bg-[#eae6df] rounded-full transition-colors text-center cursor-pointer"
              >
                Tutup
              </button>
              <a
                href={`https://wa.me/${(nomorWa ? (nomorWa.startsWith("0") ? `62${nomorWa.slice(1)}` : `62${nomorWa}`) : "628123456789").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Halo ${currentTutor.nama}, saya melihat profil Anda di Gen Plasma dan ingin berkonsultasi mengenai bimbingan belajar.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#173F3A] hover:bg-[#112F2B] text-white text-[0.8125rem] font-semibold px-5 py-2.5 rounded-full transition-colors shadow-xs text-center cursor-pointer"
              >
                <span>Uji Coba WhatsApp</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
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
            <span className="ml-2 text-[#444748]">• Area Mandiri Pengajar</span>
          </div>
          <p>© 2025 - 2026 Gen Plasma. Hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}
