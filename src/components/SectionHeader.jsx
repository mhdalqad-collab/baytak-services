export default function SectionHeader({ kicker, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {kicker && <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-lagoon">{kicker}</p>}
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-sm font-bold leading-7 text-ink/62">{description}</p>}
      </div>
      {action}
    </div>
  );
}
