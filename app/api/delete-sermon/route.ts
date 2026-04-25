import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { id, user_id } = await req.json();

  if (!id || !user_id) {
    return NextResponse.json({ error: "ID and user_id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("sermons")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id); // ensures users can only delete their own

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
