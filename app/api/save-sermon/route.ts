import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role for server-side writes (bypasses RLS safely)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { user_id, title, topic, audience, tone, content, series_id } =
    await req.json();

  if (!user_id || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase.from("sermons").insert({
    user_id,
    title: title || "Untitled Sermon",
    topic: topic || "",
    audience: audience || "",
    tone: tone || "",
    content,
    series_id: series_id || null,
  }).select().single();

  if (error) {
    console.error("Save sermon error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, sermon: data });
}
