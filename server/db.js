import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { seedData } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");
const storageClient = String(process.env.DB_CLIENT || (process.env.DATABASE_URL ? "postgres" : "json")).toLowerCase();
const postgresEnabled = storageClient === "postgres";
const productionMode = process.env.NODE_ENV === "production" || process.env.REQUIRE_PRODUCTION_DB === "true";

let updateQueue = Promise.resolve();
let pool;
let postgresReady;

if (productionMode && !postgresEnabled) {
  throw new Error("Production mode requires DB_CLIENT=postgres and DATABASE_URL. JSON storage is not allowed for production.");
}

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required when DB_CLIENT=postgres.");
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DB_POOL_MAX || 20),
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
      connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
    });
  }
  return pool;
}

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedData));
}

function normalizeDb(data = {}) {
  const normalized = { ...cloneSeed(), ...data };
  for (const key of ["users", "providers", "requests", "payments", "reviews", "pendingRegistrations", "otpMessages", "notifications", "auditLog", "sessions"]) {
    normalized[key] = Array.isArray(normalized[key]) ? normalized[key] : [];
  }
  normalized.offersByRequest ||= {};
  normalized.providerDecisions ||= {};
  normalized.categories = Array.isArray(normalized.categories) ? normalized.categories : seedData.categories;
  normalized.session ??= null;
  normalized.authError ??= null;
  normalized.selectedOffer ??= null;
  return normalized;
}

function dateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function json(value, fallback) {
  return JSON.stringify(value ?? fallback);
}

async function ensureJsonDb() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dbPath, "utf8");
  } catch {
    await writeJsonDb(cloneSeed());
  }
}

async function readJsonDb() {
  await ensureJsonDb();
  const raw = await readFile(dbPath, "utf8");
  try {
    return normalizeDb(JSON.parse(raw));
  } catch {
    await backupCorruptDb();
    await writeJsonDb(cloneSeed());
    return cloneSeed();
  }
}

async function writeJsonDb(data) {
  await mkdir(dataDir, { recursive: true });
  const normalized = normalizeDb(data);
  const tempPath = `${dbPath}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  await rename(tempPath, dbPath);
  return normalized;
}

async function ensurePostgresDb() {
  if (postgresReady) return postgresReady;
  postgresReady = (async () => {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await createSchema(client);
      const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM users");
      if (Number(rows[0]?.count || 0) === 0) {
        await writePostgresDb(client, cloneSeed());
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })();
  return postgresReady;
}

async function createSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Company',
      rating NUMERIC(3,2) NOT NULL DEFAULT 0,
      completed_jobs INTEGER NOT NULL DEFAULT 0,
      base_location TEXT,
      specialties JSONB NOT NULL DEFAULT '[]',
      response_mins INTEGER NOT NULL DEFAULT 12,
      distance_km NUMERIC(6,2) NOT NULL DEFAULT 0,
      badges JSONB NOT NULL DEFAULT '[]',
      price_level TEXT,
      earnings_month NUMERIC(12,2) NOT NULL DEFAULT 0,
      approved BOOLEAN NOT NULL DEFAULT false,
      approval_status TEXT,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      documents TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
      provider_id TEXT REFERENCES providers(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'Active',
      approval_status TEXT,
      phone_verified BOOLEAN NOT NULL DEFAULT false,
      verified_at TIMESTAMPTZ,
      password_set BOOLEAN NOT NULL DEFAULT false,
      password_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      service_type TEXT NOT NULL,
      description TEXT NOT NULL,
      urgency TEXT NOT NULL DEFAULT 'Normal',
      location TEXT NOT NULL,
      preferred_time TEXT,
      photo_name TEXT,
      status TEXT NOT NULL,
      date TEXT,
      provider TEXT,
      provider_id TEXT REFERENCES providers(id) ON DELETE SET NULL,
      price TEXT,
      ai_detection JSONB,
      timeline_step INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      provider_id TEXT REFERENCES providers(id) ON DELETE SET NULL,
      provider_name TEXT NOT NULL,
      provider_type TEXT,
      rating NUMERIC(3,2),
      completed_jobs INTEGER,
      badges JSONB NOT NULL DEFAULT '[]',
      distance_km NUMERIC(6,2),
      matching_score INTEGER,
      match_reasons JSONB NOT NULL DEFAULT '[]',
      estimated_price NUMERIC(12,2),
      arrival_time TEXT,
      service_type TEXT,
      status TEXT,
      is_emergency BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      request_id TEXT REFERENCES requests(id) ON DELETE SET NULL,
      provider_id TEXT REFERENCES providers(id) ON DELETE SET NULL,
      provider_name TEXT,
      customer TEXT,
      amount NUMERIC(12,2),
      platform_fee NUMERIC(12,2),
      status TEXT NOT NULL,
      created_at TEXT
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      request_id TEXT REFERENCES requests(id) ON DELETE CASCADE,
      provider_id TEXT REFERENCES providers(id) ON DELETE SET NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      payload JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS provider_decisions (
      request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('Accepted', 'Rejected')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (request_id, provider_id)
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS pending_registrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      business_name TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL,
      delivery_channel TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_sent_at BIGINT,
      expires_at BIGINT,
      payload JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS otp_messages (
      id TEXT PRIMARY KEY,
      registration_id TEXT,
      phone TEXT,
      masked_phone TEXT,
      delivery_channel TEXT,
      provider TEXT,
      code TEXT,
      status TEXT,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at BIGINT NOT NULL
    )
  `);
  await client.query("CREATE TABLE IF NOT EXISTS categories (category TEXT PRIMARY KEY)");
  await client.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'activity',
      read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await client.query("CREATE INDEX IF NOT EXISTS users_role_idx ON users(role)");
  await client.query("CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone)");
  await client.query("CREATE INDEX IF NOT EXISTS requests_customer_idx ON requests(customer_id)");
  await client.query("CREATE INDEX IF NOT EXISTS requests_provider_idx ON requests(provider_id)");
  await client.query("CREATE INDEX IF NOT EXISTS offers_request_idx ON offers(request_id)");
  await client.query("CREATE INDEX IF NOT EXISTS payments_request_idx ON payments(request_id)");
  await client.query("CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)");
}

