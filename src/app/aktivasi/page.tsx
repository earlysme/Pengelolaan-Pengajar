"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function FormAktivasi() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";

  const [status, setStatus] = useState<"memeriksa" | "valid" | "invalid">(() =>
    !token ? "invalid" : "memeriksa"
  );
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState("");
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [error, setError] = useState<string>(() =>
    !token ? "Link undangan aktivasi tidak lengkap." : ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    fetch(`/api/auth/aktivasi?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success) {
          setNama(json.data.nama);
          setEmail(json.data.email || "");
          setStatus("valid");
        } else {
          setError(json.error || "Link aktivasi sudah kedaluwarsa atau tidak valid.");
          setStatus("invalid");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Terjadi kendala koneksi ke server.");
        setStatus("invalid");
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== konfirmasi) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal harus 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/aktivasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const json = await res.json();
      if (json.success) {
        // Sesi sudah dibuat server lewat cookie, langsung redirect ke dashboard tutor
        router.push("/tutor");
      } else {
        setError(json.error || "Gagal mengaktifkan akun.");
      }
    } catch {
      setError("Terjadi kendala koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl text-[#173F3A] focus:outline-none focus:border-[#173F3A] focus:bg-white focus:ring-1 focus:ring-[#173F3A] transition-colors placeholder:text-[#173F3A]/40";

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F2D5A8]/60 text-[0.75rem] font-semibold text-[#173F3A] uppercase tracking-wider mb-3 border border-[#D88A32]/30">
          Aktivasi Akun Tutor
        </span>
        <h1 className="font-serif text-[2.25rem] text-[#173F3A] tracking-tight font-bold">
          {status === "valid" ? `Halo, ${nama}` : "Aktivasi Akun"}
        </h1>
        {status === "valid" ? (
          <p className="mt-2 text-[0.875rem] text-[#444748]">
            Atur email dan password pribadi Anda untuk mulai mengakses portal mandiri tutor.
          </p>
        ) : (
          <p className="mt-2 text-[0.875rem] text-[#444748]">
            Verifikasi tautan undangan aktivasi akun Anda.
          </p>
        )}
      </div>

      <div className="bg-white border border-[#173F3A]/15 rounded-2xl p-7 shadow-[0_4px_20px_rgba(23,63,58,0.06)]">
        {status === "memeriksa" && (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <span className="w-6 h-6 border-2 border-[#173F3A] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-center text-[0.875rem] text-[#444748]">Memeriksa validitas link undangan...</p>
          </div>
        )}

        {status === "invalid" && (
          <div className="space-y-4 text-center py-4">
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[0.8125rem]">
              {error}
            </div>
            <p className="text-[0.8125rem] text-[#444748]">
              Link undangan ini mungkin sudah pernah digunakan atau telah melewati batas 72 jam. Hubungi koordinator bimbel Anda untuk meminta link baru.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[#173F3A] hover:underline transition-colors mt-2"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Menuju Halaman Login
            </Link>
          </div>
        )}

        {status === "valid" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[0.8125rem]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                Alamat Email Login
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              <p className="text-[0.72rem] text-[#67645f] mt-1.5">
                Email ini akan digunakan sebagai identitas akun untuk login berikutnya.
              </p>
            </div>

            <div>
              <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl text-[#173F3A] focus:outline-none focus:border-[#173F3A] focus:bg-white focus:ring-1 focus:ring-[#173F3A] transition-colors placeholder:text-[#173F3A]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67645f] hover:text-[#173F3A] p-1 flex items-center justify-center transition-colors"
                  title={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="text-[0.72rem] text-[#67645f] mt-1.5">
                Minimal 8 karakter, kombinasikan huruf dan angka.
              </p>
            </div>

            <div>
              <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                Ulangi Password
              </label>
              <div className="relative">
                <input
                  type={showKonfirmasi ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Masukkan ulang password Anda"
                  value={konfirmasi}
                  onChange={(e) => setKonfirmasi(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl text-[#173F3A] focus:outline-none focus:border-[#173F3A] focus:bg-white focus:ring-1 focus:ring-[#173F3A] transition-colors placeholder:text-[#173F3A]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67645f] hover:text-[#173F3A] p-1 flex items-center justify-center transition-colors"
                  title={showKonfirmasi ? "Sembunyikan password" : "Lihat password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showKonfirmasi ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 bg-[#173F3A] hover:bg-[#12312d] text-white rounded-full text-[0.875rem] font-semibold transition-all shadow-sm disabled:opacity-50 mt-4 active:scale-[0.99]"
            >
              {loading ? "Menyimpan & Mengaktifkan..." : "Aktifkan Akun & Masuk"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function HalamanAktivasi() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#172421] flex flex-col justify-between selection:bg-[#F2D5A8] selection:text-[#173F3A]">
      {/* Top Navbar Header */}
      <header className="w-full bg-[#faf8f5]/85 backdrop-blur-md border-b border-[#173F3A]/10">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <img src="/logo.svg" alt="Gen Plasma" className="w-9 h-9 object-contain" />
            <div className="flex flex-col">
              <span className="font-serif text-[1.35rem] leading-none tracking-tight text-[#173F3A] select-none font-bold">
                Gen Plasma
              </span>
              <span className="text-[0.68rem] tracking-wider uppercase text-[#B74E2C] font-semibold">
                Alur Selaras
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-[0.875rem] font-medium text-[#173F3A]/70 hover:text-[#173F3A] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Halaman Login
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Suspense fallback={<p className="text-[0.875rem] text-[#444748]">Memuat formulir aktivasi...</p>}>
          <FormAktivasi />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f2efe9] border-t border-[#173F3A]/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] text-[#67645f]">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Gen Plasma" className="w-6 h-6 object-contain" />
            <span className="font-serif text-[1.25rem] text-[#173F3A] font-bold">Gen Plasma</span>
            <span className="text-[#B74E2C] font-semibold">• Alur Selaras</span>
            <span className="ml-2 text-[#444748]">• Aktivasi Mandiri Pengajar</span>
          </div>
          <p>© 2025 - 2026 Gen Plasma — Alur Selaras. Hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}
