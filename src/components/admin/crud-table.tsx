"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Search, ArrowLeft, Edit2, Trash2, Eye, MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { userCanAction } from "@/lib/types";
import type { EmployeePermissions } from "@/lib/types";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface CrudTableProps<T extends { id: string }> {
  title: string;
  description?: string;
  endpoint: string;
  columns: Column<T>[];
  form: (props: { value: Partial<T>; onChange: (v: Partial<T>) => void; onSave: () => void; onCancel: () => void }) => React.ReactNode;
  searchKeys?: Array<keyof T>;
  labelFor: (row: T) => string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canReorder?: boolean;
  /** Admin section id (e.g. "shop", "blog") - when set, per-action permissions
   *  are automatically checked from the logged-in user's session, hiding the
   *  New / Edit / Delete / Reorder buttons for employees who don't have those
   *  actions granted. Explicit props above override this fallback. */
  section?: string;
  /** Permission string used together with `section` for legacy role-based checks. */
  perm?: string;
  transformOnSave?: (data: Partial<T>) => Partial<T>;
  transformOnLoad?: (data: any) => T;
}

export function CrudTable<T extends { id: string }>({
  title, description, endpoint, columns, form, searchKeys, labelFor,
  canCreate = true, canEdit = true, canDelete = true, canReorder = false,
  section, perm,
  transformOnSave, transformOnLoad,
}: CrudTableProps<T>) {
  const { data: session } = useSession();
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const role = (session?.user as { role?: string } | undefined)?.role ?? "CONTRIBUTOR";
  const perms = (session?.user as { permissions?: EmployeePermissions } | undefined)?.permissions;
  const effCanCreate = section
    ? (canCreate && userCanAction(role, perms, section, "create", perm ?? "content.manage"))
    : canCreate;
  const effCanEdit = section
    ? (canEdit && userCanAction(role, perms, section, "update", perm ?? "content.manage"))
    : canEdit;
  const effCanDelete = section
    ? (canDelete && userCanAction(role, perms, section, "delete", perm ?? "content.manage"))
    : canDelete;
  const effCanReorder = section
    ? (canReorder && userCanAction(role, perms, section, "reorder", perm ?? "content.manage"))
    : canReorder;

  const reorder = async (id: string, direction: "up" | "down") => {
    const currentRows = [...rows];
    const idx = currentRows.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= currentRows.length) return;
    [currentRows[idx], currentRows[swapIdx]] = [currentRows[swapIdx], currentRows[idx]];
    setRows(currentRows);
    try {
      await Promise.all(
        currentRows.map((r, i) =>
          fetch(endpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: (r as any).id, order: i }),
          }),
        ),
      );
    } catch {
      await load();
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.ok) {
        const data = transformOnLoad ? json.data.map(transformOnLoad) : json.data as T[];
        setRows(data);
      } else {
        toast.error("Failed to load");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [endpoint, transformOnLoad]);

  useEffect(() => { load(); }, [load]);

  const filtered = search && searchKeys
    ? rows.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(search.toLowerCase())))
    : rows;

  const handleNew = () => {
    setEditing({});
    setIsNew(true);
  };

  const handleEdit = (row: T) => {
    setEditing({ ...row });
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = transformOnSave ? transformOnSave(editing) : editing;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(isNew ? "Created" : "Updated");
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${endpoint}?id=${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast.success("Deleted");
        setDeleteId(null);
        await load();
      } else {
        toast.error(json.error ?? "Delete failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div>
      <SectionHeader
        title={title}
        desc={description}
        action={effCanCreate && (
          <Button onClick={handleNew} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" /> New
          </Button>
        )}
      />

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-10 bg-background" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {columns.map((c) => (
                  <th key={String(c.key)} className={cn("text-left px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold", c.className)}>
                    {c.label}
                  </th>
                ))}
                {(effCanEdit || effCanDelete) && (
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold w-16">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {columns.map((c) => <td key={String(c.key)} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>)}
                    <td className="px-4 py-3"><Skeleton className="h-6 w-6 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-12 text-muted-foreground text-sm">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-b border-border hover:bg-accent/40 transition-colors">
                    {columns.map((c) => (
                      <td key={String(c.key)} className={cn("px-4 py-3", c.className)}>
                        {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {effCanEdit && (
                            <DropdownMenuItem onClick={() => handleEdit(row)}>
                              <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                          )}
                          {effCanReorder && (
                            <>
                              <DropdownMenuItem onClick={() => reorder(row.id, "up")}>
                                <ChevronUp className="h-3.5 w-3.5 mr-2" /> Move up
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => reorder(row.id, "down")}>
                                <ChevronDown className="h-3.5 w-3.5 mr-2" /> Move down
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => toast.info(`Viewing ${labelFor(row)}`)}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> View
                          </DropdownMenuItem>
                          {effCanDelete && (
                            <DropdownMenuItem onClick={() => setDeleteId(row.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? `Create ${title.toLowerCase().replace(/s$/, "")}` : "Edit"}</DialogTitle>
            <DialogDescription>
              {isNew ? "Fill in the details below." : (editing ? `Editing ${labelFor(editing as T)}` : "Edit")}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              {form({
                value: editing,
                onChange: (v) => setEditing({ ...editing, ...v }),
                onSave: handleSave,
                onCancel: () => setEditing(null),
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isNew ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The record will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PUBLISHED: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
    LIVE: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
    DRAFT: "bg-muted text-muted-foreground border-border",
    ARCHIVED: "bg-muted text-muted-foreground border-border",
    MAINTENANCE: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    NEW: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    IN_PROGRESS: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    REPLIED: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    RESOLVED: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
    PLATINUM: "bg-zinc-300/30 text-zinc-700 border-zinc-400",
    GOLD: "bg-amber-300/30 text-amber-700 border-amber-500",
    SILVER: "bg-slate-300/30 text-slate-700 border-slate-400",
    BRONZE: "bg-orange-300/30 text-orange-700 border-orange-500",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", colors[status] ?? colors.DRAFT)}>
      {status}
    </span>
  );
}
