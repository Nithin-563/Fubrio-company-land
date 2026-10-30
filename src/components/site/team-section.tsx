"use client";

import { Users, Linkedin, Mail, Globe, ArrowUpRight } from "lucide-react";
import { navigate } from "@/lib/router";

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
    <section className="py-24 sm:py-32" id="team">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center justify-center gap-2">
            <Users className="h-3.5 w-3.5" />
            Our Team
          </div>
          <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
            The people behind Fubrio.
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            A distributed team of engineers, designers, and creators building the future of digital experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {members.map((m) => (
            <div
              key={m.id}
              className="group relative rounded-3xl glass-card p-6 transition-all hover:-translate-y-1"
            >
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--fubrio-accent)]/30 to-transparent blur-xl group-hover:blur-2xl transition-all" />
                {m.photo ? (
                   
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="relative w-24 h-24 rounded-full object-cover border-2 border-[var(--fubrio-accent)]/30"
                  />
                ) : (
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-muted border-2 border-[var(--fubrio-accent)]/30 flex items-center justify-center text-2xl font-display font-semibold">
                    {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className="font-display text-lg font-semibold">{m.name}</h3>
                <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-medium mt-1">
                  {m.role}
                </div>
                {m.bio && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{m.bio}</p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                {m.linkedin && (
                  <a
                    href={m.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full glass-card hover:border-[var(--fubrio-accent)]/40 transition-colors"
                    aria-label={`${m.name} on LinkedIn`}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full glass-card hover:border-[var(--fubrio-accent)]/40 transition-colors"
                    aria-label={`Email ${m.name}`}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                )}
                {m.website && (
                  <a
                    href={m.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full glass-card hover:border-[var(--fubrio-accent)]/40 transition-colors"
                    aria-label={`${m.name}'s website`}
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("#contact")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors group"
          >
            Join our team
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
