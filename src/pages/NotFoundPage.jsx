import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function NotFoundPage({ session }) {
  const { isArabic } = useLanguage();
  const copy = isArabic
    ? {
        kicker: "صفحة غير موجودة",
        title: "لم نتمكن من العثور على هذه الصفحة",
        text: "قد يكون الرابط قديماً أو تمت كتابته بشكل غير صحيح. يمكنك العودة للرئيسية أو فتح مساحة العمل المناسبة لحسابك.",
        home: "الرئيسية",
        workspace: session?.role === "provider" ? "مساحة المزود" : session?.role === "admin" ? "لوحة الإدارة" : "مساحة العميل"
      }
    : {
        kicker: "Page not found",
        title: "We could not find this page",
        text: "The link may be outdated or typed incorrectly. Return home or open the right workspace for your account.",
        home: "Home",
        workspace: session?.role === "provider" ? "Provider workspace" : session?.role === "admin" ? "Admin dashboard" : "Customer workspace"
      };
  const workspacePath = session?.role === "provider" ? "/provider" : session?.role === "admin" ? "/admin" : "/customer";

  return (
    <section className="mx-auto grid max-w-3xl place-items-center py-16 text-center">
      <div className="surface-card rounded-xl p-6 shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-mist text-lagoon">
          <SearchX size={28} />
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-lagoon">{copy.kicker}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 text-sm font-bold leading-7 text-ink/62">{copy.text}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="btn-secondary">
            <Home size={17} />
            {copy.home}
          </Link>
          {session && (
            <Link to={workspacePath} className="btn-primary">
              {copy.workspace}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
