import { statusColors } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export default function Badge({ children, tone }) {
  const { statusName, t } = useLanguage();
  const label = typeof children === "string" ? statusName(children) : children;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${statusColors[tone] || "bg-white text-ink"}`}>
      {typeof children === "string" && children === "Approved" ? t("common.approved") : label}
    </span>
  );
}
