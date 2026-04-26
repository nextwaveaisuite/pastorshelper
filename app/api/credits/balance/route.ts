import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    if (!body) return NextResponse.json({ credits: { balance: 10, total_purchased: 0, total_used: 0, is_free_tier: true } });

    const { user_id } = JSON.parse(body);
    if (!user_id) return NextResponse.json({ credits: { balance: 10, total_purchased: 0, total_used: 0, is_free_tier: true } });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Hardcoded unlimited for owner
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("id", user_id)
      .single();

    if (profile?.email === "chnomg@gmail.com") {
      await supabase.from("user_credits").upsert({ user_id, unlimited: true, balance: 99999 });
      return NextResponse.json({ credits: { balance: 99999, total_purchased: 0, total_used: 0, is_free_tier: false, unlimited: true } });
    }

    // Get or create credit record
    let { data: credits, error } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error || !credits) {
      // Create new record with welcome credits
      const { data: newCredits } = await supabase
        .from("user_credits")
        .upsert({ user_id, balance: 10, last_free_topup: new Date().toISOString().split("T")[0], is_free_tier: true })
        .select()
        .single();
      credits = newCredits;

      if (credits) {
        await supabase.from("credit_transactions").insert({
          user_id,
          type: "free_topup",
          amount: 10,
          description: "Welcome credits — free tier",
        }).catch(() => {});
      }
    }

    if (!credits) {
      return NextResponse.json({ credits: { balance: 10, total_purchased: 0, total_used: 0, is_free_tier: true } });
    }

    // Check monthly free top-up
    const today = new Date();
    const lastTopup = credits.last_free_topup ? new Date(credits.last_free_topup) : null;
    const isNewMonth = !lastTopup ||
      today.getMonth() !== lastTopup.getMonth() ||
      today.getFullYear() !== lastTopup.getFullYear();

    if (isNewMonth && credits.is_free_tier) {
      await supabase
        .from("user_credits")
        .update({ balance: credits.balance + 10, last_free_topup: today.toISOString().split("T")[0] })
        .eq("user_id", user_id);

      await supabase.from("credit_transactions").insert({
        user_id,
        type: "free_topup",
        amount: 10,
        description: `Monthly free credits — ${today.toLocaleString("default", { month: "long", year: "numeric" })}`,
      }).catch(() => {});

      credits.balance += 10;
    }

    return NextResponse.json({ credits });

  } catch (err) {
    console.error("Credits balance error:", err);
    // Always return a valid response — never crash
    return NextResponse.json({ credits: { balance: 10, total_purchased: 0, total_used: 0, is_free_tier: true } });
  }
}
