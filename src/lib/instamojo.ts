
const DEFAULT_ENDPOINT = "https://www.instamojo.com/api/1.1/";

function getCredentials() {
  return {
    apiKey: process.env.INSTAMOJO_API_KEY || "",
    authToken: process.env.INSTAMOJO_AUTH_TOKEN || "",
    endpoint: process.env.INSTAMOJO_ENDPOINT || DEFAULT_ENDPOINT,
  };
}

export function isInstamojoConfigured(): boolean {
  const { apiKey, authToken } = getCredentials();
  return !!(apiKey && authToken);
}

export interface CreatePaymentRequestInput {
  amount: number;             // in INR
  purpose: string;             // e.g. "Fubrio Pro - Monthly"
  buyerName: string;
  email: string;
  phone?: string;
  redirectUrl: string;         // where to send the user after payment
  webhookUrl: string;          // server-side webhook (primary verification)
}

export interface CreatePaymentRequestResult {
  ok: boolean;
  paymentRequestId?: string;
  paymentUrl?: string;
  error?: string;
}

export async function createPaymentRequest(input: CreatePaymentRequestInput): Promise<CreatePaymentRequestResult> {
  const { apiKey, authToken, endpoint } = getCredentials();
  if (!apiKey || !authToken) {
    return { ok: false, error: "Instamojo not configured. Set INSTAMOJO_API_KEY and INSTAMOJO_AUTH_TOKEN env vars." };
  }

  try {
    const res = await fetch(`${endpoint}payment-requests/`, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "X-Auth-Token": authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(input.amount),
        purpose: input.purpose.slice(0, 100),
        buyer_name: input.buyerName.slice(0, 100),
        email: input.email,
        phone: input.phone || "",
        redirect_url: input.redirectUrl,
        webhook_url: input.webhookUrl,
        allow_repeated_payments: "false",
        send_email: "true",
      }),
    });

    const data = await res.json();

    if (!data.success) {
      console.error("[Fubrio] Instamojo create-payment failed:", data);
      return {
        ok: false,
        error: data.message || "Failed to create payment request",
      };
    }

    const pr = data.payment_request;
    return {
      ok: true,
      paymentRequestId: pr.id,
      paymentUrl: pr.longurl,
    };
  } catch (err: any) {
    console.error("[Fubrio] Instamojo create-payment exception:", err?.message ?? err);
    return { ok: false, error: "Network error reaching Instamojo" };
  }
}

export interface VerifyPaymentResult {
  ok: boolean;
  paymentStatus: "pending" | "paid" | "failed" | "unknown";
  paymentId?: string;
  amount?: number;
  buyerEmail?: string;
  buyerName?: string;
  error?: string;
}

export async function verifyPaymentRequest(paymentRequestId: string): Promise<VerifyPaymentResult> {
  const { apiKey, authToken, endpoint } = getCredentials();
  if (!apiKey || !authToken) {
    return { ok: false, paymentStatus: "unknown", error: "Instamojo not configured" };
  }

  try {
    const res = await fetch(`${endpoint}payment-requests/${paymentRequestId}/`, {
      headers: {
        "X-Api-Key": apiKey,
        "X-Auth-Token": authToken,
      },
    });

    const data = await res.json();

    if (!data.success) {
      return { ok: false, paymentStatus: "unknown", error: data.message || "Verification failed" };
    }

    const pr = data.payment_request;
    const payments = pr.payments || [];
    const paid = payments.find((p: any) => p.payment_status === "Credit" && p.payment_status !== "Failed");
    if (paid) {
      return {
        ok: true,
        paymentStatus: "paid",
        paymentId: paid.payment_id,
        amount: Number(pr.amount),
        buyerEmail: pr.email,
        buyerName: pr.buyer_name,
      };
    }
    if (pr.status === "Credit") {
      return {
        ok: true,
        paymentStatus: "paid",
        paymentId: payments[0]?.payment_id,
        amount: Number(pr.amount),
        buyerEmail: pr.email,
        buyerName: pr.buyer_name,
      };
    }
    if (pr.status === "Failed") {
      return { ok: true, paymentStatus: "failed" };
    }
    return { ok: true, paymentStatus: "pending" };
  } catch (err: any) {
    console.error("[Fubrio] Instamojo verify exception:", err?.message ?? err);
    return { ok: false, paymentStatus: "unknown", error: "Network error reaching Instamojo" };
  }
}