async function readPostgresDb(client) {
  if (!client) await ensurePostgresDb();
  const executor = client || getPool();
  const [
    users,
    providers,
    requests,
    offers,
    payments,
    reviews,
    decisions,
    pending,
    otp,
    sessions,
    categories,
    notifications,
    audit,
    state
  ] = await Promise.all([
    executor.query("SELECT * FROM users ORDER BY created_at ASC"),
    executor.query("SELECT * FROM providers ORDER BY created_at ASC"),
    executor.query("SELECT * FROM requests ORDER BY created_at DESC"),
    executor.query("SELECT * FROM offers ORDER BY created_at ASC"),
    executor.query("SELECT * FROM payments ORDER BY created_at DESC"),
    executor.query("SELECT * FROM reviews ORDER BY created_at DESC"),
    executor.query("SELECT * FROM provider_decisions"),
    executor.query("SELECT * FROM pending_registrations ORDER BY created_at DESC"),
    executor.query("SELECT * FROM otp_messages ORDER BY created_at DESC"),
    executor.query("SELECT * FROM sessions ORDER BY created_at DESC"),
    executor.query("SELECT * FROM categories ORDER BY category ASC"),
    executor.query("SELECT * FROM notifications ORDER BY created_at DESC"),
    executor.query("SELECT * FROM audit_log ORDER BY created_at DESC"),
    executor.query("SELECT * FROM app_state")
  ]);

  const offersByRequest = {};
  for (const row of offers.rows) {
    offersByRequest[row.request_id] ||= [];
    offersByRequest[row.request_id].push({
      id: row.id,
      requestId: row.request_id,
      providerId: row.provider_id,
      providerName: row.provider_name,
      providerType: row.provider_type,
      rating: Number(row.rating || 0),
      completedJobs: Number(row.completed_jobs || 0),
      badges: row.badges || [],
      distanceKm: Number(row.distance_km || 0),
      matchingScore: Number(row.matching_score || 0),
      matchReasons: row.match_reasons || [],
      estimatedPrice: Number(row.estimated_price || 0),
      arrivalTime: row.arrival_time,
      serviceType: row.service_type,
      status: row.status,
      isEmergency: row.is_emergency,
      createdAt: row.created_at?.toISOString?.() || row.created_at
    });
  }

  const providerDecisions = {};
  for (const row of decisions.rows) providerDecisions[`${row.request_id}:${row.provider_id}`] = row.status;

  const data = {
    users: users.rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      role: row.role,
      providerId: row.provider_id,
      status: row.status,
      approvalStatus: row.approval_status,
      phoneVerified: row.phone_verified,
      verifiedAt: row.verified_at?.toISOString?.() || row.verified_at,
      passwordSet: row.password_set,
      passwordHash: row.password_hash,
      createdAt: row.created_at?.toISOString?.() || row.created_at
    })),
    providers: providers.rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      rating: Number(row.rating || 0),
      completedJobs: Number(row.completed_jobs || 0),
      baseLocation: row.base_location,
      specialties: row.specialties || [],
      responseMins: Number(row.response_mins || 0),
      distanceKm: Number(row.distance_km || 0),
      badges: row.badges || [],
      priceLevel: row.price_level,
      earningsMonth: Number(row.earnings_month || 0),
      approved: row.approved,
      approvalStatus: row.approval_status,
      contactName: row.contact_name,
      phone: row.phone,
      email: row.email,
      documents: row.documents,
      createdAt: row.created_at?.toISOString?.() || row.created_at
    })),
    requests: requests.rows.map((row) => ({
      id: row.id,
      customer: row.customer,
      customerId: row.customer_id,
      serviceType: row.service_type,
      description: row.description,
      urgency: row.urgency,
      location: row.location,
      preferredTime: row.preferred_time,
      photoName: row.photo_name,
      status: row.status,
      date: row.date,
      provider: row.provider,
      providerId: row.provider_id,
      price: row.price,
      aiDetection: row.ai_detection,
      timelineStep: Number(row.timeline_step || 0)
    })),
    offersByRequest,
    payments: payments.rows.map((row) => ({
      id: row.id,
      requestId: row.request_id,
      providerId: row.provider_id,
      providerName: row.provider_name,
      customer: row.customer,
      amount: Number(row.amount || 0),
      platformFee: Number(row.platform_fee || 0),
      status: row.status,
      createdAt: row.created_at
    })),
    reviews: reviews.rows.map((row) => ({ ...(row.payload || {}), id: row.id, requestId: row.request_id, providerId: row.provider_id, rating: row.rating, comment: row.comment, createdAt: row.created_at?.toISOString?.() || row.created_at })),
    providerDecisions,
    pendingRegistrations: pending.rows.map((row) => ({ ...(row.payload || {}), id: row.id, name: row.name, businessName: row.business_name, phone: row.phone, email: row.email, role: row.role, deliveryChannel: row.delivery_channel, otpHash: row.otp_hash, attempts: row.attempts, lastSentAt: Number(row.last_sent_at || 0), expiresAt: Number(row.expires_at || 0), createdAt: row.created_at?.toISOString?.() || row.created_at })),
    otpMessages: otp.rows.map((row) => ({ id: row.id, registrationId: row.registration_id, phone: row.phone, maskedPhone: row.masked_phone, deliveryChannel: row.delivery_channel, provider: row.provider, code: row.code, status: row.status, verifiedAt: row.verified_at?.toISOString?.() || row.verified_at, createdAt: row.created_at?.toISOString?.() || row.created_at })),
    sessions: sessions.rows.map((row) => ({ token: row.token, userId: row.user_id, createdAt: row.created_at?.toISOString?.() || row.created_at, expiresAt: Number(row.expires_at) })),
    categories: categories.rows.map((row) => row.category),
    notifications: notifications.rows.map((row) => ({ id: row.id, text: row.text, type: row.type, read: row.read, createdAt: row.created_at?.toISOString?.() || row.created_at })),
    auditLog: audit.rows.map((row) => ({ id: row.id, action: row.action, payload: row.payload || {}, createdAt: row.created_at?.toISOString?.() || row.created_at }))
  };

  for (const row of state.rows) data[row.key] = row.payload;
  return normalizeDb(data);
}

