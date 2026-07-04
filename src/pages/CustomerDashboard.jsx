import { Link } from "react-router-dom";
import { ArrowRight, Clock, Plus, Star, Wrench } from "lucide-react";
import Badge from "../components/Badge";
import RequestCard from "../components/RequestCard";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { useLanguage } from "../i18n/LanguageContext";

export default function CustomerDashboard({ activeRequest, requests, reviews, session }) {
  const { isArabic, locationName, serviceName, statusName, t } = useLanguage();
  const copy = {
    accountTrend: isArabic ? "حسابك" : "your account",
    none: isArabic ? "لا يوجد" : "None",
    guest: isArabic ? "ضيف" : "guest",
    customer: isArabic ? "العميل" : "Customer",
    payment: isArabic ? "الدفع" : "Payment",
    required: isArabic ? "مطلوب" : "Required",
    notRequired: isArabic ? "غير مطلوب الآن" : "Not required now",
    noActiveTitle: isArabic ? "لا يوجد طلب نشط حتى الآن" : "No active request yet",
    noActiveText: isArabic
      ? "أنشئ أول طلب صيانة لمقارنة عروض المزودين وتتبع العمل هنا."
      : "Create your first maintenance request to compare provider offers and track the job here.",
    history: isArabic ? "سجل الصيانة" : "Maintenance history",
    emptyHistory: isArabic
      ? "ستظهر طلبات الخدمة النشطة والمكتملة هنا."
      : "Your completed and active service requests will appear here."
  };

  return (
    <div>
      <SectionHeader
        kicker={t("customer.kicker")}
        title={t("customer.title")}
        description={t("customer.description")}
        action={
          <Link to="/services" className="btn-primary">
            <Plus size={18} />
            {t("customer.newRequest")}
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("customer.previousRequests")} value={requests.length} trend={copy.accountTrend} icon={Wrench} />
        <StatCard label={t("customer.activeRequest")} value={activeRequest?.id || copy.none} trend={activeRequest?.status ? statusName(activeRequest.status) : t("common.idle")} icon={Clock} />
        <StatCard label={t("customer.reviewsAdded")} value={reviews.length} trend={session?.name || copy.guest} icon={Star} />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {activeRequest ? (
          <article className="glass-card rounded-[2.4rem] p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-lagoon">{t("customer.activeStatus")}</p>
                <h2 className="mt-2 font-display text-3xl font-bold">{serviceName(activeRequest.serviceType)}</h2>
              </div>
              <Badge tone={activeRequest.status}>{statusName(activeRequest.status)}</Badge>
            </div>
            <p className="mt-4 leading-8 text-ink/65">{activeRequest.description}</p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-ink/70 sm:grid-cols-2">
              <span className="surface-muted rounded-2xl p-4">{t("common.location")}: {locationName(activeRequest.location)}</span>
              <span className="surface-muted rounded-2xl p-4">{t("customer.urgency")}: {statusName(activeRequest.urgency)}</span>
              <span className="surface-muted rounded-2xl p-4">{t("customer.preferred")}: {activeRequest.preferredTime}</span>
              <span className="surface-muted rounded-2xl p-4">{t("customer.photo")}: {activeRequest.photoName || t("customer.placeholder")}</span>
              <span className="surface-muted rounded-2xl p-4">{copy.customer}: {activeRequest.customer || session?.name || copy.guest}</span>
              <span className="surface-muted rounded-2xl p-4">{copy.payment}: {activeRequest.status === "Payment pending" ? copy.required : copy.notRequired}</span>
            </div>
            <Link to={activeRequest.status === "Matching" ? "/matching" : "/tracking"} className="btn-primary mt-6">
              {t("customer.continue")}
              <ArrowRight size={18} />
            </Link>
          </article>
        ) : (
          <article className="glass-card rounded-[2.4rem] p-6">
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-lagoon">{t("customer.activeStatus")}</p>
            <h2 className="mt-2 font-display text-3xl font-bold">{copy.noActiveTitle}</h2>
            <p className="mt-4 leading-8 text-ink/65">{copy.noActiveText}</p>
            <Link to="/services" className="btn-primary mt-6">
              <Plus size={18} />
              {t("customer.newRequest")}
            </Link>
          </article>
        )}

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-bold">{copy.history}</h2>
            <Link to="/request" className="text-sm font-extrabold text-lagoon">
              {t("customer.createDirectly")}
            </Link>
          </div>
          <div className="grid gap-4">
            {requests.length ? (
              requests.slice(0, 4).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <p className="surface-card rounded-[2rem] p-5 text-sm font-bold text-ink/55 shadow-card">
                {copy.emptyHistory}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
