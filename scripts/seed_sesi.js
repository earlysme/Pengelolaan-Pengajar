const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const envPath = path.join(__dirname, "..", ".env.local");
let mongoUri = "";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/MONGODB_URI=(.*)/);
  if (match) mongoUri = match[1].trim();
}

if (!mongoUri) {
  console.error("MONGODB_URI tidak ditemukan di .env.local!");
  process.exit(1);
}

const sessions = [
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
  // Sesi Hari Jumat
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
  // Sesi Hari Sabtu
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

async function seed() {
  await mongoose.connect(mongoUri);
  console.log("Terhubung ke MongoDB!");
  const db = mongoose.connection.db;
  const col = db.collection("mastersesis");

  for (const s of sessions) {
    await col.updateOne(
      { nama: s.nama, hariGroup: s.hariGroup },
      { $set: s, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    console.log(`[SUCCESS] Tersimpan di Database: ${s.nama} (${s.waktuLabel}) - ${s.hariGroup}`);
  }

  const all = await col.find({}).toArray();
  console.log(`\nTotal Dokumen Master Sesi di MongoDB: ${all.length}`);
  all.forEach((item) => {
    console.log(`- ${item.nama}: ${item.waktuLabel} (${item.hari.join(", ")})`);
  });

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

