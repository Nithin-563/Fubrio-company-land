const iso = (d: string) => new Date(d).toISOString();

export const FALLBACK_PROJECTS = [
  {
    id: "fp-bloom",
    title: "Bloom",
    slug: "bloom",
    shortDesc:
      "An all-in-one Discord bot: moderation, security, music, tickets and 150 commands, free for every server.",
    fullDesc:
      "Bloom is the bot our own servers needed: moderation that does not backfire, readable logging, tickets that close themselves and music that keeps playing. Twelve modules ship together, every command is documented, and there is no paid tier.",
    thumbnail: null,
    coverImage: null,
    gallery: [],
    videos: [],
    demoUrl: null,
    githubUrl: null,
    downloadUrl: null,
    purchaseUrl: null,
    technologies: ["Discord.js", "TypeScript", "Node", "PostgreSQL"],
    status: "LIVE",
    visibility: "PUBLIC",
    featured: true,
    launchDate: null,
    publishedAt: iso("2026-01-11"),
    authorId: null,
    contributors: [],
    client: null,
    meta: {},
    categoryId: null,
    order: 1,
    tags: [],
    category: null,
  },
  {
    id: "fp-fubrione",
    title: "FubriOne",
    slug: "fubrione",
    shortDesc:
      "One API. Every AI. Connect the provider keys you already own and reach every model they unlock behind a single OpenAI-compatible endpoint.",
    fullDesc:
      "FubriOne discovers what each provider key actually reaches, verifies every model daily with small real requests, and routes across them at request time. Eight aliases cover fast, cheap, quality, reasoning, coding, vision and embeddings, with bounded fallback when a provider fails mid-request. Keys are encrypted with AES-256-GCM and never shown again.",
    thumbnail: null,
    coverImage: null,
    gallery: [],
    videos: [],
    demoUrl: "https://fubrione.xyz",
    githubUrl: null,
    downloadUrl: null,
    purchaseUrl: null,
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "OpenAI API", "SSE"],
    status: "LIVE",
    visibility: "PUBLIC",
    featured: true,
    launchDate: null,
    publishedAt: iso("2026-10-02"),
    authorId: null,
    contributors: [],
    client: null,
    meta: {},
    categoryId: null,
    order: 2,
    tags: [],
    category: null,
  },
  {
    id: "fp-deoid",
    title: "Deoid",
    slug: "deoid",
    shortDesc:
      "The coding agent that shows its work: real files, real checks, real diffs, in a workspace built for building.",
    fullDesc:
      "Describe software in plain language. Deoid explores the project, plans the work, writes the files, runs the checks and shows every diff in the Changes panel while the terminal shows the real commands. Publish to a deoidpages.xyz address with SSL and rollback, or bring your own OpenAI-compatible provider.",
    thumbnail: null,
    coverImage: null,
    gallery: [],
    videos: [],
    demoUrl: "https://deoid.xyz",
    githubUrl: null,
    downloadUrl: null,
    purchaseUrl: null,
    technologies: ["Next.js", "TypeScript", "esbuild", "OpenAI-compatible"],
    status: "LIVE",
    visibility: "PUBLIC",
    featured: true,
    launchDate: null,
    publishedAt: iso("2026-11-01"),
    authorId: null,
    contributors: [],
    client: null,
    meta: {},
    categoryId: null,
    order: 3,
    tags: [],
    category: null,
  },
];

export const FALLBACK_TEAM = [
  {
    id: "tm-nithin",
    name: "K Nithin",
    role: "Founder & Engineer",
    bio: "Builds the products and the studio behind them. Works on Fubrio full time.",
    photo: null,
    email: "hello@fubrio.in",
    linkedin: "https://www.linkedin.com/in/nithin-k-b8082a424",
    twitter: null,
    github: null,
    website: "https://fubrio.in",
    order: 1,
  },
  {
    id: "tm-zyvrae",
    name: "Zyvrae",
    role: "Design",
    bio: "Art direction, interface design and the type on this site.",
    photo: null,
    email: null,
    linkedin: null,
    twitter: null,
    github: null,
    website: null,
    order: 2,
  },
];

