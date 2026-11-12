"use client";

import { useState } from "react";
import { useAiChat } from "@/lib/hooks/useAiChat";
import { PERSONAS, type PersonaKey } from "@/lib/personas";

/**
 * Chat widget for one AI persona. All data logic lives in useAiChat — this
 * component only renders it, so it can be restyled freely.
 */
export default function AiChat({ persona }: { persona: PersonaKey }) {
  const { messages, sending, sendMessage, clear } = useAiChat(persona);
  const [input, setInput] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  }

  return (
    <div className="maker-panel flex h-[32rem] flex-col overflow-hidden rounded-[2rem]">
      <div className="flex items-center justify-between border-b border-sky-100 bg-white/70 px-5 py-4">
        <h3 className="text-base font-black text-slate-900">{PERSONAS[persona].title}</h3>
        <button
          onClick={clear}
          title="대화 내용 지우기"
          className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          🗑️ 지우기
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                m.role === "user"
                  ? "bg-sky-600 text-white"
                  : "border border-sky-100 bg-white text-slate-700"
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {sending && (
          <p className="text-xs font-medium text-sky-500">⚙️ 생각 중이에요...</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-sky-100 bg-white/70 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={sending}
          className="flex-1 rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  );
}
