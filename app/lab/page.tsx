import JointLab from "@/components/JointLab";

export const metadata = { title: "관절 실험실" };

/**
 * 로봇팔 프로젝트용 관절 실험실 데모 (2026-10-08).
 * 로그인 없이 열리는 시험용 페이지라 기록은 저장하지 않는다. 학생·교사 페이지 연결은 구성안 확정 후.
 */
export default function LabPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900">관절 실험실</h1>
        <p className="text-sm text-slate-600">
          SG90 서보 3개(받침 좌우 회전 · 팔 위아래 · 집게)로 만든 로봇팔을 화면에서 먼저 움직여 봐요.
        </p>
      </header>
      <JointLab />
    </main>
  );
}
