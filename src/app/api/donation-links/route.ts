import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("donation_links")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      label: r.label,
      url: r.url,
      icon: r.icon,
      description: r.description,
      order: r.order,
      active: r.active,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Public donation-links GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}
