import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { requester_email, email, starting_credits } = text ? JSON.parse(text) : {};
    if (requester_email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // Invite user via magic link
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Set starting credits if specified
    if (data?.user && starting_credits) {
      await supabase.from("user_credits").upsert({
        user_id: data.user.id,
        balance: starting_credits,
        last_free_topup: new Date().toISOString().split("T")[0],
      });
      await supabase.from("credit_transactions").insert({
        user_id: data.user.id,
        type: "admin_topup",
        amount: starting_credits,
        description: `Admin invited user with ${starting_credits} starting credits`,
      });
    }

    return NextResponse.json({ success: true, user: data?.user });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
