"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CrudTable, Field } from "@/components/admin/crud-table";
import { ImageUpload } from "@/components/admin/image-upload";

interface ShopItem {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  price: number;
  currency: string;
  isFree: boolean;
  category: string;
  creator: string | null;
  downloadUrl: string | null;
  demoUrl: string | null;
  features: string[];
  tags: string[];
  status: string;
  featured: boolean;
}

const CATEGORIES = ["app", "game", "bot", "template", "plugin", "tool", "theme", "other"];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
];

function formatPrice(price: number, currency: string, isFree: boolean): string {
  if (isFree) return "Free";
  const c = CURRENCIES.find((x) => x.code === currency) ?? CURRENCIES[0];
  return `${c.symbol}${Number(price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function ShopAdmin() {
  return (
    <CrudTable<ShopItem>
      title="Shop"
      desc="List apps, games, bots, templates, and digital products for sale or free download."
      endpoint="/api/admin/shop"
      searchKeys={["title", "category", "creator"]}
      labelFor={(r) => r.title}
      section="shop"
      perm="content.manage"
      canReorder
      columns={[
        {
          key: "title",
          label: "Title",
          render: (r) => (
            <div className="flex items-center gap-3">
              {r.image ? (
                <img src={r.image} alt="" className="h-10 w-10 rounded-lg object-cover border border-border" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/20 flex items-center justify-center text-xs font-semibold text-[var(--fubrio-accent)]">
                  {r.title.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
              )}
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.category} · {r.creator || "Fubrio"}</div>
              </div>
            </div>
          ),
        },
        {
          key: "price",
          label: "Price",
          render: (r) => r.isFree
            ? <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30">Free</Badge>
            : <span className="font-mono font-semibold">{formatPrice(r.price, r.currency || "USD", false)} <span className="text-[10px] text-muted-foreground">{r.currency || "USD"}</span></span>,
        },
        {
          key: "status",
          label: "Status",
          render: (r) => r.status === "PUBLISHED"
            ? <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30">Published</Badge>
            : <Badge variant="outline" className="text-[10px]">Draft</Badge>,
        },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title *">
            <Input value={value.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} placeholder="My Awesome App" />
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

          <Field label="Category">
            <select
              value={value.category ?? "app"}
              onChange={(e) => onChange({ category: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea value={value.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} rows={3} placeholder="What does this app do?" />
            </Field>
          </div>
          <Field label="Image">
            <ImageUpload value={value.image ?? ""} onChange={(url) => onChange({ image: url })} />
          </Field>
          <div className="space-y-4">
            <Field label="Creator">
              <Input value={value.creator ?? ""} onChange={(e) => onChange({ creator: e.target.value })} placeholder="Fubrio" />
            </Field>
            <Field label="Price">
              <div className="flex gap-2">
                <select
                  value={value.currency ?? "USD"}
                  onChange={(e) => onChange({ currency: e.target.value })}
                  className="rounded-md border border-border bg-background px-2 py-2 text-sm w-32"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={value.price ?? 0}
                  onChange={(e) => onChange({ price: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Pick any currency - the price will be shown to buyers in that currency.
              </div>
            </Field>
            <Field label="Download URL">
              <Input value={value.downloadUrl ?? ""} onChange={(e) => onChange({ downloadUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Demo URL">
              <Input value={value.demoUrl ?? ""} onChange={(e) => onChange({ demoUrl: e.target.value })} placeholder="https://..." />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Features (comma-separated)">
              <Input
                value={Array.isArray(value.features) ? value.features.join(", ") : String(value.features ?? "")}
                onChange={(e) => onChange({ features: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                placeholder="Fast, Secure, Easy to use"
              />
            </Field>
          </div>
          <div className="sm:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.isFree ?? false} onCheckedChange={(v) => onChange({ isFree: v === true })} />
              Free
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.featured ?? false} onCheckedChange={(v) => onChange({ featured: v === true })} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={value.status === "PUBLISHED"}
                onCheckedChange={(v) => onChange({ status: v ? "PUBLISHED" : "DRAFT" })}
              />
              Published
            </label>
          </div>
        </div>
      )}
    />
  );
}
