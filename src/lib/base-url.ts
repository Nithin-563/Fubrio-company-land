
import { NextRequest } from "next/server";

export function getBaseUrl(req?: NextRequest | null): string {
  if (req) {
    const forwardedHost = req.headers.get("x-forwarded-host");
    const host = req.headers.get("host");
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    const actualHost = forwardedHost || host;
    if (actualHost) {
      return `${forwardedProto}://${actualHost}`;
    }
  }
  return process.env.NEXTAUTH_URL || "https://fubrio.in";
}
