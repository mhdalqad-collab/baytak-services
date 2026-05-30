export default function StatCard({ label, value, trend, icon: Icon }) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-card">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mist text-lagoon">
          <Icon size={21} />
        </div>
        <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-extrabold text-clay">{trend}</span>
      </div>
      <p className="text-sm font-bold text-ink/50">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-ink">{value}</p>
    </div>
  );
}
