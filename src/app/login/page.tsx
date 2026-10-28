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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white inline-flex items-center justify-center font-bold text-base shadow-xs mb-3">
              L
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Masuk ke Lentera Belajar
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Pilih jenis akun untuk mengelola atau memperbarui data
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-6 px-5 sm:px-8 shadow-xs border border-slate-200 rounded-2xl">
          {/* Tab Pilihan Peran */}
          <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 mb-5">
            <button
              type="button"
              onClick={() => {
                setRole("koordinator");
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                role === "koordinator"
                  ? "bg-white text-teal-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pengelola / Koordinator
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("tutor");
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                role === "tutor"
                  ? "bg-white text-teal-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tutor Pengajar
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === "koordinator" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="admin123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Akun bawaan: username <strong>admin</strong>, password <strong>admin123</strong>
                  </p>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Terdaftar
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={nomorWa}
                  onChange={(e) => setNomorWa(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50 focus:bg-white font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Masukkan nomor WhatsApp yang sudah didaftarkan oleh koordinator
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-teal-700 transition-colors"
            >
              Kembali ke Katalog Publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

