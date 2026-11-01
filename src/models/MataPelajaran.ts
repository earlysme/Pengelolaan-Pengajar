import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMataPelajaran extends Document {
  nama: string;
  deskripsi?: string;
  aktif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MataPelajaranSchema = new Schema<IMataPelajaran>(
  {
    nama: {
      type: String,
      required: [true, "Nama mata pelajaran wajib diisi"],
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

const MataPelajaran: Model<IMataPelajaran> =
  mongoose.models.MataPelajaran ||
  mongoose.model<IMataPelajaran>("MataPelajaran", MataPelajaranSchema);

export default MataPelajaran;
