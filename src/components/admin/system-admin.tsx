"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CrudTable, Field } from "@/components/admin/crud-table";
import { ImageUpload } from "@/components/admin/image-upload";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import type { SerializedCategory } from "@/lib/types";

const TYPES = ["project", "product", "service", "post", "partner", "sponsor"];
const TYPE_LABEL: Record<string, string> = {
  project: "Project",
  product: "Product",
  service: "Service",
  post: "Blog Post",
  partner: "Partner",
  sponsor: "Sponsor",
};

export function CategoriesAdmin() {
  return (
    <CrudTable<SerializedCategory>
      title="Categories"
      desc="Organize content across projects, products, services, posts, partners, and sponsors. Add an image to make category cards visually appealing on the public site."
      endpoint="/api/admin/categories"
      section="categories"
      perm="content.manage"
      searchKeys={["name"]}
      labelFor={(r) => r.name}
      canReorder
      columns={[
        {
          key: "name",
          label: "Name",
          render: (r) => (
            <div className="flex items-center gap-3">
              {(r as any).image ? (
                <img src={(r as any).image} alt="" className="h-8 w-8 rounded-lg object-cover" />
              ) : r.color ? (
                <div className="h-8 w-8 rounded-lg border border-border" style={{ background: r.color }} />
              ) : null}
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">/{r.slug}</div>
              </div>
            </div>
          ),
        },
        { key: "type", label: "Type", render: (r) => <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[r.type] ?? r.type}</Badge> },
        { key: "icon", label: "Icon", render: (r) => r.icon ?? <span className="text-muted-foreground">-</span> },
        { key: "order", label: "Order", render: (r) => <span className="font-mono text-xs">{r.order}</span> },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name">
            <Input value={value.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>
          <Field label="Type">
            <Select value={value.type ?? "project"} onValueChange={(v) => onChange({ type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t] ?? t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Category image (shown on public category cards)">
              <ImageUpload value={(value as any).image ?? ""} onChange={(url) => onChange({ image: url } as any)} />
            </Field>
          </div>
          <Field label="Color (hex)">
            <Input value={value.color ?? ""} onChange={(e) => onChange({ color: e.target.value })} placeholder="#A0F2A0" />
          </Field>
          <Field label="Icon (lucide name)">
            <Input value={value.icon ?? ""} onChange={(e) => onChange({ icon: e.target.value })} placeholder="Globe" />
          </Field>
          <Field label="Order">
            <Input type="number" value={value.order ?? 0} onChange={(e) => onChange({ order: Number(e.target.value) })} />
          </Field>
          <Field label="Description">
            <Textarea value={value.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} rows={2} />
          </Field>
        </div>
      )}
    />
  );
}

export function AuditLogAdmin() {
  return (
    <AuditLogsView />
  );
}

interface AuditLog {
  id: string;
  userId: string | null;
  user: { name: string | null; email: string } | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setLogs(json.data);
        else toast.error("Failed to load");
      })
      .catch(() => toast.error("Network error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <SectionHeader title="Audit logs" desc="All admin actions across the platform." />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Action</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Entity</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">User</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No audit logs yet.</td></tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">{l.action}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {l.entity}
                      {l.entityId && <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{l.entityId}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {l.user?.name ?? l.user?.email ?? <span className="text-muted-foreground">System</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
