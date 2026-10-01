import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Always hits the DB live; without this Next.js tries to prerender it at build time.
export const dynamic = "force-dynamic";

/** Lists seeded demo accounts so the dummy login screen can offer real users to pick from. */
export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { classId: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, class: { select: { name: true } } },
  });

  const teachers = users.filter((u) => u.role === "teacher");
  const students = users.filter((u) => u.role === "student");

  return NextResponse.json({ teachers, students });
}
