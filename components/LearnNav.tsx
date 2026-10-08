import Link from "next/link";
import { STEPS, stepHref } from "@/lib/steps";
import LogoutButton from "@/components/LogoutButton";

/** 학생 페이지 위쪽 메뉴. 교사가 들어오면 미리보기 표시와 대시보드 링크를 보여 준다. */
export default function LearnNav({
  userName,
  teamName,
  isTeacher,
  currentSlug,
}: {
  userName: string;
  teamName: string | null;
  isTeacher: boolean;
  currentSlug?: string;
}) {
  return (
    <header className="maker-panel mb-6 flex flex-col gap-4 rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">로봇 관절 도우미 · {isTeacher ? "교사 미리보기" : "학생"}</p>
          <h1 className="text-xl font-black text-slate-900">
            <Link href="/learn">{isTeacher ? "학생 페이지 미리보기" : `${userName}${teamName ? ` · ${teamName}` : ""}`}</Link>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {isTeacher && (
            <Link href="/dashboard" className="border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600">
              교사 대시보드
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
      <nav className="flex flex-wrap gap-2 border-t border-sky-100 pt-4 text-sm" aria-label="활동 단계">
        {STEPS.map((s) => (
          <Link
            key={s.step}
            href={stepHref(s.slug)}
            aria-current={s.slug === currentSlug ? "page" : undefined}
            className={`rounded-2xl border px-4 py-2.5 font-bold ${
              s.slug === currentSlug ? "border-sky-500 bg-sky-600 text-white" : "border-sky-100 bg-white text-slate-600"
            }`}
          >
            {s.step}. {s.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}
