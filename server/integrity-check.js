const apiBase = process.env.INTEGRITY_API_BASE || "http://127.0.0.1:8787/api";

async function api(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const error = new Error(body.error || `${response.status} ${response.statusText}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectFailure(path, options, status) {
  try {
    await api(path, options);
  } catch (error) {
    assert(error.status === status, `Expected ${path} to fail with ${status}, got ${error.status || "success"}.`);
    return;
  }
  throw new Error(`Expected ${path} to fail with ${status}.`);
}

async function main() {
  const results = [];
  const pass = (name) => results.push({ name, ok: true });

  const health = await api("/health");
  assert(health.ok, "Health endpoint is not OK.");
  pass("health");

  const readiness = await api("/readiness");
  assert(readiness.ok, "Readiness endpoint is not OK.");
  assert(readiness.externalServices?.otp, "Readiness does not report OTP status.");
  if (process.env.REQUIRE_PRODUCTION_DB === "true") {
    assert(readiness.database?.productionReady, "Production database is required, but the API is not using PostgreSQL.");
  }
  pass("readiness");

  const anonymous = await api("/bootstrap");
  assert(Array.isArray(anonymous.users) && anonymous.users.length === 0, "Anonymous bootstrap leaks users.");
  assert(Array.isArray(anonymous.requests) && anonymous.requests.length === 0, "Anonymous bootstrap leaks requests.");
  assert(Array.isArray(anonymous.sessions) && anonymous.sessions.length === 0, "Anonymous bootstrap leaks sessions.");
  pass("anonymous data isolation");

  await expectFailure("/requests", {
    method: "POST",
    body: JSON.stringify({ serviceType: "AC maintenance", description: "Should fail without login", location: "Muscat" })
  }, 401);
  pass("unauthorized request blocked");

  if (!process.env.TEST_CUSTOMER_IDENTIFIER || !process.env.TEST_CUSTOMER_PASSWORD) {
    pass("authenticated customer flow skipped: set TEST_CUSTOMER_IDENTIFIER and TEST_CUSTOMER_PASSWORD");
    console.log(JSON.stringify({
      ok: true,
      apiBase,
      database: readiness.database,
      checks: results,
      heldServices: readiness.externalServices
    }, null, 2));
    return;
  }

  const login = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier: process.env.TEST_CUSTOMER_IDENTIFIER, password: process.env.TEST_CUSTOMER_PASSWORD })
  });
  assert(login.authToken, "Login did not return an auth token.");
  assert(login.session?.role === "customer", "Customer login did not return customer session.");
  assert(!JSON.stringify(login).includes("passwordHash"), "Login response exposes password hashes.");
  pass("customer login");

  const customerHeaders = { Authorization: `Bearer ${login.authToken}` };
  const created = await api("/requests", {
    method: "POST",
    headers: customerHeaders,
    body: JSON.stringify({
      serviceType: "AC maintenance",
      description: "Air conditioner is leaking water from the indoor unit.",
      location: "Muscat",
      urgency: "Urgent",
      preferredTime: "Today after 6 PM",
      photoName: "ac-leak-integrity.jpg"
    })
  });
  const requestId = created.activeRequestId || created.requests?.[0]?.id;
  assert(requestId, "Request creation did not return an active request.");
  pass("customer request creation");

  await expectFailure("/categories", {
    method: "POST",
    headers: customerHeaders,
    body: JSON.stringify({ category: "Unauthorized category" })
  }, 403);
  pass("admin-only category protection");

  const offers = await api("/bootstrap", { headers: customerHeaders });
  const offer = offers.offersByRequest?.[requestId]?.[0];
  if (!offer) {
    pass("provider offer flow skipped: no real provider offer exists yet");
    console.log(JSON.stringify({
      ok: true,
      apiBase,
      database: readiness.database,
      checks: results,
      heldServices: readiness.externalServices
    }, null, 2));
    return;
  }

  const accepted = await api(`/offers/${encodeURIComponent(offer.id)}/accept`, {
    method: "POST",
    headers: customerHeaders,
    body: JSON.stringify({})
  });
  assert(accepted.requests?.some((item) => item.id === requestId && item.status === "Payment pending"), "Offer acceptance did not move request to payment.");
  pass("offer acceptance");

  const payment = accepted.payments?.find((item) => item.requestId === requestId);
  assert(payment, "Payment record was not created.");
  if (readiness.externalServices?.payments?.ready) {
    const captured = await api(`/payments/${encodeURIComponent(payment.id)}/capture`, {
      method: "POST",
      headers: customerHeaders,
      body: JSON.stringify({})
    });
    assert(captured.requests?.some((item) => item.id === requestId && item.status === "Active"), "Payment capture did not activate request.");
    pass("payment capture");
  } else {
    await expectFailure(`/payments/${encodeURIComponent(payment.id)}/capture`, {
      method: "POST",
      headers: customerHeaders,
      body: JSON.stringify({})
    }, 503);
    pass("payment gateway held without fake capture");
  }

  console.log(JSON.stringify({
    ok: true,
    apiBase,
    database: readiness.database,
    checks: results,
    heldServices: readiness.externalServices
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    apiBase,
    error: error.message,
    status: error.status,
    body: error.body
  }, null, 2));
  process.exit(1);
});
