import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import StudentPinButton from "@/components/StudentPinButton";
import DeleteClassChatsButton from "@/components/DeleteClassChatsButton";
import { STAGES } from "@/lib/stages";

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

const BOARD_LABEL: Record<string, string> = {
  arduino: "아두이노 우노",
  microbit: "마이크로비트",
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
        include: { progress: true },
        orderBy: [{ number: "asc" }, { name: "asc" }],
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
          <p className="mt-1 text-sm text-slate-600">
            반 코드: <span className="font-mono font-bold">{klass.joinCode ?? "없음"}</span>
          </p>
          <p className="mt-2 flex flex-wrap gap-4 text-sm">
            <a href={`/api/teacher/export?classId=${klass.id}`} className="font-bold text-sky-700 underline">
              대화 가명 내보내기(CSV)
            </a>
            <DeleteClassChatsButton classId={klass.id} name={klass.name} />
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="idea-card overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-sky-100 bg-sky-50/80 text-left text-slate-700">
              <th scope="col" className="sticky left-0 bg-sky-50 px-5 py-4 font-bold">번호·별명</th>
              {STAGES.map((st) => (
                <th key={st.stage} scope="col" className="px-4 py-4 font-bold">
                  {st.stage}. {st.shortTitle}
                </th>
              ))}
              <th scope="col" className="px-4 py-4 font-bold">보드(5단계)</th>
              <th scope="col" className="px-4 py-4 font-bold">관리</th>
            </tr>
          </thead>
          <tbody>
            {klass.students.map((s) => (
              <tr key={s.id} className="border-b border-sky-50 bg-white hover:bg-sky-50/40 last:border-0">
                <td className="sticky left-0 bg-inherit px-5 py-4 font-bold text-slate-800">{s.number != null ? `${s.number}번 ` : ""}{s.name}</td>
                {STAGES.map(({ stage }) => {
                  const status =
                    s.progress.find((p) => p.stage === stage)?.status ?? "not_started";
                  return (
                    <td key={stage} className="px-4 py-4">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-4 text-slate-600">
                  {s.boardType ? BOARD_LABEL[s.boardType] ?? s.boardType : "미선택"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <Link href={`/class/${klass.id}/student/${s.id}`} className="text-sm font-bold text-sky-700 underline">
                      대화 보기
                    </Link>
                    <StudentPinButton studentId={s.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
