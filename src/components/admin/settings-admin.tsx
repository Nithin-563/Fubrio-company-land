"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/admin/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const SETTING_GROUPS: Array<{ title: string; keys: Array<{ key: string; label: string; type?: "text" | "textarea" | "color"; placeholder?: string }> }> = [
  {
    title: "Branding",
    keys: [
      { key: "brand.name", label: "Brand name" },
      { key: "brand.tagline", label: "Tagline" },
      { key: "brand.description", label: "Description", type: "textarea" },
      { key: "brand.accentColor", label: "Accent color", type: "color" },
    ],
  },
  {
    title: "Public Email Addresses",
    keys: [
      { key: "email.hello", label: "Hello / general email", placeholder: "hello@fubrio.in" },
      { key: "email.community", label: "Community / submissions email", placeholder: "community@fubrio.in" },
      { key: "email.support", label: "Support / sales email", placeholder: "support@fubrio.in" },
    ],
  },
  {
    title: "Contact",
    keys: [
      { key: "contact.email", label: "Email" },
      { key: "contact.phone", label: "Phone" },
      { key: "contact.address", label: "Address", type: "textarea" },
    ],
  },
  {
    title: "Social",
    keys: [
      { key: "social.discord", label: "Discord invite URL" },
      { key: "social.linkedin", label: "LinkedIn profile URL" },
    ],
  },
  {
    title: "Donation Banner",
    keys: [
      { key: "donation.enabled", label: "Enable donation banner (true/false)" },
      { key: "donation.url", label: "Donation URL (where the button links to)" },
      { key: "donation.text", label: "Banner text" },
    ],
  },
  {
    title: "Bloom Bot Stats (shown on bloom.fubrio.in)",
    keys: [
      { key: "bloom.servers", label: "Server count (e.g. 500)", placeholder: "0" },
      { key: "bloom.users", label: "Total users (e.g. 150000)", placeholder: "0" },
      { key: "bloom.commands", label: "Total commands (e.g. 150)", placeholder: "150" },
      { key: "bloom.status", label: "Bot status (online/offline)", placeholder: "online" },
      { key: "bloom.inviteUrl", label: "Bot invite URL (override the default)", placeholder: "https://discord.com/oauth2/authorize?client_id=1550149986673631343" },
    ],
  },
  {
    title: "SEO defaults",
    keys: [
      { key: "seo.defaultTitle", label: "Default title" },
      { key: "seo.defaultDescription", label: "Default description", type: "textarea" },
    ],
  },
];

export function SettingsAdmin() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.ok) setValues(json.settings ?? {});
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success("Settings saved");
      } else {
        toast.error(json.error ?? "Save failed");
        await load();
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <SectionHeader
        title="Settings"
        desc="Global platform settings stored in the database. Some values affect the public site on next render."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reload
            </Button>
            <Button onClick={save} disabled={saving} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save changes
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SETTING_GROUPS.map((g) => (
            <Card key={g.title}>
              <CardHeader>
                <CardTitle className="text-sm">{g.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {g.keys.map((k) => (
                  <div key={k.key} className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">{k.label}</Label>
                    {k.type === "textarea" ? (
                      <Textarea
                        value={values[k.key] ?? ""}
                        onChange={(e) => setValues({ ...values, [k.key]: e.target.value })}
                        rows={3}
                        placeholder={k.placeholder}
                      />
                    ) : k.type === "color" ? (
                      <div className="flex gap-2">
                        <Input type="color" value={values[k.key] ?? "#A0F2A0"} onChange={(e) => setValues({ ...values, [k.key]: e.target.value })} className="w-16 h-9" />
                        <Input value={values[k.key] ?? ""} onChange={(e) => setValues({ ...values, [k.key]: e.target.value })} placeholder="#A0F2A0" />
                      </div>
                    ) : (
                      <Input
                        value={values[k.key] ?? ""}
                        onChange={(e) => setValues({ ...values, [k.key]: e.target.value })}
                        placeholder={k.placeholder}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Notes</div>
          <p className="text-sm text-muted-foreground">
            Settings are saved to the database and take effect immediately on the next page load.
            The accent color setting overrides the CSS variable at runtime.
            For production use, configure a real email provider, storage provider, payment provider,
            and analytics in your environment variables - see <code className="font-mono">.env</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
