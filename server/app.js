import http from "node:http";
import crypto from "node:crypto";
import { addNotification, appendAudit, databaseInfo, readDb, resetDb, updateDb } from "./db.js";
import { createRequestId, detectIssueFromPhoto, generateProviderOffers } from "./marketplace.js";
import { canResend, createOtpCode, deliverOtp, hashOtp, otpExpiresAt, otpPaused, otpPolicy, verifyOtpHash } from "./otpService.js";
import { capturePayment as captureGatewayPayment, paymentReadiness } from "./paymentService.js";

const port = Number(process.env.API_PORT || 8787);
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24 * 7);
const PBKDF2_ITERATIONS = Number(process.env.PASSWORD_ITERATIONS || 120000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const AUTH_WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 1000 * 60);
const AUTH_LIMIT = Number(process.env.AUTH_RATE_LIMIT_MAX || 12);
const rateBuckets = new Map();

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Simulator-Key",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-site",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Invalid JSON body.");
    error.status = 400;
    throw error;
  }
}

function clientIp(request) {
  const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || request.socket.remoteAddress || "local";
}

function authRateLimited(request, name) {
  const now = Date.now();
  const key = `${clientIp(request)}:${name}`;
  const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + AUTH_WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + AUTH_WINDOW_MS;
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return bucket.count > AUTH_LIMIT;
}

