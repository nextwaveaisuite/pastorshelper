import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone, level } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const levelInstructions: Record<string, string> = {
    beginner: `This sermon is for a BEGINNER level congregation or new pastor. Use simple, everyday language. Avoid complex theological terms. Focus on one clear idea per point. Use relatable real-life examples. Keep explanations short and encouraging. Assume the audience is new to the Bible.`,
    intermediate: `This sermon is for an INTERMEDIATE level congregation. Use moderate theological depth. Include some original language insights (Greek/Hebrew simplified). Reference multiple scriptures. Explore the historical context. Challenge the audience to grow deeper in their walk. Assume the audience has some Bible knowledge.`,
    advanced: `This sermon is for an ADVANCED level congregation or experienced minister. Use deep theological language freely. Dive into Greek/Hebrew word meanings. Cross-reference extensively across Old and New Testament. Include prophetic depth, doctrinal nuance, and challenging applications. Assume the audience is mature in faith and scripture.`,
  };

  const levelText = levelInstructions[level || "beginner"];

  const prompt = `You are a Spirit-led sermon builder. Create a sermon on "${topic}" for ${audience} audience in ${tone} style.

${levelText}

IMPORTANT: Make this sermon completely UNIQUE with fresh revelation, original illustrations, and new angles on this topic. Never repeat generic content.

Return ONLY a JSON object. Start with { and end with }. No markdown. No backticks. Keep each field to 1-3 sentences.

{"title":"unique compelling title","alternativeTitles":["alt1","alt2"],"anchorScripture":{"reference":"Book X:Y","kjv":"verse text","nkjv":"verse text"},"theme":"one fresh unique sentence theme","opening":{"greeting":"1-2 sentences","atmosphere":"1 sentence","hook":"1-2 sentences compelling hook"},"foundation":{"context":"1-2 sentences context","breakdown":"1-2 sentences breakdown"},"foreword":{"whyItMatters":"1-2 sentences","relatable":"1-2 sentences story or illustration"},"teachingPoints":[{"title":"point 1 title","scripture":"ref and text","explanation":"2-3 sentences","application":"1-2 sentences"},{"title":"point 2 title","scripture":"ref and text","explanation":"2-3 sentences","application":"1-2 sentences"},{"title":"point 3 title","scripture":"ref and text","explanation":"2-3 sentences","application":"1-2 sentences"}],"ministryFlow":{"giftOfKnowledge":"1-2 sentences prophetic","impartation":"1-2 sentences activation","edification":"1-2 sentences encouragement","slowDown":"1-2 sentences reflective","returnToAnchor":"1-2 sentences full circle"},"summary":{"keyTakeaways":["takeaway 1","takeaway 2","takeaway 3"]},"altarCall":{"invitation":"2-3 sentences heartfelt","prayer":"2-3 sentences guided prayer"},"closingPrayer":"2 sentences blessing"}

Fill with REAL Spirit-led content about "${topic}". Be specific, not generic. Level: ${level || "beginner"}.`;

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
