"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("alt", "");
      form.append("folder", "admin-uploads");
      const res = await fetch("/api/media", { method: "POST", body: form });
      const json = await res.json();
      if (json.ok && json.asset?.url) {
        onChange(json.asset.url);
      } else {
        setError(json.error || "Upload failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative cursor-pointer rounded-lg border-2 border-dashed border-border hover:border-[var(--fubrio-accent)]/50 transition-colors overflow-hidden glass-input"
        style={{ minHeight: value ? "auto" : "120px" }}
      >
        {value ? (
          <div className="relative group">
            { }
            <img src={value} alt="Preview" className="w-full h-32 object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium hover:bg-background"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="rounded-full bg-destructive/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <div className="text-sm text-muted-foreground">Click to upload or drag an image</div>
                <div className="text-[11px] text-muted-foreground mt-1">PNG, JPG, WebP - max 8MB</div>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {value && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL"
            className="flex-1 bg-background text-xs rounded-md border border-border px-2 py-1"
          />
          <span className="text-[10px] text-muted-foreground">or paste URL</span>
        </div>
      )}
    </div>
  );
}
