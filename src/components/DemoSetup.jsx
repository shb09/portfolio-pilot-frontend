import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Play, RotateCcw, Sparkles } from "lucide-react";
import { api, apiError } from "../api/client";

/**
 * One-click demo portfolio built only from real backend APIs:
 * find-or-create portfolio → ensure benchmark → ensure holdings →
 * import bundled CSV → verify analysis. Every rerun resumes the same
 * portfolio: no duplicates, other portfolios untouched.
 */
export const DEMO_PORTFOLIO_NAME = "Interactive Demo";
export const DEMO_BENCHMARK = "NIFTY50";
export const DEMO_CSV_URL = "/demo/portfolio-pilot-demo-prices.csv";
const DEMO_HOLDINGS = [
  { symbol: "ALPHA", assetCategory: "Equity", quantity: 10 },
  { symbol: "BETA", assetCategory: "Equity", quantity: 20 },
  { symbol: "GAMMA", assetCategory: "Bond", quantity: 5 },
];

const STEPS = ["portfolio", "benchmark", "holdings", "prices", "analysis"];

const STEP_LABEL = {
  portfolio: "Create or resume the demo portfolio",
  benchmark: "Set the NIFTY 50 benchmark",
  holdings: "Add ALPHA, BETA and GAMMA holdings",
  prices: "Import simulated price history",
  analysis: "Verify the analysis computes",
};

