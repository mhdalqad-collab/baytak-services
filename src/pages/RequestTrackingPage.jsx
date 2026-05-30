import { Link } from "react-router-dom";
import { FastForward, MapPin, PartyPopper } from "lucide-react";
import Badge from "../components/Badge";
import SectionHeader from "../components/SectionHeader";
import TrackingTimeline from "../components/TrackingTimeline";
import { trackingSteps } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export default function RequestTrackingPage({ request, offer, currentStep, onStepChange, onComplete }) {
  const { locationName, serviceName, t } = useLanguage();
  const isComplete = currentStep >= trackingSteps.length - 1;

  function advance() {
    const next = Math.min(currentStep + 1, trackingSteps.length - 1);
    onStepChange(next);
    if (next === trackingSteps.length - 1) onComplete();
  }

  return (
    <div>
      <SectionHeader
        kicker={t("tracking.kicker")}
        title={t("tracking.title")}
        description={t("tracking.description")}
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-5">
          <article className="glass-card rounded-[2.4rem] p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-lagoon">{request?.id}</p>
                <h2 className="mt-2 font-display text-3xl font-bold">{serviceName(request?.serviceType)}</h2>
              </div>
              <Badge tone={isComplete ? "Completed" : "Active"}>{isComplete ? "Completed" : "Active"}</Badge>
            </div>
            <p className="mt-4 leading-8 text-ink/65">{request?.description}</p>
            <div className="mt-5 rounded-[1.7rem] bg-white/80 p-4">
              <p className="text-sm font-extrabold text-ink/45">{t("tracking.selectedProvider")}</p>
              <p className="mt-1 text-xl font-black">{offer?.providerName || request?.provider || "OmanFix Technical Services"}</p>
              <p className="mt-2 text-sm font-bold text-ink/55">
                {t("tracking.estimatedPrice")}: {offer?.estimatedPrice || request?.price || 32} {t("common.omr")}
              </p>
            </div>
          </article>

          <article className="rounded-[2.4rem] bg-ink p-6 text-white shadow-soft">
            <div className="flex items-center gap-3">
              <MapPin className="text-palm" />
              <div>
                <p className="text-sm font-bold text-white/55">{t("tracking.map")}</p>
                <p className="text-lg font-black">{locationName(request?.location)}, {t("common.oman")}</p>
              </div>
            </div>
            <div className="mt-5 h-44 rounded-[1.7rem] bg-[radial-gradient(circle_at_35%_35%,rgba(20,184,166,0.55),transparent_12rem),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-4">
              <div className="h-full rounded-[1.2rem] border border-white/15 pattern-grid" />
            </div>
          </article>
        </aside>

        <section className="glass-card rounded-[2.4rem] p-6">
          <TrackingTimeline steps={trackingSteps} currentStep={currentStep} />
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {!isComplete ? (
              <button className="btn-primary" onClick={advance}>
                <FastForward size={17} />
                {t("tracking.nextStatus")}
              </button>
            ) : (
              <Link to="/rating" className="btn-primary">
                <PartyPopper size={17} />
                {t("tracking.rateProvider")}
              </Link>
            )}
            <button className="btn-secondary" onClick={() => onStepChange(0)}>
              {t("tracking.reset")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
