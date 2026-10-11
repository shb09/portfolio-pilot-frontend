import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Activity, Crosshair, Gauge, Scale } from "lucide-react";
import { api, apiError } from "../api/client";
import FinancialTermHelp from "../components/FinancialTermHelp";
import Stat from "../components/Stat";

function fmt(value, digits = 2) {
  if (value == null) return "—";
  return Number(value).toFixed(digits);
}

function fmtPct(value, digits = 2) {
  if (value == null) return "—";
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function Metric({ label, value, hint, termId, context }) {
  return (
    <div className="solid card p-4">
      <p className="display text-[1.7rem] tabular-nums">{value}</p>
      <p className="eyebrow mt-1" style={{ fontSize: "0.6rem" }}>{label} {termId && <FinancialTermHelp termId={termId} context={context} />}</p>
      {hint && <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{hint}</p>}
    </div>
  );
}

/** Quantitative report for the selected portfolio — all backend-computed. */
export default function AnalysisPage() {
  const [params] = useSearchParams();
  const [portfolios, setPortfolios] = useState([]);
  const [selected, setSelected] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/fin-portfolios")
      .then((res) => {
        setPortfolios(res.data);
        if (res.data.length > 0) {
          const wanted = params.get("portfolio");
          setSelected(res.data.some((p) => String(p.id) === String(wanted)) ? String(wanted) : String(res.data[0].id));
        }
      })
      .catch((err) => setError(apiError(err, "Could not load portfolios")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) {
      setReport(null);
      return;
    }
    setLoading(true);
    setError("");
    api.get(`/fin-portfolios/${selected}/analysis`)
      .then((res) => setReport(res.data))
      .catch((err) => setError(apiError(err, "Could not load analysis")))
      .finally(() => setLoading(false));
  }, [selected]);

  const r = report?.returns;
  const b = report?.benchmark;

  return (
    <div>
      <p className="eyebrow">Analysis / Risk & return</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="display text-[1.55rem]">Portfolio analysis</h1>
        <label htmlFor="an-pf" className="sr-only">Portfolio</label>
        <select id="an-pf" className="input ml-auto w-auto" value={selected}
          onChange={(e) => setSelected(e.target.value)}>
          {portfolios.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <p className="mt-1 max-w-xl text-[13px]" style={{ color: "var(--muted)" }}>
        Simple daily returns, 252-day annualization, sample volatility, Sharpe at zero
        risk-free rate, maximum drawdown, HHI concentration, benchmark comparison on
        aligned dates. Nulls always carry a reason — never NaN.{" "}
        <Link to="/learn" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Learn these metrics</Link>
      </p>

      {error && (
        <div className="solid card mt-4 flex items-center gap-3 px-4 py-3">
          <p className="text-[13px] font-semibold" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}
      {loading && <div className="mt-4 space-y-2" aria-label="Loading analysis"><div className="skeleton h-24" /><div className="skeleton h-40" /></div>}

      {!loading && !error && report && (
        <>
          {report.warnings.length > 0 && (
            <ul className="tint mt-4 space-y-1 rounded-[0.9rem] p-4 text-[13px] font-medium">
              {report.warnings.map((w, i) => <li key={i}>→ {w}</li>)}
            </ul>
          )}

          <h2 className="mt-5 text-sm font-extrabold">Valuation {report.valuation.asOf && <span style={{ color: "var(--muted)" }}>as of {report.valuation.asOf}</span>}</h2>
          <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Metric label="Total value" value={fmt(report.valuation.totalValue)} termId="holding"
              context={`${report.valuation.positions.length} position(s) valued at latest prices. Missing prices: ${report.valuation.missingPrices?.length ? report.valuation.missingPrices.join(", ") : "none"}.`} />
            <Metric label="Positions" value={String(report.valuation.positions.length)} termId="holding"
              context="One holding counts once, however many units it contains." />
            <Metric label="Cumulative" value={fmtPct(r?.cumulativeReturn)} hint={r?.reason || `${r?.observations ?? 0} observations`} termId="cumulative-return"
              context={r?.cumulativeReturn == null ? (r?.reason || "Needs at least 2 valued dates.") : `Last ÷ first − 1 from ${r.startDate} to ${r.endDate} across ${r.observations} return observations.`} />
            <Metric label="Max drawdown" value={fmtPct(r?.maxDrawdown)} termId="max-drawdown"
              context={r?.maxDrawdown == null ? (r?.reason || "Needs at least 2 valued dates.") : `Largest peak-to-trough fall of the value series between ${r.startDate} and ${r.endDate}.`} />
          </div>

          <h2 className="mt-5 text-sm font-extrabold">Risk & return</h2>
          <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Metric label="Annualized return" value={fmtPct(r?.annualizedReturn)} termId="annualized-return"
              context={r?.annualizedReturn == null ? (r?.reason || "Needs at least 1 return observation.") : `(1 + cumulative)^(252 ÷ ${r.observations}) − 1 over ${r.observations} observations.`} />
            <Metric label="Volatility (ann.)" value={fmtPct(r?.annualizedVolatility)} termId="volatility"
              context={r?.annualizedVolatility == null ? (r?.reason || "Needs at least 2 return observations.") : `Sample deviation of period returns × √252 over ${r.observations} observations.`} />
            <Metric label="Sharpe (rf 0)" value={fmt(r?.sharpeRatio)} termId="sharpe"
              context={r?.sharpeRatio == null ? (r?.reason || "Unavailable when volatility is missing or zero — a flat series has no meaningful Sharpe.") : `Average period return × 252 ÷ annualized volatility, with risk-free rate fixed at zero.`} />
            <Metric label="HHI concentration" value={fmt(report.allocation.hhi, 4)} hint={report.allocation.hhiBand} termId="hhi"
              context={report.allocation.hhi == null ? "No valued positions yet — HHI needs position weights." : `Squared value-weights summed: ${Object.entries(report.allocation.weights).sort((a, b) => b[1] - a[1]).map(([s, w]) => `${s} ${Math.round(w * 100)}%`).join(" · ")}. Band “${report.allocation.hhiBand}” is descriptive, not advice.`} />
          </div>

          <h2 className="mt-5 text-sm font-extrabold">Positions <FinancialTermHelp termId="holding" context="Each row is one holding: symbol, units owned, latest price, and its share of total value." /></h2>
          {report.valuation.positions.length === 0 ? (
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
              No holdings yet. <Link to={selected ? `/portfolios/${selected}` : "/portfolios"} className="font-bold underline" style={{ color: "var(--ink)" }}>Add holdings →</Link>
            </p>
          ) : (
            <div className="solid card mt-2 overflow-x-auto">
              <table className="table-soft">
                <thead><tr><th scope="col">Symbol</th><th scope="col">Qty</th><th scope="col">Last</th><th scope="col">Value</th><th scope="col">Weight <FinancialTermHelp termId="portfolio" context="Share of total value at latest prices. These weights feed the HHI concentration figure." /></th></tr></thead>
                <tbody>
                  {report.valuation.positions.map((p) => (
                    <tr key={p.symbol}>
                      <td className="font-extrabold">{p.symbol}</td>
                      <td className="tabular-nums">{p.quantity}</td>
                      <td className="tabular-nums">{p.lastPrice == null ? "—" : `${fmt(p.lastPrice)} (${p.lastDate})`}</td>
                      <td className="tabular-nums">{fmt(p.value)}</td>
                      <td className="tabular-nums">{fmtPct(p.weight)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2 className="mt-5 text-sm font-extrabold">Benchmark <FinancialTermHelp termId="benchmark-comparison"
            context={b?.symbol == null ? (b?.reason || "Set a benchmark symbol on the portfolio to enable comparison.") : b?.activeReturn == null ? (b?.reason || `Only ${b?.alignedObservations ?? 0} shared observations — import overlapping history.`) : `Over ${b.alignedObservations} shared observations, this portfolio sits ${b.activeReturn >= 0 ? "ahead of" : "behind"} ${b.symbol} by ${Math.abs(b.activeReturn * 100).toFixed(2)} percentage points. Past gaps do not predict future ones.`} /></h2>
          <div className="solid card mt-2 p-4">
            {b?.symbol == null ? (
              <p className="text-[13px]" style={{ color: "var(--muted)" }}>
                {b?.reason} Set it on the <Link to="/portfolios" className="font-bold underline" style={{ color: "var(--ink)" }}>portfolios page</Link>.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Stat label={`${b.symbol} cumulative`} value={fmtPct(b.benchmarkCumulativeReturn)} icon={<Gauge size={18} />} />
                <Stat label={`${b.symbol} annualized`} value={fmtPct(b.benchmarkAnnualizedReturn)} icon={<Activity size={18} />} />
                <Stat label="Active return" value={fmtPct(b.activeReturn)} icon={<Crosshair size={18} />} />
                <Stat label="Tracking error" value={fmtPct(b.trackingError)} icon={<Scale size={18} />} />
              </div>
            )}
            {b?.reason && b?.symbol != null && (
              <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>{b.reason}</p>
            )}
          </div>
        </>
      )}

      {!loading && !error && portfolios.length === 0 && (
        <div className="mx-auto max-w-sm py-12 text-center">
          <p className="eyebrow" style={{ color: "var(--ink)" }}>NO PORTFOLIO YET</p>
          <p className="mx-auto mt-1.5 max-w-xs text-[13px]" style={{ color: "var(--muted)" }}>
            Create a portfolio first, then return here for its analysis.
          </p>
          <Link to="/portfolios" className="btn-brand mx-auto mt-4 inline-flex px-4 py-2 text-[13px]">Go to portfolios</Link>
        </div>
      )}
    </div>
  );
}
