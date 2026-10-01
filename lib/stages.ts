/**
 * 발명 문제해결 6단계 정의 — 단계 번호·이름·안내 문구의 단일 출처.
 * 라우트(/stage/[stage]), 진도 API, 기록 API, AI 튜터, 교사 화면이 모두 여기서 읽는다.
 * 단계 이름은 2026-09-30 확정안 기준. 안내 문구는 뼈대용 초안이며 설계원리 확정 후 수정한다.
 */
export type StageMeta = {
  stage: number;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  /** 이 단계에서 AI 도우미가 맡을 역할 (아직 미연결, 화면 안내용) */
  aiRole: string;
  entryLabel: string;
  titlePlaceholder: string;
  contentPlaceholder: string;
};

export const STAGES: StageMeta[] = [
  {
    stage: 1,
    title: "문제 확인하기",
    shortTitle: "문제 확인",
    icon: "🔍",
    description: "생활 주변에서 불편하거나 개선하고 싶은 문제를 찾아요.",
    aiRole: "주변에서 문제를 찾도록 질문을 되돌려 주는 도우미",
    entryLabel: "발견한 문제",
    titlePlaceholder: "어떤 문제를 발견했나요?",
    contentPlaceholder: "언제, 어디서, 누가 불편을 겪는지 적어 보세요.",
  },
  {
    stage: 2,
    title: "정보 탐색하기",
    shortTitle: "정보 탐색",
    icon: "📚",
    description: "비슷한 발명이나 특허가 이미 있는지 찾아보고 정리해요.",
    aiRole: "특허 검색 결과를 함께 살펴보는 도우미",
    entryLabel: "찾은 정보",
    titlePlaceholder: "어떤 정보(특허, 제품)를 찾았나요?",
    contentPlaceholder: "찾은 내용과 내 문제와의 관련성을 적어 보세요.",
  },
  {
    stage: 3,
    title: "해결방안 탐색 및 선정하기",
    shortTitle: "해결방안 탐색·선정",
    icon: "💡",
    description: "아이디어를 넓게 떠올린 뒤, 기준을 세워 하나를 골라요.",
    aiRole: "확산적·수렴적 사고 기법을 안내하는 도우미",
    entryLabel: "아이디어",
    titlePlaceholder: "어떤 해결 아이디어인가요?",
    contentPlaceholder: "아이디어 내용과 고른 이유(또는 고르지 않은 이유)를 적어 보세요.",
  },
  {
    stage: 4,
    title: "해결방안 구체화하기",
    shortTitle: "구체화",
    icon: "✏️",
    description: "고른 아이디어를 설계도와 스케치로 구체화해요.",
    aiRole: "설계도·기초 스케치를 함께 다듬는 도우미",
    entryLabel: "설계 메모",
    titlePlaceholder: "무엇을 설계했나요?",
    contentPlaceholder: "크기, 재료, 구조, 작동 방식 등을 적어 보세요.",
  },
  {
    stage: 5,
    title: "실행하기",
    shortTitle: "실행",
    icon: "🛠️",
    description: "설계한 발명품을 직접 만들어요. 필요하면 HW 보드를 선택해요.",
    aiRole: "만들기·노코딩 HW·코딩 SW를 돕는 도우미",
    entryLabel: "제작 기록",
    titlePlaceholder: "오늘 무엇을 만들었나요?",
    contentPlaceholder: "만든 과정, 막힌 점, 해결한 방법을 적어 보세요.",
  },
  {
    stage: 6,
    title: "평가하기",
    shortTitle: "평가",
    icon: "✅",
    description: "처음 찾은 문제를 잘 해결했는지 돌아보고 평가해요.",
    aiRole: "자기평가와 성찰 질문을 건네는 도우미",
    entryLabel: "성찰",
    titlePlaceholder: "돌아보며 떠오른 점은?",
    contentPlaceholder: "1단계에서 찾은 문제를 해결했나요? 더 고칠 점은 무엇인가요?",
  },
];

export const STAGE_NUMBERS = STAGES.map((s) => s.stage);

/** 5단계(실행하기)에서만 HW 보드(아두이노/마이크로비트)를 고른다. */
export const BOARD_STAGE = 5;

export function getStage(stage: number): StageMeta | undefined {
  return STAGES.find((s) => s.stage === stage);
}

export function isValidStage(stage: number): boolean {
  return STAGE_NUMBERS.includes(stage);
}

export function stageHref(stage: number): string {
  return `/stage/${stage}`;
}
