import { CreditCard, Landmark, ReceiptText } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { useLanguage } from "../i18n/LanguageContext";

export default function PaymentsPage({ payments, requests }) {
  const { isArabic, serviceName, t } = useLanguage();
  const secured = payments.filter((payment) => payment.status === "Escrow secured").reduce((sum, payment) => sum + payment.amount, 0);
  const ready = payments.filter((payment) => payment.status === "Ready for payout").reduce((sum, payment) => sum + payment.amount, 0);
  const fees = payments.reduce((sum, payment) => sum + payment.platformFee, 0);
  const copy = {
    kicker: isArabic ? "المدفوعات والتحويلات" : "Payments and payouts",
    title: isArabic ? "إدارة المبالغ والفواتير وتسوية المزودين" : "Control escrow, invoices, and provider settlement",
    description: isArabic
      ? "تعرض هذه الصفحة حالة الدفع المرتبطة بطلبات الخدمة المقبولة. الربط مع بوابة دفع حقيقية محفوظ لمرحلة التكامل الخارجي."
      : "This screen shows payment state tied to accepted service requests. Real gateway charging is held for external payment integration.",
    secured: isArabic ? "مبلغ مؤمن" : "Escrow secured",
    paid: isArabic ? "دفع العميل" : "customer paid",
    ready: isArabic ? "جاهز للتحويل" : "Ready for payout",
    completed: isArabic ? "اكتمل العمل" : "job completed",
    fees: isArabic ? "رسوم المنصة" : "Platform fees",
    ledger: isArabic ? "سجل المدفوعات" : "Payment ledger",
    serviceRequest: isArabic ? "طلب خدمة" : "Service request",
    to: isArabic ? "إلى" : "to",
    request: isArabic ? "الطلب" : "Request",
    platformFee: isArabic ? "رسوم المنصة" : "Platform fee",
    created: isArabic ? "تاريخ الإنشاء" : "Created",
    empty: isArabic ? "اقبل عرضاً لإنشاء أول سجل دفع." : "Accept an offer to create the first payment record."
  };
  const paymentStatus = {
    "Awaiting customer payment": isArabic ? "بانتظار دفع العميل" : "Awaiting customer payment",
    "Escrow secured": isArabic ? "تم تأمين المبلغ" : "Escrow secured",
    "Ready for payout": isArabic ? "جاهز للتحويل" : "Ready for payout"
  };

  return (
    <div>
      <SectionHeader
        kicker={copy.kicker}
        title={copy.title}
        description={copy.description}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={copy.secured} value={`${secured} ${t("common.omr")}`} trend={copy.paid} icon={CreditCard} />
        <StatCard label={copy.ready} value={`${ready} ${t("common.omr")}`} trend={copy.completed} icon={Landmark} />
        <StatCard label={copy.fees} value={`${fees.toFixed(2)} ${t("common.omr")}`} trend="12%" icon={ReceiptText} />
      </div>

      <section className="mt-8 surface-card rounded-[2.4rem] p-6 shadow-card">
        <h2 className="font-display text-3xl font-bold">{copy.ledger}</h2>
        <div className="mt-5 grid gap-4">
          {payments.length ? (
            payments.map((payment) => {
              const request = requests.find((item) => item.id === payment.requestId);
              return (
                <article key={payment.id} className="surface-muted rounded-[1.7rem] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/45">{payment.id}</p>
                      <h3 className="mt-2 text-lg font-black">{request?.serviceType ? serviceName(request.serviceType) : copy.serviceRequest}</h3>
                      <p className="mt-1 text-sm font-bold text-ink/55">{payment.customer} {copy.to} {payment.providerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-lagoon">{payment.amount} {t("common.omr")}</p>
                      <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">{paymentStatus[payment.status] || payment.status}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm font-bold text-ink/60 sm:grid-cols-3">
                    <span>{copy.request}: {payment.requestId}</span>
                    <span>{copy.platformFee}: {payment.platformFee} {t("common.omr")}</span>
                    <span>{copy.created}: {payment.createdAt}</span>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="surface-muted rounded-[1.7rem] p-4 text-sm font-bold text-ink/55">
              {copy.empty}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
