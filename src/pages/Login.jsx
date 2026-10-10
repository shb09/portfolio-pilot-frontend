import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api, apiError } from "../api/client";
import AuthLayout from "../components/AuthLayout";

const OAUTH_MESSAGES = {
  cancelled: "Google sign-in was cancelled. Try again or use your password.",
  error: "Google sign-in failed. Try again or use your password.",
  exists: "An account with that Google email already exists. Sign in with your password — it keeps working.",
  denied: "This account cannot use Google sign-in. Please use your password.",
  unverified: "Google email is not verified. Verify it with Google first.",
};

const googleStartUrl = `${import.meta.env.VITE_API_URL || ""}/oauth2/authorization/google`;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleOn, setGoogleOn] = useState(false);

  useEffect(() => {
    api.get("/auth/oauth/status").then((res) => setGoogleOn(!!res.data.googleEnabled)).catch(() => {});
  }, []);

  const oauthNote = params.get("oauth");
  const oauthMessage = oauthNote ? OAUTH_MESSAGES[oauthNote] || OAUTH_MESSAGES.error : "";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(identifier, password);
      navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(apiError(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your username or email address."
      footer={<>New here? <Link to="/register" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Create an account</Link></>}
    >
      <form onSubmit={submit} noValidate={false}>
        {(error || oauthMessage) && (
          <p role="alert" className="mb-3 rounded-md border-[1.5px] p-2.5 text-[13px] font-semibold" style={{ borderColor: "var(--danger)", background: "var(--chip)", color: "var(--danger)" }}>
            {error || oauthMessage}
          </p>
        )}
        {googleOn && (
          <>
            <a href={googleStartUrl} className="btn-ghost w-full justify-center py-2.5 text-sm font-bold">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.3.1c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.3 7.5 24 12 24z" />
                <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8H1.4C.5 8.5 0 10.2 0 12s.5 3.5 1.4 5.3l3.8-2.9z" />
                <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.7 1.4 6.7l3.8 2.9c1-2.9 3.7-4.9 6.8-4.9z" />
              </svg>
              Continue with Google
            </a>
            <p className="my-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              <span className="h-px flex-1" style={{ background: "var(--line)" }} aria-hidden="true" /> or <span className="h-px flex-1" style={{ background: "var(--line)" }} aria-hidden="true" />
            </p>
          </>
        )}
        <label className="label" htmlFor="identifier">Username or email</label>
        <input
          id="identifier" className="input mt-1" required autoComplete="username"
          value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="asha-01 or you@college.edu"
        />
        <label className="label mt-3.5 block" htmlFor="password">Password</label>
        <input
          id="password" className="input mt-1" type="password" required autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
        />
        <button type="submit" disabled={busy} className="btn-brand mt-5 w-full justify-center py-2.5 text-sm">
          {busy ? "Signing in…" : "Login"}
        </button>
        <p className="mt-3 text-center text-[13px]">
          <Link to="/forgot" className="font-semibold underline underline-offset-2" style={{ color: "var(--muted)" }}>Forgot password?</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
