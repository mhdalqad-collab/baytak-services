import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { platformApi, setPlatformAuthToken } from "./api/platformApi";
import AppShell from "./components/AppShell";
import { useLocalStorage } from "./hooks/useLocalStorage";
import AboutPage from "./pages/AboutPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import LandingPage from "./pages/LandingPage";
import MatchingPage from "./pages/MatchingPage";
import NotFoundPage from "./pages/NotFoundPage";
import OffersPage from "./pages/OffersPage";
import PaymentsPage from "./pages/PaymentsPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderOnboardingPage from "./pages/ProviderOnboardingPage";
import RatingPage from "./pages/RatingPage";
import RequestFormPage from "./pages/RequestFormPage";
import RequestTrackingPage from "./pages/RequestTrackingPage";
import ServiceSelectionPage from "./pages/ServiceSelectionPage";
import { estimateCost } from "./utils/marketplace";

const initialOffersByRequest = {};
const serviceFallback = { serviceType: "AC maintenance", urgency: "Normal", location: "Muscat" };

function RequireSession({ session, children }) {
  return session ? children : <Navigate to="/login" replace />;
}

function RequireRole({ session, roles, children }) {
  if (!session) return <Navigate to="/login" replace />;
  return roles.includes(session.role) ? children : <Navigate to="/" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useLocalStorage("baytak.session.v2", null);
  const [users, setUsers] = useLocalStorage("baytak.users.v2", []);
  const [requests, setRequests] = useLocalStorage("baytak.requests.v2", []);
  const [providerList, setProviderList] = useLocalStorage("baytak.providers.v2", []);
  const [activeRequestId, setActiveRequestId] = useLocalStorage("baytak.activeRequestId.v2", null);
  const [offersByRequest, setOffersByRequest] = useLocalStorage("baytak.offers.v2", initialOffersByRequest);
  const [selectedOffer, setSelectedOffer] = useLocalStorage("baytak.selectedOffer.v2", null);
  const [reviews, setReviews] = useLocalStorage("baytak.reviews.v2", []);
  const [payments, setPayments] = useLocalStorage("baytak.payments.v2", []);
  const [providerDecisions, setProviderDecisions] = useLocalStorage("baytak.providerDecisions.v2", {});
  const [categories, setCategories] = useLocalStorage(
    "baytak.categories.v2",
    ["Electrical repair", "Plumbing", "AC maintenance", "Cleaning", "Painting", "Carpentry", "Appliance repair", "Pest control", "Emergency repair"]
  );
  const [notifications, setNotifications] = useLocalStorage("baytak.notifications.v2", []);
  const [apiStatus, setApiStatus] = useState("connecting");
  const [actionBusy, setActionBusy] = useState(false);

  const customerRequests = session?.role === "customer"
    ? requests.filter((request) => request.customerId === session.id || (!request.customerId && request.customer === session.name))
    : requests;
  const activeRequest = customerRequests.find((request) => request.id === activeRequestId) || customerRequests[0] || null;
  const offers = offersByRequest[activeRequest?.id] || [];
  const costEstimate = estimateCost(activeRequest || serviceFallback);

  const syncFromServer = useCallback((data) => {
    setUsers(data.users || []);
    setRequests(data.requests || []);
    setProviderList(data.providers || []);
    setOffersByRequest(data.offersByRequest || {});
    setPayments(data.payments || []);
    setReviews(data.reviews || []);
    setProviderDecisions(data.providerDecisions || {});
    setCategories(data.categories || []);
    setNotifications(data.notifications || []);
    if (data.selectedOffer) setSelectedOffer(data.selectedOffer);
    if (data.activeRequestId) setActiveRequestId(data.activeRequestId);
    setSession(data.session || null);
    setApiStatus("connected");
  }, [
    setActiveRequestId,
    setCategories,
    setNotifications,
    setOffersByRequest,
    setPayments,
    setProviderDecisions,
    setProviderList,
    setRequests,
    setReviews,
    setSelectedOffer,
    setSession,
    setUsers
  ]);

  const refreshPlatform = useCallback(async () => {
    try {
      syncFromServer(await platformApi.bootstrap());
    } catch {
      setApiStatus("offline");
    }
  }, [syncFromServer]);

  useEffect(() => {
    refreshPlatform();
    const timer = setInterval(refreshPlatform, 5000);
    return () => clearInterval(timer);
  }, [refreshPlatform]);

  function addNotification(text, type = "activity") {
    setNotifications((current) => [{ id: `NTF-${Date.now()}`, text, type, read: false }, ...current].slice(0, 12));
  }

  function serviceUnavailableMessage(action) {
    return `We could not ${action} right now. Please try again shortly.`;
  }

  async function runAction(action) {
    if (actionBusy) return { skipped: true };
    setActionBusy(true);
    try {
      return await action();
    } finally {
      setActionBusy(false);
    }
  }

  async function signIn(credentials) {
    try {
      const data = await platformApi.login(credentials);
      syncFromServer(data);
      const user = data.session;
      setPlatformAuthToken(data.authToken);
      setSession(user || null);
      navigate(user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/provider" : "/customer");
      return data;
    } catch (error) {
      return { error: error.message || "Invalid username or password." };
    }
  }

  async function registerAccount(payload) {
    try {
      const data = await platformApi.register(payload);
      syncFromServer(data);
      if (!data.requiresOtp && data.session) {
        setPlatformAuthToken(data.authToken);
        setSession(data.session);
        navigate(data.session.role === "provider" ? "/provider" : "/customer");
      }
      return data;
    } catch (error) {
      const message = error.message || "Could not register account.";
      addNotification(message, "system");
      return { error: message };
    }
  }

  async function verifyOtp(payload) {
    try {
      const data = await platformApi.verifyOtp(payload);
      syncFromServer(data);
      const registered = data.session;
      setPlatformAuthToken(data.authToken);
      setSession(registered || null);
      navigate(registered?.role === "provider" ? "/provider" : "/customer");
      return data;
    } catch (error) {
      addNotification("OTP verification failed.", "system");
      return { error: error.message.includes("Invalid OTP") ? "Invalid OTP" : "OTP verification failed." };
    }
  }

  async function resendOtp(payload) {
    try {
      return await platformApi.resendOtp(payload);
    } catch (error) {
      return { error: error.message || "Could not resend OTP." };
    }
  }

  function signOut() {
    setPlatformAuthToken("");
    setSession(null);
    navigate("/login");
  }

  async function deleteAccount() {
    if (!session?.id) return;
    return runAction(async () => {
      const data = await platformApi.deleteAccount(session.id);
      syncFromServer(data);
      setPlatformAuthToken("");
      setSession(null);
      navigate("/login");
    }).catch(() => addNotification(serviceUnavailableMessage("delete the account"), "system"));
  }

  async function submitRequest(formData) {
    return runAction(async () => {
      const data = await platformApi.createRequest({
        ...formData,
        customer: session?.name || "Guest Customer",
        customerId: session?.id || "guest"
      });
      syncFromServer(data);
      setSelectedOffer(null);
      navigate("/matching");
    }).catch(() => addNotification("Service is temporarily unavailable. Please try again shortly.", "system"));
  }

  async function acceptOffer(offer) {
    return runAction(async () => {
      syncFromServer(await platformApi.acceptOffer(offer.id));
      setSelectedOffer(offer);
      navigate("/tracking");
    }).catch(() => addNotification(serviceUnavailableMessage("accept the offer"), "system"));
  }

  async function capturePayment(requestId) {
    return runAction(async () => {
      syncFromServer(await platformApi.capturePayment(requestId));
    }).catch(() => addNotification(serviceUnavailableMessage("confirm payment"), "system"));
  }

  async function completeJob() {
    return runAction(async () => {
      syncFromServer(await platformApi.completeRequest(activeRequest.id));
    }).catch(() => addNotification(serviceUnavailableMessage("complete the job"), "system"));
  }

  async function submitReview(review) {
    return runAction(async () => {
      syncFromServer(await platformApi.createReview({ ...review, provider: selectedOffer?.providerName, requestId: activeRequest?.id }));
      navigate("/customer");
    }).catch(() => addNotification(serviceUnavailableMessage("submit the review"), "system"));
  }

  async function recordProviderDecision(requestId, providerId, status) {
    return runAction(async () => {
      syncFromServer(await platformApi.recordProviderDecision({ requestId, providerId, status }));
    }).catch(() => addNotification(serviceUnavailableMessage("save the provider decision"), "system"));
  }

  async function applyProvider(application) {
    return runAction(async () => {
      syncFromServer(await platformApi.createProvider(application));
      navigate("/admin");
    }).catch(() => addNotification(serviceUnavailableMessage("submit the provider application"), "system"));
  }

  async function approveProvider(id) {
    return runAction(async () => {
      syncFromServer(await platformApi.approveProvider(id));
    }).catch(() => addNotification(serviceUnavailableMessage("approve the provider"), "system"));
  }

  async function addCategory(category) {
    return runAction(async () => {
      syncFromServer(await platformApi.createCategory(category));
    }).catch(() => addNotification(serviceUnavailableMessage("add the category"), "system"));
  }

  return (
    <AppShell session={session} onSignOut={signOut} notifications={notifications} apiStatus={apiStatus}>
      <Routes>
        <Route path="/" element={<LandingPage session={session} requests={customerRequests} providers={providerList} apiStatus={apiStatus} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<AuthPage users={users} session={session} onSignIn={signIn} onRegister={registerAccount} onVerifyOtp={verifyOtp} onResendOtp={resendOtp} categories={categories} />} />
        <Route
          path="/customer"
          element={
            <RequireRole session={session} roles={["customer", "admin"]}>
              <CustomerDashboard activeRequest={activeRequest} requests={customerRequests} reviews={reviews} session={session} />
            </RequireRole>
          }
        />
        <Route
          path="/services"
          element={
            <RequireSession session={session}>
              <ServiceSelectionPage />
            </RequireSession>
          }
        />
        <Route
          path="/request"
          element={
            <RequireRole session={session} roles={["customer", "admin"]}>
              <RequestFormPage onSubmit={submitRequest} />
            </RequireRole>
          }
        />
        <Route
          path="/matching"
          element={
            <RequireRole session={session} roles={["customer", "admin"]}>
              <MatchingPage request={activeRequest} costEstimate={costEstimate} providers={providerList} offers={offers} providerDecisions={providerDecisions} />
            </RequireRole>
          }
        />
        <Route
          path="/offers"
          element={
            <RequireRole session={session} roles={["customer", "admin"]}>
              <OffersPage request={activeRequest} offers={offers} costEstimate={costEstimate} onAccept={acceptOffer} />
            </RequireRole>
          }
        />
        <Route
          path="/tracking"
          element={
            <RequireRole session={session} roles={["customer", "admin"]}>
              {selectedOffer || activeRequest ? (
                <RequestTrackingPage
                  request={activeRequest}
                  offer={selectedOffer}
                  costEstimate={costEstimate}
                  currentStep={Number(activeRequest?.timelineStep ?? 0)}
                  onComplete={completeJob}
                  payment={payments.find((payment) => payment.requestId === activeRequest?.id)}
                  onPaymentCapture={capturePayment}
                  onRefresh={refreshPlatform}
                />
              ) : (
                <Navigate to="/customer" replace />
              )}
            </RequireRole>
          }
        />
        <Route
          path="/rating"
          element={
            <RequireRole session={session} roles={["customer", "admin"]}>
              <RatingPage provider={selectedOffer?.providerName} onSubmit={submitReview} />
            </RequireRole>
          }
        />
        <Route
          path="/provider"
          element={
            <RequireRole session={session} roles={["provider", "admin"]}>
              <ProviderDashboard
                session={session}
                requests={requests}
                providers={providerList}
                providerDecisions={providerDecisions}
                onDecision={recordProviderDecision}
              />
            </RequireRole>
          }
        />
        <Route
          path="/provider/onboarding"
          element={
            <RequireRole session={session} roles={["provider", "admin"]}>
              <ProviderOnboardingPage onSubmit={applyProvider} categories={categories} />
            </RequireRole>
          }
        />
        <Route
          path="/payments"
          element={
            <RequireRole session={session} roles={["provider", "admin"]}>
              <PaymentsPage payments={payments} requests={requests} />
            </RequireRole>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireSession session={session}>
              <AccountSettingsPage
                session={session}
                provider={providerList.find((provider) => provider.id === session?.providerId)}
                onSignOut={signOut}
                onDeleteAccount={deleteAccount}
              />
            </RequireSession>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole session={session} roles={["admin"]}>
              <AdminDashboard
                users={users}
                providers={providerList}
                requests={requests}
                reviews={reviews}
                payments={payments}
                categories={categories}
                onApproveProvider={approveProvider}
                onAddCategory={addCategory}
              />
            </RequireRole>
          }
        />
        <Route path="*" element={<NotFoundPage session={session} />} />
      </Routes>
    </AppShell>
  );
}
