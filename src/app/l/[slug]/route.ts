import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const link = await db.shortLink.findUnique({ where: { slug } });
    if (!link || !link.active) {
      return new NextResponse("Not found", { status: 404 });
    }
    if (link.expiresAt && new Date() > link.expiresAt) {
      return new NextResponse("Link expired", { status: 410 });
    }

    try {
      await db.shortLink.update({
        where: { id: link.id },
        data: { visits: { increment: 1 } },
      });
    } catch {
    }

    if (link.type === "redirect" && link.targetUrl) {
      return NextResponse.redirect(link.targetUrl, { status: 302 });
    }

    if (link.type === "file" && link.filePath) {
      const filePath = link.filePath;
      const mime = link.fileMime || "application/octet-stream";
      const fileName = link.fileName || link.slug;

      if (filePath.startsWith("data:")) {
        try {
          const base64Match = filePath.match(/^data:[^;]+;base64,(.+)$/);
          if (base64Match) {
            const buffer = Buffer.from(base64Match[1], "base64");
            const isInline = mime.startsWith("image/") || mime.startsWith("text/") || mime === "application/pdf" || mime.startsWith("video/") || mime.startsWith("audio/");
            return new NextResponse(buffer, {
              status: 200,
              headers: {
                "Content-Type": mime,
                "Content-Length": String(buffer.length),
                "Cache-Control": "public, max-age=3600",
                "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="${encodeURIComponent(fileName)}"`,
              },
            });
          }
        } catch {
          return new NextResponse("Failed to decode file", { status: 500 });
        }
      }

      if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        return NextResponse.redirect(filePath, { status: 302 });
      }

      if (filePath.startsWith("/")) {
        return NextResponse.redirect(filePath, { status: 302 });
      }

      return new NextResponse("File not available", { status: 404 });
    }

    if (link.type === "text") {
      return new NextResponse(link.textContent || "", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (link.type === "embed") {
      const name = (link.name || "Link").replace(/[&<>"']/g, (c: string) =>
        c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;");
      const slugEsc = (link.slug || "").replace(/[&<>"']/g, (c: string) =>
        c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;");
      const embedHtml = link.embedHtml || "";
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${name}</title><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body,html{margin:0;height:100%;background:#0a0a0a;color:#fafafa;font-family:ui-sans-serif,system-ui,sans-serif}.wrap{padding:24px;max-width:920px;margin:0 auto}.head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.1)}h1{font-size:18px;margin:0;font-weight:600}.meta{font-size:12px;color:#888}</style></head><body><div class="wrap"><div class="head"><h1>${name}</h1><div class="meta">fubrio.in/l/${slugEsc}</div></div><div class="embed">${embedHtml}</div></div></body></html>`;
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new NextResponse("Unknown link type", { status: 400 });
  } catch (err) {
    console.error("[Fubrio] Link route error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
