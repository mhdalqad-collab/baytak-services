import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, ClipboardList, Clock3, CreditCard, ShieldCheck, Store, Wrench } from "lucide-react";
import { serviceCategories } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

function WorkspaceCard({ icon: Icon, title, text, to, action }) {
  return (
    <article className="surface-card rounded-xl p-5 shadow-card">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-mist text-lagoon">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 min-h-14 text-sm font-bold leading-6 text-ink/62">{text}</p>
      <Link to={to} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-lagoon">
        {action}
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}

export default function LandingPage({ session, requests = [], providers = [], apiStatus = "offline" }) {
  const { isArabic } = useLanguage();
  const activeRequest = requests[0];
  const approvedProviders = providers.filter((provider) => provider.approved).length;
  const primaryTarget = !session ? "/login" : session.role === "provider" ? "/provider" : session.role === "admin" ? "/admin" : "/services";
  const primaryLabel = !session ? "Sign in to request service" : session.role === "provider" ? "Open provider jobs" : session.role === "admin" ? "Open operations" : "Request service";
  const workspaceTargets = {
    customer: session?.role === "customer" || session?.role === "admin" ? "/customer" : "/login",
    provider: session?.role === "provider" || session?.role === "admin" ? "/provider" : "/login",
    admin: session?.role === "admin" ? "/admin" : "/login",
    payments: session?.role === "provider" || session?.role === "admin" ? "/payments" : "/login"
  };
  const copy = {
    accountSettings: isArabic ? "إعدادات الحساب" : "Account settings"
  };

  return (
    <div className="bg-sand/30">
      <section className="border-b border-ink/10 bg-white/62 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-lagoon">Home maintenance marketplace</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Book, dispatch, approve, and pay from one workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-ink/64">
              Baytak connects clients with verified service providers, keeps provider onboarding under admin approval, and tracks each request from booking to payment.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryTarget} className="btn-primary">
                {primaryLabel}
                <ArrowRight size={18} />
              </Link>
              {session ? (
                <Link to="/settings" className="btn-secondary">{copy.accountSettings}</Link>
              ) : (
                <Link to="/login" className="btn-secondary">Sign in or register</Link>
              )}
            </div>
          </div>

          <div className="surface-card rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 pb-4">
              <div>
                <p className="text-sm font-black">{session ? "Today in Baytak" : "Platform status"}</p>
                <p className="mt-1 text-xs font-bold text-ink/55">{apiStatus === "connected" ? "API connected" : "API offline or starting"}</p>
              </div>
              <span className={`rounded-lg px-3 py-1 text-xs font-black ${apiStatus === "connected" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {apiStatus}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-mist p-4">
                <p className="text-2xl font-black">{session ? requests.length : "Private"}</p>
                <p className="mt-1 text-xs font-bold text-ink/58">{session ? "Requests" : "Request activity"}</p>
              </div>
              <div className="rounded-lg bg-mist p-4">
                <p className="text-2xl font-black">{session ? approvedProviders : "Verified"}</p>
                <p className="mt-1 text-xs font-bold text-ink/58">Providers</p>
              </div>
              <div className="rounded-lg bg-mist p-4">
                <p className="text-2xl font-black">{serviceCategories.length}</p>
                <p className="mt-1 text-xs font-bold text-ink/58">Services</p>
              </div>
            </div>

            {session && activeRequest ? (
              <div className="mt-4 rounded-lg border border-ink/10 bg-white/58 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-lagoon">Latest request</p>
                    <h2 className="mt-1 text-lg font-black">{activeRequest.serviceType}</h2>
                  </div>
                  <span className="rounded-lg bg-lagoon px-3 py-1 text-xs font-black text-white">{activeRequest.status}</span>
                </div>
                <p className="mt-2 text-sm font-bold leading-6 text-ink/60">{activeRequest.description}</p>
                <Link to="/tracking" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-lagoon">
                  Track request
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-ink/10 bg-white/58 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-lagoon">Private workspace</p>
                <h2 className="mt-1 text-lg font-black">Sign in to view request activity</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-ink/60">
                  Service requests, payments, and provider details are shown only after account access.
                </p>
                <Link to="/login" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-lagoon">
                  Continue to sign in
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-lagoon">Start fast</p>
            <h2 className="mt-1 text-2xl font-black text-ink">Choose a service</h2>
          </div>
          <Link to="/services" className="text-sm font-black text-lagoon">View all services</Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.slice(0, 8).map((service) => {
            const Icon = service.icon || Wrench;
            return (
              <Link key={service.id} to={session ? `/request?service=${encodeURIComponent(service.name)}` : "/login"} className="surface-card rounded-xl p-4 transition hover:-translate-y-0.5 hover:shadow-card">
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${service.accent}`}>
                  <Icon size={20} />
                </div>
                <h3 className="mt-3 text-base font-black">{service.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-ink/58">{service.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-32 pt-2 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <WorkspaceCard icon={ClipboardList} title="Client workspace" text="Create requests, compare offers, track the visit, pay, and review the provider." to={workspaceTargets.customer} action={session ? "Open customer" : "Sign in"} />
          <WorkspaceCard icon={Store} title="Provider workspace" text="Approved providers receive matching jobs and respond with accept or decline decisions." to={workspaceTargets.provider} action={session ? "Open provider" : "Sign in"} />
          <WorkspaceCard icon={ShieldCheck} title="Admin approval" text="Admins review provider registrations before they can appear in marketplace matching." to={workspaceTargets.admin} action={session?.role === "admin" ? "Open admin" : "Admin sign in"} />
          <WorkspaceCard icon={CreditCard} title="Payments" text="Follow captured payments and request status so finance and operations stay aligned." to={workspaceTargets.payments} action={session ? "View payments" : "Sign in"} />
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-ink/10 bg-ink p-5 text-white md:grid-cols-3">
          <div className="flex gap-3">
            <BadgeCheck className="mt-1 text-palm" size={20} />
            <p className="text-sm font-bold leading-6 text-white/74">OTP verifies the phone before account activation.</p>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 text-palm" size={20} />
            <p className="text-sm font-bold leading-6 text-white/74">Providers stay pending until admin approval.</p>
          </div>
          <div className="flex gap-3">
            <Clock3 className="mt-1 text-palm" size={20} />
            <p className="text-sm font-bold leading-6 text-white/74">Operations can test provider response behavior without faking activity inside the customer UI.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
