import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { stageHref } from "@/lib/stages";
import StudentNav from "@/components/StudentNav";
import AiChat from "@/components/AiChat";

export default async function StudentHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/dashboard");

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <StudentNav studentName={user.name} currentStage={0} />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="maker-panel flex flex-col items-start justify-center gap-4 rounded-[2rem] p-8 text-left">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">메이커 튜터 🛠️</h1>
          <p className="text-base text-slate-600">오늘 기분은 어때요? 상상을 현실로 만들어봐요!!</p>
          <Link
            href={stageHref(1)}
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 font-bold text-white shadow-md shadow-sky-200 hover:bg-sky-700"
          >
            🚀 시작하기
          </Link>
        </div>

        <AiChat persona="friend" />
      </section>
    </main>
  );
}