async function replaceTable(client, table, ids, column = "id") {
  await client.query(`DELETE FROM ${table} WHERE NOT (${column} = ANY($1::text[]))`, [ids]);
}

async function writePostgresDb(client, data) {
  const normalized = normalizeDb(data);

  await replaceTable(client, "providers", normalized.providers.map((item) => item.id));
  for (const provider of normalized.providers) {
    await client.query(
      `INSERT INTO providers (id, name, type, rating, completed_jobs, base_location, specialties, response_mins, distance_km, badges, price_level, earnings_month, approved, approval_status, contact_name, phone, email, documents, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10::jsonb,$11,$12,$13,$14,$15,$16,$17,$18,COALESCE($19, now()),now())
       ON CONFLICT (id) DO UPDATE SET name=$2,type=$3,rating=$4,completed_jobs=$5,base_location=$6,specialties=$7::jsonb,response_mins=$8,distance_km=$9,badges=$10::jsonb,price_level=$11,earnings_month=$12,approved=$13,approval_status=$14,contact_name=$15,phone=$16,email=$17,documents=$18,updated_at=now()`,
      [provider.id, provider.name, provider.type || "Company", numberOrNull(provider.rating) || 0, numberOrNull(provider.completedJobs) || 0, provider.baseLocation, json(provider.specialties, []), numberOrNull(provider.responseMins) || 12, numberOrNull(provider.distanceKm) || 0, json(provider.badges, []), provider.priceLevel, numberOrNull(provider.earningsMonth) || 0, Boolean(provider.approved), provider.approvalStatus, provider.contactName, provider.phone, provider.email, provider.documents, dateOrNull(provider.createdAt)]
    );
  }

  await replaceTable(client, "users", normalized.users.map((item) => item.id));
  for (const user of normalized.users) {
    await client.query(
      `INSERT INTO users (id, name, phone, email, role, provider_id, status, approval_status, phone_verified, verified_at, password_set, password_hash, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13, now()),now())
       ON CONFLICT (id) DO UPDATE SET name=$2,phone=$3,email=$4,role=$5,provider_id=$6,status=$7,approval_status=$8,phone_verified=$9,verified_at=$10,password_set=$11,password_hash=$12,updated_at=now()`,
      [user.id, user.name, user.phone, user.email || null, user.role, user.providerId || null, user.status || "Active", user.approvalStatus || null, Boolean(user.phoneVerified), dateOrNull(user.verifiedAt), Boolean(user.passwordSet), user.passwordHash || null, dateOrNull(user.createdAt)]
    );
  }

  await replaceTable(client, "requests", normalized.requests.map((item) => item.id));
  for (const request of normalized.requests) {
    await client.query(
      `INSERT INTO requests (id, customer, customer_id, service_type, description, urgency, location, preferred_time, photo_name, status, date, provider, provider_id, price, ai_detection, timeline_step, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,now(),now())
       ON CONFLICT (id) DO UPDATE SET customer=$2,customer_id=$3,service_type=$4,description=$5,urgency=$6,location=$7,preferred_time=$8,photo_name=$9,status=$10,date=$11,provider=$12,provider_id=$13,price=$14,ai_detection=$15::jsonb,timeline_step=$16,updated_at=now()`,
      [request.id, request.customer, request.customerId || null, request.serviceType, request.description, request.urgency || "Normal", request.location, request.preferredTime, request.photoName, request.status, request.date, request.provider, request.providerId || null, String(request.price ?? ""), json(request.aiDetection, null), numberOrNull(request.timelineStep) || 0]
    );
  }

  const offers = Object.values(normalized.offersByRequest || {}).flat();
  await replaceTable(client, "offers", offers.map((item) => item.id));
  for (const offer of offers) {
    await client.query(
      `INSERT INTO offers (id, request_id, provider_id, provider_name, provider_type, rating, completed_jobs, badges, distance_km, matching_score, match_reasons, estimated_price, arrival_time, service_type, status, is_emergency, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,COALESCE($17, now()))
       ON CONFLICT (id) DO UPDATE SET request_id=$2,provider_id=$3,provider_name=$4,provider_type=$5,rating=$6,completed_jobs=$7,badges=$8::jsonb,distance_km=$9,matching_score=$10,match_reasons=$11::jsonb,estimated_price=$12,arrival_time=$13,service_type=$14,status=$15,is_emergency=$16`,
      [offer.id, offer.requestId, offer.providerId || null, offer.providerName, offer.providerType, numberOrNull(offer.rating), numberOrNull(offer.completedJobs), json(offer.badges, []), numberOrNull(offer.distanceKm), numberOrNull(offer.matchingScore), json(offer.matchReasons, []), numberOrNull(offer.estimatedPrice), offer.arrivalTime, offer.serviceType, offer.status, Boolean(offer.isEmergency), dateOrNull(offer.createdAt)]
    );
  }

  await replaceTable(client, "payments", normalized.payments.map((item) => item.id));
  for (const payment of normalized.payments) {
    await client.query(
      `INSERT INTO payments (id, request_id, provider_id, provider_name, customer, amount, platform_fee, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET request_id=$2,provider_id=$3,provider_name=$4,customer=$5,amount=$6,platform_fee=$7,status=$8,created_at=$9`,
      [payment.id, payment.requestId || null, payment.providerId || null, payment.providerName, payment.customer, numberOrNull(payment.amount), numberOrNull(payment.platformFee), payment.status, payment.createdAt]
    );
  }

  await replaceTable(client, "reviews", normalized.reviews.map((item) => item.id));
  for (const review of normalized.reviews) {
    await client.query(
      `INSERT INTO reviews (id, request_id, provider_id, rating, comment, payload, created_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,COALESCE($7, now()))
       ON CONFLICT (id) DO UPDATE SET request_id=$2,provider_id=$3,rating=$4,comment=$5,payload=$6::jsonb`,
      [review.id, review.requestId || null, review.providerId || null, Number(review.rating || 1), review.comment || "", json(review, {}), dateOrNull(review.createdAt)]
    );
  }

  await client.query("DELETE FROM provider_decisions");
  for (const [key, status] of Object.entries(normalized.providerDecisions || {})) {
    const [requestId, providerId] = key.split(":");
    if (!requestId || !providerId || !["Accepted", "Rejected"].includes(status)) continue;
    await client.query(
      "INSERT INTO provider_decisions (request_id, provider_id, status) VALUES ($1,$2,$3) ON CONFLICT (request_id, provider_id) DO UPDATE SET status=$3",
      [requestId, providerId, status]
    );
  }

  await replaceTable(client, "pending_registrations", normalized.pendingRegistrations.map((item) => item.id));
  for (const registration of normalized.pendingRegistrations) {
    await client.query(
      `INSERT INTO pending_registrations (id, name, business_name, phone, email, role, delivery_channel, otp_hash, attempts, last_sent_at, expires_at, payload, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,COALESCE($13, now()))
       ON CONFLICT (id) DO UPDATE SET name=$2,business_name=$3,phone=$4,email=$5,role=$6,delivery_channel=$7,otp_hash=$8,attempts=$9,last_sent_at=$10,expires_at=$11,payload=$12::jsonb`,
      [registration.id, registration.name, registration.businessName, registration.phone, registration.email || null, registration.role, registration.deliveryChannel, registration.otpHash, Number(registration.attempts || 0), numberOrNull(registration.lastSentAt), numberOrNull(registration.expiresAt), json(registration, {}), dateOrNull(registration.createdAt)]
    );
  }

  await replaceTable(client, "otp_messages", normalized.otpMessages.map((item) => item.id));
  for (const message of normalized.otpMessages) {
    await client.query(
      `INSERT INTO otp_messages (id, registration_id, phone, masked_phone, delivery_channel, provider, code, status, verified_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10, now()))
       ON CONFLICT (id) DO UPDATE SET registration_id=$2,phone=$3,masked_phone=$4,delivery_channel=$5,provider=$6,code=$7,status=$8,verified_at=$9`,
      [message.id, message.registrationId, message.phone, message.maskedPhone, message.deliveryChannel, message.provider, message.code, message.status, dateOrNull(message.verifiedAt), dateOrNull(message.createdAt)]
    );
  }

  await replaceTable(client, "sessions", normalized.sessions.map((item) => item.token), "token");
  for (const session of normalized.sessions) {
    await client.query(
      "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES ($1,$2,COALESCE($3, now()),$4) ON CONFLICT (token) DO UPDATE SET user_id=$2,expires_at=$4",
      [session.token, session.userId, dateOrNull(session.createdAt), Number(session.expiresAt)]
    );
  }

  await replaceTable(client, "categories", normalized.categories, "category");
  for (const category of normalized.categories) {
    await client.query("INSERT INTO categories (category) VALUES ($1) ON CONFLICT (category) DO NOTHING", [category]);
  }

  await replaceTable(client, "notifications", normalized.notifications.map((item) => item.id));
  for (const notification of normalized.notifications) {
    await client.query(
      `INSERT INTO notifications (id, text, type, read, created_at)
       VALUES ($1,$2,$3,$4,COALESCE($5, now()))
       ON CONFLICT (id) DO UPDATE SET text=$2,type=$3,read=$4`,
      [notification.id, notification.text, notification.type || "activity", Boolean(notification.read), dateOrNull(notification.createdAt)]
    );
  }

  await replaceTable(client, "audit_log", normalized.auditLog.map((item) => item.id));
  for (const audit of normalized.auditLog) {
    await client.query(
      `INSERT INTO audit_log (id, action, payload, created_at)
       VALUES ($1,$2,$3::jsonb,COALESCE($4, now()))
       ON CONFLICT (id) DO UPDATE SET action=$2,payload=$3::jsonb`,
      [audit.id, audit.action, json(audit.payload, {}), dateOrNull(audit.createdAt)]
    );
  }

  for (const key of ["activeRequestId", "session", "authError", "selectedOffer"]) {
    await client.query(
      "INSERT INTO app_state (key, payload) VALUES ($1,$2::jsonb) ON CONFLICT (key) DO UPDATE SET payload=$2::jsonb, updated_at=now()",
      [key, json(normalized[key] ?? null, null)]
    );
  }

  return normalized;
}

