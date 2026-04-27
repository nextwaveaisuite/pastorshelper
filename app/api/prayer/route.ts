import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { topic, audience, type, language } = text ? JSON.parse(text) : {};
    const user_id_header = req.headers.get("x-user-id") || "";

    if (!type) return NextResponse.json({ error: "Prayer type required" }, { status: 400 });

    const targetLanguage = language || "English";

    const langInstruction = targetLanguage !== "English"
      ? `\nLANGUAGE: Write ALL content in ${targetLanguage}. Scripture references stay in standard format (e.g. John 3:16) but all other text must be in ${targetLanguage}.`
      : "";

    const typeInstructions: Record<string, string> = {
      "General Prayer": `GENERAL PRAYER MINISTRY
This is a congregational ministry prayer — not a sermon. This is what the pastor speaks and leads when they open the floor for prayer ministry. It covers a wide range of needs: healing, peace, restoration, provision, breakthrough, comfort, and salvation.

Structure this as a flowing pastoral prayer that the pastor speaks aloud while the congregation agrees. Include:
- An opening declaration of God's presence and power with scripture
- Prayer for the sick and physically broken (James 5:14-15, Isaiah 53:5)
- Prayer for the emotionally wounded and brokenhearted (Psalm 34:18, Isaiah 61:1)
- Prayer for financial breakthrough and provision (Philippians 4:19, Malachi 3:10)
- Prayer for family restoration and relationships (Joel 2:25)
- Prayer for peace and anxiety (Philippians 4:6-7, Isaiah 26:3)
- Prayer for salvation of loved ones (2 Peter 3:9, Romans 10:9)
- A congregational declaration — something the pastor leads the people to speak aloud together
- A closing blessing over the congregation with scripture`,

      "Warfare": `SPIRITUAL WARFARE PRAYER
This is a spiritual warfare ministry prayer — not a sermon. This is what the pastor speaks when leading the congregation in battle against spiritual attacks, demonic oppression, witchcraft, fear, sickness, and the works of darkness.

Structure this as bold, authoritative, scripture-based warfare prayer that the pastor leads with confidence. Include:
- An opening declaration of the authority of the Name of Jesus (Philippians 2:10, Luke 10:19)
- Putting on the full armour of God — lead the congregation through each piece (Ephesians 6:13-18)
- Breaking the power of fear, anxiety and torment (2 Timothy 1:7, 1 John 4:18)
- Binding and rebuking spirits of infirmity, sickness and disease (Matthew 18:18, Mark 16:17)
- Breaking generational curses and bloodline bondages (Galatians 3:13, Colossians 2:14-15)
- Releasing the fire of the Holy Spirit over the congregation (Acts 2:3, Luke 3:16)
- A corporate declaration — bold scripture-based declarations the pastor leads the people to speak aloud as weapons
- A closing prayer of protection and covering over the congregation and their families (Psalm 91)`,
    };

    const systemPrompt = `You are a ministry prayer writer for pastors. You output ONLY valid JSON. No markdown, no backticks, no explanation. Start with { and end with }. Every scripture reference must include the full verse text.`;

    const userPrompt = `Create a powerful ${type} ministry prayer${topic ? ` focused on: "${topic}"` : ""}.
Audience: ${audience || "General congregation"}${langInstruction}

${typeInstructions[type] || ""}

Return this complete JSON:

{
  "title": "Ministry prayer title",
  "type": "${type}",
  "openingDeclaration": {
    "text": "Bold opening declaration the pastor speaks",
    "scripture": "Scripture reference — full verse text"
  },
  "prayerSections": [
    {
      "heading": "Section heading (e.g. Healing, Peace, Provision)",
      "prayer": "The prayer text the pastor speaks aloud — rich, flowing, heartfelt",
      "scripture": "Scripture reference — full verse text",
      "congregationalResponse": "Optional — what the congregation speaks aloud in agreement (e.g. 'We receive it, in Jesus name!' or a declaration)"
    }
  ],
  "corporateDeclaration": {
    "instruction": "Instruction to the pastor (e.g. 'Lead the congregation to speak this aloud together:')",
    "declaration": "The bold declaration the congregation speaks together — scripture-based, powerful"
  },
  "closingBlessing": {
    "text": "Closing blessing the pastor speaks over the congregation",
    "scripture": "Scripture reference — full verse text"
  }
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1800,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let userError = "Prayer generation failed — please try again.";
      if (response.status === 429 || errText.includes("usage_exceeded")) userError = "API limit reached. Please wait a moment and try again.";
      return NextResponse.json({ error: userError }, { status: 500 });
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1) return NextResponse.json({ error: "No prayer content returned. Please try again." }, { status: 500 });

    let prayer: Record<string, unknown> | null = null;
    try {
      prayer = JSON.parse(end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start));
    } catch {
      return NextResponse.json({ error: "Prayer could not be read. Please try again." }, { status: 500 });
    }

    // Log usage
    if (user_id_header) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        await supabase.from("sermon_usage").insert({ user_id: user_id_header, topic: topic || type, level: "prayer", language: targetLanguage, tone: type, audience: audience || "" });
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ prayer });

  } catch (e) {
    console.error("Prayer route error:", e);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
