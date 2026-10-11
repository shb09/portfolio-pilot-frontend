import { useEffect, useRef, useState } from "react";
import { api, apiError } from "../api/client";
import FinancialTermHelp from "../components/FinancialTermHelp";

/** CSV price import: date,symbol,close rows with per-row error reporting. */
export default function PricesPage() {
  const [symbols, setSymbols] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState([]);
  const fileRef = useRef(null);

  const loadSymbols = () => {
    api.get("/prices/symbols")
      .then((res) => setSymbols(res.data))
      .catch((err) => setError(apiError(err, "Could not load symbols")));
  };

  useEffect(() => { loadSymbols(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/prices/import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      loadSymbols();
      const first = symbols[0];
      if (first) {
        const rows = await api.get("/prices", { params: { symbol: first, limit: 5 } });
        setPreview(rows.data);
      }
    } catch (err) {
      setError(apiError(err, "Import failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="eyebrow">Market data / Prices</p>
      <h1 className="display mt-1 text-[1.55rem]">Price history</h1>
      <p className="mt-1 max-w-xl text-[13px]" style={{ color: "var(--muted)" }}>
        Import daily closes as CSV (<code>date,symbol,close</code> — ISO dates, positive prices).
        Duplicates are skipped, bad rows are reported with line numbers. Data is never fabricated.{" "}
        <FinancialTermHelp termId="csv-import" context={symbols.length === 0 ? "No symbols tracked yet — your first import creates them." : `Currently tracking ${symbols.length} symbol(s): ${symbols.slice(0, 8).join(", ")}${symbols.length > 8 ? "…" : ""}.`} />
      </p>

      <form onSubmit={upload} className="solid card mt-4 flex flex-wrap items-center gap-2.5 p-4">
        <label htmlFor="csv-file" className="sr-only">CSV file</label>
        <input id="csv-file" ref={fileRef} type="file" accept=".csv,text/csv"
          className="text-[13px] font-semibold" />
        <button type="submit" disabled={busy} className="btn-brand px-4 py-2 text-[13px]">
          {busy ? "Importing…" : "Import CSV"}
        </button>
        {error && <p role="alert" className="w-full text-[13px] font-semibold" style={{ color: "var(--danger)" }}>{error}</p>}
      </form>

      {result && (
        <div className="solid card mt-3 p-4" role="status">
          <p className="text-sm font-extrabold">
            {result.imported} imported · {result.skippedDuplicates} duplicates skipped · {result.errors.length} errors
            <span className="font-semibold" style={{ color: "var(--muted)" }}> ({result.totalRows} rows)</span>
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto text-[13px]">
              {result.errors.slice(0, 50).map((e, i) => (
                <li key={i} style={{ color: "var(--danger)" }}>Row {e.row}: {e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="solid card p-4">
          <h2 className="text-sm font-extrabold">Tracked symbols ({symbols.length})</h2>
          {symbols.length === 0 ? (
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>No symbols yet — import your first CSV above.</p>
          ) : (
            <p className="mt-2 flex flex-wrap gap-1.5">
              {symbols.map((s) => <span key={s} className="chip px-2.5 py-1 text-xs font-bold">{s}</span>)}
            </p>
          )}
        </div>
        <div className="solid card p-4">
          <h2 className="text-sm font-extrabold">Latest rows</h2>
          {preview.length === 0 ? (
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>Import data to preview recent closes.</p>
          ) : (
            <ul className="mt-2 divide-y text-[13px]" style={{ borderColor: "var(--line)" }}>
              {preview.map((r, i) => (
                <li key={i} className="flex justify-between py-1.5">
                  <span className="font-bold">{r.symbol} <span style={{ color: "var(--muted)" }}>{r.date}</span></span>
                  <span className="tabular-nums font-bold">{r.close}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
