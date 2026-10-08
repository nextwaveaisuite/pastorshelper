import { neon } from "@neondatabase/serverless";

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function query<T = Record<string, unknown>>(
  queryStr: string,
  params: unknown[] = []
): Promise<T[]> {
  const sql = getDb();
  const result = await sql(queryStr, params);
  return result as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  queryStr: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(queryStr, params);
  return rows[0] ?? null;
}
