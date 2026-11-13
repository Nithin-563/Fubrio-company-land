"use client";

import { ArrowUpRight } from "lucide-react";
import { navigate } from "@/lib/router";
import { ChapterHead, Meta } from "@/components/site/editorial";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo: string | null;
  email: string | null;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
  order: number;
}

export function TeamSection({ members }: { members: TeamMember[] }) {
  if (!members || members.length === 0) return null;

  return (
    <section className="py-16 sm:py-20" id="team">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <ChapterHead
          index="06"
          label="Studio"
          title="A few people, a lot of tabs open."
          description="No account managers, no handoff layer. The people who scope the work are the people who build it."
          action={
            <button onClick={() => navigate("#contact")} className="link-arrow text-foreground">
              Work with us <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          }
        />

        <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div key={m.id} className="group">
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-muted">
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    width={600}
                    height={750}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover grayscale-[0.35] transition duration-500 group-hover:grayscale-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-[3rem] text-muted-foreground/40">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-2.5">
                <h3 className="font-display text-[1.3rem] leading-tight">{m.name}</h3>
                <Meta className="text-right">{m.role}</Meta>
              </div>

              {m.bio && (
                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                  {m.bio}
                </p>
              )}

              {(m.linkedin || m.email || m.website || m.github || m.twitter) && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Email
                    </a>
                  )}
                  {m.website && (
                    <a
                      href={m.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Site
                    </a>
                  )}
                  {m.github && (
                    <a
                      href={m.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
