import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api, apiError } from "../api/client";

function Skeleton() {
  return (
    <div className="space-y-3" aria-label="Loading admin data">
      <div className="skeleton h-7 w-1/3" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-20" />)}
      </div>
      <div className="skeleton h-56" />
    </div>
  );
}

/** Admin-only operations view. Every figure comes from /api/admin. */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    Promise.all([api.get("/admin/stats"), api.get("/admin/users")])
      .then(([s, u]) => {
        if (!live) return;
        setStats(s.data);
        setUsers(u.data);
      })
      .catch((err) => live && setError(apiError(err, "Could not load admin data")))
      .finally(() => {});
    return () => { live = false; };
  }, []);

  if (error) {
    return (
      <div className="solid card p-8 text-center">
        <p className="text-sm font-bold" style={{ color: "var(--danger)" }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-brand mt-4 px-4 py-2 text-[13px]">Retry</button>
      </div>
    );
  }
  if (!stats) return <Skeleton />;

  const tiles = [
    ["Total users", stats.totalUsers],
    ["Verified", stats.verifiedUsers],
    ["Pending verification", stats.pendingVerification],
    ["Published portfolios", `${stats.publishedPortfolios}/${stats.totalPortfolios}`],
    ["Projects", stats.totalProjects],
    ["Analytics events", stats.totalEvents],
  ];

  return (
    <div>
      <p className="eyebrow">Admin / Operations</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="display flex items-center gap-2 text-[1.55rem]">
          <ShieldCheck size={22} style={{ color: "var(--ink)" }} aria-hidden="true" /> Admin dashboard
        </h1>
      </div>
      <p className="mt-1 max-w-xl text-[13px]" style={{ color: "var(--muted)" }}>
        Live counts from the database. No passwords, tokens, or hashes are ever exposed here.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map(([label, value]) => (
          <div key={label} className="solid card p-3.5">
            <p className="display text-2xl tabular-nums">{value}</p>
            <p className="eyebrow mt-1" style={{ fontSize: "0.6rem" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="solid card mt-3">
        <h2 className="border-b-2 px-4 py-2.5 text-[13px] font-extrabold uppercase tracking-wide" style={{ borderColor: "var(--line-strong)" }}>
          Users ({users.length})
        </h2>
        {users.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px]" style={{ color: "var(--muted)" }}>No users registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-soft">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="font-bold">{u.username}</span>
                      <span className="block text-xs" style={{ color: "var(--muted)" }}>{u.name}</span>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={u.role === "ADMIN" ? "chip-accent px-2 py-0.5 text-[11px] font-extrabold" : "chip px-2 py-0.5 text-[11px] font-bold"}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-xs font-bold" style={{ color: !u.enabled ? "var(--danger)" : u.emailVerified ? "var(--ok)" : "var(--warn)" }}>
                      {!u.enabled ? "Disabled" : u.emailVerified ? "Verified" : "Pending"}
                    </td>
                    <td className="whitespace-nowrap text-xs tabular-nums" style={{ color: "var(--muted)" }}>
                      {u.createdAt ? u.createdAt.slice(0, 10) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
