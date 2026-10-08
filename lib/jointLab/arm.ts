/**
 * 관절 실험실(3축 로봇팔) 계산 모음. 화면과 분리해 두어 시뮬레이터 동작을 한곳에서 관리한다.
 *
 * 수업 로봇팔 구조 (2026-10-08 교사 인터뷰):
 *   서보 1 = 받침 좌우 회전, 서보 2 = 팔 위아래 회전, 서보 3 = 집게. 모두 SG90(0~180°).
 * 좌표: x = 오른쪽, y = 앞쪽, z = 위쪽 (단위 cm). 받침 회전축은 원점을 지나는 z축.
 */

export type ArmAngles = {
  /** 받침 서보 각도(0~180). 90°가 정면 */
  base: number;
  /** 팔 서보 각도(0~180). 0°가 앞쪽 수평, 90°가 수직 위, 180°가 뒤쪽 수평 */
  lift: number;
  /** 집게 서보 각도(0~180). 0°가 닫힘 */
  grip: number;
};

export type ArmShape = {
  /** 받침 위 팔 관절까지 높이 */
  height: number;
  /** 팔 관절에서 집게 끝까지 길이 */
  armLength: number;
};

export type Vec3 = { x: number; y: number; z: number };

export const SERVO_MIN = 0;
export const SERVO_MAX = 180;
/** 수업에서 서보를 초기화할 때 쓰는 각도. 혼은 이 상태에서 끼운다고 가정 */
export const SERVO_HOME = 90;
/** 집게 서보 180°일 때 집게 한쪽이 벌어지는 각도 */
export const GRIP_MAX_OPEN = 40;

const rad = (deg: number) => (deg * Math.PI) / 180;

export function clampServo(v: number) {
  return Math.min(SERVO_MAX, Math.max(SERVO_MIN, v));
}

/** 받침이 향하는 방향(수평면에서 정면 기준 오른쪽이 +). 서보 90°가 정면 */
export function baseHeading(base: number) {
  return rad(base - 90);
}

/** 팔이 수평면에서 들린 각도(앞쪽 기준). 서보 0°=앞 수평, 90°=위 */
export function liftElevation(lift: number) {
  return rad(lift);
}

/** 팔 관절 위치 (받침 회전과 무관하게 항상 받침 위) */
export function shoulderPoint(shape: ArmShape): Vec3 {
  return { x: 0, y: 0, z: shape.height };
}

/** 집게 끝 위치. 받침 회전이 팔 방향 전체를 함께 돌린다 (관절 연쇄) */
export function tipPoint(a: ArmAngles, shape: ArmShape): Vec3 {
  const h = baseHeading(a.base);
  const e = liftElevation(a.lift);
  const horizontal = shape.armLength * Math.cos(e);
  return {
    x: horizontal * Math.sin(h),
    y: horizontal * Math.cos(h),
    z: shape.height + shape.armLength * Math.sin(e),
  };
}

/**
 * 팔 관절의 회전축 방향(수평, 팔 방향과 수직). 받침이 돌면 이 축도 같이 돈다.
 * 학생들이 가장 헷갈려하는 "받침이 위 관절에 영향을 준다"를 보여 주는 값.
 */
export function liftAxis(a: ArmAngles): Vec3 {
  const h = baseHeading(a.base);
  return { x: Math.cos(h), y: -Math.sin(h), z: 0 };
}

/** 집게 한쪽이 벌어진 각도(도) */
export function gripOpening(grip: number) {
  return (clampServo(grip) / SERVO_MAX) * GRIP_MAX_OPEN;
}

export function distance(p: Vec3, q: Vec3) {
  return Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
}

/** 집게 끝이 닿을 수 있는 목표인지 (팔 관절에서 거리가 팔 길이와 같아야 함) */
export function isReachable(target: Vec3, shape: ArmShape, tolerance = 0.6) {
  return Math.abs(distance(target, shoulderPoint(shape)) - shape.armLength) <= tolerance;
}

/** 목표 문제 만들기: 정수 각도에서 고른 점이라 학생이 슬라이더로 정확히 맞출 수 있다 */
export function makeTarget(shape: ArmShape, seed: number): { target: Vec3; answer: ArmAngles } {
  const rnd = mulberry32(seed);
  const answer: ArmAngles = {
    base: 30 + Math.round(rnd() * 120),
    lift: 10 + Math.round(rnd() * 70),
    grip: 0,
  };
  return { target: tipPoint(answer, shape), answer };
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 서보 배치 ---------- */

/** 막대를 서보의 어느 쪽에 붙였는지 */
export type MountMode = "body-fixed" | "horn-fixed";

/**
 * 서보 각도와 혼을 끼운 방향으로 막대가 실제로 가리키는 각도(도)를 구한다.
 * hornOffset: 서보가 초기화 각도(90°)일 때 혼이 가리키는 방향. 0이면 혼이 막대 방향과 일치.
 * - body-fixed: 서보 몸통이 고정 막대에 붙고 혼에 움직이는 막대가 붙음 → 혼 쪽이 돈다
 * - horn-fixed: 혼이 고정 막대에 붙고 몸통에 움직이는 막대가 붙음 → 몸통 쪽이 반대로 돈다
 */
export function mountedLinkAngle(servo: number, hornOffset: number, mode: MountMode) {
  const turn = clampServo(servo) - SERVO_HOME;
  return mode === "body-fixed" ? hornOffset + turn : hornOffset - turn;
}

/* ---------- 센서 → 각도 ---------- */

export type MapRange = { fromLow: number; fromHigh: number; toLow: number; toHigh: number };

/**
 * 마이크로비트 메이크코드 "매핑(map)" 블록과 같은 계산.
 * 메이크코드처럼 결과를 자르지 않으므로, 서보에 보낼 때는 clampServo로 0~180에 맞춘다.
 */
export function mapValue(value: number, r: MapRange) {
  if (r.fromHigh === r.fromLow) return r.toLow;
  return ((value - r.fromLow) * (r.toHigh - r.toLow)) / (r.fromHigh - r.fromLow) + r.toLow;
}

/**
 * 기울인 각도(도)를 가속도 센서 값(mg)으로 바꾼다. 평평하면 0, 90° 기울이면 약 1024.
 * 실제 센서는 흔들림·잡음이 있어 값이 조금씩 달라진다는 점은 수업에서 따로 다룬다.
 */
export function tiltToAcceleration(tiltDeg: number) {
  return Math.round(1024 * Math.sin(rad(tiltDeg)));
}
