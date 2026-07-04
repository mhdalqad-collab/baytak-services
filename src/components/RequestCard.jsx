import Badge from "./Badge";
import { useLanguage } from "../i18n/LanguageContext";
import { Star } from "lucide-react";

export default function RequestCard({ request }) {
  const { isArabic, locationName, serviceName, statusName, t } = useLanguage();
  const copy = {
    rating: isArabic ? "التقييم" : "Rating",
    pending: isArabic ? "قيد الانتظار" : "Pending"
  };

  return (
    <article className="surface-card rounded-[2rem] p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/40">{request.id}</p>
          <h3 className="mt-2 text-lg font-extrabold text-ink">{serviceName(request.serviceType)}</h3>
        </div>
        <Badge tone={request.status}>{statusName(request.status)}</Badge>
      </div>
      <dl className="mt-5 grid gap-3 text-sm text-ink/65 sm:grid-cols-2">
        <div>
          <dt className="font-extrabold text-ink">{t("common.location")}</dt>
          <dd>{locationName(request.location)}</dd>
        </div>
        <div>
          <dt className="font-extrabold text-ink">{t("common.provider")}</dt>
          <dd>{request.provider}</dd>
        </div>
        <div>
          <dt className="font-extrabold text-ink">{t("common.date")}</dt>
          <dd>{request.date === "Today" ? t("common.today") : request.date}</dd>
        </div>
        <div>
          <dt className="font-extrabold text-ink">{t("common.price")}</dt>
          <dd>{request.price} {request.price === "-" ? "" : t("common.omr")}</dd>
        </div>
        <div>
          <dt className="font-extrabold text-ink">{copy.rating}</dt>
          <dd className="inline-flex items-center gap-1">
            <Star size={14} className="text-clay" fill="currentColor" />
            {request.rating || copy.pending}
          </dd>
        </div>
      </dl>
    </article>
  );
}
