import { notFound } from "next/navigation";
import StagePageShell from "@/components/StagePageShell";
import SubmissionBoard from "@/components/SubmissionBoard";
import AiChat from "@/components/AiChat";
import SensorGrid from "@/components/SensorGrid";
import SketchCanvas from "@/components/SketchCanvas";
import PracticeLab from "@/components/PracticeLab";
import { getStage } from "@/lib/stages";
import type { PersonaKey } from "@/lib/personas";

export default async function StagePage({ params }: { params: { stage: string } }) {
  const meta = getStage(Number(params.stage));
  if (!meta) notFound();

  return (
    <StagePageShell stage={meta.stage}>
      {meta.stage === 1 ? (
        <div className="mt-6 flex flex-col gap-6">
          <SensorGrid />
          <AiChat persona={meta.persona as PersonaKey} />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {meta.stage === 2 ? <SketchCanvas stage={meta.stage} /> : <PracticeLab />}
          <AiChat persona={meta.persona as PersonaKey} />
        </div>
      )}

      <div className="mt-6">
        <SubmissionBoard
          stage={meta.stage}
          entryLabel={meta.entryLabel}
          titlePlaceholder={meta.titlePlaceholder}
          contentPlaceholder={meta.contentPlaceholder}
        />
      </div>
    </StagePageShell>
  );
}
