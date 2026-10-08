import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * 서명된 세션 쿠키. 값은 `userId.만료시각.서명`이고, 서명은 SESSION_SECRET으로 만든 HMAC이라
 * 쿠키 값을 다른 사람의 id로 바꿔도 서명이 맞지 않아 로그인되지 않는다.
 * role/classId/boardType은 매번 DB에서 새로 읽어 쿠키가 낡을 일이 없다.
 */
export const SESSION_COOKIE_NAME = "iml_session";
// 학생은 공용 태블릿을 쓸 수 있어 7일, 교사(연구자)는 매번 로그인하지 않도록 90일
export const STUDENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const TEACHER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export function sessionMaxAgeFor(role: string) {
  return role === "teacher" ? TEACHER_SESSION_MAX_AGE_SECONDS : STUDENT_SESSION_MAX_AGE_SECONDS;
}

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  // 로컬 개발에서만 임시 비밀값을 허용한다. 운영에서 비어 있으면 아무도 로그인할 수 없게 둔다.
  if (process.env.NODE_ENV !== "production") return "dev-only-session-secret-change-me-0000";
  return null;
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

/** 로그인 성공 시 쿠키에 넣을 값을 만든다. SESSION_SECRET이 없으면 null. */
export function createSessionToken(userId: string, maxAgeSeconds: number): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

function readSessionUserId(token: string | undefined): string | null {
  const secret = getSecret();
  if (!token || !secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresAt, signature] = parts;

  const expected = Buffer.from(sign(`${userId}.${expiresAt}`, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  if (Number(expiresAt) < Date.now() / 1000) return null;

  return userId;
}

export async function getCurrentUser() {
  const userId = readSessionUserId(cookies().get(SESSION_COOKIE_NAME)?.value);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return user;
}
