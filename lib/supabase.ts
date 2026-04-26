import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _client = createClient(url, key, {
      auth: {
        persistSession: true,
        storageKey: "pastors-helper-auth",
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

export const supabase = {
  auth: {
    getSession: () => getClient().auth.getSession(),
    getUser: () => getClient().auth.getUser(),
    signInWithOtp: (params: Parameters<SupabaseClient["auth"]["signInWithOtp"]>[0]) =>
      getClient().auth.signInWithOtp(params),
    signOut: () => getClient().auth.signOut(),
  },
  from: (table: string) => getClient().from(table),
};

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
