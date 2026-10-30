"use client";

import { useEffect, useState } from "react";
import {
  UserCog, Plus, Trash2, Edit2, Loader2, KeyRound, Mail, Clock,
  ShieldCheck, Check, X, RotateCcw, ShieldOff, Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SECTIONS: Array<{ id: string; label: string; group: string }> = [
  { id: "projects", label: "Showcase", group: "Content" },
  { id: "products", label: "Products", group: "Content" },
  { id: "services", label: "Services", group: "Content" },
  { id: "blog", label: "Blog", group: "Content" },
  { id: "testimonials", label: "Testimonials", group: "Content" },
  { id: "faqs", label: "FAQs", group: "Content" },
  { id: "events", label: "Events", group: "Content" },
  { id: "announcements", label: "Announcements", group: "Content" },
  { id: "sponsors", label: "Sponsors", group: "Network" },
  { id: "partners", label: "Partners", group: "Network" },
  { id: "links", label: "Link Manager", group: "Distribution" },
  { id: "team", label: "Team", group: "Content" },
  { id: "newsletter", label: "Newsletter", group: "Communication" },
  { id: "donators", label: "Donators", group: "Communication" },
  { id: "analytics", label: "Analytics", group: "System" },
  { id: "email", label: "Email", group: "Communication" },
  { id: "shop", label: "Shop", group: "Content" },
  { id: "shopRequests", label: "Shop Requests", group: "Communication" },
  { id: "pages", label: "Pages", group: "Structure" },
  { id: "categories", label: "Categories", group: "Structure" },
  { id: "media", label: "Media Library", group: "Assets" },
  { id: "inquiries", label: "Inquiries", group: "Communication" },
  { id: "users", label: "Users", group: "System" },
  { id: "donation", label: "Donation", group: "System" },
  { id: "chat", label: "Chat", group: "Communication" },
  { id: "apiKeys", label: "API Keys", group: "System" },
  { id: "example", label: "Example", group: "System" },
  { id: "customerChat", label: "Customer Chat", group: "Communication" },
  { id: "bugReports", label: "Bug Reports", group: "Communication" },
  { id: "subscriptions", label: "Subscriptions", group: "System" },
  { id: "settings", label: "Settings", group: "System" },
];

const ACTIONS: Array<{ id: string; label: string }> = [
  { id: "view", label: "View" },
  { id: "create", label: "Create" },
  { id: "update", label: "Update" },
  { id: "delete", label: "Delete" },
  { id: "reorder", label: "Reorder" },
];

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
  SUSPENDED: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  REVOKED: "bg-destructive/15 text-destructive border-destructive/30",
};

interface Employee {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  czerCode: string;
  role: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  permissions?: Record<string, string[]>;
}

interface FormState {
  email: string;
  name: string;
  czerCode: string;
  expiresAt: string; // ISO string (datetime-local input) or "" for no expiry
  permissions: Record<string, string[]>;
  status: string;
}

function blankForm(): FormState {
  return {
    email: "",
    name: "",
    czerCode: "",
    expiresAt: "",
    permissions: {},
    status: "ACTIVE",
  };
}

