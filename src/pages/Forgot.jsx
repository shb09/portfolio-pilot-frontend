import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { pub, apiError } from "../api/client";
import AuthLayout from "../components/AuthLayout";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await pub.post("/api/auth/forgot", { email });
      setNote(data.message);
    } catch (err) {
      setNote(apiError(err, "Could not process that request."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We will email you a one-hour reset link."
      footer={<><Link to="/login" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Back to login</Link></>}
    >
      <form onSubmit={submit}>
        <label className="label" htmlFor="email">Email</label>
        <div className="mt-1 flex gap-2">
          <input
            id="email" className="input" type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu"
          />
          <button type="submit" disabled={busy} className="btn-brand shrink-0 px-4 py-2 text-sm">
            <KeyRound size={15} /> {busy ? "…" : "Send"}
          </button>
        </div>
        {note && <p role="status" className="mt-3 text-[13px] font-semibold">{note}</p>}
      </form>
    </AuthLayout>
  );
}
