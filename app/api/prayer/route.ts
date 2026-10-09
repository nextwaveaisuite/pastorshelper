import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    const body = await req.text();
    const { topic, audience, type, language } = body ? JSON.parse(body) : {};
    if (!type) return NextResponse.json({ error: "Prayer type required" }, { status: 400 });

    const systemPrompt = `You are a ministry prayer writer for pastors. Output ONLY valid JSON. No markdown, no backticks. Start with { and end with }.`;

    const isWarfare = type === "Warfare";
    const topicStr = topic ? ` focused on: "${topic}"` : "";

    const userPrompt = isWarfare
      ? `Write a Spiritual Warfare Prayer guide for a pastor leading congregational warfare prayer${topicStr}.
Audience: ${audience || "General congregation"}
${language && language !== "English" ? `Write in ${language}.` : ""}

This is bold authoritative warfare prayer using Ephesians 6, Psalm 91, and warfare scriptures.

Return ONLY this JSON:
{
  "title": "Warfare prayer title",
  "type": "Warfare",
  "openingDeclaration": {
    "text": "Bold declaration of authority in Jesus name",
    "scripture": "Luke 10:19 — Behold, I give unto you power to tread on serpents and scorpions, and over all the power of the enemy: and nothing shall by any means hurt you"
  },
  "prayerSections": [
    {"heading": "Putting on the Armour of God", "prayer": "Church, we put on the full armour of God right now. We gird ourselves with truth, we take the breastplate of righteousness, the shield of faith, the helmet of salvation, and the sword of the Spirit which is the Word of God...", "scripture": "Ephesians 6:13 — Wherefore take unto you the whole armour of God, that ye may be able to withstand in the evil day, and having done all, to stand", "congregationalResponse": "I am covered! I am armoured! I stand in the power of His might!"},
    {"heading": "Breaking Fear and Torment", "prayer": "We come against every spirit of fear and torment right now in the name of Jesus. God has not given us a spirit of fear...", "scripture": "2 Timothy 1:7 — For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind", "congregationalResponse": "Fear has no hold on me! I have a sound mind in Jesus name!"},
    {"heading": "Binding the Enemy", "prayer": "In the name of Jesus Christ we bind every work of darkness over this congregation and our families...", "scripture": "Matthew 18:18 — Whatsoever ye shall bind on earth shall be bound in heaven: and whatsoever ye shall loose on earth shall be loosed in heaven", "congregationalResponse": "Satan, you are bound! We are loosed in Jesus name!"},
    {"heading": "Releasing the Fire of God", "prayer": "Holy Spirit we invite Your fire right now. Burn up every yoke, destroy every bondage. The anointing of God destroys every yoke...", "scripture": "Isaiah 10:27 — The yoke shall be destroyed because of the anointing", "congregationalResponse": "Every yoke is destroyed! The fire of God burns in me!"}
  ],
  "corporateDeclaration": {
    "instruction": "Lead the congregation to stand and declare this together boldly:",
    "declaration": "Satan, you have no authority here! The blood of Jesus covers this place! We are more than conquerors! Every chain is broken, every yoke destroyed, every stronghold falls NOW in the name of Jesus Christ!"
  },
  "closingBlessing": {
    "text": "Pastor releases this covering over the congregation",
    "scripture": "Psalm 91:1-2 — He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress: my God; in him will I trust"
  }
}`
      : `Write a General Prayer Ministry guide for a pastor leading congregational prayer${topicStr}.
Audience: ${audience || "General congregation"}
${language && language !== "English" ? `Write in ${language}.` : ""}

This is pastor-led congregational prayer covering healing, peace, restoration, provision and salvation.

Return ONLY this JSON:
{
  "title": "Prayer ministry title",
  "type": "General Prayer",
  "openingDeclaration": {
    "text": "Bold opening declaration welcoming God's presence",
    "scripture": "Matthew 18:20 — For where two or three are gathered together in my name, there am I in the midst of them"
  },
  "prayerSections": [
    {"heading": "Healing and Health", "prayer": "Father we lift every sick body in this room right now. Your Word declares by His stripes we are healed. We receive that healing by faith...", "scripture": "Isaiah 53:5 — But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed", "congregationalResponse": "By His stripes I am healed! I receive my healing now!"},
    {"heading": "Peace and Anxiety", "prayer": "Lord for every anxious heart and worried mind we cast those cares upon You right now. Your peace that passes all understanding stands guard over our hearts...", "scripture": "Philippians 4:6-7 — Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God", "congregationalResponse": "I receive Your peace! My mind is at rest in Jesus name!"},
    {"heading": "Provision and Breakthrough", "prayer": "Jehovah Jireh our Provider we lift every financial need and burden to You right now. Your Word promises You will supply all our needs...", "scripture": "Philippians 4:19 — But my God shall supply all your need according to his riches in glory by Christ Jesus", "congregationalResponse": "God is my provider! My needs are met in Jesus name!"},
    {"heading": "Salvation of Loved Ones", "prayer": "Lord we intercede for every unsaved loved one right now. You are not willing that any should perish. We claim our households for the Kingdom...", "scripture": "2 Peter 3:9 — The Lord is not slack concerning his promise; but is longsuffering to us-ward, not willing that any should perish, but that all should come to repentance", "congregationalResponse": "I claim my household for the Kingdom of God!"}
  ],
  "corporateDeclaration": {
    "instruction": "Lead the congregation to declare this together:",
    "declaration": "I am healed, I am at peace, I am provided for, I am loved by God! The Lord is my shepherd and I shall not want! Greater is He that is in me than he that is in the world! I receive everything God has for me today, in the name of Jesus!"
  },
  "closingBlessing": {
    "text": "Pastor closes the prayer time with this blessing over the congregation",
    "scripture": "Numbers 6:24-26 — The Lord bless thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee: The Lord lift up his countenance upon thee, and give thee peace"
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
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) return NextResponse.json({ error: "Prayer generation failed. Please try again." }, { status: 500 });

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1) return NextResponse.json({ error: "No prayer returned. Please try again." }, { status: 500 });

    let prayer: Record<string, unknown> | null = null;
    try {
      prayer = JSON.parse(end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start));
    } catch {
      prayer = buildFallback(type, topic);
    }

    if (!prayer) prayer = buildFallback(type, topic);

    // Log usage
    if (session?.id) {
      const { query } = await import("@/lib/db");
      await query("INSERT INTO sermon_usage (user_id, topic, level, language, tone, audience) VALUES ($1,$2,'prayer',$3,$4,$5)",
        [session.id, topic || type, language || "English", type, audience || ""]).catch(() => {});
    }

    return NextResponse.json({ prayer });

  } catch (e) { console.error(e); return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 }); }
}

function buildFallback(type: string, topic?: string): Record<string, unknown> {
  if (type === "Warfare") {
    return {
      title: `Warfare Prayer${topic ? ` — ${topic}` : ""}`, type: "Warfare",
      openingDeclaration: { text: "In the name of Jesus Christ we take our authority as believers and declare war on the works of darkness.", scripture: "Luke 10:19 — Behold, I give unto you power to tread on serpents and scorpions, and over all the power of the enemy" },
      prayerSections: [
        { heading: "Armour of God", prayer: "We put on the full armour of God right now — truth, righteousness, peace, faith, salvation, and the sword of the Spirit.", scripture: "Ephesians 6:13 — Wherefore take unto you the whole armour of God", congregationalResponse: "I am armoured and ready in Jesus name!" },
        { heading: "Breaking Fear", prayer: "We come against every spirit of fear right now. God has not given us a spirit of fear but of power and love and a sound mind.", scripture: "2 Timothy 1:7 — For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind", congregationalResponse: "Fear is broken off me! I have a sound mind!" },
        { heading: "Binding the Enemy", prayer: "We bind every work of darkness over this congregation. What we bind on earth is bound in heaven.", scripture: "Matthew 18:18 — Whatsoever ye shall bind on earth shall be bound in heaven", congregationalResponse: "The enemy is bound! We are loosed in Jesus name!" },
        { heading: "Holy Spirit Fire", prayer: "Holy Spirit release Your fire. Burn up every yoke. The anointing of God destroys every yoke and burden.", scripture: "Isaiah 10:27 — The yoke shall be destroyed because of the anointing", congregationalResponse: "Every yoke is destroyed by the fire of God!" },
      ],
      corporateDeclaration: { instruction: "Stand and declare together boldly:", declaration: "Satan you have no authority here! The blood of Jesus covers us! Every chain is broken, every yoke destroyed in the name of Jesus Christ!" },
      closingBlessing: { text: "Go in the victory of the Lord. You are covered and protected by the Most High God.", scripture: "Psalm 91:1 — He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty" },
    };
  }
  return {
    title: `General Prayer${topic ? ` — ${topic}` : ""}`, type: "General Prayer",
    openingDeclaration: { text: "Father we come into Your presence right now with open hearts. Where two or three gather in Your name You are here.", scripture: "Matthew 18:20 — For where two or three are gathered together in my name, there am I in the midst of them" },
    prayerSections: [
      { heading: "Healing", prayer: "Father we lift every sick body right now. By the stripes of Jesus we are healed. We receive that healing by faith.", scripture: "Isaiah 53:5 — And with his stripes we are healed", congregationalResponse: "By His stripes I am healed!" },
      { heading: "Peace", prayer: "Lord for every anxious heart we release worry to You right now. Your peace guards our hearts and minds.", scripture: "Philippians 4:6-7 — Be careful for nothing; but in every thing by prayer and supplication let your requests be made known unto God", congregationalResponse: "I receive Your peace in Jesus name!" },
      { heading: "Provision", prayer: "Jehovah Jireh we lift every need to You. You shall supply all our needs according to Your riches in glory.", scripture: "Philippians 4:19 — My God shall supply all your need according to his riches in glory by Christ Jesus", congregationalResponse: "My needs are met in Jesus name!" },
      { heading: "Salvation", prayer: "Lord we intercede for every unsaved loved one. You are not willing that any should perish.", scripture: "2 Peter 3:9 — Not willing that any should perish, but that all should come to repentance", congregationalResponse: "I claim my household for God's Kingdom!" },
    ],
    corporateDeclaration: { instruction: "Declare this together:", declaration: "I am healed, I am at peace, I am provided for! The Lord is my shepherd and I shall not want! In Jesus name!" },
    closingBlessing: { text: "Go in the peace of the Lord. You are blessed and covered.", scripture: "Numbers 6:24-26 — The Lord bless thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee" },
  };
}
