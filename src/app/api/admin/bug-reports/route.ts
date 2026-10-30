import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";

function rowToJson(r: any) {
  return {
    id: r.id,
    type: r.type,
    projectName: r.project_name,
    projectId: r.project_id,
    body: r.body,
    email: r.email,
    userAgent: r.user_agent,
    pageUrl: r.page_url,
    status: r.status,
    adminNotes: r.admin_notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "bugReports", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");
    const typeFilter = url.searchParams.get("type");

    let q = supabase
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
    if (typeFilter && typeFilter !== "all") q = q.eq("type", typeFilter);

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json({ ok: true, data: (data ?? []).map(rowToJson) });
  } catch (err) {
    console.error("[Fubrio] Admin bug-reports GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "bugReports", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { id, status, adminNotes } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const update: any = {};
    if (status) {
      if (!["NEW", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "WONT_FIX"].includes(status)) {
        return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
      }
      update.status = status;
    }
    if (adminNotes !== undefined) update.admin_notes = adminNotes;

    const { data, error } = await supabase
      .from("bug_reports")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, data: rowToJson(data) });
  } catch (err) {
    console.error("[Fubrio] Admin bug-reports PUT error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "bugReports", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from("bug_reports").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Admin bug-reports DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
