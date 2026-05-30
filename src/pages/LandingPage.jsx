import { Link } from "react-router-dom";
import { ArrowRight, Building2, Clock3, Sparkles, UsersRound } from "lucide-react";
import ServiceCard from "../components/ServiceCard";
import StatCard from "../components/StatCard";
import { serviceCategories } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

const valueProps = [
  {
    titleKey: "landing.value1Title",
    descriptionKey: "landing.value1Text"
  },
  {
    titleKey: "landing.value2Title",
    descriptionKey: "landing.value2Text"
  },
  {
    titleKey: "landing.value3Title",
    descriptionKey: "landing.value3Text"
  }
];

const heroStats = [
  { labelKey: "landing.demoRequests", value: "12.9k", trendKey: "landing.simulated", icon: Sparkles },
  { labelKey: "landing.omanProviders", value: "316", trendKey: "landing.mock", icon: Building2 },
  { labelKey: "landing.avgResponse", value: "9 min", trendKey: "landing.target", icon: Clock3 }
];

export default function LandingPage() {
  const { statusName, t } = useLanguage();
  const liveSteps = ["landing.step1", "landing.step2", "landing.step3", "landing.step4"];

  return (
    <div className="overflow-hidden">
      <section className="relative px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute inset-x-0 top-0 -z-10 h-[42rem] pattern-grid opacity-70" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-rise">
            <span className="inline-flex rounded-full border border-lagoon/20 bg-white/75 px-4 py-2 text-sm font-extrabold text-lagoon shadow-sm">
              {t("landing.kicker")}
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink sm:text-7xl">
              {t("landing.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-ink/67">
              {t("landing.description")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/services" className="btn-primary">
                {t("nav.requestService")}
                <ArrowRight size={18} />
              </Link>
              <Link to="/provider" className="btn-secondary">
                {t("providerDash.kicker")}
              </Link>
              <Link to="/admin" className="btn-secondary">
                {t("admin.kicker")}
              </Link>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="glass-card rounded-[2.6rem] p-5">
              <div className="rounded-[2rem] bg-ink p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white/55">{t("landing.liveRequest")}</p>
                    <h2 className="mt-1 text-2xl font-black">{t("landing.liveTitle")}</h2>
                  </div>
                  <span className="rounded-full bg-clay px-3 py-1 text-xs font-black">{statusName("Urgent")}</span>
                </div>
                <div className="mt-6 grid gap-3">
                  {liveSteps.map((item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-palm/20 text-sm font-black">
                          {index + 1}
                        </span>
                        <span className="text-sm font-bold">{t(item)}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.6rem] bg-mist p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-lagoon">{t("landing.customerTitle")}</p>
                  <p className="mt-2 text-sm font-bold text-ink/70">{t("landing.customerText")}</p>
                </div>
                <div className="rounded-[1.6rem] bg-clay/10 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-clay">{t("landing.providerTitle")}</p>
                  <p className="mt-2 text-sm font-bold text-ink/70">{t("landing.providerText")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {heroStats.map((stat) => (
            <StatCard key={stat.labelKey} label={t(stat.labelKey)} value={stat.value} trend={t(stat.trendKey)} icon={stat.icon} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-lagoon">{t("landing.serviceKicker")}</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">{t("landing.serviceTitle")}</h2>
          </div>
          <Link to="/services" className="btn-secondary">
            {t("landing.viewAll")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.slice(0, 6).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2.4rem] bg-ink p-8 text-white shadow-soft">
            <UsersRound size={36} className="text-palm" />
            <h2 className="mt-8 font-display text-4xl font-bold">{t("landing.marketplaceTitle")}</h2>
            <p className="mt-4 leading-8 text-white/66">{t("landing.marketplaceText")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {valueProps.map((item, index) => (
              <article key={item.titleKey} className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-card">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mist font-black text-lagoon">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-black">{t(item.titleKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/62">{t(item.descriptionKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
