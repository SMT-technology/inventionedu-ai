"use client";

import { useState } from "react";
import { MISSIONS } from "@/lib/missions";

/** 미션 탭 + Wokwi 가상 시뮬레이터 임베드 (Stage 3, 미리보기 실험실). */
export default function PracticeLab() {
  const [activeId, setActiveId] = useState(MISSIONS[0].id);
  const mission = MISSIONS.find((m) => m.id === activeId)!;

  return (
    <div className="maker-panel flex flex-col gap-4 rounded-[2rem] p-5">
      <div className="flex flex-wrap gap-2">
        {MISSIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveId(m.id)}
            className={`rounded-xl border px-3 py-2 text-sm font-bold ${
              m.id === activeId
                ? "border-sky-500 bg-sky-600 text-white"
                : "border-sky-100 bg-white text-slate-600 hover:border-sky-300"
            }`}
          >
            미션 {m.id}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4">
        <h4 className="font-black text-slate-900">{mission.title}</h4>
        <p className="mt-2 text-sm text-slate-600">🎯 목표: {mission.objective}</p>
        <p className="mt-1 text-sm text-slate-600">💡 힌트: {mission.hint}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-sky-100">
        <iframe
          key={mission.id}
          src={mission.wokwiUrl}
          width="100%"
          height="500"
          style={{ border: "none" }}
          title="Arduino Simulator"
          allow="autoplay; camera; microphone; serial"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
