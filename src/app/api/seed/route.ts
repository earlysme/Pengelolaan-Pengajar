import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Pengajar from "@/models/Pengajar";
import Ketersediaan from "@/models/Ketersediaan";
import Jadwal from "@/models/Jadwal";
import Sesi from "@/models/Sesi";
import { requireKoordinator } from "@/lib/auth";

export async function POST() {
  try {
    if (!(await requireKoordinator())) {
      return NextResponse.json({ success: false, error: "Akses khusus koordinator." }, { status: 401 });
    }
    await connectDB();

    // Hapus data lama agar reset bersih
    await Pengajar.deleteMany({});
    await Ketersediaan.deleteMany({});
    await Jadwal.deleteMany({});
    await Sesi.deleteMany({});

    const dummyPengajar = [
      {
        nama: "Kak Rian Pratama",
        nip: "LB-2021-0842",
        nomorTelepon: "081249829011",
        email: "rian.pratama@lenterabelajar.id",
        alamat: "Jl. Margonda Raya No. 45, Depok",
        foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        pendidikan: "S1 Pendidikan Fisika UI",
        deskripsi: "Spesialis pemahaman konsep logika fisika dan trik cepat persiapan UTBK SNBT tanpa rumus hafalan panjang.",
        status: "Aktif",
        mataPelajaran: ["Fisika", "UTBK & SNBT"],
        jenjang: ["SMA", "UTBK/Kedinasan"],
        jenisKelas: ["Reguler", "Privat"],
        jadwalTersedia: [
          "Senin: 16:00 - 18:00 (XII MIPA 1)",
          "Rabu: 18:30 - 20:30 (X Reguler)",
          "Sabtu: 09:00 - 12:00 (Intensif UTBK)",
        ],
        kelasAktif: [
          { namaKelas: "Kelas 12 Intensif UTBK", jumlahSiswa: 18 },
          { namaKelas: "Kelas 10 Reguler Sains", jumlahSiswa: 14 },
        ],
        dokumenStatus: "Lengkap",
        catatanInternal: "Tutor unggulan, rating evaluasi siswa 4.9/5.0.",
      },
      {
        nama: "Kak Siti Rahmawati",
        nip: "LB-2022-0193",
        nomorTelepon: "082198765432",
        email: "siti.rahma@lenterabelajar.id",
        alamat: "Jl. Tebet Barat Dalam No. 12, Jakarta Selatan",
        foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
        pendidikan: "Magister Kimia ITB",
        deskripsi: "Berfokus pada pemahaman konsep sains dasar hingga persiapan olimpiade dan seleksi masuk PTN impian.",
        status: "Aktif",
        mataPelajaran: ["Kimia", "Biologi"],
        jenjang: ["SMP", "SMA"],
        jenisKelas: ["Reguler", "Semi-Privat"],
        jadwalTersedia: [
          "Selasa: 15:30 - 17:30 (XI IPA 2)",
          "Kamis: 16:00 - 18:00 (XII Kimia Mandiri)",
          "Sabtu: 13:00 - 15:00 (Slot Kosong)",
        ],
        kelasAktif: [
          { namaKelas: "Kelas 11 Persiapan OSN Kimia", jumlahSiswa: 12 },
          { namaKelas: "Kelas 12 Reguler IPA", jumlahSiswa: 16 },
        ],
        dokumenStatus: "Lengkap",
        catatanInternal: "Fokus persiapan olimpiade & kelas intensif IPA.",
      },
      {
        nama: "Kak Dimas Prasetyo",
        nip: "LB-2023-0411",
        nomorTelepon: "085712349988",
        email: "dimas.prasetyo@lenterabelajar.id",
        alamat: "Jl. Salemba Tengah No. 8, Jakarta Pusat",
        foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
        pendidikan: "S1 Sastra Inggris Unpad",
        deskripsi: "Pendekatan speaking confidence dan tips trik reading comprehension TOEFL/UTBK secara interaktif.",
        status: "Aktif",
        mataPelajaran: ["Bahasa Inggris"],
        jenjang: ["SD", "SMP", "SMA"],
        jenisKelas: ["Privat", "Online"],
        jadwalTersedia: [
          "Senin: 19:00 - 20:30 (Online Speaking)",
          "Rabu: 16:00 - 18:00 (SMP Reguler)",
          "Jumat: 14:00 - 16:00 (Slot Kosong)",
        ],
        kelasAktif: [
          { namaKelas: "Kelas Bahasa Inggris TOEFL Prep", jumlahSiswa: 15 },
        ],
        dokumenStatus: "Lengkap",
        catatanInternal: "Sangat komunikatif dan disukai siswa jenjang SMA.",
      },
      {
        nama: "Kak Aulia Nurul",
        nip: "LB-2022-0754",
        nomorTelepon: "081377889900",
        email: "aulia.nurul@lenterabelajar.id",
        alamat: "Jl. Veteran No. 20, Bogor",
        foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
        pendidikan: "S1 PGSD UNJ",
        deskripsi: "Sabar dan telaten mendampingi siswa SD & SMP membangun fondasi matematika dan literasi yang kokoh.",
        status: "Aktif",
        mataPelajaran: ["Matematika", "Bahasa Indonesia"],
        jenjang: ["SD", "SMP"],
        jenisKelas: ["Reguler", "Privat"],
        jadwalTersedia: [
          "Selasa: 14:00 - 16:00 (SD Kelas 6 Sukses UN)",
          "Kamis: 14:00 - 16:00 (SMP Kelas 7 Aljabar)",
          "Sabtu: 10:00 - 12:00 (Slot Kosong)",
        ],
        kelasAktif: [
          { namaKelas: "Kelas Matematika Dasar Ceria", jumlahSiswa: 10 },
          { namaKelas: "Kelas Literasi & Bahasa", jumlahSiswa: 12 },
        ],
        dokumenStatus: "Lengkap",
        catatanInternal: "Sabar dalam membimbing siswa jenjang SD dan SMP awal.",
      },
    ];

    const insertedPengajar = await Pengajar.insertMany(dummyPengajar);

    // 2. Seed Ketersediaan (Modul 2)
    const dummyKetersediaan = [
      {
        pengajarId: insertedPengajar[0]._id,
        namaPengajar: insertedPengajar[0].nama,
        nomorTelepon: insertedPengajar[0].nomorTelepon,
        periode: "Semester Ganjil 2026/2027",
        statusKonfirmasi: "Terkonfirmasi",
        slots: [
          { hari: "Senin", jamMulai: "16:00", jamSelesai: "18:00", moda: "Offline" },
          { hari: "Rabu", jamMulai: "18:30", jamSelesai: "20:30", moda: "Offline" },
          { hari: "Sabtu", jamMulai: "09:00", jamSelesai: "12:00", moda: "Online" },
        ],
      },
      {
        pengajarId: insertedPengajar[1]._id,
        namaPengajar: insertedPengajar[1].nama,
        nomorTelepon: insertedPengajar[1].nomorTelepon,
        periode: "Semester Ganjil 2026/2027",
        statusKonfirmasi: "Menunggu Pemeriksaan",
        slots: [
          { hari: "Selasa", jamMulai: "15:30", jamSelesai: "17:30", moda: "Offline" },
          { hari: "Kamis", jamMulai: "16:00", jamSelesai: "18:00", moda: "Offline" },
        ],
      },
      {
        pengajarId: insertedPengajar[2]._id,
        namaPengajar: insertedPengajar[2].nama,
        nomorTelepon: insertedPengajar[2].nomorTelepon,
        periode: "Semester Ganjil 2026/2027",
        statusKonfirmasi: "Perlu Diperbarui",
        catatanKoordinator: "Mohon tambahkan opsi hari kerja selain Jumat.",
        slots: [
          { hari: "Jumat", jamMulai: "14:00", jamSelesai: "16:00", moda: "Online" },
        ],
      },
      {
        pengajarId: insertedPengajar[3]._id,
        namaPengajar: insertedPengajar[3].nama,
        nomorTelepon: insertedPengajar[3].nomorTelepon,
        periode: "Semester Ganjil 2026/2027",
        statusKonfirmasi: "Terkonfirmasi",
        slots: [
          { hari: "Selasa", jamMulai: "14:00", jamSelesai: "16:00", moda: "Offline" },
          { hari: "Kamis", jamMulai: "14:00", jamSelesai: "16:00", moda: "Offline" },
        ],
      },
    ];
    await Ketersediaan.insertMany(dummyKetersediaan);

    // 3. Seed Jadwal Resmi (Modul 3)
    const dummyJadwal = [
      {
        namaKelas: "Kelas 12 Intensif UTBK",
        mataPelajaran: "Fisika",
        jenjang: "SMA",
        pengajarId: insertedPengajar[0]._id,
        namaPengajar: insertedPengajar[0].nama,
        nomorTeleponPengajar: insertedPengajar[0].nomorTelepon,
        hari: "Senin",
        jamMulai: "16:00",
        jamSelesai: "18:00",
        ruangan: "Lab Sains 1",
        moda: "Offline",
        jumlahSiswa: 18,
        status: "Berjalan",
      },
      {
        namaKelas: "Kelas 11 Persiapan OSN Kimia",
        mataPelajaran: "Kimia",
        jenjang: "SMA",
        pengajarId: insertedPengajar[1]._id,
        namaPengajar: insertedPengajar[1].nama,
        nomorTeleponPengajar: insertedPengajar[1].nomorTelepon,
        hari: "Selasa",
        jamMulai: "15:30",
        jamSelesai: "17:30",
        ruangan: "Ruang Teori B",
        moda: "Offline",
        jumlahSiswa: 12,
        status: "Berjalan",
      },
      {
        namaKelas: "Kelas Bahasa Inggris TOEFL Prep",
        mataPelajaran: "Bahasa Inggris",
        jenjang: "SMA",
        pengajarId: insertedPengajar[2]._id,
        namaPengajar: insertedPengajar[2].nama,
        nomorTeleponPengajar: insertedPengajar[2].nomorTelepon,
        hari: "Senin",
        jamMulai: "19:00",
        jamSelesai: "20:30",
        ruangan: "Zoom Room 2",
        moda: "Online",
        jumlahSiswa: 15,
        status: "Berjalan",
      },
      {
        namaKelas: "Kelas Matematika Dasar Ceria",
        mataPelajaran: "Matematika",
        jenjang: "SD",
        pengajarId: insertedPengajar[3]._id,
        namaPengajar: insertedPengajar[3].nama,
        nomorTeleponPengajar: insertedPengajar[3].nomorTelepon,
        hari: "Selasa",
        jamMulai: "14:00",
        jamSelesai: "16:00",
        ruangan: "Ruang A1",
        moda: "Offline",
        jumlahSiswa: 10,
        status: "Berjalan",
      },
    ];
    await Jadwal.insertMany(dummyJadwal);

    // 4. Seed Sesi & BAP (Modul 4 & 5 & 6)
    const dummySesi = [
      {
        pengajarId: insertedPengajar[0]._id,
        namaPengajar: insertedPengajar[0].nama,
        namaKelas: "Kelas 12 Intensif UTBK",
        mataPelajaran: "Fisika",
        tanggal: "2026-10-26",
        waktuMulai: "16:00",
        waktuSelesai: "18:00",
        durasiJam: 2,
        statusKehadiran: "Hadir",
        materiAjar: "Dinamika Gerak Lurus & Hukum Newton: Pembahasan Soal Tipe HOTS",
        capaianSiswa: "18/18 siswa menyelesaikan lembar simulasi mandiri dengan rata-rata 82%.",
        kendala: "Tidak ada kendala, proyektor berjalan lancar.",
        buktiFoto: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format&fit=crop&q=80",
        statusVerifikasi: "Terverifikasi",
        honorPerSesi: 150000,
      },
      {
        pengajarId: insertedPengajar[1]._id,
        namaPengajar: insertedPengajar[1].nama,
        namaKelas: "Kelas 11 Persiapan OSN Kimia",
        mataPelajaran: "Kimia",
        tanggal: "2026-10-27",
        waktuMulai: "15:30",
        waktuSelesai: "17:30",
        durasiJam: 2,
        statusKehadiran: "Hadir",
        materiAjar: "Termokimia & Hukum Hess: Bedah Soal OSN Tingkat Provinsi",
        capaianSiswa: "Siswa memahami penurunan rumus entalpi reaksi pembakaran.",
        kendala: "1 siswa izin sakit (Budi Pratama).",
        buktiFoto: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&auto=format&fit=crop&q=80",
        statusVerifikasi: "Menunggu Verifikasi",
        honorPerSesi: 150000,
      },
      {
        pengajarId: insertedPengajar[2]._id,
        namaPengajar: insertedPengajar[2].nama,
        namaKelas: "Kelas Bahasa Inggris TOEFL Prep",
        mataPelajaran: "Bahasa Inggris",
        tanggal: "2026-10-26",
        waktuMulai: "19:00",
        waktuSelesai: "20:30",
        durasiJam: 1.5,
        statusKehadiran: "Hadir",
        materiAjar: "Listening Section Part B & C: Identifying Main Ideas and Inferences",
        capaianSiswa: "Latihan listening audio kecepatan natural lulus skor rata-rata 480.",
        kendala: "Koneksi internet siswa sedikit lambat di awal 10 menit.",
        buktiFoto: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80",
        statusVerifikasi: "Perlu Revisi",
        catatanVerifikasi: "Mohon lampirkan link rekaman Zoom sesi untuk konfirmasi presensi.",
        honorPerSesi: 125000,
      },
      {
        pengajarId: insertedPengajar[3]._id,
        namaPengajar: insertedPengajar[3].nama,
        namaKelas: "Kelas Matematika Dasar Ceria",
        mataPelajaran: "Matematika",
        tanggal: "2026-10-27",
        waktuMulai: "14:00",
        waktuSelesai: "16:00",
        durasiJam: 2,
        statusKehadiran: "Hadir",
        materiAjar: "Pecahan Senilai dan Operasi Hitung Campuran Menggunakan Alat Peraga Kartu",
        capaianSiswa: "Anak-anak sangat antusias dan berhasil menyelesaikan kuis kartu.",
        kendala: "Tidak ada.",
        buktiFoto: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&auto=format&fit=crop&q=80",
        statusVerifikasi: "Terverifikasi",
        honorPerSesi: 150000,
      },
    ];
    await Sesi.insertMany(dummySesi);

    return NextResponse.json({
      success: true,
      message: "Data contoh berhasil di-seed (4 Pengajar, 4 Ketersediaan, 4 Jadwal Resmi, 4 Sesi BAP)!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal seed data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
