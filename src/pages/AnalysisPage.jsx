import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Activity, Crosshair, Download, Gauge, Scale } from "lucide-react";
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
    <div className="solid card glass-metric p-4">
      <p className="display text-[1.7rem] tabular-nums">{value}</p>
      <p className="eyebrow mt-1" style={{ fontSize: "0.6rem" }}>{label} {termId && <FinancialTermHelp termId={termId} context={context} />}</p>
      {hint && <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{hint}</p>}
    </div>
  );
}

function downloadCsv(filename, header, rows) {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const text = [header.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Interactive performance chart from the backend value series. Both lines
 * are rebased to 100 at the window start for visual comparison; every
 * tooltip shows the real date and real values. Keyboard: focus the chart
 * and use ←/→ to inspect points — screen readers get a text summary.
 */
function PerformanceChart({ series, benchmarkSymbol, view }) {
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  const W = 620;
  const H = 230;
  const PAD = { l: 8, r: 8, t: 12, b: 22 };

  const points = useMemo(() => {
    const rows = (series || []).filter((p) => p.value != null && p.value > 0);
    if (rows.length === 0) return [];
    const base = rows[0].value;
    const benchRows = rows.filter((p) => p.benchmarkValue != null && p.benchmarkValue > 0);
    const benchBase = benchRows.length > 0 ? benchRows[0].benchmarkValue : null;
    let peak = 0;
    return rows.map((p) => {
      const norm = (p.value / base) * 100;
      peak = Math.max(peak, norm);
      return {
        date: p.date,
        value: p.value,
        bench: p.benchmarkValue,
        norm,
        benchNorm: benchBase != null && p.benchmarkValue != null ? (p.benchmarkValue / benchBase) * 100 : null,
        drawdown: (norm / peak - 1) * 100,
      };
    });
  }, [series]);

  const isDrawdown = view === "drawdown";
  const vals = points.map((p) => (isDrawdown ? p.drawdown : p.norm));
  const benchVals = isDrawdown ? [] : points.map((p) => p.benchNorm).filter((v) => v != null);
  const all = [...vals, ...benchVals];
  const lo = all.length ? Math.min(...all) : 0;
  const hi = all.length ? Math.max(...all) : 100;
  const span = hi - lo || 1;
  const x = (i) => PAD.l + (points.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i * (W - PAD.l - PAD.r)) / (points.length - 1));
  const y = (v) => PAD.t + (1 - (v - lo) / span) * (H - PAD.t - PAD.b);
  const line = (pick) => points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(pick(p)).toFixed(1)}`).join(" ");

  const pickIndex = (clientX) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || points.length === 0) return null;
    const px = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    points.forEach((_, i) => {
      const d = Math.abs(x(i) - px);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  };

  const onKey = (e) => {
    if (points.length === 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setHover((h) => {
        const cur = h == null ? (e.key === "ArrowRight" ? -1 : points.length) : h;
        const next = e.key === "ArrowRight" ? Math.min(points.length - 1, cur + 1) : Math.max(0, cur - 1);
        return next;
      });
    } else if (e.key === "Escape") {
      setHover(null);
    }
  };

  if (points.length === 0) return null;
  const sel = hover != null ? points[hover] : null;

  return (
    <div>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        tabIndex={0}
        onKeyDown={onKey}
        onMouseMove={(e) => setHover(pickIndex(e.clientX))}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => setHover(pickIndex(e.touches[0].clientX))}
        onTouchMove={(e) => setHover(pickIndex(e.touches[0].clientX))}
        aria-label={isDrawdown
          ? `Drawdown chart, ${points.length} dates, worst ${Math.min(...vals).toFixed(2)} percent`
          : `Performance chart rebased to 100, ${points.length} dates from ${points[0].date} to ${points[points.length - 1].date}`}
      >
        <title>{isDrawdown ? "Drawdown over time" : "Portfolio versus benchmark, rebased to 100"}</title>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + f * (H - PAD.t - PAD.b)} y2={PAD.t + f * (H - PAD.t - PAD.b)}
            stroke="var(--line)" strokeWidth="1" />
        ))}
        {points[0].benchNorm != null && !isDrawdown && (
          <path d={line((p) => p.benchNorm)} fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 4" />
        )}
        <path d={line((p) => (isDrawdown ? p.drawdown : p.norm))} fill="none" stroke="var(--lime)" strokeWidth="2.5" strokeLinejoin="round" />
        {sel && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke="var(--line-strong)" strokeWidth="1" />
            <circle cx={x(hover)} cy={y(isDrawdown ? sel.drawdown : sel.norm)} r="4.5" fill="var(--lime)" stroke="var(--ink)" strokeWidth="1.5" />
          </g>
        )}
        <text x={PAD.l} y={H - 6} fontSize="10" fill="var(--muted)">{points[0].date}</text>
        <text x={W - PAD.r} y={H - 6} fontSize="10" fill="var(--muted)" textAnchor="end">{points[points.length - 1].date}</text>
      </svg>
      <div className="mt-1 flex min-h-5 flex-wrap gap-x-4 gap-y-0.5 text-[12.5px]" aria-live="polite">
        {sel ? (
          <>
            <span className="font-extrabold">{sel.date}</span>
            <span>Value <strong className="tabular-nums">{fmt(sel.value)}</strong></span>
            {sel.bench != null && <span>{benchmarkSymbol} <strong className="tabular-nums">{fmt(sel.bench)}</strong></span>}
            {isDrawdown && <span>Drawdown <strong className="tabular-nums">{sel.drawdown.toFixed(2)}%</strong></span>}
          </>
        ) : (
          <span style={{ color: "var(--muted)" }}>Hover, touch, or focus and use ← → to inspect each date with real values.</span>
        )}
      </div>
    </div>
  );
}

/** Quantitative report for the selected portfolio — all backend-computed. */
export default function AnalysisPage() {
  const [params] = useSearchParams();
  const [portfolios, setPortfolios] = useState([]);
  const [selected, setSelected] = useState("");
  const [report, setReport] = useState(null);
  const [bounds, setBounds] = useState({ min: "", max: "" });
  const [range, setRange] = useState({ start: "", end: "" });
  const [view, setView] = useState("performance");
  const [benchEdit, setBenchEdit] = useState("");
  const [benchBusy, setBenchBusy] = useState(false);
  const [benchMsg, setBenchMsg] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("weight-desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async (id, start, end) => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (start) qs.set("start", start);
      if (end) qs.set("end", end);
      const suffix = qs.toString() ? `?${qs}` : "";
      const { data } = await api.get(`/fin-portfolios/${id}/analysis${suffix}`);
      setReport(data);
      return data;
    } catch (err) {
      setError(apiError(err, "Could not load analysis"));
      setReport(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/fin-portfolios")
      .then((res) => {
        setPortfolios(res.data);
        if (res.data.length > 0) {
          const wanted = params.get("portfolio");
          const first = res.data.some((p) => String(p.id) === String(wanted)) ? String(wanted) : String(res.data[0].id);
          setSelected(first);
          loadReport(first, "", "").then((rep) => {
            const dates = (rep?.series || []).map((s) => s.date).sort();
            if (dates.length > 0) setBounds({ min: dates[0], max: dates[dates.length - 1] });
          });
        }
      })
      .catch((err) => setError(apiError(err, "Could not load portfolios")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changePortfolio = (id) => {
    setSelected(id);
    setRange({ start: "", end: "" });
    setBenchMsg("");
    loadReport(id, "", "").then((rep) => {
      const dates = (rep?.series || []).map((s) => s.date).sort();
      if (dates.length > 0) setBounds({ min: dates[0], max: dates[dates.length - 1] });
    });
  };

  const applyRange = () => loadReport(selected, range.start, range.end);
  const clearRange = () => {
    setRange({ start: "", end: "" });
    loadReport(selected, "", "");
  };

  const saveBenchmark = async (e) => {
    e.preventDefault();
    const pf = portfolios.find((p) => String(p.id) === String(selected));
    if (!pf) return;
    setBenchBusy(true);
    setBenchMsg("");
    try {
      const { data } = await api.put(`/fin-portfolios/${selected}`, {
        name: pf.name,
        description: pf.description,
        benchmarkSymbol: benchEdit.trim() === "" ? null : benchEdit.trim(),
      });
      setPortfolios((ps) => ps.map((p) => (String(p.id) === String(selected) ? data : p)));
      setBenchMsg(`Benchmark ${data.benchmarkSymbol ? `set to ${data.benchmarkSymbol}` : "cleared"}.`);
      loadReport(selected, range.start, range.end);
    } catch (err) {
      setBenchMsg(apiError(err, "Could not save benchmark"));
    } finally {
      setBenchBusy(false);
    }
  };

  const r = report?.returns;
  const b = report?.benchmark;
  const positions = useMemo(() => {
    const rows = (report?.valuation?.positions || []).filter((p) => {
      const needle = q.trim().toLowerCase();
      if (!needle) return true;
      return `${p.symbol} ${p.assetCategory || ""}`.toLowerCase().includes(needle);
    });
    const by = {
      "symbol-asc": (a, z) => a.symbol.localeCompare(z.symbol),
      "value-desc": (a, z) => (z.value || 0) - (a.value || 0),
      "value-asc": (a, z) => (a.value || 0) - (z.value || 0),
      "weight-desc": (a, z) => (z.weight || 0) - (a.weight || 0),
    }[sort];
    return [...rows].sort(by);
  }, [report, q, sort]);
  const weights = report?.allocation?.weights
    ? Object.entries(report.allocation.weights).sort((a, z) => z[1] - a[1])
    : [];

  return (
    <div>
      <p className="eyebrow">Analysis / Risk & return</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="display text-[1.55rem]">Portfolio analysis</h1>
        <label htmlFor="an-pf" className="sr-only">Portfolio</label>
        <select id="an-pf" className="input ml-auto w-auto" value={selected}
          onChange={(e) => changePortfolio(e.target.value)}>
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

          <div className="solid card glass-panel mt-4 p-4">
            <div className="flex flex-wrap items-end gap-2.5">
              <div>
                <label className="label" htmlFor="an-start">From</label>
                <input id="an-start" type="date" className="input mt-1 w-auto" min={bounds.min || undefined} max={bounds.max || undefined}
                  value={range.start} onChange={(e) => setRange({ ...range, start: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="an-end">To</label>
                <input id="an-end" type="date" className="input mt-1 w-auto" min={bounds.min || undefined} max={bounds.max || undefined}
                  value={range.end} onChange={(e) => setRange({ ...range, end: e.target.value })} />
              </div>
              <button onClick={applyRange} disabled={loading} className="btn-brand px-4 py-2 text-[13px]">Apply range</button>
              {(range.start || range.end) && (
                <button onClick={clearRange} className="btn-ghost px-4 py-2 text-[13px] font-bold">Full history</button>
              )}
              <p className="w-full text-xs" style={{ color: "var(--muted)" }}>
                Metrics, chart, and comparison all recompute on the backend for the selected window.
                {bounds.min && <> Available: {bounds.min} → {bounds.max}.</>}
              </p>
            </div>
            <form onSubmit={saveBenchmark} className="mt-3 flex flex-wrap items-end gap-2.5 border-t pt-3" style={{ borderColor: "var(--line)" }}>
              <div>
                <label className="label" htmlFor="an-bench">Benchmark symbol</label>
                <input id="an-bench" className="input mt-1 w-40" placeholder={b?.symbol || "NIFTY50"}
                  value={benchEdit} onChange={(e) => setBenchEdit(e.target.value.toUpperCase())} maxLength={20} />
              </div>
              <button type="submit" disabled={benchBusy} className="btn-ghost px-4 py-2 text-[13px] font-bold">
                {benchBusy ? "Saving…" : "Save benchmark"}
              </button>
              {benchMsg && <p className="w-full text-xs font-semibold" style={{ color: "var(--muted)" }} role="status">{benchMsg}</p>}
            </form>
          </div>

          {(report.series?.length || 0) > 1 ? (
            <div className="solid card glass-panel mt-2.5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-extrabold">
                  {view === "performance" ? "Performance (rebased to 100)" : "Drawdown"}
                  <FinancialTermHelp termId={view === "performance" ? "benchmark-comparison" : "max-drawdown"}
                    context={view === "performance"
                      ? "Both lines start at 100 so shapes compare fairly; tooltips carry real dates and values."
                      : "Running peak-to-trough decline of the portfolio value series, same definition as maximum drawdown."} />
                </h2>
                <div className="ml-auto flex gap-1.5" role="group" aria-label="Chart view">
                  {[["performance", "Performance"], ["drawdown", "Drawdown"]].map(([v, label]) => (
                    <button key={v} onClick={() => setView(v)} aria-pressed={view === v}
                      className={view === v ? "btn-brand px-3 py-1.5 text-xs" : "btn-ghost px-3 py-1.5 text-xs font-bold"}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs font-bold" style={{ color: "var(--muted)" }} aria-hidden="true">
                <span><span style={{ color: "var(--lime)" }}>━</span> Portfolio</span>
                {b?.symbol && <span><span>┄</span> {b.symbol}</span>}
              </div>
              <PerformanceChart series={report.series} benchmarkSymbol={b?.symbol} view={view} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => downloadCsv(`analysis-${selected}.csv`, ["date", "value", b?.symbol || "benchmark"],
                    report.series.map((s) => [s.date, s.value, s.benchmarkValue]))}
                  className="btn-ghost px-3 py-1.5 text-xs font-bold">
                  <Download size={13} /> Export series CSV
                </button>
                <button
                  onClick={() => downloadCsv(`holdings-${selected}.csv`, ["symbol", "category", "quantity", "last_price", "last_date", "value", "weight"],
                    (report.valuation.positions || []).map((p) => [p.symbol, p.assetCategory, p.quantity, p.lastPrice, p.lastDate, p.value, p.weight]))}
                  className="btn-ghost px-3 py-1.5 text-xs font-bold">
                  <Download size={13} /> Export holdings CSV
                </button>
              </div>
            </div>
          ) : (
            <div className="solid card mt-2.5 p-4">
              <p className="text-[13px]" style={{ color: "var(--muted)" }}>
                Not enough valued dates to draw a chart — add holdings and import overlapping price history.
              </p>
            </div>
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
              context={report.allocation.hhi == null ? "No valued positions yet — HHI needs position weights." : `Squared value-weights summed: ${Object.entries(report.allocation.weights).sort((a, z) => z[1] - a[1]).map(([s, w]) => `${s} ${Math.round(w * 100)}%`).join(" · ")}. Band “${report.allocation.hhiBand}” is descriptive, not advice.`} />
          </div>

          {weights.length > 0 && (
            <div className="solid card mt-2.5 p-4">
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

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-extrabold">Positions <FinancialTermHelp termId="holding" context="Each row is one holding: symbol, units owned, latest price, and its share of total value." /></h2>
            <span className="relative ml-auto w-44">
              <label htmlFor="an-q" className="sr-only">Search holdings</label>
              <input id="an-q" className="input py-1.5 text-[13px]" placeholder="Search holdings…" value={q} onChange={(e) => setQ(e.target.value)} />
            </span>
            <label htmlFor="an-sort" className="sr-only">Sort holdings</label>
            <select id="an-sort" className="input w-auto py-1.5 text-[13px]" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="weight-desc">Weight ↓</option>
              <option value="value-desc">Value ↓</option>
              <option value="value-asc">Value ↑</option>
              <option value="symbol-asc">Symbol A–Z</option>
            </select>
          </div>
          {report.valuation.positions.length === 0 ? (
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
              No holdings yet. <Link to={selected ? `/portfolios/${selected}` : "/portfolios"} className="font-bold underline" style={{ color: "var(--ink)" }}>Add holdings →</Link>
            </p>
          ) : positions.length === 0 ? (
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>No holdings match “{q}”.</p>
          ) : (
            <div className="solid card mt-2 overflow-x-auto">
              <table className="table-soft">
                <thead><tr><th scope="col">Symbol</th><th scope="col">Qty</th><th scope="col">Last</th><th scope="col">Value</th><th scope="col">Weight <FinancialTermHelp termId="portfolio" context="Share of total value at latest prices. These weights feed the HHI concentration figure." /></th></tr></thead>
                <tbody>
                  {positions.map((p) => (
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
            context={b?.symbol == null ? (b?.reason || "Set a benchmark symbol above to enable comparison.") : b?.activeReturn == null ? (b?.reason || `Only ${b?.alignedObservations ?? 0} shared observations — import overlapping history.`) : `Over ${b.alignedObservations} shared observations, this portfolio sits ${b.activeReturn >= 0 ? "ahead of" : "behind"} ${b.symbol} by ${Math.abs(b.activeReturn * 100).toFixed(2)} percentage points. Past gaps do not predict future ones.`} /></h2>
          <div className="solid card mt-2 p-4">
            {b?.symbol == null ? (
              <p className="text-[13px]" style={{ color: "var(--muted)" }}>
                {b?.reason} Set it using the benchmark form above.
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
