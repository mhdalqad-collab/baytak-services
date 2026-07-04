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
