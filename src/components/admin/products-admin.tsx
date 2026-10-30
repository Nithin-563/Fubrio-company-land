"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CrudTable, Field, StatusBadge } from "@/components/admin/crud-table";
import { ImageUpload } from "@/components/admin/image-upload";
import type { SerializedProduct, SerializedCategory } from "@/lib/types";

interface Props {
  categories: SerializedCategory[];
}

export function ProductsAdmin({ categories }: Props) {
  return (
    <CrudTable<SerializedProduct>
      title="Products"
      desc="Digital products marketplace."
      endpoint="/api/admin/products"
      section="products"
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
                <div className="text-xs text-muted-foreground">v{r.version ?? "1.0.0"}</div>
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
          key: "price",
          label: "Price",
          render: (r) => r.isFree ? <Badge variant="secondary" className="text-[10px]">Free</Badge> : <span className="font-mono">${r.price}</span>,
        },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
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

          <Field label="Slug (optional)">
            <Input value={value.slug ?? ""} onChange={(e) => onChange({ slug: e.target.value })} />
          </Field>
          <Field label="Category">
            <Select value={value.categoryId ?? "none"} onValueChange={(v) => onChange({ categoryId: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Short description">
            <Input value={value.shortDesc ?? ""} onChange={(e) => onChange({ shortDesc: e.target.value })} />
          </Field>
          <Field label="Version">
            <Input value={value.version ?? ""} onChange={(e) => onChange({ version: e.target.value })} placeholder="1.0.0" />
          </Field>
          <Field label="Price (USD)">
            <Input type="number" step="0.01" value={value.price ?? 0} onChange={(e) => onChange({ price: Number(e.target.value) })} />
          </Field>
          <Field label="Demo URL">
            <Input value={value.demoUrl ?? ""} onChange={(e) => onChange({ demoUrl: e.target.value })} />
          </Field>
          <Field label="Download URL (for free products)">
            <Input
              value={(value as any).downloadUrl ?? ""}
              onChange={(e) => onChange({ downloadUrl: e.target.value } as any)}
              placeholder="https://... (leave blank to hide download button)"
            />
          </Field>
          <Field label="Purchase URL (for paid products)">
            <Input
              value={(value as any).purchaseUrl ?? ""}
              onChange={(e) => onChange({ purchaseUrl: e.target.value } as any)}
              placeholder="https://... (leave blank to hide purchase button)"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Full description">
              <Textarea value={value.fullDesc ?? ""} onChange={(e) => onChange({ fullDesc: e.target.value })} rows={4} />
            </Field>
          </div>
          <Field label="Features (comma-separated)">
            <Input
              value={Array.isArray(value.features) ? value.features.join(", ") : ""}
              onChange={(e) => onChange({ features: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </Field>
          <Field label="Documentation URL">
            <Input value={value.documentation ?? ""} onChange={(e) => onChange({ documentation: e.target.value })} />
          </Field>
          <Field label="Cover image">
            <ImageUpload value={value.coverImage ?? ""} onChange={(url) => onChange({ coverImage: url })} />
          </Field>
          <div className="sm:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.isFree ?? false} onCheckedChange={(v) => onChange({ isFree: v === true })} />
              Free product
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.featured ?? false} onCheckedChange={(v) => onChange({ featured: v === true })} />
              Featured
            </label>
          </div>
        </div>
      )}
    />
  );
}
