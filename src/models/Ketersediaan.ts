import mongoose, { Schema, Document, Model } from "mongoose";

export type StatusKonfirmasi =
  | "Belum Diisi"
  | "Menunggu Pemeriksaan"
  | "Terkonfirmasi"
  | "Perlu Diperbarui";

export interface ISlotKetersediaan {
  hari: string; // Senin, Selasa, dst.
  jamMulai: string; // "16:00"
  jamSelesai: string; // "18:00"
  moda: "Online" | "Offline" | "Fleksibel";
  catatan?: string;
}

export interface IKetersediaan extends Document {
  pengajarId: mongoose.Types.ObjectId;
  namaPengajar: string;
  nomorTelepon: string;
  periode: string; // contoh: "Semester Ganjil 2026/2027"
  slots: ISlotKetersediaan[];
  statusKonfirmasi: StatusKonfirmasi;
  catatanKoordinator?: string;
  tanggalKonfirmasi?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const KetersediaanSchema: Schema<IKetersediaan> = new Schema(
  {
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
    nomorTelepon: {
      type: String,
      required: true,
      trim: true,
    },
    periode: {
      type: String,
      required: true,
      default: "Periode Berjalan 2026/2027",
    },
    slots: [
      {
        hari: { type: String, required: true },
        jamMulai: { type: String, required: true },
        jamSelesai: { type: String, required: true },
        moda: {
          type: String,
          enum: ["Online", "Offline", "Fleksibel"],
          default: "Fleksibel",
        },
        catatan: { type: String },
      },
    ],
    statusKonfirmasi: {
      type: String,
      enum: ["Belum Diisi", "Menunggu Pemeriksaan", "Terkonfirmasi", "Perlu Diperbarui"],
      default: "Menunggu Pemeriksaan",
    },
    catatanKoordinator: {
      type: String,
      trim: true,
    },
    tanggalKonfirmasi: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Ketersediaan: Model<IKetersediaan> =
  mongoose.models.Ketersediaan ||
  mongoose.model<IKetersediaan>("Ketersediaan", KetersediaanSchema);

export default Ketersediaan;

