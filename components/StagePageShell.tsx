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
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <StudentNav studentName={user.name} currentStage={stage} />
      <ProgressCards progress={progress} currentStage={stage} />

      <section className="maker-panel dot-grid mt-6 overflow-hidden rounded-[2rem] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-sky-600">
              {meta.icon} {stage}단계
            </p>
            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{meta.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
          </div>
          <StageToggle stage={stage} initialStatus={current.status} />
        </div>

        {children}

        <nav className="mt-8 flex items-center justify-between border-t border-sky-100 pt-5 text-sm">
          {prev ? (
            <Link
              href={stageHref(prev.stage)}
              className="rounded-xl border border-sky-100 bg-white px-4 py-2 font-semibold text-slate-600 hover:bg-sky-50"
            >
              ← {prev.stage}단계 {prev.shortTitle}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={stageHref(next.stage)}
              className="rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700"
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
