import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMasterSesi extends Document {
  nama: string; // "Sesi 1", "Sesi 2", dst.
  hariGroup: string; // "Senin - Kamis", "Jumat", "Sabtu", "Semua"
  hari: string[]; // ["Senin", "Selasa", "Rabu", "Kamis"]
  jamMulai: string; // "13:00"
  jamSelesai: string; // "14:15"
  waktuLabel: string; // "13.00 - 14.15"
  durasiMenit: number; // 75
  urutan: number; // 1, 2, 3, 4, 5
  aktif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_SESI_SENIN_KAMIS = [
  {
    nama: "Sesi 1",
    hariGroup: "Senin - Kamis",
    hari: ["Senin", "Selasa", "Rabu", "Kamis"],
    jamMulai: "13:00",
    jamSelesai: "14:15",
    waktuLabel: "13.00 - 14.15",
    durasiMenit: 75,
    urutan: 1,
    aktif: true,
  },
  {
    nama: "Sesi 2",
    hariGroup: "Senin - Kamis",
    hari: ["Senin", "Selasa", "Rabu", "Kamis"],
    jamMulai: "14:30",
    jamSelesai: "15:45",
    waktuLabel: "14.30 - 15.45",
    durasiMenit: 75,
    urutan: 2,
    aktif: true,
  },
  {
    nama: "Sesi 3",
    hariGroup: "Senin - Kamis",
    hari: ["Senin", "Selasa", "Rabu", "Kamis"],
    jamMulai: "16:00",
    jamSelesai: "17:15",
    waktuLabel: "16.00 - 17.15",
    durasiMenit: 75,
    urutan: 3,
    aktif: true,
  },
  {
    nama: "Sesi 4",
    hariGroup: "Senin - Kamis",
    hari: ["Senin", "Selasa", "Rabu", "Kamis"],
    jamMulai: "17:15",
    jamSelesai: "18:30",
    waktuLabel: "17.15 - 18.30",
    durasiMenit: 75,
    urutan: 4,
    aktif: true,
  },
  {
    nama: "Sesi 5",
    hariGroup: "Senin - Kamis",
    hari: ["Senin", "Selasa", "Rabu", "Kamis"],
    jamMulai: "18:45",
    jamSelesai: "20:00",
    waktuLabel: "18.45 - 20.00",
    durasiMenit: 75,
    urutan: 5,
    aktif: true,
  },
];

export const DEFAULT_SESI_JUMAT = [
  {
    nama: "Sesi 1",
    hariGroup: "Jumat",
    hari: ["Jumat"],
    jamMulai: "11:30",
    jamSelesai: "12:45",
    waktuLabel: "11.30 - 12.45",
    durasiMenit: 75,
    urutan: 1,
    aktif: true,
  },
  {
    nama: "Sesi 2",
    hariGroup: "Jumat",
    hari: ["Jumat"],
    jamMulai: "13:00",
    jamSelesai: "14:15",
    waktuLabel: "13.00 - 14.15",
    durasiMenit: 75,
    urutan: 2,
    aktif: true,
  },
  {
    nama: "Sesi 3",
    hariGroup: "Jumat",
    hari: ["Jumat"],
    jamMulai: "14:30",
    jamSelesai: "15:45",
    waktuLabel: "14.30 - 15.45",
    durasiMenit: 75,
    urutan: 3,
    aktif: true,
  },
  {
    nama: "Sesi 4",
    hariGroup: "Jumat",
    hari: ["Jumat"],
    jamMulai: "16:00",
    jamSelesai: "17:15",
    waktuLabel: "16.00 - 17.15",
    durasiMenit: 75,
    urutan: 4,
    aktif: true,
  },
  {
    nama: "Sesi 5",
    hariGroup: "Jumat",
    hari: ["Jumat"],
    jamMulai: "17:15",
    jamSelesai: "18:30",
    waktuLabel: "17.15 - 18.30",
    durasiMenit: 75,
    urutan: 5,
    aktif: true,
  },
  {
    nama: "Sesi 6",
    hariGroup: "Jumat",
    hari: ["Jumat"],
    jamMulai: "18:45",
    jamSelesai: "20:00",
    waktuLabel: "18.45 - 20.00",
    durasiMenit: 75,
    urutan: 6,
    aktif: true,
  },
];

export const DEFAULT_SESI_SABTU = [
  {
    nama: "Sesi 1",
    hariGroup: "Sabtu",
    hari: ["Sabtu"],
    jamMulai: "09:00",
    jamSelesai: "10:15",
    waktuLabel: "09.00 - 10.15",
    durasiMenit: 75,
    urutan: 1,
    aktif: true,
  },
  {
    nama: "Sesi 2",
    hariGroup: "Sabtu",
    hari: ["Sabtu"],
    jamMulai: "10:15",
    jamSelesai: "11:30",
    waktuLabel: "10.15 - 11.30",
    durasiMenit: 75,
    urutan: 2,
    aktif: true,
  },
  {
    nama: "Sesi 3",
    hariGroup: "Sabtu",
    hari: ["Sabtu"],
    jamMulai: "11:30",
    jamSelesai: "12:45",
    waktuLabel: "11.30 - 12.45",
    durasiMenit: 75,
    urutan: 3,
    aktif: true,
  },
  {
    nama: "Sesi 4",
    hariGroup: "Sabtu",
    hari: ["Sabtu"],
    jamMulai: "13:00",
    jamSelesai: "14:15",
    waktuLabel: "13.00 - 14.15",
    durasiMenit: 75,
    urutan: 4,
    aktif: true,
  },
  {
    nama: "Sesi 5",
    hariGroup: "Sabtu",
    hari: ["Sabtu"],
    jamMulai: "14:15",
    jamSelesai: "15:30",
    waktuLabel: "14.15 - 15.30",
    durasiMenit: 75,
    urutan: 5,
    aktif: true,
  },
  {
    nama: "Sesi 6",
    hariGroup: "Sabtu",
    hari: ["Sabtu"],
    jamMulai: "15:30",
    jamSelesai: "16:45",
    waktuLabel: "15.30 - 16.45",
    durasiMenit: 75,
    urutan: 6,
    aktif: true,
  },
  {
    nama: "Sesi 7",
    hariGroup: "Sabtu",
    hari: ["Sabtu"],
    jamMulai: "16:45",
    jamSelesai: "18:00",
    waktuLabel: "16.45 - 18.00",
    durasiMenit: 75,
    urutan: 7,
    aktif: true,
  },
  {
    nama: "Sesi 8",
    hariGroup: "Sabtu",
    hari: ["Sabtu"],
    jamMulai: "18:00",
    jamSelesai: "19:15",
    waktuLabel: "18.00 - 19.15",
    durasiMenit: 75,
    urutan: 8,
    aktif: true,
  },
];

const MasterSesiSchema = new Schema<IMasterSesi>(
  {
    nama: {
      type: String,
      required: [true, "Nama sesi wajib diisi"],
      trim: true,
    },
    hariGroup: {
      type: String,
      default: "Senin - Kamis",
      trim: true,
    },
    hari: {
      type: [String],
      default: ["Senin", "Selasa", "Rabu", "Kamis"],
    },
    jamMulai: {
      type: String,
      required: [true, "Jam mulai wajib diisi"],
      trim: true,
    },
    jamSelesai: {
      type: String,
      required: [true, "Jam selesai wajib diisi"],
      trim: true,
    },
    waktuLabel: {
      type: String,
      required: true,
      trim: true,
    },
    durasiMenit: {
      type: Number,
      default: 75,
    },
    urutan: {
      type: Number,
      default: 1,
    },
    aktif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MasterSesi: Model<IMasterSesi> =
  mongoose.models.MasterSesi ||
  mongoose.model<IMasterSesi>("MasterSesi", MasterSesiSchema);

export default MasterSesi;

