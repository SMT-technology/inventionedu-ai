/**
 * 단계별 AI 도우미(챗봇)가 들어갈 자리. API는 아직 연결하지 않았다 —
 * 어떤 모델을 쓸지, 질문 방식은 설계원리 확정 후 정한다.
 */
export default function AiHelperPlaceholder({ role }: { role: string }) {
  return (
    <section className="mt-6 rounded-2xl border-2 border-dashed border-sky-200 bg-white/70 p-6 text-center">
      <div className="mb-2 text-3xl" aria-hidden="true">💬</div>
      <p className="text-sm font-bold text-slate-700">AI 도우미 자리</p>
      <p className="mt-1 text-sm text-slate-500">{role}</p>
      <p className="mt-2 text-xs text-slate-400">아직 연결되지 않았어요.</p>
    </section>
  );
}
