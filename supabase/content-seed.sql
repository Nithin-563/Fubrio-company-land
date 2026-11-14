-- ────────────────────────────────────────────────────────────────────────────
-- Fubrio — content seed: products, journal posts and FAQs for both brands
-- ────────────────────────────────────────────────────────────────────────────
-- Safe to run more than once: products/projects/posts upsert on slug, FAQs are
-- inserted only when the question does not already exist.
-- ────────────────────────────────────────────────────────────────────────────

-- ── Showcase entries: FubriOne and Deoid ────────────────────────────────────
insert into projects (title, slug, short_desc, full_desc, technologies, demo_url, status, visibility, featured, published_at, brand, "order")
values
(
  'FubriOne',
  'fubrione',
  'One API. Every AI. Connect the provider keys you already own and reach every model they unlock through a single OpenAI-compatible endpoint.',
  'FubriOne is an AI gateway for people who already pay for models. You connect provider keys — OpenAI, Anthropic, Gemini, Groq, Cerebras, Mistral, DeepSeek, OpenRouter, Together, Fireworks, Cohere, xAI, or any OpenAI-compatible endpoint such as vLLM, Ollama or LiteLLM — and FubriOne discovers what each key actually reaches.

Every connection re-syncs on a 24-hour cycle: it pulls the provider''s live model list, then probes a bounded budget of models with small real requests. A model is only marked available when a request succeeded, with time-to-first-token, latency, tool calling, vision and embeddings measured rather than assumed.

Applications talk to one endpoint: /v1/chat/completions, /v1/embeddings and /v1/models, with SSE streaming. You can call a model directly (groq/llama-3.3-70b-versatile) or let one of eight aliases — auto, fast, cheap, quality, reasoning, coding, vision, embedding — pick the best live model at request time. When a provider fails mid-request the next healthy candidate takes over, with bounded retries and no mid-stream provider switching.

Keys are encrypted with AES-256-GCM at rest and decrypted in memory only when a request needs them. FubriOne''s own keys are stored hashed, with scopes, monthly limits, expiry and one-click revocation. Usage is logged with token counts and estimated cost per key, provider, model and day.

It is free during early access and there is no per-token markup: requests go to your providers on your keys, and you pay them directly.',
  '["Next.js","TypeScript","PostgreSQL","OpenAI API","SSE"]'::jsonb,
  'https://fubrione.xyz',
  'LIVE',
  'PUBLIC',
  true,
  now(),
  'fubrio',
  1
),
(
  'Deoid',
  'deoid',
  'The coding agent that shows its work. Describe software in plain language; Deoid plans, writes real files, runs real checks and shows every diff.',
  'Deoid is an AI development workspace built around one rule: the agent has to prove what it did.

You describe what you want in plain language. Deoid explores the project, plans the work, then edits real files — and you watch each step in a Changes panel with actual diffs, a terminal running actual commands, and a live preview of the actual app. Chat and Code are two surfaces over the same project: converse in Chat, switch to Code for the editor, file tree and preview.

Panels dock beside or below the chat and are resizable and collapsible, so the workspace fits how you work rather than the other way round: terminal, files, cloud browser, changes. The agent must run its checks and show their real output; it never claims something works that it did not verify.

Publishing is one click to a deoidpages.xyz address with SSL, custom domains, deploy history and rollback. Model access is bring-your-own: any OpenAI-compatible provider, with keys kept in the browser. Guests get three credits a day, five when signed in, and no card is required.',
  '["Next.js","TypeScript","esbuild","OpenAI-compatible","Cloud"]'::jsonb,
  'https://deoid.xyz',
  'LIVE',
  'PUBLIC',
  true,
  now(),
  'fubrio',
  2
)
on conflict (slug) do update set
  short_desc = excluded.short_desc,
  full_desc = excluded.full_desc,
  technologies = excluded.technologies,
  demo_url = excluded.demo_url,
  status = excluded.status,
  visibility = excluded.visibility,
  featured = excluded.featured,
  published_at = coalesce(projects.published_at, excluded.published_at),
  brand = excluded.brand,
  "order" = excluded."order";

