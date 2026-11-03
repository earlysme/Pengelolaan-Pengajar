const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Baca .env.local untuk mendapatkan MONGODB_URI
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

// Format nama mapel standar
function normalizeMapel(m) {
  const upper = m.toUpperCase().trim();
  if (upper.includes("INGGRIS")) return "Bahasa Inggris";
  if (upper.includes("INDO")) return "Bahasa Indonesia";
  if (upper.includes("MTK") || upper.includes("MATEMATIKA")) return "Matematika";
  if (upper.includes("SOSIO")) return "Sosiologi";
  if (upper.includes("EKO")) return "Ekonomi";
  if (upper.includes("GEO")) return "Geografi";
  if (upper.includes("AKUNTANSI")) return "Akuntansi";
  if (upper.includes("FISIKA")) return "Fisika";
  if (upper.includes("KIMIA")) return "Kimia";
  if (upper.includes("BIOLOGI")) return "Biologi";
  if (upper.includes("IPA")) return "IPA Terpadu";
  return m.trim();
}

function normalizeTime(t) {
  // Ubah "16.00- 17.15" atau "16.00 - 17.15" menjadi jamMulai: "16:00", jamSelesai: "17:15"
  const clean = t.replace(/\./g, ":");
  const parts = clean.split("-").map((s) => s.trim());
  return {
    jamMulai: parts[0] || "",
    jamSelesai: parts[1] || "",
  };
}

