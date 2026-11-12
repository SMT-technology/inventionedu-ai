/**
 * Maker's Tutor 3단계 정의 — 단계 번호·이름·안내 문구의 단일 출처.
 * 라우트(/stage/[stage]), 진도 API, 기록 API, 학생 네비게이션, 교사 화면이 모두 여기서 읽는다.
 *
 * 2026-11 컨셉 전환: 발명 문제해결 6단계 → "창의적 전자제품 만들기" 3단계.
 * persona는 이 단계에서 쓰는 AI 챗봇 페르소나 키 (lib/personas.ts 참고).
 */
export type StageMeta = {
  stage: number;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  persona: string;
  entryLabel: string;
  titlePlaceholder: string;
  contentPlaceholder: string;
};

export const STAGES: StageMeta[] = [
  {
    stage: 1,
    title: "센서 도서관",
    shortTitle: "센서 도서관",
    icon: "📚",
    description: "다양한 센서와 부품들을 알아봐요!",
    persona: "sensors",
    entryLabel: "배운 점",
    titlePlaceholder: "어떤 센서가 궁금했나요?",
    contentPlaceholder: "센서의 이름과 쓰임새를 적어 보세요.",
  },
  {
    stage: 2,
    title: "아이디어 톡",
    shortTitle: "아이디어 톡",
    icon: "💡",
    description: "그림과 말로 아이디어를 자유롭게 표현해보세요!",
    persona: "idea",
    entryLabel: "아이디어",
    titlePlaceholder: "어떤 아이디어인가요?",
    contentPlaceholder: "어떤 문제를 해결하고 싶은지, 어떤 센서를 쓰면 좋을지 적어 보세요.",
  },
  {
    stage: 3,
    title: "미리보기 실험실",
    shortTitle: "미리보기 실험실",
    icon: "🧪",
    description: "가상 시뮬레이터에서 안전하게 실험해봐요!",
    persona: "practice",
    entryLabel: "실험 기록",
    titlePlaceholder: "어떤 미션을 시도했나요?",
    contentPlaceholder: "회로 연결이나 코드에서 막힌 점, 해결한 방법을 적어 보세요.",
  },
];

export const STAGE_NUMBERS = STAGES.map((s) => s.stage);

export function getStage(stage: number): StageMeta | undefined {
  return STAGES.find((s) => s.stage === stage);
}

export function isValidStage(stage: number): boolean {
  return STAGE_NUMBERS.includes(stage);
}

export function stageHref(stage: number): string {
  return `/stage/${stage}`;
}
