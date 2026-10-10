import { useEffect, useState } from "react";
import { api, apiError } from "../api/client";
import Toast from "../components/Toast";

const SECTIONS = [
  {
    title: "Identity",
    help: "Your name comes from your account. This is how your hero section introduces you.",
    fields: [
      ["headline", "Headline", "Java Developer · CS Undergrad", "One line under your name — role, focus, or ambition."],
      ["about", "About", "A few lines about who you are…", "2–4 sentences: background, interests, what you're looking for. Powers 10 readiness points."],
    ],
  },
  {
    title: "Location",
    help: "Shown on your hero and helps recruiters filter by region.",
    fields: [
      ["location", "Location", "Chennai, India", "City, country, or “Remote”."],
    ],
  },
  {
    title: "Links",
    help: "Every link is tracked on your public page — you'll see the clicks in Analytics.",
    fields: [
      ["githubUrl", "GitHub URL", "https://github.com/you", "Unlocks the “Connect GitHub” recommendation."],
      ["linkedinUrl", "LinkedIn URL", "https://linkedin.com/in/you", "Shows beside GitHub on your hero."],
      ["resumeUrl", "Resume URL", "https://…/resume.pdf", "Link a hosted PDF — resume clicks are counted."],
    ],
  },
];

const EMPTY = { headline: "", about: "", location: "", githubUrl: "", linkedinUrl: "", resumeUrl: "" };

export default function ProfilePage() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api
      .get("/profile")
      .then((res) => setForm({ ...EMPTY, ...res.data }))
      .catch((err) => {
        if (err?.response?.status !== 404) setError(apiError(err, "Could not load profile"));
      });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {};
    Object.entries(form).forEach(([k, v]) => (payload[k] = v === "" ? null : v));
    try {
      await api.put("/profile", payload);
      setToast("Profile saved — readiness updated ✓");
      setTimeout(() => setToast(""), 2400);
    } catch (err) {
      setError(apiError(err, "Could not save profile"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-[1.7rem]">My Profile</h1>
      <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
        This powers your hero section, About, and contact links everywhere.
      </p>
      <form onSubmit={save} className="mt-5 space-y-4">
        {error && <p role="alert" className="solid card p-3 text-sm font-medium" style={{ color: "var(--danger)" }}>{error}</p>}
        {SECTIONS.map((sec) => (
          <fieldset key={sec.title} className="solid card p-6">
            <legend className="sr-only">{sec.title}</legend>
            <h2 className="font-extrabold">{sec.title}</h2>
            <p className="mt-0.5 text-[13px]" style={{ color: "var(--muted)" }}>{sec.help}</p>
            <div className="mt-4 space-y-3.5">
              {sec.fields.map(([name, label, ph, help]) => (
                <div key={name}>
                  <label className="label" htmlFor={name}>{label}</label>
                  {name === "about" ? (
                    <textarea id={name} rows={4} className="input mt-1" placeholder={ph}
                      aria-describedby={`${name}-help`}
                      value={form[name] ?? ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
                  ) : (
                    <input id={name} className="input mt-1" placeholder={ph}
                      aria-describedby={`${name}-help`}
                      value={form[name] ?? ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
                  )}
                  <p id={`${name}-help`} className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{help}</p>
                </div>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setForm(EMPTY)} className="btn-ghost px-4 py-2 text-sm font-semibold">Clear</button>
          <button type="submit" disabled={busy} className="btn-brand px-6 py-2 text-sm">
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
      <Toast message={toast} />
    </div>
  );
}
