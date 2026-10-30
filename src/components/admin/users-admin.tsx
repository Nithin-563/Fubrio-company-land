"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, ShieldCheck, Trash2, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SectionHeader } from "@/components/admin/admin-shell";
import { useSession } from "next-auth/react";
import { ROLES } from "@/lib/types";
import { toast } from "sonner";
import type { SerializedUser } from "@/lib/types";

export function UsersAdmin() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<SerializedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SerializedUser | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CONTRIBUTOR");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.ok) setUsers(json.data);
      else toast.error(json.error ?? "Load failed");
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({} as SerializedUser);
    setIsNew(true);
    setName(""); setEmail(""); setRole("CONTRIBUTOR"); setPassword("");
  };

  const openEdit = (u: SerializedUser) => {
    setEditing(u);
    setIsNew(false);
    setName(u.name ?? ""); setEmail(u.email); setRole(u.role); setPassword("");
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { name, role };
      if (isNew) {
        body.email = email;
        body.password = password;
      } else {
        body.id = editing.id;
        if (password) body.password = password;
      }
      const res = await fetch("/api/admin/users", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(isNew ? "User created" : "User updated");
        setEditing(null);
        await load();
      } else toast.error(json.error ?? "Save failed");
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) { toast.success("Deleted"); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
  };

  return (
    <div>
      <SectionHeader
        title="Users & roles"
        desc="Manage admin users and their roles. Role-based access enforced server-side."
        action={<Button onClick={openNew} className="rounded-full bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4 mr-1.5" />New user</Button>}
      />

      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12" /></div>)
          ) : users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-sm font-semibold">
                {(u.name ?? u.email).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{u.name ?? "-"}</div>
                <div className="text-xs text-muted-foreground truncate">{u.email}</div>
              </div>
              <Badge variant="outline" className="text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1 text-[var(--fubrio-accent)]" />
                {u.role}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => openEdit(u)} className="rounded-full">Edit</Button>
              {u.id !== (session?.user as { id?: string })?.id && (
                <Button variant="ghost" size="icon" className="rounded-full hover:text-destructive" onClick={() => remove(u.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isNew ? "Create user" : "Edit user"}</DialogTitle>
            <DialogDescription>
              {isNew ? "Add a new admin user with role-based access." : `Editing ${email}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isNew} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isNew ? "Password" : "New password (leave blank to keep)"}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder={isNew ? "Min 6 characters" : "••••••••"} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isNew ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
