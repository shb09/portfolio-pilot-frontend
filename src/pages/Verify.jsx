import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BadgeCheck, TriangleAlert } from "lucide-react";
import { pub, apiError } from "../api/client";
import AuthLayout from "../components/AuthLayout";

export default function Verify() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState({ loading: !!token, ok: false, message: token ? "" : "This verification link is missing its token." });

  useEffect(() => {
    if (!token) return;
    pub
      .get(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((res) => setState({ loading: false, ok: true, message: res.data.message }))
      .catch((err) => setState({ loading: false, ok: false, message: apiError(err, "Verification failed.") }));
  }, [token]);

  return (
    <AuthLayout
      title="Email verification"
      subtitle="One click activates your account."
      footer={<><Link to="/login" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>Back to login</Link></>}
    >
      {state.loading ? (
        <div className="skeleton h-16" aria-label="Verifying" />
      ) : (
        <div className="flex items-start gap-3">
          <span className="icon-tile">
            {state.ok ? <BadgeCheck size={18} /> : <TriangleAlert size={18} />}
          </span>
          <div className="text-sm leading-relaxed">
            <p className="font-extrabold" style={{ color: state.ok ? "var(--ink)" : "var(--danger)" }}>
              {state.ok ? "Verified" : "Not verified"}
            </p>
            <p className="mt-1" style={{ color: "var(--muted)" }}>{state.message}</p>
            {state.ok ? (
              <Link to="/login" className="btn-brand mt-3 inline-flex px-4 py-2 text-[13px]">Sign in now</Link>
            ) : (
              <Link to="/register" className="btn-ghost mt-3 inline-flex px-4 py-2 text-[13px] font-semibold">Request a new link</Link>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
