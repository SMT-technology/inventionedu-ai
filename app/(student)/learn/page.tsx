import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { STEPS, stepHref } from "@/lib/steps";
import LearnNav from "@/components/LearnNav";

const STATUS_LABEL: Record<string, string> = { not_started: "미시작", in_progress: "진행중", done: "완료" };

/** 학생 홈: 활동 단계 목록과 내 진도. 교사는 같은 화면을 미리보기로 본다. */
export default async function LearnHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const isTeacher = user.role === "teacher";

  const [team, progress] = await Promise.all([
    user.teamId ? prisma.team.findUnique({ where: { id: user.teamId } }) : null,
    isTeacher ? [] : prisma.progress.findMany({ where: { userId: user.id } }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <LearnNav userName={user.name} teamName={team?.name ?? null} isTeacher={isTeacher} />
      <div className="grid gap-4 md:grid-cols-2">
        {STEPS.map((s) => {
          const status = progress.find((p) => p.step === s.step)?.status ?? "not_started";
          return (
            <Link key={s.step} href={stepHref(s.slug)} className="idea-card block p-5">
              <p className="text-xs font-bold text-slate-500">
                {s.step}단계{s.optional ? " · 확장" : ""}
                {!isTeacher && ` · ${STATUS_LABEL[status]}`}
                {!s.ready && " · 준비 중"}
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-900">{s.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{s.description}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
