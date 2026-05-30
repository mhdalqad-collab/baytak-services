import SectionHeader from "../components/SectionHeader";
import ServiceCard from "../components/ServiceCard";
import { serviceCategories } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export default function ServiceSelectionPage() {
  const { t } = useLanguage();

  return (
    <div>
      <SectionHeader
        kicker={t("services.kicker")}
        title={t("services.title")}
        description={t("services.description")}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {serviceCategories.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
