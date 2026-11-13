"use client";

import { ArrowLeft } from "lucide-react";
import { navigate } from "@/lib/router";
import { Meta } from "@/components/site/editorial";

type Kind = "terms" | "privacy" | "cookies";

interface Section {
  id: string;
  heading: string;
  body: React.ReactNode;
}

const CONTACT = "hello@fubrio.in";
const PRIVACY = "privacy@fubrio.in";
const LEGAL = "legal@fubrio.in";
const UPDATED = "13 November 2026";

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[0.9375rem] leading-relaxed text-muted-foreground">{children}</p>;
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mb-4 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          <span className="mt-[0.6em] h-px w-3 flex-shrink-0 bg-border" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Mail({ address }: { address: string }) {
  return (
    <a href={`mailto:${address}`} className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
      {address}
    </a>
  );
}

const TERMS: Section[] = [
  {
    id: "who-we-are",
    heading: "1. Who we are",
    body: (
      <>
        <P>
          Fubrio (&ldquo;Fubrio&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is an independent software
          studio based in India. We design and operate this website at fubrio.in and the products
          published under it, including Bloom (a Discord bot), FubriOne (an AI model gateway) and
          Deoid (an AI development workspace).
        </P>
        <P>
          By using this website or any Fubrio product you agree to these terms. If you are agreeing
          on behalf of a company, you confirm you are allowed to bind that company.
        </P>
      </>
    ),
  },
  {
    id: "accounts",
    heading: "2. Accounts and access",
    body: (
      <>
        <P>
          Admin and employee access to this site is restricted. You are responsible for keeping your
          credentials and access codes confidential, and for every action taken with them. Access may
          be suspended immediately if we suspect misuse.
        </P>
        <P>
          You must be old enough to enter a binding contract in your jurisdiction, and at least 13
          years old, to create an account or submit a form.
        </P>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "3. Acceptable use",
    body: (
      <>
        <P>You agree not to:</P>
        <List
          items={[
            "attempt to access accounts, data or systems you were not given access to;",
            "probe, scan or test the security of the site except with our written permission;",
            "use the site or its APIs to send spam, malware, or unlawful, hateful or infringing material;",
            "scrape the site at a rate that degrades service for others, or resell access without agreement;",
            "reverse engineer paid products, or remove licence notices from software you did not write.",
          ]}
        />
        <P>
          Automated requests to the public APIs must respect the documented rate limits and use an API
          key issued to you. Keys that abuse the service may be revoked without notice.
        </P>
      </>
    ),
  },
  {
    id: "products",
    heading: "4. Products and services",
    body: (
      <>
        <P>
          Free products (such as Bloom) are provided as-is, with no service-level guarantee. Paid
          work, subscriptions and shop purchases are governed by the scope, price and delivery terms
          agreed in writing for that engagement.
        </P>
        <P>
          Unless stated otherwise, payment for services is due before delivery, and digital goods are
          non-refundable once delivered. If something we delivered does not match the agreed scope,
          tell us and we will fix or refund it.
        </P>
      </>
    ),
  },
  {
    id: "content",
    heading: "5. Content and intellectual property",
    body: (
      <>
        <P>
          The site design, copy, code and brand assets belong to Fubrio or are used with permission.
          You may link to the site and quote short excerpts with attribution; you may not republish it
          as your own.
        </P>
        <P>
          When you send us material (a brief, files, a product submission), you keep ownership and
          grant us a licence to use it for the purpose you sent it for. For client work, ownership
          transfers as set out in the applicable agreement.
        </P>
      </>
    ),
  },
  {
    id: "advertising",
    heading: "6. Advertising",
    body: (
      <>
        <P>
          Advertising enquiries are accepted through the form on this site. Submitting an enquiry does
          not create a contract, reserve inventory or guarantee placement. All creative is reviewed,
          and we may decline any campaign, in particular one that is misleading, unlawful, or that
          promotes gambling, adult content, or financial products we cannot verify.
        </P>
        <P>
          Advertisers are responsible for the claims in their creative and for complying with the law
          in the countries they target.
        </P>
      </>
    ),
  },
  {
    id: "third-party",
    heading: "7. Third-party services and links",
    body: (
      <P>
        The site links to external sites and uses third-party infrastructure (hosting, database and
        email providers). We are not responsible for the content, availability or privacy practices of
        sites we do not operate.
      </P>
    ),
  },
  {
    id: "availability",
    heading: "8. Availability and changes",
    body: (
      <P>
        We aim to keep the site online but may suspend it for maintenance, security or reasons outside
        our control. Features may change or be withdrawn. These terms may be updated; the date at the
        top shows the current version, and continued use after a change means you accept it.
      </P>
    ),
  },
  {
    id: "liability",
    heading: "9. Disclaimers and liability",
    body: (
      <>
        <P>
          The site and free products are provided &ldquo;as is&rdquo; without warranties of any kind,
          to the extent permitted by law. We do not warrant that the site will be uninterrupted or
          error-free.
        </P>
        <P>
          To the extent permitted by law, Fubrio is not liable for indirect or consequential loss, lost
          profits or lost data. Our total liability for any claim connected with the site is limited to
          the amount you paid us in the twelve months before the claim, or INR 10,000 if you paid
          nothing.
        </P>
      </>
    ),
  },
  {
    id: "termination",
    heading: "10. Termination",
    body: (
      <P>
        We may suspend or end your access if you breach these terms or use the site in a way that
        harms us or others. Provisions that by their nature should survive termination (ownership,
        liability, governing law) do.
      </P>
    ),
  },
  {
    id: "law",
    heading: "11. Governing law",
    body: (
      <P>
        These terms are governed by the laws of India. The courts at our registered place of business
        have exclusive jurisdiction, without affecting any mandatory consumer protection rights you
        have where you live.
      </P>
    ),
  },
  {
    id: "contact",
    heading: "12. Contact",
    body: (
      <P>
        Questions about these terms: <Mail address={LEGAL} />. General enquiries:{" "}
        <Mail address={CONTACT} />.
      </P>
    ),
  },
];

const PRIVACY_SECTIONS: Section[] = [
  {
    id: "scope",
    heading: "1. Scope",
    body: (
      <P>
        This policy explains what Fubrio collects on fubrio.in and bloom.fubrio.in, why, and what you
        can do about it. It does not cover third-party sites we link to, or products that publish
        their own policy (FubriOne and Deoid each have one).
      </P>
    ),
  },
  {
    id: "collect",
    heading: "2. What we collect",
    body: (
      <>
        <List
          items={[
            "Details you submit: name, email, company, budget and message when you use a contact, project, advertising or product-submission form.",
            "Account data: if you sign in to the admin area, we store your name, email, role and (for employees) the permissions and access code assigned to you.",
            "Product data: if you create an API key or subscription, we store the key hash, its scopes, limits and usage counters.",
            "Technical data: IP address, browser user agent, timestamps and the page requested, kept in server logs for security and abuse prevention.",
            "Consent data: your cookie choice and the time you made it.",
          ]}
        />
        <P>
          We do not ask for, and do not want, special-category data (health, religion, political views)
          in a contact form. Please do not send it.
        </P>
      </>
    ),
  },
  {
    id: "why",
    heading: "3. Why we use it",
    body: (
      <List
        items={[
          "to answer your enquiry and, if we work together, to deliver the project;",
          "to operate accounts, permissions and API access securely;",
          "to keep the service available and defend it against abuse, fraud and attacks;",
          "to meet legal, tax and accounting obligations;",
          "to understand aggregate traffic so the site stays fast — only if you allow analytics cookies.",
        ]}
      />
    ),
  },
  {
    id: "basis",
    heading: "4. Legal bases",
    body: (
      <P>
        Where GDPR applies, we rely on: contract (delivering what you asked for), legitimate interests
        (running and securing the service), consent (optional cookies, marketing email) and legal
        obligation (records we must keep). Where India&rsquo;s DPDP Act applies, we process data for the
        purposes above with your consent or as otherwise permitted by that Act.
      </P>
    ),
  },
  {
    id: "sharing",
    heading: "5. Who we share it with",
    body: (
      <>
        <P>
          We do not sell personal data. We share it only with service providers who need it to run the
          site — hosting, database, email delivery, payment processing — under contracts that limit
          their use of it, and with authorities where the law requires it.
        </P>
        <P>
          Form submissions from this site are stored in our Supabase database. Email you send us may
          pass through our email provider.
        </P>
      </>
    ),
  },
  {
    id: "retention",
    heading: "6. How long we keep it",
    body: (
      <P>
        Enquiries are kept for up to 24 months after the last contact, unless they become a client
        record. Account, API and audit records are kept while the account exists and for up to 12
        months after. Server logs are kept for up to 90 days. Cookie consent records are kept for 12
        months.
      </P>
    ),
  },
  {
    id: "rights",
    heading: "7. Your rights",
    body: (
      <>
        <P>
          You can ask for a copy of your data, correction, deletion, restriction or portability, and
          you can object to processing based on legitimate interests. Email{" "}
          <Mail address={PRIVACY} /> and we will respond within 30 days. You can also complain to your
          local data protection authority.
        </P>
        <P>
          If you are a client, some records (invoices, contracts) must be retained even after a
          deletion request, as required by tax law.
        </P>
      </>
    ),
  },
  {
    id: "security",
    heading: "8. Security",
    body: (
      <P>
        Access to admin data requires an authenticated session with an explicit role, and database
        writes are restricted to the server. Passwords are stored as bcrypt hashes, API keys are stored
        hashed, and secrets live in server environment variables rather than the database. No system
        is perfect; if you find a vulnerability, please report it to <Mail address={LEGAL} /> before
        disclosing it publicly.
      </P>
    ),
  },
  {
    id: "children",
    heading: "9. Children",
    body: (
      <P>
        The site is not directed at children under 13, and we do not knowingly collect their data. If
        you believe a child submitted information, email us and we will delete it.
      </P>
    ),
  },
  {
    id: "transfers",
    heading: "10. International transfers",
    body: (
      <P>
        Our infrastructure providers may process data outside your country, including in the EU and
        the United States. Where required, transfers rely on standard contractual clauses or an
        equivalent safeguard.
      </P>
    ),
  },
  {
    id: "changes",
    heading: "11. Changes and contact",
    body: (
      <P>
        We will post any change on this page and update the date above. Privacy questions:{" "}
        <Mail address={PRIVACY} />.
      </P>
    ),
  },
];

const COOKIE_SECTIONS: Section[] = [
  {
    id: "what",
    heading: "1. What cookies we use",
    body: (
      <P>
        Cookies are small files a site stores in your browser. This site uses as few as possible, and
        nothing optional loads until you allow it.
      </P>
    ),
  },
  {
    id: "essential",
    heading: "2. Essential (always on)",
    body: (
      <List
        items={[
          <>
            <strong>next-auth.session-token</strong> — keeps an admin or employee signed in. Expires
            after 7 days or when you sign out.
          </>,
          <>
            <strong>fubrio_consent</strong> — records which cookie categories you accepted and when, so
            we do not ask again. Expires after 12 months.
          </>,
        ]}
      />
    ),
  },
  {
    id: "optional",
    heading: "3. Optional",
    body: (
      <>
        <P>
          <strong>Analytics</strong> — aggregate page views. Not enabled on this deployment, so no
          analytics cookie is set. If we enable it, it will only load after you accept analytics.
        </P>
        <P>
          <strong>Marketing</strong> — not used. Fubrio does not run advertising pixels on its own
          site.
        </P>
      </>
    ),
  },
  {
    id: "control",
    heading: "4. Changing your choice",
    body: (
      <P>
        Use the cookie settings link in the footer to reopen the banner, or clear site data in your
        browser. Blocking essential cookies will stop the admin area from working, but the public site
        still loads.
      </P>
    ),
  },
  {
    id: "more",
    heading: "5. More detail",
    body: (
      <P>
        What we collect beyond cookies, and your rights over it, is described in the{" "}
        <button onClick={() => navigate("#privacy")} className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
          privacy policy
        </button>
        .
      </P>
    ),
  },
];

const DOCS: Record<Kind, { title: string; lead: string; sections: Section[] }> = {
  terms: {
    title: "Terms & Conditions",
    lead: "The agreement between you and Fubrio for using this website and the products published under it.",
    sections: TERMS,
  },
  privacy: {
    title: "Privacy Policy",
    lead: "What we collect, why we collect it, how long we keep it, and how to get it removed.",
    sections: PRIVACY_SECTIONS,
  },
  cookies: {
    title: "Cookie Policy",
    lead: "The two essential cookies this site sets, what they do, and the optional ones that stay off until you allow them.",
    sections: COOKIE_SECTIONS,
  },
};

export function LegalView({ kind }: { kind: Kind }) {
  const doc = DOCS[kind];

  return (
    <div className="pb-20">
      <div className="border-b border-border">
        <div className="mx-auto max-w-[84rem] px-4 pt-10 sm:px-6 lg:px-8">
          <button onClick={() => navigate("#home")} className="link-arrow text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </button>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="eyebrow">Legal</span>
            <span className="text-muted-foreground/40">/</span>
            <Meta>Updated {UPDATED}</Meta>
          </div>

          <h1 className="display-heading mt-3 text-[2.5rem] leading-none sm:text-[3.5rem]">
            {doc.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-muted-foreground">{doc.lead}</p>
        </div>
      </div>

      <div className="mx-auto max-w-[84rem] px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <nav className="lg:col-span-3">
            <div className="border-t border-border pt-3 lg:sticky lg:top-24">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
                On this page
              </div>
              {doc.sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="block w-full border-b border-border/60 py-2 text-left text-[13px] text-muted-foreground transition-colors hover:text-[var(--fubrio-accent)]"
                >
                  {s.heading}
                </button>
              ))}
            </div>
          </nav>

          <article className="max-w-2xl lg:col-span-9">
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 border-b border-border py-7 first:border-t first:pt-0 first:border-t-0">
                <h2 className="mb-3 text-[1.125rem] font-medium">{s.heading}</h2>
                {s.body}
              </section>
            ))}

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
              <button onClick={() => navigate("#terms")} className="hover:text-foreground transition-colors">Terms</button>
              <button onClick={() => navigate("#privacy")} className="hover:text-foreground transition-colors">Privacy</button>
              <button onClick={() => navigate("#cookies")} className="hover:text-foreground transition-colors">Cookies</button>
              <a href={`mailto:${LEGAL}`} className="hover:text-foreground transition-colors">{LEGAL}</a>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
