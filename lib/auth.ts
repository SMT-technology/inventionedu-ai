import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/** 연속으로 이만큼 틀리면 잠시 잠근다. 6자리 PIN을 무작위로 맞히는 시도를 사실상 막는다. */
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 10;
export const PIN_LENGTH = 6;

// 없는 계정으로 시도해도 응답 시간이 비슷하도록 비교에 쓰는 가짜 해시
const DUMMY_HASH = bcrypt.hashSync("not-a-real-secret", 10);

export function hashSecret(secret: string) {
  return bcrypt.hash(secret, 10);
}

export function generatePin() {
  return crypto.randomInt(0, 10 ** PIN_LENGTH).toString().padStart(PIN_LENGTH, "0");
}

type LoginTarget = { id: string; lockedUntil: Date | null } | null;

export type VerifyResult = "ok" | "invalid" | "locked";

/**
 * 비밀값(PIN/비밀번호)을 확인하고 실패 횟수·잠금을 갱신한다.
 * 시도 횟수를 비교 전에 DB에서 원자적으로 먼저 올려서, 요청을 한꺼번에 많이 보내도
 * 잠금 전까지 MAX_FAILED_LOGINS번보다 많이 시도할 수 없다.
 * 계정이 없을 때도 같은 "invalid"를 돌려 계정 존재 여부가 드러나지 않게 한다.
 */
export async function verifyAndTrack(
  user: LoginTarget,
  hash: string | null | undefined,
  secret: string
): Promise<VerifyResult> {
  if (!user || !hash) {
    await bcrypt.compare(secret, DUMMY_HASH);
    return "invalid";
  }

  const now = new Date();
  if (user.lockedUntil && user.lockedUntil <= now) {
    // 잠금 시간이 지났으면 횟수를 다시 0부터 센다.
    await prisma.user.updateMany({
      where: { id: user.id, lockedUntil: { lte: now } },
      data: { failedLogins: 0, lockedUntil: null },
    });
  }

  const reserved = await prisma.user.updateMany({
    where: { id: user.id, failedLogins: { lt: MAX_FAILED_LOGINS } },
    data: { failedLogins: { increment: 1 } },
  });
  if (reserved.count === 0) return "locked";

  if (await bcrypt.compare(secret, hash)) {
    await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
    return "ok";
  }

  const locked = await prisma.user.updateMany({
    where: { id: user.id, failedLogins: { gte: MAX_FAILED_LOGINS }, lockedUntil: null },
    data: { lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) },
  });
  return locked.count > 0 ? "locked" : "invalid";
}

/** 로그인한 교사가 담당하는 반의 학생이면 그 학생을, 아니면 null을 돌려준다. */
export async function findStudentOfTeacher(teacherId: string, studentId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: { class: true },
  });
  if (!student || student.role !== "student" || student.class?.teacherId !== teacherId) return null;
  return student;
}

/** 로그인한 교사가 담당하는 반이면 그 반을, 아니면 null을 돌려준다. */
export async function findClassOfTeacher(teacherId: string, classId: string) {
  const klass = await prisma.class.findUnique({ where: { id: classId } });
  if (!klass || klass.teacherId !== teacherId) return null;
  return klass;
}
