import { useState } from "react";
import { Star } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { useLanguage } from "../i18n/LanguageContext";

export default function RatingPage({ provider, onSubmit }) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState(t("rating.defaultReview"));

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ rating, review });
  }

  return (
    <div>
      <SectionHeader
        kicker={t("rating.kicker")}
        title={t("rating.title")}
        description={t("rating.description", { provider: provider || t("rating.providerFallback") })}
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl glass-card rounded-[2.6rem] p-7 text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-lagoon">{t("rating.label")}</p>
        <div className="mt-5 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`rounded-2xl p-3 transition hover:-translate-y-1 ${
                star <= rating ? "bg-clay text-white" : "bg-white text-ink/25"
              }`}
              aria-label={t("rating.aria", { star })}
            >
              <Star size={28} fill="currentColor" />
            </button>
          ))}
        </div>

        <label className="mt-7 grid gap-2 text-start text-sm font-extrabold">
          {t("rating.reviewText")}
          <textarea className="input-field min-h-40 resize-none" value={review} onChange={(event) => setReview(event.target.value)} />
        </label>

        <button className="btn-primary mt-6 w-full" type="submit">
          {t("rating.submit")}
        </button>
      </form>
    </div>
  );
}
