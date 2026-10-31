import mongoose, { Schema, Document, Model } from "mongoose";

export type StatusPengajar = "Aktif" | "Cuti" | "Nonaktif";

export interface IPengajar extends Document {
  nama: string;
  nip?: string;
  nomorTelepon: string;
  email?: string;
  alamat?: string;
  foto?: string; // URL foto profil atau avatar
  deskripsi?: string; // Bio / deskripsi diri tutor untuk publik
  pendidikan?: string; // Almamater / latar belakang pendidikan
  status: StatusPengajar;
  mataPelajaran: string[];
  jenjang: string[]; // SD, SMP, SMA, UTBK/Kedinasan
  jenisKelas: string[]; // Reguler, Privat, Semi-Privat, Online, Offline
  jadwalTersedia?: string[]; // Jadwal mengajar minggu ini
  kelasAktif?: { namaKelas: string; jumlahSiswa: number }[]; // Kelas yang sedang aktif
  dokumenStatus?: string; // Lengkap, Belum Lengkap, dsb.
  catatanInternal?: string; // Catatan khusus koordinator
  // --- Autentikasi (tidak pernah dikirim ke client: select:false) ---
  passwordHash?: string;
  aktivasiTokenHash?: string; // hash token undangan sekali pakai
  aktivasiKadaluarsa?: Date;
  akunDiaktifkanPada?: Date;
  otpCodeHash?: string;
  otpKadaluarsa?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PengajarSchema: Schema<IPengajar> = new Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama pengajar wajib diisi"],
      trim: true,
    },
    nip: {
      type: String,
      trim: true,
      default: function () {
        return "LB-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
      },
    },
    nomorTelepon: {
      type: String,
      required: [true, "Nomor WhatsApp/telepon wajib diisi"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    alamat: {
      type: String,
      trim: true,
    },
    foto: {
      type: String,
      trim: true,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    },
    deskripsi: {
      type: String,
      trim: true,
      default: "Pengajar berdedikasi dengan fokus pada pemahaman konsep dan pembimbingan intensif bagi siswa.",
    },
    pendidikan: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Aktif", "Cuti", "Nonaktif"],
      default: "Aktif",
    },
    mataPelajaran: {
      type: [String],
      default: [],
    },
    jenjang: {
      type: [String],
      default: ["SMA"],
    },
    jenisKelas: {
      type: [String],
      default: ["Reguler"],
    },
    jadwalTersedia: {
      type: [String],
      default: [],
    },
    kelasAktif: {
      type: [
        {
          namaKelas: { type: String },
          jumlahSiswa: { type: Number },
        },
      ],
      default: [
        { namaKelas: "Kelas 12 Intensif UTBK", jumlahSiswa: 18 },
        { namaKelas: "Kelas 10 Reguler Sains", jumlahSiswa: 14 },
      ],
    },
    dokumenStatus: {
      type: String,
      default: "Lengkap",
    },
    catatanInternal: {
      type: String,
      trim: true,
    },
    passwordHash: { type: String, select: false },
    aktivasiTokenHash: { type: String, select: false },
    aktivasiKadaluarsa: { type: Date, select: false },
    akunDiaktifkanPada: { type: Date },
    otpCodeHash: { type: String, select: false },
    otpKadaluarsa: { type: Date, select: false },
  },
  {
    timestamps: true,
  }
);

// Mencegah compile ulang model jika sudah ada di cache Next.js
const Pengajar: Model<IPengajar> =
  mongoose.models.Pengajar || mongoose.model<IPengajar>("Pengajar", PengajarSchema);

export default Pengajar;
