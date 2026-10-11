# Demo Data Guide — Portfolio Pilot Quantitative Analysis

The file `public/demo/portfolio-pilot-demo-prices.csv` contains
**deterministic simulated prices — illustrative only, not live market data**.
4 symbols × 12 month-end closes (Jan–Dec 2024):

| Symbol | Style | Dec 2024 close |
|---|---|---|
| ALPHA | volatile equity | 125.00 |
| BETA | steady equity | 60.00 |
| GAMMA | low-volatility | 208.00 |
| NIFTY50 | benchmark | 1070.00 |

Schema (must match exactly): header `date,symbol,close`, ISO dates (`YYYY-MM-DD`),
uppercase symbols, positive finite closes. Re-imports skip existing rows as duplicates;
bad rows are reported with line numbers and nothing is silently dropped.

## Walkthrough (about 5 minutes)

1. **Create a portfolio:** open Portfolios → Add portfolio → name it e.g. `Demo 2024`.
   Optionally set benchmark symbol `NIFTY50` (create first, edit after, or set inline).
2. **Add holdings:** open the portfolio → Add holding → `ALPHA` / Equity / `10`,
   then `BETA` / Equity / `20`, then `GAMMA` / Bond / `5`. Duplicate symbols are rejected.
3. **Upload the CSV:** open Prices → choose `portfolio-pilot-demo-prices.csv` → Import.
   Expect `48 imported · 0 duplicates · 0 errors`. Uploading again reports 48 skipped duplicates.
4. **Configure the benchmark:** edit the portfolio → benchmark symbol `NIFTY50` (if not set).
5. **Inspect the analysis:** open Analysis → select the portfolio. Expect roughly:
   - Total value ≈ 10×125 + 20×60 + 5×208 = **3490** as of 2024-12-31.
   - 11 return observations with a warning that volatility/Sharpe are indicative (< 30 obs).
   - HHI concentration with a descriptive band (no safety claims).
   - Benchmark section comparing against NIFTY50 over the identical window
     with active return and tracking error.
6. **Unavailable metrics:** any metric shown as `—` carries a reason (e.g. fewer than
   2 valued dates, no benchmark history, flat series for Sharpe). Import more history
   to resolve them.
7. **Cleanup:** delete holdings, then the portfolio, from the Portfolios pages
   (delete requires confirmation). Price rows remain under Prices/symbols; they are
   per-user data and affect nothing once holdings are gone.
