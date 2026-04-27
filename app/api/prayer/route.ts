import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { topic, audience, type, language } = text ? JSON.parse(text) : {};
    const user_id_header = req.headers.get("x-user-id") || "";

    if (!type) return NextResponse.json({ error: "Prayer type required" }, { status: 400 });

    const targetLanguage = language || "English";
    const langInstruction = targetLanguage !== "English"
      ? `Write ALL content in ${targetLanguage}. Scripture references stay in standard format (e.g. John 3:16).`
      : "";

    const systemPrompt = `You are a ministry prayer writer for pastors. Output ONLY valid JSON. No markdown, no backticks, no explanation before or after. The response must start with { and end with }.`;

    const generalPrayerPrompt = `Write a General Prayer Ministry guide for a pastor leading congregational prayer${topic ? ` on the theme of: "${topic}"` : ""}.
Audience: ${audience || "General congregation"}
${langInstruction}

This is a pastor-led prayer covering healing, peace, restoration, provision, breakthrough and salvation.

Return ONLY this JSON:
{
  "title": "Prayer ministry title",
  "type": "General Prayer",
  "openingDeclaration": {
    "text": "Bold opening declaration the pastor speaks aloud to open the prayer time",
    "scripture": "Matthew 18:20 — For where two or three are gathered together in my name, there am I in the midst of them"
  },
  "prayerSections": [
    {
      "heading": "Healing and Health",
      "prayer": "Father, we come before You right now for every person in this room who is sick in body or mind. Your Word declares in Isaiah 53:5 that by His stripes we are healed. We stand on that promise right now...",
      "scripture": "Isaiah 53:5 — But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed",
      "congregationalResponse": "By His stripes, I am healed! In Jesus name, Amen!"
    },
    {
      "heading": "Peace and Anxiety",
      "prayer": "Lord, for every person carrying worry, fear and anxiety — we release them to You right now. Philippians 4:6-7 tells us to be careful for nothing, but in everything by prayer and supplication...",
      "scripture": "Philippians 4:6-7 — Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God",
      "congregationalResponse": "I receive Your peace that passes all understanding!"
    },
    {
      "heading": "Provision and Breakthrough",
      "prayer": "Jehovah Jireh, our Provider — we lift up every financial need, every burden of debt, every lack in this room to You. Your Word says in Philippians 4:19...",
      "scripture": "Philippians 4:19 — But my God shall supply all your need according to his riches in glory by Christ Jesus",
      "congregationalResponse": "God is my provider! My needs are met in Jesus name!"
    },
    {
      "heading": "Salvation of Loved Ones",
      "prayer": "Lord, we intercede right now for every unsaved family member, every prodigal son and daughter. Your Word says in 2 Peter 3:9 that You are not willing that any should perish...",
      "scripture": "2 Peter 3:9 — The Lord is not slack concerning his promise, as some men count slackness; but is longsuffering to us-ward, not willing that any should perish, but that all should come to repentance",
      "congregationalResponse": "I claim my household for the Kingdom of God!"
    }
  ],
  "corporateDeclaration": {
    "instruction": "Lead the congregation to stand and speak this declaration aloud together:",
    "declaration": "I am healed, I am delivered, I am provided for, I am at peace! The Lord is my shepherd and I shall not want! Greater is He that is in me than he that is in the world! I receive everything God has for me today, in the name of Jesus!"
  },
  "closingBlessing": {
    "text": "Pastor closes the prayer time with this blessing over the congregation",
    "scripture": "Numbers 6:24-26 — The Lord bless thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee: The Lord lift up his countenance upon thee, and give thee peace"
  }
}`;

    const warfarePrayerPrompt = `Write a Spiritual Warfare Prayer guide for a pastor leading the congregation in warfare prayer${topic ? ` on the theme of: "${topic}"` : ""}.
Audience: ${audience || "General congregation"}
${langInstruction}

This is bold authoritative warfare prayer using Ephesians 6, Psalm 91, and warfare scriptures.

Return ONLY this JSON:
{
  "title": "Warfare prayer title",
  "type": "Warfare",
  "openingDeclaration": {
    "text": "Bold declaration of authority in the name of Jesus to open the warfare prayer",
    "scripture": "Luke 10:19 — Behold, I give unto you power to tread on serpents and scorpions, and over all the power of the enemy: and nothing shall by any means hurt you"
  },
  "prayerSections": [
    {
      "heading": "Putting on the Armour of God",
      "prayer": "Church, we are not wrestling against flesh and blood. Ephesians 6:12 says our battle is against principalities, against powers, against the rulers of the darkness of this world. So right now, by faith, we put on the full armour of God...",
      "scripture": "Ephesians 6:13-14 — Wherefore take unto you the whole armour of God, that ye may be able to withstand in the evil day, and having done all, to stand. Stand therefore, having your loins girt about with truth",
      "congregationalResponse": "I am covered! I am armoured! I stand in the power of His might!"
    },
    {
      "heading": "Breaking Fear and Torment",
      "prayer": "We come against every spirit of fear, anxiety and torment in the name of Jesus. God's Word declares in 2 Timothy 1:7 that God has not given us a spirit of fear, but of power and of love and of a sound mind...",
      "scripture": "2 Timothy 1:7 — For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind",
      "congregationalResponse": "Fear has no hold on me! I have a sound mind in Jesus name!"
    },
    {
      "heading": "Binding the Works of Darkness",
      "prayer": "In the name of Jesus Christ of Nazareth, we bind every work of the enemy over this congregation, over our families, over our homes. Matthew 18:18 declares: whatsoever ye shall bind on earth shall be bound in heaven...",
      "scripture": "Matthew 18:18 — Verily I say unto you, Whatsoever ye shall bind on earth shall be bound in heaven: and whatsoever ye shall loose on earth shall be loosed in heaven",
      "congregationalResponse": "Satan, you are bound! We are loosed in Jesus name!"
    },
    {
      "heading": "Releasing the Fire of God",
      "prayer": "Holy Spirit, we invite Your fire right now. Burn up every yoke, consume every chain, destroy every bondage. Isaiah 10:27 says the yoke shall be destroyed because of the anointing...",
      "scripture": "Isaiah 10:27 — And it shall come to pass in that day, that his burden shall be taken away from off thy shoulder, and his yoke from off thy neck, and the yoke shall be destroyed because of the anointing",
      "congregationalResponse": "The fire of God burns in me! Every yoke is destroyed!"
    }
  ],
  "corporateDeclaration": {
    "instruction": "Lead the congregation to stand, raise their hands, and declare this together with boldness:",
    "declaration": "Satan, we declare that you have no authority here! The blood of Jesus covers this place! Greater is He that is in us than he that is in the world! We are more than conquerors through Christ! Every chain is broken, every yoke is destroyed, every stronghold falls NOW in the name of Jesus Christ!"
  },
  "closingBlessing": {
    "text": "Pastor releases this covering over the congregation to close the warfare prayer",
    "scripture": "Psalm 91:1-2 — He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress: my God; in him will I trust"
  }
}`;

    const userPrompt = type === "Warfare" ? warfarePrayerPrompt : generalPrayerPrompt;

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

    if (!response.ok) {
      const errText = await response.text();
      let userError = "Prayer generation failed — please try again.";
      if (response.status === 429 || errText.includes("usage_exceeded")) userError = "API limit reached. Please wait a moment.";
      return NextResponse.json({ error: userError }, { status: 500 });
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";

    console.log("Prayer raw length:", rawText.length, "Stop reason:", data.stop_reason);

    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1) {
      console.error("No JSON found in prayer response:", rawText.slice(0, 200));
      return NextResponse.json({ error: "No prayer content returned. Please try again." }, { status: 500 });
    }

    const jsonString = end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start);

    let prayer: Record<string, unknown> | null = null;
    try {
      prayer = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("Prayer JSON parse error:", parseErr);
      console.error("Raw JSON attempt:", jsonString.slice(0, 300));
      // Try to repair
      try {
        prayer = JSON.parse(repairJson(jsonString));
      } catch {
        // Return a hardcoded fallback prayer so the user always gets something
        prayer = buildFallbackPrayer(type, topic);
      }
    }

    if (!prayer) prayer = buildFallbackPrayer(type, topic);

    // Log usage
    if (user_id_header) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        await supabase.from("sermon_usage").insert({ user_id: user_id_header, topic: topic || type, level: "prayer", language: targetLanguage, tone: type, audience: audience || "" }).catch(() => {});
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ prayer });

  } catch (e) {
    console.error("Prayer route error:", e);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

function buildFallbackPrayer(type: string, topic?: string): Record<string, unknown> {
  if (type === "Warfare") {
    return {
      title: `Spiritual Warfare Prayer${topic ? ` — ${topic}` : ""}`,
      type: "Warfare",
      openingDeclaration: {
        text: "In the name of Jesus Christ, we take our authority as believers. The Word declares that we have been given power over all the power of the enemy.",
        scripture: "Luke 10:19 — Behold, I give unto you power to tread on serpents and scorpions, and over all the power of the enemy: and nothing shall by any means hurt you",
      },
      prayerSections: [
        { heading: "The Armour of God", prayer: "Father, we put on the full armour of God right now. We gird our loins with truth, we put on the breastplate of righteousness, we shod our feet with the gospel of peace, we take the shield of faith, the helmet of salvation, and the sword of the Spirit which is the Word of God.", scripture: "Ephesians 6:13 — Wherefore take unto you the whole armour of God, that ye may be able to withstand in the evil day", congregationalResponse: "I am armoured and ready! I stand in the power of His might!" },
        { heading: "Breaking Fear", prayer: "We come against every spirit of fear, anxiety and torment right now in the name of Jesus. God's Word is clear — fear is not from Him. We receive power, love and a sound mind.", scripture: "2 Timothy 1:7 — For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind", congregationalResponse: "I am free from fear! I have a sound mind in Jesus name!" },
        { heading: "Binding the Enemy", prayer: "We bind the works of darkness over this congregation, over our families, and over our city. What we bind on earth is bound in heaven. Satan, your assignment against us is cancelled in Jesus name.", scripture: "Matthew 18:18 — Whatsoever ye shall bind on earth shall be bound in heaven: and whatsoever ye shall loose on earth shall be loosed in heaven", congregationalResponse: "The enemy is bound! We are loosed in Jesus name!" },
        { heading: "Releasing God's Fire", prayer: "Holy Spirit, release Your fire right now. Burn up every yoke. Destroy every chain. The anointing of God breaks every burden and destroys every yoke from our lives.", scripture: "Isaiah 10:27 — The yoke shall be destroyed because of the anointing", congregationalResponse: "Every yoke is destroyed! The fire of God burns in us!" },
      ],
      corporateDeclaration: { instruction: "Stand and declare this together boldly:", declaration: "Satan, you have no authority here! The blood of Jesus covers this place! We are more than conquerors! Every chain is broken, every yoke destroyed, every stronghold falls in the mighty name of Jesus Christ!" },
      closingBlessing: { text: "Go in the victory of the Lord. You are covered, protected and empowered by the Most High God.", scripture: "Psalm 91:1 — He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty" },
    };
  }
  return {
    title: `General Prayer Ministry${topic ? ` — ${topic}` : ""}`,
    type: "General Prayer",
    openingDeclaration: {
      text: "Heavenly Father, we come into Your presence right now with hearts open to receive. Your Word declares that where two or three are gathered in Your name, You are in our midst. We welcome You, Holy Spirit.",
      scripture: "Matthew 18:20 — For where two or three are gathered together in my name, there am I in the midst of them",
    },
    prayerSections: [
      { heading: "Healing", prayer: "Father, we lift up every sick body in this room right now. Your Word is clear — by the stripes of Jesus we are healed. We receive that healing by faith right now. We speak to every sickness, every disease and command it to leave in Jesus name.", scripture: "Isaiah 53:5 — And with his stripes we are healed", congregationalResponse: "By His stripes I am healed! I receive my healing now!" },
      { heading: "Peace", prayer: "Lord, for every anxious heart, every worried mind — we cast those cares upon You right now. Your peace that passes all understanding stands guard over our hearts and minds in Christ Jesus.", scripture: "Philippians 4:6-7 — Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God", congregationalResponse: "I receive Your peace! My mind is at rest in Jesus name!" },
      { heading: "Provision", prayer: "Jehovah Jireh, we lift every financial need, every lack, every burden to You. Your Word promises You will supply all our needs according to Your riches in glory by Christ Jesus. We receive that provision by faith.", scripture: "Philippians 4:19 — My God shall supply all your need according to his riches in glory by Christ Jesus", congregationalResponse: "God is my provider! My needs are met in Jesus name!" },
      { heading: "Salvation", prayer: "Lord, we intercede for every unsaved loved one right now. You are not willing that any should perish. We stand in the gap for our families, our children, our friends who don't yet know You.", scripture: "2 Peter 3:9 — Not willing that any should perish, but that all should come to repentance", congregationalResponse: "I claim my household for the Kingdom of God!" },
    ],
    corporateDeclaration: { instruction: "Lead the congregation to declare this together:", declaration: "I am healed, I am at peace, I am provided for, I am loved by God! The Lord is my shepherd, I shall not want! Greater is He that is in me than he that is in the world! I receive all God has for me today!" },
    closingBlessing: { text: "May the Lord bless you and keep you as you leave this place today. You came in with a need — you leave with an answer.", scripture: "Numbers 6:24-26 — The Lord bless thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee: The Lord lift up his countenance upon thee, and give thee peace" },
  };
}

function repairJson(str: string): string {
  let result = str.replace(/,\s*$/, "");
  let braces = 0, brackets = 0;
  let inString = false, escape = false;
  for (const ch of result) {
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") braces++;
    if (ch === "}") braces--;
    if (ch === "[") brackets++;
    if (ch === "]") brackets--;
  }
  if (inString) result += '"';
  for (let i = 0; i < brackets; i++) result += "]";
  for (let i = 0; i < braces; i++) result += "}";
  return result;
}
