import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Moon, Satellite, Sun } from "lucide-react";
import { pub } from "../api/client";
import { useTheme } from "../theme/ThemeContext";
import Aurora from "../components/Aurora";
import PublicView, { fire } from "../components/PublicView";

export default function PublicPortfolio() {
  const { username } = useParams();
  const { theme, toggle } = useTheme();
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    pub
      .get(`/portfolio/${username}`)
      .then((res) => {
        setData(res.data);
        fire(username, "PORTFOLIO_VIEW");
      })
      .catch(() => setMissing(true));
  }, [username]);

  return (
    <div className="min-h-screen">
      <Aurora />
      <header className="mx-auto flex max-w-4xl items-center px-4 py-5">
        <Link to="/" className="flex items-center gap-2 font-extrabold">
          <span className="btn-brand flex h-8 w-8 items-center justify-center">◈</span>
          <span className="grad-text">Portfolio Pilot</span>
        </Link>
        <button onClick={toggle} className="btn-ghost ml-auto p-2" aria-label="Toggle theme">
          {theme === "paper" ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </header>
      <main className="mx-auto max-w-4xl px-4 pb-16">
        {missing ? (
          <div className="solid card p-12 text-center">
            <span className="icon-tile mx-auto" style={{ width: "2.75rem", height: "2.75rem" }}>
              <Satellite size={20} />
            </span>
            <h1 className="mt-3 text-2xl font-extrabold">This portfolio isn't live</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              The link is wrong or the owner hasn't published yet.
            </p>
            <Link to="/" className="btn-brand mt-5 inline-block px-5 py-2 text-sm">
              Build your own
            </Link>
          </div>
        ) : !data ? (
          <p style={{ color: "var(--muted)" }}>Loading portfolio…</p>
        ) : (
          <PublicView data={data} onEvent={fire} />
        )}
      </main>
    </div>
  );
}
