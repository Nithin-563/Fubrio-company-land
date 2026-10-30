"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CrudTable, Field } from "@/components/admin/crud-table";
import { ImageUpload } from "@/components/admin/image-upload";
import type { SerializedPartner } from "@/lib/types";

const TYPES = ["TECHNOLOGY", "COMMUNITY", "DEVELOPMENT", "MEDIA", "BRAND", "STRATEGIC"];

export function PartnersAdmin() {
  return (
    <CrudTable<SerializedPartner>
      title="Partners"
      desc="Partner management. Manage partner relationships."
      endpoint="/api/admin/partners"
      section="partners"
      perm="content.manage"
      searchKeys={["name"]}
      labelFor={(r) => r.name}
      canReorder
      columns={[
        { key: "name", label: "Name", render: (r) => <div className="font-medium">{r.name}</div> },
        { key: "type", label: "Type", render: (r) => <Badge variant="outline" className="text-[10px]">{r.type}</Badge> },
        { key: "featured", label: "Featured", render: (r) => r.featured ? <Badge variant="secondary" className="text-[10px]">Featured</Badge> : <span className="text-muted-foreground">-</span> },
        { key: "published", label: "Published", render: (r) => r.published ? <Badge variant="secondary" className="text-[10px]">Published</Badge> : <span className="text-muted-foreground">Hidden</span> },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name">
            <Input value={value.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} />
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

          <Field label="Type">
            <Select value={value.type ?? "TECHNOLOGY"} onValueChange={(v) => onChange({ type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Website">
            <Input value={value.website ?? ""} onChange={(e) => onChange({ website: e.target.value })} />
          </Field>
          <Field label="Logo">
            <ImageUpload value={value.logo ?? ""} onChange={(url) => onChange({ logo: url })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea value={value.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} rows={3} />
            </Field>
          </div>
          <div className="sm:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.featured ?? false} onCheckedChange={(v) => onChange({ featured: v === true })} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.published ?? true} onCheckedChange={(v) => onChange({ published: v === true })} />
              Published
            </label>
          </div>
        </div>
      )}
    />
  );
}
