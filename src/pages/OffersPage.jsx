import { Link } from "react-router-dom";
import OfferCard from "../components/OfferCard";
import SectionHeader from "../components/SectionHeader";
import { useLanguage } from "../i18n/LanguageContext";

export default function OffersPage({ request, offers, onAccept }) {
  const { locationName, serviceName, t } = useLanguage();

  return (
    <div>
      <SectionHeader
        kicker={t("offers.kicker")}
        title={t("offers.title")}
        description={t("offers.description", {
          service: serviceName(request?.serviceType || "AC maintenance"),
          location: locationName(request?.location || "Muscat")
        })}
        action={
          <Link to="/matching" className="btn-secondary">
            {t("offers.back")}
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} onAccept={onAccept} />
        ))}
      </div>
    </div>
  );
}
