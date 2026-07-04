import { Link } from "react-router-dom";
import { CreditCard, PartyPopper, RefreshCcw } from "lucide-react";
import Badge from "../components/Badge";
import CostEstimateCard from "../components/CostEstimateCard";
import DispatchMap from "../components/DispatchMap";
import SectionHeader from "../components/SectionHeader";
import TrackingTimeline from "../components/TrackingTimeline";
import { trackingSteps } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export default function RequestTrackingPage({ request, offer, costEstimate, currentStep, onComplete, payment, onPaymentCapture, onRefresh }) {
  const { isArabic, serviceName, statusName, t } = useLanguage();
  const isComplete = currentStep >= trackingSteps.length - 1;
  const copy = {
    active: isArabic ? "نشط" : "Active",
    completed: isArabic ? "مكتمل" : "Completed",
    paymentStatus: isArabic ? "حالة الدفع" : "Payment status",
    total: isArabic ? "الإجمالي" : "total",
    platformFee: isArabic ? "رسوم المنصة" : "platform fee",
    confirmPayment: isArabic ? "تأكيد دفع العميل" : "Confirm customer payment",
    refreshStatus: isArabic ? "تحديث الحالة" : "Refresh status",
    markComplete: isArabic ? "تحديد العمل كمكتمل" : "Mark job complete",
    refreshTimeline: isArabic ? "تحديث المسار" : "Refresh timeline"
  };
  const paymentStatus = {
    "Awaiting customer payment": isArabic ? "بانتظار دفع العميل" : "Awaiting customer payment",
    "Escrow secured": isArabic ? "تم تأمين المبلغ" : "Escrow secured",
    "Ready for payout": isArabic ? "جاهز للتحويل" : "Ready for payout"
  };

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
              <Badge tone={isComplete ? "Completed" : "Active"}>{isComplete ? copy.completed : copy.active}</Badge>
            </div>
            <p className="mt-4 leading-8 text-ink/65">{request?.description}</p>
            <div className="surface-muted mt-5 rounded-[1.7rem] p-4">
              <p className="text-sm font-extrabold text-ink/45">{t("tracking.selectedProvider")}</p>
              <p className="mt-1 text-xl font-black">{offer?.providerName || request?.provider || "Provider not assigned yet"}</p>
              <p className="mt-2 text-sm font-bold text-ink/55">
                {t("tracking.estimatedPrice")}: {offer?.estimatedPrice || request?.price || "Pending"} {offer?.estimatedPrice || request?.price ? t("common.omr") : ""}
              </p>
            </div>
            {payment && (
              <div className="mt-4 rounded-[1.7rem] border border-lagoon/20 bg-lagoon/10 p-4">
                <p className="text-sm font-extrabold text-lagoon">{copy.paymentStatus}</p>
                <p className="mt-1 text-lg font-black">{paymentStatus[payment.status] || statusName(payment.status)}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">
                  {payment.amount} {t("common.omr")} {copy.total}, {payment.platformFee} {t("common.omr")} {copy.platformFee}
                </p>
                {payment.status === "Awaiting customer payment" && (
                  <button className="btn-primary mt-4 w-full" onClick={() => onPaymentCapture?.(payment.requestId)}>
                    <CreditCard size={17} />
                    {copy.confirmPayment}
                  </button>
                )}
              </div>
            )}
          </article>

          <CostEstimateCard estimate={costEstimate} request={request} />
        </aside>

        <section className="space-y-6">
          <DispatchMap request={request} offer={offer} currentStep={currentStep} />
          <div className="glass-card rounded-[2.4rem] p-6">
            <div className="mb-6 h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-lagoon transition-all duration-700" style={{ width: `${((currentStep + 1) / trackingSteps.length) * 100}%` }} />
            </div>
            <TrackingTimeline steps={trackingSteps} currentStep={currentStep} />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {!isComplete ? (
                <button className="btn-primary" onClick={onRefresh}>
                  <RefreshCcw size={17} />
                  {copy.refreshStatus}
                </button>
              ) : (
                <Link to="/rating" className="btn-primary">
                  <PartyPopper size={17} />
                  {t("tracking.rateProvider")}
                </Link>
              )}
              {!isComplete && (
                <button className="btn-secondary" onClick={onComplete}>
                  {copy.markComplete}
                </button>
              )}
              <button className="btn-secondary" onClick={onRefresh}>
                {copy.refreshTimeline}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
