import { notFound } from "next/navigation";
import StagePageShell from "@/components/StagePageShell";
import SubmissionBoard from "@/components/SubmissionBoard";
import AiHelperPlaceholder from "@/components/AiHelperPlaceholder";
import BoardSelector from "@/components/BoardSelector";
import arduinoProfile from "@/board-profiles/arduino-uno.json";
import microbitProfile from "@/board-profiles/microbit.json";
import type { BoardProfile } from "@/lib/boardContext";
import { getCurrentUser } from "@/lib/session";
import { BOARD_STAGE, getStage } from "@/lib/stages";

export default async function StagePage({ params }: { params: { stage: string } }) {
  const meta = getStage(Number(params.stage));
  if (!meta) notFound();

  const user = await getCurrentUser();
  const profiles: BoardProfile[] = [arduinoProfile, microbitProfile as unknown as BoardProfile];

  return (
    <StagePageShell stage={meta.stage}>
      {meta.stage === BOARD_STAGE && (
        <section className="mt-8">
          <h3 className="mb-4 text-lg font-black text-slate-800">HW 보드 선택 (필요한 경우)</h3>
          <BoardSelector profiles={profiles} currentBoardType={user?.boardType ?? null} />
        </section>
      )}
      <AiHelperPlaceholder role={meta.aiRole} />
      <SubmissionBoard
        stage={meta.stage}
        entryLabel={meta.entryLabel}
        titlePlaceholder={meta.titlePlaceholder}
        contentPlaceholder={meta.contentPlaceholder}
      />
    </StagePageShell>
  );
}
