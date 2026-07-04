import { BadgeCheck, Clock, Sparkles, Star, Wrench } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function OfferCard({ offer, onAccept, recommended = false }) {
  const { isArabic, providerType, serviceName, t } = useLanguage();
  const copy = {
    recommended: isArabic ? "المزود المقترح" : "Recommended provider",
    match: isArabic ? "مطابقة" : "match"
  };
  const description = offer.isEmergency
    ? t("offers.emergencyDescription")
    : t("offers.cardDescription", { service: serviceName(offer.serviceType || "home maintenance").toLowerCase() });

  return (
    <article className={`group rounded-[2rem] border p-5 shadow-card transition hover:-translate-y-1 ${recommended ? "border-lagoon bg-[var(--surface-card)] ring-4 ring-palm/25" : "surface-card"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {recommended && (
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-lagoon px-3 py-1 text-xs font-black text-white">
              <Sparkles size={14} />
              {copy.recommended}
            </span>
          )}
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-lagoon">{providerType(offer.providerType)}</p>
          <h3 className="mt-2 text-xl font-black text-ink">{offer.providerName}</h3>
        </div>
        <div className="premium-panel rounded-3xl px-4 py-3 text-right">
          <p className="text-xs font-bold text-white/60">{offer.matchingScore}% {copy.match}</p>
          <p className="text-2xl font-black">{offer.estimatedPrice} {t("common.omr")}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-ink/62">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {offer.badges?.map((badge) => (
          <span key={badge} className="inline-flex items-center gap-1 rounded-full bg-lagoon/10 px-3 py-1 text-xs font-black text-lagoon">
            <BadgeCheck size={13} />
            {badge}
          </span>
        ))}
      </div>
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
      <div className="mt-4 grid gap-2">
        {offer.matchReasons?.slice(0, recommended ? 5 : 3).map((reason) => (
          <div key={reason} className="surface-muted rounded-2xl px-4 py-2 text-sm font-bold text-ink/65">
            {reason}
          </div>
        ))}
      </div>
      <button className="btn-primary mt-6 w-full" onClick={() => onAccept(offer)}>
        {t("offers.accept")}
      </button>
    </article>
  );
}