function requireText(value, field, min = 2, max = 160) {
  const text = String(value || "").trim();
  if (text.length < min) {
    const error = new Error(`${field} is required.`);
    error.status = 400;
    throw error;
  }
  if (text.length > max) {
    const error = new Error(`${field} is too long.`);
    error.status = 400;
    throw error;
  }
  return text;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validatePassword(password) {
  if (String(password || "").length < 8) {
    const error = new Error("Password must be at least 8 characters.");
    error.status = 400;
    throw error;
  }
  return String(password);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function createUserId(role) {
  const prefix = role === "provider" ? "PRO" : role === "admin" ? "ADM" : "CUS";
  return `${prefix}-${Date.now()}`;
}

function legacyHashPassword(password = "") {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function hashPassword(password = "") {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password), salt, PBKDF2_ITERATIONS, 32, "sha256").toString("hex");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hash}`;
}

function verifyPassword(user, password) {
  if (user.passwordHash?.startsWith("pbkdf2$")) {
    const [, iterations, salt, expected] = user.passwordHash.split("$");
    const candidate = crypto.pbkdf2Sync(String(password), salt, Number(iterations), 32, "sha256").toString("hex");
    return expected.length === candidate.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(candidate));
  }
  if (user.passwordHash) return user.passwordHash === legacyHashPassword(password);
  return password === "demo123";
}

function passwordNeedsUpgrade(user) {
  return !user.passwordHash?.startsWith("pbkdf2$");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function maskPhone(phone) {
  if (!phone) return "";
  const compact = phone.replace(/\s+/g, "");
  return `${compact.slice(0, 4)}****${compact.slice(-2)}`;
}

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "").trim();
}

function isValidPhone(phone) {
  return /^\+?\d{8,15}$/.test(normalizePhone(phone));
}

function safeUser(user) {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function safePendingRegistration(registration) {
  if (!registration) return null;
  const { otpHash: _otpHash, password: _password, ...publicRegistration } = registration;
  return publicRegistration;
}

function basePublicDb(data) {
  return {
    ...data,
    session: null,
    users: (data.users || []).map(safeUser),
    pendingRegistrations: (data.pendingRegistrations || []).map(safePendingRegistration),
    otpMessages: (data.otpMessages || []).map(({ code: _code, phone: _phone, ...message }) => message),
    sessions: [],
    authError: null
  };
}

function scopedDb(data, sessionUser) {
  const base = basePublicDb(data);
  if (!sessionUser) {
    return {
      ...base,
      users: [],
      requests: [],
      offersByRequest: {},
      payments: [],
      reviews: [],
      providerDecisions: {},
      notifications: [],
      auditLog: []
    };
  }

  if (sessionUser.role === "admin") {
    return { ...base, session: safeUser(sessionUser) };
  }

  if (sessionUser.role === "provider") {
    const providerId = sessionUser.providerId;
    const providerRequests = (data.requests || []).filter((item) => !item.providerId || item.providerId === providerId || item.status === "Matching");
    const allowedRequestIds = new Set(providerRequests.map((item) => item.id));
    return {
      ...base,
      session: safeUser(sessionUser),
      users: [safeUser(sessionUser)],
      requests: providerRequests,
      offersByRequest: Object.fromEntries(Object.entries(data.offersByRequest || {}).filter(([requestId]) => allowedRequestIds.has(requestId))),
      payments: (data.payments || []).filter((payment) => payment.providerId === providerId),
      reviews: (data.reviews || []).filter((review) => providerId && review.providerId === providerId),
      notifications: (data.notifications || []).filter((item) => ["provider", "auth", "external-test"].includes(item.type)),
      auditLog: []
    };
  }

  const requestIds = new Set((data.requests || []).filter((item) => item.customerId === sessionUser.id).map((item) => item.id));
  return {
    ...base,
    session: safeUser(sessionUser),
    users: [safeUser(sessionUser)],
    requests: (data.requests || []).filter((item) => item.customerId === sessionUser.id),
    offersByRequest: Object.fromEntries(Object.entries(data.offersByRequest || {}).filter(([requestId]) => requestIds.has(requestId))),
    payments: (data.payments || []).filter((payment) => requestIds.has(payment.requestId)),
    reviews: (data.reviews || []).filter((review) => requestIds.has(review.requestId)),
    providerDecisions: {},
    notifications: (data.notifications || []).filter((item) => ["auth", "activity"].includes(item.type)),
    auditLog: []
  };
}

function bearerToken(request) {
  const header = request.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

function createSession(data, user) {
  const token = crypto.randomBytes(32).toString("hex");
  const session = {
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + SESSION_TTL_MS
  };
  data.sessions = [
    session,
    ...(data.sessions || []).filter((item) => item.userId !== user.id && Date.now() < Number(item.expiresAt))
  ].slice(0, 100);
  return token;
}

function findSessionUser(data, token) {
  if (!token) return null;
  const session = (data.sessions || []).find((item) => item.token === token && Date.now() < Number(item.expiresAt));
  if (!session) return null;
  return (data.users || []).find((user) => user.id === session.userId) || null;
}

async function getSessionUser(request) {
  const db = await readDb();
  return findSessionUser(db, bearerToken(request));
}

function hasRole(user, roles) {
  return user && roles.includes(user.role);
}

function requireSimulator(request) {
  const configuredKey = process.env.SIM_API_KEY;
  if (!configuredKey) return true;
  return request.headers["x-simulator-key"] === configuredKey;
}

function readinessReport() {
  const otpMode = process.env.OTP_DELIVERY_MODE || "paused";
  return {
    ok: true,
    mode: process.env.NODE_ENV || "development",
    database: databaseInfo(),
    corsOrigin: CORS_ORIGIN,
    externalServices: {
      otp: {
        status: otpMode === "paused" ? "paused" : otpMode === "mock" ? "held" : "configured",
        mode: otpMode,
        ready:
          otpMode === "mock" ||
          (otpMode === "whatsapp_cloud" && Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_AUTH_TEMPLATE_NAME)) ||
          (otpMode === "sms_webhook" && Boolean(process.env.SMS_WEBHOOK_URL))
      },
      payments: paymentReadiness(),
      fileStorage: {
        status: "held",
        ready: false
      },
      simulatorSecurity: {
        status: process.env.SIM_API_KEY ? "configured" : "local-open",
        ready: Boolean(process.env.SIM_API_KEY)
      }
    }
  };
}

function createUserFromRegistration(registration, options = {}) {
  const role = registration.role;
  const phoneVerified = options.phoneVerified ?? true;
  return {
    id: createUserId(role),
    name: registration.name,
    phone: registration.phone,
    email: registration.email,
    role,
    createdAt: new Date().toISOString(),
    status: role === "provider" ? "Pending approval" : "Active",
    phoneVerified,
    verifiedAt: phoneVerified ? new Date().toISOString() : null,
    passwordSet: Boolean(registration.password),
    passwordHash: hashPassword(registration.password)
  };
}

function createProviderFromRegistration(registration, user) {
  const providerId = slugify(registration.businessName || registration.name) || `provider-${Date.now()}`;
  user.providerId = providerId;
  return {
    id: providerId,
    name: registration.businessName || registration.name,
    type: registration.providerType || "Company",
    rating: 0,
    completedJobs: 0,
    baseLocation: registration.baseLocation || "Muscat",
    specialties: registration.specialties?.length ? registration.specialties : ["AC maintenance"],
    responseMins: 12,
    distanceKm: 4.5,
    badges: [user.phoneVerified ? "Phone Verified" : "Phone Verification Pending", "Under Review"],
    priceLevel: registration.priceLevel || "Balanced",
    earningsMonth: 0,
    approved: false,
    approvalStatus: "Pending admin approval",
    contactName: registration.name,
    phone: registration.phone,
    email: registration.email,
    documents: registration.documents || "Pending document upload",
    createdAt: new Date().toISOString()
  };
}

async function route(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    return sendJson(response, 204, {});
  }

  if (request.method === "POST" && url.pathname.startsWith("/api/auth/") && authRateLimited(request, url.pathname)) {
    return sendJson(response, 429, { error: "Too many auth attempts. Please wait a minute and try again." });
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(response, 200, { ok: true, service: "baytak-api", time: new Date().toISOString() });
  }

  if (request.method === "GET" && url.pathname === "/api/readiness") {
    return sendJson(response, 200, readinessReport());
  }

  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    const db = await readDb();
    const sessionUser = findSessionUser(db, bearerToken(request));
    return sendJson(response, 200, scopedDb(db, sessionUser));
  }

  if (request.method === "GET" && url.pathname === "/api/simulator/work") {
    if (!requireSimulator(request)) return sendJson(response, 403, { error: "Simulator key is invalid." });
    const db = await readDb();
    return sendJson(response, 200, {
      requests: db.requests || [],
      offersByRequest: db.offersByRequest || {}
    });
  }

  if (request.method === "POST" && url.pathname === "/api/reset") {
    const user = await getSessionUser(request);
    if (!hasRole(user, ["admin"]) && process.env.ALLOW_RESET !== "true") {
      return sendJson(response, 403, { error: "Reset is disabled. Sign in as admin or set ALLOW_RESET=true locally." });
    }
    const db = await resetDb();
    return sendJson(response, 200, scopedDb(db, user?.role === "admin" ? user : null));
  }

  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await readBody(request);
    const role = body.role === "provider" ? "provider" : "customer";
    const name = requireText(body.name || body.businessName, "Full name");
    const phone = normalizePhone(body.phone);
    const email = normalizeEmail(body.email);
    const password = validatePassword(body.password);
    const businessName = role === "provider" ? requireText(body.businessName || body.name, "Business name") : body.businessName;
    const deliveryChannel = body.deliveryChannel === "whatsapp" ? "whatsapp" : "sms";
    const registrationId = `REG-${Date.now()}`;
    const otp = createOtpCode();

    if (!isValidPhone(phone)) {
      return sendJson(response, 400, { error: "Enter a valid phone number before requesting OTP." });
    }

    const existingDb = await readDb();
    const existingUser = existingDb.users.find((user) => (phone && normalizePhone(user.phone) === phone) || (email && user.email === email));
    if (existingUser) {
      await updateDb((data) => {
        data.authError = "This phone or email is already registered. Please sign in instead.";
        appendAudit(data, "auth.register.duplicate", { userId: existingUser.id, role: existingUser.role });
        return data;
      });
      return sendJson(response, 409, { error: "This phone or email is already registered. Please sign in instead." });
    }

    if (otpPaused()) {
      let authToken = "";
      const db = await updateDb((data) => {
        const registration = {
          ...body,
          id: registrationId,
          name,
          businessName,
          phone,
          email,
          password,
          role,
          deliveryChannel,
          createdAt: new Date().toISOString()
        };
        const user = createUserFromRegistration(registration, { phoneVerified: false });
        if (role === "provider") {
          data.providers = [createProviderFromRegistration(registration, user), ...(data.providers || [])];
        }
        data.users = [user, ...(data.users || [])];
        authToken = createSession(data, user);
        data.authError = null;
        addNotification(data, `${user.name} registered while phone verification is paused.`, "auth");
        if (user.role === "provider") {
          addNotification(data, `${user.name} is pending admin provider approval.`, "admin");
        }
        appendAudit(data, "auth.registered.otp_paused", { userId: user.id, role: user.role });
        return data;
      });
      const sessionUser = findSessionUser(db, authToken);
      return sendJson(response, 201, {
        ...scopedDb(db, sessionUser),
        authToken,
        requiresOtp: false,
        phoneVerificationPaused: true,
        message: "Registration completed. Phone verification is currently paused and will be requested later."
      });
    }

    const delivery = await deliverOtp({ channel: deliveryChannel, phone, code: otp });

    const db = await updateDb((data) => {
      data.pendingRegistrations ||= [];
      data.otpMessages ||= [];
      const pendingRegistration = {
        ...body,
        id: registrationId,
        name,
        businessName,
        phone,
        email,
        password,
        role,
        deliveryChannel,
        otpHash: hashOtp(otp, registrationId),
        attempts: 0,
        lastSentAt: Date.now(),
        expiresAt: otpExpiresAt(),
        createdAt: new Date().toISOString()
      };

      data.pendingRegistrations = [
        pendingRegistration,
        ...data.pendingRegistrations.filter((item) => item.phone !== phone)
      ].slice(0, 50);
      data.otpMessages = [
        {
          id: `OTP-${Date.now()}`,
          registrationId,
          phone,
          maskedPhone: maskPhone(phone),
          deliveryChannel,
          provider: delivery.provider,
          code: delivery.devCode || undefined,
          status: delivery.status,
          createdAt: new Date().toISOString()
        },
        ...data.otpMessages
      ].slice(0, 50);
      data.session = null;
      data.authError = null;
      addNotification(data, `OTP sent to ${maskPhone(phone)} by ${deliveryChannel.toUpperCase()}.`, "auth");
      appendAudit(data, "auth.otp.sent", { registrationId, role, deliveryChannel });
      return data;
    });
    if (db.authError) {
      return sendJson(response, 409, { error: db.authError });
    }
    const pending = db.pendingRegistrations?.find((item) => item.phone === phone);
    return sendJson(response, 201, {
      ...scopedDb(db, null),
      requiresOtp: Boolean(pending),
      registrationId: pending?.id,
      maskedPhone: maskPhone(phone),
      deliveryChannel,
      expiresAt: pending?.expiresAt,
      policy: otpPolicy()
    });
  }

  if (request.method === "POST" && url.pathname === "/api/admin/bootstrap") {
    const setupKey = process.env.SETUP_ADMIN_KEY;
    if (!setupKey || request.headers["x-setup-key"] !== setupKey) {
      return sendJson(response, 403, { error: "Admin setup key is required." });
    }
    const body = await readBody(request);
    const name = requireText(body.name, "Admin name");
    const phone = normalizePhone(body.phone);
    const email = normalizeEmail(body.email);
    const password = validatePassword(body.password);
    if (!isValidPhone(phone)) return sendJson(response, 400, { error: "Enter a valid admin phone number." });
    if (!email) return sendJson(response, 400, { error: "Admin email is required." });

    let authToken = "";
    const db = await updateDb((data) => {
      if ((data.users || []).some((user) => user.role === "admin")) {
        data.authError = "Admin account already exists.";
        return data;
      }
      const user = {
        id: createUserId("admin"),
        name,
        phone,
        email,
        role: "admin",
        createdAt: new Date().toISOString(),
        status: "Active",
        phoneVerified: true,
        verifiedAt: new Date().toISOString(),
        passwordSet: true,
        passwordHash: hashPassword(password)
      };
      data.users = [user, ...(data.users || [])];
      authToken = createSession(data, user);
      data.authError = null;
      addNotification(data, `${user.name} created the first admin account.`, "auth");
      appendAudit(data, "admin.bootstrap.created", { userId: user.id });
      return data;
    });

    if (db.authError) return sendJson(response, 409, { error: db.authError });
    return sendJson(response, 201, { ...scopedDb(db, findSessionUser(db, authToken)), authToken });
  }

  if (request.method === "POST" && url.pathname === "/api/auth/resend-otp") {
    if (otpPaused()) return sendJson(response, 409, { error: "OTP service is currently paused." });
    const body = await readBody(request);
    const otp = createOtpCode();
    let pendingForDelivery = null;
    const currentDb = await readDb();
    pendingForDelivery = currentDb.pendingRegistrations?.find((item) => item.id === body.registrationId);
    if (!pendingForDelivery) return sendJson(response, 400, { error: "Registration session not found" });
    if (!canResend(pendingForDelivery.lastSentAt)) {
      return sendJson(response, 429, { error: "Please wait before requesting another OTP." });
    }
    const resendChannel = body.deliveryChannel === "whatsapp" ? "whatsapp" : pendingForDelivery.deliveryChannel || "sms";
    const delivery = await deliverOtp({ channel: resendChannel, phone: pendingForDelivery.phone, code: otp });
    const db = await updateDb((data) => {
      data.pendingRegistrations ||= [];
      data.otpMessages ||= [];
      const pending = data.pendingRegistrations.find((item) => item.id === body.registrationId);
      if (!pending) {
        data.authError = "Registration session not found";
        return data;
      }
      pending.otpHash = hashOtp(otp, pending.id);
      pending.attempts = 0;
      pending.expiresAt = otpExpiresAt();
      pending.lastSentAt = Date.now();
      pending.deliveryChannel = resendChannel;
      data.otpMessages = [
        {
          id: `OTP-${Date.now()}`,
          registrationId: pending.id,
          phone: pending.phone,
          maskedPhone: maskPhone(pending.phone),
          deliveryChannel: pending.deliveryChannel,
          provider: delivery.provider,
          code: delivery.devCode || undefined,
          status: delivery.status,
          createdAt: new Date().toISOString()
        },
        ...data.otpMessages
      ].slice(0, 50);
      data.authError = null;
      addNotification(data, `OTP resent to ${maskPhone(pending.phone)} by ${pending.deliveryChannel.toUpperCase()}.`, "auth");
      appendAudit(data, "auth.otp.resent", { registrationId: pending.id, deliveryChannel: pending.deliveryChannel });
      return data;
    });

    if (db.authError) return sendJson(response, 400, { error: db.authError });
    const pending = db.pendingRegistrations?.find((item) => item.id === body.registrationId);
    return sendJson(response, 200, {
      ...scopedDb(db, null),
      requiresOtp: true,
      registrationId: pending?.id,
      maskedPhone: maskPhone(pending?.phone),
      deliveryChannel: pending?.deliveryChannel,
      expiresAt: pending?.expiresAt,
      policy: otpPolicy()
    });
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readBody(request);
    const identifier = normalizePhone(body.identifier) || String(body.identifier || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!identifier || !password) return sendJson(response, 400, { error: "Enter username and password." });

    let authToken = "";
    const db = await updateDb((data) => {
      const user = data.users.find((item) => {
        const phone = normalizePhone(item.phone);
        const email = String(item.email || "").toLowerCase();
        return phone === identifier || email === identifier;
      });

      if (!user || !verifyPassword(user, password)) {
        data.authError = "Invalid username or password.";
        appendAudit(data, "auth.login.failed", { identifier });
        return data;
      }

      if (passwordNeedsUpgrade(user)) {
        user.passwordHash = hashPassword(password);
        appendAudit(data, "auth.password_hash.upgraded", { userId: user.id });
      }
      authToken = createSession(data, user);
      data.session = null;
      data.authError = null;
      addNotification(data, `${user.name} signed in.`, "auth");
      appendAudit(data, "auth.login.success", { userId: user.id, role: user.role });
      return data;
    });

    if (db.authError) return sendJson(response, 401, { error: db.authError });
    const sessionUser = findSessionUser(db, authToken);
    return sendJson(response, 200, { ...scopedDb(db, sessionUser), authToken });
  }

  const deleteUserMatch = url.pathname.match(/^\/api\/users\/([^/]+)$/);
  if (request.method === "DELETE" && deleteUserMatch) {
    const userId = decodeURIComponent(deleteUserMatch[1]);
    const currentUser = await getSessionUser(request);
    if (!currentUser || (currentUser.id !== userId && currentUser.role !== "admin")) {
      return sendJson(response, 403, { error: "You are not allowed to delete this account." });
    }
    const db = await updateDb((data) => {
      const user = data.users.find((item) => item.id === userId);
      if (!user) {
        data.authError = "User not found.";
        return data;
      }

      data.users = data.users.filter((item) => item.id !== userId);
      data.sessions = (data.sessions || []).filter((session) => session.userId !== userId);
      if (user.providerId) {
        data.providers = data.providers.filter((provider) => provider.id !== user.providerId);
      }
      data.requests = data.requests.map((item) =>
        item.customerId === userId ? { ...item, customer: "Deleted account", customerId: "deleted" } : item
      );
      if (data.session?.id === userId) data.session = null;
      data.authError = null;
      addNotification(data, `${user.name} deleted their account.`, "auth");
      appendAudit(data, "user.deleted", { userId, role: user.role });
      return data;
    });

    if (db.authError) return sendJson(response, 404, { error: db.authError });
    return sendJson(response, 200, scopedDb(db, currentUser.role === "admin" ? currentUser : null));
  }

  if (request.method === "POST" && url.pathname === "/api/auth/verify-otp") {
    if (otpPaused()) return sendJson(response, 409, { error: "OTP service is currently paused." });
    const body = await readBody(request);
    let authToken = "";
    const db = await updateDb((data) => {
      data.pendingRegistrations ||= [];
      data.otpMessages ||= [];
      const pending = data.pendingRegistrations.find((item) => item.id === body.registrationId);
      if (!pending) {
        data.authError = "Registration session not found";
        return data;
      }
      if (Date.now() > pending.expiresAt) {
        data.authError = "OTP expired";
        appendAudit(data, "auth.otp.expired", { registrationId: pending.id });
        return data;
      }
      if (Number(pending.attempts || 0) >= otpPolicy().maxAttempts) {
        data.authError = "Too many invalid attempts. Request a new OTP.";
        appendAudit(data, "auth.otp.locked", { registrationId: pending.id });
        return data;
      }
      if (!verifyOtpHash(body.otp, pending.id, pending.otpHash)) {
        pending.attempts = Number(pending.attempts || 0) + 1;
        data.authError = "Invalid OTP";
        appendAudit(data, "auth.otp.invalid", { registrationId: pending.id, attempts: pending.attempts });
        return data;
      }

      const user = createUserFromRegistration(pending);
      if (pending.role === "provider") {
        data.providers = [createProviderFromRegistration(pending, user), ...data.providers];
      }

      data.users = [user, ...data.users];
      data.pendingRegistrations = data.pendingRegistrations.filter((item) => item.id !== pending.id);
      data.otpMessages = data.otpMessages.map((message) =>
        message.registrationId === pending.id ? { ...message, status: "Verified", verifiedAt: new Date().toISOString() } : message
      );
      authToken = createSession(data, user);
      data.session = null;
      data.authError = null;
      addNotification(data, `${user.name} verified phone and registered as ${user.role}.`, "auth");
      if (user.role === "provider") {
        addNotification(data, `${user.name} is pending admin provider approval.`, "admin");
      }
      appendAudit(data, "auth.otp.verified", { userId: user.id, role: user.role });
      return data;
    });

    if (db.authError) {
      return sendJson(response, 400, { error: db.authError, registrationId: body.registrationId });
    }

    const sessionUser = findSessionUser(db, authToken);
    return sendJson(response, 201, { ...scopedDb(db, sessionUser), authToken });
  }

  if (request.method === "POST" && url.pathname === "/api/requests") {
    const currentUser = await getSessionUser(request);
    if (!hasRole(currentUser, ["customer", "admin"])) {
      return sendJson(response, 401, { error: "Sign in as a customer before creating a request." });
    }
    const body = await readBody(request);
    const serviceType = requireText(body.serviceType, "Service type", 2, 80);
    const description = requireText(body.description, "Problem description", 10, 1000);
    const location = requireText(body.location, "Location", 2, 80);
    const urgency = ["Normal", "Urgent", "Emergency"].includes(body.urgency) ? body.urgency : "Normal";
    const db = await updateDb((data) => {
      if (data.categories?.length && !data.categories.includes(serviceType)) {
        data.authError = "Choose a supported service category.";
        return data;
      }
      const nextRequest = {
        ...body,
        serviceType,
        description,
        location,
        urgency,
        id: createRequestId(),
        customer: currentUser.name,
        customerId: currentUser.id,
        date: todayStamp(),
        status: "Matching",
        provider: "Matching providers",
        price: "-",
        aiDetection: detectIssueFromPhoto(body.photoName, body.serviceType),
        timelineStep: 0
      };
      data.requests = [nextRequest, ...data.requests];
      data.offersByRequest[nextRequest.id] = [];
      addNotification(data, `New ${nextRequest.serviceType} request created in ${nextRequest.location}.`);
      appendAudit(data, "request.created", { requestId: nextRequest.id });
      data.activeRequestId = nextRequest.id;
      return data;
    });
    if (db.authError) return sendJson(response, 400, { error: db.authError });
    return sendJson(response, 201, scopedDb(db, currentUser));
  }

  const acceptOfferMatch = url.pathname.match(/^\/api\/offers\/([^/]+)\/accept$/);
  if (request.method === "POST" && acceptOfferMatch) {
    const currentUser = await getSessionUser(request);
    if (!hasRole(currentUser, ["customer", "admin"])) return sendJson(response, 401, { error: "Sign in as a customer to accept offers." });
    const offerId = decodeURIComponent(acceptOfferMatch[1]);
    const db = await updateDb((data) => {
      const offers = Object.values(data.offersByRequest || {}).flat();
      const offer = offers.find((item) => item.id === offerId);
      if (!offer) return data;
      const serviceRequest = data.requests.find((item) => item.id === offer.requestId);
      if (currentUser.role !== "admin" && serviceRequest?.customerId !== currentUser.id) {
        data.authError = "You are not allowed to accept this offer.";
        return data;
      }
      data.requests = data.requests.map((item) =>
        item.id === offer.requestId
          ? {
              ...item,
              status: "Payment pending",
              provider: offer.providerName,
              providerId: offer.providerId,
              price: offer.estimatedPrice,
              timelineStep: 1
            }
          : item
      );
      data.payments = [
        {
          id: `PAY-${offer.requestId}`,
          requestId: offer.requestId,
          providerId: offer.providerId,
          providerName: offer.providerName,
          customer: data.requests.find((item) => item.id === offer.requestId)?.customer || "Customer",
          amount: offer.estimatedPrice,
          platformFee: Math.round(offer.estimatedPrice * 0.12 * 100) / 100,
          status: "Awaiting customer payment",
          createdAt: todayStamp()
        },
        ...data.payments.filter((payment) => payment.requestId !== offer.requestId)
      ];
      data.selectedOffer = offer;
      addNotification(data, `Offer accepted from ${offer.providerName}.`);
      appendAudit(data, "offer.accepted", { offerId });
      return data;
    });
    if (db.authError) return sendJson(response, 403, { error: db.authError });
    return sendJson(response, 200, scopedDb(db, currentUser));
  }

  const capturePaymentMatch = url.pathname.match(/^\/api\/payments\/([^/]+)\/capture$/);
  if (request.method === "POST" && capturePaymentMatch) {
    const currentUser = await getSessionUser(request);
    if (!hasRole(currentUser, ["customer", "admin"])) return sendJson(response, 401, { error: "Sign in before confirming payment." });
    const paymentId = decodeURIComponent(capturePaymentMatch[1]);
    const db = await updateDb((data) => {
      const payment = data.payments.find((item) => item.id === paymentId || item.requestId === paymentId);
      if (!payment) return data;
      const serviceRequest = data.requests.find((item) => item.id === payment.requestId);
      if (currentUser.role !== "admin" && serviceRequest?.customerId !== currentUser.id) {
        data.authError = "You are not allowed to confirm this payment.";
        return data;
      }
      data.selectedPayment = payment;
      return data;
    });
    if (db.authError) return sendJson(response, 403, { error: db.authError });
    if (!db.selectedPayment) return sendJson(response, 404, { error: "Payment not found." });
    try {
      await captureGatewayPayment(db.selectedPayment);
    } catch (error) {
      return sendJson(response, error.status || 502, { error: error.message, code: error.code || "PAYMENT_GATEWAY_ERROR" });
    }
    const capturedDb = await updateDb((data) => {
      const payment = data.payments.find((item) => item.id === paymentId || item.requestId === paymentId);
      if (!payment) return data;
      data.payments = data.payments.map((item) =>
        item.id === payment.id ? { ...item, status: "Escrow secured" } : item
      );
      data.requests = data.requests.map((item) =>
        item.id === payment.requestId ? { ...item, status: "Active" } : item
      );
      addNotification(data, `Payment secured for ${payment.requestId}.`);
      appendAudit(data, "payment.captured", { paymentId: payment.id });
      return data;
    });
    return sendJson(response, 200, scopedDb(capturedDb, currentUser));
  }

  const completeRequestMatch = url.pathname.match(/^\/api\/requests\/([^/]+)\/complete$/);
  if (request.method === "POST" && completeRequestMatch) {
    const currentUser = await getSessionUser(request);
    if (!hasRole(currentUser, ["customer", "provider", "admin"])) return sendJson(response, 401, { error: "Sign in before completing a request." });
    const requestId = decodeURIComponent(completeRequestMatch[1]);
    const db = await updateDb((data) => {
      const serviceRequest = data.requests.find((item) => item.id === requestId);
      if (
        currentUser.role !== "admin" &&
        serviceRequest?.customerId !== currentUser.id &&
        serviceRequest?.providerId !== currentUser.providerId
      ) {
        data.authError = "You are not allowed to complete this request.";
        return data;
      }
      data.requests = data.requests.map((item) =>
        item.id === requestId ? { ...item, status: "Completed", timelineStep: 5 } : item
      );
      data.payments = data.payments.map((item) =>
        item.requestId === requestId ? { ...item, status: "Ready for payout" } : item
      );
      addNotification(data, `${requestId} completed.`);
      appendAudit(data, "request.completed", { requestId });
      return data;
    });
    if (db.authError) return sendJson(response, 403, { error: db.authError });
    return sendJson(response, 200, scopedDb(db, currentUser));
  }

  if (request.method === "POST" && url.pathname === "/api/reviews") {
    const currentUser = await getSessionUser(request);
    if (!hasRole(currentUser, ["customer", "admin"])) return sendJson(response, 401, { error: "Sign in as a customer to review a provider." });
    const body = await readBody(request);
    const rating = Math.max(1, Math.min(5, Number(body.rating || 0)));
    if (!body.requestId || !rating) return sendJson(response, 400, { error: "Request and rating are required." });
    const db = await updateDb((data) => {
      const serviceRequest = data.requests.find((item) => item.id === body.requestId);
      if (currentUser.role !== "admin" && serviceRequest?.customerId !== currentUser.id) {
        data.authError = "You are not allowed to review this request.";
        return data;
      }
      data.reviews = [{ ...body, rating, id: `REV-${Date.now()}`, createdAt: new Date().toISOString() }, ...data.reviews];
      appendAudit(data, "review.created", { requestId: body.requestId });
      return data;
    });
    if (db.authError) return sendJson(response, 403, { error: db.authError });
    return sendJson(response, 201, scopedDb(db, currentUser));
  }

  if (request.method === "POST" && url.pathname === "/api/provider-decisions") {
    const currentUser = await getSessionUser(request);
    if (!hasRole(currentUser, ["provider", "admin"])) return sendJson(response, 401, { error: "Sign in as a provider to respond to jobs." });
    const body = await readBody(request);
    if (!body.requestId || !["Accepted", "Rejected"].includes(body.status)) {
      return sendJson(response, 400, { error: "Provider decision requires a request and a valid status." });
    }
    const db = await updateDb((data) => {
      const providerId = currentUser.role === "admin" ? body.providerId : currentUser.providerId;
      const provider = data.providers.find((item) => item.id === providerId);
      const serviceRequest = data.requests.find((item) => item.id === body.requestId);
      if (!provider || !serviceRequest) {
        data.authError = "Provider or request was not found.";
        return data;
      }
      if (currentUser.role !== "admin" && !provider.approved) {
        data.authError = "Provider profile must be approved before responding to jobs.";
        return data;
      }
      data.providerDecisions[`${body.requestId}:${providerId}`] = body.status;
      addNotification(data, `${provider?.name || "Provider"} ${body.status.toLowerCase()} ${body.requestId}.`, "provider");
      appendAudit(data, "provider.decision", { ...body, providerId });
      return data;
    });
    if (db.authError) return sendJson(response, 403, { error: db.authError });
    return sendJson(response, 201, scopedDb(db, currentUser));
  }

  const providerOffersMatch = url.pathname.match(/^\/api\/requests\/([^/]+)\/provider-offers$/);
  if (request.method === "POST" && providerOffersMatch) {
    if (!requireSimulator(request)) return sendJson(response, 403, { error: "Simulator key is invalid." });
    const requestId = decodeURIComponent(providerOffersMatch[1]);
    const body = await readBody(request);
    const db = await updateDb((data) => {
      const serviceRequest = data.requests.find((item) => item.id === requestId);
      if (!serviceRequest || serviceRequest.status !== "Matching") return data;

      const generatedOffers = generateProviderOffers(serviceRequest, data.providers, body);
      const currentOffers = data.offersByRequest[requestId] || [];
      const existingIds = new Set(currentOffers.map((offer) => offer.id));
      const newOffers = generatedOffers.filter((offer) => !existingIds.has(offer.id));

      data.offersByRequest[requestId] = [...currentOffers, ...newOffers];
      for (const offer of newOffers) {
        data.providerDecisions[`${requestId}:${offer.providerId}`] = "Accepted";
      }

      addNotification(data, `${newOffers.length} providers responded to ${requestId}.`, "external-test");
      appendAudit(data, "external.provider_offers.generated", {
        requestId,
        scenario: body.scenario || "default",
        offers: newOffers.length
      });
      return data;
    });
    return sendJson(response, 201, scopedDb(db, null));
  }

  const advanceRequestMatch = url.pathname.match(/^\/api\/requests\/([^/]+)\/advance$/);
  if (request.method === "POST" && advanceRequestMatch) {
    if (!requireSimulator(request)) return sendJson(response, 403, { error: "Simulator key is invalid." });
    const requestId = decodeURIComponent(advanceRequestMatch[1]);
    const body = await readBody(request);
    const db = await updateDb((data) => {
      const current = data.requests.find((item) => item.id === requestId);
      if (!current) return data;
      const nextStep = Math.min(5, Number(body.timelineStep ?? current.timelineStep ?? 1));
      data.requests = data.requests.map((item) =>
        item.id === requestId ? { ...item, timelineStep: nextStep, status: nextStep >= 5 ? "Completed" : item.status } : item
      );
      if (nextStep >= 5) {
        data.payments = data.payments.map((item) =>
          item.requestId === requestId ? { ...item, status: "Ready for payout" } : item
        );
      }
      addNotification(data, `${requestId} moved to tracking step ${nextStep}.`, "external-test");
      appendAudit(data, "external.request.advanced", { requestId, timelineStep: nextStep });
      return data;
    });
    return sendJson(response, 200, scopedDb(db, null));
  }

  if (request.method === "POST" && url.pathname === "/api/providers") {
    const currentUser = await getSessionUser(request);
    if (!hasRole(currentUser, ["provider", "admin"])) return sendJson(response, 401, { error: "Sign in as a provider before submitting an application." });
    const body = await readBody(request);
    const providerName = requireText(body.name, "Provider name", 2, 120);
    const id = providerName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `provider-${Date.now()}`;
    const db = await updateDb((data) => {
      data.providers = [{ id, ...body, name: providerName, approved: false, approvalStatus: "Pending admin approval", rating: 0, completedJobs: 0, badges: ["Under Review"], earningsMonth: 0 }, ...data.providers];
      addNotification(data, `${providerName} submitted a provider application.`, "admin");
      appendAudit(data, "provider.applied", { providerId: id });
      return data;
    });
    return sendJson(response, 201, scopedDb(db, currentUser));
  }

  const approveProviderMatch = url.pathname.match(/^\/api\/providers\/([^/]+)\/approve$/);
  if (request.method === "POST" && approveProviderMatch) {
    const currentUser = await getSessionUser(request);
    if (!hasRole(currentUser, ["admin"])) return sendJson(response, 403, { error: "Admin approval is required." });
    const providerId = decodeURIComponent(approveProviderMatch[1]);
    const db = await updateDb((data) => {
      const providerExists = data.providers.some((provider) => provider.id === providerId);
      if (!providerExists) {
        data.authError = "Provider not found.";
        return data;
      }
      data.providers = data.providers.map((provider) =>
        provider.id === providerId ? { ...provider, approved: true, approvalStatus: "Approved", badges: ["Verified", "Licensed", "Approved"] } : provider
      );
      data.users = data.users.map((user) =>
        user.providerId === providerId ? { ...user, status: "Active", approvalStatus: "Approved" } : user
      );
      appendAudit(data, "provider.approved", { providerId });
      return data;
    });
    if (db.authError) return sendJson(response, 404, { error: db.authError });
    return sendJson(response, 200, scopedDb(db, currentUser));
  }

  if (request.method === "POST" && url.pathname === "/api/categories") {
    const currentUser = await getSessionUser(request);
    if (!hasRole(currentUser, ["admin"])) return sendJson(response, 403, { error: "Admin access is required." });
    const body = await readBody(request);
    const category = requireText(body.category, "Category", 2, 80);
    const db = await updateDb((data) => {
      if (!data.categories.includes(category)) data.categories.push(category);
      appendAudit(data, "category.created", { category });
      return data;
    });
    return sendJson(response, 201, scopedDb(db, currentUser));
  }

  return sendJson(response, 404, { error: "Not found" });
}

const server = http.createServer((request, response) => {
  route(request, response).catch((error) => {
    console.error(error);
    const status = Number(error.status || 500);
    sendJson(response, status, { error: status >= 500 ? "Unexpected server error." : error.message });
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Baytak API is already running on http://127.0.0.1:${port}`);
    console.log("Open http://127.0.0.1:8787/api/health to verify it.");
    process.exit(0);
  }
  throw error;
});

server.listen(port, () => {
  console.log(`Baytak API running at http://127.0.0.1:${port}`);
});
