import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

/**
 * 교사 수업 설정 자리. 구성안(10/8)의 설정 항목을 목록으로만 보여 주고, 기능은 이후에 붙인다.
 * 개발 순서: 설정 → 진도 → 대화 보기.
 */
const PLANNED = [
  "기본 로봇팔 구조 템플릿 (2가지) 등록",
  "미션 등록",
  "AI가 직접 알려 주면 안 되는 부분 지정",
  "팀별 이미지 생성 횟수 (기본 5장, 0~10장)",
];

export default async function TeacherSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") redirect("/");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="maker-panel mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-6">
        <div>
          <Link href="/dashboard" className="text-sm font-bold text-sky-700">
            ← 대시보드로
          </Link>
          <h1 className="mt-2 text-2xl font-black text-slate-900">수업 설정</h1>
        </div>
        <LogoutButton />
      </div>
      <ul className="idea-card space-y-2 p-6 text-sm text-slate-700">
        {PLANNED.map((item) => (
          <li key={item}>· {item} (준비 중)</li>
        ))}
      </ul>
    </main>
  );
}
