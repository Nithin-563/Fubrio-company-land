"use client";

import { ArrowLeft, ArrowUpRight, Github, ExternalLink, Download, ShoppingCart, Calendar, User, Tag, Share2, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import type { SerializedProject } from "@/lib/types";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";
import { SafeDate } from "@/components/shared/safe-date";

interface Props {
  project: SerializedProject;
  related: SerializedProject[];
}

export function ProjectDetail({ project, related }: Props) {
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: project.title, text: project.shortDesc ?? "", url: window.location.href }); } catch { /* ignore */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <article className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#showcase")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to showcase
        </button>

        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-8">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {project.category && <span>{project.category.name}</span>}
              <span>·</span>
              <span>{project.status}</span>
              {project.featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
            </div>
            <h1 className="display-heading text-4xl sm:text-5xl lg:text-6xl">{project.title}</h1>
            {project.shortDesc && <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl">{project.shortDesc}</p>}
          </div>
          <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end">
            {project.demoUrl && (
              <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1.5" /> Live demo
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline" className="rounded-full">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-1.5" /> Code
                </a>
              </Button>
            )}
            <Button variant="ghost" onClick={share} className="rounded-full">
              <Share2 className="h-4 w-4 mr-1.5" /> Share
            </Button>
          </div>
        </header>

        {project.coverImage && (
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-border mb-12">
            { }
            <img src={project.coverImage} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {project.fullDesc && (
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Overview</h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{project.fullDesc}</p>
              </section>
            )}

            {project.gallery.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 gap-3">
                  {project.gallery.map((g, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border">
                      { }
                      <img src={g} alt={`${project.title} ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {project.technologies.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Technology stack</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <Badge key={t} variant="outline" className="rounded-full">{t}</Badge>
                  ))}
                </div>
              </section>
            )}

            {project.contributors.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Contributors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.contributors.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-sm font-semibold">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display font-semibold mb-4">Project details</h3>
              <dl className="space-y-3 text-sm">
                {project.category && (
                  <Detail icon={<Boxes className="h-3.5 w-3.5" />} label="Category" value={project.category.name} />
                )}
                {project.client && (
                  <Detail icon={<User className="h-3.5 w-3.5" />} label="Client" value={project.client} />
                )}
                {project.launchDate && (
                  <Detail icon={<Calendar className="h-3.5 w-3.5" />} label="Launched" value={<SafeDate date={project.launchDate} options={{ month: "long", year: "numeric" }} />} />
                )}
                {project.publishedAt && (
                  <Detail icon={<Calendar className="h-3.5 w-3.5" />} label="Updated" value={<SafeDate date={project.publishedAt} options={{ month: "long", day: "numeric", year: "numeric" }} />} />
                )}
                {project.tags.length > 0 && (
                  <div className="pt-2">
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Tag className="h-3.5 w-3.5" /> Tags
                    </dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {project.tags.map((t) => (
                        <Badge key={t.id} variant="outline" className="text-[10px]">{t.name}</Badge>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
              {project.demoUrl && (
                <Button asChild className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1.5" /> Visit live
                  </a>
                </Button>
              )}
              {project.githubUrl && (
                <Button asChild variant="outline" className="w-full rounded-full">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-1.5" /> View source
                  </a>
                </Button>
              )}
              {project.downloadUrl && (
                <Button asChild variant="outline" className="w-full rounded-full">
                  <a href={project.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-1.5" /> Download
                  </a>
                </Button>
              )}
              {project.purchaseUrl && (
                <Button asChild variant="outline" className="w-full rounded-full">
                  <a href={project.purchaseUrl} target="_blank" rel="noopener noreferrer">
                    <ShoppingCart className="h-4 w-4 mr-1.5" /> Purchase
                  </a>
                </Button>
              )}
              <Separator className="my-2" />
              <Button onClick={() => navigate("#contact")} variant="ghost" className="w-full rounded-full justify-between">
                Start a similar project
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="display-heading text-3xl mb-6">Related projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`#showcase/${p.slug}`)}
                  className="group relative rounded-2xl overflow-hidden border border-border bg-card text-left"
                >
                  <div className="aspect-[16/11] relative overflow-hidden">
                    {usableImage(p.coverImage) ? (
                       
                      <img src={p.coverImage} alt={p.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <GradientPlaceholder seed={p.title} label={p.category?.name} className="absolute inset-0" size="md" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <h3 className="text-base font-semibold text-white line-clamp-1">{p.title}</h3>
                      <p className="text-xs text-white/70 line-clamp-1">{p.shortDesc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
  );
}
