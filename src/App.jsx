import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import { previousRequests, providers } from "./data/mockData";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import LandingPage from "./pages/LandingPage";
import MatchingPage from "./pages/MatchingPage";
import OffersPage from "./pages/OffersPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import RatingPage from "./pages/RatingPage";
import RequestFormPage from "./pages/RequestFormPage";
import RequestTrackingPage from "./pages/RequestTrackingPage";
import ServiceSelectionPage from "./pages/ServiceSelectionPage";
import { createRequestId, generateOffers } from "./utils/simulation";
import { useState } from "react";

const seedRequest = {
  id: "REQ-1051",
  serviceType: "AC maintenance",
  description: "Split unit is leaking water after 15 minutes of operation.",
  urgency: "Urgent",
  location: "Muscat",
  preferredTime: "Today evening",
  photoName: "ac-leak-photo.jpg",
  status: "Matching"
};

export default function App() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(previousRequests);
  const [activeRequest, setActiveRequest] = useState(seedRequest);
  const [offers, setOffers] = useState(() => generateOffers(seedRequest, providers));
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [trackingStep, setTrackingStep] = useState(0);
  const [reviews, setReviews] = useState([]);

  function submitRequest(formData) {
    const nextRequest = {
      ...formData,
      id: createRequestId(),
      status: "Matching"
    };
    setActiveRequest(nextRequest);
    setSelectedOffer(null);
    setTrackingStep(0);
    setOffers(generateOffers(nextRequest, providers));
    setRequests((current) => [{ ...nextRequest, date: "Today", provider: "Matching providers", price: "-" }, ...current]);
    navigate("/matching");
  }

  function acceptOffer(offer) {
    setSelectedOffer(offer);
    setTrackingStep(1);
    setActiveRequest((current) => ({ ...current, status: "Active", provider: offer.providerName, price: offer.estimatedPrice }));
    navigate("/tracking");
  }

  function completeJob() {
    setTrackingStep(4);
    setActiveRequest((current) => ({ ...current, status: "Completed" }));
  }

  function submitReview(review) {
    setReviews((current) => [{ ...review, provider: selectedOffer?.providerName, requestId: activeRequest?.id }, ...current]);
    setRequests((current) =>
      current.map((request) =>
        request.id === activeRequest.id
          ? { ...request, status: "Completed", provider: selectedOffer?.providerName || request.provider, price: selectedOffer?.estimatedPrice || request.price }
          : request
      )
    );
    navigate("/customer");
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/customer" element={<CustomerDashboard activeRequest={activeRequest} requests={requests} reviews={reviews} />} />
        <Route path="/services" element={<ServiceSelectionPage />} />
        <Route path="/request" element={<RequestFormPage onSubmit={submitRequest} />} />
        <Route path="/matching" element={<MatchingPage request={activeRequest} />} />
        <Route path="/offers" element={<OffersPage request={activeRequest} offers={offers} onAccept={acceptOffer} />} />
        <Route
          path="/tracking"
          element={
            selectedOffer || activeRequest ? (
              <RequestTrackingPage
                request={activeRequest}
                offer={selectedOffer}
                currentStep={trackingStep}
                onStepChange={setTrackingStep}
                onComplete={completeJob}
              />
            ) : (
              <Navigate to="/customer" replace />
            )
          }
        />
        <Route path="/rating" element={<RatingPage provider={selectedOffer?.providerName} onSubmit={submitReview} />} />
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AppShell>
  );
}
