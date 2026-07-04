import { BadgeCheck, BriefcaseBusiness, Globe2, Lightbulb, Mail, MapPin, Phone, Sparkles, UserRound } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { useLanguage } from "../i18n/LanguageContext";

const teamMembers = [
  {
    name: "Mohammed Al-Qaderi",
    roleKey: "about.mohammedRole",
    locationKey: "about.mohammedLocation",
    bioKey: "about.mohammedBio",
    image: "/about/mohammed-al-qaderi.png",
    imagePosition: "object-[center_28%]",
    phone: "+968 9191 8769",
    phoneHref: "tel:+96891918769",
    email: "mhd.alqad@gmail.com",
    tags: ["CTO", "System builder", "Product architecture"]
  },
  {
    name: "Hussam Yehya",
    roleKey: "about.partnerRole",
    locationKey: "about.partnerLocation",
    bioKey: "about.partnerBio",
    image: "/about/hussam-yehya.jpg",
    imagePosition: "object-[center_42%]",
    phone: "+968 9363 0500",
    phoneHref: "tel:+96893630500",
    email: "hussamkhatoon@hotmail.com",
    tags: ["Growth strategy", "Marketing", "Partnerships"]
  }
];

const principles = [
  { icon: Sparkles, titleKey: "about.principle1Title", textKey: "about.principle1Text" },
  { icon: BadgeCheck, titleKey: "about.principle2Title", textKey: "about.principle2Text" },
  { icon: Globe2, titleKey: "about.principle3Title", textKey: "about.principle3Text" }
];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,rgb(var(--color-ink))_0%,rgb(var(--color-primary))_68%,rgb(var(--color-accent))_140%)] p-6 text-white shadow-soft sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-white/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.24em] text-blue-100">
              {t("about.kicker")}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,10vw,5rem)] font-bold leading-[0.95] tracking-tight">
              {t("about.title")}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
              {t("about.description")}
            </p>
          </div>
          <div className="grid gap-3 rounded-[2rem] bg-white/10 p-4 backdrop-blur-md sm:grid-cols-3">
            {[
              ["about.stat1Label", "Frontend"],
              ["about.stat2Label", "Oman"],
              ["about.stat3Label", "Mock AI"]
            ].map(([labelKey, value]) => (
              <div key={labelKey} className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/52">{t(labelKey)}</p>
                <p className="mt-3 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          kicker={t("about.teamKicker")}
          title={t("about.teamTitle")}
          description={t("about.teamDescription")}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {teamMembers.map((member) => (
            <article key={member.name} className="surface-card group grid overflow-hidden rounded-[2.4rem] shadow-card">
              <div className="grid h-full gap-0 md:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[22rem] overflow-hidden bg-[linear-gradient(135deg,#0f172a,#1e3a8a)] md:h-full">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className={`h-full min-h-[22rem] w-full object-cover transition duration-500 group-hover:scale-105 ${member.imagePosition}`}
                    />
                  ) : (
                    <div className="flex h-full min-h-[22rem] items-center justify-center">
                      <div className="grid h-32 w-32 place-items-center rounded-[2rem] bg-white/14 text-4xl font-black text-white shadow-soft">
                        {member.initials}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-100">{t(member.roleKey)}</p>
                    <h2 className="mt-2 text-2xl font-black">{member.name}</h2>
                  </div>
                </div>

                <div className="flex min-h-[22rem] flex-col p-6">
                  <div className="flex flex-wrap gap-2">
                    {member.tags.map((tag) => (
                      <span key={tag} className="theme-chip rounded-full px-3 py-1 text-xs font-extrabold">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-5 text-sm leading-7 text-ink/66">{t(member.bioKey)}</p>

                  <div className="mt-6 grid gap-3 text-sm font-bold text-ink/65">
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={17} className="text-lagoon" />
                      {t(member.locationKey)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <BriefcaseBusiness size={17} className="text-lagoon" />
                      {t("about.platformFocus")}
                    </span>
                  </div>

                  <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2">
                    <a href={member.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lagoon px-4 py-3 text-sm font-extrabold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-ink">
                      <Phone size={16} />
                      {t("about.call")}
                    </a>
                    <a href={`mailto:${member.email}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-lagoon/30 hover:text-lagoon">
                      <Mail size={16} />
                      {t("about.email")}
                    </a>
                    <p className="text-xs font-bold leading-6 text-ink/45 sm:col-span-2">
                      {member.phone} · {member.email}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="premium-panel rounded-[2.4rem] p-7">
          <Lightbulb size={36} className="text-blue-200" />
          <h2 className="mt-7 font-display text-4xl font-bold">{t("about.missionTitle")}</h2>
          <p className="mt-4 leading-8 text-white/70">{t("about.missionText")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.titleKey} className="surface-card rounded-[2rem] p-6 shadow-card">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-lagoon">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-black">{t(item.titleKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/62">{t(item.textKey)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 surface-card rounded-[2.4rem] p-6 shadow-card lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-lagoon">{t("about.nextKicker")}</p>
            <h2 className="mt-2 font-display text-3xl font-bold">{t("about.nextTitle")}</h2>
            <p className="mt-3 max-w-3xl leading-8 text-ink/64">{t("about.nextText")}</p>
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.5rem] bg-lagoon text-white shadow-card">
            <UserRound size={28} />
          </div>
        </div>
      </section>
    </div>
  );
}
