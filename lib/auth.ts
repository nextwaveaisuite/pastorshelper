import { NextRequest } from "next/server";
import { query, queryOne } from "./db";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET must be configured");
  return new TextEncoder().encode(secret);
}
const ADMIN_EMAIL = "chnomg@gmail.com";

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { id: string; email: string; isAdmin: boolean };
  } catch {
    return null;
  }
}

export async function getSession(req: NextRequest | Request) {
  const cookies = (req as NextRequest).cookies;
  const token = cookies?.get?.("ph-session")?.value ||
    (req.headers.get("cookie") || "").split(";").find(c => c.trim().startsWith("ph-session="))?.split("=")[1];
  if (!token) return null;
  return verifyToken(decodeURIComponent(token || ""));
}

export async function signUp(email: string, password: string) {
  const existing = await queryOne<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
  if (existing) throw new Error("EMAIL_EXISTS");
  const hash = await bcrypt.hash(password, 12);
  const rows = await query<Record<string, unknown>>(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
    [email, hash]
  );
  const user = rows[0];
  await query("INSERT INTO user_credits (user_id, balance, is_free_tier) VALUES ($1, 10, true) ON CONFLICT (user_id) DO NOTHING", [user.id]);
  await query("INSERT INTO credit_transactions (user_id, type, amount, description) VALUES ($1, 'free_topup', 10, 'Welcome credits')", [user.id]);
  return { id: user.id as string, email: user.email as string, isAdmin: email === ADMIN_EMAIL };
}

export async function signIn(email: string, password: string) {
  const user = await queryOne<Record<string, unknown>>("SELECT * FROM users WHERE email = $1", [email]);
  if (!user) throw new Error("NO_ACCOUNT");
  if (!user.password_hash) throw new Error("NO_PASSWORD");
  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid) throw new Error("WRONG_PASSWORD");
  return { id: user.id as string, email: user.email as string, isAdmin: email === ADMIN_EMAIL };
}
