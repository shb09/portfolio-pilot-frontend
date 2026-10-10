/**
 * Swiss-style readiness meter: oversized numerals, segmented block bar
 * (lime = earned, 8 segments = sections), compact checklist.
 * Score comes from the backend; animation never affects the value.
 */
export default function ReadinessMeter({ score, breakdown }) {
  const pct = Math.min(100, Math.max(0, score));
  const done = (breakdown || []).filter((b) => b.done).length;
  return (
    <div role="img" aria-label={`Portfolio readiness ${score} percent, ${done} of 8 sections complete`}>
      <div className="flex items-end gap-3">
        <p className="display text-6xl tabular-nums leading-none">{score}<span className="text-3xl">%</span></p>
        <p className="eyebrow pb-1.5">Ready<br />{done}/8 done</p>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {(breakdown || []).map((b) => (
          <span
            key={b.section}
            title={`${b.label}: ${b.earned}/${b.weight}`}
            className="h-3 flex-1 rounded-[2px] border-[1.5px]"
            style={{
              background: b.done ? "var(--lime)" : b.earned > 0 ? "var(--ring-track)" : "transparent",
              borderColor: "var(--line-strong)",
            }}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4">
        {(breakdown || []).map((b) => (
          <li key={b.section} className="flex items-center justify-between border-b py-1 text-xs font-bold" style={{ borderColor: "var(--line)" }}>
            <span style={{ color: b.done ? "var(--ink)" : "var(--muted)" }}>
              {b.done ? "■ " : "□ "}{b.label}
            </span>
            <span className="tabular-nums" style={{ color: "var(--muted)" }}>{b.earned}/{b.weight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
