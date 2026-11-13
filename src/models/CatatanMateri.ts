import mongoose, { Schema, models, model } from "mongoose";

/**
 * Catatan materi kelas reguler.
 * Kuncinya mapel + jenjang (bukan tutor), jadi semua tutor yang mengajar
 * kombinasi itu membaca dan menulis di riwayat yang sama.
 */
const CatatanMateriSchema = new Schema(
  {
    mapel: { type: String, required: true, trim: true },
    jenjang: { type: String, required: true, trim: true },
    program: { type: String, default: "Reguler" },
    tanggal: { type: Date, required: true, default: Date.now },
    materi: { type: String, required: true, trim: true, maxlength: 200 },
    catatan: { type: String, trim: true, maxlength: 1000, default: "" },
    rencanaBerikutnya: { type: String, trim: true, maxlength: 500, default: "" },
    tutorId: { type: Schema.Types.ObjectId, ref: "Pengajar", required: true },
    tutorNama: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

CatatanMateriSchema.index({ mapel: 1, jenjang: 1, tanggal: -1 });

export default (models.CatatanMateri as mongoose.Model<any>) ||
  model("CatatanMateri", CatatanMateriSchema);
