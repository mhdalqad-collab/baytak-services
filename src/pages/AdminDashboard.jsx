import { useState } from "react";
import { CheckCircle2, Plus, Settings2 } from "lucide-react";
import Badge from "../components/Badge";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { adminStats, providers, serviceCategories } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export default function AdminDashboard() {
  const { locationName, providerType, serviceName, t } = useLanguage();
  const [providerApprovals, setProviderApprovals] = useState(() =>
    Object.fromEntries(providers.map((provider) => [provider.id, provider.approved]))
  );
  const [categories, setCategories] = useState(serviceCategories.map((service) => service.name));
  const [newCategory, setNewCategory] = useState("");

  function approveProvider(id) {
    setProviderApprovals((current) => ({ ...current, [id]: true }));
  }

  function addCategory(event) {
    event.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setCategories((current) => [...current, trimmed]);
    setNewCategory("");
  }

  return (
    <div>
      <SectionHeader
        kicker={t("admin.kicker")}
        title={t("admin.title")}
        description={t("admin.description")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} label={t(stat.labelKey || stat.label)} />
        ))}
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <article className="glass-card rounded-[2.4rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <CheckCircle2 className="text-lagoon" />
            <h2 className="font-display text-3xl font-bold">{t("admin.approval")}</h2>
          </div>
          <div className="grid gap-4">
            {providers.map((provider) => {
              const approved = providerApprovals[provider.id];
              return (
                <div key={provider.id} className="rounded-[1.7rem] bg-white/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black">{provider.name}</p>
                      <p className="mt-1 text-xs font-bold text-ink/50">
                        {providerType(provider.type)} - {locationName(provider.baseLocation)} - {provider.completedJobs} {t("common.jobs")}
                      </p>
                    </div>
                    <Badge tone={approved ? "Completed" : "Pending"}>{approved ? "Approved" : "Pending"}</Badge>
                  </div>
                  {!approved && (
                    <button className="btn-primary mt-4" onClick={() => approveProvider(provider.id)}>
                      {t("admin.approve")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </article>

        <aside className="space-y-5">
          <article className="rounded-[2.4rem] bg-ink p-6 text-white shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <Settings2 className="text-palm" />
              <h2 className="font-display text-3xl font-bold">{t("admin.categories")}</h2>
            </div>
            <form onSubmit={addCategory} className="flex gap-2">
              <input
                className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:ring-4 focus:ring-palm/20"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder={t("admin.addCategory")}
              />
              <button className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-ink" aria-label={t("admin.addCategory")}>
                <Plus size={18} />
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span key={category} className="rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-white/80">
                  {serviceName(category)}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[2.4rem] border border-white/70 bg-white/80 p-6 shadow-card">
            <h2 className="font-display text-3xl font-bold">{t("admin.simpleStats")}</h2>
            <div className="mt-5 space-y-4">
              {[
                [t("admin.completionRate"), "83%", "completion"],
                [t("admin.providerAcceptance"), "68%", "acceptance"],
                [t("admin.averageReview"), "4.7/5", "review"],
                [t("admin.emergencySla"), "22 min", "sla"]
              ].map(([label, value, key]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm font-extrabold">
                    <span>{label}</span>
                    <span className="text-lagoon">{value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-mist">
                    <div className="h-3 rounded-full bg-lagoon" style={{ width: key === "sla" ? "72%" : value.replace("%", "") }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
