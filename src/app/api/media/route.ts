import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/types";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    if (!can((session.user as { role: string }).role, "media.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const alt = (form.get("alt") as string | null) ?? "";
    const folder = (form.get("folder") as string | null) ?? "uploads";
    if (!file) return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });

    const allowedTypes = [
      "image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type) && file.type !== "") {
      return NextResponse.json({ ok: false, error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "File too large (max 8MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const safeName = `${uuid()}.${ext}`;
    const filePath = `${folder}/${safeName}`;

    let publicUrl: string | null = null;
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, buffer, {
          contentType: file.type || "image/png",
          upsert: false,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          publicUrl = urlData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.error("[Fubrio] Supabase Storage upload failed:", storageErr);
    }

    if (!publicUrl) {
      const base64 = buffer.toString("base64");
      publicUrl = `data:${file.type || "image/png"};base64,${base64}`;
    }

    let asset;
    try {
      asset = await db.mediaAsset.create({
        data: {
          name: file.name,
          url: publicUrl,
          type: "image",
          mime: file.type || "image/png",
          size: buffer.length,
          alt,
          folder,
          tags: "[]",
        },
      });
    } catch {
      asset = { url: publicUrl };
    }

    return NextResponse.json({ ok: true, asset });
  } catch (err) {
    console.error("[Fubrio] Media upload error:", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
