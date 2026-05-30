export default function SectionHeader({ kicker, title, description, action }) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {kicker && <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.24em] text-lagoon">{kicker}</p>}
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 text-base leading-8 text-ink/65">{description}</p>}
      </div>
      {action}
    </div>
  );
}
