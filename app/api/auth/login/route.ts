import { NextResponse } from "next/server";
import { signIn, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    const user = await signIn(email.toLowerCase().trim(), password);
    const token = await signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });
    const res = NextResponse.json({ success: true, user });
    res.cookies.set("ph-session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "NO_ACCOUNT" || msg === "WRONG_PASSWORD" ? 401 : 500 });
  }
}
