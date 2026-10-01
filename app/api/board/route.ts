import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** Persists the student's board choice (arduino | microbit) made on the stage 5 (실행하기) screen. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const boardType = body?.boardType as string | undefined;

  if (boardType !== "arduino" && boardType !== "microbit") {
    return NextResponse.json({ error: "boardType must be arduino or microbit" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { boardType },
  });

  return NextResponse.json({ ok: true, boardType });
}
