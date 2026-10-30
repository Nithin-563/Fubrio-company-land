# Fubrio

A digital technology and creative ecosystem platform. Built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, **Supabase** (PostgreSQL), and NextAuth.

**Domain:** https://fubrio.in

---

## Quick start

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Pick a name (e.g. `fubrio`)
3. Set a strong database password (save it!)
4. Pick a region close to your users
5. Wait ~2 min for provisioning

### 2. Run the SQL schema

1. In Supabase Dashboard → **SQL Editor** → New query
2. Open `supabase/schema.sql` from this repo
3. Copy the entire contents into the SQL editor
4. Click **Run** - this creates all 25 tables

### 3. Get your API credentials

In Supabase Dashboard → **Project Settings → API**:
- **Project URL** - looks like `https://abcdefg.supabase.co`
- **anon public key** - a long JWT string (NOT the `service_role` key - never expose that one)

### 4. Configure environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### 5. Install and seed

```bash
bun install

# Seed demo content (admin users, projects, products, etc.)
bun run seed
```

### 6. Run

```bash
bun run dev
```

Open http://localhost:3000

---

## Admin access

There are two ways to access the admin dashboard:

### 1. Standard admin login
- URL: `/#admin`
- Configure an administrator account through your secure deployment process; do not commit credentials.
- Role: `SUPER_ADMIN` (full access)

### 2. Czer panel (hidden)
- Open the hamburger menu (mobile) or the "More" dropdown (desktop)
- Click the discrete "Czer" item at the bottom
- Set `CZER_CODE` in your server environment and enter the configured code
- Grants instant `SUPER_ADMIN` access as `czer@fubrio.in`

---

## Environment variables

Only **4 environment variables** - no connection strings, no pooled/direct URLs:

| Variable | Purpose | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon public key (safe for browser) | Supabase → Project Settings → API → Project API keys → `anon public` |
| `NEXTAUTH_SECRET` | JWT signing secret | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your deployed app URL | `http://localhost:3000` locally, or `https://fubrio.in` in production |

> **Note:** The `NEXT_PUBLIC_` prefix means these are exposed to the browser. This is by design - Supabase uses Row Level Security (RLS) to protect data, and the anon key is restricted by RLS policies. For production, you'll want to add RLS policies (the SQL schema above doesn't include them by default, but everything works because Supabase's default for new tables is to allow anon access - tighten this before going live).

---

## Short link manager

Admins can create short links at `fubrio.in/l/[slug]` that serve different content types:

- **File upload** - upload any file (ZIP, PDF, images, video, audio, etc. up to 100MB). Visiting the link downloads or displays the file.
- **Redirect URL** - visitors are 302-redirected to a target URL.
- **Text snippet** - serves plain text content.
- **Custom HTML embed** - renders a styled HTML page with your custom embed code.

Each link supports: custom slug, optional password, optional expiry, visit counter, active toggle.

---

## Architecture

### Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui (glassmorphism)
- **Database:** Supabase (PostgreSQL) - via `@supabase/supabase-js`
- **Auth:** NextAuth v4 (credentials provider, JWT sessions, bcrypt hashing)
- **Image processing:** Sharp (auto-resize + WebP for media uploads)

### Why Supabase?
- **Persistent writes** - data survives serverless function invocations
- **Free tier** - 500MB database, 1GB storage, 50k MAU
- **Simple config** - just URL + anon key, no connection strings
- **Built-in storage** - ready for media uploads via Supabase Storage
- **Real-time** - ready for future live features

### Database
- Schema: `supabase/schema.sql` (run once in Supabase SQL editor)
- 25 tables: users, accounts, sessions, categories, tags, projects, products, services, sponsors, partners, blog_posts, testimonials, faqs, events, metrics, inquiries, media_assets, pages, page_sections, reusable_blocks, nav_items, footer_columns, site_settings, audit_logs, short_links, and junction tables for tags
- Data access: `src/lib/supabase.ts` (client) + `src/lib/db.ts` (Prisma-compatible wrapper around Supabase)

### Role-based access
Four roles enforced server-side via `getServerSession`:
- `SUPER_ADMIN` - full access to everything
- `ADMIN` - content, users, settings, media, inquiries, navigation, pages
- `EDITOR` - content, media, inquiries, pages
- `CONTRIBUTOR` - create content, edit own

---

## Public website structure