async function runImport() {
  await mongoose.connect(mongoUri);
  console.log("Terhubung ke MongoDB!");

  // Dynamic schema Mongoose
  const Pengajar = mongoose.models.Pengajar || mongoose.model("Pengajar", new mongoose.Schema({
    nama: { type: String, required: true },
    nip: String,
    nomorTelepon: { type: String, required: true },
    email: String,
    alamat: String,
    foto: String,
    deskripsi: String,
    pendidikan: String,
    status: { type: String, enum: ["Aktif", "Cuti", "Nonaktif"], default: "Aktif" },
    mataPelajaran: [String],
    jenjang: [String],
    jenisKelas: [String],
    jadwalTersedia: [String],
    akunDiaktifkanPada: Date,
  }, { timestamps: true }));

  const Ketersediaan = mongoose.models.Ketersediaan || mongoose.model("Ketersediaan", new mongoose.Schema({
    pengajarId: { type: mongoose.Schema.Types.ObjectId, ref: "Pengajar", required: true },
    namaPengajar: { type: String, required: true },
    nomorTelepon: { type: String, required: true },
    periode: { type: String, required: true },
    slots: [{
      hari: String,
      jamMulai: String,
      jamSelesai: String,
      moda: String,
      catatan: String,
    }],
    statusKonfirmasi: { type: String, default: "Terkonfirmasi" },
    tanggalKonfirmasi: Date,
  }, { timestamps: true }));

  // Baca data hasil scraping 6 tab
  const dataPath = fs.existsSync(path.join(__dirname, "all_days_data.json"))
    ? path.join(__dirname, "all_days_data.json")
    : path.join(
        "C:",
        "Users",
        "elgle",
        ".gemini",
        "antigravity",
        "brain",
        "55175dc9-1cca-46fb-b723-227172390eac",
        "scratch",
        "all_days_data.json"
      );
  const allDays = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  // Agregasikan per Tutor: HANYA mengambil NAMA dan SESI JADWAL saja (ceklis jenjang/kelas diabaikan)
  const tutorAggregate = new Map();

  for (const [day, tutorList] of Object.entries(allDays)) {
    // Normalisasi hari: "SENIN" -> "Senin"
    const hari = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

    for (const t of tutorList) {
      const nama = t.nama.trim();
      const namaUpper = nama.toUpperCase();

      // PENGECUALIAN: Damar tidak diisi (sesuai instruksi pengguna)
      if (namaUpper.includes("DAMAR")) {
        continue;
      }

      if (!tutorAggregate.has(namaUpper)) {
        tutorAggregate.set(namaUpper, {
          nama: nama,
          mapelSet: new Set(),
          slotsByDay: [],
          serializedJadwal: [],
        });
      }

      const item = tutorAggregate.get(namaUpper);
      if (t.mapel) item.mapelSet.add(normalizeMapel(t.mapel));

      const activeSlots = t.slots.filter((s) => s.isAvailable);
      for (const slot of activeSlots) {
        const times = normalizeTime(slot.waktu);
        
        // Format string jadwalTersedia murni: hanya Hari dan Jam Sesi (tanpa ceklis kelas/jenjang)
        const formattedStr = `${hari}: ${times.jamMulai} - ${times.jamSelesai} WIB`;
        if (!item.serializedJadwal.includes(formattedStr)) {
          item.serializedJadwal.push(formattedStr);
        }

        // Slot untuk koleksi Ketersediaan
        item.slotsByDay.push({
          hari,
          jamMulai: times.jamMulai,
          jamSelesai: times.jamSelesai,
          moda: "Fleksibel",
          catatan: normalizeMapel(t.mapel) || "Sesi Bimbingan",
        });
      }
    }
  }

  console.log(`\nMemproses total ${tutorAggregate.size} tutor unik ke MongoDB...`);

  let countCreated = 0;
  let countUpdated = 0;

  for (const [namaUpper, item] of tutorAggregate.entries()) {
    const mapelArr = Array.from(item.mapelSet);
    const jenjangArr = ["SMA"];
    const kelasArr = ["Reguler"];

    // Cek apakah pengajar sudah ada di database
    let pengajar = await Pengajar.findOne({
      nama: { $regex: new RegExp(`^${item.nama}$`, "i") },
    });

    if (pengajar) {
      // Update sesi ketersediaan mengajar dan mapel, tanpa memasukkan ceklis sheet
      pengajar.mataPelajaran = Array.from(new Set([...(pengajar.mataPelajaran || []), ...mapelArr]));
      pengajar.jenjang = jenjangArr;
      pengajar.jenisKelas = kelasArr;
      if (item.serializedJadwal.length > 0) {
        pengajar.jadwalTersedia = item.serializedJadwal;
        pengajar.status = "Aktif";
      }
      await pengajar.save();
      countUpdated++;
      console.log(`[UPDATE] Tutor: ${pengajar.nama} (${pengajar.mataPelajaran.join(", ")}) - ${item.serializedJadwal.length} sesi`);
    } else {
      // Buat pengajar baru dengan data acak realistis untuk field pelengkap
      const randomPhone = "08" + Math.floor(1000000000 + Math.random() * 9000000000);
      const nip = "LB-2026-" + Math.floor(1000 + Math.random() * 9000);
      pengajar = await Pengajar.create({
        nama: item.nama,
        nip,
        nomorTelepon: randomPhone,
        email: item.nama.toLowerCase().replace(/[^a-z0-9]/g, "") + "@lenterabelajar.id",
        alamat: "Bandung, Jawa Barat",
        status: item.serializedJadwal.length > 0 ? "Aktif" : "Cuti",
        mataPelajaran: mapelArr,
        jenjang: jenjangArr,
        jenisKelas: kelasArr,
        jadwalTersedia: item.serializedJadwal,
        deskripsi: `Master tutor pengampu ${mapelArr.join(" & ")} dengan dedikasi tinggi dan penguasaan kurikulum intensif.`,
        pendidikan: `S1 Pendidikan ${mapelArr[0] || "Sains"} • Berpengalaman 3+ Tahun`,
      });
      countCreated++;
      console.log(`[CREATE] Tutor Baru: ${pengajar.nama} (${pengajar.mataPelajaran.join(", ")}) - ${item.serializedJadwal.length} sesi`);
    }

    // Buat atau update catatan Ketersediaan untuk periode 2 - 6 November 2026
    if (item.slotsByDay.length > 0) {
      await Ketersediaan.findOneAndUpdate(
        {
          pengajarId: pengajar._id,
          periode: "2 - 6 November 2026",
        },
        {
          pengajarId: pengajar._id,
          namaPengajar: pengajar.nama,
          nomorTelepon: pengajar.nomorTelepon,
          periode: "2 - 6 November 2026",
          slots: item.slotsByDay,
          statusKonfirmasi: "Terkonfirmasi",
          tanggalKonfirmasi: new Date(),
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log(`\n=== IMPORT SELESAI ===`);
  console.log(`Tutor Baru Dibuat: ${countCreated}`);
  console.log(`Tutor Diperbarui: ${countUpdated}`);
  console.log(`Total Diproses: ${countCreated + countUpdated}`);

  await mongoose.disconnect();
}

runImport().catch(console.error);

