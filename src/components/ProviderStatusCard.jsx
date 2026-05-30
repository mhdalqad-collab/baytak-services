import { MapPin, Star } from "lucide-react";
import Badge from "./Badge";
import { useLanguage } from "../i18n/LanguageContext";

export default function ProviderStatusCard({ provider, status }) {
  const { locationName, providerType, serviceName } = useLanguage();

  return (
    <article className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ink/40">{providerType(provider.type)}</p>
          <h3 className="mt-2 text-lg font-extrabold text-ink">{provider.name}</h3>
        </div>
        <Badge tone={status}>{status}</Badge>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {provider.specialties.slice(0, 3).map((specialty) => (
          <span key={specialty} className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-lagoon">
            {serviceName(specialty)}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between text-sm font-bold text-ink/60">
        <span className="inline-flex items-center gap-1">
          <MapPin size={15} />
          {locationName(provider.baseLocation)}
        </span>
        <span className="inline-flex items-center gap-1 text-clay">
          <Star size={15} fill="currentColor" />
          {provider.rating}
        </span>
      </div>
    </article>
  );
}
