"use client";

import { useCallback, useEffect, useState } from "react";

export type ThreeDModelRecord = {
  id: string;
  prompt: string;
  status: string;
  resultUrl: string | null;
  taskId: string | null;
  createdAt: string;
};

/** Data layer for the 3D model lab — kept separate from presentation. */
export function useThreeDModels() {
  const [models, setModels] = useState<ThreeDModelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meshy");
      if (!res.ok) throw new Error("목록을 불러오지 못했습니다.");
      const data = await res.json();
      setModels(data.models ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const generate = useCallback(
    async (prompt: string) => {
      setError(null);
      setNotice(null);
      try {
        const res = await fetch("/api/meshy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json().catch(() => null);

        if (!data?.ok) {
          setNotice(data?.reason ?? data?.error ?? "아직 API 키가 연결되지 않았어요.");
        }
        await refresh();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
        return false;
      }
    },
    [refresh]
  );

  return { models, loading, error, notice, generate };
}
