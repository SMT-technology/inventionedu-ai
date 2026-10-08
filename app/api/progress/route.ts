import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { STEP_NUMBERS } from "@/lib/steps";

const VALID_STATUSES = ["not_started", "in_progress", "done"];

/** 학생 본인의 활동 단계 진도를 바꾼다. 교사는 미리보기만 하므로 기록하지 않는다. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.role !== "student") {
    return NextResponse.json({ error: "Only students record progress" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const step = Number(body?.step);
  const status = body?.status as string | undefined;
  if (!STEP_NUMBERS.includes(step) || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid step or status" }, { status: 400 });
  }

  const progress = await prisma.progress.upsert({
    where: { userId_step: { userId: user.id, step } },
    update: { status },
    create: { userId: user.id, step, status },
  });

  return NextResponse.json({ progress });
}
