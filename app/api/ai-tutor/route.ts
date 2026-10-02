import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getBoardProfileByType } from "@/lib/boardContext";
import { BOARD_STAGE, isValidStage } from "@/lib/stages";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-5";
const MAX_MESSAGE_LENGTH = 2000;

/**
 * AI 튜터 엔드포인트.
 * stage(1-6)에 맞는 시스템 프롬프트를 /lib/stagePrompts/stage{n}.md에서 읽어오고,
 * 5단계(실행하기)에서는 학생의 보드 컨텍스트를 덧붙여 API 요청 본문을 구성한다.
 * 아직 어떤 AI를 쓸지 정하지 않아 화면에서는 호출하지 않는다 (뼈대만 유지).
 * ANTHROPIC_API_KEY가 없으면 실제 호출은 하지 않고 준비된 요청만 반환한다.
 * 학생 메시지와 AI 답변은 ChatMessage에 저장하며, 학생 본인과 담당 교사만 읽을 수 있다
 * (/api/chats, /api/teacher/chats).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const stage = Number(body?.stage);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!isValidStage(stage) || !message) {
    return NextResponse.json(
      { error: "stage(1-6)와 message가 필요합니다." },
      { status: 400 }
    );
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `메시지는 ${MAX_MESSAGE_LENGTH}자 이하로 써 주세요.` },
      { status: 400 }
    );
  }

  const promptPath = path.join(
    process.cwd(),
    "lib",
    "stagePrompts",
    `stage${stage}.md`
  );
  const stageSystemPrompt = await fs.readFile(promptPath, "utf-8");

  const boardProfile = stage === BOARD_STAGE ? getBoardProfileByType(user.boardType) : null;
  const boardContext = boardProfile
    ? [
        `현재 학생이 사용 중인 보드: ${boardProfile.displayName}`,
        `지원 센서: ${boardProfile.supportedSensors.map((s) => s.name).join(", ")}`,
        `코드 언어: ${boardProfile.codeTemplate.language}`,
        `통신 방식: ${boardProfile.communication.type} - ${boardProfile.communication.description}`,
      ].join("\n")
    : null;

  const systemPrompt = boardContext
    ? `${stageSystemPrompt}\n\n## 현재 보드 컨텍스트\n${boardContext}`
    : stageSystemPrompt;

  const anthropicRequestBody = {
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: message }],
  };

  await prisma.chatMessage.create({
    data: { userId: user.id, stage, role: "student", content: message },
  });

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      reason: "ANTHROPIC_API_KEY가 설정되지 않았습니다 (.env.local을 확인하세요).",
      preparedRequest: anthropicRequestBody,
    });
  }

  const anthropicRes = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(anthropicRequestBody),
  });

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return NextResponse.json(
      { ok: false, error: `Claude API 오류: ${errText}` },
      { status: anthropicRes.status }
    );
  }

  const data = await anthropicRes.json();
  const reply = Array.isArray(data?.content)
    ? data.content
        .filter((block: { type?: string }) => block?.type === "text")
        .map((block: { text: string }) => block.text)
        .join("\n")
    : "";
  if (reply) {
    await prisma.chatMessage.create({
      data: { userId: user.id, stage, role: "assistant", content: reply },
    });
  }

  return NextResponse.json({ ok: true, data });
}
