import { useState } from "react";
import { Check, Clock, MapPin, X } from "lucide-react";
import Badge from "../components/Badge";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { incomingRequests } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export default function ProviderDashboard() {
  const { locationName, serviceName, statusName, t } = useLanguage();
  const [requestStatuses, setRequestStatuses] = useState({});
  const activeJobs = incomingRequests.filter((request) => requestStatuses[request.id] === "Accepted");
  const completedJobs = [
    { id: "JOB-881", serviceType: "Electrical repair", customer: "Fatma Al Riyami", price: 28 },
    { id: "JOB-882", serviceType: "AC maintenance", customer: "Said Al Maqbali", price: 18 }
  ];

  function setStatus(id, status) {
    setRequestStatuses((current) => ({ ...current, [id]: status }));
  }

  return (
    <div>
      <SectionHeader
        kicker={t("providerDash.kicker")}
        title={t("providerDash.title")}
        description={t("providerDash.description")}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("providerDash.incoming")} value={incomingRequests.length} trend={t("providerDash.liveQueue")} icon={Clock} />
        <StatCard label={t("providerDash.activeJobs")} value={activeJobs.length} trend={t("providerDash.localState")} icon={Check} />
        <StatCard label={t("providerDash.completedJobs")} value={completedJobs.length} trend={t("providerDash.today")} icon={MapPin} />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h2 className="mb-4 font-display text-3xl font-bold">{t("providerDash.incomingTitle")}</h2>
          <div className="grid gap-4">
            {incomingRequests.map((request) => {
              const status = requestStatuses[request.id] || "Pending";
              return (
                <article key={request.id} className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/40">{request.id}</p>
                      <h3 className="mt-2 text-xl font-black">{serviceName(request.serviceType)}</h3>
                    </div>
                    <Badge tone={request.urgency}>{request.urgency}</Badge>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ink/65">{request.description}</p>
                  <div className="mt-5 grid gap-3 text-sm font-bold text-ink/65 sm:grid-cols-2">
                    <span className="rounded-2xl bg-mist p-3">{t("common.customer")}: {request.customer}</span>
                    <span className="rounded-2xl bg-mist p-3">{t("common.location")}: {request.location}</span>
                    <span className="rounded-2xl bg-mist p-3">{t("common.preferred")}: {request.preferredTime}</span>
                    <span className="rounded-2xl bg-mist p-3">{t("providerDash.decision")}: {statusName(status)}</span>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button className="btn-primary" onClick={() => setStatus(request.id, "Accepted")}>
                      <Check size={17} />
                      {t("common.accept")}
                    </button>
                    <button className="btn-secondary" onClick={() => setStatus(request.id, "Rejected")}>
                      <X size={17} />
                      {t("common.reject")}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="glass-card rounded-[2.4rem] p-6">
            <h2 className="font-display text-3xl font-bold">{t("providerDash.activeJobs")}</h2>
            <div className="mt-5 grid gap-3">
              {activeJobs.length ? (
                activeJobs.map((job) => (
                  <div key={job.id} className="rounded-2xl bg-white/80 p-4">
                    <p className="font-black">{serviceName(job.serviceType)}</p>
                    <p className="mt-1 text-sm font-bold text-ink/55">{locationName(job.location)}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-white/80 p-4 text-sm font-bold text-ink/55">{t("providerDash.emptyActive")}</p>
              )}
            </div>
          </div>

          <div className="rounded-[2.4rem] bg-ink p-6 text-white shadow-soft">
            <h2 className="font-display text-3xl font-bold">{t("providerDash.completedJobs")}</h2>
            <div className="mt-5 grid gap-3">
              {completedJobs.map((job) => (
                <div key={job.id} className="rounded-2xl bg-white/10 p-4">
                  <p className="font-black">{serviceName(job.serviceType)}</p>
                  <p className="mt-1 text-sm font-bold text-white/55">
                    {job.customer} - {job.price} {t("common.omr")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
