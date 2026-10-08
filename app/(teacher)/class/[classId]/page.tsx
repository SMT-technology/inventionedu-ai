import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import { STEPS } from "@/lib/steps";

const STATUS_LABEL: Record<string, string> = {
  not_started: "미시작",
  in_progress: "진행중",
  done: "완료",
};

const STATUS_STYLE: Record<string, string> = {
  not_started: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-900",
  done: "bg-emerald-100 text-emerald-800",
};

export default async function ClassDetailPage({
  params,
}: {
  params: { classId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/");

  const klass = await prisma.class.findUnique({
    where: { id: params.classId },
    include: {
      students: {
        include: { progress: true, team: true },
        orderBy: [{ teamId: "asc" }, { name: "asc" }],
      },
    },
  });

  if (!klass || klass.teacherId !== user.id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="maker-panel mb-7 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-6 sm:p-8">
        <div>
          <Link href="/dashboard" className="inline-flex rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-100">
            ← 대시보드로
          </Link>
          <h1 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl">{klass.name}</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">학생 {klass.students.length}명</p>
        </div>
        <LogoutButton />
      </div>

      <div className="idea-card overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-sky-100 bg-sky-50/80 text-left text-slate-700">
              <th scope="col" className="sticky left-0 bg-sky-50 px-5 py-4 font-bold">이름</th>
              <th scope="col" className="px-4 py-4 font-bold">모둠</th>
              {STEPS.map((st) => (
                <th key={st.step} scope="col" className="px-4 py-4 font-bold">
                  {st.step}. {st.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {klass.students.map((s) => (
              <tr key={s.id} className="border-b border-sky-50 bg-white hover:bg-sky-50/40 last:border-0">
                <td className="sticky left-0 bg-inherit px-5 py-4 font-bold text-slate-800">{s.name}</td>
                <td className="px-4 py-4 text-slate-600">{s.team?.name ?? "미배정"}</td>
                {STEPS.map(({ step }) => {
                  const status =
                    s.progress.find((p) => p.step === step)?.status ?? "not_started";
                  return (
                    <td key={step} className="px-4 py-4">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
