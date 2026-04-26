import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  const { requester_email } = await req.json();

  if (requester_email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all users with their profiles and sermon counts
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Get sermon counts per user
  const { data: sermonCounts } = await supabase
    .from("sermons")
    .select("user_id");

  const counts: Record<string, number> = {};
  (sermonCounts || []).forEach((s) => {
    counts[s.user_id] = (counts[s.user_id] || 0) + 1;
  });

  const users = (profiles || []).map((p) => ({
    ...p,
    sermon_count: counts[p.id] || 0,
  }));

  return NextResponse.json({ users });
}
