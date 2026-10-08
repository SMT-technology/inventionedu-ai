"use client";

/**
 * 관절 실험실: 3축 로봇팔(받침 좌우 회전 · 팔 위아래 · 집게) 시뮬레이터.
 * 계산은 lib/jointLab/arm.ts, 이 파일은 그리기와 조작만 담당한다.
 * 화면 꾸미기(className, 배치)는 코덱스가 다듬을 예정이라 기본 뼈대만 둔다.
 * 원칙: 시뮬레이터는 결과를 보여 주기만 하고, 맞는지 판단은 학생이 한다 (2026-10-08 교사 인터뷰).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type ArmAngles,
  type ArmShape,
  type MountMode,
  type Vec3,
  SERVO_HOME,
  baseHeading,
  clampServo,
  distance,
  gripOpening,
  liftAxis,
  makeTarget,
  mapValue,
  mountedLinkAngle,
  shoulderPoint,
  tiltToAcceleration,
  tipPoint,
} from "@/lib/jointLab/arm";

export type TabKey = "direction" | "mount" | "chain" | "sensor";

const TABS: { key: TabKey; label: string; question: string }[] = [
  { key: "direction", label: "각도와 방향", question: "0°, 90°, 180°일 때 혼은 어느 쪽을 가리킬까?" },
  { key: "mount", label: "서보 배치", question: "막대를 서보 몸통에 붙일까, 혼에 붙일까? 혼은 어느 방향으로 끼울까?" },
  { key: "chain", label: "관절 연쇄", question: "받침을 돌리면 위 관절과 집게는 어떻게 될까?" },
  { key: "sensor", label: "센서와 각도", question: "마이크로비트를 기울이면 서보는 몇 도가 될까?" },
];

const COLORS = {
  grid: "#e2e8f0",
  ink: "#0f172a",
  muted: "#64748b",
  stick: "#b45309",
  servo: "#2563eb",
  horn: "#f8fafc",
  baseAxis: "#16a34a",
  liftAxis: "#db2777",
  gripAxis: "#7c3aed",
  target: "#dc2626",
};

/** tabs: 보여 줄 탭 (관절 실험실은 앞의 3개, 센서와 각도 단계는 sensor 하나) */
export default function JointLab({ tabs = ["direction", "mount", "chain", "sensor"] }: { tabs?: TabKey[] }) {
  const visible = TABS.filter((t) => tabs.includes(t.key));
  const [tab, setTab] = useState<TabKey>(visible[0].key);
  const current = visible.find((t) => t.key === tab) ?? visible[0];

  return (
    <div className="space-y-4">
      {visible.length > 1 && (
      <div role="tablist" className="flex flex-wrap gap-2">
        {visible.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`border px-4 py-2 text-sm font-bold ${tab === t.key ? "border-sky-500 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-600"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      )}
      <p className="text-sm font-semibold text-slate-700">생각해 보기: {current.question}</p>
      {current.key === "direction" && <DirectionTab />}
      {current.key === "mount" && <MountTab />}
      {current.key === "chain" && <ChainTab />}
      {current.key === "sensor" && <SensorTab />}
    </div>
  );
}

/* ---------- 공용 ---------- */

function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    draw(ctx, c.width, c.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

function Slider(props: { id: string; label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <label htmlFor={props.id} className="block text-sm">
      <span className="flex justify-between font-semibold text-slate-700">
        {props.label}
        <span className="tabular-nums text-slate-500">
          {props.value}
          {props.unit ?? "°"}
        </span>
      </span>
      <input
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_280px]">{children}</div>;
}

const canvasClass = "w-full rounded-2xl border border-slate-100 bg-slate-50";

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, w: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = COLORS.muted) {
  ctx.fillStyle = color;
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(text, x, y);
}

function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  line(ctx, x1, y1, x2, y2, 3, color);
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 10 * Math.cos(a - 0.4), y2 - 10 * Math.sin(a - 0.4));
  ctx.lineTo(x2 - 10 * Math.cos(a + 0.4), y2 - 10 * Math.sin(a + 0.4));
  ctx.fill();
}

/** SG90을 위에서 본 모습. angleDeg는 혼(막대)이 가리키는 화면 각도(0 = 오른쪽, 반시계 +) */
function drawServo(ctx: CanvasRenderingContext2D, cx: number, cy: number, bodyAngle: number, hornAngle: number, hornLen = 70) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-bodyAngle);
  ctx.fillStyle = COLORS.servo;
  ctx.fillRect(-28, -18, 80, 36); // 몸통 (축이 한쪽에 치우쳐 있음)
  ctx.fillRect(-40, -6, 104, 12); // 고정 날개
  ctx.restore();
  const hx = cx + hornLen * Math.cos(hornAngle);
  const hy = cy - hornLen * Math.sin(hornAngle);
  line(ctx, cx, cy, hx, hy, 12, COLORS.horn);
  line(ctx, cx, cy, hx, hy, 2, COLORS.ink);
  dot(ctx, cx, cy, 8, COLORS.ink);
}

/* ---------- 탭 1: 각도와 방향 ---------- */

function DirectionTab() {
  const [angle, setAngle] = useState(SERVO_HOME);
  const ref = useCanvas(
    (ctx, w, h) => {
      const cx = w / 2;
      const cy = h * 0.62;
      // 0~180 눈금
      for (let d = 0; d <= 180; d += 30) {
        const r = d === 0 || d === 90 || d === 180 ? 128 : 118;
        const a = (d * Math.PI) / 180;
        line(ctx, cx + 110 * Math.cos(a), cy - 110 * Math.sin(a), cx + r * Math.cos(a), cy - r * Math.sin(a), 2, COLORS.muted);
        label(ctx, `${d}°`, cx + 145 * Math.cos(a) - 14, cy - 145 * Math.sin(a) + 5);
      }
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, Math.PI, 0);
      ctx.stroke();
      drawServo(ctx, cx, cy, Math.PI, (angle * Math.PI) / 180, 95);
      label(ctx, "서보를 위에서 본 모습 (전선은 왼쪽)", 16, 24);
    },
    [angle],
  );
  return (
    <Panel>
      <canvas ref={ref} width={640} height={420} className={canvasClass} aria-label="서보 각도와 혼 방향" />
      <div className="space-y-4">
        <Slider id="dir-angle" label="서보 각도" value={angle} min={0} max={180} onChange={setAngle} />
        <div className="flex flex-wrap gap-2">
          {[0, 90, 180].map((v) => (
            <button key={v} onClick={() => setAngle(v)} className="border border-slate-200 bg-white px-3 py-1 text-sm">
              {v}°
            </button>
          ))}
          <button onClick={() => setAngle(SERVO_HOME)} className="border border-slate-200 bg-white px-3 py-1 text-sm">
            초기화 ({SERVO_HOME}°)
          </button>
        </div>
        <p className="text-sm text-slate-600">
          서보는 0°에서 180°까지 반 바퀴만 돌아요. 초기화하면 가운데인 {SERVO_HOME}°로 가요. 이 상태에서 혼을 끼워야 양쪽으로 똑같이 90°씩 움직일 수 있어요.
        </p>
        <p className="text-xs text-slate-500">
          실제 SG90은 제품마다 0°와 180°의 위치가 조금씩 달라요. 화면은 대표적인 방향을 보여 주는 거라, 우리 서보도 같은지 직접 돌려 보고 확인해요.
        </p>
      </div>
    </Panel>
  );
}

/* ---------- 탭 2: 서보 배치 ---------- */

function MountTab() {
  const [mode, setMode] = useState<MountMode>("body-fixed");
  const [hornOffset, setHornOffset] = useState(0);
  const [servo, setServo] = useState(SERVO_HOME);
  const linkAngle = mountedLinkAngle(servo, hornOffset, mode);

  const ref = useCanvas(
    (ctx, w, h) => {
      const cx = w / 2;
      const cy = h / 2 + 30;
      const toScreen = (deg: number) => ((deg + 90) * Math.PI) / 180; // 0° = 화면 위쪽
      // 고정 막대 (아래쪽 나무 스틱)
      line(ctx, cx, cy, cx, cy + 150, 18, COLORS.stick);
      label(ctx, "고정된 막대", cx + 18, cy + 140);
      if (mode === "body-fixed") {
        // 몸통이 고정 막대에 붙고, 혼이 돈다
        drawServo(ctx, cx, cy, -Math.PI / 2, toScreen(linkAngle), 0);
        const a = toScreen(linkAngle);
        line(ctx, cx, cy, cx + 160 * Math.cos(a), cy - 160 * Math.sin(a), 18, COLORS.stick);
        label(ctx, "혼에 붙은 막대 (움직임)", cx + 170 * Math.cos(a) - 60, cy - 170 * Math.sin(a));
      } else {
        // 혼이 고정 막대에 붙고, 서보 몸통과 거기 붙은 막대가 돈다
        const a = toScreen(linkAngle);
        drawServo(ctx, cx, cy, a, toScreen(180), 0);
        line(ctx, cx, cy, cx + 160 * Math.cos(a), cy - 160 * Math.sin(a), 18, COLORS.stick);
        label(ctx, "몸통에 붙은 막대 (움직임)", cx + 170 * Math.cos(a) - 60, cy - 170 * Math.sin(a));
      }
      dot(ctx, cx, cy, 8, COLORS.ink);
      // 원하는 방향(위쪽) 표시
      ctx.setLineDash([6, 6]);
      line(ctx, cx, cy, cx, cy - 190, 2, COLORS.muted);
      ctx.setLineDash([]);
      label(ctx, "똑바로 위", cx + 8, cy - 180);
      label(ctx, `움직이는 막대 방향: 위에서 ${Math.round(linkAngle)}° ${linkAngle >= 0 ? "왼쪽" : "오른쪽"}`, 16, 24, COLORS.ink);
    },
    [mode, hornOffset, servo],
  );

  return (
    <Panel>
      <canvas ref={ref} width={640} height={460} className={canvasClass} aria-label="서보 배치와 움직이는 쪽" />
      <div className="space-y-4">
        <fieldset className="space-y-1 text-sm">
          <legend className="font-semibold text-slate-700">막대를 어디에 붙였나요?</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="mount" checked={mode === "body-fixed"} onChange={() => setMode("body-fixed")} />
            서보 몸통은 고정 막대에, 움직일 막대는 혼에
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="mount" checked={mode === "horn-fixed"} onChange={() => setMode("horn-fixed")} />
            혼은 고정 막대에, 움직일 막대는 서보 몸통에
          </label>
        </fieldset>
        <Slider id="mount-offset" label={`초기화(${SERVO_HOME}°) 상태에서 혼을 끼운 방향`} value={hornOffset} min={-90} max={90} onChange={setHornOffset} />
        <Slider id="mount-servo" label="서보 각도" value={servo} min={0} max={180} onChange={setServo} />
        <p className="text-sm text-slate-600">
          두 방법 모두 막대는 움직여요. 하지만 몸통에 붙이면 몸통 전체가 돌기 때문에 도는 방향이 반대가 되고, 전선도 같이 움직여요. 혼을 비뚤게 끼우면 서보를 {SERVO_HOME}°로 맞춰도 막대가 똑바로 서지 않아요.
        </p>
      </div>
    </Panel>
  );
}

/* ---------- 탭 3: 관절 연쇄 ---------- */

function ChainTab() {
  const [angles, setAngles] = useState<ArmAngles>({ base: SERVO_HOME, lift: 45, grip: 60 });
  const [shape, setShape] = useState<ArmShape>({ height: 6, armLength: 14 });
  const [seed, setSeed] = useState(1);
  const [predict, setPredict] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [tries, setTries] = useState(0);
  const mission = useMemo(() => makeTarget(shape, seed), [shape, seed]);
  const tip = tipPoint(angles, shape);
  const gap = distance(tip, mission.target);
  const showArm = !predict || revealed;

  const set = (k: keyof ArmAngles) => (v: number) => {
    setAngles((a) => ({ ...a, [k]: clampServo(v) }));
    setRevealed(false);
  };

  const top = useCanvas(
    (ctx, w, h) => drawTopView(ctx, w, h, angles, shape, mission.target, showArm),
    [angles, shape, mission, showArm],
  );
  const side = useCanvas(
    (ctx, w, h) => drawFrontView(ctx, w, h, angles, shape, mission.target, showArm),
    [angles, shape, mission, showArm],
  );

  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        <canvas ref={top} width={420} height={420} className={canvasClass} aria-label="위에서 본 로봇팔" />
        <canvas ref={side} width={420} height={420} className={canvasClass} aria-label="앞에서 본 로봇팔" />
        <p className="text-xs text-slate-500 sm:col-span-2">
          초록 = 받침 회전축, 분홍 = 팔 회전축, 보라 = 집게. 받침을 돌리면 분홍 축과 집게도 같이 돌아가는지 위에서 본 화면으로 확인해요.
        </p>
      </div>
      <div className="space-y-4">
        <Slider id="chain-base" label="① 받침 (좌우 회전)" value={angles.base} min={0} max={180} onChange={set("base")} />
        <Slider id="chain-lift" label="② 팔 (위아래 회전)" value={angles.lift} min={0} max={180} onChange={set("lift")} />
        <Slider id="chain-grip" label="③ 집게 (열기)" value={angles.grip} min={0} max={180} onChange={set("grip")} />
        <Slider id="chain-len" label="팔 길이" unit=" cm" value={shape.armLength} min={6} max={20} onChange={(v) => setShape((s) => ({ ...s, armLength: v }))} />
        <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
          <p className="font-semibold text-slate-700">미션: 빨간 점에 집게 끝을 맞춰요</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={predict}
              onChange={(e) => {
                setPredict(e.target.checked);
                setRevealed(false);
              }}
            />
            예측 모드 (팔을 숨기고 각도만 정하기)
          </label>
          {predict && !revealed && (
            <button
              onClick={() => {
                setRevealed(true);
                setTries((t) => t + 1);
              }}
              className="border border-slate-200 bg-white px-3 py-1"
            >
              확인하기
            </button>
          )}
          {showArm && <p className="tabular-nums text-slate-600">집게 끝과 빨간 점 사이: {gap.toFixed(1)} cm</p>}
          {predict && <p className="text-xs text-slate-500">확인한 횟수 {tries}회</p>}
          <button
            onClick={() => {
              setSeed((s) => s + 1);
              setRevealed(false);
              setTries(0);
            }}
            className="border border-slate-200 bg-white px-3 py-1"
          >
            다른 목표
          </button>
          <p className="text-xs text-slate-500">맞았는지는 숫자와 화면을 보고 짝과 함께 판단해요.</p>
        </div>
      </div>
    </Panel>
  );
}

const SCALE = 9; // 1 cm = 9 px

/** 위에서 본 화면: 받침 회전이 팔 방향과 팔 회전축을 함께 돌린다 */
function drawTopView(ctx: CanvasRenderingContext2D, w: number, h: number, a: ArmAngles, s: ArmShape, target: Vec3, showArm: boolean) {
  const cx = w / 2;
  const cy = h / 2 + 40;
  const P = (p: Vec3) => [cx + p.x * SCALE, cy - p.y * SCALE] as const;
  label(ctx, "위에서 본 모습 (위쪽 = 앞)", 12, 22);
  // 닿는 범위 (수평 거리 최대 = 팔 길이)
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, s.armLength * SCALE, 0, Math.PI * 2);
  ctx.stroke();
  const [tx, ty] = P(target);
  dot(ctx, tx, ty, 7, COLORS.target);
  dot(ctx, cx, cy, 16, COLORS.servo);
  ctx.strokeStyle = COLORS.baseAxis;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, Math.PI * 2);
  ctx.stroke();
  if (!showArm) return;
  const tip = tipPoint(a, s);
  const [px, py] = P(tip);
  line(ctx, cx, cy, px, py, 12, COLORS.stick);
  // 팔 회전축: 받침과 함께 돈다
  const ax = liftAxis(a);
  arrow(ctx, cx - ax.x * 45, cy + ax.y * 45, cx + ax.x * 45, cy - ax.y * 45, COLORS.liftAxis);
  // 집게: 팔 방향 기준으로 좌우로 벌어짐
  const hd = baseHeading(a.base);
  const open = (gripOpening(a.grip) * Math.PI) / 180;
  for (const sgn of [-1, 1]) {
    const d = hd + sgn * open;
    line(ctx, px, py, px + 22 * Math.sin(d), py - 22 * Math.cos(d), 4, COLORS.gripAxis);
  }
}

/** 앞에서 본 화면(x-z): 받침을 돌리면 같은 팔이 짧아 보이거나 길어 보인다 */
function drawFrontView(ctx: CanvasRenderingContext2D, w: number, h: number, a: ArmAngles, s: ArmShape, target: Vec3, showArm: boolean) {
  const cx = w / 2;
  const ground = h - 50;
  const P = (p: Vec3) => [cx + p.x * SCALE, ground - p.z * SCALE] as const;
  label(ctx, "앞에서 본 모습", 12, 22);
  line(ctx, 20, ground, w - 20, ground, 2, COLORS.grid);
  const sh = shoulderPoint(s);
  const [sx, sy] = P(sh);
  line(ctx, cx, ground, sx, sy, 14, COLORS.servo);
  const [tx, ty] = P(target);
  dot(ctx, tx, ty, 7, COLORS.target);
  if (!showArm) return;
  const [px, py] = P(tipPoint(a, s));
  line(ctx, sx, sy, px, py, 12, COLORS.stick);
  dot(ctx, sx, sy, 7, COLORS.liftAxis);
  dot(ctx, px, py, 5, COLORS.gripAxis);
}

/* ---------- 탭 4: 센서와 각도 ---------- */

function SensorTab() {
  const [tilt, setTilt] = useState(0);
  const [fromLow, setFromLow] = useState(-1023);
  const [fromHigh, setFromHigh] = useState(1023);
  const [guess, setGuess] = useState("");
  const [showResult, setShowResult] = useState(false);
  const accel = tiltToAcceleration(tilt);
  const mapped = mapValue(accel, { fromLow, fromHigh, toLow: 0, toHigh: 180 });
  const servo = Math.round(clampServo(mapped));

  const ref = useCanvas(
    (ctx, w, h) => {
      // 마이크로비트 (기울기)
      const mx = 150;
      const my = h / 2;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate((-tilt * Math.PI) / 180);
      ctx.fillStyle = COLORS.ink;
      ctx.fillRect(-70, -10, 140, 20);
      ctx.restore();
      label(ctx, "마이크로비트를 옆에서 본 모습", 16, 24);
      label(ctx, `기울기 ${tilt}°`, mx - 40, my + 70, COLORS.ink);
      arrow(ctx, 250, my, 330, my, COLORS.muted);
      // 서보
      const sx = 470;
      if (showResult) {
        drawServo(ctx, sx, my + 20, Math.PI, (servo * Math.PI) / 180, 80);
        label(ctx, `서보 ${servo}°`, sx - 30, my + 110, COLORS.ink);
      } else {
        label(ctx, "서보는 몇 도가 될까?", sx - 70, my);
      }
    },
    [tilt, servo, showResult],
  );

  return (
    <Panel>
      <div className="space-y-3">
        <canvas ref={ref} width={640} height={300} className={canvasClass} aria-label="기울기 센서와 서보 각도" />
        <ol className="space-y-1 text-sm text-slate-700">
          <li>
            1. 기울기 {tilt}° → 가속도 x 값 <b className="tabular-nums">{accel}</b>
          </li>
          <li>
            2. 매핑 블록: 가속도 x 를 {fromLow} ~ {fromHigh} 에서 0 ~ 180 으로 →{" "}
            <b className="tabular-nums">{showResult ? mapped.toFixed(1) : "?"}</b>
          </li>
          <li>
            3. 서보 쓰기: 0~180 밖이면 끝 값으로 → <b className="tabular-nums">{showResult ? `${servo}°` : "?"}</b>
          </li>
        </ol>
        <p className="text-xs text-slate-500">
          메이크코드 블록으로는 "서보 P0 각도를 (매핑 (가속도 x) 를 {fromLow}~{fromHigh} 에서 0~180 으로) 로 쓰기"와 같아요. 실제 센서 값은 흔들려서 화면처럼 깔끔하지 않을 수 있어요.
        </p>
      </div>
      <div className="space-y-4">
        <Slider
          id="sensor-tilt"
          label="마이크로비트 기울이기"
          value={tilt}
          min={-90}
          max={90}
          onChange={(v) => {
            setTilt(v);
            setShowResult(false);
          }}
        />
        <label htmlFor="sensor-guess" className="block text-sm font-semibold text-slate-700">
          내 예측 (서보 각도)
          <input
            id="sensor-guess"
            inputMode="numeric"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="mt-1 w-full border border-slate-200 px-2 py-1"
          />
        </label>
        <button onClick={() => setShowResult(true)} className="border border-slate-200 bg-white px-3 py-1 text-sm">
          확인하기
        </button>
        {showResult && guess !== "" && (
          <p className="text-sm tabular-nums text-slate-600">
            예측 {guess}° / 실제 {servo}°. 차이가 왜 생겼는지 짝과 이야기해 봐요.
          </p>
        )}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <p className="text-sm font-semibold text-slate-700">매핑 범위 바꿔 보기</p>
          <Slider id="sensor-from-low" label="from 낮은 값" unit="" value={fromLow} min={-1023} max={0} onChange={(v) => { setFromLow(v); setShowResult(false); }} />
          <Slider id="sensor-from-high" label="from 높은 값" unit="" value={fromHigh} min={1} max={1023} onChange={(v) => { setFromHigh(v); setShowResult(false); }} />
          <p className="text-xs text-slate-500">범위를 좁히면 조금만 기울여도 서보가 크게 움직여요.</p>
        </div>
      </div>
    </Panel>
  );
}