-- ── Shop / product catalogue entries for the same two products ───────────────
insert into products (title, slug, short_desc, full_desc, features, demo_url, price, currency, is_free, status, featured, technologies, published_at, brand, "order")
values
(
  'FubriOne',
  'fubrione',
  'One OpenAI-compatible API across every provider key you already own, with discovery, verification, routing and fallback.',
  'Bring your provider keys; FubriOne finds every model they reach, verifies them daily with real requests, and serves them behind one endpoint with honest usage accounting.',
  '["Single OpenAI-compatible endpoint","Daily model discovery and verification","Eight routing aliases","Bounded fallback across healthy candidates","Per-key usage and cost accounting","AES-256-GCM encrypted provider keys"]'::jsonb,
  'https://fubrione.xyz',
  0, 'USD', true, 'PUBLISHED', true, '["Next.js","TypeScript","PostgreSQL"]'::jsonb, now(), 'fubrio', 1
),
(
  'Deoid',
  'deoid',
  'An AI development workspace where the agent shows real diffs, real terminal output and real checks before it claims anything works.',
  'Describe software in plain language and watch it get planned, written and verified in a workspace with chat, code, terminal, files and cloud browser panels.',
  '["Chat and Code modes over one project","Dockable terminal, files, browser and changes","Verified checks with real output","One-click publish to deoidpages.xyz","Bring-your-own OpenAI-compatible provider"]'::jsonb,
  'https://deoid.xyz',
  0, 'USD', true, 'PUBLISHED', true, '["Next.js","TypeScript","esbuild"]'::jsonb, now(), 'fubrio', 2
)
on conflict (slug) do update set
  short_desc = excluded.short_desc,
  full_desc = excluded.full_desc,
  features = excluded.features,
  demo_url = excluded.demo_url,
  is_free = excluded.is_free,
  status = excluded.status,
  featured = excluded.featured,
  technologies = excluded.technologies,
  brand = excluded.brand,
  "order" = excluded."order";

