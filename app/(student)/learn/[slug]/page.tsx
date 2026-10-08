import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getStepBySlug } from "@/lib/steps";
import LearnNav from "@/components/LearnNav";
import StepToggle from "@/components/StepToggle";
import JointLab from "@/components/JointLab";

export default async function StepPage({ params }: { params: { slug: string } }) {
  const meta = getStepBySlug(params.slug);
  if (!meta) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const isTeacher = user.role === "teacher";

  const [team, progress] = await Promise.all([
    user.teamId ? prisma.team.findUnique({ where: { id: user.teamId } }) : null,
    isTeacher ? null : prisma.progress.findUnique({ where: { userId_step: { userId: user.id, step: meta.step } } }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <LearnNav userName={user.name} teamName={team?.name ?? null} isTeacher={isTeacher} currentSlug={meta.slug} />
      <section className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            {meta.step}. {meta.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{meta.description}</p>
        </div>
        {!isTeacher && <StepToggle step={meta.step} initialStatus={progress?.status ?? "not_started"} />}
      </section>

      {meta.slug === "lab" && <JointLab tabs={["direction", "mount", "chain"]} />}
      {meta.slug === "sensor" && <JointLab tabs={["sensor"]} />}
      {!meta.ready && (
        <p className="rounded-3xl border-2 border-dashed border-sky-200 bg-white/70 py-12 text-center text-sm text-slate-500">
          이 단계는 준비 중이에요.
        </p>
      )}
    </main>
  );
}
