"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Search, ExternalLink, BookOpen, ShoppingCart, Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import type { SerializedProduct, SerializedCategory } from "@/lib/types";
import { usableImage } from "@/components/shared/gradient";

export function ProductsView({ products, categories }: { products: SerializedProduct[]; categories: SerializedCategory[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.title.toLowerCase().includes(q) || (p.shortDesc ?? "").toLowerCase().includes(q));
  }, [products, search]);

  const productCategories = categories.filter((c) => c.type === "product" || c.type === "Product");
  const categorized = productCategories.map((cat) => ({
    category: cat,
    products: filtered.filter((p) => p.category?.id === cat.id),
  })).filter((g) => g.products.length > 0);

  const uncategorized = filtered.filter((p) => !p.category);

  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>
        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Products</div>
        <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Digital marketplace</h1>
        <p className="mt-2 text-muted-foreground">{filtered.length} product{filtered.length === 1 ? "" : "s"}.</p>

        <div className="mt-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="pl-10 bg-background" />
        </div>

        <div className="mt-10 space-y-12">
          {categorized.map(({ category, products: catProducts }) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-5">
                {category.image && <img src={category.image} alt="" className="h-8 w-8 rounded-lg object-cover" />}
                <h2 className="font-display text-2xl font-semibold">{category.name}</h2>
                <Badge variant="outline" className="text-[10px]">{catProducts.length}</Badge>
              </div>
              {category.description && <p className="text-sm text-muted-foreground mb-5 -mt-3">{category.description}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          ))}

          {uncategorized.length > 0 && (
            <div>
              {categorized.length > 0 && <h2 className="font-display text-2xl font-semibold mb-5">Other</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {uncategorized.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="font-display text-lg font-semibold">No products found</div>
              <div className="mt-1 text-sm text-muted-foreground">Try adjusting your search.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: SerializedProduct }) {
  const img = usableImage(product.coverImage) || usableImage(product.thumbnail);
  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[var(--fubrio-accent)]/40 glass-card">
      <div className="aspect-[16/10] relative overflow-hidden">
        {img ? (
          <img src={img} alt={product.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="rounded-full bg-background/95 backdrop-blur px-3 py-1 text-xs font-semibold">
            {product.isFree ? "Free" : `${product.currency === "INR" ? "₹" : "$"}${product.price}`}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-base group-hover:text-[var(--fubrio-accent)] transition-colors">{product.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.shortDesc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.demoUrl && (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> Demo
              </a>
            </Button>
          )}
          {!product.isFree && (product as any).purchaseUrl && (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href={(product as any).purchaseUrl} target="_blank" rel="noopener noreferrer">
                <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Purchase
              </a>
            </Button>
          )}
          {product.isFree && (product as any).downloadUrl && (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href={(product as any).downloadUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </a>
            </Button>
          )}
          {product.documentation && (
            <Button asChild size="sm" variant="ghost" className="rounded-full">
              <a href={product.documentation} target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-3.5 w-3.5 mr-1" /> Docs
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductDetail({ product }: { product: SerializedProduct }) {
  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#products")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to products
        </button>
        {product.coverImage && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6">
            <img src={product.coverImage} alt={product.title} className="h-full w-full object-cover" />
          </div>
        )}
        <h1 className="display-heading text-4xl">{product.title}</h1>
        <p className="mt-2 text-muted-foreground">{product.shortDesc}</p>
        <div className="mt-4 text-lg font-semibold">
          {product.isFree ? "Free" : `${product.currency === "INR" ? "₹" : "$"}${product.price}`}
        </div>
        {product.fullDesc && <div className="mt-6 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.fullDesc }} />}
        {product.features && product.features.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-xl font-semibold mb-3">Features</h2>
            <ul className="space-y-2">
              {product.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="text-[var(--fubrio-accent)]">✓</span> {f}</li>)}
            </ul>
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          {product.demoUrl && (
            <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Try demo
              </a>
            </Button>
          )}
          {!product.isFree && (product as any).purchaseUrl && (
            <Button asChild className="rounded-full">
              <a href={(product as any).purchaseUrl} target="_blank" rel="noopener noreferrer">
                <ShoppingCart className="h-4 w-4 mr-2" /> Purchase
              </a>
            </Button>
          )}
          {product.isFree && (product as any).downloadUrl && (
            <Button asChild className="rounded-full">
              <a href={(product as any).downloadUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" /> Download
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
