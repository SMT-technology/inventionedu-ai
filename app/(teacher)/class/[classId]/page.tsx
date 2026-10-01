import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import { STAGES } from "@/lib/stages";

const STATUS_LABEL: Record<string, string> = {
  not_started: "미시작",
  in_progress: "진행중",
  done: "완료",
};

const STATUS_STYLE: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-600",
  in_progress: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-800",
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
        orderBy: { name: "asc" },
      },
    },
  });

  if (!klass || klass.teacherId !== user.id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            ← 대시보드로
          </Link>
          <h1 className="mt-1 text-xl font-bold">{klass.name}</h1>
          <p className="text-sm text-gray-500">학생 {klass.students.length}명</p>
        </div>
        <LogoutButton />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium">이름</th>
              {STAGES.map((st) => (
                <th key={st.stage} className="px-4 py-3 font-medium">
                  {st.stage}. {st.shortTitle}
                </th>
              ))}
              <th className="px-4 py-3 font-medium">보드(5단계)</th>
            </tr>
          </thead>
          <tbody>
            {klass.students.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                {STAGES.map(({ stage }) => {
                  const status =
                    s.progress.find((p) => p.stage === stage)?.status ?? "not_started";
                  return (
                    <td key={stage} className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-gray-500">
                  {s.boardType ? BOARD_LABEL[s.boardType] ?? s.boardType : "미선택"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
