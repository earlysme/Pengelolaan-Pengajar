import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJenjang extends Document {
  nama: string;
  deskripsi?: string;
  aktif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JenjangSchema = new Schema<IJenjang>(
  {
    nama: {
      type: String,
      required: [true, "Nama jenjang wajib diisi"],
      unique: true,
      trim: true,
    },
    deskripsi: {
      type: String,
      trim: true,
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

const Jenjang: Model<IJenjang> =
  mongoose.models.Jenjang || mongoose.model<IJenjang>("Jenjang", JenjangSchema);

export default Jenjang;
