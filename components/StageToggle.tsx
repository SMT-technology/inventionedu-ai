"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ORDER = ["not_started", "in_progress", "done"] as const;
type Status = (typeof ORDER)[number];

const LABEL: Record<Status, string> = {
  not_started: "미시작",
  in_progress: "진행중",
  done: "완료",
};

const STYLE: Record<Status, string> = {
  not_started: "border border-slate-200 bg-slate-100 text-slate-700",
  in_progress: "border border-amber-200 bg-amber-100 text-amber-900",
  done: "border border-emerald-200 bg-emerald-100 text-emerald-900",
};

export default function StageToggle({
  stage,
  initialStatus,
}: {
  stage: number;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>((initialStatus as Status) ?? "not_started");
  const [saving, setSaving] = useState(false);

  async function handleClick() {
    const next = ORDER[(ORDER.indexOf(status) + 1) % ORDER.length];
    setSaving(true);
    setStatus(next);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, status: next }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={saving}
      className={`px-4 py-2.5 text-sm font-bold shadow-sm transition disabled:opacity-50 ${STYLE[status]}`}
    >
      {LABEL[status]} · 클릭하여 변경
    </button>
  );
}
