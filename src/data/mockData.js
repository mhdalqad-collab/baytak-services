import {
  AirVent,
  Brush,
  Bug,
  Hammer,
  PlugZap,
  ShieldAlert,
  ShowerHead,
  Sparkles,
  WashingMachine,
} from "lucide-react";

export const serviceCategories = [
  {
    id: "electrical",
    name: "Electrical repair",
    description: "Switches, wiring, lighting, breakers, and safety checks.",
    icon: PlugZap,
    accent: "bg-amber-100 text-amber-700"
  },
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Leaks, blocked drains, water pumps, faucets, and tanks.",
    icon: ShowerHead,
    accent: "bg-blue-100 text-blue-700"
  },
  {
    id: "ac",
    name: "AC maintenance",
    description: "AC cleaning, gas refill, troubleshooting, and servicing.",
    icon: AirVent,
    accent: "bg-indigo-100 text-indigo-700"
  },
  {
    id: "cleaning",
    name: "Cleaning",
    description: "Move-in cleaning, deep cleaning, and scheduled cleaning.",
    icon: Sparkles,
    accent: "bg-teal-100 text-teal-700"
  },
  {
    id: "painting",
    name: "Painting",
    description: "Interior painting, touch-ups, wall preparation, and finish.",
    icon: Brush,
    accent: "bg-rose-100 text-rose-700"
  },
  {
    id: "carpentry",
    name: "Carpentry",
    description: "Doors, cabinets, shelves, fittings, and furniture repair.",
    icon: Hammer,
    accent: "bg-amber-100 text-amber-700"
  },
  {
    id: "appliance",
    name: "Appliance repair",
    description: "Washing machines, refrigerators, ovens, and small appliances.",
    icon: WashingMachine,
    accent: "bg-indigo-100 text-indigo-700"
  },
  {
    id: "pest",
    name: "Pest control",
    description: "Safe home pest treatment for villas, flats, and offices.",
    icon: Bug,
    accent: "bg-lime-100 text-lime-700"
  },
  {
    id: "emergency",
    name: "Emergency repair",
    description: "Fast response for urgent breakdowns and household risks.",
    icon: ShieldAlert,
    accent: "bg-red-100 text-red-700"
  }
];

export const omanLocations = [
  "Muscat",
  "Seeb",
  "Bawshar",
  "Muttrah",
  "Nizwa",
  "Sohar",
  "Salalah",
  "Sur",
  "Ibri",
  "Barka",
  "Duqm",
  "Rustaq"
];

export const trackingSteps = [
  "Request submitted",
  "Provider accepted",
  "Provider heading to location",
  "Provider arriving soon",
  "Work started",
  "Job completed"
];

export const statusColors = {
  Available: "bg-emerald-100 text-emerald-700",
  Busy: "bg-amber-100 text-amber-700",
  Accepted: "bg-lagoon/10 text-lagoon",
  Rejected: "bg-red-100 text-red-700",
  Pending: "bg-slate-100 text-slate-600",
  Active: "bg-lagoon/10 text-lagoon",
  "Payment pending": "bg-amber-100 text-amber-700",
  "Awaiting customer payment": "bg-amber-100 text-amber-700",
  "Escrow secured": "bg-lagoon/10 text-lagoon",
  "Ready for payout": "bg-purple-100 text-purple-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Urgent: "bg-orange-100 text-orange-700",
  Emergency: "bg-red-100 text-red-700",
  Normal: "bg-slate-100 text-slate-700"
};
