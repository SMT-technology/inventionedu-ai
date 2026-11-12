import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/session";
import { PERSONAS, isValidPersona } from "@/lib/personas";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type ChatTurn = { role: "user" | "model"; content: string };

/**
 * AI 챗봇 엔드포인트. persona(friend|sensors|idea|practice)에 맞는 system prompt를
 * /lib/stagePrompts에서 읽어와 Google Gemini API 요청을 구성한다.
 * GEMINI_API_KEY가 없으면 실제 호출은 하지 않고 준비된 요청만 반환한다 (뼈대 단계).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const persona = body?.persona;
    const message = body?.message as string | undefined;
    const history = Array.isArray(body?.history) ? (body.history as ChatTurn[]) : [];

    if (!isValidPersona(persona) || !message) {
      return NextResponse.json(
        { error: `persona(${Object.keys(PERSONAS).join("|")})와 message가 필요합니다.` },
        { status: 400 }
      );
    }

    const promptPath = path.join(process.cwd(), "lib", "stagePrompts", PERSONAS[persona].promptFile);
    const systemPrompt = await fs.readFile(promptPath, "utf-8");

    const geminiRequestBody = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.content }] })),
        { role: "user", parts: [{ text: message }] },
      ],
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        reason: "GEMINI_API_KEY가 설정되지 않았습니다 (.env.local을 확인하세요).",
        preparedRequest: geminiRequestBody,
      });
    }

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(geminiRequestBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API 오류:", errText);
      return NextResponse.json(
        { ok: false, error: `Gemini API 오류: ${errText}` },
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();
    const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ ok: true, reply, raw: data });
  } catch (err) {
    console.error("POST /api/ai-tutor failed:", err);
    return NextResponse.json({ ok: false, error: "AI 응답 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
