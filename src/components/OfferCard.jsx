import { Clock, Star, Wrench } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function OfferCard({ offer, onAccept }) {
  const { providerType, serviceName, t } = useLanguage();
  const description = offer.isEmergency
    ? t("offers.emergencyDescription")
    : t("offers.cardDescription", { service: serviceName(offer.serviceType || "home maintenance").toLowerCase() });

  return (
    <article className="group rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-card transition hover:-translate-y-1 hover:bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-lagoon">{providerType(offer.providerType)}</p>
          <h3 className="mt-2 text-xl font-black text-ink">{offer.providerName}</h3>
        </div>
        <div className="rounded-3xl bg-ink px-4 py-3 text-right text-white">
          <p className="text-xs font-bold text-white/60">{t("common.estimated")}</p>
          <p className="text-2xl font-black">{offer.estimatedPrice} {t("common.omr")}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-ink/62">{description}</p>
      <div className="mt-5 grid gap-3 text-sm font-bold text-ink/70 sm:grid-cols-3">
        <span className="inline-flex items-center gap-2 rounded-2xl bg-mist px-3 py-2">
          <Star size={16} className="text-clay" fill="currentColor" />
          {offer.rating} {t("common.rating")}
        </span>
        <span className="inline-flex items-center gap-2 rounded-2xl bg-mist px-3 py-2">
          <Clock size={16} className="text-lagoon" />
          {offer.arrivalTime}
        </span>
        <span className="inline-flex items-center gap-2 rounded-2xl bg-mist px-3 py-2">
          <Wrench size={16} className="text-lagoon" />
          {offer.completedJobs} {t("common.jobs")}
        </span>
      </div>
      <button className="btn-primary mt-6 w-full" onClick={() => onAccept(offer)}>
        {t("offers.accept")}
      </button>
    </article>
  );
}
