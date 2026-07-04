const serviceBaseRanges = {
  "Electrical repair": [18, 34],
  Plumbing: [16, 30],
  "AC maintenance": [18, 30],
  Cleaning: [12, 26],
  Painting: [24, 55],
  Carpentry: [20, 46],
  "Appliance repair": [18, 38],
  "Pest control": [22, 44],
  "Emergency repair": [35, 70]
};

export function createRequestId() {
  return `REQ-${Math.floor(1100 + Math.random() * 8000)}`;
}

export function estimateCost(request) {
  const [baseMin, baseMax] = serviceBaseRanges[request?.serviceType] || [18, 36];
  const urgencyFee = request?.urgency === "Emergency" ? 14 : request?.urgency === "Urgent" ? 6 : 0;
  const distanceFee = request?.location === "Muscat" || request?.location === "Bawshar" ? 2 : 5;

  return {
    min: baseMin + urgencyFee,
    max: baseMax + urgencyFee + distanceFee,
    emergencyFee: request?.urgency === "Emergency" ? 14 : 0,
    reasons: [
      `${request?.serviceType || "Service"} average market price`,
      request?.urgency === "Emergency" ? "Emergency dispatch fee included" : `${request?.urgency || "Normal"} request priority`,
      "Provider distance and availability included"
    ]
  };
}

export function detectIssueFromPhoto(photoName = "", serviceType = "AC maintenance") {
  const lower = photoName.toLowerCase();
  if (lower.includes("leak") || serviceType === "Plumbing") {
    return { issue: "Water leakage", confidence: 87, suggestedService: "Plumbing" };
  }
  if (lower.includes("ac") || serviceType === "AC maintenance") {
    return { issue: "AC drainage or cooling issue", confidence: 84, suggestedService: "AC maintenance" };
  }
  if (lower.includes("wire") || serviceType === "Electrical repair") {
    return { issue: "Electrical wiring risk", confidence: 91, suggestedService: "Electrical repair" };
  }
  return { issue: "General maintenance issue", confidence: 78, suggestedService: serviceType };
}

export function generateProviderOffers(request, providers, options = {}) {
  const estimate = estimateCost(request);
  const base = Math.round((estimate.min + estimate.max) / 2);
  const maxOffers = Number(options.maxOffers || 4);
  const responseRate = Number(options.responseRate ?? 1);
  const priceAdjustment = Number(options.priceAdjustment || 0);

  return providers
    .filter((provider) => provider.approved)
    .filter((provider) => provider.specialties.includes(request.serviceType) || request.urgency === "Emergency")
    .filter((provider, index) => responseRate >= 1 || ((provider.id.length + request.id.length + index) % 100) / 100 <= responseRate)
    .slice(0, maxOffers)
    .map((provider, index) => ({
      id: `OFF-${request.id}-${provider.id}`,
      requestId: request.id,
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      rating: provider.rating,
      completedJobs: provider.completedJobs,
      badges: provider.badges,
      distanceKm: provider.distanceKm,
      matchingScore: Math.min(
        99,
        78 +
          (provider.specialties.includes(request.serviceType) ? 9 : 0) +
          (provider.rating >= 4.8 ? 5 : 2) +
          (provider.distanceKm <= 3.5 ? 4 : 1) -
          index
      ),
      matchReasons: [
        provider.distanceKm <= 3.5 ? "Near customer location" : "Within service area",
        provider.rating >= 4.8 ? "High rating" : "Strong rating",
        provider.responseMins <= 9 ? "Available now" : "Reliable response",
        provider.specialties.includes(request.serviceType) ? "Specialized in selected service" : "Can handle related service",
        provider.priceLevel === "Value" ? "Good price" : "Trusted service quality"
      ],
      estimatedPrice: Math.max(12, base + index * 3 + (provider.priceLevel === "Premium" ? 3 : provider.priceLevel === "Value" ? -4 : 0) + priceAdjustment),
      arrivalTime: `${Math.max(5, provider.responseMins - (request.urgency === "Emergency" ? 3 : 0))}-${provider.responseMins + index * 4 + 7} min`,
      serviceType: request.serviceType,
      status: "Available",
      isEmergency: request.serviceType === "Emergency repair",
      createdAt: new Date().toISOString()
    }));
}
