import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { getTerm } from "../data/glossary";

/**
 * One reusable, accessible explainer for financial terms. Click (mouse,
 * touch, keyboard) toggles a concise inline panel sourced from the shared
 * glossary module — never duplicated copy. The optional `context` string
 * carries the live interpretation of the user's own data; when data is
 * missing, callers pass an explanatory context instead of guessing.
 */
export default function FinancialTermHelp({ termId, context }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const term = getTerm(termId);
  if (!term) return null;

  return (
    <span className="inline-flex items-start gap-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? `Hide explanation of ${term.term}` : `What does ${term.term} mean?`}
        title={`What does ${term.term} mean?`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        className="icon-btn mt-0.5 shrink-0 p-1"
        style={{ width: "1.35rem", height: "1.35rem" }}
      >
        <Info size={13} aria-hidden="true" />
      </button>
      {open && (
        <span
          id={panelId}
          role="region"
          aria-label={`${term.term} explained`}
          className="solid card mt-0.5 block max-w-sm p-3 text-left text-[12.5px] leading-relaxed"
        >
          <span className="block text-[13px] font-extrabold">{term.term}</span>
          <span className="mt-1 block"><strong>Meaning: </strong>{term.plain}</span>
          <span className="mt-1 block"><strong>Why it matters: </strong>{term.why}</span>
          {context && (
            <span className="tint mt-1.5 block rounded-[0.5rem] p-2"><strong>Your result: </strong>{context}</span>
          )}
          <span className="mt-1.5 block" style={{ color: "var(--muted)" }}>{term.example}</span>
          {term.caveat && (
            <span className="mt-1 block"><strong>Limitation: </strong>{term.caveat}</span>
          )}
          <Link to={`/learn#term-${term.id}`} className="mt-1.5 inline-block text-xs font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>
            Full glossary entry →
          </Link>
        </span>
      )}
    </span>
  );
}
