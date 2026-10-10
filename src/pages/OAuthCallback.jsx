import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, apiError } from "../api/client";
import AuthLayout from "../components/AuthLayout";

/** OAuth landing pad: exchanges the one-time code, then hard-navigates
    so the app revalidates the session from /auth/me on load. */
export default function OAuthCallback() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    const code = params.get("code") || "";
    if (!code) {
      setState({ loading: false, error: "Missing sign-in code. Please start Google sign-in again from the login page." });
      return;
    }
    api
      .post("/auth/oauth/exchange", { code })
      .then((res) => {
        localStorage.setItem("pp_token", res.data.token);
        localStorage.setItem("pp_user", JSON.stringify(res.data.user));
        window.location.href = res.data.user?.role === "ADMIN" ? "/admin" : "/dashboard";
      })
      .catch((err) => setState({
        loading: false,
        error: apiError(err, "Google sign-in failed. The attempt may have expired — please try again."),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthLayout
      title="Finishing Google sign-in…"
      subtitle="Exchanging the one-time code for your session."
      footer={<><Link to="/login" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Back to login</Link></>}
    >
      {state.loading && <div className="skeleton h-14" aria-label="Signing in" />}
      {state.error && (
        <div>
          <p role="alert" className="rounded-md border-[1.5px] p-2.5 text-[13px] font-semibold" style={{ borderColor: "var(--danger)", background: "var(--chip)", color: "var(--danger)" }}>
            {state.error}
          </p>
          <Link to="/login" className="btn-brand mt-3 inline-flex px-4 py-2 text-[13px]">Back to login</Link>
        </div>
      )}
    </AuthLayout>
  );
}
