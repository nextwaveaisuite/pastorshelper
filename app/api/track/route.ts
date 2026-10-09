import { NextResponse } from "next/server";
import { query } from "@/lib/db";
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const { page } = body ? JSON.parse(body) : {};
    await query("INSERT INTO page_views (page) VALUES ($1)", [page || "/"]);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: true }); }
}
