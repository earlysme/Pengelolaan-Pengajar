import mongoose, { Schema, Document, Model } from "mongoose";

export type StatusKehadiran = "Hadir" | "Terlambat" | "Izin" | "Digantikan";
export type StatusVerifikasi = "Menunggu Verifikasi" | "Terverifikasi" | "Perlu Revisi";

export interface ISesi extends Document {
  jadwalId?: mongoose.Types.ObjectId;
  pengajarId: mongoose.Types.ObjectId;
  namaPengajar: string;
  nomorTeleponPengajar?: string;
  namaKelas: string;
  mataPelajaran: string;
  tanggal: string; // Format "YYYY-MM-DD"
  waktuMulai: string; // Format "16:00"
  waktuSelesai: string; // Format "18:00"
  durasiJam: number; // Durasi dalam jam (misal 2)
  statusKehadiran: StatusKehadiran;
  materiAjar: string; // Berita Acara Pembelajaran (BAP)
  capaianSiswa?: string;
  kendala?: string; // Siswa tidak hadir, mati listrik, dll.
  buktiFoto?: string; // URL foto sesi / link gdrive
  statusVerifikasi: StatusVerifikasi;
  catatanVerifikasi?: string;
  honorPerSesi: number; // Nominal honor per sesi (contoh: 150000)
  createdAt: Date;
  updatedAt: Date;
}

const SesiSchema: Schema<ISesi> = new Schema(
  {
    jadwalId: {
      type: Schema.Types.ObjectId,
      ref: "Jadwal",
    },
    pengajarId: {
      type: Schema.Types.ObjectId,
      ref: "Pengajar",
      required: true,
    },
    namaPengajar: {
      type: String,
      required: true,
      trim: true,
    },
    nomorTeleponPengajar: {
      type: String,
      trim: true,
    },
    namaKelas: {
      type: String,
      required: true,
      trim: true,
    },
    mataPelajaran: {
      type: String,
      required: true,
      trim: true,
    },
    tanggal: {
      type: String,
      required: true,
    },
    waktuMulai: {
      type: String,
      required: true,
    },
    waktuSelesai: {
      type: String,
      required: true,
    },
    durasiJam: {
      type: Number,
      default: 2,
    },
    statusKehadiran: {
      type: String,
      enum: ["Hadir", "Terlambat", "Izin", "Digantikan"],
      default: "Hadir",
    },
    materiAjar: {
      type: String,
      required: [true, "Materi ajar / BAP wajib diisi"],
      trim: true,
    },
    capaianSiswa: {
      type: String,
      trim: true,
    },
    kendala: {
      type: String,
      trim: true,
    },
    buktiFoto: {
      type: String,
      trim: true,
    },
    statusVerifikasi: {
      type: String,
      enum: ["Menunggu Verifikasi", "Terverifikasi", "Perlu Revisi"],
      default: "Menunggu Verifikasi",
    },
    catatanVerifikasi: {
      type: String,
      trim: true,
    },
    honorPerSesi: {
      type: Number,
      default: 150000,
    },
  },
  {
    timestamps: true,
  }
);

const Sesi: Model<ISesi> =
  mongoose.models.Sesi || mongoose.model<ISesi>("Sesi", SesiSchema);

export default Sesi;

