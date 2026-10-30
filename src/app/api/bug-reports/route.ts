import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";
import { hasTriggeredHoneypot } from "@/lib/security";

const schema = z.object({
  type: z.enum(["bug", "suggestion"]),
  projectName: z.string().min(1, "Project name is required").max(200),
  projectId: z.string().max(120).optional().nullable(),
  body: z.string().min(5, "Please describe the bug/suggestion (min 5 chars)").max(10000),
  email: z.string().email("A valid email is required").max(200),
  userAgent: z.string().max(2000).optional().nullable(),
  pageUrl: z.string().max(2000).optional().nullable(),
  website: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (hasTriggeredHoneypot(body)) {
      return NextResponse.json({ ok: true, id: "BR-SPAM" });
    }

    if (!body.userAgent) {
      const ua = req.headers.get("user-agent") || "";
      body.userAgent = ua.slice(0, 500);
    } else if (typeof body.userAgent === "string") {
      body.userAgent = body.userAgent.slice(0, 500);
    }
    if (!body.pageUrl) {
      const ref = req.headers.get("referer") || req.headers.get("origin") || "";
      body.pageUrl = ref.slice(0, 500);
    } else if (typeof body.pageUrl === "string") {
      body.pageUrl = body.pageUrl.slice(0, 500);
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
      return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
    }

    const d = parsed.data;

    const { data: insertData, error: insertError } = await supabase
      .from("bug_reports")
      .insert({
        type: d.type,
        project_name: d.projectName,
        project_id: d.projectId || null,
        body: d.body,
        email: d.email.toLowerCase(),
        user_agent: d.userAgent || null,
        page_url: d.pageUrl || null,
        status: "NEW",
      })
      .select();

    if (insertError) {
      console.error("[Fubrio] Bug report insert error:", insertError);
      return NextResponse.json(
        { ok: false, error: `Failed to save report: ${insertError.message}` },
        { status: 500 },
      );
    }

    const reportId = insertData?.[0]?.id ?? null;

    try {
      await createNotification({
        type: "bug_report",
        title: `New ${d.type === "bug" ? "bug report" : "suggestion"}: ${d.projectName}`,
        body: d.body.slice(0, 200),
        link: "#admin/bugReports",
        sourceId: reportId,
      });
    } catch (notifErr) {
      console.warn("[Fubrio] Failed to create notification for bug report:", notifErr);
    }

    return NextResponse.json({
      ok: true,
      id: reportId,
      message: d.type === "bug"
        ? "Bug report submitted - thank you! Our team will investigate."
        : "Suggestion submitted - thank you for the feedback!",
    });
  } catch (err: any) {
    console.error("[Fubrio] Bug report submission error:", err);
    const msg = err?.message || (typeof err === "string" ? err : "Something went wrong");
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "Fubrio bug reports API" });
}
