import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { STAGE_NUMBERS as VALID_STAGES } from "@/lib/stages";

/**
 * Submission = one record card a student writes in a stage (발견한 문제, 아이디어,
 * 제작 기록 등) — a user can have many per stage, unlike Progress which is one
 * row per (user, stage).
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const stageParam = req.nextUrl.searchParams.get("stage");
    const stage = stageParam ? Number(stageParam) : undefined;

    if (stage !== undefined && !VALID_STAGES.includes(stage)) {
      return NextResponse.json({ error: `stage must be one of ${VALID_STAGES.join(", ")}` }, { status: 400 });
    }

    const submissions = await prisma.submission.findMany({
      where: { userId: user.id, ...(stage !== undefined ? { stage } : {}) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("GET /api/submissions failed:", err);
    return NextResponse.json({ error: "목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const stage = Number(body?.stage);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const imageUrl = typeof body?.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;

    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json({ error: `stage must be one of ${VALID_STAGES.join(", ")}` }, { status: 400 });
    }
    if (!title || !content) {
      return NextResponse.json({ error: "title과 content는 필수입니다." }, { status: 400 });
    }

    const submission = await prisma.submission.create({
      data: { userId: user.id, stage, title, content, imageUrl },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("POST /api/submissions failed:", err);
    return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
    }

    // Scope the delete to the owner so one student can't delete another's entry.
    const { count } = await prisma.submission.deleteMany({
      where: { id, userId: user.id },
    });

    if (count === 0) {
      return NextResponse.json({ error: "해당 항목을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/submissions failed:", err);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
}
