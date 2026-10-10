import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import Aurora from "../components/Aurora";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";

/* Clearly-labeled marketing preview: static demo numbers, never user data. */
function ProductPreview() {
  const reduce = useReducedMotion();
  const wrap = reduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.1 } };
  return (
    <motion.div
      {...wrap}
      className="solid card overflow-hidden"
      aria-label="Product preview (demo illustration)"
    >
      <div className="flex items-center gap-2 border-b-2 px-4 py-2.5" style={{ borderColor: "var(--line-strong)" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-[3px] text-[11px] font-extrabold"
          style={{ background: "var(--lime)", color: "#171717" }} aria-hidden="true">P</span>
        <span className="text-xs font-extrabold tracking-tight">PORTFOLIO PILOT</span>
        <span className="chip ml-auto px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>Demo data</span>
      </div>
      <div className="grid sm:grid-cols-2">
        <div className="border-b-2 p-4 sm:border-b-0 sm:border-r-2" style={{ borderColor: "var(--line-strong)" }}>
          <p className="eyebrow">Readiness</p>
          <p className="display mt-0.5 text-5xl tabular-nums">82<span className="text-2xl">%</span></p>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="h-2 flex-1 rounded-[2px]" style={{ background: i < 7 ? "var(--lime)" : "var(--ring-track)", border: "1px solid var(--line-strong)" }} />
            ))}
          </div>
          <div className="mt-3 space-y-1.5 text-xs font-bold">
            {[["Profile", true], ["Projects · 6", true], ["Skills · 9", true], ["Experience", false]].map(([l, done]) => (
              <p key={l} className="flex items-center gap-2" style={{ color: done ? "var(--ink)" : "var(--muted)" }}>
                <span className="flex h-4 w-4 items-center justify-center rounded-[3px]"
                  style={{ background: done ? "var(--lime)" : "transparent", border: "1.5px solid var(--line-strong)", color: "#171717" }}>
                  {done && <Check size={10} strokeWidth={4} />}
                </span>
                {l}
              </p>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="eyebrow">This week</p>
            <span className="chip-accent px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest">Published</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[["6", "Projects"], ["9", "Skills"], ["14", "Views"]].map(([v, l]) => (
              <div key={l} className="rounded-[4px] border-[1.5px] p-2" style={{ borderColor: "var(--line-strong)" }}>
                <p className="text-lg font-extrabold tabular-nums">{v}</p>
                <p className="eyebrow" style={{ fontSize: "0.58rem" }}>{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 border-l-[3px] p-2.5 text-xs font-bold" style={{ background: "var(--surface-tint)", borderColor: "var(--line)", borderLeftColor: "var(--lime)" }}>
            Next: add your internship experience →
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const entrance = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Landing() {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();
  const anim = (delay = 0) => (reduce ? {} : { ...entrance, transition: { ...entrance.transition, delay } });

  return (
    <div className="min-h-screen">
      <Aurora />
      {/* Compact top nav */}
      <header className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3.5 sm:px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-[4px] text-sm font-extrabold"
          style={{ background: "var(--lime)", color: "#171717", border: "1.5px solid var(--line-strong)" }} aria-hidden="true">P</span>
        <span className="text-sm font-extrabold tracking-tight">PORTFOLIO PILOT</span>
        <nav className="ml-5 hidden items-center gap-4 text-[13px] font-semibold md:flex" style={{ color: "var(--muted)" }} aria-label="Product">
          <a href="#how" className="hover:underline">Method</a>
          <a href="#readiness" className="hover:underline">Readiness</a>
          <a href="#publish" className="hover:underline">Publishing</a>
        </nav>
        <div className="ml-auto flex gap-2">
          <button onClick={toggle} className="icon-btn" aria-label="Toggle theme">
            {theme === "paper" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <Link to="/login" className="btn-ghost px-3.5 py-1.5 text-[13px] font-semibold">Login</Link>
          <Link to="/register" className="btn-brand px-3.5 py-1.5 text-[13px]">Get started</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Editorial split hero */}
        <section className="grid items-center gap-8 border-t-2 py-10 lg:grid-cols-[1fr_1.05fr] lg:py-14" style={{ borderColor: "var(--line-strong)" }}>
          <div>
            <motion.p {...anim()} className="eyebrow" style={{ color: "var(--muted)" }}>
              Career-profile workspace · for students
            </motion.p>
            <motion.h1 {...anim(0.08)} className="display mt-3 text-[2.9rem] leading-[0.95] sm:text-7xl">
              YOUR WORK.
              <br />
              YOUR STORY.
              <br />
              <span className="hl">YOUR NEXT MOVE.</span>
            </motion.h1>
            <motion.p {...anim(0.16)} className="mt-5 max-w-md border-l-[3px] pl-4 text-[15px] leading-relaxed" style={{ borderColor: "var(--lime)", color: "var(--muted)" }}>
              Bring your projects, skills, education, and achievements together in one
              professional portfolio. Understand what is missing, publish your work,
              and track engagement.
            </motion.p>
            <motion.div {...anim(0.24)} className="mt-6 flex flex-wrap gap-2.5">
              <Link to="/register" className="btn-brand px-5 py-2.5 text-sm">Build your portfolio <ArrowRight size={15} /></Link>
              <a href="#how" className="btn-ghost px-5 py-2.5 text-sm font-semibold">Explore the product</a>
            </motion.div>
          </div>
          <ProductPreview />
        </section>

        {/* Narrative: alternating editorial blocks */}
        <Reveal className="grid gap-6 border-t-2 py-12 lg:grid-cols-[220px_1fr]" style={{ borderColor: "var(--line-strong)" }}>
          <p className="display text-5xl tabular-nums" style={{ color: "var(--surface-tint)", WebkitTextStroke: "1.5px var(--ink)" }} aria-hidden="true">01</p>
          <div>
            <p className="eyebrow">The problem</p>
            <h2 className="display mt-1 max-w-xl text-2xl sm:text-3xl">Scattered proof never compounds.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              A repo nobody links. A certificate lost in an inbox. A resume three versions old.
              Recruiters decide in seconds — Portfolio Pilot gathers every proof into one
              structured profile and scores what is missing.
            </p>
          </div>
        </Reveal>

        <section id="how" className="border-t-2 py-12" style={{ borderColor: "var(--line-strong)" }}>
          <Reveal className="flex flex-wrap items-end gap-3">
            <p className="display text-5xl tabular-nums" style={{ color: "var(--surface-tint)", WebkitTextStroke: "1.5px var(--ink)" }} aria-hidden="true">02</p>
            <div>
              <p className="eyebrow">Method</p>
              <h2 className="display mt-1 text-2xl sm:text-3xl">Collect. Score. Publish. Track.</h2>
            </div>
          </Reveal>
          <Stagger className="mt-6 grid gap-px border-2 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--line-strong)", background: "var(--line-strong)" }}>
            {[
              ["Collect", "Projects, skills, education, experience, certs, wins — one workspace, zero spreadsheets."],
              ["Score", "Eight weighted sections graded 0–100 by backend rules. No vibes, no black box."],
              ["Publish", "Preview the real page, claim /portfolio/you, share one link everywhere."],
              ["Track", "Views, project opens, resume downloads — counted event by event."],
            ].map(([t, d], i) => (
              <StaggerItem key={t} className="p-5" style={{ background: "var(--surface-solid)" }}>
                <p className="chip-accent inline-block px-2 py-0.5 text-[11px] font-extrabold">0{i + 1}</p>
                <p className="mt-2.5 font-extrabold tracking-tight">{t}</p>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>{d}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section id="readiness" className="grid items-center gap-8 border-t-2 py-12 lg:grid-cols-2" style={{ borderColor: "var(--line-strong)" }}>
          <Reveal>
            <p className="display text-5xl tabular-nums" style={{ color: "var(--surface-tint)", WebkitTextStroke: "1.5px var(--ink)" }} aria-hidden="true">03</p>
            <p className="eyebrow mt-2">Readiness, quantified</p>
            <h2 className="display mt-1 text-2xl sm:text-3xl">Eight sections. <span className="hl">One honest number.</span></h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Profile, about, skills, projects, education, experience, certifications, achievements —
              computed live from your data. Each tip names the gap and links to the form that closes it.
            </p>
            <Link to="/register" className="btn-brand mt-4 inline-flex px-4 py-2 text-[13px]">Get your score <ArrowRight size={14} /></Link>
          </Reveal>
          <Reveal className="solid card p-5" delay={0.1}>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              {[["Profile", "15/15", 100], ["About", "10/10", 100], ["Skills", "11/15", 73], ["Projects", "20/20", 100], ["Education", "10/10", 100], ["Experience", "0/15", 0], ["Certs", "3/5", 60], ["Wins", "10/10", 100]].map(([l, s, w]) => (
                <div key={l}>
                  <div className="flex justify-between text-xs font-bold"><span>{l}</span><span className="tabular-nums" style={{ color: "var(--muted)" }}>{s}</span></div>
                  <div className="bar-track mt-1 h-1.5"><div className="bar-fill h-1.5" style={{ width: `${w}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-semibold" style={{ color: "var(--muted)" }}>Demo breakdown — yours is computed live.</p>
          </Reveal>
        </section>

        <section id="publish" className="grid items-center gap-8 border-t-2 py-12 lg:grid-cols-2" style={{ borderColor: "var(--line-strong)" }}>
          <Reveal className="solid card order-2 p-5 lg:order-1">
            <p className="eyebrow">Publishing · Analytics</p>
            <p className="mt-1.5 font-mono text-sm font-extrabold" style={{ background: "var(--lime)", color: "#171717", display: "inline-block", padding: "0.1em 0.4em", border: "1.5px solid var(--line-strong)", borderRadius: "4px" }}>/portfolio/you</p>
            <div className="mt-3.5 space-y-2.5">
              {[["Portfolio views", "w-4/5"], ["Project clicks", "w-1/2"], ["Resume clicks", "w-1/4"]].map(([l, w]) => (
                <div key={l}>
                  <div className="text-xs font-bold">{l}</div>
                  <div className="bar-track mt-1 h-1.5"><div className={`bar-fill h-1.5 ${w}`} /></div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <p className="display text-5xl tabular-nums" style={{ color: "var(--surface-tint)", WebkitTextStroke: "1.5px var(--ink)" }} aria-hidden="true">04</p>
            <p className="eyebrow mt-2">Share & measure</p>
            <h2 className="display mt-1 text-2xl sm:text-3xl">Draft in private. Ship in public.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Preview exactly what visitors see, publish when ready, then watch real engagement
              arrive. Unpublished work stays invisible — the route only serves what you ship.
            </p>
          </Reveal>
        </section>

        <Reveal className="my-6 border-2 px-6 py-10 text-center sm:px-10" style={{ borderColor: "var(--line-strong)", background: "var(--ink)" }}>
          <h2 className="display mx-auto max-w-2xl text-3xl sm:text-4xl" style={{ color: "var(--bg)" }}>
            STOP SCATTERING PROOF. <span className="hl">START PILOTING IT.</span>
          </h2>
          <Link to="/register" className="btn-brand mt-6 inline-flex px-6 py-3 text-sm">
            Build your portfolio <ArrowRight size={15} />
          </Link>
        </Reveal>
      </main>

      <footer className="border-t-2 py-5 text-center text-xs font-semibold" style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}>
        PORTFOLIO PILOT — BUILD YOUR PROFILE · TRACK YOUR PROGRESS · LAUNCH YOUR CAREER STORY
      </footer>
    </div>
  );
}
