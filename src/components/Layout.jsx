import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award, BarChart3, Briefcase, ChevronDown, FolderKanban, GraduationCap,
  Layers, LayoutDashboard, LogOut, Menu, Moon, Rocket,
  Settings as SettingsIcon, ShieldCheck, Sun, Trophy, UserRound, X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";

const MAIN = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Profile", "/profile", UserRound],
  ["Projects", "/projects", FolderKanban],
  ["Experience", "/experience", Briefcase],
];

const MORE = [
  ["Skills", "/skills", Layers],
  ["Education", "/education", GraduationCap],
  ["Certifications", "/certifications", Award],
  ["Achievements", "/achievements", Trophy],
];

const INSIGHTS = [["Preview & Publish", "/preview", Rocket]];

function BrandMark({ size = 28 }) {
  return (
    <span
      className="flex items-center justify-center rounded-[4px] text-[13px] font-extrabold"
      style={{ width: size, height: size, background: "var(--lime)", color: "#171717", border: "1.5px solid var(--line-strong)" }}
      aria-hidden="true"
    >
      P
    </span>
  );
}

function NavGroup({ label, items, onGo }) {
  return (
    <div>
      <p className="nav-section px-2.5 pb-1 pt-2.5">{label}</p>
      <ul className="space-y-px">
        {items.map(([name, to, Icon]) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onGo}
              className={({ isActive }) => `navlink flex items-center gap-2.5 px-3 py-2.5${isActive ? " active" : ""}`}
            >
              <Icon size={15} aria-hidden="true" /> {name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useDismiss(onClose) {  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return ref;
}

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggle, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const lastHidden = useRef(false);
  const lastScrolled = useRef(false);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const headerRef = useRef(null);
  const moreRef = useDismiss(() => setMoreOpen(false));
  const accountRef = useDismiss(() => setAccountOpen(false));

  const quit = () => {
    logout();
    navigate("/login");
  };

  const all = [...MAIN, ...MORE, ...INSIGHTS, ["Analytics", "/analytics", BarChart3], ["Settings", "/settings", SettingsIcon], ["Admin", "/admin", ShieldCheck]];
  const crumb = all.find(([, to]) => to === location.pathname)?.[0] || "Workspace";
  const moreActive = MORE.some(([, to]) => to === location.pathname);

  // Mobile drawer: Escape/outside dismiss, focus moves in on open and back on close.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const onDoc = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    const t = setTimeout(() => drawerRef.current?.querySelector("a, button")?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
      clearTimeout(t);
      menuButtonRef.current?.focus();
    };
  }, [mobileOpen]);

  // Scroll behavior: hide on scroll down, reveal on scroll up. Never hides
  // while menus are open, focus sits in the header, or reduced motion is on.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const interacting = moreOpen || accountOpen || mobileOpen
          || (headerRef.current && headerRef.current.contains(document.activeElement));
        if (interacting || y <= 160) {
          if (lastHidden.current) {
            lastHidden.current = false;
            setNavHidden(false);
          }
        } else {
          const next = y > lastY.current + 4 ? true : y < lastY.current - 4 ? false : lastHidden.current;
          if (next !== lastHidden.current) {
            lastHidden.current = next;
            setNavHidden(next);
          }
        }
        const isScrolled = y > 8;
        if (isScrolled !== lastScrolled.current) {
          lastScrolled.current = isScrolled;
          setScrolled(isScrolled);
        }
        lastY.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [moreOpen, accountOpen, mobileOpen]);

  const mainLink = ([name, to, Icon]) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) => `navlink flex items-center gap-1.5 px-2.5 py-1.5${isActive ? " active" : ""}`}
    >
      <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
      {name}
    </NavLink>
  );

  return (
    <div className="min-h-screen">
      {/* Compact top navigation */}
      <header ref={headerRef} className="sticky top-0 z-20 border-b-2" style={{ background: scrolled ? "color-mix(in srgb, var(--nav) 86%, transparent)" : "var(--nav)", backdropFilter: scrolled ? "blur(12px)" : "none", WebkitBackdropFilter: scrolled ? "blur(12px)" : "none", borderColor: "var(--line-strong)", transform: navHidden ? "translateY(-100%)" : "none", transition: "transform 0.22s ease, background 0.2s ease" }}>
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 px-3.5 py-2 sm:px-5">
          <Link to="/dashboard" className="mr-1 flex shrink-0 items-center gap-2">
            <BrandMark />
            <span className="hidden text-sm font-extrabold tracking-tight min-[420px]:block">PORTFOLIO&nbsp;PILOT</span>
          </Link>
          <nav className="ml-2 hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto lg:flex" aria-label="Primary">
            {MAIN.map(mainLink)}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((o) => !o)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className={`navlink flex items-center gap-1 px-2.5 py-1.5${moreActive ? " active" : ""}`}
              >
                More <ChevronDown size={13} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.14 }}
                    className="glass-pop card absolute left-0 top-full z-30 mt-1.5 w-52 p-1.5"
                    role="menu"
                  >
                    {MORE.map(([name, to, Icon]) => (
                      <NavLink
                        key={to}
                        to={to}
                        role="menuitem"
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) => `navlink flex items-center gap-2 px-2.5 py-2${isActive ? " active" : ""}`}
                      >
                        <Icon size={14} aria-hidden="true" /> {name}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <NavLink
              to="/analytics"
              className={({ isActive }) => `navlink flex items-center gap-1.5 px-2.5 py-1.5${isActive ? " active" : ""}`}
            >
              <BarChart3 size={14} aria-hidden="true" /> Insights
            </NavLink>
            <NavLink
              to="/preview"
              className={({ isActive }) => `navlink flex items-center gap-1.5 px-2.5 py-1.5${isActive ? " active" : ""}`}
            >
              <Rocket size={14} aria-hidden="true" /> Preview & Publish
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `navlink flex items-center gap-1.5 px-2.5 py-1.5${isActive ? " active" : ""}`}
              >
                <ShieldCheck size={14} aria-hidden="true" /> Admin
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={toggle} className="icon-btn" aria-label="Toggle theme" title="Toggle theme">
              {theme === "paper" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                aria-expanded={accountOpen}
                aria-haspopup="true"
                aria-label="Account menu"
                className="flex items-center gap-1.5 rounded-[4px] border-[1.5px] px-2 py-1 text-xs font-bold"
                style={{ borderColor: "var(--line-strong)", background: "var(--surface-solid)" }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-[3px] text-[10px] font-extrabold"
                  style={{ background: "var(--lime)", color: "#171717" }} aria-hidden="true">
                  {(user?.name || "?").charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{user?.name?.split(" ")[0]}</span>
                <ChevronDown size={13} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.14 }}
                    className="glass-pop card absolute right-0 top-full z-30 mt-1.5 w-60 p-1.5"
                    role="menu"
                  >
                    <p className="truncate px-2.5 pb-1 pt-1.5 text-xs font-bold">{user?.name}</p>
                    <p className="truncate px-2.5 pb-2 text-[11px]" style={{ color: "var(--muted)" }}>{user?.email}</p>
                    <div className="border-t pt-1.5" style={{ borderColor: "var(--line)" }}>
                      <Link to="/settings" role="menuitem" onClick={() => setAccountOpen(false)} className="navlink flex items-center gap-2 px-2.5 py-2">
                        <SettingsIcon size={14} aria-hidden="true" /> Settings
                      </Link>
                      <p className="eyebrow px-2.5 pb-1 pt-2">Theme</p>
                      <div className="flex gap-1 px-2.5 pb-1.5" role="radiogroup" aria-label="Theme">
                        {[["paper", "Paper"], ["carbon", "Carbon"]].map(([v, l]) => (
                          <button
                            key={v}
                            role="radio"
                            aria-checked={theme === v}
                            onClick={() => setTheme(v)}
                            className="flex-1 rounded-[4px] border-[1.5px] px-2 py-1 text-[11px] font-bold"
                            style={{
                              borderColor: theme === v ? "var(--line-strong)" : "var(--line)",
                              background: theme === v ? "var(--lime)" : "transparent",
                              color: theme === v ? "#171717" : "var(--muted)",
                            }}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                      <button onClick={quit} role="menuitem" className="navlink flex w-full items-center gap-2 px-2.5 py-2" style={{ color: "var(--danger)" }}>
                        <LogOut size={14} aria-hidden="true" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              ref={menuButtonRef}
              onClick={() => setMobileOpen((o) => !o)}
              className="btn-ghost p-1.5 lg:hidden"
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              ref={drawerRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden border-t-2 lg:hidden"
              style={{ borderColor: "var(--line-strong)", background: "var(--nav)" }}
              aria-label="Primary"
            >
              <div className="grid gap-0.5 px-3.5 py-3">
                <NavGroup label="Workspace" items={MAIN} onGo={() => setMobileOpen(false)} />
                <NavGroup label="More" items={MORE} onGo={() => setMobileOpen(false)} />
                <NavGroup
                  label="Insights"
                  items={[
                    ["Analytics", "/analytics", BarChart3],
                    ...INSIGHTS,
                    ...(isAdmin ? [["Admin", "/admin", ShieldCheck]] : []),
                    ["Settings", "/settings", SettingsIcon],
                  ]}
                  onGo={() => setMobileOpen(false)}
                />
                <button onClick={quit} className="navlink flex items-center gap-2.5 px-3 py-2.5 text-left" style={{ color: "var(--danger)" }}>
                  <LogOut size={15} aria-hidden="true" /> Logout ({user?.email})
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-6xl px-3.5 py-5 sm:px-5">
        <p className="eyebrow mb-1" aria-label="Breadcrumb">Pilot / {crumb}</p>
        {children}
      </main>
      <footer className="mx-auto max-w-6xl px-5 pb-8 text-[11px]" style={{ color: "var(--muted)" }}>
        PORTFOLIO PILOT — build your profile, track your progress, launch your career story.
      </footer>
    </div>
  );
}
