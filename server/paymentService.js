export function paymentReadiness() {
  const mode = process.env.PAYMENT_GATEWAY_MODE || "held";
  return {
    status: mode === "held" ? "held" : "configured",
    mode,
    ready:
      mode === "bank_webhook" &&
      Boolean(process.env.PAYMENT_WEBHOOK_URL && process.env.PAYMENT_MERCHANT_ID)
  };
}

export async function capturePayment(payment) {
  const readiness = paymentReadiness();
  if (!readiness.ready) {
    const error = new Error("Payment gateway is not connected yet.");
    error.status = 503;
    error.code = "PAYMENT_GATEWAY_HELD";
    throw error;
  }

  const response = await fetch(process.env.PAYMENT_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.PAYMENT_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.PAYMENT_WEBHOOK_SECRET}` } : {})
    },
    body: JSON.stringify({
      merchantId: process.env.PAYMENT_MERCHANT_ID,
      paymentId: payment.id,
      requestId: payment.requestId,
      amount: payment.amount,
      providerId: payment.providerId,
      customer: payment.customer
    })
  });

  if (!response.ok) {
    const error = new Error("Payment gateway rejected the transaction.");
    error.status = 502;
    throw error;
  }

  return response.json().catch(() => ({ ok: true }));
}
