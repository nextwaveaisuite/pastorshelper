import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const prompt = `Create a sermon on "${topic}" for ${audience} audience in ${tone} style.

Return ONLY a JSON object. Start with { and end with }. No markdown. No backticks. Keep each field to 1-2 sentences maximum.

{"title":"short title","alternativeTitles":["alt1","alt2"],"anchorScripture":{"reference":"Book X:Y","kjv":"verse text","nkjv":"verse text"},"theme":"one sentence theme","opening":{"greeting":"1 sentence","atmosphere":"1 sentence","hook":"1 sentence"},"foundation":{"context":"1-2 sentences","breakdown":"1-2 sentences"},"foreword":{"whyItMatters":"1-2 sentences","relatable":"1-2 sentences"},"teachingPoints":[{"title":"point 1","scripture":"ref and text","explanation":"2 sentences","application":"1 sentence"},{"title":"point 2","scripture":"ref and text","explanation":"2 sentences","application":"1 sentence"},{"title":"point 3","scripture":"ref and text","explanation":"2 sentences","application":"1 sentence"}],"ministryFlow":{"giftOfKnowledge":"1 sentence","impartation":"1 sentence","edification":"1 sentence","slowDown":"1 sentence","returnToAnchor":"1 sentence"},"summary":{"keyTakeaways":["takeaway 1","takeaway 2","takeaway 3"]},"altarCall":{"invitation":"2 sentences","prayer":"2 sentences"},"closingPrayer":"1-2 sentences"}

Fill in all fields with real Spirit-led content about "${topic}". Keep responses SHORT.`;

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
        max_tokens: 1500,
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

    // Strip markdown fences
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
      console.error("Parse error. String:", jsonString.slice(0, 400));
      return NextResponse.json({ error: "Sermon generated but could not be read. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ sermon });

  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
