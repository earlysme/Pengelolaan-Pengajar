"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HalamanLogin() {
  const router = useRouter();
  const [role, setRole] = useState<"koordinator" | "tutor">("koordinator");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State Modal Lupa Password
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotIdentitas, setForgotIdentitas] = useState("");
  const [forgotChannel, setForgotChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotTutorData, setForgotTutorData] = useState<{
    tutorId?: string;
    nama?: string;
    targetWa?: string;
    targetEmail?: string;
    waUrl?: string;
    devOtp?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          role === "koordinator" ? { role, username, password } : { role, email, password }
        ),
      });
      const json = await res.json();

      if (json.success) {
        // Sesi disimpan server lewat cookie httpOnly; tidak ada data login di localStorage.
        router.push(role === "koordinator" ? "/koordinator" : "/tutor");
      } else {
        setError(json.error || "Login gagal. Periksa kembali email dan password Anda.");
      }
    } catch {
      setError("Terjadi kendala koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/lupa-password/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identitas: forgotIdentitas, channel: forgotChannel }),
      });
      const json = await res.json();
      if (json.success) {
        setForgotTutorData(json);
        setForgotStep("verify");
      } else {
        setForgotError(json.error || "Gagal memproses permintaan.");
      }
    } catch {
      setForgotError("Terjadi kendala koneksi.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (forgotNewPassword.length < 8) {
      setForgotError("Password baru minimal 8 karakter.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/lupa-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: forgotTutorData?.tutorId,
          otp: forgotOtp,
          password: forgotNewPassword,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setForgotSuccess("Password berhasil diubah! Silakan login dengan password baru Anda.");
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setForgotStep("request");
          setForgotIdentitas("");
          setForgotOtp("");
          setForgotNewPassword("");
          setForgotConfirmPassword("");
          setForgotTutorData(null);
          setForgotSuccess("");
        }, 2200);
      } else {
        setForgotError(json.error || "Gagal memperbarui password.");
      }
    } catch {
      setForgotError("Terjadi kendala koneksi.");
    } finally {
      setForgotLoading(false);
    }
  };

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
            href="/"
            className="text-[0.875rem] font-medium text-[#173F3A]/70 hover:text-[#173F3A] transition-colors flex items-center gap-1.5"
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
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F2D5A8]/60 text-[0.75rem] font-semibold text-[#173F3A] uppercase tracking-wider mb-3 border border-[#D88A32]/30">
              Portal Akses Internal
            </span>
            <h1 className="font-serif text-[2.25rem] text-[#173F3A] tracking-tight font-bold">
              Selamat Datang
            </h1>
            <p className="mt-2 text-[0.875rem] text-[#444748]">
              Pilih peran Anda untuk mengakses panel kerja dan sinkronisasi data operasional.
            </p>
          </div>

          <div className="bg-white border border-[#173F3A]/15 rounded-2xl p-7 shadow-[0_4px_20px_rgba(23,63,58,0.06)]">
            {/* Segmented Role Switcher */}
            <div className="flex bg-[#f2efe9] p-1 rounded-full mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole("koordinator");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-full text-[0.8125rem] font-semibold transition-all ${role === "koordinator"
                    ? "bg-[#173F3A] text-white shadow-sm"
                    : "text-[#444748] hover:text-[#173F3A]"
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
                className={`flex-1 py-2 rounded-full text-[0.8125rem] font-semibold transition-all ${role === "tutor"
                    ? "bg-[#173F3A] text-white shadow-sm"
                    : "text-[#444748] hover:text-[#173F3A]"
                  }`}
              >
                Tutor Pengajar
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[0.8125rem] flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5 text-rose-600">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {role === "koordinator" ? (
                <>
                  <div>
                    <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                      Username Koordinator
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl focus:outline-none focus:border-[#173F3A] focus:bg-white focus:ring-1 focus:ring-[#173F3A] transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[0.8125rem] font-medium text-[#172421]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          alert(
                            "Akun Koordinator dikelola oleh Administrator sistem. Silakan periksa berkas .env.local (ADMIN_USERNAME & ADMIN_PASSWORD) untuk mengatur ulang password koordinator."
                          );
                        }}
                        className="text-[0.75rem] font-semibold text-[#B74E2C] hover:underline transition-colors"
                      >
                        Lupa password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Password koordinator"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl focus:outline-none focus:border-[#173F3A] focus:bg-white focus:ring-1 focus:ring-[#173F3A] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67645f] hover:text-[#173F3A] p-1 transition-colors flex items-center justify-center"
                        title={showPassword ? "Sembunyikan password" : "Lihat password"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                      Alamat Email Tutor
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl focus:outline-none focus:border-[#173F3A] focus:bg-white focus:ring-1 focus:ring-[#173F3A] transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[0.8125rem] font-medium text-[#172421]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotIdentitas(email);
                          setForgotStep("request");
                          setForgotError("");
                          setForgotSuccess("");
                          setIsForgotModalOpen(true);
                        }}
                        className="text-[0.75rem] font-semibold text-[#B74E2C] hover:underline transition-colors"
                      >
                        Lupa password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="Password akun tutor"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl focus:outline-none focus:border-[#173F3A] focus:bg-white focus:ring-1 focus:ring-[#173F3A] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67645f] hover:text-[#173F3A] p-1 transition-colors flex items-center justify-center"
                        title={showPassword ? "Sembunyikan password" : "Lihat password"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    <p className="text-[0.72rem] text-[#67645f] mt-1.5">
                      Belum pernah membuat password? Hubungi koordinator untuk menerima link undangan aktivasi akun via WhatsApp.
                    </p>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 bg-[#173F3A] hover:bg-[#112F2B] text-white rounded-full text-[0.875rem] font-semibold transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2 mt-4 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
          </div>
        </div>
      </main>

      {/* Modal Lupa Password via OTP */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#173F3A]/20 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#173F3A]/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-[#F2D5A8] flex items-center justify-center text-[#173F3A]">
                  <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                </span>
                <div>
                  <h3 className="font-serif text-[1.25rem] font-bold text-[#173F3A]">
                    Lupa Password Tutor
                  </h3>
                  <p className="text-[0.75rem] text-[#67645f]">
                    Verifikasi OTP untuk mengatur ulang kata sandi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-[#444748]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {forgotError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[0.8125rem]">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[0.8125rem] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === "request" ? (
              <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                    Email atau Nomor WhatsApp Terdaftar
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: ferdian@gmail.com atau 08123456789"
                    value={forgotIdentitas}
                    onChange={(e) => setForgotIdentitas(e.target.value)}
                    className="w-full px-4 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl text-[#173F3A] focus:outline-none focus:border-[#173F3A] focus:bg-white focus:ring-1 focus:ring-[#173F3A]"
                  />
                  <p className="text-[0.72rem] text-[#67645f] mt-1.5">
                    Masukkan email atau nomor WhatsApp yang telah didaftarkan koordinator.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="block text-[0.75rem] font-semibold text-[#444748]">
                    Kirim Kode OTP Melalui:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer text-[0.8125rem] font-semibold transition-all ${forgotChannel === "whatsapp"
                          ? "border-[#173F3A] bg-[#173F3A]/5 text-[#173F3A]"
                          : "border-[#173F3A]/15 bg-white text-[#444748]"
                        }`}
                    >
                      <input
                        type="radio"
                        name="forgotChannel"
                        checked={forgotChannel === "whatsapp"}
                        onChange={() => setForgotChannel("whatsapp")}
                        className="sr-only"
                      />
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">chat</span>
                      <span>WhatsApp</span>
                    </label>

                    <label
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer text-[0.8125rem] font-semibold transition-all ${forgotChannel === "email"
                          ? "border-[#173F3A] bg-[#173F3A]/5 text-[#173F3A]"
                          : "border-[#173F3A]/15 bg-white text-[#444748]"
                        }`}
                    >
                      <input
                        type="radio"
                        name="forgotChannel"
                        checked={forgotChannel === "email"}
                        onChange={() => setForgotChannel("email")}
                        className="sr-only"
                      />
                      <span className="material-symbols-outlined text-[#B74E2C] text-[18px]">mail</span>
                      <span>Email</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 px-5 bg-[#173F3A] hover:bg-[#12312d] text-white rounded-full text-[0.875rem] font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Mencari Akun &amp; Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span>Kirim Kode OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[0.8125rem] text-amber-900 font-medium">
                    <span>
                      Halo <strong>{forgotTutorData?.nama}</strong>, OTP dikirim ke {forgotTutorData?.targetWa}
                    </span>
                    <button
                      type="button"
                      onClick={() => setForgotStep("request")}
                      className="text-[0.75rem] underline font-semibold text-[#173F3A]"
                    >
                      Ubah
                    </button>
                  </div>

                  {forgotTutorData?.waUrl && (
                    <div className="pt-1">
                      <a
                        href={forgotTutorData.waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[0.75rem] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">chat</span>
                        <span>Buka Chat WhatsApp untuk Salin OTP</span>
                      </a>
                    </div>
                  )}

                  {forgotTutorData?.devOtp && (
                    <div className="text-[0.75rem] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-mono">
                      Kode OTP (Dev / Demo): <strong>{forgotTutorData.devOtp}</strong> (10 menit)
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                    Masukkan 6 Digit Kode OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Contoh: 123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-2.5 text-[1.125rem] font-mono tracking-widest text-center bg-[#faf8f5] border-2 border-[#173F3A]/20 rounded-xl text-[#173F3A] focus:outline-none focus:border-[#173F3A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotNewPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="Minimal 8 karakter"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full pl-3.5 pr-11 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl focus:outline-none focus:border-[#173F3A] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67645f] hover:text-[#173F3A] p-1 flex items-center justify-center"
                      title={showForgotNewPassword ? "Sembunyikan password" : "Lihat password"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showForgotNewPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.8125rem] font-medium text-[#172421] mb-1.5">
                    Ulangi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="Masukkan ulang password baru Anda"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full pl-3.5 pr-11 py-2.5 text-[0.875rem] bg-[#faf8f5] border border-[#173F3A]/20 rounded-xl focus:outline-none focus:border-[#173F3A] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67645f] hover:text-[#173F3A] p-1 flex items-center justify-center"
                      title={showForgotConfirmPassword ? "Sembunyikan password" : "Lihat password"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showForgotConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false);
                      setForgotStep("request");
                    }}
                    className="px-4 py-2 rounded-full text-[0.8125rem] font-medium text-[#444748] hover:bg-neutral-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 bg-[#173F3A] hover:bg-[#12312d] text-white rounded-full text-[0.8125rem] font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    {forgotLoading ? "Menyimpan..." : "Reset Password & Simpan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-6 text-center text-[0.75rem] text-[#173F3A]/70 border-t border-[#173F3A]/10">
        © 2025 - 2026 Gen Plasma — Alur Selaras. Sistem Manajemen & Koordinasi Pengajar Bimbel.
      </footer>
    </div>
  );
}
