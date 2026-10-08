import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Dummy session handling (no real auth yet).
 * We only store the userId in a plain cookie; role/classId/teamId are
 * always looked up fresh from the DB so the cookie can never go stale.
 */
export const SESSION_COOKIE_NAME = "redu_uid";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
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
