"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BoardProfile } from "@/lib/boardContext";

export default function BoardSelector({
  profiles,
  currentBoardType,
}: {
  profiles: BoardProfile[];
  currentBoardType: string | null;
}) {
  const router = useRouter();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(boardId: string) {
    setSubmittingId(boardId);
    setError(null);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardType: boardId }),
      });
      if (!res.ok) throw new Error("failed");
      router.refresh();
      setSubmittingId(null);
    } catch {
      setError("보드 선택에 실패했습니다. 다시 시도해주세요.");
      setSubmittingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">⚠️ {error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {profiles.map((profile) => {
          const selected = currentBoardType === profile.boardId;
          return (
            <div
              key={profile.boardId}
              className={`flex flex-col justify-between rounded-[2rem] border-2 p-6 shadow-lg shadow-sky-900/5 transition ${
                selected ? "border-indigo-400 bg-indigo-50/90" : "border-white bg-white/90 hover:border-sky-200"
              }`}
            >
              <div>
                <div className="mb-4 text-4xl" aria-hidden="true">🔌</div>
                <h3 className="text-xl font-black text-slate-900">{profile.displayName}</h3>
                <p className="mt-2 inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">
                  코드 언어: {profile.codeTemplate.language}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  통신 방식: {profile.communication.type}
                </p>
                <p className="mt-4 border-t border-sky-100 pt-4 text-sm leading-6 text-slate-600">
                  지원 센서: {profile.supportedSensors.map((s) => s.name).join(", ")}
                </p>
              </div>
              <button
                onClick={() => handleSelect(profile.boardId)}
                disabled={submittingId !== null}
                className={`mt-5 px-4 py-2.5 text-sm font-bold shadow-sm disabled:opacity-50 ${
                  selected
                    ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
                    : "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                }`}
              >
                {submittingId === profile.boardId
                  ? "선택 중..."
                  : selected
                  ? "선택됨 (계속하기)"
                  : "이 보드 선택하기"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
