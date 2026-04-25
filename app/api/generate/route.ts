import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone, level, language } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const levelInstructions: Record<string, string> = {
    beginner: "BEGINNER level — simple everyday language, clear basics, relatable examples, no jargon. Assume new believers.",
    intermediate: "INTERMEDIATE level — moderate theological depth, some Greek/Hebrew insights simplified, historical context, multiple scriptures. Assume growing believers.",
    advanced: "ADVANCED level — deep theology, Greek/Hebrew word meanings, extensive cross-references, prophetic depth, doctrinal nuance. Assume mature ministers.",
  };

  const targetLanguage = language || "English";
  const levelText = levelInstructions[level || "beginner"];

  const prompt = `You are a Spirit-led sermon builder. Create a sermon on "${topic}" for ${audience} audience in ${tone} style.

LEVEL: ${levelText}

LANGUAGE: Write the ENTIRE sermon content in ${targetLanguage}. Every word of the sermon — title, theme, opening, teaching points, ministry flow, altar call, closing prayer — must be in ${targetLanguage}. Only write in ${targetLanguage}.

IMPORTANT: Make this sermon completely UNIQUE with fresh revelation, original illustrations, and new angles. Never use generic content.

Return ONLY a JSON object. Start with { and end with }. No markdown. No backticks. Keep each field to 1-3 sentences.

{"title":"title in ${targetLanguage}","alternativeTitles":["alt1","alt2"],"anchorScripture":{"reference":"Book X:Y","kjv":"KJV verse in English","nkjv":"NKJV verse in English"},"theme":"theme in ${targetLanguage}","opening":{"greeting":"greeting in ${targetLanguage}","atmosphere":"1 sentence in ${targetLanguage}","hook":"hook in ${targetLanguage}"},"foundation":{"context":"context in ${targetLanguage}","breakdown":"breakdown in ${targetLanguage}"},"foreword":{"whyItMatters":"in ${targetLanguage}","relatable":"story in ${targetLanguage}"},"teachingPoints":[{"title":"point 1 in ${targetLanguage}","scripture":"ref and English text","explanation":"in ${targetLanguage}","application":"in ${targetLanguage}"},{"title":"point 2 in ${targetLanguage}","scripture":"ref and English text","explanation":"in ${targetLanguage}","application":"in ${targetLanguage}"},{"title":"point 3 in ${targetLanguage}","scripture":"ref and English text","explanation":"in ${targetLanguage}","application":"in ${targetLanguage}"}],"ministryFlow":{"giftOfKnowledge":"in ${targetLanguage}","impartation":"in ${targetLanguage}","edification":"in ${targetLanguage}","slowDown":"in ${targetLanguage}","returnToAnchor":"in ${targetLanguage}"},"summary":{"keyTakeaways":["in ${targetLanguage}","in ${targetLanguage}","in ${targetLanguage}"]},"altarCall":{"invitation":"in ${targetLanguage}","prayer":"in ${targetLanguage}"},"closingPrayer":"in ${targetLanguage}"}

Scripture references stay in their standard English format (e.g. John 3:16) but verse text can be in ${targetLanguage} if a translation exists. All sermon content must be in ${targetLanguage}.`;

  try {
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
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return NextResponse.json({ error: `API error ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";

    console.log("Response length:", rawText.length);
    console.log("Response start:", rawText.slice(0, 80));

    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error("No JSON found:", rawText.slice(0, 300));
      return NextResponse.json({ error: "No sermon data returned. Please try again." }, { status: 500 });
    }

    const jsonString = cleaned.slice(start, end + 1);

    let sermon;
    try {
      sermon = JSON.parse(jsonString);
    } catch (e) {
      console.error("Parse error:", jsonString.slice(0, 400));
      return NextResponse.json({ error: "Sermon generated but could not be read. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ sermon });

  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
