import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { findClassOfTeacher, findStudentOfTeacher } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** 교사(연구자)가 담당 반 학생 한 명의 AI 대화를 본다. ?studentId= */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const studentId = req.nextUrl.searchParams.get("studentId") ?? "";
  const student = await findStudentOfTeacher(user.id, studentId);
  if (!student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { userId: student.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, stage: true, role: true, content: true, createdAt: true },
  });

  return NextResponse.json({ student: { id: student.id, number: student.number, name: student.name }, messages });
}

/**
 * 반 전체 AI 대화를 지운다(IRB에서 정한 보관 기간이 끝났을 때 교사가 직접 실행).
 * 실수로 지우지 않도록 ?classId=와 같은 값을 ?confirm=에도 넣어야 한다.
 */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const classId = req.nextUrl.searchParams.get("classId") ?? "";
  const confirm = req.nextUrl.searchParams.get("confirm");
  const klass = await findClassOfTeacher(user.id, classId);
  if (!klass) {
    return NextResponse.json({ error: "반을 찾을 수 없습니다." }, { status: 404 });
  }
  if (confirm !== klass.id) {
    return NextResponse.json({ error: "confirm 값이 반 id와 같아야 삭제됩니다." }, { status: 400 });
  }

  const { count } = await prisma.chatMessage.deleteMany({ where: { user: { classId: klass.id } } });
  return NextResponse.json({ ok: true, deleted: count });
}
