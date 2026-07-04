import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, CreditCard, Home, Info, LayoutDashboard, LogOut, Palette, Settings, ShieldCheck, Store, UserRound, Wrench, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";

const navItems = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/about", labelKey: "nav.about", icon: Info },
  { to: "/customer", labelKey: "nav.customer", icon: LayoutDashboard, roles: ["customer", "admin"] },
  { to: "/provider", labelKey: "nav.provider", icon: Store, roles: ["provider", "admin"] },
  { to: "/admin", labelKey: "nav.admin", icon: ShieldCheck, roles: ["admin"] },
  { to: "/payments", label: "Payments", icon: CreditCard, roles: ["provider", "admin"] },
  { to: "/settings", label: "Settings", icon: Settings, requiresSession: true }
];

export default function AppShell({ children, session, onSignOut, notifications = [], apiStatus = "offline" }) {
  const location = useLocation();
  const { isArabic, language, setLanguage, t } = useLanguage();
  const { theme, setTheme, themeOptions } = useTheme();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const customizeRef = useRef(null);
  const notificationsRef = useRef(null);
  const isLanding = location.pathname === "/";
  const unreadCount = notifications.filter((item) => !item.read).length;
  const apiConnected = apiStatus === "connected";
  const navCopy = {
    payments: isArabic ? "المدفوعات" : "Payments",
    settings: isArabic ? "الإعدادات" : "Settings",
    signIn: isArabic ? "تسجيل الدخول" : "Sign in",
    signOut: isArabic ? "تسجيل الخروج" : "Sign out",
    notifications: isArabic ? "التنبيهات" : "Notifications",
    noNotifications: isArabic ? "لا توجد تنبيهات جديدة" : "No new notifications",
    api: isArabic ? "حالة النظام" : "System status",
    connecting: isArabic ? "جاري الاتصال بالخدمة..." : "Connecting to service...",
    offline: isArabic ? "الخدمة غير متاحة مؤقتاً. يمكنك تصفح الصفحات، لكن بعض الإجراءات قد لا تُحفظ." : "Service is temporarily unavailable. You can keep browsing, but some actions may not save."
  };
  const navLabels = {
    "/payments": navCopy.payments,
    "/settings": navCopy.settings
  };
  const visibleNavItems = navItems.filter((item) => {
    if (item.requiresSession && !session) return false;
    if (!item.roles) return true;
    return session && item.roles.includes(session.role);
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (customizeRef.current && !customizeRef.current.contains(event.target)) {
        setCustomizeOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setCustomizeOpen(false);
        setNotificationsOpen(false);
      }
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
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-[var(--surface-header)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lagoon text-white shadow-sm">
              <Wrench size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black leading-none">Baytak</p>
              <p className="truncate text-[0.68rem] font-black uppercase tracking-[0.16em] text-lagoon">{t("brand.services")}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-xl border border-ink/10 bg-white/55 p-1 md:flex">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-extrabold transition ${
                      isActive ? "bg-lagoon text-white shadow-sm" : "text-ink/68 hover:bg-white hover:text-ink"
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.labelKey ? t(item.labelKey) : navLabels[item.to] || item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex min-w-0 items-center justify-end gap-2">
            {session && (
              <Link
                to="/settings"
                className="hidden max-w-44 items-center gap-2 rounded-xl border border-ink/10 bg-white/60 px-3 py-2 text-xs font-extrabold text-ink/70 transition hover:text-lagoon sm:flex"
              >
                <UserRound size={15} className="text-lagoon" />
                <span className="truncate">{session.name}</span>
              </Link>
            )}

            {session && (
              <div className="relative hidden lg:block" ref={notificationsRef}>
                <button
                  type="button"
                  className="relative grid h-10 w-10 place-items-center rounded-xl border border-ink/10 bg-white/60 text-ink/65 transition hover:text-lagoon"
                  aria-label={`${navCopy.notifications}. ${navCopy.api}: ${apiStatus}`}
                  title={`${navCopy.api}: ${apiStatus}`}
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <Bell size={17} />
                  <span className={`absolute right-2 top-2 h-2 w-2 rounded-full ${apiConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {unreadCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-clay px-1.5 py-0.5 text-[0.6rem] font-black text-white">{Math.min(unreadCount, 9)}{unreadCount > 9 ? "+" : ""}</span>}
                </button>

                {notificationsOpen && (
                  <div className="surface-card absolute right-0 top-12 z-[60] w-80 rounded-xl p-4 shadow-soft">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-black">{navCopy.notifications}</p>
                      <span className={`rounded-lg px-2 py-1 text-[0.65rem] font-black ${apiConnected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {apiStatus}
                      </span>
                    </div>
                    <div className="grid max-h-72 gap-2 overflow-y-auto">
                      {notifications.length ? (
                        notifications.slice(0, 6).map((item) => (
                          <div key={item.id} className="rounded-lg bg-mist p-3 text-sm font-bold leading-6 text-ink/70">
                            {item.text}
                          </div>
                        ))
                      ) : (
                        <p className="rounded-lg bg-mist p-3 text-sm font-bold text-ink/55">{navCopy.noNotifications}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={customizeRef}>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 bg-white/60 text-ink/70 outline-none transition hover:text-lagoon focus:ring-4 focus:ring-palm/20"
                onClick={() => setCustomizeOpen((open) => !open)}
                aria-expanded={customizeOpen}
                aria-controls="customize-panel"
                aria-label={t("settings.customize")}
              >
                <Palette size={17} />
              </button>

              {customizeOpen && (
                <div
                  id="customize-panel"
                  className="surface-card fixed right-4 top-[4.75rem] z-[60] max-h-[calc(100dvh-6rem)] w-[min(calc(100vw-2rem),20rem)] overflow-y-auto rounded-xl p-4 shadow-soft sm:right-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-lagoon">{t("settings.customize")}</p>
                      <p className="mt-1 text-sm font-bold text-ink/55">{t("language.label")} & {t("theme.label")}</p>
                    </div>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-lg bg-mist text-ink" onClick={() => setCustomizeOpen(false)} aria-label={t("settings.close")}>
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <label className="grid gap-2 text-sm font-extrabold">
                      {t("language.label")}
                      <select
                        id="language-select"
                        className="theme-select w-full rounded-lg px-3 py-3 text-sm font-extrabold outline-none transition focus:ring-4 focus:ring-palm/20"
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
                        className="theme-select w-full rounded-lg px-3 py-3 text-sm font-extrabold outline-none transition focus:ring-4 focus:ring-palm/20"
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

            {session ? (
              <button type="button" className="hidden h-10 w-10 place-items-center rounded-xl border border-ink/10 bg-white/60 text-ink/65 transition hover:text-lagoon sm:grid" onClick={onSignOut} aria-label={navCopy.signOut}>
                <LogOut size={17} />
              </button>
            ) : (
              <Link to="/login" className="btn-primary hidden sm:inline-flex">
                {navCopy.signIn}
              </Link>
            )}
          </div>
        </div>
      </header>

      {apiStatus !== "connected" && (
        <div className={`border-b px-4 py-2 text-center text-xs font-black ${apiStatus === "connecting" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {apiStatus === "connecting" ? navCopy.connecting : navCopy.offline}
        </div>
      )}

      <main className={isLanding ? "pb-28 md:pb-0" : "mx-auto max-w-7xl px-4 py-7 pb-28 sm:px-6 md:pb-8 lg:px-8"}>{children}</main>

      <nav
        className="surface-card fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50 grid gap-1 rounded-xl p-1.5 shadow-soft backdrop-blur-xl md:hidden"
        style={{ gridTemplateColumns: `repeat(${visibleNavItems.length || 1}, minmax(0, 1fr))` }}
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center gap-1 rounded-lg px-1.5 py-2 text-[0.65rem] font-extrabold ${
                  isActive ? "bg-lagoon text-white" : "text-ink/60"
                }`
              }
            >
              <Icon size={17} className="shrink-0" />
              <span className="max-w-full truncate">{item.labelKey ? t(item.labelKey) : navLabels[item.to] || item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