const FUBRIO_POSTS = [
  {
    id: "fb-1",
    title: "What we changed in the 2026 rebuild",
    slug: "what-we-changed-in-the-2026-rebuild",
    excerpt:
      "The site was rebuilt around paper, ink and rules instead of glass, blur and gradient — and made lighter in the process.",
    content:
      "Every studio site drifts towards the same look: translucent cards, blurred backgrounds, one accent gradient repeated until it means nothing. We had that. It loaded slowly and read like a template.\n\nThe rebuild started from type. Instrument Serif for statements, Inter Tight for reading, a mono face for labels and numbers. A warm paper background, near-black ink, one brick accent used sparingly, hairline rules instead of card shadows, numbered chapters so the page reads like a table of contents.\n\nThree rules came out of it. If a border can do the job, do not add a shadow. If a heading needs an icon to make sense, the heading is wrong. If a section has no number, it is probably not a section.\n\nThe other half was weight: views outside the homepage load on demand, icon imports are tree-shaken, and the sticky header no longer composites a blurred surface on every scroll frame.",
    coverImage: null,
    author: null,
    status: "PUBLISHED",
    featured: true,
    publishedAt: iso("2026-11-13"),
    readTime: 4,
    brand: "fubrio",
    category: null,
    tags: [],
  },
  {
    id: "fb-2",
    title: "How we scope and price a project",
    slug: "how-we-scope-and-price-a-project",
    excerpt:
      "Fixed price, fixed scope, written before any code. Here is the process, including the parts that usually go wrong.",
    content:
      "A quote that arrives without questions is a guess. Before we price anything we want to know what the product does on its worst day, who maintains it afterwards, and what already exists.\n\nWe scope in writing: screens, states, data, integrations, and what is explicitly out. Empty and error states are in scope. Pricing is fixed for that scope; if it changes, we quote the change separately rather than absorbing it silently and delivering late.\n\nWhat breaks projects is rarely code. It is a decision nobody made: who approves copy, where the data lives, what happens when a payment fails. We put those in the document with a name against each, and we deliver in slices you can actually use.",
    coverImage: null,
    author: null,
    status: "PUBLISHED",
    featured: false,
    publishedAt: iso("2026-11-06"),
    readTime: 5,
    brand: "fubrio",
    category: null,
    tags: [],
  },
  {
    id: "fb-3",
    title: "Why Bloom has no paid tier",
    slug: "why-bloom-has-no-paid-tier",
    excerpt:
      "A bot that locks features behind a subscription creates a second job: selling. We would rather run one bot well.",
    content:
      "Bloom started as the bot our own servers needed: moderation that does not backfire, logging that is readable, tickets that close themselves.\n\nThe obvious next step was a premium tier. We did not take it. Paid tiers mean billing infrastructure, plan gating, entitlement checks and support for people who paid — all of which compete with making the bot better. And moderation and security are exactly the modules a paywall would target, which means a server that cannot pay would be a server without anti-raid protection.\n\nSo Bloom stays free, funded by client work. There is no per-message billing and no locked command.",
    coverImage: null,
    author: null,
    status: "PUBLISHED",
    featured: false,
    publishedAt: iso("2026-10-22"),
    readTime: 4,
    brand: "fubrio",
    category: null,
    tags: [],
  },
  {
    id: "fb-4",
    title: "Running a small studio from India",
    slug: "running-a-small-studio-from-india",
    excerpt:
      "Time zones, payments, and the unglamorous logistics of building software for clients who are asleep when you ship.",
    content:
      "Most of our clients are not in our time zone. That is not a problem to solve, it is a constraint to design around.\n\nAsync first: written briefs, recorded walkthroughs, one shared document per project instead of calls half the team attends at 11pm. Payments get priced in a stable currency, with the fee bearer stated on the invoice. Infrastructure is chosen for latency where users are, not where we are.\n\nAnd the README is the on-call engineer. When the person who built a system is eight hours away, documentation is not optional — we write it before launch, not after the first incident.",
    coverImage: null,
    author: null,
    status: "PUBLISHED",
    featured: false,
    publishedAt: iso("2026-10-09"),
    readTime: 4,
    brand: "fubrio",
    category: null,
    tags: [],
  },
];

const BLOOM_POSTS = [
  {
    id: "bb-1",
    title: "Bloom 3.x: what actually changed",
    slug: "bloom-3-what-changed",
    excerpt:
      "Faster command handling, a stricter security module, and a configuration wizard that no longer needs the docs.",
    content:
      "Bloom 3 is less about new commands and more about the ones you already use behaving predictably.\n\nCommand handling is faster because hot paths stopped re-reading configuration on every invocation; module config is cached per guild and invalidated when it changes. Security defaults are stricter: anti-raid needs a threshold you set explicitly, anti-nuke alerts the owner before acting on mass deletions, and panic lockdown is one command with a confirmation step.\n\nConfiguration is a wizard. /config walks each module, shows the current value and writes only what you change. Everything here ships in the free bot.",
    coverImage: null,
    author: null,
    status: "PUBLISHED",
    featured: true,
    publishedAt: iso("2026-11-10"),
    readTime: 3,
    brand: "bloom",
    category: null,
    tags: [],
  },
  {
    id: "bb-2",
    title: "Moderation defaults that do not backfire",
    slug: "moderation-defaults-that-do-not-backfire",
    excerpt:
      "Aggressive automation feels safe until it mutes your most active member during a launch. Set thresholds you can live with.",
    content:
      "Every moderation system has two failure modes: it does nothing during a raid, or it acts on innocent behaviour and you spend the next day apologising.\n\nStart with observation. Run anti-spam and anti-raid in log-only mode for a week and read what they would have done — most servers find their thresholds were far too tight. Act by confidence: mass joins and identical messages from new accounts can act immediately; \"many mentions\" should flag for a human.\n\nAlways leave an undo. Timeouts are reversible, bans are not, and every action is recorded as a case with a reason. Then write the policy somewhere everyone can read.",
    coverImage: null,
    author: null,
    status: "PUBLISHED",
    featured: false,
    publishedAt: iso("2026-10-28"),
    readTime: 4,
    brand: "bloom",
    category: null,
    tags: [],
  },
];

