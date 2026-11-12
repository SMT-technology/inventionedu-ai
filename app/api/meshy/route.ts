import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const MESHY_API_URL = "https://api.meshy.ai/v2/text-to-3d";

/**
 * Meshy AI 텍스트→3D 모델 생성 뼈대.
 * 센서/아이디어/실험 3단계 진행과는 별개의 독립 기능 (ThreeDModel 테이블).
 * MESHY_API_KEY가 없으면 실제 호출 없이 준비된 요청과 함께 DB에 pending 기록만 남긴다.
 *
 * 참고: 아래 요청/응답 모양은 Meshy의 공개 문서 기준 일반적인 형태를 따른 것이라,
 * 실제 키를 연동할 때 https://docs.meshy.ai 에서 최신 엔드포인트/파라미터를 한 번 확인해줘.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "prompt는 필수입니다." }, { status: 400 });
    }

    const meshyRequestBody = {
      mode: "preview",
      prompt,
      art_style: "realistic",
    };

    const apiKey = process.env.MESHY_API_KEY;

    if (!apiKey) {
      const record = await prisma.threeDModel.create({
        data: { userId: user.id, prompt, status: "pending" },
      });
      return NextResponse.json({
        ok: false,
        reason: "MESHY_API_KEY가 설정되지 않았습니다 (.env.local을 확인하세요).",
        preparedRequest: meshyRequestBody,
        record,
      });
    }

    const meshyRes = await fetch(MESHY_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(meshyRequestBody),
    });

    if (!meshyRes.ok) {
      const errText = await meshyRes.text();
      console.error("Meshy API 오류:", errText);
      return NextResponse.json({ ok: false, error: `Meshy API 오류: ${errText}` }, { status: meshyRes.status });
    }

    const data = await meshyRes.json();
    const taskId: string | undefined = data?.result ?? data?.id;

    const record = await prisma.threeDModel.create({
      data: { userId: user.id, prompt, status: "pending", taskId },
    });

    return NextResponse.json({ ok: true, record, raw: data });
  } catch (err) {
    console.error("POST /api/meshy failed:", err);
    return NextResponse.json({ ok: false, error: "3D 모델 생성 요청 중 오류가 발생했습니다." }, { status: 500 });
  }
}

/** 내 3D 모델 생성 기록 목록. */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const models = await prisma.threeDModel.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ models });
  } catch (err) {
    console.error("GET /api/meshy failed:", err);
    return NextResponse.json({ error: "목록을 불러오지 못했습니다." }, { status: 500 });
  }
}
