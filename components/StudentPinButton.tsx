"use client";

import { useState } from "react";

/** 학생 PIN 새로 만들기. 새 PIN은 이 화면에서 한 번만 보여 준다. */
export default function StudentPinButton({ studentId }: { studentId: string }) {
  const [pin, setPin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("새 PIN을 만들면 예전 PIN은 더 이상 쓸 수 없어요. 계속할까요?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/students/${studentId}/pin`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "실패");
      setPin(data.pin);
    } catch {
      setError("PIN을 만들지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  if (pin) {
    return <span className="font-mono text-sm font-bold text-slate-800">새 PIN: {pin}</span>;
  }

  return (
    <span>
      <button onClick={handleClick} disabled={busy} className="text-sm font-bold text-sky-700 underline disabled:opacity-50">
        {busy ? "만드는 중..." : "PIN 새로 만들기"}
      </button>
      {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
    </span>
  );
}
