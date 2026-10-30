"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Edit2, Loader2, Save, Eye, EyeOff, Copy, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import type { SerializedPage } from "@/lib/types";

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "gallery", label: "Gallery" },
  { value: "video", label: "Video" },
  { value: "project_showcase", label: "Project showcase" },
  { value: "product_showcase", label: "Product showcase" },
  { value: "sponsor_grid", label: "Sponsor grid" },
  { value: "partner_grid", label: "Partner grid" },
  { value: "logo_marquee", label: "Logo marquee" },
  { value: "services_grid", label: "Services grid" },
  { value: "feature_cards", label: "Feature cards" },
  { value: "stats", label: "Statistics" },
  { value: "testimonials", label: "Testimonials" },
  { value: "faq", label: "FAQ" },
  { value: "blog_list", label: "Blog list" },
  { value: "cta", label: "CTA" },
  { value: "contact_form", label: "Contact form" },
  { value: "newsletter", label: "Newsletter signup" },
  { value: "custom_html", label: "Custom HTML" },
  { value: "embed", label: "Embed" },
  { value: "announcement", label: "Announcement banner" },
];

interface Section {
  id?: string;
  type: string;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
  visibility: string;
  order: number;
}

export function PagesAdmin() {
  const [pages, setPages] = useState<SerializedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<SerializedPage | null>(null);
  const [editing, setEditing] = useState<SerializedPage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages");
      const json = await res.json();
      if (json.ok) setPages(json.data);
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({
      id: "", title: "", slug: "", status: "DRAFT", description: "",
      sections: [], seoTitle: null, seoDesc: null,
      createdAt: "", updatedAt: "",
    });
    setIsNew(true);
  };

  const savePage = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: editing.title,
        slug: editing.slug,
        status: editing.status,
        description: editing.description,
        seoTitle: editing.seoTitle,
        seoDesc: editing.seoDesc,
      };
      if (!isNew) body.id = editing.id;

      const res = await fetch("/api/admin/pages", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(isNew ? "Page created" : "Page saved");
        setEditing(null);
        await load();
      } else toast.error(json.error ?? "Save failed");
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  if (selectedPage) {
    return <PageBuilder page={selectedPage} onBack={() => { setSelectedPage(null); load(); }} />;
  }

  return (
    <div>
      <SectionHeader
        title="Pages"
        desc="Build dynamic pages from reusable sections. Changes are stored in the database."
        action={<Button onClick={openNew} className="rounded-full bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4 mr-1.5" />New page</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : pages.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-sm text-muted-foreground">
            No pages yet. Create your first page.
          </Card>
        ) : (
          pages.map((p) => (
            <Card key={p.id} className="overflow-hidden hover:border-[var(--fubrio-accent)]/40 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-semibold truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground">/{p.slug}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                </div>
                {p.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{p.sections.length} section{p.sections.length !== 1 ? "s" : ""}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setSelectedPage(p)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isNew ? "Create page" : "Edit page"}</DialogTitle>
            <DialogDescription>Configure the page metadata. Sections are managed after creation.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Slug</Label>
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="about" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={savePage} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isNew ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PageBuilder({ page, onBack }: { page: SerializedPage; onBack: () => void }) {
  const [sections, setSections] = useState<Section[]>(page.sections);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState("hero");
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [saving, setSaving] = useState(false);

  const addSection = async () => {
    const newSection: Section = {
      type: newType,
      content: { title: "New section" },
      config: {},
      visibility: "PUBLIC",
      order: sections.length,
    };
    try {
      const updated = [...sections, newSection];
      setSections(updated);
      await saveSections(updated);
      setAdding(false);
      toast.success("Section added");
    } catch { toast.error("Failed"); }
  };

  const saveSections = async (updated: Section[]) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: page.id,
          title: page.title,
          slug: page.slug,
          status: page.status,
          description: page.description,
        }),
      });
      const json = await res.json();
      if (!json.ok) toast.error("Save failed");
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const move = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    updated.forEach((s, i) => (s.order = i));
    setSections(updated);
  };

  const remove = (idx: number) => {
    if (!confirm("Remove this section?")) return;
    const updated = sections.filter((_, i) => i !== idx);
    updated.forEach((s, i) => (s.order = i));
    setSections(updated);
  };

  const duplicate = (idx: number) => {
    const updated = [...sections];
    const dup = { ...sections[idx], id: undefined, order: idx + 1 };
    updated.splice(idx + 1, 0, dup);
    updated.forEach((s, i) => (s.order = i));
    setSections(updated);
  };

  const toggleVisibility = (idx: number) => {
    const updated = [...sections];
    updated[idx].visibility = updated[idx].visibility === "PUBLIC" ? "HIDDEN" : "PUBLIC";
    setSections(updated);
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5">
        <ChevronUp className="h-3.5 w-3.5 rotate-[-90deg]" /> Back to pages
      </button>
      <SectionHeader
        title={page.title}
        desc={`/${page.slug} · ${page.status} · ${sections.length} section${sections.length !== 1 ? "s" : ""}`}
        action={
          <Button onClick={() => setAdding(true)} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" /> Add section
          </Button>
        }
      />

      {sections.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          No sections yet. Click &quot;Add section&quot; to start building this page.
        </Card>
      ) : (
        <div className="space-y-2">
          {sections.map((s, idx) => (
            <Card key={idx} className={cn(s.visibility === "HIDDEN" && "opacity-50")}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                    <span className="text-sm font-medium truncate">
                      {String(s.content?.title ?? s.type)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => move(idx, -1)} disabled={idx === 0}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => move(idx, 1)} disabled={idx === sections.length - 1}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => toggleVisibility(idx)}>
                    {s.visibility === "PUBLIC" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => duplicate(idx)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:text-destructive" onClick={() => remove(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add section</DialogTitle>
            <DialogDescription>Choose a section type. Content can be edited after creation.</DialogDescription>
          </DialogHeader>
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SECTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={addSection} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
