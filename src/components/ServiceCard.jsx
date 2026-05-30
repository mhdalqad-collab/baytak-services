import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export default function ServiceCard({ service, to }) {
  const Icon = service.icon;
  const { serviceDescription, serviceName, t } = useLanguage();

  return (
    <Link
      to={to || `/request?service=${encodeURIComponent(service.name)}`}
      className="group flex h-full flex-col rounded-[2rem] border border-white/75 bg-white/80 p-5 shadow-card transition hover:-translate-y-1 hover:bg-white"
    >
      <div className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl ${service.accent}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-extrabold text-ink">{serviceName(service.name)}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink/62">{serviceDescription(service.name, service.description)}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-lagoon">
        {t("serviceCard.start")}
        <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
