import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import StudentNav from "@/components/StudentNav";
import ThreeDLab from "@/components/ThreeDLab";

export default async function Lab3dPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/dashboard");

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <StudentNav studentName={user.name} currentStage={0} />

      <section className="maker-panel mt-6 overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div className="border-b border-sky-100 pb-6">
          <p className="section-kicker mb-2">🧊 특별 기능</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">3D 모델 랩</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            아이디어를 글로 설명하면 AI가 3D 모델로 미리 만들어줘요. (발명 단계 진행과는 별개예요)
          </p>
        </div>

        <div className="mt-6">
          <ThreeDLab />
        </div>
      </section>
    </main>
  );
}
