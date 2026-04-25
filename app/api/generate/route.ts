import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const systemPrompt = `You are a Spirit-led sermon builder assistant for The Pastors Helper. You create structured, Scripture-rich sermon content for pastors and ministers. Always respond with valid JSON only, no markdown, no extra text.`;

  const prompt = `Create a complete, structured sermon on the topic/scripture: "${topic}"
Audience: ${audience}
Tone: ${tone}

Return ONLY a valid JSON object with this exact structure:

{
  "title": "Powerful sermon title",
  "alternativeTitles": ["Alternative title 1", "Alternative title 2"],
  "anchorScripture": {
    "reference": "Book Chapter:Verse",
    "kjv": "Full KJV text of the verse",
    "nkjv": "Full NKJV text of the verse"
  },
  "theme": "One sentence core revelation/theme",
  "opening": {
    "greeting": "Warm, engaging greeting to the congregation",
    "atmosphere": "Set the atmosphere and context",
    "hook": "Relatable opening hook or story"
  },
  "foundation": {
    "context": "Historical and cultural context of the scripture",
    "breakdown": "Spiritual breakdown and initial revelation of the anchor scripture"
  },
  "foreword": {
    "whyItMatters": "Why this message is vital for today",
    "relatable": "A relatable story, illustration, or connection to daily life"
  },
  "teachingPoints": [
    {
      "title": "Point title",
      "scripture": "Supporting scripture reference and text",
      "explanation": "Deep explanation of this point",
      "application": "Practical application for the congregation"
    },
    {
      "title": "Point title",
      "scripture": "Supporting scripture reference and text",
      "explanation": "Deep explanation of this point",
      "application": "Practical application for the congregation"
    },
    {
      "title": "Point title",
      "scripture": "Supporting scripture reference and text",
      "explanation": "Deep explanation of this point",
      "application": "Practical application for the congregation"
    }
  ],
  "ministryFlow": {
    "giftOfKnowledge": "A word of knowledge or prophetic insight for the congregation",
    "impartation": "Activation language — words to impart faith, healing, or breakthrough",
    "edification": "Encouraging words to build up the congregation's faith",
    "slowDown": "A slow-down moment — reflective pause for spiritual engagement",
    "returnToAnchor": "Bring the message full circle back to the anchor scripture with fresh revelation"
  },
  "summary": {
    "keyTakeaways": [
      "Key takeaway 1",
      "Key takeaway 2",
      "Key takeaway 3"
    ]
  },
  "altarCall": {
    "invitation": "Heartfelt invitation for response — salvation, rededication, or specific response",
    "prayer": "Full guided prayer for the congregation to pray aloud"
  },
  "closingPrayer": "A rich blessing and send-off prayer over the congregation"
}

Make it authentic, Spirit-led, and powerful. Use real scripture references. Tailor tone and language for: ${audience} in a ${tone} style.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI generation failed. Check your API key." }, { status: 500 });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || "";

    // Strip any markdown code fences if present
    const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let sermon;
    try {
      sermon = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error:", cleaned.slice(0, 200));
      return NextResponse.json({ error: "Failed to parse sermon structure. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ sermon });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
