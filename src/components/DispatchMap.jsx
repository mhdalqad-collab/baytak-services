import { Navigation, Home, MapPin } from "lucide-react";

export default function DispatchMap({ request, offer, currentStep = 0 }) {
  const progress = Math.min(88, 18 + currentStep * 14);
  const eta = currentStep >= 5 ? "Arrived" : offer?.arrivalTime || "8-15 min";
  const distance = offer?.distanceKm || 3.1;

  return (
    <article className="overflow-hidden rounded-[2.4rem] bg-[linear-gradient(135deg,#111827_0%,#1e3a8a_58%,#172554_100%)] p-5 text-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-blue-200">Live dispatch map</p>
          <h3 className="mt-1 font-display text-3xl font-bold">{request?.location || "Muscat"}, Oman</h3>
        </div>
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black">
          ETA {eta}
        </div>
      </div>

      <div className="relative mt-5 h-72 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_22%_28%,rgba(96,165,250,0.42),transparent_8rem),radial-gradient(circle_at_78%_70%,rgba(245,158,11,0.28),transparent_8rem),linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] pattern-grid">
        <div className="absolute left-[12%] top-[24%] rounded-full bg-white/15 px-3 py-2 text-xs font-black">Qurum</div>
        <div className="absolute right-[12%] top-[18%] rounded-full bg-white/15 px-3 py-2 text-xs font-black">Bawshar</div>
        <div className="absolute bottom-[16%] left-[22%] rounded-full bg-white/15 px-3 py-2 text-xs font-black">Al Khuwair</div>
        <div className="absolute inset-x-[18%] top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/20">
          <div className="h-1 rounded-full bg-blue-300 transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="absolute left-[16%] top-1/2 -translate-y-1/2 rounded-full bg-white p-3 text-lagoon shadow-soft">
          <Home size={21} />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full bg-amber-500 p-3 text-white shadow-soft transition-all duration-700"
          style={{ left: `${progress}%` }}
        >
          <Navigation size={22} />
        </div>
        <div className="absolute right-[9%] top-1/2 -translate-y-1/2 rounded-full bg-blue-200 p-3 text-ink shadow-soft">
          <MapPin size={22} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs font-bold text-white/50">Customer</p>
          <p className="mt-1 font-black">{request?.location || "Muscat"}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs font-bold text-white/50">Provider distance</p>
          <p className="mt-1 font-black">{distance} km</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs font-bold text-white/50">Provider</p>
          <p className="mt-1 font-black">{offer?.providerName || "Searching"}</p>
        </div>
      </div>
    </article>
  );
}
