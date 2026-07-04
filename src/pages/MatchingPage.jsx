import { Link } from "react-router-dom";
import { Loader2, RadioTower } from "lucide-react";
import ProviderStatusCard from "../components/ProviderStatusCard";
import CostEstimateCard from "../components/CostEstimateCard";
import SectionHeader from "../components/SectionHeader";
import { useLanguage } from "../i18n/LanguageContext";

export default function MatchingPage({ request, costEstimate, providers = [], offers = [], providerDecisions = {} }) {
  const { locationName, serviceName, statusName, t } = useLanguage();
  const ready = offers.length > 0;
  const acceptedCount = offers.length;
  const waitingDescription = "Waiting for provider responses. This page will update when matching providers send offers.";

  function providerStatus(providerId) {
    if (offers.some((offer) => offer.providerId === providerId)) return "Accepted";
    return providerDecisions[`${request?.id}:${providerId}`] || "Pending";
  }

  return (
    <div>
      <SectionHeader
        kicker={t("matching.kicker")}
        title={t("matching.title")}
        description={ready ? `${offers.length} provider offer${offers.length === 1 ? "" : "s"} ready for review.` : waitingDescription}
        action={
          <Link to="/offers" className={`btn-primary ${ready ? "" : "pointer-events-none opacity-45"}`}>
            {t("matching.viewOffers")}
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-5">
          <div className="glass-card rounded-[2.4rem] p-6">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lagoon text-white">
                {ready ? <RadioTower size={26} /> : <Loader2 size={26} className="animate-spin" />}
              </div>
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-lagoon">{request?.id}</p>
                <h2 className="text-2xl font-black">{serviceName(request?.serviceType)}</h2>
              </div>
            </div>
            <p className="mt-5 leading-8 text-ink/65">{request?.description}</p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-ink/70">
              <span className="surface-muted rounded-2xl p-4">{t("common.location")}: {locationName(request?.location)}</span>
              <span className="surface-muted rounded-2xl p-4">{t("customer.urgency")}: {statusName(request?.urgency)}</span>
              <span className="surface-muted rounded-2xl p-4">{t("request.preferredTime")}: {request?.preferredTime}</span>
            </div>
            <div className="premium-panel mt-6 rounded-[1.7rem] p-5">
              <p className="text-4xl font-black">{acceptedCount}</p>
              <p className="mt-1 text-sm font-bold text-white/60">{t("matching.acceptedSoFar")}</p>
            </div>
          </div>
          <CostEstimateCard estimate={costEstimate} request={request} />
        </aside>

        <section className="grid gap-4 sm:grid-cols-2">
          {providers.map((provider) => (
            <ProviderStatusCard key={provider.id} provider={provider} status={providerStatus(provider.id)} />
          ))}
        </section>
      </div>
    </div>
  );
}
