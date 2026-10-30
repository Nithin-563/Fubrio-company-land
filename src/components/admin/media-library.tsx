"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Image as ImageIcon, Loader2, Trash2, Search, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  mime: string | null;
  size: number | null;
  alt: string | null;
  caption: string | null;
  createdAt: string;
}

export function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media-list");
      const json = await res.json();
      if (json.ok) setAssets(json.data);
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      form.append("alt", "");
      form.append("folder", "uploads");
      try {
        const res = await fetch("/api/media", { method: "POST", body: form });
        const json = await res.json();
        if (json.ok) toast.success(`Uploaded: ${file.name}`);
        else toast.error(json.error ?? `Upload failed: ${file.name}`);
      } catch { toast.error("Network error"); }
    }
    setUploading(false);
    await load();
  };

  const copyUrl = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    try {
      const res = await fetch(`/api/admin/media-list?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) { toast.success("Deleted"); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
  };

  const filtered = assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || (a.alt ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <SectionHeader
        title="Media library"
        desc="Upload and manage images used across the site. Files are optimized server-side via sharp."
        action={
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload
          </Button>
        }
      />

      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        className="mb-6 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground cursor-pointer hover:border-[var(--fubrio-accent)]/50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-6 w-6 mx-auto mb-2" />
        Drag and drop images here, or click to browse. Max 8MB per file. PNG / JPG / WebP / GIF / SVG.
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets…" className="pl-10 bg-background" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No media assets yet. Upload some using the button above.
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((a) => (
            <Card key={a.id} className="overflow-hidden group">
              <div className="aspect-square relative overflow-hidden bg-secondary">
                { }
                <img src={a.url} alt={a.alt ?? a.name} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="rounded-full h-8 w-8" onClick={() => copyUrl(a.url, a.id)}>
                    {copied === a.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="icon" variant="secondary" className="rounded-full h-8 w-8 hover:text-destructive" onClick={() => remove(a.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs font-medium truncate">{a.name}</div>
                <div className="text-[10px] text-muted-foreground">{a.size ? `${(a.size / 1024).toFixed(0)} KB` : "-"} · {a.mime}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
