import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Layout from "./components/Layout";
import Aurora from "./components/Aurora";
import AmbientGlow from "./components/AmbientGlow";
import Ripple from "./components/Ripple";
import CrudPage from "./components/CrudPage";
import { MODULES } from "./config/modules";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import OAuthCallback from "./pages/OAuthCallback";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import Preview from "./pages/Preview";
import AnalyticsPage from "./pages/AnalyticsPage";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import PublicPortfolio from "./pages/PublicPortfolio";

function Guard({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="p-8" style={{ color: "var(--muted)" }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Aurora />
      {children}
    </Layout>
  );
}

/** Server role is the boundary; this only keeps UX tidy. */
function AdminGuard({ children }) {
  const { user, ready, isAdmin } = useAuth();
  if (!ready) return <p className="p-8" style={{ color: "var(--muted)" }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return (
    <Layout>
      <Aurora />
      {children}
    </Layout>
  );
}

const crud = (key) => (
  <Guard>
    <CrudPage config={MODULES[key]} />
  </Guard>
);

export default function App() {
  return (
    <>
      <AmbientGlow />
      <Ripple />
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
      <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
      <Route path="/profile" element={<Guard><ProfilePage /></Guard>} />
      <Route path="/projects" element={crud("projects")} />
      <Route path="/skills" element={crud("skills")} />
      <Route path="/education" element={crud("education")} />
      <Route path="/experience" element={crud("experience")} />
      <Route path="/certifications" element={crud("certifications")} />
      <Route path="/achievements" element={crud("achievements")} />
      <Route path="/preview" element={<Guard><Preview /></Guard>} />
      <Route path="/analytics" element={<Guard><AnalyticsPage /></Guard>} />
      <Route path="/settings" element={<Guard><Settings /></Guard>} />
      <Route path="/portfolio/:username" element={<PublicPortfolio />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
