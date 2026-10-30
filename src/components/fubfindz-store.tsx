import { ArrowUpRight, Search, ShieldCheck, Tag, Truck, ShoppingBag } from "lucide-react";

const associateTag = process.env.AMAZON_ASSOCIATE_TAG?.trim() || "fubfindz-21";

const categories = [
  { name: "Electronics", description: "Phones, laptops, audio, accessories", query: "electronics" },
  { name: "Mobiles & Accessories", description: "Smartphones, chargers, cases, power banks", query: "mobile phones accessories" },
  { name: "Computers", description: "Laptops, keyboards, mice, monitors", query: "computer accessories laptops" },
  { name: "Home & Kitchen", description: "Useful finds for everyday living", query: "home kitchen products" },
  { name: "Fashion", description: "Clothing, shoes, bags and accessories", query: "fashion" },
  { name: "Beauty & Personal Care", description: "Personal care and grooming essentials", query: "beauty personal care" },
  { name: "Books", description: "Fiction, learning and reference", query: "books" },
  { name: "Toys & Games", description: "Games, toys and gifts", query: "toys games" },
  { name: "Sports & Outdoors", description: "Fitness, travel and outdoor gear", query: "sports outdoor fitness" },
  { name: "Office & Stationery", description: "Study, office and productivity supplies", query: "office stationery" },
  { name: "Grocery", description: "Pantry staples and everyday essentials", query: "grocery" },
  { name: "Deals & Offers", description: "Explore current offers directly on Amazon", query: "deals" },
];


const featuredProducts = [
  { name: "OnePlus Bullets Z2 Bluetooth Neckband", category: "Audio", description: "Wireless audio pick with fast charging", query: "OnePlus Bullets Z2 Bluetooth Wireless in Ear Earphones" },
  { name: "Logitech M186 Wireless Mouse", category: "Computer accessories", description: "Compact wireless mouse for everyday use", query: "Logitech M186 Wireless Mouse" },
  { name: "Ambrane USB-C Fast Charging Cable", category: "Mobile accessories", description: "Braided charging cable for compatible devices", query: "Ambrane Unbreakable Type C fast charging cable" },
  { name: "boAt Airdopes 141", category: "Audio", description: "True wireless earbuds for daily listening", query: "boAt Airdopes 141 earbuds" },
  { name: "Apple 20W USB-C Power Adapter", category: "Chargers", description: "USB-C power adapter for compatible devices", query: "Apple 20W USB-C Power Adapter" },
  { name: "Portronics USB-C OTG Adapter", category: "Computer accessories", description: "Connect compatible USB accessories to USB-C devices", query: "Portronics Bridge Y USB 3.0 Type C OTG Adapter" },
  { name: "SanDisk Ultra 64GB microSD Card", category: "Storage", description: "Expandable storage for compatible devices", query: "SanDisk Ultra 64GB microSDXC" },
  { name: "STRIFF Adjustable Laptop Stand", category: "Workspace", description: "A compact stand for a more comfortable desk setup", query: "STRIFF Adjustable Laptop Stand" },
  { name: "FUR JADEN Anti-Theft Laptop Backpack", category: "Bags", description: "Backpack with a laptop compartment and organiser pockets", query: "FUR JADEN Anti Theft Laptop Backpack" },
  { name: "Tapo TP-Link C210 Smart Wi-Fi Camera", category: "Smart home", description: "Pan-and-tilt indoor camera with app-connected features", query: "TP-Link Tapo C210 camera" },
  { name: "JBL C100SI Wired Earphones", category: "Audio", description: "Wired earphones with an in-line microphone", query: "JBL C100SI wired earphones" },
  { name: "HP v236w 64GB USB Pen Drive", category: "Storage", description: "Portable USB storage for compatible computers", query: "HP v236w 64GB pen drive" },
];

function amazonSearchUrl(query: string) {
  const params = new URLSearchParams({ k: query });
  if (associateTag) params.set("tag", associateTag);
  return `https://www.amazon.in/s?${params.toString()}`;
}

