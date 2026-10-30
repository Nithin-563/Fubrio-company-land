"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CrudTable, Field } from "@/components/admin/crud-table";
import type { SerializedCategory } from "@/lib/types";

interface Donator {
  id: string;
  name: string;
  amount: number;
  currency: string;
  message: string | null;
  date: string | null;
  verified: boolean;
  order: number;
}

export function DonatorsAdmin({ categories: _ }: { categories: SerializedCategory[] }) {
  return (
    <CrudTable<Donator>
      title="Donators"
      desc="Manage people who donated to Fubrio. Only verified donators appear on the website."
      endpoint="/api/admin/donators"
      section="donators"
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
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/20 flex-shrink-0">
                <span className="text-xs font-semibold text-[var(--fubrio-accent)]">
                  {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="font-medium">{r.name}</div>
                {r.message && <div className="text-xs text-muted-foreground truncate max-w-xs">"{r.message}"</div>}
              </div>
            </div>
          ),
        },
        {
          key: "amount",
          label: "Amount",
          render: (r) => <span className="font-display font-semibold text-[var(--fubrio-accent)]">${r.amount}</span>,
        },
        {
          key: "verified",
          label: "Status",
          render: (r) => r.verified
            ? <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30">Visible</Badge>
            : <Badge variant="outline" className="text-[10px]">Hidden</Badge>,
        },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name *">
            <Input value={value.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} placeholder="John Smith" />
          </Field>
          <Field label="Amount (USD) *">
            <Input
              type="number"
              value={value.amount ?? 0}
              onChange={(e) => onChange({ amount: Number(e.target.value) })}
              placeholder="50"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Message (optional)">
              <Textarea
                value={value.message ?? ""}
                onChange={(e) => onChange({ message: e.target.value })}
                rows={2}
                placeholder="Thank you for building Fubrio!"
              />
            </Field>
          </div>
          <Field label="Date">
            <Input
              type="date"
              value={value.date ? new Date(value.date).toISOString().slice(0, 10) : ""}
              onChange={(e) => onChange({ date: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() })}
            />
          </Field>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={value.verified ?? true}
                onCheckedChange={(v) => onChange({ verified: v === true })}
              />
              Verified (visible on website)
            </label>
          </div>
        </div>
      )}
    />
  );
}
