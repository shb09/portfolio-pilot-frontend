import { useEffect, useState } from "react";
import { api, apiError } from "../api/client";
import PublicView from "../components/PublicView";
import Toast from "../components/Toast";

export default function Preview() {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState({ username: "", tagline: "", published: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const load = async () => {
    try {
      const [{ data: preview }, metaRes] = await Promise.all([
        api.get("/portfolio/preview"),
        api.get("/portfolio").catch(() => ({ data: null })),
      ]);
      setData(preview);
      if (metaRes.data) setMeta(metaRes.data);
      else if (preview.username) setMeta({ username: preview.username, tagline: preview.tagline || "", published: false });
    } catch (err) {
      setError(apiError(err, "Could not load preview"));
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (publish) => {
    const slug = meta.username.toLowerCase().trim();
    if (!slug) {
      setError("Choose a username slug first (e.g. asha-sharma).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.put("/portfolio", { username: slug, tagline: meta.tagline || null, published: publish });
      setMeta(data);
      setToast(publish ? "Published — your public link is live" : "Draft saved");
      await load();
    } catch (err) {
      setError(apiError(err, "Could not save portfolio settings"));
    } finally {
      setBusy(false);
    }
  };

  const publicUrl = meta.username ? `${window.location.origin}/portfolio/${meta.username}` : "";

  return (
    <div>
      <h1 className="display text-3xl">Preview & Publish</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
        Edit → preview exactly what visitors see → publish. Unpublished work stays invisible.
      </p>

      {/* Floating controls — offset below the sticky header (z-20) */}
      <div className="glass-pop card sticky top-[68px] z-10 mt-5 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="label" htmlFor="username">Public username *</label>
            <input id="username" className="input mt-1" value={meta.username || ""} onChange={(e) => setMeta({ ...meta, username: e.target.value })} placeholder="asha-sharma" autoComplete="off" />
          </div>
          <div>
            <label className="label" htmlFor="tagline">Tagline</label>
            <input id="tagline" className="input mt-1" value={meta.tagline || ""} onChange={(e) => setMeta({ ...meta, tagline: e.target.value })} placeholder="Aspiring Java developer" />
          </div>
          <div className="flex items-end gap-2">
            <button disabled={busy} onClick={() => save(false)} className="btn-ghost px-4 py-2 text-sm font-semibold">Save draft</button>
            <button disabled={busy} onClick={() => save(true)} className="btn-brand px-4 py-2 text-sm">
              {meta.published ? "Update live page" : "Publish"}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-medium" style={{ color: "var(--danger)" }}>{error}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="chip px-3 py-1 font-semibold" style={{ color: meta.published ? "var(--brand)" : "var(--muted)" }}>
            {meta.published ? "● Live" : "○ Draft"}
          </span>
          {meta.published && meta.username && (
            <>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="font-semibold underline" style={{ color: "var(--brand)" }}>{publicUrl} ↗</a>
              <button onClick={() => save(false)} disabled={busy} className="btn-danger-ghost px-3 py-1 text-xs font-semibold">Unpublish</button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        {data ? <PublicView data={data} onEvent={null} /> : <div className="skeleton h-96" aria-label="Loading preview" />}
      </div>
      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
