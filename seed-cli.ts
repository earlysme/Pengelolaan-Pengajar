import connectDB from './src/lib/mongodb.ts';
import Pengajar from './src/models/Pengajar.ts';

async function seed() {
  try {
    await connectDB();
    const count = await Pengajar.countDocuments();
    if (count > 0) {
      console.log('Database already has ' + count + ' records.');
      process.exit(0);
    }
    await Pengajar.insertMany([
      {
        nama: "Rizky Firmansyah, S.Pd.",
        nomorTelepon: "081234567890",
        email: "rizky.f@gmail.com",
        alamat: "Jl. Margonda Raya No. 45, Depok",
        status: "Aktif",
        mataPelajaran: ["Matematika", "Fisika"],
        jenjang: ["SMA", "UTBK/Kedinasan"],
        jenisKelas: ["Reguler", "Privat"],
        dokumenStatus: "Lengkap",
        catatanInternal: "Sangat komunikatif, tutor unggulan persiapan UTBK SNBT.",
      },
      {
        nama: "Siti Rahmawati, M.Si.",
        nomorTelepon: "082198765432",
        email: "siti.rahma@gmail.com",
        alamat: "Jl. Tebet Barat Dalam No. 12, Jakarta Selatan",
        status: "Aktif",
        mataPelajaran: ["Kimia", "Biologi"],
        jenjang: ["SMP", "SMA"],
        jenisKelas: ["Reguler", "Semi-Privat"],
        dokumenStatus: "Lengkap",
        catatanInternal: "Fokus persiapan olimpiade & kelas intensif IPA.",
      },
      {
        nama: "Dimas Prasetyo, S.S.",
        nomorTelepon: "085712349988",
        email: "dimas.prasetyo@gmail.com",
        alamat: "Jl. Salemba Tengah No. 8, Jakarta Pusat",
        status: "Cuti",
        mataPelajaran: ["Bahasa Inggris"],
        jenjang: ["SD", "SMP", "SMA"],
        jenisKelas: ["Privat", "Online"],
        dokumenStatus: "Lengkap",
        catatanInternal: "Sedang cuti studi lanjut s/d bulan depan.",
      },
      {
        nama: "Aulia Nurul Hidayah, S.Pd.",
        nomorTelepon: "081377889900",
        email: "aulia.nurul@gmail.com",
        alamat: "Jl. Veteran No. 20, Bogor",
        status: "Aktif",
        mataPelajaran: ["Bahasa Indonesia", "Matematika"],
        jenjang: ["SD", "SMP"],
        jenisKelas: ["Reguler", "Privat"],
        dokumenStatus: "Lengkap",
        catatanInternal: "Sabar dalam membimbing siswa jenjang SD dan SMP awal.",
      },
    ]);
    console.log('Seeded 4 pengajar successfully into MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
