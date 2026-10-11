import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, apiError } from "../api/client";
import CrudPage from "../components/CrudPage";
import FinancialTermHelp from "../components/FinancialTermHelp";
import { MODULES } from "../config/modules";

function fmt(value, digits = 2) {
  if (value == null) return "—";
  return Number(value).toFixed(digits);
}

function fmtPct(value, digits = 2) {
  if (value == null) return "—";
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

/**
 * Portfolio detail: identity header, live analysis cards with inline
 * explanations, allocation bars from real weights — then holdings.
 * Every figure comes from GET analysis; missing metrics show reasons.
 */
export default function HoldingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const selected = portfolios.find((p) => String(p.id) === String(id));

  useEffect(() => {
    api.get("/fin-portfolios")
      .then((res) => setPortfolios(res.data))
      .catch((err) => setError(apiError(err, "Could not load portfolios")));
  }, []);

  useEffect(() => {
    if (!id) return;
    setReport(null);
    api.get(`/fin-portfolios/${id}/analysis`)
      .then((res) => setReport(res.data))
      .catch(() => setReport(null));
  }, [id]);

  const config = { ...MODULES.holdings, endpoint: `/fin-portfolios/${id}/holdings` };
  const r = report?.returns;
  const weights = report?.allocation?.weights
    ? Object.entries(report.allocation.weights).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div>
      <p className="eyebrow">Portfolios / Detail</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="display text-[1.55rem]">{selected ? selected.name : "Portfolio"}</h1>
        <label htmlFor="pf-pick" className="sr-only">Portfolio</label>
        <select
          id="pf-pick"
          className="input ml-auto w-auto"
          value={id || ""}
          onChange={(e) => navigate(e.target.value ? `/portfolios/${e.target.value}` : "/portfolios")}
        >
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {selected && (
        <p className="mt-1 max-w-xl text-[13px]" style={{ color: "var(--muted)" }}>
          {selected.holdingCount === 1 ? "1 holding" : `${selected.holdingCount || 0} holdings`}
          {selected.benchmarkSymbol ? ` · benchmark ${selected.benchmarkSymbol}` : " · no benchmark set"}
          {selected.description ? ` · ${selected.description}` : ""}
        </p>
      )}
      {error && <p role="alert" className="mt-3 text-sm font-semibold" style={{ color: "var(--danger)" }}>{error}</p>}
      {selected == null && !error && (
        <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
          Select a portfolio above, or <Link to="/portfolios" className="font-bold underline" style={{ color: "var(--ink)" }}>manage portfolios</Link>.
        </p>
      )}

      {selected != null && report && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-extrabold">Snapshot {report.valuation.asOf && <span className="font-semibold" style={{ color: "var(--muted)" }}>as of {report.valuation.asOf}</span>}</h2>
            <Link to={`/analysis?portfolio=${selected.id}`} className="ml-auto text-[13px] font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>
              Full analysis →
            </Link>
            <Link to="/learn" className="text-[13px] font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>
              Learn these metrics
            </Link>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="solid card glass-metric p-4">
              <p className="display text-[1.5rem] tabular-nums">{fmt(report.valuation.totalValue)}</p>
              <p className="eyebrow mt-1" style={{ fontSize: "0.6rem" }}>Total value <FinancialTermHelp termId="holding" context={`Quantity × latest price per holding, summed. ${report.valuation.positions.length} position(s) valued.`} /></p>
            </div>
            <div className="solid card glass-metric p-4">
              <p className="display text-[1.5rem] tabular-nums">{fmtPct(r?.cumulativeReturn)}</p>
              <p className="eyebrow mt-1" style={{ fontSize: "0.6rem" }}>Cumulative <FinancialTermHelp termId="cumulative-return" context={r?.cumulativeReturn == null ? (r?.reason || "Not enough valued dates yet — import prices for every holding.") : `Last ÷ first − 1 over ${r.startDate} → ${r.endDate} (${r.observations} observations).`} /></p>
            </div>
            <div className="solid card glass-metric p-4">
              <p className="display text-[1.5rem] tabular-nums">{fmtPct(r?.annualizedVolatility)}</p>
              <p className="eyebrow mt-1" style={{ fontSize: "0.6rem" }}>Volatility <FinancialTermHelp termId="volatility" context={r?.annualizedVolatility == null ? (r?.reason || "Needs at least 2 return observations.") : `Sample deviation of period returns × √252 over ${r.observations} observations.`} /></p>
            </div>
            <div className="solid card glass-metric p-4">
              <p className="display text-[1.5rem] tabular-nums">{fmt(report.allocation.hhi, 4)}</p>
              <p className="eyebrow mt-1" style={{ fontSize: "0.6rem" }}>HHI · {report.allocation.hhiBand} <FinancialTermHelp termId="hhi" context={report.allocation.hhi == null ? "No valued positions yet — HHI needs position weights." : `Squared value-weights summed: ${weights.map(([s, w]) => `${s} ${Math.round(w * 100)}%`).join(" · ")}. Band “${report.allocation.hhiBand}” is descriptive, not advice.`} /></p>
            </div>
          </div>

          {weights.length > 0 && (
            <div className="solid card glass-panel mt-2.5 p-4">
              <h3 className="text-sm font-extrabold">Allocation <FinancialTermHelp termId="portfolio" context="Each holding's share of total value at latest prices." /></h3>
              <ul className="mt-2 space-y-1.5">
                {weights.map(([symbol, w]) => (
                  <li key={symbol} className="flex items-center gap-2.5 text-[13px]">
                    <span className="w-20 shrink-0 font-extrabold">{symbol}</span>
                    <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: "var(--chip)" }} role="img" aria-label={`${symbol} ${Math.round(w * 100)} percent of portfolio value`}>
                      <span className="block h-full rounded-full" style={{ width: `${Math.max(2, Math.round(w * 100))}%`, background: "var(--lime)" }} />
                    </span>
                    <span className="w-14 shrink-0 text-right font-bold tabular-nums">{fmtPct(w, 1)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.valuation.missingPrices?.length > 0 && (
            <p className="mt-2 text-[13px]" style={{ color: "var(--muted)" }}>
              No prices yet for: {report.valuation.missingPrices.join(", ")} — import them on the <Link to="/prices" className="font-bold underline" style={{ color: "var(--ink)" }}>prices page</Link>.
            </p>
          )}
        </div>
      )}

      {selected != null && (
        <div className="mt-4" key={id}>
          <CrudPage config={config} />
        </div>
      )}
    </div>
  );
}