| Route | Description |
|---|---|
| `#home` | Premium homepage with hero, showcase, ecosystem, services, sponsors, partners, community, testimonials, blog, contact |
| `#showcase` | All projects with search, filters, sort, pagination |
| `#showcase/[slug]` | Project detail |
| `#products` | Digital marketplace catalog |
| `#products/[slug]` | Product detail |
| `#blog` | Article listing |
| `#blog/[slug]` | Article with markdown rendering |
| `#faq` | Categorized FAQs |
| `#contact` | Contact form (validated, rate-limited, DB-persisted) |
| `#about` (and other CMS slugs) | Dynamic pages rendered from PageSections |
| `#czer` | Hidden Czer access panel |
| `#admin/*` | Admin dashboard (login required) |
| `/l/[slug]` | Public short link resolver (file/redirect/text/embed) |

---

## Admin dashboard sections

Overview, Showcase, Products, Services, Blog, Testimonials, FAQs, Events, Sponsors, Partners, **Link Manager**, Pages, Categories, Media Library, Inquiries, Users, Audit Logs, Settings.

---

## Demo content

The seed script (`scripts/seed.ts`) creates: 3 admin users (admin/czer/editor), 8 demo projects, 4 products, 6 services, 6 sponsors, 6 partners, 4 blog posts, 3 testimonials, 6 FAQs, 2 events, 4 metrics, 1 sample inquiry, 1 CMS "About" page, nav items, footer columns, site settings.

All demo content is clearly marked and replaceable via the admin dashboard.

---

## Deployment

### Step 1 - Set up Supabase (once)

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Copy your Project URL + anon key

### Step 2 - Set up locally (once)

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
bun install
bun run seed    # Seeds demo content into Supabase
```

Or just run `./setup.sh` - it walks you through it.

### Step 3 - Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Build settings auto-detected from `netlify.toml`:
   - Build command: `bun run build`
   - Publish directory: `.next`
4. **Set ALL 4 Environment Variables** in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = `https://your-site.netlify.app`
5. Deploy

### Step 4 - Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. **Set ALL 4 Environment Variables** (same as Netlify, but `NEXTAUTH_URL` = `https://your-app.vercel.app`)
4. Deploy - Vercel auto-detects Next.js via `vercel.json`

---

## Production checklist

- [ ] Create Supabase project
- [ ] Run `supabase/schema.sql` in Supabase SQL editor
- [ ] Run `./setup.sh` locally (installs deps, seeds demo content)
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` in Netlify/Vercel env vars
- [ ] Add Row Level Security policies to Supabase tables (for production)
- [ ] Deploy
- [ ] Test admin login and Czer flow on the deployed URL

---

## License

Proprietary. © Fubrio.


## FubFindz subdomain storefront

The same deployment serves a separate storefront when the incoming host is `fubfindz.fubrio.in`. The main Fubrio homepage also includes an **Open FubFindz Store** link. The floating bug-report button has been removed from the shared site chrome, so it no longer appears on either the Fubrio or Bloom host.

### Connect `fubfindz.fubrio.in` in Netlify

1. Open **Netlify → your existing Fubrio site → Domain management**.
2. Add `fubfindz.fubrio.in` as a custom domain/domain alias on this same site. Do not create a separate site unless you specifically want separate deployments.
3. Because Fubrio uses Netlify-managed DNS, open **Domain management → DNS settings** for the `fubrio.in` zone and add a CNAME record:
   - **Name/host:** `fubfindz`
   - **Target/value:** the existing site's Netlify hostname, such as `your-existing-site.netlify.app` (use the exact hostname shown in your Netlify site overview).
4. Save, wait for DNS propagation, and use Netlify's domain panel to check/enable HTTPS for `fubfindz.fubrio.in`.
5. Deploy this updated repository. The app detects the `fubfindz.fubrio.in` hostname and renders the storefront; other hosts continue to use the existing Fubrio/Bloom site.
6. Add `AMAZON_ASSOCIATE_TAG` in **Netlify → Site configuration → Environment variables** with your approved Amazon.in Associates tracking ID (for example, the tracking ID Amazon assigned to your account). Trigger a new deploy after setting it.

### Amazon product data

The storefront currently directs visitors to Amazon India search/category pages so Amazon can show its current catalogue, prices, discounts, availability, and product details. It does not scrape or copy Amazon's entire catalogue into FubFindz. To show product cards with live Amazon product names, images, prices, and discounts inside FubFindz, connect the current Amazon Associates Creators API (the legacy PA-API was scheduled for deprecation on May 15, 2026) and follow Amazon's data display, attribution, caching, and update requirements. Do not invent discount prices or hard-code stale prices.
