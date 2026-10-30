import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

const SITE_URL = "https://fubrio.in";

export const metadata: Metadata = {
  title: "Fubrio - Digital Technology & Creative Ecosystem | Founded by K Nithin",
  description:
    "Fubrio builds products, software, AI tools, games, and creative experiments. A digital technology company by founder K Nithin. Join our Discord community.",
  keywords: [
    "Fubrio", "K Nithin", "fubrio.in", "digital studio", "creative technology",
    "software development", "web development", "AI tools", "SaaS",
    "tech company", "developer portfolio", "digital products",
    "app development", "India tech company", "Fubrio founder K Nithin",
    "Fubrio Discord", "Fubrio LinkedIn",
  ],
  authors: [{ name: "K Nithin", url: "https://www.linkedin.com/in/nithin-k-b8082a424" }],
  creator: "K Nithin",
  publisher: "Fubrio",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: `${SITE_URL}/favicon.ico`, sizes: "any" },
      { url: `${SITE_URL}/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${SITE_URL}/favicon-48.png`, sizes: "48x48", type: "image/png" },
      { url: `${SITE_URL}/fubrio-logo.png`, sizes: "1254x1254", type: "image/png" },
    ],
    apple: `${SITE_URL}/apple-touch-icon.png`,
    shortcut: `${SITE_URL}/favicon.ico`,
  },
  openGraph: {
    title: "Fubrio - Digital Technology & Creative Ecosystem | Founded by K Nithin",
    description: "Fubrio builds products, software, AI tools, games, and creative experiments. A digital technology company by founder K Nithin. Join our Discord: discord.gg/UmcWh4VdGK",
    siteName: "Fubrio",
    type: "website",
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        secureUrl: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Fubrio - Digital Technology & Creative Ecosystem Founded by K Nithin",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fubrio - Founded by K Nithin",
    description: "Digital technology and creative ecosystem. Products, software, AI tools, and creative experiments by K Nithin.",
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Fubrio",
    alternateName: "Fubrio Digital",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/fubrio-logo.png`,
      width: 1254,
      height: 1254,
    },
    image: `${SITE_URL}/og-image.png`,
    description: "Fubrio is a digital technology and creative ecosystem. We build products, software, AI tools, games, and creative experiments.",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: "K Nithin",
      url: "https://www.linkedin.com/in/nithin-k-b8082a424",
      jobTitle: "Founder & CEO",
      image: `${SITE_URL}/team/k-nithin.jpg`,
      sameAs: [
        "https://www.linkedin.com/in/nithin-k-b8082a424",
        "https://discord.gg/UmcWh4VdGK",
      ],
    },
    sameAs: [
      "https://discord.gg/UmcWh4VdGK",
      "https://www.linkedin.com/in/nithin-k-b8082a424",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@fubrio.in",
      contactType: "customer support",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Fubrio",
    url: SITE_URL,
    description: "Digital technology and creative ecosystem founded by K Nithin.",
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
    },
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: "K Nithin",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#founder`,
    name: "K Nithin",
    url: `${SITE_URL}/#team`,
    image: `${SITE_URL}/team/k-nithin.jpg`,
    jobTitle: "Founder & CEO",
    worksFor: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Fubrio",
    },
    sameAs: [
      "https://www.linkedin.com/in/nithin-k-b8082a424",
      "https://discord.gg/UmcWh4VdGK",
    ],
    description: "K Nithin is the founder and CEO of Fubrio, a digital technology and creative ecosystem company.",
  },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-48.png" sizes="48x48" />
        <link rel="icon" type="image/png" href="/fubrio-logo.png" sizes="1254x1254" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        {jsonLd.map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
