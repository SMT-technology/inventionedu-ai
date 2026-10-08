"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginBody =
  | { type: "student"; joinCode: string; number: number; pin: string }
  | { type: "teacher"; email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<"student" | "teacher" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function login(body: LoginBody) {
    setSubmitting(body.type);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "로그인에 실패했습니다.");
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인에 실패했습니다.");
      setSubmitting(null);
    }
  }

  function handleStudentSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    login({
      type: "student",
      joinCode: String(form.get("joinCode") ?? ""),
      number: Number(form.get("number")),
      pin: String(form.get("pin") ?? ""),
    });
  }

  function handleTeacherSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    login({
      type: "teacher",
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-4 py-10 sm:px-6 lg:py-16">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-amber-300 via-orange-300 to-sky-400 text-4xl shadow-xl shadow-amber-200/70" aria-hidden="true">💡</div>
        <span className="inline-flex rounded-full border border-sky-200 bg-white px-4 py-1.5 text-xs font-black tracking-[0.18em] text-sky-700 shadow-sm">INVENTION MAKER LAB</span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">발명 메이커 랩</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
          학생은 선생님께 받은 반 코드, 번호, PIN으로 로그인해요.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">⚠️ {error}</p>
      )}

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="maker-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl" aria-hidden="true">🧑‍🏫</div>
          <h2 className="text-xl font-black text-slate-900">교사로 로그인</h2>
          <p className="mt-1 text-sm text-slate-500">우리 반의 발명 여정을 살펴보세요.</p>
          <form onSubmit={handleTeacherSubmit} className="mt-6 flex flex-col gap-3">
            <input name="email" type="email" autoComplete="username" required placeholder="이메일" className="border border-slate-200 px-4 py-3 text-sm" />
            <input name="password" type="password" autoComplete="current-password" required placeholder="비밀번호" className="border border-slate-200 px-4 py-3 text-sm" />
            <button
              type="submit"
              disabled={submitting !== null}
              className="w-full border border-indigo-200 bg-indigo-50 px-5 py-3 text-left text-sm font-bold text-indigo-800 shadow-sm hover:border-indigo-300 hover:bg-indigo-100 disabled:opacity-50"
            >
              {submitting === "teacher" ? "로그인 중..." : "교사 로그인"}
            </button>
          </form>
        </section>

        <section className="maker-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl" aria-hidden="true">✨</div>
          <h2 className="text-xl font-black text-slate-900">학생으로 로그인</h2>
          <p className="mt-1 text-sm text-slate-500">선생님께 받은 반 코드, 내 번호, PIN을 입력해요.</p>
          <form onSubmit={handleStudentSubmit} className="mt-6 flex flex-col gap-3">
            <input name="joinCode" required autoCapitalize="characters" autoComplete="off" placeholder="반 코드 (예: AB12CD)" className="border border-slate-200 px-4 py-3 text-sm uppercase" />
            <input name="number" type="number" inputMode="numeric" min={1} required placeholder="번호" className="border border-slate-200 px-4 py-3 text-sm" />
            <input name="pin" type="password" inputMode="numeric" autoComplete="off" required placeholder="PIN (숫자 6자리)" className="border border-slate-200 px-4 py-3 text-sm" />
            <button
              type="submit"
              disabled={submitting !== null}
              className="group border border-sky-100 bg-sky-50/50 px-4 py-4 text-left text-sm font-bold text-slate-800 shadow-sm hover:border-sky-300 hover:bg-sky-50 disabled:opacity-50"
            >
              {submitting === "student" ? "로그인 중..." : "학생 로그인"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
