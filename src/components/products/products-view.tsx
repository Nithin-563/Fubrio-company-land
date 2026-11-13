"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Search, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Meta } from "@/components/site/editorial";
import type { SerializedProduct, SerializedCategory } from "@/lib/types";
import { usableImage } from "@/components/shared/gradient";

const FIELD =
  "h-9 w-full rounded-none border-0 border-b border-border bg-transparent px-0 text-sm shadow-none focus-visible:border-foreground focus-visible:ring-0 dark:bg-transparent";

function priceOf(product: SerializedProduct) {
  if (product.isFree) return "Free";
  const symbol = product.currency === "INR" ? "₹" : product.currency === "USD" ? "$" : product.currency;
  return `${symbol}${product.price}`;
}

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
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("#home")}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </button>

        <div className="chapter-head">
          <div className="chapter-num">02</div>
          <div className="flex min-w-0 flex-1 flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">Products</div>
              <h1 className="display-heading mt-2 text-[2.4rem] leading-[1.02] sm:text-[3.2rem]">
                Things you can buy today
              </h1>
              <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
                Templates, tools and small software, priced plainly. {filtered.length} product
                {filtered.length === 1 ? "" : "s"} listed.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className={cn(FIELD, "pl-6")}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-12">
          {categorized.map(({ category, products: catProducts }) => (
            <section key={category.id}>
              <div className="flex items-baseline justify-between border-b border-border pb-1.5">
                <span className="eyebrow">{category.name}</span>
                <Meta>{catProducts.length}</Meta>
              </div>
              {category.description && (
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
              )}
              <div className="grid border-t border-border sm:grid-cols-2">
                {catProducts.map((product) => <ProductRow key={product.id} product={product} />)}
              </div>
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section>
              {categorized.length > 0 && (
                <div className="flex items-baseline justify-between border-b border-border pb-1.5">
                  <span className="eyebrow">Other</span>
                  <Meta>{uncategorized.length}</Meta>
                </div>
              )}
              <div className="grid border-t border-border sm:grid-cols-2">
                {uncategorized.map((product) => <ProductRow key={product.id} product={product} />)}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="py-24">
              <div className="font-display text-[1.8rem]">No products match “{search}”.</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Clear the search, or ask us whether we have something similar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: SerializedProduct }) {
  const img = usableImage(product.coverImage) || usableImage(product.thumbnail);
  return (
    <button
      onClick={() => navigate(`#products/${product.slug}`)}
      className="group flex items-start gap-4 border-b border-border px-0 py-4 text-left transition-colors hover:bg-foreground/[0.03] sm:px-4 sm:odd:border-r"
    >
      <span className="h-14 w-14 shrink-0 overflow-hidden border border-border bg-muted">
        {img ? (
          <img src={img} alt="" width={80} height={80} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-lg text-muted-foreground/40">
            {product.title.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-display text-[1.2rem] leading-tight transition-colors group-hover:text-[var(--fubrio-accent)]">
            {product.title}
          </span>
          <Meta>{priceOf(product)}</Meta>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-relaxed text-muted-foreground">
          {product.shortDesc}
        </span>
        {product.technologies.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-x-3">
            {product.technologies.slice(0, 3).map((t) => (
              <Meta key={t} className="text-muted-foreground/70">{t}</Meta>
            ))}
          </span>
        )}
      </span>

      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </button>
  );
}

export function ProductDetail({ product }: { product: SerializedProduct }) {
  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("#products")}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All products
        </button>

        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
          <div className="eyebrow">Product</div>
          <Meta>{priceOf(product)}</Meta>
        </div>

        <h1 className="display-heading mt-4 text-[2.4rem] leading-[1.02] sm:text-[3rem]">{product.title}</h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">{product.shortDesc}</p>

        {product.coverImage && (
          <div className="mt-6 aspect-[16/9] overflow-hidden border border-border bg-muted">
            <img src={product.coverImage} alt={product.title} width={1200} height={675} className="h-full w-full object-cover" />
          </div>
        )}

        {product.fullDesc && (
          <div
            className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-normal prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.fullDesc }}
          />
        )}

        {product.features && product.features.length > 0 && (
          <div className="mt-8">
            <div className="eyebrow border-b border-border pb-1.5">What is included</div>
            <ul className="ruled-list mt-0 border-t-0">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 py-2 text-[0.9375rem]">
                  <Meta className="pt-1">{String(i + 1).padStart(2, "0")}</Meta>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {product.demoUrl && (
            <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-ink">
              Try the demo <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
          {!product.isFree && (product as any).purchaseUrl && (
            <a href={(product as any).purchaseUrl} target="_blank" rel="noopener noreferrer" className="btn-ink">
              Buy now <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
          {product.isFree && (product as any).downloadUrl && (
            <a href={(product as any).downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-ink">
              Download
            </a>
          )}
          {product.documentation && (
            <a href={product.documentation} target="_blank" rel="noopener noreferrer" className="btn-line">
              Documentation
            </a>
          )}
          <button onClick={() => navigate("#contact")} className="link-arrow text-muted-foreground">
            Ask a question
          </button>
        </div>
      </div>
    </div>
  );
}
