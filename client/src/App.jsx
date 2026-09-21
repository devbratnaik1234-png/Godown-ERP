import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Wheat,
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Truck,
  Wallet,
  ChartNoAxesCombined,
  Settings as SettingsIcon,
  Sparkles,
  Menu,
  LogOut,
  Factory,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import "./i18n";
import About from "./ultimate/About";
import "./ultimate/styles.css";
import { request } from "./ultimate/api";
import { LanguageSelect, ErrorNotice, Loading } from "./ultimate/components";
import Dashboard, { Inventory } from "./ultimate/Dashboard";
import ResourcePage from "./ultimate/ResourcePage";
import PaddyPal from "./ultimate/PaddyPal";
import Settings from "./ultimate/Settings";
import { resources } from "./ultimate/resources";
const navigation = [
  ["dashboard", LayoutDashboard, "/"],
  ["parties", Users],
  ["purchases", ShoppingBag],
  ["sales", ArrowUpRight],
  ["inventory", Package],
  ["processing", Factory],
  ["payments", Wallet],
  ["trucks", Truck],
  ["labours", Users],
  ["products", Wheat],
  ["warehouses", Building2],
  ["reports", ChartNoAxesCombined],
  ["refunds", RotateCcw],
  ["audit", ShieldCheck],
  ["users", Users],
  ["settings", SettingsIcon],
  ["about", Users],
];
export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [error, setError] = useState(null),
    [menu, setMenu] = useState(false);
  const applyUser = async (account) => {
    setUser(account);
    await i18n.changeLanguage(
      sessionStorage.getItem("paddysync.locale") ||
        account.preferredLanguage ||
        account.language ||
        account.organization.defaultLanguage,
    );
  };
  useEffect(() => {
    let active = true;
    request("/auth/me")
      .then(async (account) => {
        if (!active) return;
        setUser(account);
        await i18n.changeLanguage(
          sessionStorage.getItem("paddysync.locale") ||
            localStorage.getItem("paddysync.locale") ||
            account.preferredLanguage ||
            account.language ||
            account.organization.defaultLanguage,
        );
      })
      .catch((e) => {
        if (active && e.code !== "UNAUTHENTICATED") setError(e);
      })
      .finally(() => active && setChecking(false));
    const logout = () => setUser(null);
    window.addEventListener("paddysync:logout", logout);
    return () => {
      active = false;
      window.removeEventListener("paddysync:logout", logout);
    };
  }, [i18n]);
  const changeLanguage = async (lang) => {
    const previous = i18n.language;
    await i18n.changeLanguage(lang);
    setError(null);
    if (sessionStorage.getItem("paddysync.temporary")) {
      sessionStorage.setItem("paddysync.locale", lang);
      return;
    }
    try {
      if (user)
        setUser(
          await request("/auth/preferences", {
            method: "PATCH",
            body: { preferredLanguage: lang },
          }),
        );
      localStorage.setItem("paddysync.locale", lang);
      sessionStorage.removeItem("paddysync.locale");
    } catch (e) {
      i18n.changeLanguage(previous);
      setError(e);
    }
  };
  const logout = async () => {
    try {
      await request("/auth/logout", { method: "POST" });
      setUser(null);
      sessionStorage.removeItem("paddysync.locale");
    } catch (e) {
      setError(e);
    }
  };
  if (checking) return <Loading />;
  if (!user)
    return (
      <Routes>
        <Route path="/about" element={<About publicView changeLanguage={changeLanguage} />} />
        <Route path="*" element={<Login onLogin={applyUser} changeLanguage={changeLanguage} inheritedError={error} />} />
      </Routes>
    );
  const allowed = (key) =>
    (!resources[key]?.admin || user.role === "admin") &&
    (!resources[key]?.finance ||
      ["admin", "manager", "accountant"].includes(user.role));
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="nav-overlay"
          aria-label={t("common.close")}
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <NavLink className="brand" to="/" onClick={() => setMenu(false)}>
          <span className="brand-icon">
            <Wheat size={24} />
          </span>
          PaddySync
          <span className="brand-dot" />
        </NavLink>
        <p className="nav-label">{t("nav.operations")}</p>
        <nav>
          {navigation
            .filter(([key]) => allowed(key))
            .map(([key, Icon, path]) => (
              <NavLink
                end
                to={path || "/" + key}
                key={key}
                onClick={() => setMenu(false)}
              >
                <Icon size={19} />
                <span>{t("nav." + key)}</span>
              </NavLink>
            ))}
        </nav>
        <NavLink
          to="/paddypal"
          className="pal-nav"
          onClick={() => setMenu(false)}
        >
          <Sparkles size={20} />
          <span>PaddyPal</span>
          <ArrowUpRight size={16} />
        </NavLink>
        <div className="sidebar-footer">
          <span className="avatar">{user.name.slice(0, 1)}</span>
          <div>
            <strong>{user.name}</strong>
            <small>{t(`kinds.${user.role}`)}</small>
          </div>
          <button
            onClick={logout}
            className="icon-button"
            aria-label={t("nav.logout")}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenu(true)}
              aria-label={t("nav.menu")}
            >
              <Menu />
            </button>
            <span className="workspace-name">{user.organization.name}</span>
          </div>
          <div className="topbar-right">
            <LanguageSelect value={i18n.language} onChange={changeLanguage} />
            <NavLink to="/paddypal" className="assistant-link">
              <Sparkles size={17} />
              <span>PaddyPal</span>
            </NavLink>
          </div>
        </header>
        <main id="main-content">
          <ErrorNotice error={error} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Dashboard report />} />
            <Route path="/paddypal" element={<PaddyPal />} />
            <Route
              path="/settings"
              element={<Settings user={user} setUser={setUser} />}
            />
            {Object.keys(resources)
              .filter(allowed)
              .map((key) => (
                <Route
                  key={key}
                  path={"/" + key}
                  element={
                    <ResourcePage key={key} resource={key} user={user} />
                  }
                />
              ))}
            <Route
              path="/purchase"
              element={<Navigate to="/purchases" replace />}
            />
            <Route
              path="/farmers"
              element={<Navigate to="/parties" replace />}
            />
            <Route
              path="/stock"
              element={<Navigate to="/inventory" replace />}
            />
            <Route path="/truck" element={<Navigate to="/trucks" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
function Login({ onLogin, changeLanguage, inheritedError }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      onLogin(data.user);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login-page">
      <div className="login-story">
        <span className="brand">
          <span className="brand-icon">
            <Wheat />
          </span>
          PaddySync
        </span>
        <div>
          <p className="eyebrow">PaddySync</p>
          <h1>{t("login.title")}</h1>
          <p>{t("login.subtitle")}</p>
        </div>
        <div className="grain-art" aria-hidden="true">
          <Wheat strokeWidth={0.8} />
          <Wheat strokeWidth={0.8} />
          <Wheat strokeWidth={0.8} />
        </div>
      </div>
      <div className="login-side">
        <LanguageSelect value={i18n.language} onChange={changeLanguage} />
        <form className="login-form" onSubmit={submit}>
          <span className="login-lock">
            <ShieldCheck size={28} />
          </span>
          <h2>{t("login.signin")}</h2>
          <p className="subtle">{t("login.secure")}</p>
          <ErrorNotice error={error || inheritedError} />
          <label>
            {t("login.email")}
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            {t("login.password")}
            <input
              type="password"
              autoComplete="current-password"
              required
              maxLength={200}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="primary" disabled={busy}>
            {t(busy ? "common.loading" : "login.signin")}
            <ArrowUpRight size={18} />
          </button>
          <NavLink className="creator-credit" to="/about">{t("about.credit", { name: "Samarjit Chatterjee" })}</NavLink>
        </form>
      </div>
    </div>
  );
}