async function writeDbToStorage(data) {
  if (!postgresEnabled) return writeJsonDb(data);
  await ensurePostgresDb();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(981877)");
    const next = await writePostgresDb(client, data);
    await client.query("COMMIT");
    return next;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function readDb() {
  if (!postgresEnabled) return readJsonDb();
  return readPostgresDb();
}

export async function writeDb(data) {
  return writeDbToStorage(data);
}

export async function updateDb(updater) {
  updateQueue = updateQueue.then(async () => {
    if (!postgresEnabled) {
      const current = await readJsonDb();
      const next = await updater(current);
      return writeJsonDb(next);
    }

    await ensurePostgresDb();
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(981877)");
      const current = await readPostgresDb(client);
      const next = await updater(current);
      const saved = await writePostgresDb(client, next);
      await client.query("COMMIT");
      return saved;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });
  return updateQueue;
}

export async function resetDb() {
  return writeDb(cloneSeed());
}

export function databaseInfo() {
  return {
    client: postgresEnabled ? "postgres" : "json",
    productionReady: postgresEnabled,
    relationalSchema: postgresEnabled,
    jsonFallbackPath: postgresEnabled ? undefined : dbPath,
    postgres: postgresEnabled
      ? {
          configured: Boolean(process.env.DATABASE_URL),
          poolMax: Number(process.env.DB_POOL_MAX || 20),
          ssl: process.env.DB_SSL === "true"
        }
      : undefined
  };
}

export async function backupCorruptDb() {
  await mkdir(dataDir, { recursive: true });
  try {
    await copyFile(dbPath, `${dbPath}.corrupt-${Date.now()}`);
  } catch {
    // No existing file to back up.
  }
}

export function appendAudit(data, action, payload = {}) {
  data.auditLog = [
    {
      id: `AUD-${Date.now()}`,
      action,
      payload,
      createdAt: new Date().toISOString()
    },
    ...(data.auditLog || [])
  ].slice(0, 200);
}

export function addNotification(data, text, type = "activity") {
  data.notifications = [
    { id: `NTF-${Date.now()}`, text, type, read: false, createdAt: new Date().toISOString() },
    ...(data.notifications || [])
  ].slice(0, 30);
}
