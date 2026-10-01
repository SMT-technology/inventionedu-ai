"use client";

import { useState } from "react";
import { useSubmissions } from "@/lib/hooks/useSubmissions";

/**
 * Presentational board for one stage's entries (idea-board cards for stage 1,
 * journal entries for stage 2). All data logic lives in useSubmissions — this
 * component only renders it, so the markup/styling can be swapped freely.
 */
export default function SubmissionBoard({
  stage,
  entryLabel,
  titlePlaceholder,
  contentPlaceholder,
}: {
  stage: number;
  entryLabel: string;
  titlePlaceholder?: string;
  contentPlaceholder?: string;
}) {
  const { submissions, loading, error, addSubmission, removeSubmission } = useSubmissions(stage);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    const ok = await addSubmission({ title, content, imageUrl: imageUrl || undefined });
    setSubmitting(false);

    if (ok) {
      setTitle("");
      setContent("");
      setImageUrl("");
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-amber-50/70 p-5 sm:p-6"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titlePlaceholder ?? `${entryLabel} 제목`}
          className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm shadow-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={contentPlaceholder ?? `${entryLabel} 내용을 적어보세요`}
          rows={3}
          className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm shadow-sm"
        />
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="사진 URL (선택)"
          className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm shadow-sm"
        />
        <button
          type="submit"
          disabled={submitting || !title.trim() || !content.trim()}
          className="self-start bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 disabled:opacity-50"
        >
          {submitting ? "저장 중..." : `✨ ${entryLabel} 추가하기`}
        </button>
      </form>

      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">⚠️ {error}</p>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm font-medium text-sky-600">⚙️ 기록을 불러오는 중...</p>
      ) : submissions.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-sky-200 bg-white/60 py-8 text-center text-sm text-slate-400">💡 아직 등록된 {entryLabel}이(가) 없습니다. 첫 기록을 남겨보세요!</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {submissions.map((s) => (
            <li key={s.id} className="idea-card p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{s.title}</h3>
                <button
                  onClick={() => removeSubmission(s.id)}
                  className="!min-h-0 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                  삭제
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{s.content}</p>
              {s.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  className="mt-3 max-h-48 w-full rounded-xl border border-sky-100 object-cover"
                />
              )}
              {s.feedback && (
                <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                  🧑‍🏫 선생님 피드백: {s.feedback}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {new Date(s.createdAt).toLocaleString("ko-KR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
