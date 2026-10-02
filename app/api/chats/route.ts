import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isValidStage } from "@/lib/stages";

export const dynamic = "force-dynamic";

/** 로그인한 학생 본인의 AI 대화만 돌려준다. ?stage=1~6으로 단계를 좁힐 수 있다. */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const stageParam = req.nextUrl.searchParams.get("stage");
  const stage = stageParam ? Number(stageParam) : undefined;
  if (stage !== undefined && !isValidStage(stage)) {
    return NextResponse.json({ error: "stage는 1~6이어야 합니다." }, { status: 400 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id, ...(stage !== undefined ? { stage } : {}) },
    orderBy: { createdAt: "asc" },
    select: { id: true, stage: true, role: true, content: true, createdAt: true },
  });

  return NextResponse.json({ messages });
}
