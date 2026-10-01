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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-7 px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-sky-400 to-indigo-500 text-4xl shadow-xl shadow-sky-200" aria-hidden="true">💡</div>
        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold tracking-widest text-sky-700">INVENTION MAKER LAB</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">발명 메이커 랩</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          지금은 실제 인증 없이, 아래 데모 계정 중 하나를 선택해 로그인합니다.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">⚠️ {error}</p>
      )}

      {loading ? (
        <p className="text-center text-sm font-medium text-sky-600">⚙️ 메이커 계정을 불러오는 중...</p>
      ) : (
        <div className="maker-panel flex flex-col gap-7 rounded-[2rem] p-5 sm:p-8">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><span className="text-xl" aria-hidden="true">🧑‍🏫</span> 교사로 로그인</h2>
            <div className="flex flex-wrap gap-2">
              {teachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleLogin(t.id)}
                  disabled={loggingInId !== null}
                  className="border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-100 disabled:opacity-50"
                >
                  {loggingInId === t.id ? "로그인 중..." : `${t.name} (교사)`}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700"><span className="text-xl" aria-hidden="true">🧑‍🔧</span> 학생으로 로그인</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLogin(s.id)}
                  disabled={loggingInId !== null}
                  className="group border border-sky-100 bg-white px-4 py-3 text-left text-sm shadow-sm hover:border-sky-300 hover:bg-sky-50 disabled:opacity-50"
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
