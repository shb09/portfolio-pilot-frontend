import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const PREF_KEY = "pp_tour";

export function readTourPref() {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || "null");
  } catch {
    return null;
  }
}

function writeTourPref(value) {
  localStorage.setItem(PREF_KEY, JSON.stringify(value));
}

const LEVELS = [
  ["new", "I'm new to investing"],
  ["basics", "I know the basics"],
];

const STEPS = {
  new: [
    {
      title: "Portfolios, simply put",
      body: "A portfolio is a named basket of investments you track together. You add what you own (holdings), import past prices, and the app measures what happened: growth, bumpiness, and how you compare to a market index.",
    },
    {
      title: "Your data stays yours",
      body: "Everything is computed from prices you import — including the bundled demo, whose values are simulated for practice, not live market quotes. Your portfolios are private to your account.",
    },
    {
      title: "Start with the demo",
      body: "Load the Interactive Demo on the portfolios page: it builds a sample portfolio, imports a year of simulated prices, and runs the full analysis so every term below has real numbers attached.",
    },
  ],
  basics: [
    {
      title: "What this measures",
      body: "Simple per-period returns feed cumulative and annualized figures (252-day basis), sample volatility, Sharpe at zero risk-free rate, peak-to-trough drawdown, and HHI concentration — all from your imported closes.",
    },
    {
      title: "Benchmarks, aligned",
      body: "Comparisons use only dates shared by both series, so active return and tracking error always describe the identical window. Short windows are flagged as indicative.",
    },
    {
      title: "Learn anything inline",
      body: "Every metric carries a help icon with the exact formula, your current result, an illustrative example, and the caveats. The glossary collects them all in one searchable place.",
    },
  ],
};

/**
 * Lightweight first-visit introduction. Inline and dismissible — never a
 * blocking modal. Preference lives in localStorage (pp_tour) alongside the
 * other pp_* preferences. Reopenable from the Learn page via pp:retake-tour.
 */
export default function Tour() {
  const [pref, setPref] = useState(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setPref(readTourPref());
    setReady(true);
    const retake = () => {
      localStorage.removeItem(PREF_KEY);
      setPref(null);
      setStep(0);
    };
    window.addEventListener("pp:retake-tour", retake);
    return () => window.removeEventListener("pp:retake-tour", retake);
  }, []);

  useEffect(() => {
    if (!pref || pref.done || pref.skipped) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        const next = { ...pref, skipped: true };
        writeTourPref(next);
        setPref(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pref]);

  if (!ready || pref?.done || pref?.skipped) return null;

  const choose = (level) => {
    const next = { level, done: false };
    writeTourPref(next);
    setPref(next);
    setStep(0);
  };

  const skip = () => {
    const next = { ...(pref || {}), skipped: true };
    writeTourPref(next);
    setPref(next);
  };

  const finish = () => {
    const next = { ...(pref || {}), done: true };
    writeTourPref(next);
    setPref(next);
  };

  // Step 1 — pick a level.
  if (!pref?.level) {
    return (
      <div className="tint mb-4 rounded-[0.9rem] p-4" role="region" aria-label="Learn as you explore">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="icon-tile" aria-hidden="true"><BookOpen size={17} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-extrabold tracking-tight">Learn as you explore</h2>
            <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--muted)" }}>
              A 30-second intro to what this app measures — tuned to your starting point.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEVELS.map(([value, label]) => (
            <button key={value} onClick={() => choose(value)} className="btn-brand px-4 py-2 text-[13px]">
              {label}
            </button>
          ))}
          <button onClick={skip} className="btn-ghost px-4 py-2 text-[13px] font-bold">
            Skip tour
          </button>
        </div>
      </div>
    );
  }

  const steps = STEPS[pref.level] || STEPS.basics;
  const current = steps[Math.min(step, steps.length - 1)];
  const last = step >= steps.length - 1;

  return (
    <div className="tint mb-4 rounded-[0.9rem] p-4" role="region" aria-label={`Introduction, step ${step + 1} of ${steps.length}`}>
      <p className="eyebrow">LEARN AS YOU EXPLORE · {step + 1} / {steps.length}</p>
      <h2 className="mt-1 text-[15px] font-extrabold tracking-tight">{current.title}</h2>
      <p className="mt-1 max-w-xl text-[13px] leading-relaxed">{current.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {!last ? (
          <button onClick={() => setStep((s) => s + 1)} className="btn-brand px-4 py-2 text-[13px]">
            Next →
          </button>
        ) : (
          <>
            <Link to="/portfolios" onClick={finish} className="btn-brand px-4 py-2 text-[13px]">
              Explore portfolios →
            </Link>
            <Link to="/learn" onClick={finish} className="btn-ghost px-4 py-2 text-[13px] font-bold">
              Open the glossary
            </Link>
          </>
        )}
        {step > 0 && !last && (
          <button onClick={() => setStep((s) => s - 1)} className="btn-ghost px-4 py-2 text-[13px] font-bold">
            ← Back
          </button>
        )}
        <button onClick={skip} className="btn-ghost px-4 py-2 text-[13px] font-bold">
          Skip tour
        </button>
      </div>
    </div>
  );
}
