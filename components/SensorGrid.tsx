import { SENSORS } from "@/lib/sensors";

/** Static sensor card grid for Stage 1 (센서 도서관). Pure content, no interactivity. */
export default function SensorGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {SENSORS.map((s) => (
        <div key={s.id} className="idea-card flex flex-col gap-2 p-4">
          <span className="text-3xl" aria-hidden="true">{s.icon}</span>
          <h4 className="font-black text-slate-900">{s.name}</h4>
          <p className="text-xs leading-5 text-slate-600">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}
