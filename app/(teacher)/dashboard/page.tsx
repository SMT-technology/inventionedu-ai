import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/");

  const classes = await prisma.class.findMany({
    where: { teacherId: user.id },
    orderBy: { createdAt: "asc" },
    include: { students: true },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="maker-panel mb-7 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-sky-400 text-3xl shadow-lg shadow-amber-100" aria-hidden="true">🧑‍🏫</div>
          <div>
          <p className="section-kicker">발명 메이커 랩 · 교사</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">{user.name}님의 대시보드</h1>
          </div>
        </div>
        <LogoutButton />
      </div>

      {classes.length === 0 ? (
        <p className="rounded-3xl border-2 border-dashed border-sky-200 bg-white/70 py-12 text-center text-sm text-slate-500">🧪 아직 생성된 반이 없습니다.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className="idea-card p-6"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black text-slate-800">🏫 {c.name}</h2>
                <Link
                  href={`/class/${c.id}`}
                  className="rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
                >
                  반 상세 보기 →
                </Link>
              </div>
              <p className="text-sm font-medium text-slate-600">학생 수: {c.students.length}명</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
