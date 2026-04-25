import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Sermon = {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  audience: string;
  tone: string;
  content: SermonContent;
  is_favorite: boolean;
  series_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SermonContent = {
  anchorScripture: {
    reference: string;
    kjv: string;
    nkjv: string;
  };
  theme: string;
  title: string;
  alternativeTitles: string[];
  opening: {
    greeting: string;
    atmosphere: string;
    hook: string;
  };
  foundation: {
    context: string;
    breakdown: string;
  };
  foreword: {
    whyItMatters: string;
    relatable: string;
  };
  teachingPoints: {
    title: string;
    scripture: string;
    explanation: string;
    application: string;
  }[];
  ministryFlow: {
    giftOfKnowledge: string;
    impartation: string;
    edification: string;
    slowDown: string;
    returnToAnchor: string;
  };
  summary: {
    keyTakeaways: string[];
  };
  altarCall: {
    invitation: string;
    prayer: string;
  };
  closingPrayer: string;
};

export type Series = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
};
