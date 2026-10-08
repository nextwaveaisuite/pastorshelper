import { neon } from "@neondatabase/serverless";

// Neon database connection
export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

// Helper for safe queries
export async function query<T = Record<string, unknown>>(
  queryStr: string,
  params: unknown[] = []
): Promise<T[]> {
  const sql = getDb();
  try {
    const result = await sql(queryStr, params);
    return result as T[];
  } catch (err) {
    console.error("DB query error:", err);
    throw err;
  }
}

export async function queryOne<T = Record<string, unknown>>(
  queryStr: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(queryStr, params);
  return rows[0] ?? null;
}
