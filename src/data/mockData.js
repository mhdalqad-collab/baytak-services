import {
  AirVent,
  BadgeCheck,
  Brush,
  Bug,
  Hammer,
  PlugZap,
  ShieldAlert,
  ShowerHead,
  Sparkles,
  WashingMachine,
  Wrench
} from "lucide-react";

export const serviceCategories = [
  {
    id: "electrical",
    name: "Electrical repair",
    description: "Switches, wiring, lighting, breakers, and safety checks.",
    icon: PlugZap,
    accent: "bg-yellow-100 text-yellow-700"
  },
  {
    id: "plumbing",
    name: "Plumbing",
    description: "Leaks, blocked drains, water pumps, faucets, and tanks.",
    icon: ShowerHead,
    accent: "bg-sky-100 text-sky-700"
  },
  {
    id: "ac",
    name: "AC maintenance",
    description: "AC cleaning, gas refill, troubleshooting, and servicing.",
    icon: AirVent,
    accent: "bg-cyan-100 text-cyan-700"
  },
  {
    id: "cleaning",
    name: "Cleaning",
    description: "Move-in cleaning, deep cleaning, and scheduled cleaning.",
    icon: Sparkles,
    accent: "bg-emerald-100 text-emerald-700"
  },
  {
    id: "painting",
    name: "Painting",
    description: "Interior painting, touch-ups, wall preparation, and finish.",
    icon: Brush,
    accent: "bg-orange-100 text-orange-700"
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

export const providers = [
  {
    id: "omanfix",
    name: "OmanFix Technical Services",
    type: "Company",
    rating: 4.8,
    completedJobs: 1280,
    baseLocation: "Muscat",
    specialties: ["Electrical repair", "AC maintenance", "Emergency repair"],
    responseMins: 8,
    approved: true
  },
  {
    id: "al-noor",
    name: "Al Noor Home Care",
    type: "Company",
    rating: 4.6,
    completedJobs: 840,
    baseLocation: "Seeb",
    specialties: ["Plumbing", "Cleaning", "Painting"],
    responseMins: 11,
    approved: true
  },
  {
    id: "sultan-tech",
    name: "Sultan Al Hinai",
    type: "Technician",
    rating: 4.9,
    completedJobs: 412,
    baseLocation: "Bawshar",
    specialties: ["Appliance repair", "Electrical repair", "Carpentry"],
    responseMins: 6,
    approved: true
  },
  {
    id: "muscat-cool",
    name: "Muscat Cool Masters",
    type: "Company",
    rating: 4.7,
    completedJobs: 970,
    baseLocation: "Muscat",
    specialties: ["AC maintenance", "Emergency repair"],
    responseMins: 9,
    approved: true
  },
  {
    id: "green-shield",
    name: "Green Shield Pest Control",
    type: "Company",
    rating: 4.5,
    completedJobs: 522,
    baseLocation: "Sohar",
    specialties: ["Pest control", "Cleaning"],
    responseMins: 14,
    approved: false
  }
];

export const previousRequests = [
  {
    id: "REQ-1027",
    serviceType: "AC maintenance",
    location: "Bawshar",
    status: "Completed",
    date: "2026-05-14",
    provider: "Muscat Cool Masters",
    price: 18
  },
  {
    id: "REQ-1041",
    serviceType: "Plumbing",
    location: "Seeb",
    status: "Completed",
    date: "2026-05-22",
    provider: "Al Noor Home Care",
    price: 24
  },
  {
    id: "REQ-1048",
    serviceType: "Electrical repair",
    location: "Muscat",
    status: "Active",
    date: "2026-05-29",
    provider: "OmanFix Technical Services",
    price: 32
  }
];

export const incomingRequests = [
  {
    id: "REQ-1052",
    customer: "Aisha Al Balushi",
    location: "Al Mouj, Muscat",
    serviceType: "AC maintenance",
    description: "Living room AC is not cooling and makes a rattling sound.",
    urgency: "Urgent",
    preferredTime: "Today, 6:00 PM"
  },
  {
    id: "REQ-1053",
    customer: "Khalid Al Harthy",
    location: "Madinat Qaboos",
    serviceType: "Plumbing",
    description: "Kitchen sink leak under cabinet, water collecting quickly.",
    urgency: "Emergency",
    preferredTime: "As soon as possible"
  },
  {
    id: "REQ-1054",
    customer: "Mona Al Zadjali",
    location: "Seeb",
    serviceType: "Painting",
    description: "Repaint two bedrooms before moving furniture in.",
    urgency: "Normal",
    preferredTime: "Saturday morning"
  }
];

export const adminStats = [
  { label: "Total users", labelKey: "admin.totalUsers", value: "8,420", trend: "+14%", icon: BadgeCheck },
  { label: "Total providers", labelKey: "admin.totalProviders", value: "316", trend: "+21", icon: Wrench },
  { label: "Total requests", labelKey: "admin.totalRequests", value: "12,908", trend: "+32%", icon: Sparkles },
  { label: "Completed jobs", labelKey: "admin.completedJobs", value: "10,744", trend: "83%", icon: BadgeCheck },
  { label: "Pending jobs", labelKey: "admin.pendingJobs", value: "184", trend: "-8%", icon: ShieldAlert },
  { label: "Complaints", labelKey: "admin.complaints", value: "17", trend: "0.13%", icon: ShieldAlert }
];

export const trackingSteps = [
  "Request submitted",
  "Provider accepted",
  "Provider on the way",
  "Work in progress",
  "Job completed"
];

export const statusColors = {
  Available: "bg-emerald-100 text-emerald-700",
  Busy: "bg-amber-100 text-amber-700",
  Accepted: "bg-lagoon/10 text-lagoon",
  Rejected: "bg-red-100 text-red-700",
  Pending: "bg-slate-100 text-slate-600",
  Active: "bg-lagoon/10 text-lagoon",
  Completed: "bg-emerald-100 text-emerald-700",
  Urgent: "bg-orange-100 text-orange-700",
  Emergency: "bg-red-100 text-red-700",
  Normal: "bg-slate-100 text-slate-700"
};
