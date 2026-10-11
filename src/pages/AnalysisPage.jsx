import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Crosshair, Gauge, Scale } from "lucide-react";
import { api, apiError } from "../api/client";
import Stat from "../components/Stat";

function fmt(value, digits = 2) {
  if (value == null) return "—";
  return Number(value).toFixed(digits);
}

function fmtPct(value, digits = 2) {
  if (value == null) return "—";
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function Metric({ label, value, hint }) {
  return (
    <div className="solid card p-4">
      <p className="display text-[1.7rem] tabular-nums">{value}</p>
      <p className="eyebrow mt-1" style={{ fontSize: "0.6rem" }}>{label}</p>
      {hint && <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{hint}</p>}
    </div>
  );
}

/** Quantitative report for the selected portfolio — all backend-computed. */
export default function AnalysisPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [selected, setSelected] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/fin-portfolios")
      .then((res) => {
        setPortfolios(res.data);
        if (res.data.length > 0) setSelected(String(res.data[0].id));
      })
      .catch((err) => setError(apiError(err, "Could not load portfolios")));
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
        aligned dates. Nulls always carry a reason — never NaN.
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
            <Metric label="Total value" value={fmt(report.valuation.totalValue)} />
            <Metric label="Positions" value={String(report.valuation.positions.length)} />
            <Metric label="Cumulative" value={fmtPct(r?.cumulativeReturn)} hint={r?.reason || `${r?.observations ?? 0} observations`} />
            <Metric label="Max drawdown" value={fmtPct(r?.maxDrawdown)} />
          </div>

          <h2 className="mt-5 text-sm font-extrabold">Risk & return</h2>
          <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Metric label="Annualized return" value={fmtPct(r?.annualizedReturn)} />
            <Metric label="Volatility (ann.)" value={fmtPct(r?.annualizedVolatility)} />
            <Metric label="Sharpe (rf 0)" value={fmt(r?.sharpeRatio)} />
            <Metric label="HHI concentration" value={fmt(report.allocation.hhi, 4)} hint={report.allocation.hhiBand} />
          </div>

          <h2 className="mt-5 text-sm font-extrabold">Positions</h2>
          {report.valuation.positions.length === 0 ? (
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
              No holdings yet. <Link to={selected ? `/portfolios/${selected}` : "/portfolios"} className="font-bold underline" style={{ color: "var(--ink)" }}>Add holdings →</Link>
            </p>
          ) : (
            <div className="solid card mt-2 overflow-x-auto">
              <table className="table-soft">
                <thead><tr><th scope="col">Symbol</th><th scope="col">Qty</th><th scope="col">Last</th><th scope="col">Value</th><th scope="col">Weight</th></tr></thead>
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

          <h2 className="mt-5 text-sm font-extrabold">Benchmark</h2>
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
