import crypto from "node:crypto";

const OTP_SECRET = process.env.OTP_SECRET || "local-development-otp-secret-change-me";
const OTP_TTL_MS = Number(process.env.OTP_TTL_MS || 5 * 60 * 1000);
const OTP_RESEND_COOLDOWN_MS = Number(process.env.OTP_RESEND_COOLDOWN_MS || 60 * 1000);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_DELIVERY_MODE = process.env.OTP_DELIVERY_MODE || "mock";

export function createOtpCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

export function hashOtp(code, registrationId) {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${registrationId}:${code}`)
    .digest("hex");
}

export function verifyOtpHash(code, registrationId, expectedHash) {
  const candidate = hashOtp(String(code || "").trim(), registrationId);
  if (!expectedHash || candidate.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(expectedHash || ""));
}

export function otpExpiresAt() {
  return Date.now() + OTP_TTL_MS;
}

export function canResend(lastSentAt) {
  if (!lastSentAt) return true;
  return Date.now() - Number(lastSentAt) >= OTP_RESEND_COOLDOWN_MS;
}

export function otpPolicy() {
  return {
    ttlMs: OTP_TTL_MS,
    resendCooldownMs: OTP_RESEND_COOLDOWN_MS,
    maxAttempts: OTP_MAX_ATTEMPTS,
    deliveryMode: OTP_DELIVERY_MODE
  };
}

function normalizeWhatsappNumber(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

async function sendWhatsappCloud({ phone, code }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_AUTH_TEMPLATE_NAME;
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";

  if (!token || !phoneNumberId || !templateName) {
    throw new Error("WhatsApp Cloud API credentials are not configured");
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizeWhatsappNumber(phone),
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: code }]
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: code }]
          }
        ]
      }
    })
  });

  if (!response.ok) {
    throw new Error(`WhatsApp delivery failed: ${response.status} ${await response.text()}`);
  }

  return { provider: "whatsapp_cloud", status: "sent", response: await response.json() };
}

async function sendSmsWebhook({ phone, code }) {
  const webhookUrl = process.env.SMS_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("SMS_WEBHOOK_URL is not configured");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: phone,
      message: `Your Baytak verification code is ${code}. It expires in ${Math.ceil(OTP_TTL_MS / 60000)} minutes.`
    })
  });

  if (!response.ok) {
    throw new Error(`SMS delivery failed: ${response.status} ${await response.text()}`);
  }

  return { provider: "sms_webhook", status: "sent" };
}

export async function deliverOtp({ channel, phone, code }) {
  if (OTP_DELIVERY_MODE === "whatsapp_cloud" && channel === "whatsapp") {
    return sendWhatsappCloud({ phone, code });
  }

  if (OTP_DELIVERY_MODE === "sms_webhook" && channel === "sms") {
    return sendSmsWebhook({ phone, code });
  }

  if (OTP_DELIVERY_MODE !== "mock") {
    throw new Error(`OTP delivery mode ${OTP_DELIVERY_MODE} does not support ${channel}`);
  }

  return {
    provider: "mock_outbox",
    status: "queued",
    devCode: code
  };
}
