/** 미리보기 실험실(Stage 3)에서 보여주는 실습 미션 목록. */
export type MissionMeta = {
  id: number;
  title: string;
  objective: string;
  hint: string;
  wokwiUrl: string;
};

export const MISSIONS: MissionMeta[] = [
  {
    id: 1,
    title: "기초 회로 맛보기 🔋",
    objective: "아두이노 없이 건전지, LED, 저항만 연결해서 불을 켜보세요! (+, - 연결 이해하기)",
    hint: "건전지의 (+)극과 LED의 긴 다리를 연결하고, LED의 짧은 다리와 저항을 거쳐 건전지의 (-)극으로 연결하세요.",
    wokwiUrl: "https://wokwi.com/projects/450645630910703617",
  },
  {
    id: 2,
    title: "아두이노 코딩 시작 💻",
    objective: "아두이노 13번 핀에 LED를 꽂고, 코드로 깜빡이게 제어해보세요.",
    hint: "digitalWrite(13, HIGH);와 delay() 함수를 사용하여 LED를 켜고 끄세요.",
    wokwiUrl: "https://wokwi.com/projects/450009305951296513",
  },
  {
    id: 3,
    title: "소리 만들기 🎵",
    objective: "피에조 부저를 연결해서 '도-레-미' 소리를 내보세요.",
    hint: "tone() 함수를 사용하여 주파수를 제어하세요. 도(262Hz), 레(294Hz), 미(330Hz)",
    wokwiUrl: "https://wokwi.com/projects/450645789905252353",
  },
];
