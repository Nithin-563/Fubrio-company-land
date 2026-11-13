"use client";

import { ArrowLeft, ArrowUpRight, Github, Share2 } from "lucide-react";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import { Meta } from "@/components/site/editorial";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";
import { SafeDate } from "@/components/shared/safe-date";
import type { SerializedProject } from "@/lib/types";

interface Props {
  project: SerializedProject;
  related: SerializedProject[];
}

export function ProjectDetail({ project, related }: Props) {
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: project.title, text: project.shortDesc ?? "", url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <article className="min-h-screen py-10">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("#showcase")}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Showcase
        </button>

        {/* Header: title on the left, the facts on the right */}
        <header className="grid gap-8 border-b border-border pb-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-x-3">
              <Meta>{project.category?.name ?? "Project"}</Meta>
              <Meta>{project.status}</Meta>
              {project.featured && <Meta className="text-[var(--fubrio-accent)]">Featured</Meta>}
            </div>

            <h1 className="display-heading mt-3 text-[2.6rem] leading-[1.02] sm:text-[3.6rem]">{project.title}</h1>

            {project.shortDesc && (
              <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground">
                {project.shortDesc}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-ink">
                  Visit the live site <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-line">
                  <Github className="h-4 w-4" /> Source
                </a>
              )}
              <button onClick={share} className="link-arrow text-muted-foreground">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <dl className="space-y-2.5 border-t border-border pt-3 lg:border-t-0 lg:pt-0">
              {project.client && <Fact label="Client" value={project.client} />}
              {project.category && <Fact label="Category" value={project.category.name} />}
              {project.launchDate && (
                <Fact
                  label="Launched"
                  value={
                    <span suppressHydrationWarning>
                      <SafeDate date={project.launchDate} options={{ month: "long", year: "numeric" }} />
                    </span>
                  }
                />
              )}
              {project.publishedAt && (
                <Fact
                  label="Updated"
                  value={
                    <span suppressHydrationWarning>
                      <SafeDate date={project.publishedAt} options={{ month: "long", day: "numeric", year: "numeric" }} />
                    </span>
                  }
                />
              )}
              {project.technologies.length > 0 && (
                <div className="border-t border-border pt-2.5">
                  <dt className="eyebrow">Built with</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {project.technologies.map((t) => (
                      <Meta key={t}>{t}</Meta>
                    ))}
                  </dd>
                </div>
              )}
              {project.tags.length > 0 && (
                <div className="border-t border-border pt-2.5">
                  <dt className="eyebrow">Tags</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {project.tags.map((t) => (
                      <Meta key={t.id}>{t.name}</Meta>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </header>

        {usableImage(project.coverImage) && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden border border-border bg-muted">
            <img
              src={project.coverImage as string}
              alt={project.title}
              width={1600}
              height={900}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-10 lg:col-span-8">
            {project.fullDesc && (
              <section>
                <h2 className="font-display text-[1.9rem] leading-tight">The brief</h2>
                <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-[1.75] text-foreground/85">
                  {project.fullDesc}
                </p>
              </section>
            )}

            {project.gallery.length > 0 && (
              <section>
                <h2 className="font-display text-[1.9rem] leading-tight">Screens</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {project.gallery.map((g, i) => (
                    <div key={i} className="relative aspect-[4/3] overflow-hidden border border-border bg-muted">
                      <img
                        src={g}
                        alt={`${project.title} screen ${i + 1}`}
                        width={800}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {project.contributors.length > 0 && (
              <section>
                <h2 className="font-display text-[1.9rem] leading-tight">Who made it</h2>
                <ul className="mt-3 ruled-list border-t border-border">
                  {project.contributors.map((c, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-3">
                      <span className="text-[0.9375rem]">{c.name}</span>
                      <Meta>{c.role}</Meta>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="border border-border p-5">
              <div className="eyebrow border-b border-border pb-2">Next step</div>
              <p className="mt-3 text-[0.9375rem] leading-relaxed">
                Building something in this neighbourhood? We can usually tell you within a day whether
                we are the right fit.
              </p>
              <button onClick={() => navigate("#contact")} className="btn-ink mt-4 w-full">
                Start a similar project
              </button>
              {(project.downloadUrl || project.purchaseUrl) && (
                <div className="mt-3 space-y-1.5">
                  {project.downloadUrl && (
                    <a
                      href={project.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Download the release
                    </a>
                  )}
                  {project.purchaseUrl && (
                    <a
                      href={project.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Buy a licence
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-baseline justify-between border-t border-border pt-5">
              <span className="eyebrow">Nearby</span>
              <Meta>{related.length} more</Meta>
            </div>

            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`#showcase/${p.slug}`)}
                  className="group text-left"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border border-border bg-muted">
                    {usableImage(p.coverImage) ? (
                      <img
                        src={p.coverImage as string}
                        alt={p.title}
                        width={800}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <GradientPlaceholder seed={p.title} label={p.category?.name} className="absolute inset-0" size="md" />
                    )}
                  </div>
                  <h3 className="mt-2.5 font-display text-[1.25rem] leading-snug transition-colors group-hover:text-[var(--fubrio-accent)]">
                    {p.title}
                  </h3>
                  <Meta>{p.category?.name ?? p.status}</Meta>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-right text-[13px]">{value}</dd>
    </div>
  );
}
