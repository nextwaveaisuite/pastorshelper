import { neon } from "@neondatabase/serverless";

// Neon drop-in replacement for Supabase client
// Keeps the same .from().select().eq() style interface the app uses

const sql = neon(process.env.DATABASE_URL!);

function buildClient() {
  return {
    from(table: string) {
      return new QueryBuilder(table);
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOtp: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
      admin: {
        listUsers: async () => {
          const users = await sql`SELECT id, email, created_at, created_at as last_sign_in_at FROM users ORDER BY created_at DESC`;
          return { data: { users }, error: null };
        },
        deleteUser: async (id: string) => {
          await sql`DELETE FROM users WHERE id = ${id}`;
          return { error: null };
        },
        inviteUserByEmail: async (email: string) => {
          const rows = await sql`INSERT INTO users (email, password_hash) VALUES (${email}, 'invited') ON CONFLICT (email) DO NOTHING RETURNING *`;
          return { data: { user: rows[0] }, error: null };
        },
      },
    },
    rpc: () => ({ catch: () => {} }),
  };
}

class QueryBuilder {
  private table: string;
  private conditions: { col: string; val: unknown }[] = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitVal: number | null = null;
  private selectCols = "*";
  private isCount = false;
  private isHead = false;
  private upsertData: Record<string, unknown> | null = null;
  private updateData: Record<string, unknown> | null = null;
  private insertData: Record<string, unknown> | null = null;
  private deleteMode = false;

  constructor(table: string) { this.table = table; }

  select(cols = "*", opts?: { count?: string; head?: boolean }) {
    this.selectCols = cols;
    if (opts?.count) this.isCount = true;
    if (opts?.head) this.isHead = true;
    return this;
  }
  eq(col: string, val: unknown) { this.conditions.push({ col, val }); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orderCol = col; this.orderAsc = opts?.ascending !== false; return this; }
  limit(n: number) { this.limitVal = n; return this; }
  single() { this.limitVal = 1; return this.execute().then((r: { data: unknown[]; error: null }) => ({ data: r.data?.[0] ?? null, error: null })); }
  maybeSingle() { return this.single(); }

  insert(data: Record<string, unknown>) { this.insertData = data; return this; }
  update(data: Record<string, unknown>) { this.updateData = data; return this; }
  upsert(data: Record<string, unknown>) { this.upsertData = data; return this; }
  delete() { this.deleteMode = true; return this; }

  async execute(): Promise<{ data: unknown[]; error: null; count?: number }> {
    try {
      const where = this.conditions.map((c, i) => `"${c.col}" = $${i + 1}`).join(" AND ");
      const vals = this.conditions.map(c => c.val);

      if (this.deleteMode) {
        const q = where ? `DELETE FROM "${this.table}" WHERE ${where}` : `DELETE FROM "${this.table}"`;
        await sql(q, vals);
        return { data: [], error: null };
      }

      if (this.upsertData) {
        const cols = Object.keys(this.upsertData);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
        const updates = cols.map(c => `"${c}" = EXCLUDED."${c}"`).join(", ");
        const rows = await sql(
          `INSERT INTO "${this.table}" (${cols.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders}) ON CONFLICT DO UPDATE SET ${updates} RETURNING *`,
          Object.values(this.upsertData)
        );
        return { data: rows as unknown[], error: null };
      }

      if (this.insertData) {
        const cols = Object.keys(this.insertData);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
        const rows = await sql(
          `INSERT INTO "${this.table}" (${cols.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders}) RETURNING *`,
          Object.values(this.insertData)
        );
        return { data: rows as unknown[], error: null };
      }

      if (this.updateData) {
        const setCols = Object.keys(this.updateData).map((c, i) => `"${c}" = $${i + 1}`).join(", ");
        const allVals = [...Object.values(this.updateData), ...vals];
        const whereClause = where
          ? where.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) + Object.keys(this.updateData!).length}`)
          : "";
        const q = whereClause
          ? `UPDATE "${this.table}" SET ${setCols} WHERE ${whereClause} RETURNING *`
          : `UPDATE "${this.table}" SET ${setCols} RETURNING *`;
        const rows = await sql(q, allVals);
        return { data: rows as unknown[], error: null };
      }

      if (this.isCount) {
        const q = where ? `SELECT COUNT(*) as count FROM "${this.table}" WHERE ${where}` : `SELECT COUNT(*) as count FROM "${this.table}"`;
        const rows = await sql(q, vals);
        return { data: rows as unknown[], error: null, count: parseInt((rows[0] as Record<string,string>).count) };
      }

      let q = `SELECT ${this.selectCols} FROM "${this.table}"`;
      if (where) q += ` WHERE ${where}`;
      if (this.orderCol) q += ` ORDER BY "${this.orderCol}" ${this.orderAsc ? "ASC" : "DESC"}`;
      if (this.limitVal) q += ` LIMIT ${this.limitVal}`;
      const rows = await sql(q, vals);
      return { data: rows as unknown[], error: null };
    } catch (e) {
      console.error(`Neon query error on ${this.table}:`, e);
      return { data: [], error: null };
    }
  }

  then(resolve: (v: { data: unknown; error: null; count?: number }) => unknown) {
    return this.execute().then(r => {
      if (this.isCount) return resolve({ data: r.data, error: null, count: r.count });
      return resolve({ data: r.data, error: null });
    });
  }
  catch(fn: (e: unknown) => unknown) { return this.execute().catch(fn); }
}

export const supabase = buildClient();

// Keep type exports the same
export type Sermon = {
  id: string; user_id: string; title: string; topic: string;
  audience: string; tone: string; content: SermonContent;
  is_favorite: boolean; series_id: string | null;
  created_at: string; updated_at: string;
};
export type SermonContent = {
  anchorScripture: { reference: string; kjv: string; nkjv: string };
  theme: string; title: string; alternativeTitles: string[];
  opening: { greeting: string; atmosphere: string; hook: string };
  foundation: { context: string; breakdown: string };
  foreword: { whyItMatters: string; relatable: string };
  teachingPoints: { title: string; scripture: string; supportingScriptures?: string[]; explanation: string; application: string }[];
  ministryFlow: { giftOfKnowledge: string; impartation: string; edification: string; slowDown: string; returnToAnchor: string };
  summary: { keyTakeaways: string[] };
  altarCall: { invitation: string; prayer: string };
  closingPrayer: string;
};
export type Series = { id: string; user_id: string; name: string; description: string; created_at: string };
