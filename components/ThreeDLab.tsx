"use client";

import { useState } from "react";
import { useThreeDModels } from "@/lib/hooks/useThreeDModels";

const STATUS_LABEL: Record<string, string> = {
  pending: "대기중",
  done: "완료",
  failed: "실패",
};

/** Meshy AI 텍스트→3D 모델 생성 화면. 발명 단계 진행과는 별개의 독립 기능. */
export default function ThreeDLab() {
  const { models, loading, error, notice, generate } = useThreeDModels();
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setSubmitting(true);
    const ok = await generate(prompt);
    setSubmitting(false);
    if (ok) setPrompt("");
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="maker-panel flex flex-col gap-3 rounded-[2rem] p-5">
        <label className="text-sm font-bold text-slate-700">어떤 모양을 3D로 만들어볼까요?</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="예: 쓰레기를 먹는 귀여운 로봇, 초음파 센서 눈이 달린 자동차 모양 쓰레기통..."
          className="rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting || !prompt.trim()}
          className="self-start rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? "요청 중..." : "🧊 3D 모델 만들기"}
        </button>
      </form>

      {notice && (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          ⚠️ {notice}
        </p>
      )}
      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          ⚠️ {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">불러오는 중...</p>
      ) : models.length === 0 ? (
        <p className="text-sm text-slate-400">아직 만든 3D 모델이 없습니다.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {models.map((m) => (
            <li key={m.id} className="idea-card p-5">
              <p className="text-sm font-bold text-slate-800">{m.prompt}</p>
              <span className="mt-2 inline-block rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                {STATUS_LABEL[m.status] ?? m.status}
              </span>
              {m.resultUrl && (
                <a
                  href={m.resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-xs font-bold text-sky-600 hover:underline"
                >
                  결과 보러 가기 →
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
