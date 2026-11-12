"use client";

import { useCallback, useState } from "react";
import type { PersonaKey } from "@/lib/personas";
import { PERSONAS } from "@/lib/personas";

export type ChatMessage = { role: "user" | "model"; content: string };

/**
 * Data layer for one persona's chat (friend/sensors/idea/practice).
 * Kept separate from presentation (components/AiChat.tsx) so the UI can be
 * restyled without touching fetch/error/loading logic.
 */
export function useAiChat(persona: PersonaKey) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", content: PERSONAS[persona].welcomeMessage },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const history = messages;
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setSending(true);
      setError(null);

      try {
        const res = await fetch("/api/ai-tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ persona, message: trimmed, history }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
          const reason = data?.reason || data?.error || "응답을 받지 못했습니다.";
          setMessages((prev) => [...prev, { role: "model", content: `⚠️ ${reason}` }]);
          setError(reason);
          return;
        }

        setMessages((prev) => [...prev, { role: "model", content: data.reply ?? "(빈 응답)" }]);
      } catch (err) {
        const reason = err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.";
        setMessages((prev) => [...prev, { role: "model", content: `⚠️ ${reason}` }]);
        setError(reason);
      } finally {
        setSending(false);
      }
    },
    [messages, persona, sending]
  );

  const clear = useCallback(() => {
    setMessages([{ role: "model", content: PERSONAS[persona].welcomeMessage }]);
    setError(null);
  }, [persona]);

  return { messages, sending, error, sendMessage, clear };
}
