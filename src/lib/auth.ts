import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Helper autentikasi (tanpa dependensi tambahan, hanya Node crypto).
 * - Password di-hash dengan scrypt + salt acak.
 * - Sesi = cookie httpOnly yang ditandatangani HMAC (tidak bisa dipalsukan dari browser).
 * - Token aktivasi akun = string acak sekali pakai; yang disimpan di DB hanya hash-nya.
 */

export const SESSION_COOKIE = "lb_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari (detik)
export const AKTIVASI_BERLAKU_MS = 1000 * 60 * 60 * 72; // 72 jam

export type SessionRole = "tutor" | "koordinator";
export interface SessionData {
  role: SessionRole;
  /** _id pengajar (hanya untuk role tutor) */
  sub?: string;
  nama: string;
  exp: number; // epoch detik
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET wajib diisi (min. 16 karakter) di environment production.");
  }
  // Fallback khusus development agar `npm run dev` langsung jalan.
  return "dev-only-secret-ganti-di-env-local";
}

const b64url = (buf: Buffer) => buf.toString("base64url");

function sign(payload: string): string {
  return b64url(crypto.createHmac("sha256", getSecret()).update(payload).digest());
}

export function createSessionToken(data: Omit<SessionData, "exp">): string {
  const full: SessionData = { ...data, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const payload = b64url(Buffer.from(JSON.stringify(full)));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): SessionData | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionData;
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function setSessionCookie(data: Omit<SessionData, "exp">) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(data), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Untuk route handler yang hanya boleh diakses koordinator. */
export async function requireKoordinator(): Promise<SessionData | null> {
  const session = await getSession();
  return session?.role === "koordinator" ? session : null;
}

/* ------------------------------ Password ------------------------------ */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | undefined | null): boolean {
  // Selalu lakukan satu kali scrypt agar waktu respons tidak membocorkan "email ada/tidak".
  const [scheme, saltHex, hashHex] = (stored || "scrypt$00$00").split("$");
  const salt = Buffer.from(saltHex || "00", "hex");
  const expected = Buffer.from(hashHex || "00", "hex");
  const actual = crypto.scryptSync(password, salt, expected.length || 64);
  return !!stored && scheme === "scrypt" && actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function validatePasswordBaru(password: string): string | null {
  if (password.length < 8) return "Password minimal 8 karakter.";
  if (password.length > 128) return "Password maksimal 128 karakter.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password harus mengandung huruf dan angka.";
  }
  return null;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* --------------------------- Token aktivasi --------------------------- */

export function generateAktivasiToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/* ------------------- Pembatas percobaan login (sederhana) ------------------- */
// Disimpan di memori proses: cukup untuk 1 server / dev. Di serverless (Vercel)
// tiap instance punya memori sendiri, jadi ini bukan perlindungan penuh.

const gagal = new Map<string, { n: number; reset: number }>();
const BATAS = 5;
const JENDELA_MS = 15 * 60 * 1000;

export function terlaluBanyakGagal(kunci: string): boolean {
  const rec = gagal.get(kunci);
  if (!rec) return false;
  if (rec.reset < Date.now()) {
    gagal.delete(kunci);
    return false;
  }
  return rec.n >= BATAS;
}

export function catatGagal(kunci: string) {
  const rec = gagal.get(kunci);
  if (!rec || rec.reset < Date.now()) gagal.set(kunci, { n: 1, reset: Date.now() + JENDELA_MS });
  else rec.n += 1;
}

export function resetGagal(kunci: string) {
  gagal.delete(kunci);
}

/** Normalisasi nomor WA Indonesia ke format internasional tanpa "+" (untuk wa.me). */
export function nomorWaInternasional(nomor: string): string {
  const digit = nomor.replace(/\D/g, "");
  if (digit.startsWith("62")) return digit;
  if (digit.startsWith("0")) return "62" + digit.slice(1);
  return "62" + digit;
}
