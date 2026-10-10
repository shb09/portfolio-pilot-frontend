import { ArrowUpRight, Download, MapPin } from "lucide-react";
import { pub } from "../api/client";

function fire(username, eventType, projectId) {
  if (!username) return;
  pub
    .post("/api/analytics/event", { username, eventType, projectId: projectId ?? null })
    .catch(() => {});
}

function Rule({ index, children }) {
  return (
    <p className="eyebrow flex items-center gap-3">
      <span className="font-mono tabular-nums" style={{ color: "var(--ink)" }}>{index}</span>
      {children}
      <span className="h-[2px] flex-1" style={{ background: "var(--line-strong)" }} aria-hidden="true" />
    </p>
  );
}

const LEVEL_DOTS = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4 };

function orderedProjects(projects) {
  return [...(projects || [])].sort((a, b) => Number(b.featured || false) - Number(a.featured || false));
}

/**
 * Public portfolio as an editorial broadsheet: oversized hero, numbered
 * sections, asymmetric project index, lime reserved for selection marks.
 * onEvent wires visitor clicks to analytics; pass null to disable.
 */
export default function PublicView({ data, onEvent }) {
  if (!data) return null;
  const track = (type, projectId) => onEvent && data.username && onEvent(data.username, type, projectId);
  const initial = (data.displayName || "?").charAt(0).toUpperCase();
  const projects = orderedProjects(data.projects);

  return (
    <article>
      {/* Hero */}
      <header className="border-b-2 pb-8" style={{ borderColor: "var(--line-strong)" }}>
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-[6px] text-3xl font-extrabold"
            style={{ background: "var(--lime)", color: "#171717", border: "2px solid var(--line-strong)", boxShadow: "var(--shadow-sm)" }}
            aria-hidden="true"
          >
            {initial}
          </div>
          {data.location && (
            <p className="ml-auto flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              <MapPin size={13} aria-hidden="true" /> {data.location}
            </p>
          )}
        </div>
        <h1 className="display mt-5 text-5xl uppercase sm:text-7xl">{data.displayName}</h1>
        {data.headline && <p className="mt-2 text-xl font-extrabold tracking-tight"><span className="hl">{data.headline}</span></p>}
        {data.tagline && <p className="mt-2 max-w-xl text-[15px]" style={{ color: "var(--muted)" }}>{data.tagline}</p>}
        <div className="mt-6 flex flex-wrap gap-2 text-[13px] font-bold">
          {data.githubUrl && (
            <a href={data.githubUrl} target="_blank" rel="noreferrer" onClick={() => track("GITHUB_CLICK")} className="btn-ghost px-3.5 py-2">
              GitHub <ArrowUpRight size={14} />
            </a>
          )}
          {data.linkedinUrl && (
            <a href={data.linkedinUrl} target="_blank" rel="noreferrer" onClick={() => track("LINKEDIN_CLICK")} className="btn-ghost px-3.5 py-2">
              LinkedIn <ArrowUpRight size={14} />
            </a>
          )}
          {data.resumeUrl && (
            <a href={data.resumeUrl} target="_blank" rel="noreferrer" onClick={() => track("RESUME_CLICK")} className="btn-brand px-3.5 py-2">
              <Download size={14} /> Resume
            </a>
          )}
        </div>
      </header>

      {data.about && (
        <section className="grid gap-4 py-8 lg:grid-cols-[200px_1fr]" aria-label="About">
          <Rule index="01">About</Rule>
          <p className="max-w-2xl whitespace-pre-wrap text-lg font-medium leading-relaxed">{data.about}</p>
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="grid gap-4 border-t-2 py-8 lg:grid-cols-[200px_1fr]" style={{ borderColor: "var(--line-strong)" }} aria-label="Skills">
          <Rule index="02">Expertise</Rule>
          <ul className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <li key={s.id} className="chip flex items-center gap-2 px-2.5 py-1.5 text-[13px] font-bold">
                {s.name}
                <span className="flex gap-[3px]" title={s.level} aria-label={`Level ${s.level}`}>
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className="inline-block h-2 w-2 rounded-[1px]"
                      style={{ background: i <= (LEVEL_DOTS[s.level] || 2) ? "var(--ink)" : "var(--ring-track)" }} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section className="grid gap-4 border-t-2 py-8 lg:grid-cols-[200px_1fr]" style={{ borderColor: "var(--line-strong)" }} aria-label="Projects">
          <Rule index="03">Selected work</Rule>
          <div className="divide-y-2" style={{ borderColor: "var(--line-strong)" }}>
            {projects.map((p, i) => (
              <article key={p.id} className="grid gap-1 py-5 first:pt-0 last:pb-0 sm:grid-cols-[48px_1fr_auto]">
                <span className="display text-2xl tabular-nums" style={{ color: "var(--surface-tint)", WebkitTextStroke: "1.5px var(--ink)" }} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight">
                    {p.title}
                    {p.featured && <span className="chip-accent px-1.5 py-px text-[10px] font-extrabold uppercase tracking-wide">Featured</span>}
                  </h3>
                  <p className="mt-0.5 text-[11px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "var(--muted)" }}>
                    {[p.techStack, [p.startDate, p.endDate || (p.startDate ? "Now" : null)].filter(Boolean).join(" → ")].filter(Boolean).join(" · ")}
                  </p>
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt={`${p.title} preview`} loading="lazy"
                      className="mt-3 max-h-56 w-full rounded-[4px] border-[1.5px] object-cover" style={{ borderColor: "var(--line-strong)" }} />
                  )}
                  {p.description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{p.description}</p>}
                </div>
                <div className="flex gap-3 text-[13px] font-extrabold sm:flex-col sm:items-end">
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" onClick={() => track("PROJECT_CLICK", p.id)} className="inline-flex items-center gap-1 underline decoration-2 underline-offset-4">Live <ArrowUpRight size={13} /></a>}
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" onClick={() => track("PROJECT_CLICK", p.id)} className="inline-flex items-center gap-1 underline decoration-2 underline-offset-4">Code <ArrowUpRight size={13} /></a>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {data.experience?.length > 0 && (
        <section className="grid gap-4 border-t-2 py-8 lg:grid-cols-[200px_1fr]" style={{ borderColor: "var(--line-strong)" }} aria-label="Experience">
          <Rule index="04">Experience</Rule>
          <div className="space-y-6">
            {data.experience.map((e) => (
              <div key={e.id} className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <p className="text-[11px] font-extrabold uppercase tracking-wide tabular-nums" style={{ background: "var(--lime)", color: "#171717", alignSelf: "start", display: "inline-block", padding: "0.1em 0.4em", borderRadius: "3px", justifySelf: "start" }}>
                  {[e.startPeriod, e.endPeriod || "Now"].filter(Boolean).join(" → ")}
                </p>
                <div>
                  <p className="text-lg font-extrabold tracking-tight">{e.title} — {e.company}</p>
                  {e.location && <p className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>{e.location}</p>}
                  {e.description && <p className="mt-1 max-w-2xl text-sm leading-relaxed">{e.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="grid gap-4 border-t-2 py-8 lg:grid-cols-[200px_1fr]" style={{ borderColor: "var(--line-strong)" }} aria-label="Education">
          <Rule index="05">Education</Rule>
          <div className="space-y-4">
            {data.education.map((e) => (
              <div key={e.id} className="grid gap-1 sm:grid-cols-[150px_1fr]">
                <p className="text-[11px] font-extrabold uppercase tracking-wide tabular-nums" style={{ color: "var(--muted)" }}>
                  {e.startYear ? `${e.startYear} → ${e.endYear || "Now"}` : ""}
                </p>
                <div>
                  <p className="text-lg font-extrabold tracking-tight">{e.degree}</p>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
                    {e.school}{e.fieldOfStudy ? ` · ${e.fieldOfStudy}` : ""}
                  </p>
                  {e.description && <p className="mt-1 max-w-2xl text-sm">{e.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.certifications?.length > 0 && (
        <section className="grid gap-4 border-t-2 py-8 lg:grid-cols-[200px_1fr]" style={{ borderColor: "var(--line-strong)" }} aria-label="Certifications">
          <Rule index="06">Certified</Rule>
          <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
            {data.certifications.map((c) => (
              <li key={c.id} className="flex items-baseline gap-2.5 py-2.5 text-sm">
                <span className="font-extrabold" aria-hidden="true" style={{ color: "var(--coral)" }}>■</span>
                <p className="font-bold">{c.name}</p>
                <p style={{ color: "var(--muted)" }}>— {c.issuer}{c.issueDate ? ` · ${c.issueDate}` : ""}</p>
                {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="ml-auto shrink-0 text-xs font-extrabold underline underline-offset-2">Verify</a>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.achievements?.length > 0 && (
        <section className="grid gap-4 border-t-2 py-8 lg:grid-cols-[200px_1fr]" style={{ borderColor: "var(--line-strong)" }} aria-label="Achievements">
          <Rule index="07">Recognition</Rule>
          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
            {data.achievements.map((a) => (
              <div key={a.id} className="border-l-[3px] pl-3.5" style={{ borderColor: "var(--coral)" }}>
                <p className="font-extrabold tracking-tight">{a.title}</p>
                {a.description && <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>{a.description}</p>}
                <p className="mt-1 text-xs font-bold" style={{ color: "var(--muted)" }}>
                  {a.date}
                  {a.link && <> · <a href={a.link} target="_blank" rel="noreferrer" className="underline underline-offset-2" style={{ color: "var(--ink)" }}>View</a></>}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t-2 py-5 text-center text-[11px] font-bold uppercase tracking-[0.14em]" style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}>
        Set in Portfolio Pilot
      </footer>
    </article>
  );
}

export { fire };
