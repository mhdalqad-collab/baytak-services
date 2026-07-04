import { BadgeCheck, Check, Clock, FilePlus2, Star, TrendingUp, Wallet, X } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { useLanguage } from "../i18n/LanguageContext";

export default function ProviderDashboard({ session, requests = [], providers = [], providerDecisions = {}, onDecision }) {
  const { isArabic, locationName, serviceName, statusName, t } = useLanguage();
  const currentProvider = providers.find((provider) => provider.id === session?.providerId) || providers[0];
  const liveRequests = requests.filter((request) => ["Matching", "Payment pending"].includes(request.status));
  const queue = liveRequests;
  const activeJobs = requests.filter((request) => request.providerId === currentProvider?.id && ["Active", "Payment pending"].includes(request.status));
  const completedJobs = requests.filter((request) => request.providerId === currentProvider?.id && request.status === "Completed");

  function setStatus(id, status) {
    onDecision?.(id, currentProvider?.id, status);
  }
  const copy = {
    onboarding: isArabic ? "تحديث ملف المزود" : "Provider onboarding",
    rating: isArabic ? "تقييم المزود" : "Provider rating",
    new: isArabic ? "جديد" : "New",
    approved: isArabic ? "معتمد" : "Approved",
    pendingApproval: isArabic ? "بانتظار الاعتماد" : "Pending approval",
    monthEarnings: isArabic ? "إيرادات الشهر" : "Month earnings",
    active: isArabic ? "نشط" : "active",
    pendingTitle: isArabic ? "بانتظار اعتماد الإدارة" : "Pending admin approval",
    pendingText: isArabic
      ? "تم التحقق من رقمك، لكن لن تظهر لك طلبات السوق قبل اعتماد ملف المزود من الإدارة."
      : "Your provider account is phone verified, but it cannot receive marketplace jobs until an admin approves the provider profile.",
    fallbackCustomer: isArabic ? "عميل" : "Customer",
    distance: isArabic ? "المسافة" : "Distance",
    suggestedPrice: isArabic ? "السعر المقترح" : "Suggested price",
    emptyQueue: isArabic
      ? "لا توجد طلبات خدمة لهذا المزود الآن. ستظهر الطلبات المطابقة هنا عند إرسال العملاء لطلبات في نطاق خدماتك."
      : "No service requests are waiting for this provider right now. New matching jobs will appear here when customers submit requests in your service areas.",
    profile: isArabic ? "ملف المزود" : "Provider profile",
    underReview: isArabic ? "قيد المراجعة" : "Under Review",
    jobs: isArabic ? "وظائف" : "jobs"
  };

  return (
    <div>
      <SectionHeader
        kicker={t("providerDash.kicker")}
        title={t("providerDash.title")}
        description={t("providerDash.description")}
        action={
          <Link to="/provider/onboarding" className="btn-primary">
            <FilePlus2 size={17} />
            {copy.onboarding}
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t("providerDash.incoming")} value={queue.length} trend={t("providerDash.liveQueue")} icon={Clock} />
        <StatCard label={copy.rating} value={currentProvider?.rating || copy.new} trend={currentProvider?.approved ? copy.approved : copy.pendingApproval} icon={Star} />
        <StatCard label={copy.monthEarnings} value={`${currentProvider?.earningsMonth || 0} ${t("common.omr")}`} trend={`${activeJobs.length} ${copy.active}`} icon={Wallet} />
      </div>

      {currentProvider && !currentProvider.approved && (
        <div className="mt-6 rounded-[1.8rem] border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em]">{copy.pendingTitle}</p>
          <p className="mt-2 text-sm font-bold leading-6">
            {copy.pendingText}
          </p>
        </div>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h2 className="mb-4 font-display text-3xl font-bold">{t("providerDash.incomingTitle")}</h2>
          <div className="grid gap-4">
            {queue.map((request) => {
              const status = providerDecisions[`${request.id}:${currentProvider?.id}`] || "Pending";
              return (
                <article key={request.id} className="surface-card rounded-[2rem] p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/40">{request.id}</p>
                      <h3 className="mt-2 text-xl font-black">{serviceName(request.serviceType)}</h3>
                    </div>
                    <Badge tone={request.urgency}>{statusName(request.urgency || request.status)}</Badge>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ink/65">{request.description}</p>
                  <div className="mt-5 grid gap-3 text-sm font-bold text-ink/65 sm:grid-cols-2">
                    <span className="surface-muted rounded-2xl p-3">{t("common.customer")}: {request.customer || copy.fallbackCustomer}</span>
                    <span className="surface-muted rounded-2xl p-3">{t("common.location")}: {request.location}</span>
                    <span className="surface-muted rounded-2xl p-3">{t("common.preferred")}: {request.preferredTime}</span>
                    <span className="surface-muted rounded-2xl p-3">{t("providerDash.decision")}: {statusName(status)}</span>
                    <span className="surface-muted rounded-2xl p-3">{copy.distance}: {request.distanceKm || currentProvider?.distanceKm || 4.5} km</span>
                    <span className="surface-muted rounded-2xl p-3">{copy.suggestedPrice}: {request.suggestedPrice || request.price || "-"} {request.price === "-" ? "" : t("common.omr")}</span>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button className="btn-primary" onClick={() => setStatus(request.id, "Accepted")}>
                      <Check size={17} />
                      {t("common.accept")}
                    </button>
                    <button className="btn-secondary" onClick={() => setStatus(request.id, "Rejected")}>
                      <X size={17} />
                      {t("common.reject")}
                    </button>
                  </div>
                </article>
              );
            })}
            {!queue.length && (
              <p className="surface-card rounded-[2rem] p-5 text-sm font-bold text-ink/55 shadow-card">
                {copy.emptyQueue}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[2.4rem] bg-[linear-gradient(135deg,#111827,#1e3a8a)] p-6 text-white shadow-soft">
            <div className="flex items-center gap-3">
              <BadgeCheck className="text-palm" />
              <div>
                <p className="text-sm font-bold text-white/55">{copy.profile}</p>
              <h2 className="font-display text-3xl font-bold">{currentProvider?.name || copy.profile}</h2>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(currentProvider?.badges || [copy.underReview]).map((badge) => (
                <span key={badge} className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white/80">
                  {badge}
                </span>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-bold">
              <div className="rounded-2xl bg-white/10 p-4">
                <Star size={16} className="mb-2 text-clay" fill="currentColor" />
                {currentProvider?.rating || copy.new} {t("common.rating")}
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <TrendingUp size={16} className="mb-2 text-palm" />
                {currentProvider?.completedJobs || 0} {copy.jobs}
              </div>
            </div>
          </div>
          <div className="glass-card rounded-[2.4rem] p-6">
            <h2 className="font-display text-3xl font-bold">{t("providerDash.activeJobs")}</h2>
            <div className="mt-5 grid gap-3">
              {activeJobs.length ? (
                activeJobs.map((job) => (
                  <div key={job.id} className="surface-muted rounded-2xl p-4">
                    <p className="font-black">{serviceName(job.serviceType)}</p>
                    <p className="mt-1 text-sm font-bold text-ink/55">{locationName(job.location)} - {statusName(job.status)}</p>
                  </div>
                ))
              ) : (
                <p className="surface-muted rounded-2xl p-4 text-sm font-bold text-ink/55">{t("providerDash.emptyActive")}</p>
              )}
            </div>
          </div>

          <div className="surface-card rounded-[2.4rem] p-6 shadow-card">
            <h2 className="font-display text-3xl font-bold">{t("providerDash.completedJobs")}</h2>
            <div className="mt-5 grid gap-3">
              {completedJobs.map((job) => (
                <div key={job.id} className="surface-muted rounded-2xl p-4">
                  <p className="font-black">{serviceName(job.serviceType)}</p>
                  <p className="mt-1 text-sm font-bold text-ink/55">{job.customer} - {job.price} {t("common.omr")}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
