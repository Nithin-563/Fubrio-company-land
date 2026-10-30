"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CrudTable, Field, StatusBadge } from "@/components/admin/crud-table";
import { ImageUpload } from "@/components/admin/image-upload";
import type { SerializedProject, SerializedCategory } from "@/lib/types";

interface Props {
  categories: SerializedCategory[];
}

export function ProjectsAdmin({ categories }: Props) {
  return (
    <CrudTable<SerializedProject>
      title="Showcase projects"
      desc="Manage projects in the Fubrio showcase. Edit, feature, and publish projects."
      endpoint="/api/admin/projects"
      section="projects"
      perm="content.manage"
      searchKeys={["title", "shortDesc"]}
      labelFor={(r) => r.title}
      canReorder
      columns={[
        {
          key: "title",
          label: "Title",
          render: (r) => (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/20 flex items-center justify-center text-xs font-semibold text-[var(--fubrio-accent)] flex-shrink-0">
                {r.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">/{r.slug}</div>
              </div>
            </div>
          ),
        },
        {
          key: "category",
          label: "Category",
          render: (r) => r.category?.name ?? <span className="text-muted-foreground">-</span>,
        },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
        },
        {
          key: "featured",
          label: "Featured",
          render: (r) => (r.featured ? <Badge variant="secondary" className="text-[10px]">Featured</Badge> : <span className="text-muted-foreground">-</span>),
        },
        {
          key: "createdAt",
          label: "Created",
          render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>,
        },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title">
            <Input value={value.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Brand">
            <select
              value={(value as any).brand ?? "fubrio"}
              onChange={(e) => onChange({ brand: e.target.value } as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="fubrio">Fubrio</option>
              <option value="bloom">Bloom</option>
              <option value="both">Both</option>
            </select>
          </Field>

          <Field label="Slug (optional)" hint="Auto-generated from title if empty">
            <Input value={value.slug ?? ""} onChange={(e) => onChange({ slug: e.target.value })} />
          </Field>
          <Field label="Category">
            <Select value={value.categoryId ?? "none"} onValueChange={(v) => onChange({ categoryId: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={value.status ?? "DRAFT"} onValueChange={(v) => onChange({ status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Short description">
            <Input value={value.shortDesc ?? ""} onChange={(e) => onChange({ shortDesc: e.target.value })} />
          </Field>
          <Field label="Client (optional)">
            <Input value={value.client ?? ""} onChange={(e) => onChange({ client: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Full description">
              <Textarea value={value.fullDesc ?? ""} onChange={(e) => onChange({ fullDesc: e.target.value })} rows={4} />
            </Field>
          </div>
          <Field label="Cover image">
            <ImageUpload value={value.coverImage ?? ""} onChange={(url) => onChange({ coverImage: url })} />
          </Field>
          <Field label="Thumbnail">
            <ImageUpload value={value.thumbnail ?? ""} onChange={(url) => onChange({ thumbnail: url })} />
          </Field>
          <Field label="Demo URL">
            <Input value={value.demoUrl ?? ""} onChange={(e) => onChange({ demoUrl: e.target.value })} />
          </Field>
          <Field label="GitHub URL">
            <Input value={value.githubUrl ?? ""} onChange={(e) => onChange({ githubUrl: e.target.value })} />
          </Field>
          <Field label="Technologies (comma-separated)">
            <Input
              value={Array.isArray(value.technologies) ? value.technologies.join(", ") : String(value.technologies ?? "")}
              onChange={(e) => onChange({ technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Next.js, TypeScript, …"
            />
          </Field>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.featured ?? false} onCheckedChange={(v) => onChange({ featured: v === true })} />
              Featured project
            </label>
          </div>
        </div>
      )}
    />
  );
}
