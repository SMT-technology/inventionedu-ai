import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Always runs live; this is a periodic keep-alive ping, not something to prerender/cache.
export const dynamic = "force-dynamic";

/**
 * Keep-alive endpoint for Supabase's free-tier project pause (triggers after
 * 7 days with no DB activity). Vercel Cron hits this every few days so the
 * project never goes idle long enough to pause. No side effects — read-only.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
  } catch (err) {
    console.error("GET /api/health failed:", err);
    return NextResponse.json({ ok: false, error: "DB unreachable" }, { status: 503 });
  }
}