export function FubFindzStore() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#16181d]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="https://fubrio.in" className="text-sm text-slate-500 hover:text-black">← Fubrio</a>
          <a href="/" className="text-xl font-bold tracking-tight sm:text-2xl">Fub<span className="text-[#5268e8]">Findz</span></a>
          <a href={amazonSearchUrl("deals")} target="_blank" rel="sponsored nofollow noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#16181d] px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            <ShoppingBag className="h-4 w-4" /> Browse Amazon
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5268e8]">A Fubrio store</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Find your next favourite.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Explore products across popular categories and check current prices and offers on Amazon India.
          </p>
          <form action="https://www.amazon.in/s" method="get" target="_blank" className="mt-8 flex max-w-2xl gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-sm">
            <Search className="ml-3 mt-3 h-5 w-5 shrink-0 text-slate-400" />
            <input name="k" required aria-label="Search Amazon products" placeholder="Search products on Amazon..." className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none sm:text-base" />
            {associateTag && <input type="hidden" name="tag" value={associateTag} />}
            <button type="submit" className="rounded-xl bg-[#5268e8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4055d3] sm:px-6">Search</button>
          </form>
          <p className="mt-3 text-xs text-slate-500">Search results, prices, availability and discounts are provided by Amazon and may change.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Starter catalogue</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Products to explore</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">A starter selection of real product searches. Tap through to Amazon to confirm the current listing, price, availability and offers.</p>
          </div>
          <a href={amazonSearchUrl("best sellers")} target="_blank" rel="sponsored nofollow noopener noreferrer" className="hidden items-center gap-1 text-sm font-semibold text-[#5268e8] sm:inline-flex">More products <ArrowUpRight className="h-4 w-4" /></a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <article key={product.name} className="flex flex-col rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5268e8]/10 text-[#5268e8]"><ShoppingBag className="h-6 w-6" /></div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{product.category}</p>
              <h3 className="mt-2 text-base font-semibold leading-6">{product.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{product.description}</p>
              <a href={amazonSearchUrl(product.query)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#5268e8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4055d3]">View on Amazon <ArrowUpRight className="h-4 w-4" /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Browse by interest</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Explore categories</h2>
          </div>
          <a href={amazonSearchUrl("deals")} target="_blank" rel="sponsored nofollow noopener noreferrer" className="hidden items-center gap-1 text-sm font-semibold text-[#5268e8] sm:inline-flex">See Amazon offers <ArrowUpRight className="h-4 w-4" /></a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <a key={category.name} href={amazonSearchUrl(category.query)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="group rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#5268e8]/50 hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5268e8]/10 text-[#5268e8]"><Tag className="h-5 w-5" /></div>
                <span className="text-xs text-slate-400">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{category.name}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{category.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#5268e8]">Explore on Amazon <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
            </a>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8">
          <div className="flex gap-3"><Tag className="mt-1 h-5 w-5 shrink-0 text-[#5268e8]" /><div><h3 className="font-semibold">Check live offers</h3><p className="mt-1 text-sm text-slate-500">Confirm the latest price and discount on Amazon before ordering.</p></div></div>
          <div className="flex gap-3"><Truck className="mt-1 h-5 w-5 shrink-0 text-[#5268e8]" /><div><h3 className="font-semibold">Amazon checkout</h3><p className="mt-1 text-sm text-slate-500">Orders, delivery, payment and returns are handled by Amazon.</p></div></div>
          <div className="flex gap-3"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#5268e8]" /><div><h3 className="font-semibold">Clear disclosure</h3><p className="mt-1 text-sm text-slate-500">FubFindz may earn from qualifying purchases made through affiliate links.</p></div></div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-5 py-8 text-xs leading-6 text-slate-500 sm:px-8">
        <p>FubFindz is an independent product-discovery website and is not operated by Amazon. Product details, prices, availability and offers are controlled by Amazon and may change.</p>
        <p className="mt-2">As an Amazon Associate I earn from qualifying purchases.</p>
        {!associateTag && <p className="mt-2 text-amber-700">Affiliate tracking is not configured yet. Add AMAZON_ASSOCIATE_TAG to this Netlify site after your Amazon Associates tracking ID is ready.</p>}
        <p className="mt-3">© {new Date().getFullYear()} FubFindz by <a className="underline underline-offset-2" href="https://fubrio.in">Fubrio</a>.</p>
      </footer>
    </main>
  );
}
