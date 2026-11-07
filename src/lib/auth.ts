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
  // Fallback aman agar Vercel/serverless tidak mengalami fatal crash jika env var belum diset
  return "genplasma-secure-secret-session-key-2025-auth-production";
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

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function setSessionCookie(data: Omit<SessionData, "exp">): Promise<string> {
  const token = createSessionToken(data);
  try {
    const store = await cookies();
    store.set(SESSION_COOKIE, token, getSessionCookieOptions());
  } catch {
    // Abaikan jika dipanggil di luar store
  }
  return token;
}

export async function clearSessionCookie() {
  try {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
  } catch {}
}

export async function getSession(request?: Request): Promise<SessionData | null> {
  // 1. Cek header Authorization (Bearer <token>) atau Cookie header jika request diberikan
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      const verified = verifySessionToken(token);
      if (verified) return verified;
    }

    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
      if (match && match[1]) {
        const verified = verifySessionToken(decodeURIComponent(match[1]));
        if (verified) return verified;
      }
    }
  }

  // 2. Cek cookie store Next.js
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    const verified = verifySessionToken(token);
    if (verified) return verified;
  } catch {}

  return null;
}

/** Untuk route handler yang hanya boleh diakses koordinator. */
export async function requireKoordinator(request?: Request): Promise<SessionData | null> {
  const session = await getSession(request);
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

export function generateAktivasiToken(): { token: string; tokenHash: string; hash: string } {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  return { token, tokenHash, hash: tokenHash };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const generateActivationToken = generateAktivasiToken;
export const hashActivationToken = hashToken;

/** Normalisasi nomor WA Indonesia ke format internasional tanpa "+" (untuk wa.me). */
export function nomorWaInternasional(nomor: string): string {
  const digit = nomor.replace(/\D/g, "");
  if (digit.startsWith("62")) return digit;
  if (digit.startsWith("0")) return "62" + digit.slice(1);
  return "62" + digit;
}

/* ----------------------------- Rate limit ----------------------------- */

interface RateEntry {
  count: number;
  blockedUntil: number;
}
const rateMap = new Map<string, RateEntry>();

const MAX_GAGAL = 5;
const BLOKIR_MS = 15 * 60 * 1000; // 15 menit

export function terlaluBanyakGagal(kunci: string): boolean {
  const e = rateMap.get(kunci);
  if (!e) return false;
  if (e.blockedUntil > Date.now()) return true;
  if (e.blockedUntil !== 0 && e.blockedUntil <= Date.now()) {
    rateMap.delete(kunci);
    return false;
  }
  return false;
}

export function catatGagal(kunci: string): void {
  const now = Date.now();
  const e = rateMap.get(kunci) || { count: 0, blockedUntil: 0 };
  e.count += 1;
  if (e.count >= MAX_GAGAL) {
    e.blockedUntil = now + BLOKIR_MS;
  }
  rateMap.set(kunci, e);
}

export function resetGagal(kunci: string): void {
  rateMap.delete(kunci);
}