-- ── Journal posts ───────────────────────────────────────────────────────────
insert into blog_posts (title, slug, excerpt, content, status, published_at, read_time, brand, featured)
values
(
  'What we changed in the 2026 rebuild',
  'what-we-changed-in-the-2026-rebuild',
  'The site was rebuilt around paper, ink and rules instead of glass, blur and gradient — and made measurably lighter in the process.',
  'Every studio site drifts towards the same look: translucent cards, blurred backgrounds, one accent gradient repeated until it means nothing. We had that. It loaded slowly and it read like a template.

The rebuild started from type. Instrument Serif for statements, Inter Tight for reading, a mono face for labels and numbers. Everything else follows: a warm paper background, near-black ink, one brick accent used sparingly, hairline rules instead of card shadows, and numbered chapters so the page reads like a table of contents.

Three practical rules came out of it. If a border can do the job, do not add a shadow. If a heading needs an icon to make sense, the heading is wrong. If a section has no number, it is probably not a section.

The other half was weight. Views that are not part of the homepage are now loaded on demand, icon imports are tree-shaken, the images that remain are static and cached, and the sticky header no longer composites a blurred surface on every scroll frame.

The result is a site that renders in one pass, works on a 390px screen without a separate mobile design, and looks the same in dark mode because the palette is inverted rather than duplicated.',
  'PUBLISHED', now(), 4, 'fubrio', true
),
(
  'How we scope and price a project',
  'how-we-scope-and-price-a-project',
  'Fixed price, fixed scope, written before any code. Here is the process we use, including the parts that usually go wrong.',
  'A quote that arrives without questions is a guess. Before we price anything we want to know what the product does on its worst day, who maintains it afterwards, and what already exists — because the cheapest project is the one where half of it is already built.

We scope in writing: screens, states, data, integrations, and what is explicitly out. Empty states and error states are in scope. "Make it feel premium" is not a requirement, it is a direction, and directions are free until they become extra screens.

Pricing is fixed for that scope. If the scope changes, we quote the change separately rather than absorbing it silently and delivering late.

What usually breaks a project is not code, it is a decision nobody made: who approves copy, where the data actually lives, what happens when a payment fails. We put those in the document, with a name against each.

Delivery is in slices you can use. First the data and the boring routes, then the interface, then the polish. You see a working build at each stage instead of a reveal at the end.

If you want the template we use for this, it is the same one behind the contact form on this site. Ask for it.',
  'PUBLISHED', now(), 5, 'fubrio', false
),
(
  'Why Bloom has no paid tier',
  'why-bloom-has-no-paid-tier',
  'A Discord bot that locks features behind a subscription creates a second job: selling. We would rather run one bot well.',
  'Bloom started as the bot our own servers needed: moderation that does not backfire, logging that is readable, tickets that close themselves, and music that does not disconnect mid-song.

The obvious next step was a premium tier. We did not take it, for two reasons.

The first is operational. Paid tiers mean billing infrastructure, plan gating, entitlement checks and support for people who paid — all of which compete with the work of making the bot better. A small team cannot do both well.

The second is trust. Moderation and security are the modules people most need, and they are exactly the modules a paywall would target. A server that cannot afford a subscription should not be a server without anti-raid protection.

So Bloom stays free, funded by the studio''s client work. There is no per-message billing, no locked command, and no upsell inside the bot.

What that costs us is scale: we run fewer shards than a funded bot would. What it buys is a product we can keep explaining honestly, which is worth more than the subscription revenue would be.',
  'PUBLISHED', now(), 4, 'fubrio', false
),
(
  'Running a small studio from India',
  'running-a-small-studio-from-india',
  'Time zones, payments, and the unglamorous logistics of building software for clients who are asleep when you ship.',
  'Most of our clients are not in our time zone. That is not a problem to solve, it is a constraint to design around.

Async first: written briefs, recorded walkthroughs, and a shared document per project instead of meetings that half the team attends at 11pm. When a call is necessary, it happens in the overlap window and produces decisions, not discussion.

Payments are the part nobody warns you about. International invoicing, currency conversion, and the fact that a "quick" refund can take a week. We price in a stable currency, state the currency on the invoice, and say who pays the transfer fee.

Infrastructure is chosen for latency where users are, not where we are. A database in the wrong region is a permanent tax on every request.

The last thing is documentation. When the person who built a system is eight hours away, the README is the on-call engineer. We write it before launch, not after the first incident.

None of this is exotic. It is just the difference between a studio that ships and one that is always about to.',
  'PUBLISHED', now(), 4, 'fubrio', false
),
(
  'Bloom 3.x: what actually changed',
  'bloom-3-what-changed',
  'Faster command handling, a stricter security module, and a configuration wizard that no longer requires reading the docs first.',
  'Bloom 3 is less about new commands and more about the ones you already use behaving predictably.

Command handling is faster because the hot paths stopped re-reading configuration on every invocation; module config is cached per guild and invalidated when it changes. The visible effect is that a moderation command responds before you finish typing the reason.

The security module got stricter defaults. Anti-raid now requires a threshold you set explicitly rather than guessing, anti-nuke alerts the owner before acting on mass deletions, and the panic lockdown is one command with a confirmation step instead of a menu.

Configuration is a wizard. /config walks through each module, shows the current value, and writes only what you change. No prefix hunting, no dashboard required.

Logging was rewritten around what moderators actually look for: who did what, to whom, in which channel, with a jump link. Edits and deletes keep the before and after.

Everything above ships in the free bot. There is no 3.x tier, and upgrading is just re-inviting Bloom with the same permissions.',
  'PUBLISHED', now(), 3, 'bloom', true
),
(
  'Moderation defaults that do not backfire',
  'moderation-defaults-that-do-not-backfire',
  'Aggressive automation feels safe until it mutes your most active member during a launch. Here is how to set thresholds you can live with.',
  'Every moderation system has two failure modes: it does nothing while a raid happens, or it acts on innocent behaviour and you spend the next day apologising.

Start with observation, not action. Run anti-spam and anti-raid in log-only mode for a week and read what they would have done. Most servers discover their thresholds were far too tight.

Set actions by confidence. High-confidence signals — identical messages from new accounts, mass joins in seconds, webhook spam — can act immediately. Low-confidence signals like "many mentions" should flag for a human.

Always leave an undo. Timeouts are reversible; bans are not. Bloom records every case with the reason and the moderator, so a wrong action is one command away from being reversed.

Protect the people who keep the server alive. Exempt staff roles, bots you trust, and your most active channels from aggressive filters. A raid is inconvenient; muting your community during a launch is worse.

Finally, write the policy down in a channel everyone can read. Automation enforces rules people know about; it should not be where they first learn them.',
  'PUBLISHED', now(), 4, 'bloom', false
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  status = excluded.status,
  read_time = excluded.read_time,
  brand = excluded.brand,
  featured = excluded.featured;

-- FAQs gained brand filtering in the same release as blog posts and projects.
alter table faqs add column if not exists brand text not null default 'fubrio';

-- ── FAQs — Fubrio ───────────────────────────────────────────────────────────
insert into faqs (question, answer, category, "order", published, brand)
select * from (values
  ('What does Fubrio actually do?',
   'We are a small software studio. We design and build web products for clients, and we run our own: Bloom, a free Discord bot; FubriOne, an AI model gateway; and Deoid, an AI development workspace.',
   'Studio', 1, true, 'fubrio'),
  ('How much does a project cost?',
   'It depends on scope, and we will not pretend otherwise. Small sites start in the low thousands of dollars; product work with authentication, payments and an admin area costs more. Send a brief and you will get a written scope and a fixed price before anything starts.',
   'Studio', 2, true, 'fubrio'),
  ('How long does a build take?',
   'A marketing site is usually two to four weeks. A product with accounts, payments and an admin area is typically six to twelve weeks, delivered in slices you can review as we go.',
   'Studio', 3, true, 'fubrio'),
  ('Do you work with clients outside India?',
   'Yes. Most of our work is remote and async, with calls in the overlap window. We invoice in a stable currency and state who pays transfer fees.',
   'Studio', 4, true, 'fubrio'),
  ('Who owns the code you write?',
   'For client work, ownership transfers on final payment as set out in the agreement. For our own products, the code and brand stay with Fubrio.',
   'Legal', 5, true, 'fubrio'),
  ('Can I get access to the APIs?',
   'Yes. Create an AI or announcements API key from the API keys page, read the docs, and call the endpoint with a bearer token. Keys carry scopes, rate limits and can be revoked at any time.',
   'Developers', 6, true, 'fubrio'),
  ('How do I submit a product to the shop?',
   'Use the submit form on the shop page and include the product, price, a cover image and how buyers receive it. We review submissions manually and reply by email.',
   'Shop', 7, true, 'fubrio'),
  ('How can my company advertise here?',
   'Use the advertising form. Tell us the product, the format and your budget; we reply within two working days with availability and a fixed price. We decline misleading creative and categories we cannot verify.',
   'Advertising', 8, true, 'fubrio'),
  ('Is Bloom really free?',
   'Yes. Every module and every command, with no paid tier and no per-message billing. Bloom is funded by the studio''s client work.',
   'Products', 9, true, 'fubrio'),
  ('What happens to my data if I ask for deletion?',
   'We delete what we can and confirm in writing. Records we must keep for tax or accounting (invoices, contracts) are retained for the period the law requires, and we tell you which ones those are.',
   'Legal', 10, true, 'fubrio')
) as v(question, answer, category, "order", published, brand)
where not exists (select 1 from faqs f where f.question = v.question);

-- ── FAQs — Bloom ────────────────────────────────────────────────────────────
insert into faqs (question, answer, category, "order", published, brand)
select * from (values
  ('Is Bloom free?',
   'Yes — every module and every command. There is no premium tier, no locked feature and no per-message billing.',
   'General', 1, true, 'bloom'),
  ('How many commands does Bloom have?',
   'Around 150 slash commands across 21 categories, all documented in the command index on this site.',
   'Commands', 2, true, 'bloom'),
  ('Do I need a prefix?',
   'No. Bloom uses slash commands by default. You can set an optional text prefix with /config if your community prefers it.',
   'Commands', 3, true, 'bloom'),
  ('Which permissions does Bloom need?',
   'Only what the modules you enable require. Invite it with the default set, then grant moderation or logging permissions when you turn those modules on.',
   'Setup', 4, true, 'bloom'),
  ('Does Bloom read my messages?',
   'Moderation and logging only process messages in channels where you enabled those modules, and logs store what a moderator needs: author, channel, content and a jump link. Nothing is sold or used to train models.',
   'Privacy', 5, true, 'bloom'),
  ('What happens if the music module disconnects?',
   'Bloom retries the stream and, if the source fails, falls back to the next available source instead of leaving an empty voice channel.',
   'Music', 6, true, 'bloom'),
  ('Can Bloom stop a raid automatically?',
   'Yes, once you set a join threshold. We recommend running anti-raid in log-only mode for a week first so you can see what it would have acted on.',
   'Security', 7, true, 'bloom'),
  ('How do I report a bug or request a feature?',
   'Use the bug report button on this site, or /report and /suggest in Discord. Reports land in the same queue the studio works from.',
   'Support', 8, true, 'bloom'),
  ('Where do I get help?',
   'Join the support server from the links on this page. Documentation for setup and modules is under Docs.',
   'Support', 9, true, 'bloom'),
  ('Can I self-host Bloom?',
   'Not currently. Bloom runs on our sharded infrastructure so moderation and logging keep working when your server is quiet.',
   'Setup', 10, true, 'bloom')
) as v(question, answer, category, "order", published, brand)
where not exists (select 1 from faqs f where f.question = v.question);
