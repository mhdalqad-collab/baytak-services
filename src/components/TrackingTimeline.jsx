import { CheckCircle2, Circle } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function TrackingTimeline({ steps, currentStep }) {
  const { t } = useLanguage();

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const complete = index <= currentStep;
        return (
          <li key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`grid h-10 w-10 place-items-center rounded-full ${
                  complete ? "bg-lagoon text-white" : "bg-white text-ink/30"
                }`}
              >
                {complete ? <CheckCircle2 size={20} /> : <Circle size={18} />}
              </div>
              {index < steps.length - 1 && <div className={`h-12 w-1 ${index < currentStep ? "bg-lagoon" : "bg-white"}`} />}
            </div>
            <div className={`pt-2 ${complete ? "text-ink" : "text-ink/45"}`}>
              <p className="font-extrabold">{t(`tracking.${step}`)}</p>
              <p className="mt-1 text-sm">
                {complete ? t("tracking.confirmed") : t("tracking.waiting")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
