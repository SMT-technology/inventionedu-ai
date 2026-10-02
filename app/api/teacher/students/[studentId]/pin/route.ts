import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { findStudentOfTeacher, generatePin, hashSecret } from "@/lib/auth";

/**
 * 학생 PIN을 새로 만든다(처음 발급, 잊어버림, 잠김 해제). 새 PIN은 이 응답에서 한 번만 보이고
 * DB에는 해시만 남는다.
 */
export async function POST(_req: Request, { params }: { params: { studentId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const student = await findStudentOfTeacher(user.id, params.studentId);
  if (!student) {
    return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  }

  const pin = generatePin();
  await prisma.user.update({
    where: { id: student.id },
    data: { pinHash: await hashSecret(pin), failedLogins: 0, lockedUntil: null },
  });

  return NextResponse.json({ pin }, { headers: { "Cache-Control": "no-store" } });
}
