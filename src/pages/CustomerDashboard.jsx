import { Link } from "react-router-dom";
import { ArrowRight, Clock, Plus, Star, Wrench } from "lucide-react";
import Badge from "../components/Badge";
import RequestCard from "../components/RequestCard";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { useLanguage } from "../i18n/LanguageContext";

export default function CustomerDashboard({ activeRequest, requests, reviews }) {
  const { locationName, serviceName, statusName, t } = useLanguage();

  return (
    <div>
      <SectionHeader
        kicker={t("customer.kicker")}
        title={t("customer.title")}
        description={t("customer.description")}
        action={
          <Link to="/services" className="btn-primary">
            <Plus size={18} />
            {t("customer.newRequest")}
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("customer.previousRequests")} value={requests.length} trend={t("common.mockData")} icon={Wrench} />
        <StatCard label={t("customer.activeRequest")} value={activeRequest?.id || "None"} trend={activeRequest?.status ? statusName(activeRequest.status) : t("common.idle")} icon={Clock} />
        <StatCard label={t("customer.reviewsAdded")} value={reviews.length} trend={t("common.localOnly")} icon={Star} />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="glass-card rounded-[2.4rem] p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-lagoon">{t("customer.activeStatus")}</p>
              <h2 className="mt-2 font-display text-3xl font-bold">{serviceName(activeRequest?.serviceType)}</h2>
            </div>
            <Badge tone={activeRequest?.status}>{activeRequest?.status}</Badge>
          </div>
          <p className="mt-4 leading-8 text-ink/65">{activeRequest?.description}</p>
          <div className="mt-6 grid gap-3 text-sm font-bold text-ink/70 sm:grid-cols-2">
            <span className="rounded-2xl bg-white/80 p-4">{t("common.location")}: {locationName(activeRequest?.location)}</span>
            <span className="rounded-2xl bg-white/80 p-4">{t("customer.urgency")}: {statusName(activeRequest?.urgency)}</span>
            <span className="rounded-2xl bg-white/80 p-4">{t("customer.preferred")}: {activeRequest?.preferredTime}</span>
            <span className="rounded-2xl bg-white/80 p-4">{t("customer.photo")}: {activeRequest?.photoName || t("customer.placeholder")}</span>
          </div>
          <Link to={activeRequest?.status === "Matching" ? "/matching" : "/tracking"} className="btn-primary mt-6">
            {t("customer.continue")}
            <ArrowRight size={18} />
          </Link>
        </article>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-bold">{t("customer.previousRequests")}</h2>
            <Link to="/request" className="text-sm font-extrabold text-lagoon">
              {t("customer.createDirectly")}
            </Link>
          </div>
          <div className="grid gap-4">
            {requests.slice(0, 4).map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
