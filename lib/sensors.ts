/**
 * 센서 도서관(Stage 1)에서 보여주는 기본 12종 센서 카드 데이터.
 * 실제 사진 대신 이모지를 아이콘으로 쓴다 (에셋 파이프라인 없이 가볍게 유지하기 위한 선택 —
 * 나중에 실제 사진으로 바꾸려면 public/sensors/*.png 추가 후 img 필드를 교체하면 된다).
 */
export type SensorMeta = {
  id: string;
  name: string;
  icon: string;
  desc: string;
};

export const SENSORS: SensorMeta[] = [
  { id: "led", name: "LED", icon: "💡", desc: "전기에너지를 빛에너지로 변환하는 반도체. 긴 다리가 (+), 짧은 다리가 (-)극." },
  { id: "button", name: "버튼", icon: "🔘", desc: "누르고 있을 때만 전기가 흐르고 손을 떼면 끊어지는 스위치. 키보드나 게임기 컨트롤러에 사용." },
  { id: "cds", name: "조도센서", icon: "🌗", desc: "빛의 밝기에 따라 저항값이 변하는 센서. 어두워지면 가로등을 켜는 원리에 사용." },
  { id: "ultrasonic", name: "초음파센서", icon: "📡", desc: "초음파를 발사한 뒤 돌아오는 시간을 계산해서 거리를 측정. 자동차 후방 감지기에 사용." },
  { id: "servo", name: "서보모터", icon: "🦾", desc: "입력한 신호에 따라 0도~180도 사이의 정확한 각도로 움직이는 모터. 로봇 관절에 사용." },
  { id: "dc_motor", name: "DC모터", icon: "⚙️", desc: "전기를 흘려주면 계속 회전하는 모터. 바퀴나 프로펠러를 돌릴 때 사용." },
  { id: "buzzer", name: "피에조부저", icon: "🔊", desc: "전기 신호를 소리로 바꿔주는 부품. 주파수를 바꾸면 다른 음을 낼 수 있음." },
  { id: "potentiometer", name: "가변저항", icon: "🎚️", desc: "손잡이를 돌려 저항값을 바꾸는 부품. 볼륨 조절이나 밝기 조절에 사용." },
  { id: "tilt", name: "틸트센서", icon: "⚖️", desc: "기울어짐을 감지하는 센서. 흔들리거나 기울면 전기가 통하거나 끊김." },
  { id: "ir", name: "적외선센서", icon: "👁️", desc: "눈에 안 보이는 적외선으로 물체나 장애물을 감지하는 센서." },
  { id: "slide_switch", name: "슬라이드 스위치", icon: "🎛️", desc: "좌우로 밀어서 전원을 켜고 끄는 스위치." },
  { id: "resistor", name: "저항", icon: "➰", desc: "전류의 흐름을 제한하는 부품. LED가 너무 밝거나 타버리지 않게 보호해줌." },
];
