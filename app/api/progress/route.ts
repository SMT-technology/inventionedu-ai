import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { STAGE_NUMBERS as VALID_STAGES } from "@/lib/stages";
const VALID_STATUSES = ["not_started", "in_progress", "done"];

/** Returns the current user's progress for all stages, creating missing rows as "not_started". */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const progress = await Promise.all(
    VALID_STAGES.map((stage) =>
      prisma.progress.upsert({
        where: { userId_stage: { userId: user.id, stage } },
        update: {},
        create: { userId: user.id, stage, status: "not_started" },
      })
    )
  );

  return NextResponse.json({ progress });
}

/** Updates (or creates) the current user's progress for a single stage. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const stage = Number(body?.stage);
  const status = body?.status as string | undefined;

  if (!VALID_STAGES.includes(stage) || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `stage must be ${VALID_STAGES.join("|")} and status one of not_started|in_progress|done` },
      { status: 400 }
    );
  }

  const updated = await prisma.progress.upsert({
    where: { userId_stage: { userId: user.id, stage } },
    update: { status },
    create: { userId: user.id, stage, status },
  });

  return NextResponse.json({ progress: updated });
}
