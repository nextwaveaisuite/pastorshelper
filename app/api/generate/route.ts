import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export const maxDuration = 60;


import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    const body = await req.text();
    const { topic, audience, tone, level, language } = body ? JSON.parse(body) : {};
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const targetLanguage = language || "English";

    const levelInstructions: Record<string, string> = {
      beginner: `BEGINNER LEVEL — Certificate in Ministry. Simple language for new believers and emerging pastors. Every teaching point must include 2 scripture references with full verse text. Use KJV or NKJV. Define any theological words used. Foundation must explain WHO wrote the scripture, WHY, and WHAT it means today. Altar Call must include Romans 10:9 or John 3:16 with full verse text. Closing Prayer must be a simple scripture-woven blessing.`,
      intermediate: `INTERMEDIATE LEVEL — Diploma of Theology. Every teaching point must include 2-3 scriptures with verse text connecting OT to NT. Include at least one Greek or Hebrew word study. Foundation must provide historical, cultural and covenant context. Altar Call must include 2 scripture promises with verse text. Closing Prayer must weave 2 scripture references.`,
      advanced: `ADVANCED LEVEL — Bachelor of Theology. Every teaching point must include 3-4 scriptures with full verse text. Include Greek and Hebrew word studies in EVERY point. Foundation must be a full biblical-theological treatment — historical setting, literary genre, covenant context, authorship. Include typology — OT foreshadowing Christ. Altar Call must include 3 scripture promises. Closing Prayer must be a fully scripture-woven apostolic blessing with actual verse texts woven in.`,
    };

    const toneInstructions: Record<string, string> = {
      "Teaching": "TEACHING tone — systematic expository preaching. Break down scripture methodically. Build understanding and knowledge of God's Word.",
      "Evangelistic": "EVANGELISTIC tone — every point leads toward salvation. Speak to the lost and searching. Use scripture that calls people to repentance and faith in Christ.",
      "Pastoral": "PASTORAL tone — shepherding and nurturing the flock. Address real struggles with scriptural comfort and wisdom.",
    };

    const languageStyleMap: Record<string, string> = {
      "Pitjantjatjara": "Write in Pitjantjatjara language where possible, mixing with English for scripture references.",
      "Kriol": "Write in Kriol — the Northern Australian Aboriginal Creole.",
      "Aboriginal English": "Write in Aboriginal English — a distinct dialect with unique rhythm and cultural expression.",
      "Bislama": "Write in Bislama — the Creole language of Vanuatu.",
      "South Sea Islander": "Write in South Sea Islander English — warm, community-focused, deeply faith-rooted.",
      "Pacific Islander English": "Write in Pacific Islander English — warm storytelling style, communal values.",
    };

    const levelText = levelInstructions[level || "beginner"];
    const toneInstruction = toneInstructions[tone] || toneInstructions["Teaching"];
    const langInstruction = targetLanguage !== "English"
      ? (languageStyleMap[targetLanguage] ? `\nLANGUAGE: ${languageStyleMap[targetLanguage]}` : `\nLANGUAGE: Write ALL sermon content in ${targetLanguage}.`)
      : "";

    const systemPrompt = `You are a Scripture-rich sermon builder. Output ONLY valid JSON. No markdown, no backticks, no explanation. Start with { and end with }.`;

    const userPrompt = `Write sermon JSON on: "${topic}" | Audience: ${audience} | Tone: ${tone}
${levelText}
${toneInstruction}${langInstruction}

CRITICAL: Output ONLY valid JSON. No markdown. No backticks. No extra text. Start with { end with }.
Keep ALL text fields brief (1-2 sentences). Include full verse text in scripture fields.

{"title":"","theme":"","anchorScripture":{"reference":"","kjv":"","nkjv":""},"opening":{"greeting":"","hook":""},"foundation":{"context":"","breakdown":""},"foreword":{"whyItMatters":"","relatable":""},"teachingPoints":[{"title":"","scripture":"Ref — verse","supportingScriptures":["Ref — verse"],"explanation":"","application":""},{"title":"","scripture":"Ref — verse","supportingScriptures":["Ref — verse"],"explanation":"","application":""},{"title":"","scripture":"Ref — verse","supportingScriptures":["Ref — verse"],"explanation":"","application":""}],"ministryFlow":{"giftOfKnowledge":"","impartation":"","edification":"","slowDown":"","returnToAnchor":""},"summary":{"keyTakeaways":["","",""]},"altarCall":{"invitation":"","prayer":""},"closingPrayer":"","alternativeTitles":["",""]}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let userError = "Generation failed — please try again.";
      if (response.status === 429 || errText.includes("usage_exceeded")) userError = "API limit reached. Please wait a moment.";
      return NextResponse.json({ error: userError }, { status: 500 });
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const start = cleaned.indexOf("{");
    if (start === -1) return NextResponse.json({ error: "No response from server. Please try again." }, { status: 500 });

    let sermon: Record<string, unknown> | null = null;

    // Try 1: parse from first { to last }
    const end = cleaned.lastIndexOf("}");
    if (end > start) {
      try { sermon = JSON.parse(cleaned.slice(start, end + 1)); } catch { /* continue */ }
    }

    // Try 2: repair and parse from first {
    if (!sermon) {
      try { sermon = JSON.parse(repairJson(cleaned.slice(start))); } catch { /* continue */ }
    }

    // Try 3: extract any valid partial JSON object
    if (!sermon) {
      const partial = extractPartialJson(cleaned.slice(start));
      if (partial) sermon = partial;
    }

    // Try 4: build minimal sermon from what we can extract
    if (!sermon) {
      sermon = extractFieldsManually(cleaned, topic);
    }

    if (!sermon) return NextResponse.json({ error: "Could not build sermon. Please try again." }, { status: 500 });

    // Ensure all fields with fallbacks
    sermon.title = (sermon.title as string) || topic;
    sermon.alternativeTitles = (sermon.alternativeTitles as string[]) || [];
    sermon.theme = (sermon.theme as string) || `A message on ${topic}`;

    const anch = (sermon.anchorScripture as Record<string, string>) || {};
    sermon.anchorScripture = {
      reference: anch.reference || "John 3:16",
      kjv: anch.kjv || "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      nkjv: anch.nkjv || "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.",
    };

    const rawPoints = (sermon.teachingPoints as Record<string, unknown>[]) || [];
    if (rawPoints.length < 3) {
      sermon.teachingPoints = [
        { title: `The Foundation of ${topic}`, scripture: "John 15:5 — I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.", supportingScriptures: ["Romans 8:28 — And we know that all things work together for good to them that love God.", "Philippians 4:13 — I can do all things through Christ which strengtheneth me."], explanation: `Scripture teaches us that ${topic} begins with our connection to Christ.`, application: "Apply this truth daily. Return to the Word, return to prayer." },
        { title: `The Promise of ${topic}`, scripture: "Jeremiah 29:11 — For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.", supportingScriptures: ["Isaiah 41:10 — Fear thou not; for I am with thee.", "Philippians 4:19 — My God shall supply all your need according to his riches in glory by Christ Jesus."], explanation: `God's promise regarding ${topic} is clear — He is for you.`, application: "Stand on the promise. Speak the Word over your situation." },
        { title: `Walking in ${topic}`, scripture: "Joshua 1:8 — This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night.", supportingScriptures: ["Proverbs 3:5-6 — Trust in the Lord with all thine heart; and lean not unto thine own understanding.", "2 Timothy 3:16-17 — All scripture is given by inspiration of God."], explanation: `Living out ${topic} requires consistent meditation on the Word.`, application: "Make the Word your daily foundation." },
      ];
    }

    const mf = (sermon.ministryFlow as Record<string, string>) || {};
    sermon.ministryFlow = {
      giftOfKnowledge: mf.giftOfKnowledge || `The Lord has a word for someone here regarding ${topic}. His plans for you are good. (Jeremiah 29:11)`,
      impartation: mf.impartation || `Receive this word into your spirit. As Isaiah 40:31 declares — they that wait upon the Lord shall renew their strength.`,
      edification: mf.edification || `You are fearfully and wonderfully made. (Psalm 139:14) God is not finished with you.`,
      slowDown: mf.slowDown || `"Be still, and know that I am God." (Psalm 46:10) Let that settle in your spirit.`,
      returnToAnchor: mf.returnToAnchor || `We return to where we began — the Word of God. Everything spoken today comes back to this anchor scripture.`,
    };

    const sum = (sermon.summary as Record<string, unknown>) || {};
    sermon.summary = {
      keyTakeaways: (sum.keyTakeaways as string[])?.length >= 3 ? sum.keyTakeaways : [
        `God's Word on ${topic} is alive and active. (Hebrews 4:12)`,
        `What you received today is meant to be lived. "But be ye doers of the word." (James 1:22)`,
        `Go forward in faith — "God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." (2 Timothy 1:7)`,
      ],
    };

    const ac = (sermon.altarCall as Record<string, string>) || {};
    sermon.altarCall = {
      invitation: ac.invitation || `"That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved." (Romans 10:9) Come to Him right now.`,
      prayer: ac.prayer || `Lord Jesus, I come to You just as I am. I believe You died for me and rose again. I receive You as my Lord and Saviour. Forgive me and fill me with Your Holy Spirit. Amen.`,
    };

    sermon.closingPrayer = (sermon.closingPrayer as string) || `"The Lord bless thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee: The Lord lift up his countenance upon thee, and give thee peace." (Numbers 6:24-26) Go in the power of His Word. Amen.`;

    // Log usage
    if (session?.id) {
      await query(
        "INSERT INTO sermon_usage (user_id, topic, level, language, tone, audience) VALUES ($1,$2,$3,$4,$5,$6)",
        [session.id, topic, level || "beginner", targetLanguage, tone, audience]
      ).catch(() => {});
    }

    return NextResponse.json({ sermon });

  } catch (err) {
    console.error("Generate route error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

function repairJson(str: string): string {
  // Remove trailing comma before closing
  let result = str.replace(/,\s*([}\]])/g, "$1").replace(/,\s*$/, "");
  let braces = 0, brackets = 0, inString = false, escape = false;
  for (const ch of result) {
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") braces++; if (ch === "}") braces--;
    if (ch === "[") brackets++; if (ch === "]") brackets--;
  }
  if (inString) result += '"';
  for (let i = 0; i < brackets; i++) result += "]";
  for (let i = 0; i < braces; i++) result += "}";
  return result;
}

