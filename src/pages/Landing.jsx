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
          <p className="eyebrow">Model portfolio value</p>
          <p className="display mt-0.5 text-5xl tabular-nums">$48<span className="text-2xl">,250</span></p>
          <p className="mt-1 text-xs font-extrabold" style={{ color: "var(--ink)" }}>+8.4% cumulative</p>
          <div className="mt-3 space-y-1.5 text-xs font-bold">
            {[["12 holdings", true], ["3 yrs history", true], ["Benchmark set", true], ["Sharpe measured", false]].map(([l, done]) => (
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
            <p className="eyebrow">Analysis</p>
            <span className="chip-accent px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest">Benchmarked</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[["1.24", "Sharpe"], ["-8.2%", "Max DD"], ["0.31", "HHI"]].map(([v, l]) => (
              <div key={l} className="rounded-[4px] border-[1.5px] p-2" style={{ borderColor: "var(--line-strong)" }}>
                <p className="text-lg font-extrabold tabular-nums">{v}</p>
                <p className="eyebrow" style={{ fontSize: "0.58rem" }}>{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 border-l-[3px] p-2.5 text-xs font-bold" style={{ background: "var(--surface-tint)", borderColor: "var(--line)", borderLeftColor: "var(--lime)" }}>
            Next: import Q3 prices to extend the window →
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
          <a href="#readiness" className="hover:underline">Metrics</a>
          <a href="#publish" className="hover:underline">Benchmark</a>
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
              Quantitative portfolio analysis · risk, return, diversification
            </motion.p>
            <motion.h1 {...anim(0.08)} className="display mt-3 text-[2.9rem] leading-[0.95] sm:text-7xl">
              YOUR CAPITAL.
              <br />
              YOUR RISK.
              <br />
              <span className="hl">YOUR NEXT MOVE.</span>
            </motion.h1>
            <motion.p {...anim(0.16)} className="mt-5 max-w-md border-l-[3px] pl-4 text-[15px] leading-relaxed" style={{ borderColor: "var(--lime)", color: "var(--muted)" }}>
              Build investment portfolios, import price history, and measure what matters:
              returns, volatility, drawdown, Sharpe ratio, allocation — and how you compare
              to a benchmark. Computed from your own data.
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
            <h2 className="display mt-1 max-w-xl text-2xl sm:text-3xl">Noisy markets punish guesswork.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Holdings scattered across brokerages and spreadsheets. No measure of risk,
              no sense of concentration, no honest benchmark. Portfolio Pilot gathers
              positions and price history into one structured workspace — and computes
              risk, return, and diversification from real numbers.
            </p>
          </div>
        </Reveal>

        <section id="how" className="border-t-2 py-12" style={{ borderColor: "var(--line-strong)" }}>
          <Reveal className="flex flex-wrap items-end gap-3">
            <p className="display text-5xl tabular-nums" style={{ color: "var(--surface-tint)", WebkitTextStroke: "1.5px var(--ink)" }} aria-hidden="true">02</p>
            <div>
              <p className="eyebrow">Method</p>
              <h2 className="display mt-1 text-2xl sm:text-3xl">Build. Import. Measure. Compare.</h2>
            </div>
          </Reveal>
          <Stagger className="mt-6 grid gap-px border-2 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--line-strong)", background: "var(--line-strong)" }}>
            {[
              ["Build", "Portfolios, holdings, benchmarks — structured, user-owned, one workspace."],
              ["Import", "CSV daily closes with validation. Duplicates caught, gaps reported, nothing fabricated."],
              ["Measure", "Returns, volatility, drawdown, Sharpe, allocation, HHI. Nulls explained — never NaN."],
              ["Compare", "Benchmark-relative performance on aligned windows, with active return."],
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
            <p className="eyebrow mt-2">Risk, quantified</p>
            <h2 className="display mt-1 text-2xl sm:text-3xl">Every number <span className="hl">earns its place.</span></h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Cumulative and annualized returns, volatility, Sharpe ratio, maximum drawdown,
              allocation weights, concentration bands — computed live from your imported
              prices. Thin data is flagged, never hidden.
            </p>
            <Link to="/analysis" className="btn-brand mt-4 inline-flex px-4 py-2 text-[13px]">Run your analysis <ArrowRight size={14} /></Link>
          </Reveal>
          <Reveal className="solid card p-5" delay={0.1}>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              {[["Cumulative", "+8.4%", 82], ["Volatility", "14.2%", 45], ["Sharpe", "1.24", 68], ["Max drawdown", "-8.2%", 30]].map(([l, s, w]) => (
                <div key={l}>
                  <div className="flex justify-between text-xs font-bold"><span>{l}</span><span className="tabular-nums" style={{ color: "var(--muted)" }}>{s}</span></div>
                  <div className="bar-track mt-1 h-1.5"><div className="bar-fill h-1.5" style={{ width: `${w}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-semibold" style={{ color: "var(--muted)" }}>Demo figures — yours are computed live.</p>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
              {[["Allocation AAA", "55%", 55], ["Allocation BBB", "30%", 30], ["HHI", "0.39", 39], ["Tracking err.", "3.1%", 25]].map(([l, s, w]) => (
                <div key={l}>
                  <div className="flex justify-between text-xs font-bold"><span>{l}</span><span className="tabular-nums" style={{ color: "var(--muted)" }}>{s}</span></div>
                  <div className="bar-track mt-1 h-1.5"><div className="bar-fill h-1.5" style={{ width: `${w}%` }} /></div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="publish" className="grid items-center gap-8 border-t-2 py-12 lg:grid-cols-2" style={{ borderColor: "var(--line-strong)" }}>
          <Reveal className="solid card order-2 p-5 lg:order-1">
            <p className="eyebrow">Benchmark · demo comparison</p>
            <p className="mt-2 text-2xl font-extrabold tabular-nums">YOU +8.4% <span style={{ color: "var(--muted)" }}>vs NIFTY +6.1%</span></p>
            <div className="mt-3.5 space-y-2.5">
              {[["Active return +2.3pp", "w-3/5"], ["Tracking error 3.1%", "w-2/5"], ["Aligned window 3y", "w-4/5"]].map(([l, w]) => (
                <div key={l}>
                  <div className="text-xs font-bold">{l}</div>
                  <div className="bar-track mt-1 h-1.5"><div className={`bar-fill h-1.5 ${w}`} /></div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-semibold" style={{ color: "var(--muted)" }}>Demo figures — aligned windows only.</p>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <p className="display text-5xl tabular-nums" style={{ color: "var(--surface-tint)", WebkitTextStroke: "1.5px var(--ink)" }} aria-hidden="true">04</p>
            <p className="eyebrow mt-2">Benchmark honestly</p>
            <h2 className="display mt-1 text-2xl sm:text-3xl">Beat something measurable.</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Set any imported symbol as your benchmark. Performance is compared on
              identical date windows, with active return and tracking error — and a
              clear note whenever history does not overlap.
            </p>
            <Link to="/prices" className="btn-brand mt-4 inline-flex px-4 py-2 text-[13px]">Import price history <ArrowRight size={14} /></Link>
          </Reveal>
        </section>

        <Reveal className="my-6 border-2 px-6 py-10 text-center sm:px-10" style={{ borderColor: "var(--line-strong)", background: "var(--ink)" }}>
          <h2 className="display mx-auto max-w-2xl text-3xl sm:text-4xl" style={{ color: "var(--bg)" }}>
            STOP GUESSING. <span className="hl">START MEASURING.</span>
          </h2>
          <Link to="/portfolios" className="btn-brand mt-6 inline-flex px-6 py-3 text-sm">
            Analyze your portfolio <ArrowRight size={15} />
          </Link>
        </Reveal>
      </main>

      <footer className="border-t-2 py-5 text-center text-xs font-semibold" style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}>
        PORTFOLIO PILOT — MEASURE RISK · TRACK RETURN · STAY DIVERSIFIED
      </footer>
    </div>
  );
}
