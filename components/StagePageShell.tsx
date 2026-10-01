import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { STAGE_NUMBERS, getStage, stageHref } from "@/lib/stages";
import StudentNav from "@/components/StudentNav";
import ProgressCards from "@/components/ProgressCards";
import StageToggle from "@/components/StageToggle";

export default async function StagePageShell({
  stage,
  children,
}: {
  stage: number;
  children?: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/dashboard");

  const meta = getStage(stage)!;
  const prev = getStage(stage - 1);
  const next = getStage(stage + 1);

  const progress = await Promise.all(
    STAGE_NUMBERS.map((s) =>
      prisma.progress.upsert({
        where: { userId_stage: { userId: user.id, stage: s } },
        update: {},
        create: { userId: user.id, stage: s, status: "not_started" },
      })
    )
  );

  const current = progress.find((p) => p.stage === stage)!;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <StudentNav studentName={user.name} currentStage={stage} />
      <ProgressCards progress={progress} currentStage={stage} />

      <section className="maker-panel mt-6 overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-sky-100 pb-6">
          <div>
            <p className="section-kicker mb-2">
              {meta.icon} {stage}단계
            </p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{meta.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{meta.description}</p>
          </div>
          <StageToggle stage={stage} initialStatus={current.status} />
        </div>

        {children}

        <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-sky-100 pt-6 text-sm">
          {prev ? (
            <Link
              href={stageHref(prev.stage)}
              className="rounded-2xl border border-sky-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-sky-50"
            >
              ← {prev.stage}단계 {prev.shortTitle}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={stageHref(next.stage)}
              className="rounded-2xl bg-sky-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-sky-700"
            >
              {next.stage}단계 {next.shortTitle} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </section>
    </main>
  );
}
