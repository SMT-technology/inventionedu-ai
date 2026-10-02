"use client";

import { useState } from "react";

/** 반 전체 AI 대화 삭제(IRB 보관 기간이 끝났을 때). 되돌릴 수 없어서 반 이름을 직접 입력해야 한다. */
export default function DeleteClassChatsButton({ classId, name }: { classId: string; name: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    const typed = prompt(`반 전체 AI 대화를 지우면 되돌릴 수 없어요.\n지우려면 반 이름 "${name}"을 그대로 입력하세요.`);
    if (typed !== name) return;
    const params = new URLSearchParams({ classId, confirm: classId });
    const res = await fetch(`/api/teacher/chats?${params}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setMessage(res.ok ? `대화 ${data?.deleted ?? 0}개를 지웠어요.` : "삭제하지 못했어요.");
  }

  return (
    <span>
      <button onClick={handleClick} className="text-sm font-bold text-red-600 underline">
        반 전체 대화 삭제
      </button>
      {message && <span className="ml-2 text-xs text-slate-600">{message}</span>}
    </span>
  );
}
