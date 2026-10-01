/**
 * 단계별 AI 도우미(챗봇)가 들어갈 자리. API는 아직 연결하지 않았다 —
 * 어떤 모델을 쓸지, 질문 방식은 설계원리 확정 후 정한다.
 */
export default function AiHelperPlaceholder({ role }: { role: string }) {
  return (
    <section className="mt-6 rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-6 text-center sm:p-8">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm" aria-hidden="true">💬</div>
      <p className="text-base font-black text-slate-800">AI 도우미 자리</p>
      <p className="mt-2 text-sm text-slate-600">{role}</p>
      <p className="mt-3 inline-flex rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-semibold text-slate-500">챗봇이 들어올 예정이에요</p>
    </section>
  );
}
