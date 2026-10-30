import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug, getRelatedProjects } from "@/lib/content";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const related = await getRelatedProjects(project.id, project.category?.id ?? null, 3);
  return NextResponse.json({ ok: true, project, related });
}
