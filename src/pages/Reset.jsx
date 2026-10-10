import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { pub, apiError } from "../api/client";
import AuthLayout from "../components/AuthLayout";

export default function Reset() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNote("");
    try {
      const { data } = await pub.post("/api/auth/reset", { token, newPassword: password });
      setNote(data.message);
      setOk(true);
    } catch (err) {
      setNote(apiError(err, "Reset failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Minimum 10 characters. The link works once."
      footer={<><Link to="/login" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Back to login</Link></>}
    >
      {!token ? (
        <p role="alert" className="text-sm font-semibold" style={{ color: "var(--danger)" }}>
          This reset link is missing its token. Request a new one from the login page.
        </p>
      ) : ok ? (
        <div className="text-sm">
          <p className="font-bold">{note}</p>
          <Link to="/login" className="btn-brand mt-3 inline-flex px-4 py-2 text-[13px]">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          {note && <p role="alert" className="mb-3 text-[13px] font-semibold" style={{ color: "var(--danger)" }}>{note}</p>}
          <label className="label" htmlFor="password">New password</label>
          <input
            id="password" className="input mt-1" type="password" required minLength={10} autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 10 characters"
          />
          <button type="submit" disabled={busy} className="btn-brand mt-4 w-full justify-center py-2.5 text-sm">
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
