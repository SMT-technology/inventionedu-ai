import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { findStudentOfTeacher } from "@/lib/auth";
import { getStage } from "@/lib/stages";
import { decryptChat } from "@/lib/chatCrypto";

export const dynamic = "force-dynamic";

/** 담당 교사(연구자)만 볼 수 있는 학생 한 명의 AI 대화 기록 */
export default async function StudentChatsPage({
  params,
}: {
  params: { classId: string; studentId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/");

  const student = await findStudentOfTeacher(user.id, params.studentId);
  if (!student || student.classId !== params.classId) notFound();

  const messages = await prisma.chatMessage.findMany({
    where: { userId: student.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/class/${params.classId}`} className="text-sm font-bold text-sky-700">
        ← 반으로
      </Link>
      <h1 className="mt-4 text-2xl font-black text-slate-900">
        {student.number != null ? `${student.number}번 ` : ""}
        {student.name}의 AI 대화
      </h1>
      {messages.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">아직 대화가 없어요.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {messages.map((m) => (
            <li key={m.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">
                {m.stage}단계 {getStage(m.stage)?.shortTitle ?? ""} · {m.role === "student" ? "학생" : "AI"} ·{" "}
                {m.createdAt.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{decryptChat(m.content)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
