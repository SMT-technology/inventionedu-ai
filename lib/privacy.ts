/**
 * 학생이 대화에 적은 개인정보를 AI 회사로 보내거나 DB에 저장하기 전에 가린다.
 * 형식이 정해진 것(전화번호, 이메일, 주민등록번호)만 잡을 수 있고, 이름·학교 이름은
 * 규칙으로 가려낼 수 없어서 화면 안내(CHAT_PRIVACY_NOTICE)로 줄인다.
 */
export const CHAT_PRIVACY_NOTICE = "이름, 학교, 전화번호, 주소 같은 개인정보는 쓰지 마세요.";

const PATTERNS: [RegExp, string][] = [
  [/\b\d{6}\s*-\s*[1-4]\d{6}\b/g, "[주민번호]"],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[이메일]"],
  [/\b01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}\b/g, "[전화번호]"],
  [/\b0\d{1,2}[-.\s]\d{3,4}[-.\s]\d{4}\b/g, "[전화번호]"],
];

export function maskPersonalInfo(text: string) {
  return PATTERNS.reduce((acc, [pattern, label]) => acc.replace(pattern, label), text);
}