export default function DemoSetup({ compact = false }) {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState({}); // step -> "done" | "active" | "failed"
  const [notes, setNotes] = useState({}); // step -> detail string
  const [failedStep, setFailedStep] = useState(null);
  const [demoId, setDemoId] = useState(null);
  const currentStep = useRef("portfolio");

  const fail = (step, message, patch) => {
    setStatus((s) => ({ ...s, [step]: "failed" }));
    setNotes((n) => ({ ...n, [step]: message }));
    setFailedStep(step);
    setRunning(false);
    if (patch?.demoId) setDemoId(patch.demoId);
  };

  const run = async (fromStep = "portfolio") => {
    setRunning(true);
    setFailedStep(null);
    const startAt = STEPS.indexOf(fromStep);
    currentStep.current = fromStep;
    let portfolioId = demoId;

    try {
      // 1. Portfolio: resume by exact name, else create.
      if (startAt <= 0) {
        currentStep.current = "portfolio";
        setStatus((s) => ({ ...s, portfolio: "active" }));
        const { data: all } = await api.get("/fin-portfolios");
        const existing = all.find((p) => p.name === DEMO_PORTFOLIO_NAME);
        if (existing) {
          portfolioId = existing.id;
          setNotes((n) => ({ ...n, portfolio: `Resumed “${DEMO_PORTFOLIO_NAME}” — nothing duplicated.` }));
        } else {
          const { data: created } = await api.post("/fin-portfolios", {
            name: DEMO_PORTFOLIO_NAME,
            description: "Simulated demonstration data — not live market prices.",
            benchmarkSymbol: DEMO_BENCHMARK,
          });
          portfolioId = created.id;
          setNotes((n) => ({ ...n, portfolio: "Created with the NIFTY 50 benchmark." }));
        }
        setDemoId(portfolioId);
        setStatus((s) => ({ ...s, portfolio: "done" }));
      } else if (!portfolioId) {
        const { data: all } = await api.get("/fin-portfolios");
        portfolioId = all.find((p) => p.name === DEMO_PORTFOLIO_NAME)?.id;
        if (!portfolioId) throw new Error("Demo portfolio is gone — restart from the first step.");
        setDemoId(portfolioId);
      }

      // 2. Benchmark: set only when blank, never overwrite a deliberate choice.
      if (startAt <= 1) {
        currentStep.current = "benchmark";
        setStatus((s) => ({ ...s, benchmark: "active" }));
        const { data: pf } = await api.get(`/fin-portfolios/${portfolioId}`);
        if (!pf.benchmarkSymbol) {
          await api.put(`/fin-portfolios/${portfolioId}`, {
            name: pf.name,
            description: pf.description,
            benchmarkSymbol: DEMO_BENCHMARK,
          });
          setNotes((n) => ({ ...n, benchmark: "Benchmark set to NIFTY50 (an index used for comparison)." }));
        } else {
          setNotes((n) => ({ ...n, benchmark: `Kept your benchmark ${pf.benchmarkSymbol}.` }));
        }
        setStatus((s) => ({ ...s, benchmark: "done" }));
      }

      // 3. Holdings: add only symbols not already held (409s are never triggered).
      if (startAt <= 2) {
        currentStep.current = "holdings";
        setStatus((s) => ({ ...s, holdings: "active" }));
        const { data: held } = await api.get(`/fin-portfolios/${portfolioId}/holdings`);
        const have = new Set(held.map((h) => String(h.symbol).toUpperCase()));
        const missing = DEMO_HOLDINGS.filter((h) => !have.has(h.symbol));
        for (const h of missing) {
          await api.post(`/fin-portfolios/${portfolioId}/holdings`, h);
        }
        setNotes((n) => ({
          ...n,
          holdings: missing.length === 0 ? "All three holdings already present." : `Added ${missing.map((h) => h.symbol).join(", ")}.`,
        }));
        setStatus((s) => ({ ...s, holdings: "done" }));
      }

      // 4. Prices: import the bundled CSV through the real importer.
      // Re-imports skip existing rows as duplicates — no double-counting.
      if (startAt <= 3) {
        currentStep.current = "prices";
        setStatus((s) => ({ ...s, prices: "active" }));
        const csv = await fetch(DEMO_CSV_URL);
        if (!csv.ok) throw new Error("Could not read the bundled demo CSV.");
        const blob = await csv.blob();
        const form = new FormData();
        form.append("file", new File([blob], "portfolio-pilot-demo-prices.csv", { type: "text/csv" }));
        const { data: result } = await api.post("/prices/import", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (result.imported === 0 && result.errors.length > 0) {
          throw new Error(result.errors[0].message || "All demo rows were rejected.");
        }
        setNotes((n) => ({
          ...n,
          prices: `${result.imported} imported · ${result.skippedDuplicates} duplicates skipped · ${result.errors.length} errors. Simulated data, clearly labelled.`,
        }));
        setStatus((s) => ({ ...s, prices: "done" }));
      }

      // 5. Analysis: confirm the backend actually values the portfolio.
      if (startAt <= 4) {
        currentStep.current = "analysis";
        setStatus((s) => ({ ...s, analysis: "active" }));
        const { data: report } = await api.get(`/fin-portfolios/${portfolioId}/analysis`);
        if (report?.valuation?.totalValue == null) {
          throw new Error(report?.returns?.reason || "Analysis has no valuation yet.");
        }
        setNotes((n) => ({ ...n, analysis: `Valued at ${Number(report.valuation.totalValue).toFixed(2)} as of ${report.valuation.asOf}.` }));
        setStatus((s) => ({ ...s, analysis: "done" }));
      }

      setRunning(false);
    } catch (err) {
      fail(currentStep.current, apiError(err, "This step failed — nothing else was changed."), { demoId: portfolioId });
    }
  };

  const done = STEPS.every((s) => status[s] === "done");

  return (
    <div className="tint rounded-[0.9rem] p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="icon-tile" aria-hidden="true"><Sparkles size={17} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold tracking-tight">Try it with simulated data</h2>
          <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--muted)" }}>
            Builds the “{DEMO_PORTFOLIO_NAME}” portfolio from the bundled demo CSV.
            Simulated prices — not live market data. Safe to rerun: it resumes instead of duplicating.
          </p>
        </div>
        {!done && (
          <button
            onClick={() => run(failedStep || "portfolio")}
            disabled={running}
            className="btn-brand px-4 py-2 text-[13px]"
          >
            <Play size={15} /> {running ? "Setting up…" : failedStep ? "Retry demo setup" : "Load Interactive Demo"}
          </button>
        )}
      </div>

      {(running || failedStep || done) && (
        <ol className="mt-3 space-y-1.5" aria-live="polite">
          {STEPS.map((s) => (
            <li key={s} className="flex items-start gap-2 text-[13px]">
              <span className="mt-0.5 shrink-0 tabular-nums" aria-hidden="true">
                {status[s] === "done" ? <Check size={15} style={{ color: "var(--lime)" }} /> : status[s] === "active" ? (
                  <span className="text-[13px] font-extrabold" style={{ color: "var(--brand)" }}>…</span>
                ) : (
                  <RotateCcw size={14} style={{ color: status[s] === "failed" ? "var(--danger)" : "var(--muted)" }} />
                )}
              </span>
              <span>
                <span className="font-bold">{STEP_LABEL[s]}</span>
                {status[s] === "failed" && (
                  <span className="font-semibold" style={{ color: "var(--danger)" }}> — failed: {notes[s]} </span>
                )}
                {status[s] !== "failed" && notes[s] && (
                  <span style={{ color: "var(--muted)" }}> — {notes[s]}</span>
                )}
                {status[s] === "failed" && (
                  <button onClick={() => run(s)} disabled={running} className="btn-ghost ml-2 px-2.5 py-1 text-xs font-bold">
                    Retry from here
                  </button>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}

      {done && demoId && !compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => navigate(`/portfolios/${demoId}`)} className="btn-brand px-4 py-2 text-[13px]">
            Open the demo portfolio →
          </button>
          <Link to="/walkthrough" className="btn-ghost px-4 py-2 text-[13px] font-bold">
            Start the guided walkthrough →
          </Link>
        </div>
      )}
    </div>
  );
}
