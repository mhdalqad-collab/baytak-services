import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, ShieldCheck, Store, Wrench } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const navItems = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/customer", labelKey: "nav.customer", icon: LayoutDashboard },
  { to: "/provider", labelKey: "nav.provider", icon: Store },
  { to: "/admin", labelKey: "nav.admin", icon: ShieldCheck }
];

export default function AppShell({ children }) {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const isLanding = location.pathname === "/";

  return (
    <div className="min-h-screen text-ink">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-sand/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white shadow-card">
              <Wrench size={21} />
            </div>
            <div>
              <p className="font-display text-xl font-bold leading-none">Baytak</p>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-lagoon">{t("brand.services")}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                      isActive
                        ? "bg-ink text-white shadow-card"
                        : "text-ink/70 hover:bg-white/70 hover:text-ink"
                    }`
                  }
                >
                  <Icon size={16} />
                  {t(item.labelKey)}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="language-select">
              {t("language.label")}
            </label>
            <select
              id="language-select"
              className="rounded-full border border-ink/10 bg-white/75 px-3 py-2 text-sm font-extrabold text-ink outline-none transition focus:ring-4 focus:ring-palm/20"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label={t("language.label")}
            >
              <option value="en">{t("language.english")}</option>
              <option value="ar">{t("language.arabic")}</option>
            </select>
            <Link to="/services" className="btn-primary hidden sm:inline-flex">
              {t("nav.requestService")}
            </Link>
          </div>
        </div>
      </header>

      <main className={isLanding ? "" : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"}>{children}</main>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 gap-2 rounded-[2rem] border border-white/70 bg-white/85 p-2 shadow-soft backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-3xl px-2 py-2 text-[0.68rem] font-extrabold ${
                  isActive ? "bg-ink text-white" : "text-ink/60"
                }`
              }
            >
              <Icon size={17} />
              {t(item.labelKey)}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
