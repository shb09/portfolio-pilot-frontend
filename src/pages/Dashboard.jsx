import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Eye, FolderKanban, MousePointerClick, Plus } from "lucide-react";
import { api, apiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import ReadinessMeter from "../components/ReadinessMeter";
import { Stagger, StaggerItem } from "../components/Reveal";

/** "What is the most valuable next step I can take?" */
function tipLink(tip) {
  const t = tip.toLowerCase();
  if (t.includes("publish") || t.includes("launch-ready") || t.includes("share")) return ["/preview", "Open publishing"];
  if (t.includes("project")) return ["/projects", "Go to projects"];
  if (t.includes("skill")) return ["/skills", "Go to skills"];
  if (t.includes("experience") || t.includes("internship")) return ["/experience", "Go to experience"];
  if (t.includes("education")) return ["/education", "Go to education"];
  if (t.includes("certification")) return ["/certifications", "Go to certifications"];
  if (t.includes("achievement") || t.includes("award")) return ["/achievements", "Go to achievements"];
  if (t.includes("github") || t.includes("resume") || t.includes("about")) return ["/profile", "Go to profile"];
  return ["/profile", "Review profile"];
}

function Skeleton() {
  return (
    <div className="space-y-3" aria-label="Loading dashboard">
      <div className="skeleton h-7 w-1/2" />
      <div className="grid gap-3 lg:grid-cols-5">
        <div className="skeleton h-56 lg:col-span-3" />
        <div className="skeleton h-56 lg:col-span-2" />
      </div>
      <div className="skeleton h-28" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [projects, setProjects] = useState([]);
  const [counts, setCounts] = useState({ skills: 0, experience: 0, certifications: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    Promise.all([
      api.get("/dashboard/summary"),
      api.get("/portfolio").catch(() => ({ data: null })),
      api.get("/projects").catch(() => ({ data: [] })),
      api.get("/skills").catch(() => ({ data: [] })),
      api.get("/experience").catch(() => ({ data: [] })),
      api.get("/certifications").catch(() => ({ data: [] })),
    ])
      .then(([dash, pf, projs, skills, exp, certs]) => {
        if (!live) return;
        setData(dash.data);
        setPortfolio(pf.data);
        setProjects((projs.data || []).slice(0, 4));
        setCounts({
          skills: (skills.data || []).length,
          experience: (exp.data || []).length,
          certifications: (certs.data || []).length,
        });
      })
      .catch((err) => live && setError(apiError(err, "Could not load dashboard")));
    return () => { live = false; };
  }, []);

  if (error) {
    return (
      <div className="solid card p-8 text-center">
        <p className="text-sm font-bold" style={{ color: "var(--danger)" }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-brand mt-4 px-4 py-2 text-[13px]">Retry</button>
      </div>
    );
  }
  if (!data) return <Skeleton />;

  const { readiness, analytics } = data;
  const first = user?.name?.split(" ")[0] || "there";
  const [topTip] = readiness.recommendations;
  const [topTo, topLabel] = topTip ? tipLink(topTip) : ["/profile", "Review profile"];
  const clicks = analytics.projectClicks + analytics.githubClicks + analytics.resumeClicks + analytics.linkedinClicks;
  const missing = readiness.breakdown.filter((b) => !b.done);

  return (
    <div>
      {/* Compact welcome */}
      <div className="flex flex-wrap items-center gap-3 border-b-2 pb-3" style={{ borderColor: "var(--line-strong)" }}>
        <div>
          <h1 className="display text-[1.5rem]">Morning, {first} — here&apos;s the mission.</h1>
          <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>
            Readiness {readiness.score}% · {portfolio?.published ? "portfolio live" : "portfolio in draft"}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link to="/projects" className="btn-ghost px-3 py-1.5 text-xs font-semibold"><Plus size={14} /> Project</Link>
          <Link to="/preview" className="btn-brand px-3 py-1.5 text-xs">Preview & publish <ArrowRight size={14} /></Link>
        </div>
      </div>

      {/* Primary row: readiness | next step | publish */}
      <Stagger className="mt-3 grid gap-3 lg:grid-cols-12" gap={0.07}>
        <StaggerItem className="solid card p-5 lg:col-span-5">
          <p className="eyebrow">Readiness · live</p>
          <div className="mt-1"><ReadinessMeter score={readiness.score} breakdown={readiness.breakdown} /></div>
        </StaggerItem>

        <StaggerItem className="flex flex-col border-2 p-5 lg:col-span-4" style={{ borderColor: "var(--line-strong)", background: "var(--lime)", borderRadius: "6px" }}>
          <p className="eyebrow" style={{ color: "#171717" }}>Most valuable next step</p>
          <p className="mt-1.5 text-lg font-extrabold leading-snug tracking-tight" style={{ color: "#171717" }}>{topTip || "Everything checks out."}</p>
          <Link to={topTo} className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[13px] font-extrabold underline decoration-2 underline-offset-4" style={{ color: "#171717" }}>
            {topLabel} <ArrowRight size={14} />
          </Link>
        </StaggerItem>

        <StaggerItem className="solid card flex flex-col p-5 lg:col-span-3">
          <p className="eyebrow">Publication</p>
          <p className="mt-1.5 text-lg font-extrabold tracking-tight">
            {portfolio?.published ? "LIVE" : "DRAFT"}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs" style={{ color: "var(--muted)" }}>
            {portfolio?.username ? `/portfolio/${portfolio.username}` : "no slug claimed"}
          </p>
          <div className="mt-auto flex gap-2 pt-3">
            <Link to="/preview" className="btn-ghost px-3 py-1.5 text-xs font-semibold">
              {portfolio?.published ? "Manage" : "Set up"}
            </Link>
            {portfolio?.published && (
              <a href={`/portfolio/${portfolio.username}`} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs font-semibold">
                Open <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </StaggerItem>
      </Stagger>

      {/* Secondary row: module counts */}
      <div className="mt-3 grid grid-cols-2 gap-px border-2 sm:grid-cols-4" style={{ borderColor: "var(--line-strong)", background: "var(--line-strong)", borderRadius: "6px", overflow: "hidden" }}>
        {[
          [`${projects.length}`, "Projects", "/projects"],
          [`${counts.skills}`, "Skills", "/skills"],
          [`${counts.experience}`, "Experience", "/experience"],
          [`${counts.certifications}`, "Certs", "/certifications"],
        ].map(([v, l, to]) => (
          <Link key={l} to={to} className="flex items-baseline gap-2 px-4 py-2.5" style={{ background: "var(--surface-solid)" }}>
            <span className="display text-2xl tabular-nums">{v}</span>
            <span className="eyebrow">{l}</span>
            <ArrowRight size={13} className="ml-auto" style={{ color: "var(--muted)" }} aria-hidden="true" />
          </Link>
        ))}
      </div>

      {/* Main content: recents + missing + activity */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="solid card">
          <div className="flex items-center border-b-2 px-4 py-2.5" style={{ borderColor: "var(--line-strong)" }}>
            <h2 className="text-[13px] font-extrabold uppercase tracking-wide">Recent projects</h2>
            <Link to="/projects" className="ml-auto text-xs font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Manage all</Link>
          </div>
          {projects.length === 0 ? (
            <div className="flex flex-wrap items-center gap-2.5 px-4 py-3.5">
              <p className="text-[13px]" style={{ color: "var(--muted)" }}>No projects yet — the highest-leverage first move.</p>
              <Link to="/projects" className="btn-brand ml-auto px-3 py-1.5 text-xs"><Plus size={13} /> Add project</Link>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
              {projects.map((p, i) => (
                <li key={p.id} className="record-row flex items-center gap-3 px-4 py-2.5">
                  <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>0{i + 1}</span>
                  <FolderKanban size={15} className="shrink-0" style={{ color: "var(--ink)" }} aria-hidden="true" />
                  <p className="truncate text-[13px] font-bold">{p.title}</p>
                  {p.featured && <span className="chip-accent shrink-0 px-1.5 py-px text-[10px] font-bold">Featured</span>}
                  <span className="ml-auto truncate text-xs" style={{ color: "var(--muted)" }}>{p.techStack || ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="solid card">
          <div className="border-b-2 px-4 py-2.5" style={{ borderColor: "var(--line-strong)" }}>
            <h2 className="text-[13px] font-extrabold uppercase tracking-wide">Missing sections {missing.length > 0 && `(${missing.length})`}</h2>
          </div>
          {missing.length === 0 ? (
            <p className="px-4 py-3.5 text-[13px] font-bold">Complete profile. Time to share the link.</p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
              {missing.map((b) => {
                const [to] = tipLink(readiness.recommendations.find((t) => t.toLowerCase().includes(b.section)) || b.label);
                return (
                  <li key={b.section}>
                    <Link to={to} className="record-row flex items-center gap-2.5 px-4 py-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-[1.5px]" style={{ borderColor: "var(--line-strong)" }} aria-hidden="true" />
                      <span className="text-[13px] font-bold">{b.label}</span>
                      <span className="ml-auto text-[11px] font-bold tabular-nums" style={{ color: "var(--muted)" }}>+{b.weight - b.earned} pts</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex items-center gap-2 border-t-2 px-4 py-2.5" style={{ borderColor: "var(--line-strong)" }}>
            <Eye size={14} style={{ color: "var(--muted)" }} aria-hidden="true" />
            <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
              {analytics.totalEvents === 0
                ? "No visits yet — publish and share to start counting."
                : `${analytics.portfolioViews} views · ${clicks} clicks on your public page`}
            </p>
            <Link to="/analytics" className="ml-auto text-xs font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Analytics</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
