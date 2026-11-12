"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const COLORS = [
  { label: "검정", value: "#0f172a" },
  { label: "파랑", value: "#0284c7" },
  { label: "빨강", value: "#dc2626" },
];

/**
 * 스케치북 캔버스 (Stage 2, 아이디어 톡). 그림을 그려서 저장하면 Submission으로
 * 기록된다 (imageUrl에 캔버스 dataURL을 그대로 저장 — 에셋 스토리지 없이 가볍게 유지).
 */
export default function SketchCanvas({ stage }: { stage: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState(COLORS[0].value);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function getContext() {
    const canvas = canvasRef.current;
    return canvas?.getContext("2d") ?? null;
  }

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = getContext();
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = tool === "eraser" ? 24 : 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function handleClear() {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  async function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!title.trim()) {
      setError("아이디어 제목을 먼저 적어주세요.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const imageUrl = canvas.toDataURL("image/png");
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, title, content: "스케치로 표현한 아이디어", imageUrl }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "저장에 실패했습니다.");
      }
      setSaved(true);
      setTitle("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="maker-panel flex flex-col gap-3 rounded-[2rem] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500">펜 색상:</span>
        {COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setTool("pen");
              setColor(c.value);
            }}
            title={c.label}
            className={`h-7 w-7 rounded-full border-2 ${
              tool === "pen" && color === c.value ? "border-sky-500" : "border-white"
            }`}
            style={{ backgroundColor: c.value }}
          />
        ))}
        <button
          onClick={() => setTool("eraser")}
          className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
            tool === "eraser" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600"
          }`}
        >
          🧹 지우개
        </button>
        <button onClick={handleClear} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">
          🗑️ 모두 지우기
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded-2xl border border-sky-100 bg-white"
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="이 아이디어 이름을 지어주세요"
          className="min-w-[12rem] flex-1 rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? "저장 중..." : "💾 아이디어 저장"}
        </button>
      </div>
      {error && <p className="text-sm font-medium text-red-600">⚠️ {error}</p>}
      {saved && <p className="text-sm font-medium text-emerald-600">✅ 저장했어요!</p>}
    </div>
  );
}
