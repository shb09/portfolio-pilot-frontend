import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { api } from "../api/client";
import CrudPage from "../components/CrudPage";
import DemoSetup from "../components/DemoSetup";
import { MODULES } from "../config/modules";

/**
 * Investment portfolios: one-click demo entry, then the shared CRUD
 * surface. An emphasized empty state offers the demo when the user
 * owns no portfolios yet.
 */
export default function PortfoliosPage() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    api.get("/fin-portfolios").then((res) => setCount(res.data.length)).catch(() => setCount(null));
  }, []);

  return (
    <div>
      <DemoSetup />
      {count === 0 && (
        <div className="solid card mx-auto mt-4 max-w-md p-6 text-center">
          <span className="icon-tile mx-auto" style={{ width: "2.75rem", height: "2.75rem" }} aria-hidden="true">
            <Sparkles size={20} />
          </span>
          <p className="eyebrow mt-3" style={{ color: "var(--ink)" }}>NO PORTFOLIO YET</p>
          <p className="mx-auto mt-1.5 max-w-xs text-[13px]" style={{ color: "var(--muted)" }}>
            Load the simulated demo above to explore instantly, or read how investing works first.
          </p>
          <Link to="/learn" className="btn-ghost mx-auto mt-3 inline-flex px-4 py-2 text-[13px] font-bold">
            Learn as you explore →
          </Link>
        </div>
      )}
      <div className="mt-4">
        <CrudPage config={MODULES.finPortfolios} />
      </div>
    </div>
  );
}
