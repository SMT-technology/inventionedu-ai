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
    <header className="maker-panel mb-6 flex flex-col gap-4 rounded-[2rem] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-2xl shadow-lg shadow-sky-200" aria-hidden="true">💡</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600">발명 메이커 · 학생</p>
            <h1 className="text-lg font-black text-slate-900">{studentName}의 발명 노트</h1>
          </div>
        </div>
        <LogoutButton />
      </div>
      <nav className="flex flex-wrap gap-2 border-t border-sky-100 pt-4 text-sm">
        {STAGES.map((s) => (
          <Link
            key={s.stage}
            href={stageHref(s.stage)}
            aria-current={s.stage === currentStage ? "page" : undefined}
            className={`rounded-xl border px-3 py-2 font-semibold ${
              s.stage === currentStage
                ? "border-sky-300 bg-sky-50 text-sky-700"
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
