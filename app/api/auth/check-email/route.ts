import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });
    const user = await queryOne("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    return NextResponse.json({ exists: !!user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ exists: false });
  }
}
