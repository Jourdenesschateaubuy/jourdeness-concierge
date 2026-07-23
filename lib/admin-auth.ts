import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "jourdeness_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function getPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function isAdminAuthConfigured() {
  return Boolean(getPassword());
}

export function verifyAdminPassword(password: string) {
  const configured = getPassword();
  if (!configured) return false;
  return safeEqual(password, configured);
}

export function createAdminSessionToken() {
  const secret = getPassword();
  if (!secret) throw new Error("ADMIN_PASSWORD 尚未設定。");

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `v1.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false;

  const secret = getPassword();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [version, expiresRaw, signature] = parts;
  if (version !== "v1") return false;

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt)) return false;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const payload = `${version}.${expiresRaw}`;
  return safeEqual(signature, sign(payload, secret));
}

export async function hasValidAdminSession() {
  if (!isAdminAuthConfigured()) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export const adminSessionMaxAge = SESSION_MAX_AGE_SECONDS;
