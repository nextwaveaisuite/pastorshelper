import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/resend";

export async function POST(req: Request) {
  const { email, type } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    if (type === "welcome") {
      await sendWelcomeEmail(email);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    // Non-fatal — don't fail the auth flow
    return NextResponse.json({ success: false });
  }
}
