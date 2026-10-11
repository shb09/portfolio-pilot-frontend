import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { api, apiError } from "../api/client";
import FinancialTermHelp from "../components/FinancialTermHelp";
import { DEMO_BENCHMARK, DEMO_PORTFOLIO_NAME } from "../components/DemoSetup";

const WALK_KEY = "pp_walkthrough";

function fmtPct(value, digits = 2) {
  if (value == null) return "—";
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

/**
 * Six-step guided tour of a real demo portfolio. Every check reads live
 * API data — a step counts as complete only when the underlying data
 * genuinely exists. Never blocks normal usage; skippable and restartable.
 */
export default function WalkthroughPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [report, setReport] = useState(null);
  const [symbols, setSymbols] = useState([]);
  const [sampleRows, setSampleRows] = useState([]);
  const [active, setActive] = useState(0);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WALK_KEY) || "null");
      if (saved?.skipped) setSkipped(true);
    } catch { /* fresh start */ }
    let cancelled = false;
    (async () => {
      try {
        const { data: all } = await api.get("/fin-portfolios");
        const demo = all.find((p) => p.name === DEMO_PORTFOLIO_NAME) || null;
        if (cancelled) return;
        setPortfolio(demo);
        if (demo) {
          const [h, rep, syms] = await Promise.all([
            api.get(`/fin-portfolios/${demo.id}/holdings`).then((r) => r.data).catch(() => []),
            api.get(`/fin-portfolios/${demo.id}/analysis`).then((r) => r.data).catch(() => null),
            api.get("/prices/symbols").then((r) => r.data).catch(() => []),
          ]);
          if (cancelled) return;
          setHoldings(h);
          setReport(rep);
          setSymbols(syms);
          const first = h[0]?.symbol || syms[0];
          if (first) {
            const rows = await api.get("/prices", { params: { symbol: first, limit: 60 } })
              .then((r) => r.data).catch(() => []);
            if (!cancelled) setSampleRows(rows);
          }
        }
      } catch (err) {
        if (!cancelled) setError(apiError(err, "Could not load the demo walkthrough"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const skipAll = () => {
    localStorage.setItem(WALK_KEY, JSON.stringify({ skipped: true }));
    setSkipped(true);
  };
  const restart = () => {
    localStorage.removeItem(WALK_KEY);
    setSkipped(false);
    setActive(0);
  };

  const r = report?.returns;
  const b = report?.benchmark;
  const dates = sampleRows.map((x) => x.date).sort();
  const window = dates.length > 1 ? `${dates[0]} → ${dates[dates.length - 1]}` : null;

  const checks = [
    portfolio != null,
    holdings.length > 0,
    symbols.length > 0 && sampleRows.length > 1,
    r?.cumulativeReturn != null,
    b?.symbol != null && b?.activeReturn != null,
  ];
  const allDone = checks.every(Boolean);

  const steps = [
    {
      title: "Your portfolio",
      to: portfolio ? `/portfolios/${portfolio.id}` : "/portfolios",
      body: portfolio
        ? `“${portfolio.name}” holds ${holdings.length} position(s)${portfolio.benchmarkSymbol ? ` against the ${portfolio.benchmarkSymbol} benchmark` : " with no benchmark yet"}. A portfolio is simply this named basket, analysed as one group.`
        : "No demo portfolio yet — load it from the portfolios page first.",
      term: "portfolio",
    },
    {
      title: "Your holdings",
      to: portfolio ? `/portfolios/${portfolio.id}` : "/portfolios",
      body: holdings.length > 0
        ? holdings.map((h) => `${h.quantity} × ${h.symbol}${h.assetCategory ? ` (${h.assetCategory})` : ""}`).join(" · ")
        : "Holdings appear here once the demo setup adds them.",
      term: "holding",
    },
    {
      title: "Your price history",
      to: "/prices",
      body: sampleRows.length > 1
        ? `${sampleRows.length} observed closes${window ? ` spanning ${window}` : ""} across ${symbols.length} symbol(s). Returns are computed once per observation period — monthly rows give monthly returns.`
        : "Price history appears here once the demo CSV is imported.",
      term: "price-history",
    },
    {
      title: "Your risk and return",
      to: portfolio ? `/analysis?portfolio=${portfolio.id}` : "/analysis",
      body: r?.cumulativeReturn != null
        ? `Cumulative ${fmtPct(r.cumulativeReturn)} over ${r.observations} observations, volatility ${fmtPct(r.annualizedVolatility)}, Sharpe ${r.sharpeRatio == null ? "—" : Number(r.sharpeRatio).toFixed(2)} (rf 0), drawdown ${fmtPct(r.maxDrawdown)}, HHI ${report.allocation.hhi == null ? "—" : Number(report.allocation.hhi).toFixed(4)} (${report.allocation.hhiBand}).`
        : "Risk figures appear once at least 2 valued dates exist.",
      term: "sharpe",
    },
    {
      title: "Your benchmark",
      to: portfolio ? `/analysis?portfolio=${portfolio.id}` : "/analysis",
      body: b?.symbol != null && b?.activeReturn != null
        ? `${b.symbol} returned ${fmtPct(b.benchmarkCumulativeReturn)} over the identical window; this portfolio sits ${b.activeReturn >= 0 ? "ahead by" : "behind by"} ${fmtPct(Math.abs(b.activeReturn))}. Tracking error ${fmtPct(b.trackingError)}.`
        : "The comparison appears once the benchmark has overlapping price history.",
      term: "benchmark-comparison",
    },
    {
      title: "What you learned",
      to: "/learn",
      body: allDone
        ? "Portfolio, holdings, price history, return, volatility, Sharpe, drawdown, HHI, and benchmark comparison — each explored with your own numbers above. Revisit any of them in the glossary."
        : "Finish the steps above — each unlocks from real data — then return here for the recap.",
      term: "simulated-data",
    },
  ];

  if (loading) {
    return (
      <div>
        <p className="eyebrow">Learn / Demo walkthrough</p>
        <div className="mt-4 space-y-2" aria-label="Loading walkthrough"><div className="skeleton h-24" /><div className="skeleton h-24" /></div>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Learn / Demo walkthrough</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="display text-[1.55rem]">Guided demo walkthrough</h1>
        <div className="ml-auto flex gap-2">
          {!skipped && <button onClick={skipAll} className="btn-ghost px-3.5 py-2 text-[13px] font-bold">Skip all</button>}
          <button onClick={restart} className="btn-ghost px-3.5 py-2 text-[13px] font-bold">Restart</button>
        </div>
      </div>
      <p className="mt-1 max-w-xl text-[13px]" style={{ color: "var(--muted)" }}>
        Six steps through a real demo portfolio. A step completes only when its data genuinely
        exists — all prices here are simulated practice data, never live quotes.
      </p>
      {error && <p role="alert" className="mt-3 text-sm font-semibold" style={{ color: "var(--danger)" }}>{error}</p>}

      {!portfolio && !error && (
        <div className="solid card mx-auto mt-4 max-w-md p-6 text-center">
          <p className="eyebrow" style={{ color: "var(--ink)" }}>NO DEMO YET</p>
          <p className="mx-auto mt-1.5 max-w-xs text-[13px]" style={{ color: "var(--muted)" }}>
            Load the “{DEMO_PORTFOLIO_NAME}” portfolio (benchmark {DEMO_BENCHMARK}) to begin the walkthrough.
          </p>
          <Link to="/portfolios" className="btn-brand mx-auto mt-4 inline-flex px-4 py-2 text-[13px]">Go to portfolios</Link>
        </div>
      )}

      {portfolio && (
        <ol className="mt-4 space-y-2.5">
          {steps.map((s, i) => {
            const complete = i < 5 ? checks[i] : allDone;
            const open = i === active;
            return (
              <li key={s.title} className="solid card p-4">
                <button
                  onClick={() => setActive(open ? -1 : i)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-2.5 text-left"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold"
                    style={complete
                      ? { background: "var(--lime)", color: "#171717" }
                      : { border: "1.5px solid var(--line-strong)", color: "var(--muted)" }}
                    aria-hidden="true"
                  >
                    {complete ? <Check size={14} /> : i + 1}
                  </span>
                  <span className="text-[15px] font-extrabold tracking-tight">
                    Step {i + 1} — {s.title}
                    <span className="sr-only">{complete ? " (complete)" : " (not yet complete)"}</span>
                  </span>
                </button>
                {open && (
                  <div className="mt-2 pl-[2.1rem]">
                    <p className="max-w-xl text-[13px] leading-relaxed">{s.body}</p>
                    <p className="mt-1.5">
                      <FinancialTermHelp termId={s.term}
                        context={complete ? "The figures above are this demo portfolio's own computed values." : "Complete this step's data to unlock a live interpretation here."} />
                      <Link to={s.to} className="ml-2 text-[13px] font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>
                        Open this page →
                      </Link>
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {i < steps.length - 1 && (
                        <button onClick={() => setActive(i + 1)} className="btn-brand px-3.5 py-1.5 text-[12.5px]">
                          Next step →
                        </button>
                      )}
                      <Link to="/learn" className="btn-ghost px-3.5 py-1.5 text-[12.5px] font-bold">Glossary</Link>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
