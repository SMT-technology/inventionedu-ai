"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  class: { name: string } | null;
};

export default function LoginPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<DemoUser[]>([]);
  const [students, setStudents] = useState<DemoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingInId, setLoggingInId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/demo-users")
      .then((res) => res.json())
      .then((data) => {
        setTeachers(data.teachers ?? []);
        setStudents(data.students ?? []);
      })
      .catch(() => setError("데모 계정을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(userId: string) {
    setLoggingInId(userId);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("login failed");
      router.push("/");
      router.refresh();
    } catch {
      setError("로그인에 실패했습니다.");
      setLoggingInId(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:py-16">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-amber-300 via-orange-300 to-sky-400 text-4xl shadow-xl shadow-amber-200/70" aria-hidden="true">🦾</div>
        <span className="inline-flex rounded-full border border-sky-200 bg-white px-4 py-1.5 text-xs font-black tracking-[0.18em] text-sky-700 shadow-sm">ROBOT JOINT HELPER</span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">로봇 관절 도우미</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
          지금은 실제 인증 없이, 아래 데모 계정 중 하나를 선택해 로그인합니다.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">⚠️ {error}</p>
      )}

      {!loading && !error && teachers.length === 0 && students.length === 0 && (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          아직 테스트 계정이 없어요. Supabase SQL Editor에서 prisma/seed.sql을 실행하면 아래에 계정 버튼이 생겨요.
        </p>
      )}

      {loading ? (
        <p className="text-center text-sm font-medium text-sky-600">⚙️ 메이커 계정을 불러오는 중...</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="maker-panel rounded-[2rem] p-6 sm:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl" aria-hidden="true">🧑‍🏫</div>
            <h2 className="text-xl font-black text-slate-900">교사로 로그인</h2>
            <p className="mt-1 text-sm text-slate-500">우리 반 로봇팔 프로젝트를 살펴보고 설정해요.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {teachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleLogin(t.id)}
                  disabled={loggingInId !== null}
                  className="w-full border border-indigo-200 bg-indigo-50 px-5 py-3 text-left text-sm font-bold text-indigo-800 shadow-sm hover:border-indigo-300 hover:bg-indigo-100 disabled:opacity-50"
                >
                  {loggingInId === t.id ? "로그인 중..." : `${t.name} (교사)`}
                </button>
              ))}
            </div>
          </section>

          <section className="maker-panel rounded-[2rem] p-6 sm:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl" aria-hidden="true">✨</div>
            <h2 className="text-xl font-black text-slate-900">학생으로 로그인</h2>
            <p className="mt-1 text-sm text-slate-500">내 계정을 골라 로봇팔 프로젝트를 시작해요.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLogin(s.id)}
                  disabled={loggingInId !== null}
                  className="group border border-sky-100 bg-sky-50/50 px-4 py-4 text-left text-sm shadow-sm hover:border-sky-300 hover:bg-sky-50 disabled:opacity-50"
                >
                  <div className="font-bold text-slate-800 group-hover:text-sky-700">🙋 {s.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {s.class?.name ?? "반 미배정"}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
