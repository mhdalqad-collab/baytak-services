import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, Palette, ShieldCheck, Store, Wrench, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";

const navItems = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/customer", labelKey: "nav.customer", icon: LayoutDashboard },
  { to: "/provider", labelKey: "nav.provider", icon: Store },
  { to: "/admin", labelKey: "nav.admin", icon: ShieldCheck }
];

export default function AppShell({ children }) {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, themeOptions } = useTheme();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const customizeRef = useRef(null);
  const isLanding = location.pathname === "/";

  useEffect(() => {
    function handleClickOutside(event) {
      if (customizeRef.current && !customizeRef.current.contains(event.target)) {
        setCustomizeOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setCustomizeOpen(false);
    }

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="min-h-screen text-ink">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-[var(--surface-header)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:flex-nowrap lg:px-8">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <div className="premium-panel grid h-10 w-10 shrink-0 place-items-center rounded-2xl shadow-card sm:h-11 sm:w-11">
              <Wrench size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold leading-none sm:text-xl">Baytak</p>
              <p className="truncate text-[0.65rem] font-bold uppercase tracking-[0.18em] text-lagoon sm:text-xs sm:tracking-[0.25em]">{t("brand.services")}</p>
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
                        ? "bg-lagoon text-white shadow-card"
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

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
            <div className="relative" ref={customizeRef}>
              <button
                type="button"
                className="theme-select inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-extrabold outline-none transition hover:border-lagoon/40 focus:ring-4 focus:ring-palm/20 sm:px-4 sm:text-sm"
                onClick={() => setCustomizeOpen((open) => !open)}
                aria-expanded={customizeOpen}
                aria-controls="customize-panel"
                aria-label={t("settings.customize")}
              >
                <Palette size={16} />
                <span>{t("settings.customize")}</span>
              </button>

              {customizeOpen && (
                <div
                  id="customize-panel"
                  className="surface-card fixed left-1/2 top-[5.75rem] z-[60] max-h-[calc(100dvh-7rem)] w-[min(calc(100vw-2rem),20rem)] -translate-x-1/2 overflow-y-auto rounded-[1.6rem] p-4 shadow-soft"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lagoon">{t("settings.customize")}</p>
                      <p className="mt-1 text-sm font-bold text-ink/55">{t("language.label")} & {t("theme.label")}</p>
                    </div>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full bg-mist text-ink"
                      onClick={() => setCustomizeOpen(false)}
                      aria-label={t("settings.close")}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <label className="grid gap-2 text-sm font-extrabold">
                      {t("language.label")}
                      <select
                        id="language-select"
                        className="theme-select w-full rounded-2xl px-3 py-3 text-sm font-extrabold outline-none transition focus:ring-4 focus:ring-palm/20"
                        value={language}
                        onChange={(event) => setLanguage(event.target.value)}
                        aria-label={t("language.label")}
                      >
                        <option value="en">{t("language.english")}</option>
                        <option value="ar">{t("language.arabic")}</option>
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-extrabold">
                      {t("theme.label")}
                      <select
                        id="theme-select"
                        className="theme-select w-full rounded-2xl px-3 py-3 text-sm font-extrabold outline-none transition focus:ring-4 focus:ring-palm/20"
                        value={theme}
                        onChange={(event) => setTheme(event.target.value)}
                        aria-label={t("theme.label")}
                      >
                        {themeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <Link to="/services" className="btn-primary hidden lg:inline-flex">
              {t("nav.requestService")}
            </Link>
          </div>
        </div>
      </header>

      <main className={isLanding ? "pb-28 md:pb-0" : "mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 md:pb-8 lg:px-8"}>{children}</main>

      <nav className="surface-card fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50 grid grid-cols-4 gap-1 rounded-[1.6rem] p-1.5 shadow-soft backdrop-blur-xl sm:gap-2 sm:rounded-[2rem] sm:p-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[0.62rem] font-extrabold sm:rounded-3xl sm:px-2 sm:text-[0.68rem] ${
                  isActive ? "bg-lagoon text-white" : "text-ink/60"
                }`
              }
            >
              <Icon size={17} className="shrink-0" />
              <span className="max-w-full truncate">{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
