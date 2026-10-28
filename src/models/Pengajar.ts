import mongoose, { Schema, Document, Model } from "mongoose";

export type StatusPengajar = "Aktif" | "Cuti" | "Nonaktif";

export interface IPengajar extends Document {
  nama: string;
  nomorTelepon: string;
  email?: string;
  alamat?: string;
  status: StatusPengajar;
  mataPelajaran: string[];
  jenjang: string[]; // SD, SMP, SMA, UTBK/Kedinasan
  jenisKelas: string[]; // Reguler, Privat, Semi-Privat, Online, Offline
  dokumenStatus?: string; // Lengkap, Belum Lengkap, dsb.
  catatanInternal?: string; // Catatan khusus koordinator
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
    dokumenStatus: {
      type: String,
      default: "Lengkap",
    },
    catatanInternal: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Mencegah compile ulang model jika sudah ada di cache Next.js
const Pengajar: Model<IPengajar> =
  mongoose.models.Pengajar || mongoose.model<IPengajar>("Pengajar", PengajarSchema);

export default Pengajar;
