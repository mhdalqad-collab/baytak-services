import { useState } from "react";
import { CheckCircle2, CreditCard, Plus, Settings2, Star, TrendingUp } from "lucide-react";
import Badge from "../components/Badge";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { useLanguage } from "../i18n/LanguageContext";

export default function AdminDashboard({ users = [], providers = [], requests = [], reviews = [], payments = [], categories = [], onApproveProvider, onAddCategory }) {
  const { locationName, providerType, serviceName, t } = useLanguage();
  const [newCategory, setNewCategory] = useState("");
  const completedJobs = requests.filter((request) => request.status === "Completed").length;
  const activeRequests = requests.filter((request) => ["Matching", "Payment pending", "Active"].includes(request.status)).length;
  const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter((payment) => ["Ready for payout", "Escrow secured"].includes(payment.status)).length;
  const completionRate = requests.length ? Math.round((completedJobs / requests.length) * 100) : 0;
  const providerApprovalRate = providers.length ? Math.round((providers.filter((provider) => provider.approved).length / providers.length) * 100) : 0;
  const averageReview = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : "N/A";
  const adminStats = [
    { label: "Total users", value: users.length, trend: "registered accounts", icon: CheckCircle2 },
    { label: "Total providers", value: providers.length, trend: `${providers.filter((provider) => provider.approved).length} approved`, icon: Settings2 },
    { label: "Active requests", value: activeRequests, trend: "live queue", icon: TrendingUp },
    { label: "Completed jobs", value: completedJobs, trend: `${requests.length} total`, icon: CheckCircle2 },
    { label: "Revenue estimate", value: `${revenue} OMR`, trend: "accepted offers", icon: CreditCard },
    { label: "Average review", value: averageReview, trend: `${reviews.length} reviews`, icon: Star }
  ];

  function addCategory(event) {
    event.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    onAddCategory?.(trimmed);
    setNewCategory("");
  }

  return (
    <div>
      <SectionHeader
        kicker={t("admin.kicker")}
        title={t("admin.title")}
        description={t("admin.description")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} label={t(stat.labelKey || stat.label)} />
        ))}
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <article className="glass-card rounded-[2.4rem] p-6">
          <div className="mb-5 flex items-center gap-3">
            <CheckCircle2 className="text-lagoon" />
            <h2 className="font-display text-3xl font-bold">{t("admin.approval")}</h2>
          </div>
          <div className="grid gap-4">
            {!providers.length && (
              <p className="surface-muted rounded-[1.7rem] p-4 text-sm font-bold text-ink/55">No provider applications yet.</p>
            )}
            {providers.map((provider) => {
              const approved = provider.approved;
              return (
                <div key={provider.id} className="surface-muted rounded-[1.7rem] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black">{provider.name}</p>
                      <p className="mt-1 text-xs font-bold text-ink/50">
                        {providerType(provider.type)} - {locationName(provider.baseLocation)} - {provider.completedJobs} {t("common.jobs")}
                      </p>
                    </div>
                    <Badge tone={approved ? "Completed" : "Pending"}>{approved ? "Approved" : "Pending"}</Badge>
                  </div>
                  {!approved && (
                    <button className="btn-primary mt-4" onClick={() => onApproveProvider?.(provider.id)}>
                      {t("admin.approve")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </article>

        <aside className="space-y-5">
          <article className="premium-panel rounded-[2.4rem] p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <Settings2 className="text-palm" />
              <h2 className="font-display text-3xl font-bold">{t("admin.categories")}</h2>
            </div>
            <form onSubmit={addCategory} className="flex gap-2">
              <input
                className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:ring-4 focus:ring-palm/20"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder={t("admin.addCategory")}
              />
              <button className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-ink" aria-label={t("admin.addCategory")}>
                <Plus size={18} />
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {!categories.length && <span className="text-sm font-bold text-white/55">No categories yet.</span>}
              {categories.map((category) => (
                <span key={category} className="rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-white/80">
                  {serviceName(category)}
                </span>
              ))}
            </div>
          </article>

          <article className="surface-card rounded-[2.4rem] p-6 shadow-card">
            <h2 className="font-display text-3xl font-bold">{t("admin.simpleStats")}</h2>
            <div className="mt-5 space-y-4">
              {[
                [t("admin.completionRate"), `${completionRate}%`, "completion"],
                [t("admin.providerAcceptance"), `${providerApprovalRate}%`, "acceptance"],
                [t("admin.averageReview"), averageReview === "N/A" ? "N/A" : `${averageReview}/5`, "review"],
                ["Payments ready", completedPayments, "payments"]
              ].map(([label, value, key]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm font-extrabold">
                    <span>{label}</span>
                    <span className="text-lagoon">{value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-mist">
                    <div className="h-3 rounded-full bg-lagoon" style={{ width: typeof value === "string" && value.endsWith("%") ? value : key === "review" && averageReview !== "N/A" ? `${Number(averageReview) * 20}%` : `${Math.min(100, Number(value || 0))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="surface-card mt-8 rounded-[2.4rem] p-6 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <TrendingUp className="text-lagoon" />
          <h2 className="font-display text-3xl font-bold">Service category performance</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const categoryRequests = requests.filter((request) => request.serviceType === category);
            const categoryReviews = reviews.filter((review) => categoryRequests.some((request) => request.id === review.requestId));
            const categoryPayments = payments.filter((payment) => categoryRequests.some((request) => request.id === payment.requestId));
            const satisfaction = categoryReviews.length
              ? Math.round((categoryReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / categoryReviews.length) * 20)
              : 0;
            const categoryRevenue = categoryPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
            return (
            <article key={category} className="surface-muted rounded-[1.8rem] p-5">
              <p className="font-black">{serviceName(category)}</p>
              <div className="mt-4 space-y-3 text-sm font-bold text-ink/65">
                <div className="flex justify-between"><span>Requests</span><span>{categoryRequests.length}</span></div>
                <div className="flex justify-between"><span>Revenue</span><span>{categoryRevenue} OMR</span></div>
                <div>
                  <div className="mb-2 flex justify-between"><span>Satisfaction</span><span>{categoryReviews.length ? `${satisfaction}%` : "N/A"}</span></div>
                  <div className="h-2 rounded-full bg-white">
                    <div className="h-2 rounded-full bg-lagoon" style={{ width: `${satisfaction}%` }} />
                  </div>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="surface-card rounded-[2.4rem] p-6 shadow-card">
          <h2 className="font-display text-3xl font-bold">Recent requests</h2>
          <div className="mt-5 grid gap-3">
            {!requests.length && <p className="surface-muted rounded-2xl p-4 text-sm font-bold text-ink/55">No service requests yet.</p>}
            {requests.slice(0, 5).map((request) => (
              <div key={request.id} className="surface-muted rounded-2xl p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-black">{request.id} - {serviceName(request.serviceType)}</p>
                  <Badge tone={request.status}>{request.status}</Badge>
                </div>
                <p className="mt-1 text-sm font-bold text-ink/55">{request.customer || "Customer"} - {locationName(request.location)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-card rounded-[2.4rem] p-6 shadow-card">
          <h2 className="font-display text-3xl font-bold">Payments and reviews</h2>
          <div className="mt-5 grid gap-3">
            {payments.slice(0, 4).map((payment) => (
              <div key={payment.id} className="surface-muted rounded-2xl p-4 text-sm font-bold text-ink/65">
                {payment.id}: {payment.amount} OMR - {payment.status}
              </div>
            ))}
            {!payments.length && <p className="surface-muted rounded-2xl p-4 text-sm font-bold text-ink/55">No payment records yet.</p>}
            {reviews.slice(0, 2).map((review) => (
              <div key={`${review.requestId}-${review.provider}`} className="surface-muted rounded-2xl p-4 text-sm font-bold text-ink/65">
                Review {review.rating}/5 for {review.provider}: {review.text}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
