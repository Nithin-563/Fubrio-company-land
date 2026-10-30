"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Loader2, ExternalLink, Copy, Check, Upload, FileText, Link2, File, Type, Code, ArrowRight, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShortLink {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: string;
  targetUrl: string | null;
  filePath: string | null;
  fileName: string | null;
  fileMime: string | null;
  fileSize: number | null;
  textContent: string | null;
  password: string | null;
  active: boolean;
  visits: number;
  expiresAt: string | null;
  createdAt: string;
}

const TYPES = [
  { value: "file", label: "File upload", icon: File },
  { value: "redirect", label: "Redirect URL", icon: Link2 },
  { value: "text", label: "Text snippet", icon: Type },
  { value: "embed", label: "Custom HTML embed", icon: Code },
];

function formatBytes(n: number | null): string {
  if (!n) return "-";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function LinksAdmin() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("file");
  const [targetUrl, setTargetUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [embedHtml, setEmbedHtml] = useState("");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/links");
      const json = await res.json();
      if (json.ok) setLinks(json.data);
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setName(""); setSlug(""); setDescription(""); setType("file");
    setTargetUrl(""); setTextContent(""); setEmbedHtml(""); setPassword("");
    setExpiresAt(""); setFile(null);
  };

  const create = async () => {
    if (!name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("slug", slug || name);
      form.append("description", description);
      form.append("type", type);
      form.append("targetUrl", targetUrl);
      form.append("textContent", textContent);
      form.append("embedHtml", embedHtml);
      form.append("password", password);
      form.append("expiresAt", expiresAt);
      if (file) form.append("file", file);

      const res = await fetch("/api/admin/links", { method: "POST", body: form });
      const json = await res.json();
      if (json.ok) {
        toast.success("Link created");
        setShowCreate(false);
        reset();
        await load();
      } else {
        toast.error(json.error ?? "Create failed");
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const toggleActive = async (l: ShortLink) => {
    try {
      const res = await fetch("/api/admin/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: l.id, active: !l.active }),
      });
      const json = await res.json();
      if (json.ok) { toast.success(l.active ? "Deactivated" : "Activated"); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this link? Uploaded files will remain on disk.")) return;
    try {
      const res = await fetch(`/api/admin/links?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) { toast.success("Deleted"); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
  };

  const copyUrl = async (slug: string, id: string) => {
    const url = `${window.location.origin}/l/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <SectionHeader
        title="Link Manager"
        desc="Create short links like fubrio.in/l/anything that serve files, redirects, text snippets, or custom HTML."
        action={
          <Button onClick={() => setShowCreate(true)} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" />New link
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : links.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No links yet. Click &quot;New link&quot; to create your first short link.
        </Card>
      ) : (
        <div className="space-y-2">
          {links.map((l) => {
            const TypeIcon = TYPES.find((t) => t.value === l.type)?.icon ?? Link2;
            return (
              <Card key={l.id} className={cn("p-4", !l.active && "opacity-50")}>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary border border-border flex-shrink-0">
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{l.name}</span>
                      <Badge variant="outline" className="text-[10px]">{l.type}</Badge>
                      {l.password && <Badge variant="outline" className="text-[10px]">password</Badge>}
                      {l.expiresAt && <Badge variant="outline" className="text-[10px]">expires</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="font-mono">fubrio.in/l/{l.slug}</span>
                      {l.fileName && <span>· {l.fileName} ({formatBytes(l.fileSize)})</span>}
                      <span>· {l.visits} visit{l.visits !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => copyUrl(l.slug, l.id)} aria-label="Copy URL">
                      {copied === l.id ? <Check className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button asChild size="icon" variant="ghost" className="rounded-full h-8 w-8" aria-label="Open link">
                      <a href={`/l/${l.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => toggleActive(l)} aria-label="Toggle active">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 hover:text-destructive" onClick={() => remove(l.id)} aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={(o) => { setShowCreate(o); if (!o) reset(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create short link</DialogTitle>
            <DialogDescription>
              Create a link at fubrio.in/l/[slug]. Choose a type below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My project download" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Slug (optional)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-project" />
                <p className="text-[11px] text-muted-foreground">Will be accessible at fubrio.in/l/{slug || "slug"}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Link type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors",
                        type === t.value
                          ? "border-[var(--fubrio-accent)] bg-[var(--fubrio-accent-soft)]"
                          : "border-border hover:bg-accent",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {type === "file" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Upload file</Label>
                <div
                  className="rounded-lg border-2 border-dashed border-border p-6 text-center cursor-pointer hover:border-[var(--fubrio-accent)]/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {file ? (
                    <div className="text-sm">
                      <FileText className="h-6 w-6 mx-auto mb-2 text-[var(--fubrio-accent)]" />
                      <div className="font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{formatBytes(file.size)}</div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-sm">Click to upload or drag a file</div>
                      <div className="text-[11px] text-muted-foreground mt-1">ZIP, PDF, images, video, audio - up to 100MB</div>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
            )}

            {type === "redirect" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Target URL *</Label>
                <Input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://example.com/somewhere" />
                <p className="text-[11px] text-muted-foreground">Visitors will be redirected to this URL.</p>
              </div>
            )}

            {type === "text" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Text content *</Label>
                <Textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} rows={6} placeholder="Plain text or code snippet" />
              </div>
            )}

            {type === "embed" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Custom HTML *</Label>
                <Textarea value={embedHtml} onChange={(e) => setEmbedHtml(e.target.value)} rows={6} placeholder="<iframe src='...'></iframe>" className="font-mono text-xs" />
                <p className="text-[11px] text-muted-foreground">Will be rendered inside a styled page at fubrio.in/l/[slug].</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Access password (optional)</Label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave empty for public" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Expires at (optional)</Label>
                <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={create} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              Create link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
