# Siap Deploy ke Vercel

Aplikasi ini memakai Next.js, jadi Vercel dapat mendeteksi framework dan proses build secara otomatis. Tidak perlu `vercel.json` khusus untuk konfigurasi saat ini. Panduan ini menyiapkan repo; proyek Vercel belum dibuat dan belum ada deployment publik.

## Sebelum menghubungkan repo

- Siapkan database MongoDB yang dapat diakses dari deployment Vercel. Buat pengguna database khusus aplikasi dengan hak akses minimum yang diperlukan, lalu atur akses jaringan MongoDB sesuai mekanisme yang didukung paket/akun Anda.
- Jangan gunakan database produksi untuk Preview. Endpoint `/api/seed` dapat menghapus dan mengganti seluruh data; gunakan database terpisah untuk preview dan pengujian.
- Gunakan kredensial admin yang kuat dan rahasia sesi unik. Jangan masukkan nilai rahasia ke Git atau file yang di-commit.

## Impor ke Vercel

1. Buat proyek baru di Vercel dan impor repositori GitHub ini, `Pengelolaan-Pengajar`.
2. Atur Root Directory ke direktori akar repo. Framework preset seharusnya terdeteksi sebagai **Next.js**; gunakan `npm run build` sebagai Build Command jika Vercel meminta konfigurasi manual. Biarkan Output Directory mengikuti default Next.js.
3. Tambahkan Environment Variables di pengaturan proyek. Isi variabel untuk **Production**; bila mengaktifkan **Preview**, gunakan kredensial dan database preview yang terpisah.
4. Setelah variabel siap, jalankan deployment. Push berikutnya ke branch yang terhubung dapat memicu deployment otomatis sesuai pengaturan Vercel.

## Environment variables yang wajib

| Nama | Nilai |
|---|---|
| `MONGODB_URI` | URI koneksi database MongoDB untuk lingkungan terkait. |
| `SESSION_SECRET` | Rahasia acak unik, minimal 16 karakter; gunakan setidaknya 32 karakter untuk deployment. |
| `ADMIN_USERNAME` | Username koordinator yang unik. |
| `ADMIN_PASSWORD` | Password admin kuat dan unik. |

Contoh nama variabel tersedia di [`.env.example`](./.env.example). Untuk development lokal, salin sebagai `.env.local`; jangan commit `.env.local`. Jangan gunakan password development `admin` / `admin123` di deployment—fallback tersebut hanya aktif di development.

## Pemeriksaan setelah deploy

- Pastikan halaman utama dan `/login` dapat dibuka.
- Coba login koordinator menggunakan kredensial yang dikonfigurasi dan pastikan fitur yang memakai database dapat terhubung.
- Jangan jalankan seed pada database produksi yang berisi data nyata: endpoint tersebut menghapus data lama sebelum memasukkan contoh data.
- Pembatas percobaan login saat ini disimpan di memori proses; pada Vercel/serverless pembatas ini tidak konsisten antar-instance. Pertimbangkan penyimpanan bersama bila aplikasi dibuka untuk penggunaan publik.