export function fallbackPosts(brand: string) {
  return brand === "bloom" ? BLOOM_POSTS : [...FUBRIO_POSTS, ...BLOOM_POSTS];
}

const FUBRIO_FAQS = [
  ["What does Fubrio actually do?", "We are a small software studio. We design and build web products for clients, and we run our own: Bloom, a free Discord bot; FubriOne, an AI model gateway; and Deoid, an AI development workspace.", "Studio"],
  ["How much does a project cost?", "It depends on scope, and we will not pretend otherwise. Small sites start in the low thousands of dollars; product work with accounts, payments and an admin area costs more. Send a brief and you get a written scope and a fixed price before anything starts.", "Studio"],
  ["How long does a build take?", "A marketing site is usually two to four weeks. A product with accounts, payments and an admin area is typically six to twelve weeks, delivered in slices you can review as we go.", "Studio"],
  ["Do you work with clients outside India?", "Yes. Most of our work is remote and async, with calls in the overlap window. We invoice in a stable currency and state who pays transfer fees.", "Studio"],
  ["Who owns the code you write?", "For client work, ownership transfers on final payment as set out in the agreement. For our own products, the code and brand stay with Fubrio.", "Legal"],
  ["Can I get access to the APIs?", "Yes. Create an AI or announcements API key from the API keys page, read the docs, and call the endpoint with a bearer token. Keys carry scopes, rate limits and can be revoked at any time.", "Developers"],
  ["How do I submit a product to the shop?", "Use the submit form on the shop page with the product, price, a cover image and how buyers receive it. We review submissions manually and reply by email.", "Shop"],
  ["How can my company advertise here?", "Use the advertising form. Tell us the product, format and budget; we reply within two working days with availability and a fixed price. We decline misleading creative and categories we cannot verify.", "Advertising"],
  ["Is Bloom really free?", "Yes. Every module and every command, with no paid tier and no per-message billing. Bloom is funded by the studio's client work.", "Products"],
  ["What happens to my data if I ask for deletion?", "We delete what we can and confirm in writing. Records we must keep for tax or accounting (invoices, contracts) are retained for the period the law requires, and we tell you which ones those are.", "Legal"],
];

const BLOOM_FAQS = [
  ["Is Bloom free?", "Yes — every module and every command. There is no premium tier, no locked feature and no per-message billing.", "General"],
  ["How many commands does Bloom have?", "Around 150 slash commands across 21 categories, all documented in the command index on this site.", "Commands"],
  ["Do I need a prefix?", "No. Bloom uses slash commands by default. You can set an optional text prefix with /config if your community prefers it.", "Commands"],
  ["Which permissions does Bloom need?", "Only what the modules you enable require. Invite it with the default set, then grant moderation or logging permissions when you turn those modules on.", "Setup"],
  ["Does Bloom read my messages?", "Moderation and logging only process messages in channels where you enabled those modules, and logs store what a moderator needs: author, channel, content and a jump link. Nothing is sold or used to train models.", "Privacy"],
  ["What happens if the music module disconnects?", "Bloom retries the stream and, if the source fails, falls back to the next available source instead of leaving an empty voice channel.", "Music"],
  ["Can Bloom stop a raid automatically?", "Yes, once you set a join threshold. We recommend running anti-raid in log-only mode for a week first so you can see what it would have acted on.", "Security"],
  ["How do I report a bug or request a feature?", "Use the bug report button on this site, or /report and /suggest in Discord. Reports land in the same queue the studio works from.", "Support"],
  ["Where do I get help?", "Join the support server from the links on this page. Setup and module documentation is under Docs.", "Support"],
  ["Can I self-host Bloom?", "Not currently. Bloom runs on our sharded infrastructure so moderation and logging keep working when your server is quiet.", "Setup"],
];

export function fallbackFaqs(brand: string) {
  const rows = brand === "bloom" ? BLOOM_FAQS : [...FUBRIO_FAQS, ...BLOOM_FAQS];
  return rows.map(([question, answer, category], i) => ({
    id: `fb-faq-${i}`,
    question,
    answer,
    category,
    order: i + 1,
    published: true,
  }));
}
