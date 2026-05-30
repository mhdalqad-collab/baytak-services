import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, RadioTower } from "lucide-react";
import ProviderStatusCard from "../components/ProviderStatusCard";
import SectionHeader from "../components/SectionHeader";
import { providers } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";
import { nextProviderStatuses } from "../utils/simulation";

export default function MatchingPage({ request }) {
  const { locationName, serviceName, statusName, t } = useLanguage();
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const timers = [900, 1900, 3100].map((delay, index) => setTimeout(() => setStep(index + 1), delay));
    return () => timers.forEach(clearTimeout);
  }, [request?.id]);

  const statuses = nextProviderStatuses(step);
  const acceptedCount = statuses.filter((status) => status === "Accepted").length;
  const ready = step >= 3;

  return (
    <div>
      <SectionHeader
        kicker={t("matching.kicker")}
        title={t("matching.title")}
        description={t("matching.description")}
        action={
          <Link to="/offers" className={`btn-primary ${ready ? "" : "pointer-events-none opacity-45"}`}>
            {t("matching.viewOffers")}
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="glass-card rounded-[2.4rem] p-6">
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
            <span className="rounded-2xl bg-white/80 p-4">{t("common.location")}: {locationName(request?.location)}</span>
            <span className="rounded-2xl bg-white/80 p-4">{t("customer.urgency")}: {statusName(request?.urgency)}</span>
            <span className="rounded-2xl bg-white/80 p-4">{t("request.preferredTime")}: {request?.preferredTime}</span>
          </div>
          <div className="mt-6 rounded-[1.7rem] bg-ink p-5 text-white">
            <p className="text-4xl font-black">{acceptedCount}</p>
            <p className="mt-1 text-sm font-bold text-white/60">{t("matching.acceptedSoFar")}</p>
          </div>
        </aside>

        <section className="grid gap-4 sm:grid-cols-2">
          {providers.map((provider, index) => (
            <ProviderStatusCard key={provider.id} provider={provider} status={statuses[index]} />
          ))}
        </section>
      </div>
    </div>
  );
}
