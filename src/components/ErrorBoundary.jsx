import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Baytak UI error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isArabic = document.documentElement.dir === "rtl";
    const copy = isArabic
      ? {
          kicker: "حدث خطأ",
          title: "تعذر عرض هذه الصفحة",
          text: "لم نفقد بياناتك. أعد تحميل الصفحة أو ارجع إلى الرئيسية وحاول مرة أخرى.",
          reload: "إعادة التحميل",
          home: "العودة للرئيسية"
        }
      : {
          kicker: "Something went wrong",
          title: "We could not display this page",
          text: "Your data was not lost. Reload the page or return home and try again.",
          reload: "Reload",
          home: "Go home"
        };

    return (
      <main className="grid min-h-screen place-items-center px-4 py-10 text-ink">
        <section className="surface-card max-w-xl rounded-xl p-6 text-center shadow-card">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-lagoon">{copy.kicker}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-sm font-bold leading-7 text-ink/62">{copy.text}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              {copy.reload}
            </button>
            <a className="btn-secondary" href="/">
              {copy.home}
            </a>
          </div>
        </section>
      </main>
    );
  }
}
