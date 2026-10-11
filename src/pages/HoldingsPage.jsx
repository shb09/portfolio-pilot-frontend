import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, apiError } from "../api/client";
import CrudPage from "../components/CrudPage";
import { MODULES } from "../config/modules";

/** Holdings of one portfolio: picker + the shared CRUD surface. */
export default function HoldingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState("");
  const selected = portfolios.find((p) => String(p.id) === String(id));

  useEffect(() => {
    api.get("/fin-portfolios")
      .then((res) => setPortfolios(res.data))
      .catch((err) => setError(apiError(err, "Could not load portfolios")));
  }, []);

  const config = { ...MODULES.holdings, endpoint: `/fin-portfolios/${id}/holdings` };

  return (
    <div>
      <p className="eyebrow">Portfolios / Holdings</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <label htmlFor="pf-pick" className="sr-only">Portfolio</label>
        <select
          id="pf-pick"
          className="input w-auto"
          value={id || ""}
          onChange={(e) => navigate(e.target.value ? `/portfolios/${e.target.value}` : "/portfolios")}
        >
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Link to="/portfolios" className="text-[13px] font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>
          Manage portfolios
        </Link>
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold" style={{ color: "var(--danger)" }}>{error}</p>}
      {selected == null && !error && (
        <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Select a portfolio above.</p>
      )}
      {selected != null && (
        <div className="mt-2" key={id}>
          <CrudPage config={config} />
        </div>
      )}
    </div>
  );
}
