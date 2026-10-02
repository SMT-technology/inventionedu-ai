import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LOCK_MINUTES, verifyAndTrack } from "@/lib/auth";
import { SESSION_COOKIE_NAME, createSessionToken, sessionMaxAgeFor } from "@/lib/session";

/**
 * 로그인.
 * - 학생: { type: "student", joinCode, number, pin } — 교사가 나눠 준 반 코드 + 번호 + PIN
 * - 교사: { type: "teacher", email, password }
 * 틀린 이유(반 코드·번호·PIN 중 무엇이 틀렸는지)는 알려주지 않는다.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const type = body?.type;

  let result: Awaited<ReturnType<typeof verifyAndTrack>>;
  let user: { id: string; role: string } | null = null;

  if (type === "student") {
    const joinCode = typeof body?.joinCode === "string" ? body.joinCode.trim().toUpperCase() : "";
    const number = Number(body?.number);
    const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
    if (!joinCode || !Number.isInteger(number) || !pin) {
      return NextResponse.json({ error: "반 코드, 번호, PIN을 모두 입력하세요." }, { status: 400 });
    }

    const klass = await prisma.class.findUnique({ where: { joinCode } });
    const student = klass
      ? await prisma.user.findUnique({ where: { classId_number: { classId: klass.id, number } } })
      : null;
    const target = student?.role === "student" ? student : null;
    result = await verifyAndTrack(target, target?.pinHash, pin);
    user = target;
  } else if (type === "teacher") {
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호를 입력하세요." }, { status: 400 });
    }

    const teacher = await prisma.user.findUnique({ where: { email } });
    const target = teacher?.role === "teacher" ? teacher : null;
    result = await verifyAndTrack(target, target?.passwordHash, password);
    user = target;
  } else {
    return NextResponse.json({ error: "type은 student 또는 teacher여야 합니다." }, { status: 400 });
  }

  if (result === "locked") {
    return NextResponse.json(
      { error: `여러 번 틀려서 ${LOCK_MINUTES}분 동안 잠겼어요. 잠시 후 다시 하거나 선생님께 말해 주세요.` },
      { status: 429 }
    );
  }
  if (result !== "ok" || !user) {
    return NextResponse.json({ error: "입력한 정보가 맞지 않아요." }, { status: 401 });
  }

  const maxAge = sessionMaxAgeFor(user.role);
  const token = createSessionToken(user.id, maxAge);
  if (!token) {
    console.error("SESSION_SECRET is not set (32자 이상 필요)");
    return NextResponse.json({ error: "서버 설정이 끝나지 않아 로그인할 수 없어요." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
