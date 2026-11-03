import mongoose, { Schema, Document, Model } from "mongoose";

export const DAFTAR_HARI_JADWAL = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export type HariJadwal = (typeof DAFTAR_HARI_JADWAL)[number];

export interface IJadwal extends Document {
  namaKelas: string;
  mataPelajaran: string;
  jenjang: string; // SD, SMP, SMA, UTBK
  pengajarId: mongoose.Types.ObjectId;
  namaPengajar: string;
  nomorTeleponPengajar?: string;
  hari: HariJadwal;
  sesi?: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
  moda: "Online" | "Offline";
  jumlahSiswa: number;
  status: "Terjadwal" | "Berjalan" | "Selesai" | "Dibatalkan";
  createdAt: Date;
  updatedAt: Date;
}

const JadwalSchema: Schema<IJadwal> = new Schema(
  {
    namaKelas: {
      type: String,
      required: [true, "Nama kelas wajib diisi"],
      trim: true,
    },
    mataPelajaran: {
      type: String,
      required: true,
      trim: true,
    },
    jenjang: {
      type: String,
      required: true,
      default: "SMA",
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
    hari: {
      type: String,
      required: [true, "Hari wajib diisi"],
      enum: {
        values: DAFTAR_HARI_JADWAL,
        message: "Hari harus salah satu dari: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu",
      },
    },
    sesi: {
      type: String,
      trim: true,
    },
    jamMulai: {
      type: String,
      required: true,
    },
    jamSelesai: {
      type: String,
      required: true,
    },
    ruangan: {
      type: String,
      default: "Ruang Kelas A",
    },
    moda: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offline",
    },
    jumlahSiswa: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ["Terjadwal", "Berjalan", "Selesai", "Dibatalkan"],
      default: "Terjadwal",
    },
  },
  {
    timestamps: true,
  }
);

const Jadwal: Model<IJadwal> =
  mongoose.models.Jadwal || mongoose.model<IJadwal>("Jadwal", JadwalSchema);

export default Jadwal;

