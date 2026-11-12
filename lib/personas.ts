/**
 * AI 챗봇 페르소나 — 페이지별로 다른 역할의 챗봇을 제공한다.
 * "friend"는 어느 단계에도 속하지 않는 홈 화면 전용 페르소나이고,
 * 나머지는 lib/stages.ts의 StageMeta.persona 값과 짝지어진다.
 */
export type PersonaKey = "friend" | "sensors" | "idea" | "practice";

export type PersonaMeta = {
  title: string;
  welcomeMessage: string;
  /** lib/stagePrompts/ 아래 system prompt 파일명 */
  promptFile: string;
};

export const PERSONAS: Record<PersonaKey, PersonaMeta> = {
  friend: {
    title: "🍀 감성 케어 봇",
    welcomeMessage: "안녕! 메이커스 튜터에 온 걸 환영해. 😊 본격적으로 시작하기 전에, 오늘 네 기분은 좀 어때?",
    promptFile: "friend.md",
  },
  sensors: {
    title: "📚 센서 전문가",
    welcomeMessage: "안녕? 나는 센서 전문가란다. 12가지 센서나 다른 신기한 센서들에 대해 무엇이든 물어보렴!",
    promptFile: "stage1.md",
  },
  idea: {
    title: "💡 아이디어 뱅크",
    welcomeMessage: "반가워! 나는 아이디어 뱅크야. 센서들로 어떤 멋진 전자제품을 만들고 싶니?",
    promptFile: "stage2.md",
  },
  practice: {
    title: "🧪 아두이노 코딩 쌤",
    welcomeMessage: "어서 와, 여기는 실험실이야. 나는 코딩 선생님이고. 회로 연결이나 코드가 어려우면 언제든 물어봐!",
    promptFile: "stage3.md",
  },
};

export function isValidPersona(value: unknown): value is PersonaKey {
  return typeof value === "string" && value in PERSONAS;
}
