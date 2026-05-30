import Badge from "./Badge";
import { useLanguage } from "../i18n/LanguageContext";

export default function RequestCard({ request }) {
  const { locationName, serviceName, t } = useLanguage();

  return (
    <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/40">{request.id}</p>
          <h3 className="mt-2 text-lg font-extrabold text-ink">{serviceName(request.serviceType)}</h3>
        </div>
        <Badge tone={request.status}>{request.status}</Badge>
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
      </dl>
    </article>
  );
}
