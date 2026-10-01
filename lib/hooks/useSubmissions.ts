"use client";

import { useCallback, useEffect, useState } from "react";

export type Submission = {
  id: string;
  userId: string;
  stage: number;
  title: string;
  content: string;
  imageUrl: string | null;
  feedback: string | null;
  createdAt: string;
};

/**
 * Data layer for each stage's record cards (SubmissionBoard).
 * Kept separate from presentation so the UI can be restyled without touching
 * fetch/error/loading logic.
 */
export function useSubmissions(stage: number) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions?stage=${stage}`);
      if (!res.ok) throw new Error("목록을 불러오지 못했습니다.");
      const data = await res.json();
      setSubmissions(data.submissions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [stage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSubmission = useCallback(
    async (input: { title: string; content: string; imageUrl?: string }) => {
      try {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage, ...input }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "저장에 실패했습니다.");
        }
        await refresh();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
        return false;
      }
    },
    [stage, refresh]
  );

  const removeSubmission = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/submissions?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "삭제에 실패했습니다.");
      }
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
      return false;
    }
  }, []);

  return { submissions, loading, error, addSubmission, removeSubmission, refresh };
}
