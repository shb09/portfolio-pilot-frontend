/** Solid-surface stat for dashboard sections. */
export default function Stat({ label, value, icon }) {
  return (
    <div className="solid card p-4">
      <div className="text-xl" aria-hidden="true">{icon}</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        {label}
      </div>
    </div>
  );
}
