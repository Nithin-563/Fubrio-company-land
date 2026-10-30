"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CrudTable, Field } from "@/components/admin/crud-table";
import { ImageUpload } from "@/components/admin/image-upload";
import type { SerializedCategory } from "@/lib/types";

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
  published: boolean;
}

export function TeamAdmin({ categories: _ }: { categories: SerializedCategory[] }) {
  return (
    <CrudTable<TeamMember>
      title="Team Members"
      desc="Manage your team - founders, co-founders, executives, and key people."
      endpoint="/api/admin/team"
      section="team"
      perm="content.manage"
      searchKeys={["name", "role"]}
      labelFor={(r) => r.name}
      canReorder
      columns={[
        {
          key: "name",
          label: "Name",
          render: (r) => (
            <div className="flex items-center gap-3">
              {r.photo ? (
                <img src={r.photo} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/20 flex items-center justify-center text-xs font-semibold text-[var(--fubrio-accent)]">
                  {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
              )}
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.role}</div>
              </div>
            </div>
          ),
        },
        { key: "published", label: "Status", render: (r) => r.published ? <span className="text-xs text-[var(--fubrio-accent)]">Published</span> : <span className="text-xs text-muted-foreground">Hidden</span> },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name *">
            <Input value={value.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>
          <Field label="Role *">
            <Input value={value.role ?? ""} onChange={(e) => onChange({ role: e.target.value })} placeholder="Founder, CEO, CTO, etc." />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bio">
              <Textarea value={value.bio ?? ""} onChange={(e) => onChange({ bio: e.target.value })} rows={3} placeholder="Short bio about this person" />
            </Field>
          </div>
          <Field label="Photo">
            <ImageUpload value={value.photo ?? ""} onChange={(url) => onChange({ photo: url })} />
          </Field>
          <div className="space-y-4">
            <Field label="Email">
              <Input type="email" value={value.email ?? ""} onChange={(e) => onChange({ email: e.target.value })} placeholder="name@fubrio.in" />
            </Field>
            <Field label="LinkedIn URL">
              <Input value={value.linkedin ?? ""} onChange={(e) => onChange({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
            </Field>
            <Field label="Website (optional)">
              <Input value={value.website ?? ""} onChange={(e) => onChange({ website: e.target.value })} placeholder="https://..." />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.published ?? true} onCheckedChange={(v) => onChange({ published: v === true })} />
              Published (visible on website)
            </label>
          </div>
        </div>
      )}
    />
  );
}
