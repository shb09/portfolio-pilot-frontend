import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Gauge, Rocket } from "lucide-react";

/**
 * Two-column auth shell. Left: the form (white card on paper).
 * Right: restrained product panel (periwinkle tint, no imagery).
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2" aria-label="Portfolio Pilot home">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-extrabold"
              style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
              aria-hidden="true"
            >
              P
            </span>
            <span className="text-[15px] font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
              Portfolio Pilot
            </span>
          </Link>
          <h1 className="display mt-7 text-[1.7rem]">{title}</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{subtitle}</p>
          <div className="solid card mt-5 p-5 sm:p-6">{children}</div>
          {footer && (
            <p className="mt-4 text-center text-[13px]" style={{ color: "var(--muted)" }}>{footer}</p>
          )}
        </div>
      </div>
      <aside className="tint hidden flex-col justify-center gap-6 rounded-none border-y-0 border-r-0 px-12 lg:flex" aria-label="Why Portfolio Pilot">
        <p className="eyebrow" style={{ color: "var(--brand)" }}>Why pilots join</p>
        <ul className="space-y-5">
          {[
            [Gauge, "Know your score", "Eight weighted sections graded 0–100 from your real data."],
            [Rocket, "Publish in minutes", "Preview the exact page, claim your slug, share one link."],
            [BarChart3, "See what lands", "Views and clicks counted event by event."],
          ].map(([Icon, t, d]) => (
            <li key={t} className="flex gap-3.5">
              <span className="icon-tile"><Icon size={18} /></span>
              <span>
                <span className="block text-[15px] font-extrabold tracking-tight">{t}</span>
                <span className="block text-sm" style={{ color: "var(--muted)" }}>{d}</span>
              </span>
            </li>
          ))}
        </ul>
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-bold" style={{ color: "var(--brand)" }}>
          Explore the product <ArrowRight size={14} />
        </Link>
      </aside>
    </div>
  );
}
