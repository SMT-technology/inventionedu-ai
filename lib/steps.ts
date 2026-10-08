/**
 * 로봇팔 프로젝트 학생 페이지(활동 단계) 정의 — 번호·이름·안내 문구의 단일 출처.
 * 학생 화면, 진도 API, 교사 진도표가 모두 여기서 읽는다.
 * 구성 근거: 2026-10-08 교사 인터뷰 → 로봇팔_웹앱_페이지구성_v1.md 2절.
 * ready=false 인 단계는 화면만 있고 기능은 아직 없다.
 */
export type StepMeta = {
  step: number;
  slug: string;
  title: string;
  /** 이 단계가 돕는 학생 어려움 */
  problem: string;
  description: string;
  /** 확장 단계(시간·개발 여건에 따라 뺄 수 있음) */
  optional?: boolean;
  ready: boolean;
};

export const STEPS: StepMeta[] = [
  {
    step: 1,
    slug: "concept",
    title: "디자인 컨셉",
    problem: "로봇팔 전체 모양과 디자인 컨셉을 떠올리기 어려움",
    description: "어떤 로봇팔을 만들지 컨셉을 정하고, 나무 스틱과 서보 3개로 만들 수 있는지 짝과 판단해요.",
    ready: false,
  },
  {
    step: 2,
    slug: "lab",
    title: "관절 실험실",
    problem: "서보 각도 방향, 혼 장착, 관절 연쇄, 링크 길이를 머릿속으로 그리기 어려움",
    description: "받침 · 팔 · 집게 관절을 화면에서 먼저 움직여 보고 설계를 정해요.",
    ready: true,
  },
  {
    step: 3,
    slug: "sensor",
    title: "센서와 각도",
    problem: "마이크로비트 기울기 값과 서보 각도를 연결하는 원리 이해가 어려움",
    description: "기울기 → 센서 값 → 매핑 → 서보 각도를 예측하고 확인해요.",
    ready: true,
  },
  {
    step: 4,
    slug: "coding",
    title: "코딩 도우미",
    problem: "메이크코드 블록으로 조종 코드를 만들기 어려움",
    description: "AI와 함께 블록 코드를 만들고, 시뮬레이터에서 먼저 돌려 보며 확인해요.",
    ready: false,
  },
  {
    step: 5,
    slug: "control",
    title: "실물 조종 미션",
    problem: "시뮬레이션과 실제 로봇팔의 차이",
    description: "마이크로비트를 기울여 실제 로봇팔로 미션을 풀고, 예측과 실제를 비교해요.",
    ready: false,
  },
  {
    step: 6,
    slug: "motion",
    title: "모션 조종",
    problem: "AI가 동작을 인식하는 원리",
    description: "Teachable Machine으로 자세를 학습시키고 자세마다 관절 각도를 짝지어요.",
    optional: true,
    ready: false,
  },
  {
    step: 7,
    slug: "reflect",
    title: "돌아보기",
    problem: "",
    description: "처음 컨셉과 완성품을 비교하고, 어려웠던 점과 해결 방법을 남겨요.",
    ready: false,
  },
];

export const STEP_NUMBERS = STEPS.map((s) => s.step);

export function getStepBySlug(slug: string) {
  return STEPS.find((s) => s.slug === slug);
}

export function stepHref(slug: string) {
  return `/learn/${slug}`;
}
