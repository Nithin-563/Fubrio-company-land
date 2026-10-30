import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/types";
import { db } from "@/lib/db";
import { safeAuditLog } from "@/lib/audit";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can((session.user as { role: string }).role, "content.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const rows = await db.email.findMany({ orderBy: [{ createdAt: "desc" }] });
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Email GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can((session.user as { role: string }).role, "content.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const userId = getRealUserId(session);

  const body = await req.json();
  const { fromAddress, toAddress, subject, body: emailBody, replyToId } = body;

  if (!fromAddress || !toAddress || !subject || !emailBody) {
    return NextResponse.json({ ok: false, error: "From, To, Subject, and Body are required" }, { status: 400 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  let sendStatus = "SENT";
  let sendError = null;

  if (RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: toAddress,
          subject,
          text: emailBody,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        sendStatus = "FAILED";
        sendError = json.message || json.error || "Send failed";
      }
    } catch (err) {
      sendStatus = "FAILED";
      sendError = "Network error";
    }
  } else {
    sendStatus = "QUEUED";
  }

  try {
    const email = await db.email.create({
      data: {
        fromAddress,
        toAddress,
        subject,
        body: emailBody,
        status: sendStatus,
        replyToId: replyToId || null,
      },
    });
    await safeAuditLog({ userId, action: "send_email", entity: "email", entityId: email.id, metadata: { to: toAddress, subject } });
    if (sendError) {
      return NextResponse.json({ ok: false, error: sendError, data: email }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data: email });
  } catch (err) {
    console.error("[Fubrio] Email store error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can((session.user as { role: string }).role, "content.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const userId = getRealUserId(session);
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  try {
    await db.email.delete({ where: { id } });
    await safeAuditLog({ userId, action: "delete", entity: "email", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
