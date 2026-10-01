import Link from "next/link";
import { STAGES, stageHref } from "@/lib/stages";
import LogoutButton from "@/components/LogoutButton";

export default function StudentNav({
  studentName,
  currentStage,
}: {
  studentName: string;
  currentStage: number;
}) {
  return (
    <header className="maker-panel mb-6 flex flex-col gap-5 rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-sky-400 text-2xl shadow-lg shadow-amber-100" aria-hidden="true">💡</div>
          <div>
            <p className="section-kicker">발명 메이커 랩 · 학생</p>
            <h1 className="text-xl font-black text-slate-900">{studentName}의 발명 노트</h1>
          </div>
        </div>
        <LogoutButton />
      </div>
      <nav className="flex flex-wrap gap-2 border-t border-sky-100 pt-5 text-sm" aria-label="발명 단계">
        {STAGES.map((s) => (
          <Link
            key={s.stage}
            href={stageHref(s.stage)}
            aria-current={s.stage === currentStage ? "page" : undefined}
            className={`rounded-2xl border px-4 py-2.5 font-bold ${
              s.stage === currentStage
                ? "border-sky-500 bg-sky-600 text-white shadow-md shadow-sky-200"
                : "border-sky-100 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            {s.stage}. {s.shortTitle}
          </Link>
        ))}
      </nav>
    </header>
  );
}
