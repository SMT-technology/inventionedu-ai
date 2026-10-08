import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Dummy login: no password/verification, just picks an existing seeded user
 * by id and stores the userId in a cookie.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const res = NextResponse.json({
    ok: true,
    role: user.role,
  });

  res.cookies.set(SESSION_COOKIE_NAME, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
