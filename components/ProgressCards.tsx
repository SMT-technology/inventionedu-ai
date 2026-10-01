import Link from "next/link";
import { STAGES, stageHref } from "@/lib/stages";

const STATUS_LABEL: Record<string, string> = {
  not_started: "미시작",
  in_progress: "진행중",
  done: "완료",
};

const STATUS_STYLE: Record<string, string> = {
  not_started: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
};

export default function ProgressCards({
  progress,
  currentStage,
}: {
  progress: { stage: number; status: string }[];
  currentStage?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="6단계 진행 현황">
      {STAGES.map((meta) => {
        const status = progress.find((p) => p.stage === meta.stage)?.status ?? "not_started";
        return (
          <Link
            key={meta.stage}
            href={stageHref(meta.stage)}
            className={`group rounded-3xl border bg-white/90 p-4 shadow-md shadow-sky-900/5 backdrop-blur hover:border-sky-300 hover:bg-white ${
              meta.stage === currentStage ? "border-sky-400 ring-2 ring-sky-100" : "border-sky-100"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl transition-transform group-hover:rotate-6 group-hover:scale-110" aria-hidden="true">{meta.icon}</span>
              <p className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800">{meta.stage}단계</p>
            </div>
            <p className="text-sm font-bold leading-snug text-slate-800">{meta.shortTitle}</p>
            <span
              className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
