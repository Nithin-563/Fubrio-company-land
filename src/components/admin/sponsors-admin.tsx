"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CrudTable, Field, StatusBadge } from "@/components/admin/crud-table";
import { ImageUpload } from "@/components/admin/image-upload";
import type { SerializedSponsor } from "@/lib/types";

const TIERS = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];

export function SponsorsAdmin() {
  return (
    <CrudTable<SerializedSponsor>
      title="Sponsors"
      desc="Sponsor management."
      endpoint="/api/admin/sponsors"
      section="sponsors"
      perm="content.manage"
      searchKeys={["name", "industry"]}
      labelFor={(r) => r.name}
      canReorder
      columns={[
        { key: "name", label: "Name", render: (r) => <div className="font-medium">{r.name}</div> },
        { key: "tier", label: "Tier", render: (r) => <StatusBadge status={r.tier} /> },
        { key: "industry", label: "Industry", render: (r) => r.industry ?? <span className="text-muted-foreground">-</span> },
        { key: "active", label: "Active", render: (r) => r.active ? <Badge variant="secondary" className="text-[10px]">Active</Badge> : <span className="text-muted-foreground">Inactive</span> },
        { key: "featured", label: "Featured", render: (r) => r.featured ? <Badge variant="secondary" className="text-[10px]">Featured</Badge> : <span className="text-muted-foreground">-</span> },
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

          <Field label="Tier">
            <Select value={value.tier ?? "BRONZE"} onValueChange={(v) => onChange({ tier: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Industry">
            <Input value={value.industry ?? ""} onChange={(e) => onChange({ industry: e.target.value })} />
          </Field>
          <Field label="Website">
            <Input value={value.website ?? ""} onChange={(e) => onChange({ website: e.target.value })} />
          </Field>
          <Field label="Logo">
            <ImageUpload value={value.logo ?? ""} onChange={(url) => onChange({ logo: url })} />
          </Field>
          <Field label="Contact name">
            <Input value={(value as any).contactName ?? ""} onChange={(e) => onChange({ contactName: e.target.value } as any)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea value={value.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} rows={3} />
            </Field>
          </div>
          <div className="sm:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.active ?? true} onCheckedChange={(v) => onChange({ active: v === true })} />
              Active
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
