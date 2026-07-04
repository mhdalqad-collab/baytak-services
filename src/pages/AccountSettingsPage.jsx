import { AlertTriangle, LogOut, Settings, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { useLanguage } from "../i18n/LanguageContext";

export default function AccountSettingsPage({ session, provider, onSignOut, onDeleteAccount }) {
  const { isArabic } = useLanguage();
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === "DELETE";
  const copy = {
    kicker: isArabic ? "إعدادات الحساب" : "Account settings",
    title: isArabic ? "إدارة الملف والوصول" : "Manage your profile and access",
    description: isArabic ? "راجع حالة الحساب، سجل الخروج، أو احذف الحساب من المنصة." : "Review account status, sign out, or delete the account from the platform.",
    guest: isArabic ? "ضيف" : "Guest",
    notSignedIn: isArabic ? "غير مسجل الدخول" : "Not signed in",
    phone: isArabic ? "الهاتف" : "Phone",
    email: isArabic ? "البريد الإلكتروني" : "Email",
    verified: isArabic ? "تم التحقق من الهاتف" : "Phone verified",
    yes: isArabic ? "نعم" : "Yes",
    no: isArabic ? "لا" : "No",
    approval: isArabic ? "اعتماد المزود" : "Provider approval",
    approved: isArabic ? "معتمد" : "Approved",
    pending: isArabic ? "بانتظار اعتماد الإدارة" : "Pending admin approval",
    signOut: isArabic ? "تسجيل الخروج" : "Sign out",
    security: isArabic ? "الأمان" : "Security",
    securityText: isArabic
      ? "يستخدم تسجيل الدخول جلسات محلية آمنة لمرحلة الاختبار. قبل الإطلاق العام نحتاج استعادة كلمة المرور وحدود محاولات أقوى وربط مزود OTP."
      : "Password login uses local token sessions for this beta. Public launch still needs password reset, stricter rate limits, and a connected OTP delivery provider.",
    deleteTitle: isArabic ? "حذف الحساب" : "Delete account",
    deleteText: isArabic
      ? "سيتم حذف حساب المستخدم. يتم حذف ملف المزود أيضاً. تبقى طلبات الخدمة السابقة كسجلات تشغيلية مع إخفاء هوية الحساب."
      : "This removes the user account. Provider profiles are removed too. Existing service requests are kept for operations records and anonymized.",
    confirm: isArabic ? "اكتب DELETE للتأكيد" : "Type DELETE to confirm",
    deleteButton: isArabic ? "حذف حسابي" : "Delete my account"
  };

  return (
    <div>
      <SectionHeader
        kicker={copy.kicker}
        title={copy.title}
        description={copy.description}
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="surface-card rounded-[2.4rem] p-6 shadow-card">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-mist text-lagoon">
            <UserRound size={26} />
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.22em] text-lagoon">{session?.role || copy.guest}</p>
          <h2 className="mt-2 font-display text-3xl font-bold">{session?.name || copy.notSignedIn}</h2>
          <div className="mt-5 grid gap-3 text-sm font-bold text-ink/65">
            <span className="surface-muted rounded-2xl p-3">{copy.phone}: {session?.phone || "-"}</span>
            <span className="surface-muted rounded-2xl p-3">{copy.email}: {session?.email || "-"}</span>
            <span className="surface-muted rounded-2xl p-3">{copy.verified}: {session?.phoneVerified ? copy.yes : copy.no}</span>
            {session?.role === "provider" && (
              <span className="surface-muted rounded-2xl p-3">
                {copy.approval}: {provider?.approved ? copy.approved : provider?.approvalStatus || copy.pending}
              </span>
            )}
          </div>
          <button className="btn-secondary mt-6 w-full" onClick={onSignOut}>
            <LogOut size={17} />
            {copy.signOut}
          </button>
        </article>

        <section className="space-y-5">
          <article className="glass-card rounded-[2.4rem] p-6">
            <div className="flex items-center gap-3">
              <Settings className="text-lagoon" />
              <h2 className="font-display text-3xl font-bold">{copy.security}</h2>
            </div>
            <p className="mt-4 text-sm font-bold leading-7 text-ink/60">
              {copy.securityText}
            </p>
          </article>

          <article className="rounded-[2.4rem] border border-red-200 bg-red-50 p-6 text-red-800">
            <div className="flex items-center gap-3">
              <AlertTriangle />
              <h2 className="font-display text-3xl font-bold">{copy.deleteTitle}</h2>
            </div>
            <p className="mt-4 text-sm font-bold leading-7">
              {copy.deleteText}
            </p>
            <label className="mt-5 grid gap-2 text-sm font-extrabold">
              {copy.confirm}
              <input className="input-field bg-white" value={confirmText} onChange={(event) => setConfirmText(event.target.value)} />
            </label>
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-40" disabled={!canDelete} onClick={onDeleteAccount}>
              <Trash2 size={17} />
              {copy.deleteButton}
            </button>
          </article>
        </section>
      </div>
    </div>
  );
}
