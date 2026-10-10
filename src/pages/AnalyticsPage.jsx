import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, Code2, Download, Eye, FolderKanban, Globe } from "lucide-react";
import { api, apiError } from "../api/client";
import Stat from "../components/Stat";

/** Hand-rolled bars — cobalt primary, periwinkle track. No chart dependency. */
function Bars({ rows }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...rows.map(([, v]) => v));
  return (
    <div className="space-y-2.5" role="img" aria-label="Engagement bar chart">
      {rows.map(([Icon, label, value], i) => (
        <div key={label}>
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <Icon size={14} style={{ color: "var(--brand)" }} aria-hidden="true" />
            <span>{label}</span>
            <span className="ml-auto tabular-nums">{value}</span>
          </div>
          <div className="bar-track mt-1 h-2">
            <motion.div
              className="bar-fill h-2"
              initial={reduce ? false : { width: 0 }}
              whileInView={{ width: `${(value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Donut({ total, views }) {
  const pct = total === 0 ? 0 : Math.round((views / total) * 100);
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90" role="img" aria-label={`${pct}% of events are portfolio views`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--ring-track)" strokeWidth="12" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none"
          stroke="var(--brand)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (pct / 100) * c }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div>
        <p className="display text-4xl tabular-nums">{pct}%</p>
        <p className="text-[13px]" style={{ color: "var(--muted)" }}>of engagement is<br />portfolio views</p>
      </div>
    </div>
  );
}

const ROWS = [
  [Eye, "Portfolio views", "portfolioViews", "Someone opened your public link"],
  [FolderKanban, "Project clicks", "projectClicks", "Visitors opening project links"],
  [Code2, "GitHub clicks", "githubClicks", "Visitors heading to your code"],
  [Download, "Resume clicks", "resumeClicks", "Recruiters grabbing your resume"],
  [Globe, "LinkedIn clicks", "linkedinClicks", "Visitors checking your LinkedIn"],
];

const statIcon = (Icon) => <Icon size={18} style={{ color: "var(--brand)" }} aria-hidden="true" />;

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/analytics/summary")
      .then((res) => setData(res.data))
      .catch((err) => setError(apiError(err, "Could not load analytics")));
  }, []);

  if (error) {
    return (
      <div className="solid card p-8 text-center">
        <p className="text-sm font-bold" style={{ color: "var(--danger)" }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-brand mt-4 px-4 py-2 text-[13px]">Retry</button>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="space-y-3" aria-label="Loading analytics">
        <div className="skeleton h-7 w-1/2" />
        <div className="skeleton h-52" />
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Analytics / Engagement</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="display text-[1.55rem]">Engagement</h1>
      </div>
      <p className="mt-1 max-w-xl text-[13px]" style={{ color: "var(--muted)" }}>
        Every view and click on your public portfolio, persisted event by event. Nothing fabricated.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat label="Total events" value={data.totalEvents} icon={statIcon(Eye)} />
        <Stat label="Views" value={data.portfolioViews} icon={statIcon(Eye)} />
        <Stat label="Project clicks" value={data.projectClicks} icon={statIcon(FolderKanban)} />
        <Stat label="Profile clicks" value={data.githubClicks + data.linkedinClicks + data.resumeClicks} icon={statIcon(Briefcase)} />
      </div>

      {data.totalEvents === 0 ? (
        <div className="mx-auto max-w-sm py-12 text-center">
          <span className="icon-tile mx-auto" style={{ width: "2.75rem", height: "2.75rem" }}>
            <Eye size={20} />
          </span>
          <p className="eyebrow mt-4" style={{ color: "var(--ink)" }}>NO TRAFFIC YET</p>
          <p className="mx-auto mt-1.5 max-w-xs text-[13px]" style={{ color: "var(--muted)" }}>
            Publish your portfolio and share the link — the first visit lands here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-5">
          <div className="solid card p-5 lg:col-span-3">
            <h2 className="text-sm font-extrabold">Events by type</h2>
            <div className="mt-3.5"><Bars rows={ROWS.map(([Icon, label, key]) => [Icon, label, data[key]])} /></div>
          </div>
          <div className="tint rounded-xl p-5 lg:col-span-2">
            <h2 className="text-sm font-extrabold">View share</h2>
            <div className="mt-3.5"><Donut total={data.totalEvents} views={data.portfolioViews} /></div>
            <ul className="mt-3.5 space-y-1.5 text-[13px]" style={{ color: "var(--muted)" }}>
              {ROWS.map(([Icon, label, key, hint]) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Icon size={13} aria-hidden="true" />
                  <span>{label} <span className="opacity-70">· {hint}</span></span>
                  <strong className="ml-auto tabular-nums" style={{ color: "var(--ink)" }}>{data[key]}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