function extractPartialJson(str: string): Record<string, unknown> | null {
  // Try progressively shorter slices to find valid JSON
  for (let i = str.length; i > str.length * 0.3; i--) {
    const slice = str.slice(0, i);
    const lastClose = slice.lastIndexOf("}");
    if (lastClose === -1) continue;
    try {
      const candidate = repairJson(slice.slice(0, lastClose + 1));
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed;
    } catch { /* continue */ }
  }
  return null;
}

function extractFieldsManually(str: string, topic: string): Record<string, unknown> {
  const get = (key: string) => {
    const m = str.match(new RegExp(`"${key}"\s*:\s*"([^"]*?)"`));
    return m?.[1] || "";
  };
  return {
    title: get("title") || `A Message on ${topic}`,
    theme: get("theme") || `The power of ${topic}`,
    anchorScripture: { reference: "John 3:16", kjv: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", nkjv: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life." },
    opening: { greeting: `Welcome, beloved. Today we explore ${topic}.`, hook: "God has a word for you today." },
    foundation: { context: "This scripture was written to reveal God's heart to His people.", breakdown: "Every word points us to the faithfulness of God." },
    foreword: { whyItMatters: `${topic} is relevant to every believer today.`, relatable: "We all face moments where we need to hear from God." },
    teachingPoints: [],
    ministryFlow: { giftOfKnowledge: "God has a specific word for someone here today.", impartation: "Receive what God is releasing in this moment.", edification: "You are loved and valued by God.", slowDown: "Be still and know that He is God. (Psalm 46:10)", returnToAnchor: "We return to our anchor scripture — the foundation of today's message." },
    summary: { keyTakeaways: [`${topic} is grounded in God's Word.`, "Faith is the key to walking in God's promises.", "You are called to live out what you have heard today."] },
    altarCall: { invitation: "If you would like to receive Jesus today, come to Him right now.", prayer: "Lord Jesus, I believe You died for me and rose again. I receive You as my Lord and Saviour. Amen." },
    closingPrayer: "May the Lord bless you and keep you. May His face shine upon you and give you peace. (Numbers 6:24-26) Amen.",
    alternativeTitles: [],
  };
}