function genRandomCode(): string {
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

function formatDate(iso: string | null): string {
  if (!iso) return "No expiry";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function EmployeesAdmin() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(blankForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/employees");
      const json = await res.json();
      if (json.ok) setEmployees(json.data);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...blankForm(),
      czerCode: genRandomCode(),
    });
    setShowForm(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      email: emp.email,
      name: emp.name ?? "",
      czerCode: emp.czerCode,
      expiresAt: toDatetimeLocalValue(emp.expiresAt),
      permissions: emp.permissions ?? {},
      status: emp.status,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim().toLowerCase())) {
      toast.error("A valid email is required");
      return;
    }
    if (!/^\d{6}$/.test(form.czerCode)) {
      toast.error("Czer code must be exactly 6 digits");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        email: form.email,
        name: form.name || null,
        czerCode: form.czerCode,
        status: form.status,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        permissions: form.permissions,
      };
      const method = editing ? "PUT" : "POST";
      if (editing) payload.id = editing.id;

      const res = await fetch("/api/admin/employees", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(editing ? "Employee updated" : "Employee created");
        setShowForm(false);
        setForm(blankForm());
        setEditing(null);
        await load();
      } else {
        toast.error(json.error ?? "Save failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/employees?id=${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast.success("Employee deleted");
        setDeleteId(null);
        await load();
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.ok) {
        setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
        toast.success(`Marked as ${status.toLowerCase()}`);
      } else {
        toast.error(json.error ?? "Update failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const filtered = employees.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.email.toLowerCase().includes(q) ||
      (e.name ?? "").toLowerCase().includes(q) ||
      e.czerCode.includes(q)
    );
  });

  return (
    <div>
      <SectionHeader
        title="Employees"
        desc="Create and manage employee accounts. Each employee logs in via the Czer panel using their email + unique 6-digit code. Grant granular per-section + per-action permissions below."
        action={
          <Button onClick={openCreate} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" /> New employee
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatChip icon={<UserCog className="h-4 w-4" />} label="Total" value={employees.length} />
        <StatChip icon={<ShieldCheck className="h-4 w-4 text-[var(--fubrio-accent)]" />} label="Active" value={employees.filter((e) => e.status === "ACTIVE" && !isExpired(e.expiresAt)).length} accent />
        <StatChip icon={<ShieldOff className="h-4 w-4 text-amber-500" />} label="Suspended" value={employees.filter((e) => e.status === "SUSPENDED").length} />
        <StatChip icon={<Clock className="h-4 w-4 text-destructive" />} label="Expired / Revoked" value={employees.filter((e) => e.status === "REVOKED" || isExpired(e.expiresAt)).length} />
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or code…"
          className="pl-10 bg-background"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4"><Skeleton className="h-16" /></div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <UserCog className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No employees yet. Click <strong>New employee</strong> to add your first team member.
            </div>
          ) : (
            filtered.map((emp) => {
              const expired = isExpired(emp.expiresAt);
              const grantedSections = Object.keys(emp.permissions ?? {}).filter((s) => (emp.permissions?.[s] ?? []).length > 0);
              return (
                <div key={emp.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-sm font-semibold flex-shrink-0">
                      {(emp.name ?? emp.email).slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-sm font-medium truncate">
                          {emp.name || emp.email}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLE[emp.status] ?? "")}>
                          {emp.status.toLowerCase()}
                          {expired && emp.status === "ACTIVE" ? " · expired" : ""}
                        </Badge>
                        {grantedSections.length === 0 && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            No sections granted
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${emp.email}`} className="hover:text-foreground underline-offset-2 hover:underline">
                            {emp.email}
                          </a>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <KeyRound className="h-3 w-3" />
                          <span className="font-mono tracking-widest">{emp.czerCode}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(emp.expiresAt)}
                        </span>
                      </div>
                      {grantedSections.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {grantedSections.map((s) => {
                            const meta = SECTIONS.find((x) => x.id === s);
                            const acts = emp.permissions?.[s] ?? [];
                            return (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              >
                                <span className="font-medium">{meta?.label ?? s}</span>
                                <span className="opacity-60">({acts.join(",")})</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEdit(emp)}>
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-full">
                            Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateStatus(emp.id, "ACTIVE")}>
                            <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(emp.id, "SUSPENDED")}>
                            <ShieldOff className="h-3.5 w-3.5 mr-2" /> Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(emp.id, "REVOKED")} className="text-destructive focus:text-destructive">
                            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(emp.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit employee" : "Create new employee"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update email, name, Czer code, expiry, and per-section permissions."
                : "Add a new team member. They'll log in via /#czer → Employee tab with their email + 6-digit code."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email address *">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="their.email@gmail.com"
                  className="bg-background"
                />
                <div className="text-[10px] text-muted-foreground">
                  Gmail or any other address works. They&apos;ll type this when signing in.
                </div>
              </Field>
              <Field label="Name (optional)">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="bg-background"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Czer code (6 digits) *">
                <div className="flex gap-2">
                  <Input
                    value={form.czerCode}
                    onChange={(e) => setForm({ ...form, czerCode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    inputMode="numeric"
                    pattern="\d{6}"
                    className="bg-background font-mono tracking-[0.3em]"
                    placeholder="123456"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setForm({ ...form, czerCode: genRandomCode() })}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Generate
                  </Button>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  The employee enters this 6-digit code on /#czer → Employee tab.
                </div>
              </Field>
              <Field label="Expiry date (optional)">
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="bg-background"
                />
                <div className="text-[10px] text-muted-foreground">
                  Leave blank for <strong>no expiry</strong> - the code works forever until revoked.
                </div>
              </Field>
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold">Section & action permissions</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Check the box next to a section to grant access. Then check the actions they can perform on it.
                    Unchecked sections are <strong>completely hidden</strong> from the employee&apos;s dashboard -
                    they won&apos;t even see the name or text.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-[11px]"
                    onClick={() => {
                      const all: Record<string, string[]> = {};
                      for (const s of SECTIONS) all[s.id] = ACTIONS.map((a) => a.id);
                      setForm({ ...form, permissions: all });
                    }}
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-[11px]"
                    onClick={() => setForm({ ...form, permissions: {} })}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {SECTIONS.map((s) => {
                  const acts = form.permissions[s.id] ?? [];
                  const sectionEnabled = acts.length > 0;
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "rounded-lg border p-2 transition-colors",
                        sectionEnabled
                          ? "border-[var(--fubrio-accent)]/40 bg-[var(--fubrio-accent-soft)]"
                          : "border-border bg-background",
                      )}
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={sectionEnabled}
                          onCheckedChange={(v) => {
                            const next = { ...form.permissions };
                            if (v === true) {
                              next[s.id] = ["view"];
                            } else {
                              delete next[s.id];
                            }
                            setForm({ ...form, permissions: next });
                          }}
                        />
                        <span className="text-xs font-medium flex-1">{s.label}</span>
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.group}</span>
                      </label>
                      {sectionEnabled && (
                        <div className="mt-2 pt-2 border-t border-[var(--fubrio-accent)]/20 flex flex-wrap gap-2">
                          {ACTIONS.map((a) => {
                            const checked = acts.includes(a.id);
                            return (
                              <label
                                key={a.id}
                                className="inline-flex items-center gap-1 cursor-pointer text-[10px] text-muted-foreground hover:text-foreground"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(v) => {
                                    const next = { ...form.permissions };
                                    let arr = [...(next[s.id] ?? [])];
                                    if (v === true) {
                                      if (!arr.includes(a.id)) arr.push(a.id);
                                      if (a.id !== "view" && !arr.includes("view")) arr.unshift("view");
                                    } else {
                                      arr = arr.filter((x) => x !== a.id);
                                    }
                                    if (arr.length === 0) delete next[s.id];
                                    else next[s.id] = arr;
                                    setForm({ ...form, permissions: next });
                                  }}
                                />
                                <span>{a.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                Sections not shown above (Overview, Audit Logs, Employees) are reserved for the Super Admin only -
                they cannot be granted to employees.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-foreground text-background hover:bg-foreground/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? "Save changes" : "Create employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete employee?</DialogTitle>
            <DialogDescription>
              This permanently removes the employee, their Czer code, and all section permissions.
              They will immediately lose access to the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={remove}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function StatChip({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl glass-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className={cn("mt-2 font-display text-2xl font-semibold", accent && "text-[var(--fubrio-accent)]")}>{value}</div>
    </div>
  );
}
