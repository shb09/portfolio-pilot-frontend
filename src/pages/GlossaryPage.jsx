import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Play, Search } from "lucide-react";
import { CATEGORIES, TERMS } from "../data/glossary";

/**
 * Searchable financial glossary — the same definitions as every inline
 * explanation (single data module). Includes a tour retake entry point.
 */
export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ block: "start" });
    }
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TERMS.filter((t) => {
      if (category && t.category !== category) return false;
      if (!q) return true;
      return `${t.term} ${t.plain} ${t.why} ${t.example}`.toLowerCase().includes(q);
    });
  }, [query, category]);

  const retakeTour = () => {
    window.dispatchEvent(new Event("pp:retake-tour"));
  };

  return (
    <div>
      <p className="eyebrow">Learn</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="display text-[1.55rem]">Learn</h1>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to="/walkthrough" className="btn-brand px-3.5 py-2 text-[13px]">
            <Play size={15} /> Start Guided Tour
          </Link>
          <button onClick={retakeTour} className="btn-ghost px-3.5 py-2 text-[13px] font-bold">
            <BookOpen size={15} /> Retake the intro
          </button>
        </div>
      </div>
      <p className="mt-1 max-w-xl text-[13px]" style={{ color: "var(--muted)" }}>
        Understand your portfolio, one metric at a time.
      </p>
      <p className="tint mt-3 max-w-xl rounded-[0.9rem] p-3 text-[12.5px] leading-relaxed">
        The bundled demo prices are <strong>simulated historical data, not live market
        prices</strong>. Every definition below uses the app's actual formulas; illustrative
        examples are labelled as such.
      </p>

      <h2 className="mt-5 text-sm font-extrabold">Key concepts</h2>
      <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {[["portfolio", "Portfolio"], ["cumulative-return", "Return"], ["volatility", "Volatility"], ["sharpe", "Sharpe ratio"], ["hhi", "Concentration"], ["benchmark-comparison", "Benchmark"]].map(([id, label]) => (
          <Link key={id} to={`/learn#term-${id}`} className="solid card glass-metric p-3.5 text-sm font-extrabold tracking-tight">
            {label} <span aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      <h2 className="mt-5 text-sm font-extrabold">Glossary</h2>
      <p className="mt-1 max-w-xl text-[13px]" style={{ color: "var(--muted)" }}>
        Plain-English meanings, the exact formulas this app uses, and the caveats —
        identical to the help icons beside every metric. Examples are illustrative unless stated otherwise.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="relative min-w-52 flex-1">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} aria-hidden="true" />
          <label htmlFor="glossary-search" className="sr-only">Search terms</label>
          <input
            id="glossary-search"
            className="input pl-8"
            placeholder="Search terms…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </span>
        <label htmlFor="glossary-cat" className="sr-only">Category</label>
        <select id="glossary-cat" className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="ml-auto text-xs font-semibold tabular-nums" style={{ color: "var(--muted)" }} aria-live="polite">
          {visible.length} of {TERMS.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="mx-auto max-w-sm py-12 text-center">
          <p className="eyebrow" style={{ color: "var(--ink)" }}>NO MATCHES</p>
          <p className="mx-auto mt-1.5 max-w-xs text-[13px]" style={{ color: "var(--muted)" }}>
            Try a different word, or browse a category.
          </p>
          <button onClick={() => { setQuery(""); setCategory(""); }} className="btn-ghost mx-auto mt-4 px-4 py-2 text-[13px] font-semibold">
            Clear search
          </button>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {visible.map((t) => (
            <li key={t.id} id={`term-${t.id}`} className="solid card scroll-mt-24 p-4" style={{ scrollMarginTop: "5rem" }}>
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-[15px] font-extrabold tracking-tight">{t.term}</h2>
                <span className="chip px-2 py-px text-[10px] font-bold">{t.category}</span>
              </div>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed"><strong>Meaning: </strong>{t.plain}</p>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed"><strong>Why it matters: </strong>{t.why}</p>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>{t.example}</p>
              {t.caveat && <p className="mt-1 max-w-2xl text-[13px] leading-relaxed"><strong>Limitation: </strong>{t.caveat}</p>}
              {t.links.length > 0 && (
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                  {t.links.map((l) => (
                    <Link key={l.to + l.label} to={l.to} className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>
                      {l.label} →
                    </Link>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
