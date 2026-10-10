import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown, Award, Briefcase, FolderKanban, GraduationCap, Layers,
  Pencil, Plus, Search, Trash2, Trophy, X,
} from "lucide-react";
import { api, apiError } from "../api/client";
import Toast from "./Toast";

const ICONS = {
  projects: FolderKanban,
  skills: Layers,
  education: GraduationCap,
  experience: Briefcase,
  certifications: Award,
  achievements: Trophy,
};

const SORTS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["az", "Title A–Z"],
];

/**
 * One record in three layouts: timeline (dated records like education),
 * grid (dense sets like skills), or the standard row. Actions stay
 * icon-only and appear on hover (always visible on touch).
 */
function RecordRow({ config, ModuleIcon, item, onEdit, onDelete }) {
  const title = config.titleOf(item);
  const actions = (
    <span className="row-actions flex shrink-0 gap-0.5">
      <button onClick={() => onEdit(item)} className="icon-btn" aria-label={`Edit ${title}`} title="Edit">
        <Pencil size={15} />
      </button>
      <button onClick={() => onDelete(item)} className="icon-btn danger" aria-label={`Delete ${title}`} title="Delete">
        <Trash2 size={15} />
      </button>
    </span>
  );
  const links = (config.linksOf?.(item) || []).map((l) => (
    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>{l.label}</a>
  ));

  if (config.timeline) {
    return (
      <li className="record-row grid gap-x-3 gap-y-1 py-3.5 sm:grid-cols-[132px_1fr_auto]">
        <span className="text-[11px] font-extrabold uppercase tracking-wide tabular-nums sm:pt-1" style={{ color: "var(--muted)" }}>
          {config.metaOf?.(item) || ""}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold tracking-tight">{title}</p>
          {config.subOf(item) && <p className="text-[13px] font-semibold">{config.subOf(item)}</p>}
          {config.descOf(item) && <p className="mt-0.5 line-clamp-2 text-[13px]" style={{ color: "var(--muted)" }}>{config.descOf(item)}</p>}
          {links.length > 0 && <p className="mt-1 flex gap-3 text-xs">{links}</p>}
        </div>
        {actions}
      </li>
    );
  }

  if (config.variant === "grid") {
    return (
      <li className="solid-flat record-row rounded-[4px] p-3">
        <div className="flex items-center gap-2">
          <span className="icon-tile" style={{ width: "1.9rem", height: "1.9rem" }}><ModuleIcon size={15} /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">{title}</p>
            {config.subOf(item) && <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{config.subOf(item)}</p>}
          </div>
          {actions}
        </div>
      </li>
    );
  }

  return (
    <li className="record-row flex items-start gap-3 py-3.5">
      <span className="icon-tile mt-0.5"><ModuleIcon size={17} /></span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold">
          <span className="truncate">{title}</span>
          {item.featured && <span className="chip-accent px-2 py-px text-[10px] font-bold">Featured</span>}
        </p>
        {config.subOf(item) && <p className="truncate text-[13px]" style={{ color: "var(--muted)" }}>{config.subOf(item)}</p>}
        {config.descOf(item) && <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed">{config.descOf(item)}</p>}
        {(config.tagsOf?.(item)?.length > 0 || links.length > 0) && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {(config.tagsOf?.(item) || []).slice(0, 5).map((t) => (
              <span key={t} className="chip px-2 py-px font-medium">{t}</span>
            ))}
            {links}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {config.metaOf?.(item) && !config.timeline && (
          <span className="whitespace-nowrap text-[11px] font-semibold tabular-nums" style={{ color: "var(--muted)" }}>{config.metaOf(item)}</span>
        )}
        {actions}
      </div>
    </li>
  );
}

/**
 * Exemplar module page: compact context header, inline toolbar
 * (search + sort + filters + count, no decorative container),
 * divided record rows with hover actions, and a compact empty state.
 */
export default function CrudPage({ config }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [activeFilters, setActiveFilters] = useState({});
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const firstField = useRef(null);
  const toastTimer = useRef(null);
  const ModuleIcon = ICONS[config.icon] || FolderKanban;

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(config.endpoint);
      setItems(data);
    } catch (err) {
      setError(apiError(err, `Could not load ${config.title.toLowerCase()}`));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuery("");
    setSort("newest");
    setActiveFilters({});
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.endpoint]);

  useEffect(() => {
    if (!editing && !confirming) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setEditing(null);
        setConfirming(null);
      }
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstField.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [editing, confirming]);

  const dynamicOptions = useMemo(() => {
    if (!config.dynamicFilter) return [];
    const set = new Set();
    items.forEach((item) => config.dynamicFilter.of(item).forEach((v) => set.add(v)));
    return [...set].sort();
  }, [items, config]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = items.filter((item) => {
      for (const f of config.filters || []) {
        const want = activeFilters[f.key];
        if (want && f.of(item) !== want) return false;
      }
      if (config.dynamicFilter) {
        const want = activeFilters[config.dynamicFilter.key];
        if (want && !config.dynamicFilter.of(item).includes(want)) return false;
      }
      if (!q) return true;
      const hay = [
        config.titleOf(item), config.subOf(item), config.descOf(item), config.metaOf(item),
        ...(config.tagsOf?.(item) || []),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
    if (config.featuredFirst) out.sort((a, b) => Number(b.featured || false) - Number(a.featured || false));
    else if (sort === "oldest") out.sort((a, b) => a.id - b.id);
    else if (sort === "az") out.sort((a, b) => String(config.titleOf(a)).localeCompare(String(config.titleOf(b))));
    else out.sort((a, b) => b.id - a.id);
    return out;
  }, [items, query, sort, activeFilters, config]);

  const openNew = () => {
    const blank = {};
    config.fields.forEach((f) => (blank[f.name] = f.type === "checkbox" ? false : f.defaultValue ?? ""));
    setForm(blank);
    setFormError("");
    setEditing("new");
  };

  const openEdit = (item) => {
    const filled = {};
    config.fields.forEach((f) => (filled[f.name] = item[f.name] ?? (f.type === "checkbox" ? false : "")));
    setForm(filled);
    setFormError("");
    setEditing(item);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      payload[k] = v === "" ? null : v;
    });
    try {
      if (editing === "new") {
        await api.post(config.endpoint, payload);
        showToast(`${config.singular[0].toUpperCase() + config.singular.slice(1)} added`);
      } else {
        await api.put(`${config.endpoint}/${editing.id}`, payload);
        showToast("Changes saved");
      }
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(apiError(err, "Could not save — check the highlighted fields"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirming) return;
    try {
      await api.delete(`${config.endpoint}/${confirming.id}`);
      setConfirming(null);
      showToast("Deleted");
      await load();
    } catch (err) {
      setError(apiError(err, "Could not delete"));
      setConfirming(null);
    }
  };

  return (
    <div>
      {/* 1–3. Context, title, primary action */}
      <p className="eyebrow">{config.title} / Profile</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="display text-[1.55rem]">{config.title}</h1>
        <button onClick={openNew} className="btn-brand ml-auto px-3.5 py-2 text-[13px]">
          <Plus size={15} /> {config.addLabel}
        </button>
      </div>
      <p className="mt-1 max-w-xl text-[13px]" style={{ color: "var(--muted)" }}>{config.tagline}</p>

      {/* 4. Inline toolbar — no decorative container */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-y py-2.5" style={{ borderColor: "var(--line)" }}>
        <span className="relative min-w-44 flex-1">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} aria-hidden="true" />
          <label htmlFor="crud-search" className="sr-only">Search {config.title}</label>
          <input
            id="crud-search"
            className="input pl-8"
            placeholder={`Search ${config.title.toLowerCase()}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery("")} className="icon-btn absolute right-1 top-1/2 -translate-y-1/2" aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </span>
        <label htmlFor="crud-sort" className="sr-only">Sort</label>
        <span className="flex items-center gap-1.5">
          <ArrowUpDown size={14} style={{ color: "var(--muted)" }} aria-hidden="true" />
          <select id="crud-sort" className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </span>
        {(config.filters || []).map((f) => (
          <span key={f.key}>
            <label htmlFor={`filter-${f.key}`} className="sr-only">{f.label}</label>
            <select
              id={`filter-${f.key}`}
              className="input"
              value={activeFilters[f.key] || ""}
              onChange={(e) => setActiveFilters({ ...activeFilters, [f.key]: e.target.value || undefined })}
            >
              <option value="">All {f.label.toLowerCase()}s</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </span>
        ))}
        {config.dynamicFilter && dynamicOptions.length > 0 && (
          <span>
            <label htmlFor={`filter-${config.dynamicFilter.key}`} className="sr-only">{config.dynamicFilter.label}</label>
            <select
              id={`filter-${config.dynamicFilter.key}`}
              className="input"
              value={activeFilters[config.dynamicFilter.key] || ""}
              onChange={(e) => setActiveFilters({ ...activeFilters, [config.dynamicFilter.key]: e.target.value || undefined })}
            >
              <option value="">All technologies</option>
              {dynamicOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </span>
        )}
        <span className="ml-auto text-xs font-semibold tabular-nums" style={{ color: "var(--muted)" }} aria-live="polite">
          {loading ? "…" : `${visible.length} of ${items.length}`}
        </span>
      </div>

      {error && (
        <div className="solid card mt-3 flex items-center gap-3 px-4 py-3">
          <p className="text-[13px] font-semibold" style={{ color: "var(--danger)" }}>{error}</p>
          <button onClick={load} className="btn-ghost ml-auto px-3 py-1 text-xs font-semibold">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="mt-2 space-y-px" aria-label="Loading">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}
        </div>
      ) : visible.length === 0 ? (
        /* Compact empty state */
        <div className="mx-auto max-w-sm py-12 text-center">
          <span className="icon-tile mx-auto" style={{ width: "2.75rem", height: "2.75rem" }}>
            <ModuleIcon size={20} />
          </span>
          <p className="eyebrow mt-4" style={{ color: "var(--ink)" }}>{config.emptyTitle || "NOTHING HERE YET"}</p>
          <p className="mx-auto mt-1.5 max-w-xs text-[13px]" style={{ color: "var(--muted)" }}>
            {items.length === 0 ? config.empty : "No records match — try a different search or clear the filters."}
          </p>
          {items.length === 0 ? (
            <button onClick={openNew} className="btn-brand mx-auto mt-4 px-4 py-2 text-[13px]">
              <Plus size={15} /> {config.addLabel.replace("Add ", "Add your first ").replace("Add your first education", "Add education record")}
            </button>
          ) : (
            <button onClick={() => { setQuery(""); setActiveFilters({}); }} className="btn-ghost mx-auto mt-4 px-4 py-2 text-[13px] font-semibold">Clear search</button>
          )}
        </div>
      ) : (
        /* 5. Records — timeline, grid, or divided rows per module */
        <ul
          className={config.variant === "grid" ? "mt-2 grid gap-2 sm:grid-cols-2" : "mt-1 divide-y"}
          style={{ borderColor: "var(--line)" }}
        >
          {visible.map((item) => (
            <RecordRow
              key={item.id}
              config={config}
              ModuleIcon={ModuleIcon}
              item={item}
              onEdit={openEdit}
              onDelete={setConfirming}
            />
          ))}
        </ul>
      )}

      {/* Editor dialog */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/45 p-4 blur-backdrop"
            onClick={() => setEditing(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={editing === "new" ? config.addLabel : `Edit ${config.singular}`}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: 0.18 }}
              className="solid card max-h-[90vh] w-full max-w-lg overflow-y-auto p-5 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base font-extrabold tracking-tight">{editing === "new" ? config.addLabel : `Edit ${config.singular}`}</h2>
              {formError && (
                <p role="alert" className="mt-2 rounded-md p-2.5 text-[13px] font-medium" style={{ background: "var(--chip)", color: "var(--danger)" }}>
                  {formError}
                </p>
              )}
              <form onSubmit={save}>
                <div className="mt-4 grid gap-3">
                  {config.fields.map((f, i) => (
                    <div key={f.name}>
                      <label className="label" htmlFor={`f-${f.name}`}>{f.label}{f.required && " *"}</label>
                      {f.type === "checkbox" ? (
                        <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-sm">
                          <input
                            id={`f-${f.name}`}
                            ref={i === 0 ? firstField : undefined}
                            type="checkbox"
                            className="mt-1 h-4 w-4 shrink-0"
                            style={{ accentColor: "var(--brand)" }}
                            checked={!!form[f.name]}
                            onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                          />
                          <span>
                            <span className="font-semibold">{f.label}</span>
                            {f.help && <span className="block text-xs" style={{ color: "var(--muted)" }}>{f.help}</span>}
                          </span>
                        </label>
                      ) : f.type === "textarea" ? (
                        <textarea
                          id={`f-${f.name}`}
                          ref={i === 0 ? firstField : undefined}
                          className="input mt-1"
                          rows={3}
                          placeholder={f.placeholder}
                          value={form[f.name] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          required={!!f.required}
                        />
                      ) : f.type === "select" ? (
                        <select
                          id={`f-${f.name}`}
                          ref={i === 0 ? firstField : undefined}
                          className="input mt-1 w-full"
                          value={form[f.name] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          required={!!f.required}
                        >
                          <option value="">Select…</option>
                          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          id={`f-${f.name}`}
                          ref={i === 0 ? firstField : undefined}
                          type={f.type || "text"}
                          className="input mt-1"
                          placeholder={f.placeholder}
                          value={form[f.name] ?? ""}
                          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                          required={!!f.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setEditing(null)} className="btn-ghost px-4 py-2 text-[13px] font-semibold">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-brand px-4 py-2 text-[13px]">
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/45 p-4 blur-backdrop"
            onClick={() => setConfirming(null)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-label="Confirm deletion"
              aria-describedby="delete-desc"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="solid card w-full max-w-sm p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-[15px] font-extrabold">Delete {config.singular}?</h2>
              <p id="delete-desc" className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
                “{config.titleOf(confirming)}” will be permanently removed. This cannot be undone.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button ref={firstField} onClick={() => setConfirming(null)} className="btn-ghost px-4 py-2 text-[13px] font-semibold">Cancel</button>
                <button onClick={remove} className="px-4 py-2 text-[13px] font-bold" style={{ background: "var(--danger)", color: "var(--brand-ink)", borderRadius: "0.55rem" }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast message={toast} />
    </div>
  );
}
