import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  const { requester_email, user_id } = await req.json();

  if (requester_email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete all their sermons first
  await supabase.from("sermons").delete().eq("user_id", user_id);
  await supabase.from("series").delete().eq("user_id", user_id);
  await supabase.from("user_profiles").delete().eq("id", user_id);

  // Delete from auth
  const { error } = await supabase.auth.admin.deleteUser(user_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
