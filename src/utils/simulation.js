export function createRequestId() {
  return `REQ-${Math.floor(1100 + Math.random() * 800)}`;
}

export function priceForUrgency(urgency) {
  if (urgency === "Emergency") return 42;
  if (urgency === "Urgent") return 30;
  return 20;
}

export function generateOffers(request, providers) {
  const base = priceForUrgency(request?.urgency);
  return providers
    .filter((provider) => provider.approved)
    .slice(0, 4)
    .map((provider, index) => ({
      id: `OFF-${provider.id}`,
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      rating: provider.rating,
      completedJobs: provider.completedJobs,
      estimatedPrice: base + index * 4 + (provider.rating > 4.7 ? 3 : 0),
      arrivalTime: `${provider.responseMins + index * 5}-${provider.responseMins + index * 5 + 10} min`,
      serviceType: request?.serviceType,
      isEmergency: request?.serviceType === "Emergency repair",
      description:
        request?.serviceType === "Emergency repair"
          ? "Rapid dispatch team with diagnostic visit, urgent repair support, and safety check."
          : `Includes inspection, labor estimate, and service support for ${request?.serviceType?.toLowerCase() || "home maintenance"}.`
    }));
}

export function nextProviderStatuses(step) {
  const frames = [
    ["Available", "Available", "Busy", "Available", "Pending"],
    ["Accepted", "Available", "Busy", "Available", "Pending"],
    ["Accepted", "Rejected", "Accepted", "Available", "Busy"],
    ["Accepted", "Rejected", "Accepted", "Accepted", "Rejected"]
  ];

  return frames[Math.min(step, frames.length - 1)];
}
