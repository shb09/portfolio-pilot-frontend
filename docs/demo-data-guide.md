# Demo Data Guide — Portfolio Pilot Quantitative Analysis

Both files live in `frontend/public/demo/` and are served in dev and production
at `/demo/<filename>`. **Every bundled price is deterministic simulated data —
realistic-looking but invented for learning, never live market quotes.** The demo
portfolio created by one-click setup is described in-app as
“Simulated demonstration data — not live market prices.”

The manifest `portfolio-pilot-demo-portfolio.json` is a **documented
configuration file only** — Portfolio Pilot has no JSON importer. Import price
history exclusively through Prices → Import CSV.

## Files

| File | Scenario | Rows |
|---|---|---|
| `portfolio-pilot-demo-prices.csv` | Steady growth, Jan–Dec 2024 | 48 (4 symbols × 12 month-end closes) |
| `portfolio-pilot-demo-prices-alternative.csv` | Dip and recovery, Jan–Dec 2023 | 48 (4 symbols × 12 month-end closes) |
| `portfolio-pilot-demo-portfolio.json` | Manifest: portfolio name, benchmark, holdings, scenario stories | config only, not importable |

Symbols in both files: `ALPHA` (volatile equity), `BETA` (steady equity),
`GAMMA` (low-volatility), `NIFTY50` (benchmark index for comparison).

## Exact CSV schema

Header must be exactly `date,symbol,close`:

- `date` — ISO calendar date `YYYY-MM-DD` (month-end closes in the bundles).
- `symbol` — 1–20 chars: letters, digits, dot, hyphen; stored uppercase.
- `close` — positive finite number (two decimals in the bundles).

The importer (`POST /api/prices/import`, multipart field `file`, filename must
end in `.csv`): re-imported rows are **skipped as duplicates, never
double-counted**; bad rows are listed with line numbers in
`errors[]` and nothing is silently dropped. A step fails only when zero rows
import and errors exist.

## One-click demo workflow (real APIs, repeatable)

`Load Interactive Demo` on Investment Portfolios, with a scenario picker:

1. **Portfolio** — `GET /fin-portfolios`; resume `Interactive Demo` by exact
   name or `POST` it with benchmark `NIFTY50`.
2. **Benchmark** — set to `NIFTY50` only when blank; a deliberate user choice is kept.
3. **Holdings** — `GET` holdings; `POST` only the missing of
   ALPHA/Equity/10, BETA/Equity/20, GAMMA/Bond/5 (duplicate symbols would 409).
4. **Prices** — fetch the chosen bundled CSV, import via the real importer.
5. **Analysis** — `GET /fin-portfolios/{id}/analysis`; require a valuation.
6. **Open** — portfolio detail, with a link into the guided walkthrough.

Reruns resume everything; no duplicate portfolios, holdings, or price rows.
Unrelated user portfolios are never listed for modification, only the
exact-name demo portfolio.

## Expected calculations (demo holdings 10 / 20 / 5)

Base scenario (2024), first valued date 2024-01-31:

- First value: 10×100 + 20×50 + 5×200 = **3000**
- Last value (2024-12-31): 10×125 + 20×60 + 5×208 = **3490**
- Cumulative: 3490 ÷ 3000 − 1 ≈ **+16.33%** over 11 return observations
- Annualized: (1.1633)^(252 ÷ 11) − 1 — a very large figure. This is
  mathematically consistent with the documented formula (each observation is
  treated as one of 252 periods) but **not a realistic yearly rate for monthly
  data**; the app flags short windows as indicative. Do not present it as a forecast.
- HHI: weights ≈ 35.8% / 34.4% / 29.8% → ≈ **0.335**, “highly concentrated”.

Alternative scenario (2023):

- First value: 10×80 + 20×60 + 5×190 = **2950**
- Last value: 10×95 + 20×49 + 5×201 = **2935** → cumulative ≈ **−0.51%**
- Drawdown is visibly non-zero mid-year (ALPHA trough in May) — ideal for
  demonstrating peak-to-trough measurement on the drawdown chart view.
- Benchmark NIFTY50 climbs 900 → 955 (≈ +6.1%), so active return is negative:
  a clean underperformance example over identical dates.

## Cleanup

Delete holdings, then the portfolio, from the Portfolios pages (delete requires
confirmation). Price rows remain under Prices/symbols; they are per-user data
and affect nothing once holdings are gone. Deleting the demo never touches
other portfolios.

## Five-minute presentation script

1. **(0:00)** Landing → register/login. “Private by default — every number you
   will see is computed from data owned by this account.”
2. **(0:45)** Portfolios → `Load Interactive Demo`, pick **Steady growth**.
   Narrate the five steps as they complete.
3. **(1:45)** Open the demo portfolio: name, NIFTY50 benchmark, snapshot cards,
   allocation bars. Click a help icon — “every metric carries its formula.”
4. **(2:45)** Analysis → performance chart, hover a point (“real dates, real
   values, rebased to 100”), switch to **Drawdown**, apply a date range
   (“metrics recompute on the backend”), export the series CSV.
5. **(3:45)** Walkthrough step 5 → benchmark comparison (“identical shared
   dates, active return, tracking error”). Glossary → Sharpe (“risk-free rate
   fixed at zero, disclosed on the label”).
6. **(4:30)** Switch scenario to **Dip and recovery**, re-import, show the
   negative cumulative and mid-year drawdown. “Same app, same formulas —
   different history, different story.”
7. **(5:00)** Close: “All bundled prices are simulated. Import genuine history
   before drawing real conclusions.”
