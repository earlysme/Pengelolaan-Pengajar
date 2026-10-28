"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HalamanLogin() {
  const router = useRouter();
  const [role, setRole] = useState<"koordinator" | "tutor">("koordinator");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nomorWa, setNomorWa] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (role === "koordinator") {
        // Login Pengelola / Koordinator
        if (
          (username === "admin" || username === "koordinator") &&
          password === "admin123"
        ) {
          localStorage.setItem("userRole", "koordinator");
          localStorage.setItem("userName", "Koordinator Bimbel");
          router.push("/koordinator");
        } else {
          setError("Username atau password pengelola salah. (Default: admin / admin123)");
        }
      } else {
        // Login Tutor via Nomor WhatsApp
        if (!nomorWa.trim()) {
          setError("Masukkan nomor WhatsApp yang terdaftar.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/pengajar?search=${encodeURIComponent(nomorWa.trim())}`);
        const json = await res.json();

        if (json.success && json.data.length > 0) {
          const tutor = json.data[0];
          localStorage.setItem("userRole", "tutor");
          localStorage.setItem("tutorId", tutor._id);
          localStorage.setItem("userName", tutor.nama);
          router.push("/tutor");
        } else {
          setError("Nomor WhatsApp tidak ditemukan pada database pengajar.");
        }
      }
    } catch {
      setError("Terjadi kendala koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1c1b] flex flex-col justify-between selection:bg-[#e3e2e0] selection:text-[#1a1c1b]">
      {/* Top Navbar Header */}
      <header className="w-full bg-[#faf9f7]/80 backdrop-blur-md border-b border-[#e3e2e0]/60">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <span className="material-symbols-outlined text-black text-[22px]">flare</span>
            <span className="font-serif text-[1.4rem] tracking-tight text-[#1a1c1b] select-none">
              Lentera Belajar
            </span>
          </Link>
          <Link
            href="/"
            className="text-[0.875rem] font-medium text-[#444748] hover:text-black transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#efeeec] text-[0.75rem] font-semibold text-[#444748] uppercase tracking-wider mb-3">
              Portal Akses Internal
            </span>
            <h1 className="font-serif text-[2.25rem] text-[#1a1c1b] tracking-tight">
              Selamat Datang
            </h1>
            <p className="mt-2 text-[0.875rem] text-[#444748]">
              Pilih peran Anda untuk mengakses panel kerja dan sinkronisasi data operasional.
            </p>
          </div>

          <div className="bg-white border border-[#e3e2e0] rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            {/* Segmented Role Switcher */}
            <div className="flex bg-[#efeeec] p-1 rounded-full mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole("koordinator");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-full text-[0.8125rem] font-semibold transition-all ${
                  role === "koordinator"
                    ? "bg-black text-white shadow-sm"
                    : "text-[#444748] hover:text-[#1a1c1b]"
                }`}
              >
                Koordinator
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("tutor");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-full text-[0.8125rem] font-semibold transition-all ${
                  role === "tutor"
                    ? "bg-black text-white shadow-sm"
                    : "text-[#444748] hover:text-[#1a1c1b]"
                }`}
              >
                Tutor Pengajar
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50/80 border border-red-200 text-[#ba1a1a] rounded-xl text-[0.8125rem] flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {role === "koordinator" ? (
                <>
                  <div>
                    <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[0.875rem] bg-[#faf9f7] border border-[#e3e2e0] rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="admin123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-[0.875rem] bg-[#faf9f7] border border-[#e3e2e0] rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors"
                    />
                    <p className="text-[0.72rem] text-[#67645f] mt-1.5">
                      Kredensial bawaan: <strong className="text-black">admin</strong> / <strong className="text-black">admin123</strong>
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#1a1c1b] mb-1.5">
                    Nomor WhatsApp Terdaftar
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={nomorWa}
                    onChange={(e) => setNomorWa(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-[0.875rem] bg-[#faf9f7] border border-[#e3e2e0] rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors font-mono"
                  />
                  <p className="text-[0.72rem] text-[#67645f] mt-1.5">
                    Gunakan nomor WhatsApp yang telah diverifikasi oleh koordinator bimbel.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 bg-black hover:bg-neutral-800 text-white rounded-full text-[0.875rem] font-medium transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#efeeec] text-center">
              <Link
                href="/tutor"
                className="text-[0.8125rem] text-[#67645f] hover:text-black transition-colors"
              >
                Masuk langsung sebagai Demo Tutor →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-[0.75rem] text-[#67645f] border-t border-[#e3e2e0]/60">
        © 2025 - 2026 Lentera Belajar. Sistem Manajemen & Koordinasi Pengajar Bimbel.
      </footer>
    </div>
  );
}
