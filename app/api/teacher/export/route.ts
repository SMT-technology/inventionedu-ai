import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { findClassOfTeacher } from "@/lib/auth";
import { decryptChat } from "@/lib/chatCrypto";

export const dynamic = "force-dynamic";

function csvCell(value: string | number) {
  // 학생 글이 =, +, -, @로 시작하면 엑셀이 수식으로 실행하므로 앞에 '를 붙인다.
  const raw = String(value);
  const text = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * 연구 분석용 가명 내보내기(CSV). 별명·이메일 없이 "반id-번호" 가명 ID만 넣는다.
 * 가명 ID와 실제 학생을 잇는 대조표는 앱 밖에서 연구자가 따로 보관한다.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const classId = req.nextUrl.searchParams.get("classId") ?? "";
  const klass = await findClassOfTeacher(user.id, classId);
  if (!klass) {
    return NextResponse.json({ error: "반을 찾을 수 없습니다." }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { user: { classId: klass.id } },
    orderBy: [{ userId: "asc" }, { createdAt: "asc" }],
    select: { stage: true, role: true, content: true, createdAt: true, user: { select: { number: true } } },
  });

  const header = ["pseudonym_id", "stage", "role", "content", "created_at"];
  const rows = messages.map((m) =>
    [`${klass.id}-${m.user.number ?? "x"}`, m.stage, m.role, decryptChat(m.content), m.createdAt.toISOString()]
      .map(csvCell)
      .join(",")
  );
  // 엑셀에서 한글이 깨지지 않도록 BOM을 붙인다.
  const csv = "﻿" + [header.join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="chats-${klass.id}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
