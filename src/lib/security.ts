import { createHmac, timingSafeEqual } from "node:crypto";

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function hasTriggeredHoneypot(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  return ["website", "companyWebsite", "company_website", "fax"].some((key) => {
    const value = record[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function getMasterCzerCode(): string {
  return process.env.CZER_CODE?.trim() || "";
}

export function secretsMatch(provided: string | null | undefined, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createChatAccessToken(chatId: string, email: string): string {
  const secret = process.env.CHAT_ACCESS_SECRET || process.env.NEXTAUTH_SECRET || "";
  if (!secret) return "";
  return createHmac("sha256", secret)
    .update(`${chatId}:${email.trim().toLowerCase()}`)
    .digest("base64url");
}

export function verifyChatAccessToken(chatId: string, email: string, token: string | null | undefined): boolean {
  return secretsMatch(token, createChatAccessToken(chatId, email));
}
