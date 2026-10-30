"use client";

import { ArrowUpRight, Code2, Sparkles, Smartphone, Bot, Palette, Cloud, Check, Wrench, Server, Database, HardDrive, Globe, Cpu, ShieldCheck, X, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { navigate } from "@/lib/router";
import type { SerializedService, SerializedCategory } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe: Code2, Sparkles: Sparkles, Smartphone: Smartphone, Bot: Bot,
  Palette: Palette, Cloud: Cloud, Code: Code2, Wrench: Wrench,
};


type HostingPlan = {
  name: string;
  price: string;
  specs: string[];
};

type HostingService = {
  title: string;
  summary: string;
  from: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  plans: HostingPlan[];
};

function catalogGroup(title: string, from: string, plans: [string, string][], icon: React.ComponentType<{ className?: string }> = Code2, summary = "A practical service with scope confirmed before work begins."): AppService {
  return {
    title,
    summary,
    from,
    icon,
    features: ["Scope agreed before work starts", "Clear deliverables", "Updates during the project", "Contact Fubrio for a tailored quote"],
    plans: plans.map(([name, price]) => ({ name, price, specs: ["Scope-based delivery", "Requirements review", "Project handover"] })),
  };
}

const HOSTING_SERVICES: HostingService[] = [
  {
    title: "Minecraft Hosting",
    summary: "Affordable game servers for small communities and growing networks.",
    from: "From ₹49/mo",
    icon: Server,
    features: ["Java server support", "NVMe storage", "Flexible CPU allocations", "Custom plans available"],
    plans: [
      { name: "Grass", price: "₹49/mo", specs: ["2 GB RAM", "100% CPU", "15 GB NVMe"] },
      { name: "Iron", price: "₹89/mo", specs: ["4 GB RAM", "150% CPU", "25 GB NVMe"] },
      { name: "Diamond", price: "₹129/mo", specs: ["6 GB RAM", "200% CPU", "40 GB NVMe"] },
      { name: "Emerald", price: "₹169/mo", specs: ["8 GB RAM", "250% CPU", "50 GB NVMe"] },
      { name: "Netherite", price: "₹249/mo", specs: ["12 GB RAM", "350% CPU", "75 GB NVMe"] },
      { name: "Beacon", price: "₹349/mo", specs: ["16 GB RAM", "450% CPU", "100 GB NVMe"] },
      { name: "Infinity", price: "₹499/mo", specs: ["24 GB RAM", "600% CPU", "150 GB NVMe"] },
      { name: "Custom", price: "Custom", specs: ["Choose your RAM", "Choose your CPU", "Choose your storage"] },
    ],
  },
  {
    title: "Discord Bot Hosting",
    summary: "Run Discord bots without managing a full server yourself.",
    from: "From ₹29/mo",
    icon: Bot,
    features: ["Node.js and Python workloads", "NVMe storage", "Scalable resource tiers", "Custom bot deployments"],
    plans: [
      { name: "Starter", price: "₹29/mo", specs: ["512 MB RAM", "50% CPU", "3 GB NVMe"] },
      { name: "Basic", price: "₹59/mo", specs: ["1 GB RAM", "100% CPU", "6 GB NVMe"] },
      { name: "Pro", price: "₹99/mo", specs: ["2 GB RAM", "150% CPU", "12 GB NVMe"] },
      { name: "Advanced", price: "₹179/mo", specs: ["4 GB RAM", "200% CPU", "25 GB NVMe"] },
      { name: "Elite", price: "₹299/mo", specs: ["8 GB RAM", "300% CPU", "50 GB NVMe"] },
      { name: "Ultimate", price: "₹549/mo", specs: ["16 GB RAM", "500% CPU", "100 GB NVMe"] },
    ],
  },
  {
    title: "Bot Hosting",
    summary: "Simple hosting for Discord, Telegram, and custom bots.",
    from: "From ₹29/mo",
    icon: Cpu,
    features: ["Discord and Telegram bots", "Custom runtime support", "Resource-based plans", "Deployment assistance"],
    plans: [
      { name: "Starter", price: "₹29/mo", specs: ["Small bot workloads", "Basic resource allocation", "Shared deployment support"] },
      { name: "Custom", price: "Custom", specs: ["Choose the runtime", "Choose resources", "Choose deployment setup"] },
    ],
  },
  {
    title: "Website Hosting",
    summary: "Hosting for portfolios, landing pages, business sites, and larger websites.",
    from: "From ₹29/mo",
    icon: Globe,
    features: ["Static and full website options", "NVMe plans available", "Domain and DNS assistance", "Migration support"],
    plans: [
      { name: "Static Starter", price: "₹29/mo", specs: ["2 GB storage", "Portfolio and landing pages"] },
      { name: "Static Basic", price: "₹59/mo", specs: ["5 GB storage", "Small business websites"] },
      { name: "Static Pro", price: "₹99/mo", specs: ["15 GB storage", "Larger static websites"] },
      { name: "Static Business", price: "₹199/mo", specs: ["30 GB storage", "Business workloads"] },
      { name: "Essential", price: "₹99/mo", specs: ["10 GB NVMe", "Full website hosting"] },
      { name: "Professional", price: "₹199/mo", specs: ["25 GB NVMe", "Growing websites"] },
      { name: "Business", price: "₹349/mo", specs: ["50 GB NVMe", "Higher storage needs"] },
      { name: "Enterprise", price: "₹599/mo", specs: ["100 GB NVMe", "Custom requirements"] },
    ],
  },
  {
    title: "Web App and Backend Hosting",
    summary: "Resources for APIs, dashboards, web apps, and backend services.",
    from: "From ₹149/mo",
    icon: Code2,
    features: ["Application and API workloads", "Dedicated resource tiers", "Deployment assistance", "Custom infrastructure options"],
    plans: [
      { name: "Starter", price: "₹149/mo", specs: ["1 GB RAM", "1 vCPU", "10 GB storage"] },
      { name: "Developer", price: "₹299/mo", specs: ["2 GB RAM", "2 vCPU", "25 GB storage"] },
      { name: "Pro", price: "₹499/mo", specs: ["4 GB RAM", "2 vCPU", "50 GB storage"] },
      { name: "Business", price: "₹899/mo", specs: ["8 GB RAM", "4 vCPU", "100 GB storage"] },
      { name: "Enterprise", price: "₹1,599/mo", specs: ["16 GB RAM", "6 vCPU", "200 GB storage"] },
    ],
  },
  {
    title: "VPS Hosting",
    summary: "Virtual private servers for teams that need more control.",
    from: "From ₹299/mo",
    icon: Server,
    features: ["Virtual private server plans", "NVMe storage", "Flexible CPU and RAM", "Custom server setups"],
    plans: [
      { name: "VPS Nano", price: "₹299/mo", specs: ["1 vCPU", "2 GB RAM", "25 GB NVMe"] },
      { name: "VPS Starter", price: "₹499/mo", specs: ["2 vCPU", "4 GB RAM", "50 GB NVMe"] },
      { name: "VPS Pro", price: "₹899/mo", specs: ["4 vCPU", "8 GB RAM", "100 GB NVMe"] },
      { name: "VPS Advanced", price: "₹1,499/mo", specs: ["6 vCPU", "16 GB RAM", "160 GB NVMe"] },
      { name: "VPS Business", price: "₹2,499/mo", specs: ["8 vCPU", "32 GB RAM", "250 GB NVMe"] },
      { name: "VPS Enterprise", price: "Custom", specs: ["Custom vCPU", "Custom RAM", "Custom NVMe"] },
    ],
  },
  {
    title: "Database Hosting",
    summary: "Managed-style resource tiers for application databases.",
    from: "From ₹49/mo",
    icon: Database,
    features: ["PostgreSQL and MySQL options", "Resource-based plans", "Database deployment help", "Custom database setups"],
    plans: [
      { name: "Database Starter", price: "₹49/mo", specs: ["512 MB RAM", "5 GB storage"] },
      { name: "Database Basic", price: "₹99/mo", specs: ["1 GB RAM", "15 GB storage"] },
      { name: "Database Pro", price: "₹199/mo", specs: ["2 GB RAM", "30 GB storage"] },
      { name: "Database Advanced", price: "₹399/mo", specs: ["4 GB RAM", "75 GB storage"] },
      { name: "Database Business", price: "₹699/mo", specs: ["8 GB RAM", "150 GB storage"] },
    ],
  },
  {
    title: "AI Infrastructure",
    summary: "Deployment options for AI APIs, inference workloads, and model services.",
    from: "Custom pricing",
    icon: Cpu,
    features: ["AI API deployments", "Open-source model hosting", "Embedding services", "Inference and GPU planning"],
    plans: [
      { name: "AI API hosting", price: "Custom", specs: ["Based on traffic", "Runtime and model requirements"] },
      { name: "Model deployment", price: "Custom", specs: ["CPU or GPU requirements", "Model size and throughput planning"] },
      { name: "Custom AI setup", price: "Custom", specs: ["Infrastructure planning", "Deployment and configuration support"] },
    ],
  },
  {
    title: "Storage and Backup",
    summary: "Extra storage and backup capacity for files, projects, and servers.",
    from: "From ₹19/mo",
    icon: HardDrive,
    features: ["Flexible storage sizes", "Backup add-ons", "Custom storage requests", "Usage-based planning available"],
    plans: [
      { name: "5 GB", price: "₹19/mo", specs: ["5 GB storage"] },
      { name: "25 GB", price: "₹49/mo", specs: ["25 GB storage"] },
      { name: "50 GB", price: "₹89/mo", specs: ["50 GB storage"] },
      { name: "100 GB", price: "₹149/mo", specs: ["100 GB storage"] },
      { name: "250 GB", price: "₹299/mo", specs: ["250 GB storage"] },
      { name: "500 GB", price: "₹499/mo", specs: ["500 GB storage"] },
      { name: "1 TB", price: "₹799/mo", specs: ["1 TB storage"] },
      { name: "Daily backup", price: "₹49/mo", specs: ["Scheduled daily backup"] },
      { name: "Automated backup", price: "₹99/mo", specs: ["Automated backup setup"] },
      { name: "Extended backup", price: "₹199/mo", specs: ["Longer backup retention"] },
      { name: "Custom backup", price: "Custom", specs: ["Custom storage and retention"] },
    ],
  },
  {
    title: "Custom Hosting",
    summary: "A tailored hosting setup when a standard plan does not fit your project.",
    from: "Talk to us",
    icon: Cloud,
    features: ["Custom resource allocation", "Project-specific infrastructure", "Migration and setup support", "Requirements-based pricing"],
    plans: [
      { name: "Custom Hosting", price: "Custom", specs: ["Choose the workload", "Choose the resources", "Agree on the setup before deployment"] },
    ],
  },
  {
    title: "Deployment Services",
    summary: "One-time help with deployments, migrations, domains, and infrastructure setup.",
    from: "From ₹49",
    icon: ShieldCheck,
    features: ["One-time service pricing", "Deployment and migration help", "Domain and DNS setup", "Custom infrastructure work"],
    plans: [
      { name: "SSL Setup", price: "₹49", specs: ["SSL configuration assistance"] },
      { name: "Website Deployment", price: "₹99", specs: ["Deploy a website"] },
      { name: "Domain and DNS Setup", price: "₹99", specs: ["Connect domain and DNS records"] },
      { name: "GitHub Deployment", price: "₹149", specs: ["Deploy from a Git repository"] },
      { name: "Docker Deployment", price: "₹199", specs: ["Container deployment assistance"] },
      { name: "Database Deployment", price: "₹199", specs: ["Database setup and deployment"] },
      { name: "Backend Deployment", price: "₹299", specs: ["Deploy a backend service"] },
      { name: "Website Migration", price: "₹299", specs: ["Move an existing website"] },
      { name: "Server Migration", price: "₹499", specs: ["Move a server workload"] },
      { name: "Full Infrastructure Setup", price: "₹999+", specs: ["Custom infrastructure planning and setup"] },
    ],
  },
];


type AppPlan = {
  name: string;
  price: string;
  specs: string[];
};

type AppService = {
  title: string;
  summary: string;
  from: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  plans: AppPlan[];
};

const APP_DEVELOPMENT_SERVICES: AppService[] = [
  {
    title: "Android App Development",
    summary: "Android apps for simple ideas, growing businesses, and larger products.",
    from: "From ₹2,000",
    icon: Smartphone,
    features: ["Android-first development", "Responsive screens", "API and database integration", "Testing and handover"],
    plans: [
      { name: "Basic Android App", price: "₹2,000–₹5,000", specs: ["Core screens", "Basic navigation", "Simple functionality"] },
      { name: "Standard Android App", price: "₹5,000–₹12,000", specs: ["Multiple screens", "Backend or API integration", "Standard app flows"] },
      { name: "Advanced Android App", price: "₹12,000–₹25,000", specs: ["Advanced features", "Custom integrations", "More involved app flows"] },
      { name: "Enterprise Android App", price: "₹25,000+", specs: ["Larger scope", "Custom architecture", "Project-based planning"] },
      { name: "Custom Android App", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "iOS App Development",
    summary: "iPhone and iPad apps planned around your product and target users.",
    from: "From ₹3,000",
    icon: Smartphone,
    features: ["iOS app development", "Clean mobile interfaces", "API and database integration", "Testing and handover"],
    plans: [
      { name: "Basic iOS App", price: "₹3,000–₹7,000", specs: ["Core screens", "Basic navigation", "Simple functionality"] },
      { name: "Standard iOS App", price: "₹7,000–₹15,000", specs: ["Multiple screens", "Backend or API integration", "Standard app flows"] },
      { name: "Advanced iOS App", price: "₹15,000–₹30,000", specs: ["Advanced features", "Custom integrations", "More involved app flows"] },
      { name: "Enterprise iOS App", price: "₹30,000+", specs: ["Larger scope", "Custom architecture", "Project-based planning"] },
      { name: "Custom iOS App", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Cross-Platform App Development",
    summary: "One codebase for Android and iOS where the project is a good fit.",
    from: "From ₹3,000",
    icon: Smartphone,
    features: ["Android and iOS builds", "Shared codebase", "API and database integration", "Testing and handover"],
    plans: [
      { name: "Basic Cross-Platform App", price: "₹3,000–₹7,000", specs: ["Core screens", "Basic navigation", "Simple functionality"] },
      { name: "Standard Cross-Platform App", price: "₹7,000–₹15,000", specs: ["Multiple screens", "Backend or API integration", "Standard app flows"] },
      { name: "Advanced Cross-Platform App", price: "₹15,000–₹30,000", specs: ["Advanced features", "Custom integrations", "More involved app flows"] },
      { name: "Enterprise Cross-Platform App", price: "₹30,000+", specs: ["Larger scope", "Custom architecture", "Project-based planning"] },
      { name: "Custom App", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Progressive Web Apps",
    summary: "Installable web apps that work across modern browsers and devices.",
    from: "From ₹2,000",
    icon: Globe,
    features: ["Responsive web interface", "Installable PWA setup", "Offline support where suitable", "Deployment guidance"],
    plans: [
      { name: "Basic PWA", price: "₹2,000–₹5,000", specs: ["Core pages", "Responsive layout", "Basic install support"] },
      { name: "Standard PWA", price: "₹5,000–₹10,000", specs: ["Multiple screens", "App-like navigation", "PWA configuration"] },
      { name: "Advanced PWA", price: "₹10,000–₹20,000", specs: ["Advanced flows", "Data and API integration", "More involved functionality"] },
      { name: "Custom PWA", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Business Apps",
    summary: "Tools for bookings, inventory, teams, customers, and daily operations.",
    from: "From ₹5,000",
    icon: Code2,
    features: ["Business-focused workflows", "Role-based screens where needed", "Database and API integration", "Admin options by scope"],
    plans: [
      { name: "Booking App", price: "₹5,000–₹15,000", specs: ["Booking flow", "Basic management screens"] },
      { name: "Inventory App", price: "₹7,000–₹20,000", specs: ["Inventory records", "Stock management flow"] },
      { name: "Management App", price: "₹7,000–₹25,000", specs: ["Custom management workflows", "Data management"] },
      { name: "Employee/Team App", price: "₹5,000–₹20,000", specs: ["Team-focused features", "Role-based access where needed"] },
      { name: "Customer App", price: "₹5,000–₹20,000", specs: ["Customer-facing screens", "Account and service flows"] },
      { name: "Custom Business App", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "E-Commerce Apps",
    summary: "Shopping experiences with product listings, carts, orders, and integrations.",
    from: "From ₹7,000",
    icon: Globe,
    features: ["Product and category screens", "Cart and order flow", "Payment integration by scope", "Admin features by scope"],
    plans: [
      { name: "Basic Store App", price: "₹7,000–₹15,000", specs: ["Product listing", "Basic cart flow"] },
      { name: "Standard E-Commerce App", price: "₹15,000–₹30,000", specs: ["Checkout flow", "Order management", "More product features"] },
      { name: "Advanced E-Commerce App", price: "₹30,000–₹60,000", specs: ["Advanced store features", "Custom integrations", "Expanded management tools"] },
      { name: "Custom E-Commerce App", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Social and Community Apps",
    summary: "Community, social, and messaging products built around your feature list.",
    from: "From ₹8,000",
    icon: Bot,
    features: ["Accounts and profiles", "Community or messaging flows", "Moderation options by scope", "Backend and notification planning"],
    plans: [
      { name: "Basic Community App", price: "₹8,000–₹20,000", specs: ["Community screens", "Basic member flows"] },
      { name: "Social App", price: "₹15,000–₹40,000", specs: ["Social feed or profiles", "Interactions by scope"] },
      { name: "Messaging App", price: "₹15,000–₹40,000", specs: ["Messaging flows", "Conversation management"] },
      { name: "Community Platform", price: "₹20,000–₹50,000", specs: ["Larger community features", "Management tools by scope"] },
      { name: "Custom Social Platform", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "AI Apps",
    summary: "Apps that connect AI models and useful workflows to a practical product.",
    from: "From ₹5,000",
    icon: Sparkles,
    features: ["Model or API integration", "Prompt and response flows", "Usage controls by scope", "Cost and provider planning"],
    plans: [
      { name: "AI Chat App", price: "₹5,000–₹15,000", specs: ["Chat interface", "AI API connection"] },
      { name: "AI Assistant App", price: "₹10,000–₹25,000", specs: ["Assistant workflows", "Custom instructions and tools by scope"] },
      { name: "AI Content App", price: "₹10,000–₹30,000", specs: ["Content generation flow", "Provider integration"] },
      { name: "AI Productivity App", price: "₹15,000–₹35,000", specs: ["Productivity workflows", "Custom AI integrations"] },
      { name: "Custom AI App", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "App Features and Add-ons",
    summary: "Add individual features to an existing app or include them in a new build.",
    from: "From ₹500",
    icon: Wrench,
    features: ["Feature-specific work", "Integration support", "Scope-based estimates", "Existing project review where needed"],
    plans: [
      { name: "Authentication System", price: "₹500–₹2,000", specs: ["Sign-in and account flow"] },
      { name: "Push Notifications", price: "₹500–₹2,000", specs: ["Notification setup"] },
      { name: "Payment Integration", price: "₹1,000–₹3,000", specs: ["Payment provider connection"] },
      { name: "Subscription System", price: "₹2,000–₹5,000", specs: ["Subscription flow"] },
      { name: "Database Integration", price: "₹1,000–₹3,000", specs: ["Database connection and setup"] },
      { name: "API Integration", price: "₹500–₹3,000", specs: ["Third-party or custom API connection"] },
      { name: "AI Integration", price: "₹1,000–₹5,000", specs: ["AI provider connection"] },
      { name: "Maps/Location Integration", price: "₹1,000–₹3,000", specs: ["Maps or location features"] },
      { name: "Admin Dashboard", price: "₹2,000–₹7,000", specs: ["Management dashboard"] },
      { name: "Analytics System", price: "₹1,000–₹4,000", specs: ["Usage and event tracking"] },
    ],
  },
  {
    title: "App Maintenance",
    summary: "Updates and fixes for an existing app after launch.",
    from: "From ₹100",
    icon: Wrench,
    features: ["Bug fixes and updates", "Performance review", "Feature changes", "Monthly support by agreement"],
    plans: [
      { name: "Bug Fixes", price: "₹100+", specs: ["Based on the issue and time required"] },
      { name: "Performance Optimization", price: "₹500+", specs: ["Review and improve bottlenecks"] },
      { name: "Feature Updates", price: "₹500+", specs: ["Add or adjust an existing feature"] },
      { name: "App Redesign", price: "₹1,000+", specs: ["Update screens and visual layout"] },
      { name: "Monthly Maintenance", price: "₹1,000+/month", specs: ["Ongoing support by agreement"] },
      { name: "Custom Maintenance", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Custom App Development",
    summary: "Have an app idea that does not fit a standard plan? Tell us what you want to build.",
    from: "Custom quote",
    icon: Code2,
    features: ["Feature and scope review", "Design and development planning", "Infrastructure and integration planning", "Quote before work begins"],
    plans: [
      { name: "Custom App", price: "Custom", specs: ["Pricing depends on features, design, development, infrastructure, and integrations"] },
    ],
  },
];


type WebDevelopmentService = AppService;

const WEB_DEVELOPMENT_SERVICES: WebDevelopmentService[] = [
  {
    title: "Landing Pages",
    summary: "Focused landing pages for launches, campaigns, products, and services.",
    from: "From ₹500",
    icon: Globe,
    features: ["Responsive layouts", "Clear calls to action", "Mobile-first implementation", "Deployment guidance"],
    plans: [
      { name: "Basic Landing Page", price: "₹500–₹1,500", specs: ["Single-page layout", "Basic sections", "Mobile-friendly styling"] },
      { name: "Standard Landing Page", price: "₹1,500–₹3,000", specs: ["Custom layout", "More sections", "Form or CTA integration"] },
      { name: "Advanced Landing Page", price: "₹3,000–₹7,000", specs: ["Custom visual direction", "Advanced sections", "Integrations as agreed"] },
      { name: "Custom Landing Page", price: "Custom", specs: ["Scope-based quote"] },
    ],
  },
  {
    title: "Portfolio Websites",
    summary: "Personal, creator, and professional portfolios that present work clearly.",
    from: "From ₹500",
    icon: Palette,
    features: ["Project and work sections", "Responsive design", "Contact options", "Deployment support"],
    plans: [
      { name: "Basic Portfolio", price: "₹500–₹1,500", specs: ["Core profile sections", "Project highlights", "Responsive layout"] },
      { name: "Standard Portfolio", price: "₹1,500–₹3,000", specs: ["Custom sections", "Project details", "Contact integration"] },
      { name: "Advanced Portfolio", price: "₹3,000–₹7,000", specs: ["Custom design", "More involved interactions", "Additional integrations"] },
      { name: "Creator Portfolio", price: "₹2,000–₹5,000", specs: ["Creator-focused presentation", "Work or media sections", "Contact and social links"] },
      { name: "Custom Portfolio", price: "Custom", specs: ["Scope-based quote"] },
    ],
  },
  {
    title: "Business Websites",
    summary: "Professional websites for businesses, teams, and growing organisations.",
    from: "From ₹1,500",
    icon: Globe,
    features: ["Business information architecture", "Responsive pages", "Contact and enquiry flows", "SEO-ready structure"],
    plans: [
      { name: "Basic Business Website", price: "₹1,500–₹3,000", specs: ["Core business pages", "Contact details", "Responsive layout"] },
      { name: "Standard Business Website", price: "₹3,000–₹7,000", specs: ["Multiple custom pages", "Service sections", "Contact or enquiry form"] },
      { name: "Advanced Business Website", price: "₹7,000–₹15,000", specs: ["Custom page structure", "Integrations by scope", "More advanced interactions"] },
      { name: "Enterprise Website", price: "₹15,000+", specs: ["Larger website scope", "Custom integrations", "Project-based planning"] },
      { name: "Custom Business Website", price: "Custom", specs: ["Scope-based quote"] },
    ],
  },
  {
    title: "E-Commerce Websites",
    summary: "Online stores with product browsing, checkout flows, and management features.",
    from: "From ₹3,000",
    icon: Globe,
    features: ["Product and category pages", "Cart and order flow", "Payment integration by scope", "Admin features by scope"],
    plans: [
      { name: "Basic Online Store", price: "₹3,000–₹7,000", specs: ["Product listing", "Basic cart flow", "Core store pages"] },
      { name: "Standard E-Commerce Website", price: "₹7,000–₹15,000", specs: ["Product management scope", "Checkout integration", "Order flow"] },
      { name: "Advanced E-Commerce Website", price: "₹15,000–₹30,000", specs: ["Advanced store features", "Additional integrations", "Custom management needs"] },
      { name: "Enterprise E-Commerce Platform", price: "₹30,000+", specs: ["Larger catalog and workflows", "Custom integrations", "Project-based planning"] },
      { name: "Custom E-Commerce Website", price: "Custom", specs: ["Scope-based quote"] },
    ],
  },
  {
    title: "Web Applications",
    summary: "Interactive web applications built around specific workflows and user needs.",
    from: "From ₹3,000",
    icon: Code2,
    features: ["Interactive user flows", "Database and API options", "Authentication by scope", "Responsive application UI"],
    plans: [
      { name: "Basic Web App", price: "₹3,000–₹7,000", specs: ["Core screens", "Basic functionality", "Simple data flow"] },
      { name: "Standard Web App", price: "₹7,000–₹15,000", specs: ["Multiple workflows", "API or database integration", "Standard user flows"] },
      { name: "Advanced Web App", price: "₹15,000–₹30,000", specs: ["More complex workflows", "Custom integrations", "Advanced functionality"] },
      { name: "Enterprise Web App", price: "₹30,000+", specs: ["Larger scope", "Custom architecture", "Project-based planning"] },
      { name: "Custom Web Application", price: "Custom", specs: ["Scope-based quote"] },
    ],
  },
  {
    title: "SaaS Development",
    summary: "Subscription-based products and software platforms from MVP to larger systems.",
    from: "From ₹10,000",
    icon: Cloud,
    features: ["Product planning", "Account and access flows", "Billing options by scope", "Deployment planning"],
    plans: [
      { name: "SaaS MVP", price: "₹10,000–₹25,000", specs: ["Core product workflow", "Initial user flow", "MVP-focused scope"] },
      { name: "Standard SaaS Platform", price: "₹25,000–₹50,000", specs: ["Broader feature set", "Account management", "Database and API integration"] },
      { name: "Advanced SaaS Platform", price: "₹50,000–₹1,00,000+", specs: ["Complex workflows", "More integrations", "Expanded platform scope"] },
      { name: "Enterprise SaaS", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Dashboards and Portals",
    summary: "Admin panels, customer portals, analytics views, and internal tools.",
    from: "From ₹2,000",
    icon: Code2,
    features: ["Role-based views by scope", "Tables and data views", "Responsive dashboard layout", "API and database options"],
    plans: [
      { name: "Admin Dashboard", price: "₹2,000–₹7,000", specs: ["Management screens", "Data views", "Core admin actions"] },
      { name: "Analytics Dashboard", price: "₹3,000–₹10,000", specs: ["Charts and metrics", "Data presentation", "Filter options by scope"] },
      { name: "Customer Portal", price: "₹3,000–₹10,000", specs: ["Customer-facing account area", "Data and status views", "Relevant actions"] },
      { name: "Employee Portal", price: "₹3,000–₹10,000", specs: ["Internal user area", "Workflow screens", "Access requirements by scope"] },
      { name: "Management Dashboard", price: "₹5,000–₹15,000", specs: ["Management workflows", "Reporting views", "Custom data handling"] },
      { name: "Custom Dashboard", price: "Custom", specs: ["Scope-based quote"] },
    ],
  },
  {
    title: "Booking and Management Systems",
    summary: "Web systems for bookings, appointments, inventory, CRM, and operations.",
    from: "From ₹3,000",
    icon: Wrench,
    features: ["Workflow planning", "Data and status management", "Forms and user actions", "Integration options by scope"],
    plans: [
      { name: "Booking Website", price: "₹3,000–₹8,000", specs: ["Booking flow", "Availability or enquiry fields", "Confirmation flow by scope"] },
      { name: "Appointment System", price: "₹3,000–₹8,000", specs: ["Appointment requests", "Schedule-related screens", "Status handling"] },
      { name: "Inventory System", price: "₹5,000–₹12,000", specs: ["Inventory records", "Stock-related views", "Management actions"] },
      { name: "CRM Website", price: "₹7,000–₹20,000", specs: ["Customer records", "Workflow screens", "CRM features by scope"] },
      { name: "Business Management System", price: "₹7,000–₹25,000", specs: ["Business workflows", "Management views", "Custom data handling"] },
      { name: "Custom Management System", price: "Custom", specs: ["Scope-based quote"] },
    ],
  },
  {
    title: "AI-Powered Websites",
    summary: "Websites and applications with AI features selected for the actual use case.",
    from: "From ₹1,000",
    icon: Sparkles,
    features: ["AI provider integration", "Prompt and response flows", "Usage considerations", "Feature scope planning"],
    plans: [
      { name: "AI Chatbot Integration", price: "₹1,000–₹4,000", specs: ["Chat interface integration", "Provider connection", "Basic configuration"] },
      { name: "AI Website Assistant", price: "₹3,000–₹8,000", specs: ["Website assistant flow", "Context and prompt setup", "UI integration"] },
      { name: "AI Content Platform", price: "₹5,000–₹15,000", specs: ["Content workflow", "AI integration", "User interface by scope"] },
      { name: "AI Web Application", price: "₹10,000–₹30,000", specs: ["Application-specific AI features", "Data and workflow integration", "Custom UI"] },
      { name: "Custom AI Website", price: "Custom", specs: ["Scope-based quote"] },
    ],
  },
  {
    title: "Website Features",
    summary: "Add individual features to an existing website or web application.",
    from: "From ₹500",
    icon: Wrench,
    features: ["Feature-specific work", "Existing project review", "Integration support", "Scope confirmation before work"],
    plans: [
      { name: "Authentication", price: "₹500–₹2,000", specs: ["Login and account flow by scope"] },
      { name: "Database Integration", price: "₹1,000–₹3,000", specs: ["Database connection and setup"] },
      { name: "Payment Integration", price: "₹1,000–₹3,000", specs: ["Payment provider integration"] },
      { name: "API Integration", price: "₹500–₹3,000", specs: ["Connect an external API"] },
      { name: "Admin Panel", price: "₹2,000–₹7,000", specs: ["Management interface"] },
      { name: "User Dashboard", price: "₹2,000–₹7,000", specs: ["User-facing dashboard"] },
      { name: "Search System", price: "₹500–₹2,000", specs: ["Search and filtering flow"] },
      { name: "Notification System", price: "₹500–₹2,000", specs: ["Notification setup by scope"] },
      { name: "Subscription System", price: "₹2,000–₹5,000", specs: ["Subscription workflow"] },
      { name: "Multi-language Support", price: "₹1,000–₹4,000", specs: ["Language switching and content setup"] },
    ],
  },
  {
    title: "Website Services",
    summary: "Setup, migration, maintenance, and improvement work for existing websites.",
    from: "From ₹100",
    icon: Server,
    features: ["One-time and ongoing services", "Existing website review", "Deployment and configuration help", "Scope confirmation before work"],
    plans: [
      { name: "Domain Setup", price: "₹100+", specs: ["Domain connection assistance"] },
      { name: "DNS Configuration", price: "₹100+", specs: ["DNS record configuration"] },
      { name: "SSL Setup", price: "₹100+", specs: ["SSL configuration assistance"] },
      { name: "Website Deployment", price: "₹100+", specs: ["Deploy an existing website"] },
      { name: "Website Migration", price: "₹500+", specs: ["Move a website between providers"] },
      { name: "Website Optimization", price: "₹500+", specs: ["Review and improve performance"] },
      { name: "SEO Setup", price: "₹500+", specs: ["Basic SEO configuration"] },
      { name: "Website Maintenance", price: "₹500+/month", specs: ["Ongoing support by agreement"] },
      { name: "Bug Fixes", price: "₹100+", specs: ["Issue review and fixes"] },
      { name: "Custom Updates", price: "₹500+", specs: ["Requested website changes"] },
    ],
  },
  {
    title: "Custom Web Development",
    summary: "A tailored website or web application for requirements that do not fit a standard plan.",
    from: "Custom quote",
    icon: Code2,
    features: ["Requirements review", "Design and functionality planning", "Integration and infrastructure review", "Quote before work begins"],
    plans: [
      { name: "Custom Web Project", price: "Custom", specs: ["Pricing depends on design, functionality, integrations, infrastructure, and development scope"] },
    ],
  },
];


const SOFTWARE_DEVELOPMENT_SERVICES: AppService[] = [
  {
    title: "Custom Software",
    summary: "Software built around a defined workflow, team, or business requirement.",
    from: "From ₹3,000",
    icon: Code2,
    features: ["Requirements review", "Planned feature scope", "Data and integration options", "Handover and setup guidance"],
    plans: [
      { name: "Basic Software", price: "₹3,000–₹7,000", specs: ["Core workflow", "Basic interface", "Initial setup"] },
      { name: "Standard Software", price: "₹7,000–₹15,000", specs: ["Multiple workflows", "Data handling", "Integration options"] },
      { name: "Advanced Software", price: "₹15,000–₹30,000", specs: ["Complex workflows", "Custom integrations", "Expanded functionality"] },
      { name: "Enterprise Software", price: "₹30,000+", specs: ["Larger project scope", "Custom architecture", "Planning before development"] },
      { name: "Custom Software", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Desktop Applications",
    summary: "Desktop software for personal use, teams, and business operations.",
    from: "From ₹3,000",
    icon: Code2,
    features: ["Desktop interface planning", "Local or connected data", "Platform requirements review", "Packaging and handover guidance"],
    plans: [
      { name: "Basic Desktop App", price: "₹3,000–₹7,000", specs: ["Core screens", "Basic local workflow"] },
      { name: "Standard Desktop App", price: "₹7,000–₹15,000", specs: ["Multiple screens", "Data and workflow support"] },
      { name: "Advanced Desktop App", price: "₹15,000–₹30,000", specs: ["Advanced functionality", "Custom integrations"] },
      { name: "Enterprise Desktop App", price: "₹30,000+", specs: ["Larger scope", "Project-specific architecture"] },
      { name: "Custom Desktop Application", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Business Software",
    summary: "Tools for billing, inventory, customer management, and daily operations.",
    from: "From ₹3,000",
    icon: Wrench,
    features: ["Business workflow mapping", "Role-based access where needed", "Reports and data views", "Database and integration options"],
    plans: [
      { name: "Billing Software", price: "₹3,000–₹8,000", specs: ["Billing workflow", "Basic records"] },
      { name: "Inventory Software", price: "₹5,000–₹12,000", specs: ["Stock records", "Inventory management"] },
      { name: "Employee Management Software", price: "₹5,000–₹15,000", specs: ["Employee records", "Management workflow"] },
      { name: "CRM Software", price: "₹7,000–₹20,000", specs: ["Customer records", "CRM workflow"] },
      { name: "POS Software", price: "₹7,000–₹20,000", specs: ["Sales workflow", "Product and transaction records"] },
      { name: "Business Management Software", price: "₹10,000–₹30,000", specs: ["Connected business workflows", "Reporting and management tools"] },
      { name: "Custom Business Software", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "SaaS Software",
    summary: "Subscription products and online software platforms from MVP to larger systems.",
    from: "From ₹10,000",
    icon: Cloud,
    features: ["Product workflow planning", "Accounts and permissions", "Billing options by scope", "Deployment planning"],
    plans: [
      { name: "SaaS MVP", price: "₹10,000–₹25,000", specs: ["Core product workflow", "Initial account flow"] },
      { name: "Standard SaaS", price: "₹25,000–₹50,000", specs: ["Broader feature set", "Account and data management"] },
      { name: "Advanced SaaS", price: "₹50,000–₹1,00,000+", specs: ["Complex workflows", "Additional integrations"] },
      { name: "Enterprise SaaS", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "APIs and Backend",
    summary: "Backend services and APIs for applications, websites, and integrations.",
    from: "From ₹500",
    icon: Server,
    features: ["Endpoint planning", "Validation and error handling", "Authentication options", "Documentation by scope"],
    plans: [
      { name: "Basic API", price: "₹500–₹2,000", specs: ["Small endpoint set", "Basic request handling"] },
      { name: "REST API", price: "₹1,000–₹5,000", specs: ["REST endpoints", "Data and validation flow"] },
      { name: "GraphQL API", price: "₹2,000–₹6,000", specs: ["GraphQL schema", "Query and mutation setup"] },
      { name: "Authentication Backend", price: "₹1,000–₹4,000", specs: ["Authentication flow", "Session or token handling"] },
      { name: "Payment Backend", price: "₹2,000–₹5,000", specs: ["Payment provider connection", "Server-side payment flow"] },
      { name: "Custom Backend", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Database Development",
    summary: "Database design, setup, migration, and improvements for existing systems.",
    from: "From ₹500",
    icon: Database,
    features: ["Schema planning", "Migration support", "Query and index review", "Backup considerations"],
    plans: [
      { name: "Database Setup", price: "₹500–₹2,000", specs: ["Initial database setup", "Connection configuration"] },
      { name: "Database Design", price: "₹1,000–₹4,000", specs: ["Schema design", "Relationship planning"] },
      { name: "Database Migration", price: "₹1,000–₹5,000", specs: ["Data transfer planning", "Migration support"] },
      { name: "Database Optimization", price: "₹1,000–₹5,000", specs: ["Query review", "Index and performance checks"] },
      { name: "Custom Database System", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Software Integrations",
    summary: "Connect software to payment providers, cloud services, APIs, and other tools.",
    from: "From ₹500",
    icon: Wrench,
    features: ["Third-party connection planning", "Credentials handled server-side", "Error and fallback handling", "Testing support"],
    plans: [
      { name: "API Integration", price: "₹500–₹3,000", specs: ["External API connection"] },
      { name: "Payment Integration", price: "₹1,000–₹4,000", specs: ["Payment provider connection"] },
      { name: "Authentication Integration", price: "₹500–₹2,000", specs: ["Sign-in provider connection"] },
      { name: "Cloud Integration", price: "₹1,000–₹5,000", specs: ["Cloud service connection"] },
      { name: "Third-Party Service Integration", price: "₹500–₹5,000", specs: ["External service integration"] },
      { name: "Custom Integration", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Software Maintenance",
    summary: "Keep an existing software project working, updated, and easier to maintain.",
    from: "From ₹100",
    icon: Wrench,
    features: ["Bug fixes", "Performance review", "Feature changes", "Ongoing support by agreement"],
    plans: [
      { name: "Bug Fix", price: "₹100+", specs: ["Issue review and correction"] },
      { name: "Performance Optimization", price: "₹500+", specs: ["Review and improve bottlenecks"] },
      { name: "Security Updates", price: "₹500+", specs: ["Review and apply relevant updates"] },
      { name: "Feature Addition", price: "₹500+", specs: ["Add an agreed feature"] },
      { name: "Software Redesign", price: "₹1,000+", specs: ["Update the interface or workflow"] },
      { name: "Monthly Maintenance", price: "₹1,000+/month", specs: ["Ongoing support by agreement"] },
      { name: "Custom Maintenance", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Custom Software Development",
    summary: "A software project planned around your idea, workflow, and required integrations.",
    from: "Custom quote",
    icon: Code2,
    features: ["Requirements discussion", "Feature and architecture planning", "Infrastructure review", "Quote before work begins"],
    plans: [{ name: "Custom Software Project", price: "Custom", specs: ["Scope-based quote"] }],
  },
];

const AI_AUTOMATION_SERVICES: AppService[] = [
  {
    title: "AI Chatbots",
    summary: "Chat experiences for websites, communities, support, and business workflows.",
    from: "From ₹1,000",
    icon: Bot,
    features: ["Provider or model connection", "Conversation flow planning", "Prompt and usage controls", "Integration support"],
    plans: [
      { name: "Basic AI Chatbot", price: "₹1,000–₹3,000", specs: ["Basic chat flow", "Model or API connection"] },
      { name: "Website AI Chatbot", price: "₹2,000–₹5,000", specs: ["Website chat interface", "Basic context setup"] },
      { name: "Business AI Chatbot", price: "₹5,000–₹12,000", specs: ["Business-focused flows", "Integration options"] },
      { name: "Advanced AI Chatbot", price: "₹10,000–₹25,000", specs: ["Advanced workflows", "Custom integrations"] },
      { name: "Custom AI Chatbot", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "AI Assistants",
    summary: "Assistants that connect models, tools, and useful actions to a defined task.",
    from: "From ₹3,000",
    icon: Sparkles,
    features: ["Assistant behavior planning", "Tool and API options", "Prompt and context setup", "Usage considerations"],
    plans: [
      { name: "Basic AI Assistant", price: "₹3,000–₹7,000", specs: ["Basic assistant flow", "Model integration"] },
      { name: "Personal AI Assistant", price: "₹5,000–₹12,000", specs: ["Personal workflows", "Context and preferences"] },
      { name: "Business AI Assistant", price: "₹10,000–₹25,000", specs: ["Business tasks", "Tool or API connections"] },
      { name: "Advanced AI Agent", price: "₹15,000–₹40,000", specs: ["Multi-step actions", "Tool use by scope"] },
      { name: "Custom AI Assistant", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "AI Applications",
    summary: "Practical AI products for content, search, productivity, and custom workflows.",
    from: "From ₹5,000",
    icon: Sparkles,
    features: ["AI feature planning", "Model or provider integration", "Application UI", "Usage and cost considerations"],
    plans: [
      { name: "AI Content Generator", price: "₹5,000–₹12,000", specs: ["Content generation flow", "Model connection"] },
      { name: "AI Image Tool", price: "₹5,000–₹15,000", specs: ["Image generation or editing flow"] },
      { name: "AI Writing Tool", price: "₹5,000–₹15,000", specs: ["Writing workflow", "Prompt and output controls"] },
      { name: "AI Search Tool", price: "₹7,000–₹20,000", specs: ["Search interface", "Retrieval or provider integration"] },
      { name: "AI Productivity Tool", price: "₹7,000–₹20,000", specs: ["Productivity workflow", "AI-assisted actions"] },
      { name: "AI Web Application", price: "₹10,000–₹30,000", specs: ["Custom web app", "AI and data integration"] },
      { name: "Custom AI Application", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "AI Integrations",
    summary: "Add AI capabilities to an existing app, website, or internal tool.",
    from: "From ₹1,000",
    icon: Code2,
    features: ["Provider selection support", "Server-side key handling", "Error handling", "Integration testing"],
    plans: [
      { name: "OpenAI Integration", price: "₹1,000–₹4,000", specs: ["OpenAI API connection"] },
      { name: "AI API Integration", price: "₹1,000–₹5,000", specs: ["Model or provider connection"] },
      { name: "Image AI Integration", price: "₹1,000–₹5,000", specs: ["Image model connection"] },
      { name: "Speech AI Integration", price: "₹1,000–₹5,000", specs: ["Speech input or output integration"] },
      { name: "AI Search Integration", price: "₹1,000–₹5,000", specs: ["Search or retrieval integration"] },
      { name: "Custom AI Integration", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "AI Agents",
    summary: "AI systems that can use tools and follow defined multi-step workflows.",
    from: "From ₹5,000",
    icon: Bot,
    features: ["Workflow design", "Tool and API connections", "Permission boundaries", "Testing and monitoring considerations"],
    plans: [
      { name: "Basic AI Agent", price: "₹5,000–₹12,000", specs: ["Single workflow", "Basic tool use"] },
      { name: "Tool-Using AI Agent", price: "₹10,000–₹25,000", specs: ["Tool connections", "Multi-step task flow"] },
      { name: "Multi-Agent System", price: "₹15,000–₹40,000", specs: ["Multiple agent roles", "Workflow coordination"] },
      { name: "Autonomous Workflow Agent", price: "₹20,000–₹50,000+", specs: ["Longer workflow", "Defined controls and review points"] },
      { name: "Custom AI Agent System", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Automation",
    summary: "Automate repetitive steps across websites, apps, data, and business tools.",
    from: "From ₹500",
    icon: Wrench,
    features: ["Workflow mapping", "Trigger and action setup", "Error handling", "Documentation by scope"],
    plans: [
      { name: "Basic Automation", price: "₹500–₹2,000", specs: ["Simple trigger and action flow"] },
      { name: "Workflow Automation", price: "₹1,000–₹5,000", specs: ["Connected workflow steps"] },
      { name: "Business Automation", price: "₹3,000–₹10,000", specs: ["Business process automation"] },
      { name: "Advanced Automation", price: "₹5,000–₹20,000", specs: ["More complex workflows", "Integration options"] },
      { name: "Custom Automation", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Business Automation",
    summary: "Reduce repetitive business work with connected tools and clear workflows.",
    from: "From ₹500",
    icon: Wrench,
    features: ["Business process review", "Tool and service connections", "Scheduled or triggered flows", "Handover documentation"],
    plans: [
      { name: "Email Automation", price: "₹500–₹2,000", specs: ["Email workflow setup"] },
      { name: "Lead Automation", price: "₹1,000–₹4,000", specs: ["Lead capture and routing"] },
      { name: "Customer Support Automation", price: "₹2,000–₹7,000", specs: ["Support workflow assistance"] },
      { name: "Data Processing Automation", price: "₹1,000–₹5,000", specs: ["Data handling workflow"] },
      { name: "Report Automation", price: "₹1,000–₹5,000", specs: ["Scheduled report workflow"] },
      { name: "Social Media Automation", price: "₹1,000–₹5,000", specs: ["Content or scheduling workflow"] },
      { name: "Custom Business Automation", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "AI Data and Knowledge Systems",
    summary: "Searchable document and knowledge experiences using your approved data.",
    from: "From ₹3,000",
    icon: Database,
    features: ["Document and data planning", "Retrieval workflow", "Access considerations", "Search and response testing"],
    plans: [
      { name: "Document AI", price: "₹3,000–₹10,000", specs: ["Document processing flow"] },
      { name: "AI Knowledge Base", price: "₹5,000–₹15,000", specs: ["Knowledge storage and retrieval"] },
      { name: "RAG System", price: "₹7,000–₹20,000", specs: ["Retrieval-augmented generation flow"] },
      { name: "AI Document Search", price: "₹5,000–₹15,000", specs: ["Searchable document interface"] },
      { name: "Custom Knowledge System", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "AI Optimization and Maintenance",
    summary: "Improve or maintain an existing AI integration, workflow, or application.",
    from: "From ₹500",
    icon: Wrench,
    features: ["Prompt and workflow review", "Performance checks", "Integration updates", "Ongoing support by agreement"],
    plans: [
      { name: "AI Prompt/System Optimization", price: "₹500+", specs: ["Review and improve prompts or system flow"] },
      { name: "AI Performance Optimization", price: "₹1,000+", specs: ["Review response and workflow performance"] },
      { name: "AI Integration Updates", price: "₹500+", specs: ["Update an existing AI connection"] },
      { name: "AI System Maintenance", price: "₹1,000+/month", specs: ["Ongoing support by agreement"] },
      { name: "Custom AI Maintenance", price: "Custom", specs: ["Requirements-based quote"] },
    ],
  },
  {
    title: "Custom AI and Automation",
    summary: "A custom AI or automation project planned around the work you want to improve.",
    from: "Custom quote",
    icon: Sparkles,
    features: ["Requirements discussion", "Workflow and integration planning", "Cost and infrastructure review", "Quote before work begins"],
    plans: [{ name: "Custom AI or Automation Project", price: "Custom", specs: ["Scope-based quote"] }],
  },
];


const GAME_DEVELOPMENT_SERVICES: AppService[] = [
  catalogGroup("Game Prototypes", "From ₹2,000", [["Basic Game Prototype", "₹2,000–₹5,000"], ["2D Game Prototype", "₹3,000–₹7,000"], ["3D Game Prototype", "₹5,000–₹12,000"], ["Advanced Prototype", "₹10,000–₹20,000"], ["Custom Prototype", "Custom"]], Palette, "Early playable concepts, mechanics, and prototypes."),
  catalogGroup("2D Game Development", "From ₹5,000", [["Basic 2D Game", "₹5,000–₹10,000"], ["Standard 2D Game", "₹10,000–₹20,000"], ["Advanced 2D Game", "₹20,000–₹40,000"], ["Custom 2D Game", "Custom"]], Palette, "2D games with the mechanics and presentation your project needs."),
  catalogGroup("3D Game Development", "From ₹10,000", [["Basic 3D Game", "₹10,000–₹20,000"], ["Standard 3D Game", "₹20,000–₹40,000"], ["Advanced 3D Game", "₹40,000–₹75,000+"], ["Custom 3D Game", "Custom"]], Palette, "3D game development with project-specific scope and assets."),
  catalogGroup("Mobile Games", "From ₹5,000", [["Basic Mobile Game", "₹5,000–₹12,000"], ["Standard Mobile Game", "₹12,000–₹25,000"], ["Advanced Mobile Game", "₹25,000–₹50,000+"], ["Custom Mobile Game", "Custom"]], Smartphone, "Mobile games planned for the target devices and gameplay scope."),
  catalogGroup("PC Games", "From ₹10,000", [["Basic PC Game", "₹10,000–₹20,000"], ["Standard PC Game", "₹20,000–₹40,000"], ["Advanced PC Game", "₹40,000–₹75,000+"], ["Custom PC Game", "Custom"]], Code2, "PC game projects with a clear scope and delivery plan."),
  catalogGroup("Multiplayer Games", "From ₹5,000", [["Basic Multiplayer System", "₹5,000–₹12,000"], ["Multiplayer Game", "₹15,000–₹35,000"], ["Advanced Multiplayer Game", "₹35,000–₹75,000+"], ["Custom Multiplayer Game", "Custom"]], Cloud, "Multiplayer features and game systems based on the required architecture."),
  catalogGroup("Minecraft Development", "From ₹100", [["Minecraft Plugin", "₹100–₹1,000+"], ["Custom Minecraft Plugin", "₹500–₹5,000+"], ["Minecraft Server Setup", "₹100–₹500"], ["Advanced Server Setup", "₹500–₹2,000"], ["Minecraft Mod", "₹500–₹5,000+"], ["Minecraft Resource Pack", "₹100–₹1,000+"], ["Minecraft Custom Map", "₹200–₹2,000+"], ["Minecraft Minigame", "₹1,000–₹10,000+"], ["Minecraft Network Setup", "₹1,000–₹10,000+"], ["Custom Minecraft Development", "Custom"]], Server, "Minecraft plugins, setups, maps, mods, and custom server work."),
  catalogGroup("Game Systems", "From ₹500", [["Inventory System", "₹1,000–₹4,000"], ["Quest System", "₹1,000–₹5,000"], ["Economy System", "₹1,000–₹5,000"], ["Multiplayer System", "₹2,000–₹10,000"], ["Achievement System", "₹500–₹2,000"], ["Leaderboard System", "₹500–₹2,000"], ["Save/Load System", "₹500–₹2,000"], ["Custom Game System", "Custom"]], Wrench, "Reusable gameplay systems for new or existing games."),
  catalogGroup("Game UI and UX", "From ₹500", [["Basic Game UI", "₹500–₹2,000"], ["Custom Game HUD", "₹1,000–₹4,000"], ["Menu System", "₹500–₹3,000"], ["Inventory UI", "₹500–₹2,000"], ["Complete Game UI", "₹3,000–₹10,000"], ["Custom UI/UX", "Custom"]], Palette, "Menus, HUDs, inventory screens, and other game interfaces."),
  catalogGroup("Game Assets", "From ₹100", [["2D Game Assets", "₹100–₹1,000+"], ["3D Game Models", "₹200–₹2,000+"], ["Character Models", "₹500–₹5,000+"], ["Game Textures", "₹100–₹1,000+"], ["Animations", "₹200–₹2,000+"], ["Custom Asset Pack", "Custom"]], Palette, "Game-ready visual assets based on the agreed art direction."),
  catalogGroup("Game Maintenance", "From ₹100", [["Bug Fix", "₹100+"], ["Performance Optimization", "₹500+"], ["Feature Addition", "₹500+"], ["Multiplayer Fixes", "₹1,000+"], ["Game Update", "₹500+"], ["Monthly Maintenance", "₹1,000+/month"], ["Custom Maintenance", "Custom"]], Wrench, "Fixes, updates, and ongoing maintenance for existing games."),
  catalogGroup("Custom Game Development", "Custom quote", [["Custom Game Project", "Custom"]], Palette, "A game idea planned around its platform, mechanics, graphics, multiplayer needs, and scope."),
];

const MINECRAFT_SERVICES: AppService[] = [
  catalogGroup("Minecraft Server Setup", "From ₹100", [["Basic Server Setup", "₹100–₹300"], ["Advanced Server Setup", "₹300–₹750"], ["SMP Setup", "₹500–₹1,500"], ["Survival Server Setup", "₹300–₹1,000"], ["Minigame Server Setup", "₹500–₹2,000"], ["Network Setup", "₹1,000–₹5,000+"], ["Custom Server Setup", "Custom"]], Server, "Minecraft server setup and configuration for different play styles."),
  catalogGroup("Minecraft Plugins", "From ₹100", [["Basic Plugin", "₹100–₹300"], ["Standard Plugin", "₹300–₹750"], ["Advanced Plugin", "₹750–₹2,000"], ["Custom Plugin", "₹500–₹5,000+"], ["Plugin Configuration", "₹100–₹500"], ["Plugin Optimization", "₹200–₹1,000"]], Code2, "Plugin development, configuration, and optimization."),
  catalogGroup("Minecraft Mods", "From ₹500", [["Basic Mod", "₹500–₹1,500"], ["Standard Mod", "₹1,500–₹3,000"], ["Advanced Mod", "₹3,000–₹7,500+"], ["Custom Mod", "Custom"]], Code2, "Custom Minecraft mod work based on the requested features."),
  catalogGroup("Minecraft Builds", "From ₹100", [["Small Build", "₹100–₹500"], ["Medium Build", "₹500–₹1,500"], ["Large Build", "₹1,500–₹5,000+"], ["Spawn Build", "₹500–₹2,500"], ["Lobby Build", "₹1,000–₹5,000+"], ["Custom Map", "₹500–₹5,000+"]], Palette, "Spawns, lobbies, maps, and other Minecraft builds."),
  catalogGroup("Minecraft Skins", "From ₹100", [["Basic Skin", "₹50–₹100"], ["Custom Skin", "₹100–₹250"], ["HD Skin", "₹150–₹350"], ["Skin Pack", "₹300–₹750"], ["Custom Character Skin", "Custom"]], Palette, "Custom Minecraft skins and character packs."),
  catalogGroup("Minecraft Texture Packs", "From ₹100", [["Basic Texture Pack", "₹100–₹300"], ["Custom Texture Pack", "₹300–₹1,000"], ["HD Texture Pack", "₹500–₹2,000+"], ["Full Server Texture Pack", "₹1,000–₹5,000+"], ["Custom Resource Pack", "Custom"]], Palette, "Texture packs for individual projects or full servers."),
  catalogGroup("Minecraft Models", "From ₹100", [["Basic Model", "₹100–₹300"], ["Custom Item Model", "₹200–₹500"], ["Custom Mob Model", "₹500–₹1,500"], ["Advanced 3D Model", "₹750–₹3,000+"], ["Custom Model Pack", "Custom"]], Palette, "Custom items, mobs, and 3D model work."),
  catalogGroup("Minecraft SMP Services", "From ₹300", [["SMP Setup", "₹500–₹1,500"], ["SMP Configuration", "₹300–₹1,000"], ["SMP Economy", "₹500–₹2,000"], ["SMP Rank System", "₹300–₹1,500"], ["SMP Quest System", "₹500–₹2,000"], ["SMP Custom Systems", "Custom"]], Wrench, "Setup and systems for Minecraft SMP communities."),
  catalogGroup("Minecraft Minigames", "From ₹500", [["Basic Minigame", "₹500–₹2,000"], ["Standard Minigame", "₹2,000–₹5,000"], ["Advanced Minigame", "₹5,000–₹15,000+"], ["Custom Minigame", "Custom"]], Gamepad2, "Minigames built or configured for Minecraft servers."),
  catalogGroup("Minecraft Optimization", "From ₹200", [["Server Optimization", "₹200–₹750"], ["Plugin Optimization", "₹200–₹1,000"], ["Performance Optimization", "₹500–₹2,000"], ["Lag Fix", "₹200–₹1,000"], ["Full Server Optimization", "₹1,000–₹3,000"]], Wrench, "Performance reviews and optimization for Minecraft servers."),
  catalogGroup("Minecraft Maintenance", "From ₹100", [["Bug Fix", "₹100+"], ["Configuration Update", "₹100+"], ["Plugin Update", "₹100+"], ["Server Update", "₹200+"], ["Monthly Maintenance", "₹500+/month"], ["Custom Maintenance", "Custom"]], Wrench, "Ongoing Minecraft updates, fixes, and maintenance."),
  catalogGroup("Custom Minecraft Development", "Custom quote", [["Custom Minecraft Project", "Custom"]], Server, "A Minecraft solution planned around your server, community, and requirements."),
];



const MARKETING_SERVICES: AppService[] = [
  catalogGroup("Social Media Marketing", "From ₹100", [["Basic Social Media Setup", "₹500–₹1,500"], ["Social Media Management", "₹1,500–₹5,000/month"], ["Advanced Social Media Management", "₹5,000–₹15,000/month"], ["Custom Social Media Management", "Custom"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("Social Media Content", "From ₹100", [["Social Media Post", "₹50–₹150"], ["Social Media Carousel", "₹100–₹300"], ["Story Design", "₹50–₹150"], ["Social Media Content Pack", "₹300–₹1,000"], ["Monthly Content Package", "₹1,000–₹5,000+"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("Advertising", "From ₹100", [["Ad Creative", "₹100–₹300"], ["Ad Banner", "₹100–₹300"], ["Video Advertisement", "₹300–₹1,500+"], ["Advertisement Campaign Setup", "₹500–₹2,000"], ["Custom Advertising Package", "Custom"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("YouTube Marketing", "From ₹100", [["YouTube Channel Setup", "₹500–₹1,500"], ["Channel Branding", "₹500–₹2,000"], ["YouTube SEO Setup", "₹500–₹2,000"], ["Video Optimization", "₹100–₹500/video"], ["YouTube Growth Package", "₹1,000–₹5,000+"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("Content Marketing", "From ₹100", [["Blog Article", "₹100–₹500"], ["SEO Article", "₹200–₹750"], ["Product Description", "₹50–₹200"], ["Website Copy", "₹300–₹1,500+"], ["Marketing Copy", "₹100–₹500"], ["Custom Content Package", "Custom"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("SEO", "From ₹100", [["Basic SEO Setup", "₹500–₹1,500"], ["On-Page SEO", "₹500–₹2,000"], ["Technical SEO", "₹1,000–₹5,000+"], ["Local SEO Setup", "₹500–₹2,000"], ["SEO Optimization", "₹1,000–₹5,000+"], ["Monthly SEO", "₹2,000+/month"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("Brand Marketing", "From ₹100", [["Brand Launch Package", "₹1,000–₹3,000"], ["Brand Promotion Package", "₹2,000–₹5,000+"], ["Creator Promotion Package", "₹1,000–₹5,000+"], ["Business Promotion Package", "₹2,000–₹10,000+"], ["Custom Brand Marketing", "Custom"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("Creator Marketing", "From ₹100", [["Creator Branding", "₹500–₹2,000"], ["Channel Promotion Assets", "₹300–₹1,000"], ["Creator Media Kit", "₹200–₹750"], ["Creator Launch Package", "₹1,000–₹3,000+"], ["Custom Creator Marketing", "Custom"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("Campaigns", "From ₹100", [["Basic Marketing Campaign", "₹500–₹2,000"], ["Social Media Campaign", "₹1,000–₹5,000"], ["Product Launch Campaign", "₹2,000–₹10,000+"], ["Brand Launch Campaign", "₹2,000–₹10,000+"], ["Custom Marketing Campaign", "Custom"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("Marketing Analytics", "From ₹100", [["Basic Analytics Setup", "₹500–₹1,500"], ["Campaign Analytics", "₹1,000–₹3,000"], ["Social Media Analytics", "₹500–₹2,000"], ["Marketing Report", "₹500–₹2,000"], ["Advanced Analytics", "Custom"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("Marketing Consultation", "From ₹100", [["Basic Consultation", "₹100–₹300"], ["Marketing Strategy", "₹500–₹2,000"], ["Campaign Strategy", "₹500–₹2,500"], ["Business Marketing Plan", "₹1,000–₹5,000+"], ["Custom Marketing Consultation", "Custom"]], Palette, "Marketing services for brands, businesses, products, and campaigns."),
  catalogGroup("Custom Marketing", "Custom Quote", [["Custom Marketing Package", "Custom"]], Palette, "A tailored marketing package built around your audience, platform, content, and campaign goals."),
];

const CREATOR_SERVICES: AppService[] = [
  catalogGroup("YouTube Services", "From ₹100", [["YouTube Channel Setup", "₹300–₹750"], ["Channel Branding", "₹500–₹2,000"], ["Channel Banner", "₹150–₹400"], ["Profile Picture", "₹100–₹250"], ["Video Thumbnail", "₹100–₹250"], ["Thumbnail Pack", "₹500–₹1,000"], ["YouTube Intro", "₹200–₹750"], ["YouTube Outro", "₹100–₹300"], ["YouTube Channel Package", "₹1,000–₹3,000+"]], Palette, "Creator-focused services for channels, content, branding, streaming, and growth."),
  catalogGroup("Video Creator Services", "From ₹100", [["Basic Video Editing", "₹100–₹300"], ["Standard Video Editing", "₹300–₹750"], ["Advanced Video Editing", "₹750–₹2,000+"], ["Gaming Video Editing", "₹200–₹750"], ["Shorts/Reels Editing", "₹50–₹300"], ["Video Editing Pack", "₹500–₹2,000+"], ["Monthly Editing Package", "₹1,500+/month"]], Palette, "Creator-focused services for channels, content, branding, streaming, and growth."),
  catalogGroup("Creator Branding", "From ₹100", [["Creator Logo", "₹100–₹500"], ["Creator Banner", "₹100–₹400"], ["Creator Profile Picture", "₹100–₹250"], ["Brand Identity", "₹500–₹2,000"], ["Creator Branding Pack", "₹750–₹3,000+"], ["Complete Creator Brand", "₹2,000–₹7,500+"]], Palette, "Creator-focused services for channels, content, branding, streaming, and growth."),
  catalogGroup("Streaming", "From ₹100", [["Stream Overlay", "₹200–₹750"], ["Stream Starting Screen", "₹100–₹300"], ["Stream Ending Screen", "₹100–₹300"], ["Stream Alerts", "₹100–₹500"], ["Stream Panels", "₹100–₹300"], ["Stream Graphics Pack", "₹500–₹2,000+"], ["Complete Stream Package", "₹1,000–₹4,000+"]], Palette, "Creator-focused services for channels, content, branding, streaming, and growth."),
  catalogGroup("Social Media Creator Services", "From ₹100", [["Profile Setup", "₹100–₹300"], ["Social Media Banner", "₹100–₹300"], ["Social Media Post", "₹50–₹150"], ["Story Design", "₹50–₹150"], ["Carousel Design", "₹100–₹300"], ["Social Media Pack", "₹300–₹1,000+"], ["Creator Social Package", "₹750–₹3,000+"]], Palette, "Creator-focused services for channels, content, branding, streaming, and growth."),
  catalogGroup("Creator Portfolio", "From ₹100", [["Basic Creator Portfolio", "₹500–₹1,500"], ["Standard Creator Portfolio", "₹1,500–₹3,000"], ["Advanced Creator Portfolio", "₹3,000–₹7,000+"], ["Creator Media Kit", "₹200–₹750"], ["Complete Creator Website", "₹2,000–₹7,500+"]], Palette, "Creator-focused services for channels, content, branding, streaming, and growth."),
  catalogGroup("Creator Growth", "From ₹100", [["YouTube SEO Setup", "₹500–₹2,000"], ["Channel Optimization", "₹500–₹2,000"], ["Video SEO", "₹100–₹500/video"], ["Content Strategy", "₹500–₹2,000"], ["Creator Growth Strategy", "₹1,000–₹5,000+"], ["Custom Creator Growth Package", "Custom"]], Palette, "Creator-focused services for channels, content, branding, streaming, and growth."),
  catalogGroup("Creator Assets", "From ₹100", [["Thumbnail Template", "₹100–₹300"], ["Social Media Template", "₹100–₹300"], ["Video Template", "₹100–₹500"], ["Stream Asset Pack", "₹300–₹1,000+"], ["Editing Pack", "₹50–₹500"], ["Ultimate Editing Pack", "₹100–₹1,000+"]], Palette, "Creator-focused services for channels, content, branding, streaming, and growth."),
  catalogGroup("Creator Consultation", "From ₹100", [["Basic Consultation", "₹100–₹300"], ["Channel Review", "₹300–₹750"], ["Branding Consultation", "₹300–₹1,000"], ["Creator Strategy", "₹500–₹2,000"], ["Custom Consultation", "Custom"]], Palette, "Creator-focused services for channels, content, branding, streaming, and growth."),
  catalogGroup("Custom Creator Services", "Custom Quote", [["Custom Creator Package", "Custom"]], Palette, "A tailored creator package built around your content, platform, audience, and brand."),
];

const FUBZ_SECURITY_SERVICES: AppService[] = [
  catalogGroup("Website Security", "From ₹100", [["Basic Security Check", "₹300–₹750"], ["Website Security Audit", "₹750–₹2,000"], ["Advanced Security Audit", "₹2,000–₹5,000+"], ["Security Hardening", "₹1,000–₹5,000+"], ["SSL Setup", "₹100–₹300"], ["Security Configuration", "₹500–₹2,000"], ["Custom Website Security", "Custom"]], ShieldCheck, "Website security checks, audits, hardening, SSL, and configuration."),
  catalogGroup("Application Security", "From ₹100", [["Basic Application Audit", "₹500–₹1,500"], ["Application Security Review", "₹1,000–₹3,000"], ["Advanced Security Assessment", "₹3,000–₹7,500+"], ["Authentication Security Review", "₹500–₹2,000"], ["API Security Review", "₹1,000–₹3,000"], ["Custom Application Security", "Custom"]], ShieldCheck, "Application security reviews and assessments for authorized projects."),
  catalogGroup("Server Security", "From ₹100", [["Basic Server Security", "₹500–₹1,500"], ["Server Hardening", "₹1,000–₹3,000"], ["VPS Security Setup", "₹1,000–₹3,000"], ["Firewall Configuration", "₹500–₹2,000"], ["SSH Security", "₹300–₹1,000"], ["Server Security Audit", "₹1,000–₹5,000+"], ["Custom Server Security", "Custom"]], Server, "Server hardening, firewall, SSH, VPS setup, and security audits."),
  catalogGroup("Discord Security", "From ₹100", [["Basic Discord Security", "₹100–₹300"], ["Anti-Raid Setup", "₹200–₹750"], ["Anti-Spam Setup", "₹100–₹500"], ["Verification System", "₹200–₹750"], ["Moderation Security", "₹200–₹750"], ["Permission Audit", "₹200–₹750"], ["Complete Discord Security", "₹500–₹1,500+"]], ShieldCheck, "Security configuration and protection for Discord communities."),
  catalogGroup("Minecraft Security", "From ₹100", [["Server Security Setup", "₹200–₹750"], ["Anti-Bot Setup", "₹200–₹750"], ["Anti-Cheat Configuration", "₹200–₹1,000"], ["Permission Security", "₹100–₹500"], ["Plugin Security Review", "₹300–₹1,000"], ["Server Security Audit", "₹500–₹2,000+"], ["Complete Minecraft Security", "Custom"]], ShieldCheck, "Security setup and reviews for Minecraft servers and plugins."),
  catalogGroup("API & Database Security", "From ₹100", [["API Security Review", "₹500–₹2,000"], ["Database Security Review", "₹500–₹2,000"], ["Authentication Review", "₹500–₹2,000"], ["Access Control Review", "₹500–₹2,000"], ["Database Hardening", "₹1,000–₹3,000"], ["Custom Security Assessment", "Custom"]], Database, "API, database, authentication, and access-control security reviews."),
  catalogGroup("Security Monitoring", "From ₹100", [["Basic Monitoring Setup", "₹500–₹1,500"], ["Server Monitoring", "₹500–₹2,000/month"], ["Website Monitoring", "₹300–₹1,000/month"], ["Security Alerts", "₹300–₹1,000/month"], ["Advanced Monitoring", "₹1,000+/month"], ["Custom Monitoring", "Custom"]], ShieldCheck, "Monitoring and alerting configured for authorized systems."),
  catalogGroup("Backup & Recovery Security", "From ₹100", [["Backup Configuration", "₹200–₹750"], ["Automated Backup Setup", "₹500–₹1,500"], ["Disaster Recovery Setup", "₹1,000–₹5,000+"], ["Recovery Testing", "₹500–₹2,000"], ["Custom Recovery Solution", "Custom"]], HardDrive, "Backup, recovery, and disaster-recovery readiness."),
  catalogGroup("Security Maintenance", "From ₹100", [["Security Update", "₹200+"], ["Vulnerability Fix", "₹500+"], ["Configuration Fix", "₹200+"], ["Security Hardening", "₹500+"], ["Monthly Security Maintenance", "₹1,000+/month"], ["Custom Security Maintenance", "Custom"]], Wrench, "Ongoing security updates, fixes, hardening, and maintenance."),
  catalogGroup("Security Consultation", "From ₹100", [["Basic Security Consultation", "₹200–₹500"], ["Security Architecture Review", "₹500–₹2,000"], ["Security Strategy", "₹1,000–₹5,000+"], ["Custom Security Consultation", "Custom"]], ShieldCheck, "Security planning and architecture consultation."),
  catalogGroup("Responsible Security Testing", "From ₹100", [["Authorized Vulnerability Assessment", "₹1,000–₹5,000+"], ["Authorized Penetration Testing", "₹3,000–₹15,000+"], ["Security Assessment Report", "₹1,000–₹5,000+"], ["Remediation Assistance", "₹500+"], ["Custom Authorized Security Testing", "Custom"]], ShieldCheck, "Authorized security testing and remediation support only."),
];

const COMMUNITY_SERVICES: AppService[] = [
  catalogGroup("Discord Community Setup", "From ₹100", [["Basic Community Setup", "₹100–₹300"], ["Standard Community Setup", "₹300–₹750"], ["Advanced Community Setup", "₹750–₹1,500"], ["Professional Community Setup", "₹1,500–₹3,000+"], ["Custom Community", "Custom"]], Bot, "Discord community setup and configuration."),
  catalogGroup("Community Structure", "From ₹100", [["Channel Structure", "₹100–₹300"], ["Role Structure", "₹100–₹300"], ["Permission Setup", "₹100–₹500"], ["Community Rules Setup", "₹100–₹300"], ["Server Organization", "₹100–₹500"], ["Complete Community Structure", "₹500–₹1,500+"]], Wrench, "Channels, roles, permissions, rules, and server organization."),
  catalogGroup("Community Bots & Automation", "From ₹100", [["Welcome Bot", "₹100–₹300"], ["Moderation Bot", "₹200–₹750"], ["Ticket Bot", "₹100–₹500"], ["Verification Bot", "₹200–₹750"], ["Leveling Bot", "₹200–₹500"], ["Custom Community Bot", "₹500–₹3,000+"], ["AI Community Bot", "₹1,000–₹5,000+"]], Bot, "Bots and automation for community workflows."),
  catalogGroup("Community Engagement", "From ₹100", [["Giveaway System", "₹100–₹500"], ["Poll System", "₹100–₹300"], ["Suggestion System", "₹100–₹500"], ["Reaction Roles", "₹100–₹300"], ["Leveling System", "₹200–₹750"], ["Rewards System", "₹300–₹1,000"], ["Community Economy", "₹300–₹1,000"], ["Custom Engagement System", "Custom"]], Bot, "Engagement, rewards, polls, suggestions, and community systems."),
  catalogGroup("Events", "From ₹100", [["Basic Community Event Setup", "₹100–₹300"], ["Gaming Event Setup", "₹200–₹750"], ["Tournament Setup", "₹500–₹2,000"], ["Community Competition", "₹300–₹1,500"], ["Event Management System", "₹500–₹2,000+"], ["Custom Event Setup", "Custom"]], Gamepad2, "Community events, competitions, tournaments, and event systems."),
  catalogGroup("Community Websites", "From ₹100", [["Basic Community Website", "₹500–₹1,500"], ["Community Landing Page", "₹500–₹2,000"], ["Standard Community Website", "₹2,000–₹5,000"], ["Advanced Community Platform", "₹5,000–₹15,000+"], ["Custom Community Website", "Custom"]], Globe, "Websites and platforms for online communities."),
  catalogGroup("Community Portals", "From ₹100", [["Member Portal", "₹2,000–₹5,000"], ["Application Portal", "₹1,000–₹3,000"], ["Staff Portal", "₹2,000–₹5,000"], ["Community Dashboard", "₹2,000–₹7,000"], ["Custom Community Portal", "Custom"]], Code2, "Member, staff, application, and dashboard portals."),
  catalogGroup("Community Branding", "From ₹100", [["Community Logo", "₹100–₹500"], ["Server Banner", "₹100–₹300"], ["Community Graphics", "₹100–₹500"], ["Emoji Pack", "₹100–₹500"], ["Sticker Pack", "₹100–₹500"], ["Complete Community Branding", "₹500–₹2,000+"]], Palette, "Branding assets for servers and communities."),
  catalogGroup("Community Moderation", "From ₹100", [["Moderation Setup", "₹100–₹500"], ["Auto Moderation", "₹200–₹750"], ["Staff System", "₹200–₹750"], ["Ticket System", "₹100–₹500"], ["Warning System", "₹100–₹500"], ["Complete Moderation System", "₹500–₹1,500+"]], ShieldCheck, "Moderation, tickets, warnings, staff systems, and automation."),
  catalogGroup("Community Growth", "From ₹100", [["Community Strategy", "₹500–₹2,000"], ["Community Setup & Launch", "₹500–₹2,000"], ["Engagement Strategy", "₹500–₹2,000"], ["Event Strategy", "₹300–₹1,000"], ["Community Growth Package", "₹1,000–₹5,000+"], ["Custom Growth Strategy", "Custom"]], Palette, "Community strategy, launch, engagement, and growth planning."),
  catalogGroup("Community Maintenance", "From ₹100", [["Bot Maintenance", "₹200+"], ["Server Maintenance", "₹200+"], ["Configuration Updates", "₹100+"], ["Security Updates", "₹200+"], ["Monthly Community Management", "₹1,000+/month"], ["Custom Maintenance", "Custom"]], Wrench, "Ongoing bot, server, configuration, and community maintenance."),
  catalogGroup("Custom Community Solutions", "Custom Quote", [["Custom Community Solution", "Custom"]], Bot, "A custom community, Discord system, member platform, event system, or automation package built around your requirements."),
];

const VIDEO_MOTION_SERVICES: AppService[] = [
  catalogGroup("Video Editing", "From ₹100", [["Basic Video Edit", "₹100–₹300"], ["Standard Video Edit", "₹300–₹750"], ["Advanced Video Edit", "₹750–₹2,000+"], ["Professional Video Edit", "₹2,000–₹5,000+"], ["Custom Video Editing", "Custom"]], Code2, "Editing for social content, creators, businesses, and longer videos."),
  catalogGroup("YouTube Videos", "From ₹200", [["Basic YouTube Video", "₹200–₹500"], ["Standard YouTube Video", "₹500–₹1,500"], ["Advanced YouTube Video", "₹1,500–₹3,500+"], ["YouTube Editing Pack", "₹1,000–₹5,000+"], ["Custom YouTube Editing", "Custom"]], Code2, "YouTube editing packages with scope agreed before production."),
  catalogGroup("Shorts and Reels", "From ₹100", [["Basic Short/Reel", "₹50–₹150"], ["Standard Short/Reel", "₹150–₹300"], ["Advanced Short/Reel", "₹300–₹750"], ["Shorts Pack", "₹500–₹2,000+"], ["Monthly Shorts Package", "₹1,500+/month"]], Code2, "Short-form edits for Reels, Shorts, and other social platforms."),
  catalogGroup("Gaming and Minecraft Videos", "From ₹200", [["Gaming Video Edit", "₹200–₹750"], ["Minecraft Video Edit", "₹200–₹750"], ["Gaming Montage", "₹300–₹1,000"], ["Minecraft Montage", "₹300–₹1,000"], ["Gaming Trailer", "₹500–₹2,000+"], ["SMP Trailer", "₹500–₹2,000+"], ["Gaming Editing Pack", "₹1,000–₹5,000+"]], Gamepad2, "Montages, trailers, edits, and content packages for gaming communities."),
  catalogGroup("Motion Graphics", "From ₹100", [["Basic Motion Graphic", "₹200–₹500"], ["Logo Animation", "₹200–₹750"], ["Text Animation", "₹100–₹500"], ["Motion Graphics Pack", "₹500–₹2,000+"], ["Advanced Motion Graphics", "₹1,000–₹5,000+"]], Sparkles, "Motion graphics, animated text, logos, and promotional visuals."),
  catalogGroup("Animations", "From ₹100", [["Basic Animation", "₹100–₹300"], ["2D Animation", "₹300–₹1,500+"], ["3D Animation", "₹750–₹3,000+"], ["Character Animation", "₹500–₹3,000+"], ["Custom Animation", "Custom"]], Sparkles, "2D, 3D, and character animation scoped to the required style."),
  catalogGroup("Intros and Outros", "From ₹100", [["Basic Intro", "₹100–₹300"], ["Animated Intro", "₹300–₹750"], ["Gaming Intro", "₹200–₹750"], ["YouTube Outro", "₹100–₹300"], ["Intro + Outro Pack", "₹300–₹1,000+"]], Sparkles, "Short branded openers and closers for videos and channels."),
  catalogGroup("Promotional Videos", "From ₹300", [["Basic Promo Video", "₹300–₹750"], ["Product Promo", "₹500–₹1,500"], ["Business Promo", "₹750–₹2,500+"], ["Social Media Advertisement", "₹300–₹1,000"], ["Promotional Video Package", "₹1,000–₹5,000+"]], Code2, "Promotional edits for products, businesses, campaigns, and social media."),
  catalogGroup("Thumbnails and Video Graphics", "From ₹100", [["Video Thumbnail", "₹100–₹250"], ["Thumbnail Pack", "₹500–₹1,000"], ["Video Overlay", "₹100–₹500"], ["Stream Overlay", "₹200–₹750"], ["Complete Video Graphics Pack", "₹500–₹2,000+"]], Palette, "Thumbnails, overlays, and supporting graphics for video content."),
  catalogGroup("Video Services", "From ₹100", [["Subtitles/Captions", "₹50–₹200"], ["Audio Cleanup", "₹100–₹500"], ["Color Correction", "₹100–₹500"], ["Color Grading", "₹200–₹750"], ["Background Removal", "₹50–₹200"], ["Video Upscaling/Enhancement", "₹100–₹500"]], Wrench, "Individual post-production tasks for existing video projects."),
  catalogGroup("Video Maintenance and Revisions", "From ₹100", [["Minor Revision", "₹50+"], ["Major Revision", "₹100+"], ["Re-edit", "₹100+"], ["Project Update", "₹100+"], ["Monthly Editing Package", "Custom"]], Wrench, "Revisions, updates, and recurring editing support."),
  catalogGroup("Custom Video and Motion", "Custom quote", [["Custom Video or Motion Project", "Custom"]], Sparkles, "A custom production package for video, animation, or motion graphics work."),
];

const BUSINESS_SOLUTIONS_SERVICES: AppService[] = [
  catalogGroup("Business Websites", "From ₹1,500", [["Business Landing Page", "₹1,500–₹3,000"], ["Business Website", "₹3,000–₹10,000"], ["Advanced Business Website", "₹10,000–₹25,000+"], ["Custom Business Website", "Custom"]], Globe, "Websites for businesses that need a clear online presence."),
  catalogGroup("Business Management Systems", "From ₹5,000", [["Basic Management System", "₹5,000–₹10,000"], ["Standard Management System", "₹10,000–₹20,000"], ["Advanced Management System", "₹20,000–₹40,000+"], ["Custom Business System", "Custom"]], Code2, "Systems for managing day-to-day business workflows."),
  catalogGroup("CRM Solutions", "From ₹5,000", [["Basic CRM", "₹5,000–₹10,000"], ["Standard CRM", "₹10,000–₹20,000"], ["Advanced CRM", "₹20,000–₹40,000+"], ["Custom CRM", "Custom"]], Database, "Customer relationship tools built around the team's process."),
  catalogGroup("Inventory Solutions", "From ₹3,000", [["Basic Inventory System", "₹3,000–₹7,000"], ["Standard Inventory System", "₹7,000–₹15,000"], ["Advanced Inventory System", "₹15,000–₹30,000+"], ["Custom Inventory System", "Custom"]], Database, "Inventory tracking and stock management systems."),
  catalogGroup("Billing and POS", "From ₹3,000", [["Basic Billing System", "₹3,000–₹7,000"], ["POS System", "₹5,000–₹15,000"], ["Advanced Billing System", "₹10,000–₹25,000+"], ["Custom Billing/POS", "Custom"]], Code2, "Billing and point-of-sale workflows for different business needs."),
  catalogGroup("Booking and Appointment Systems", "From ₹2,000", [["Basic Booking System", "₹2,000–₹5,000"], ["Appointment System", "₹3,000–₹8,000"], ["Advanced Booking Platform", "₹8,000–₹20,000+"], ["Custom Booking System", "Custom"]], Globe, "Booking, scheduling, and appointment management."),
  catalogGroup("Employee and Team Solutions", "From ₹2,000", [["Employee Management System", "₹5,000–₹15,000"], ["Attendance System", "₹3,000–₹8,000"], ["Leave Management System", "₹2,000–₹6,000"], ["Employee Portal", "₹5,000–₹15,000"], ["Team Collaboration System", "₹7,000–₹20,000+"], ["Custom Employee Solution", "Custom"]], Code2, "Internal tools for employees, attendance, leave, and collaboration."),
  catalogGroup("Customer Solutions", "From ₹1,000", [["Customer Portal", "₹3,000–₹8,000"], ["Customer Support System", "₹3,000–₹10,000"], ["Feedback System", "₹1,000–₹3,000"], ["Loyalty System", "₹3,000–₹10,000"], ["Customer Management Platform", "₹7,000–₹20,000+"], ["Custom Customer Solution", "Custom"]], Code2, "Customer-facing portals and support workflows."),
  catalogGroup("Data and Analytics", "From ₹1,000", [["Basic Business Dashboard", "₹2,000–₹5,000"], ["Analytics Dashboard", "₹5,000–₹12,000"], ["Sales Dashboard", "₹3,000–₹8,000"], ["Business Reports", "₹1,000–₹5,000"], ["Advanced Analytics System", "₹10,000–₹25,000+"], ["Custom Analytics Solution", "Custom"]], Database, "Dashboards and reporting tools for business decisions."),
  catalogGroup("Business Automation", "From ₹500", [["Email Automation", "₹500–₹2,000"], ["Lead Automation", "₹1,000–₹5,000"], ["Invoice Automation", "₹1,000–₹5,000"], ["Report Automation", "₹1,000–₹5,000"], ["Workflow Automation", "₹2,000–₹10,000+"], ["Complete Business Automation", "Custom"]], Cpu, "Automations that reduce repetitive business tasks."),
  catalogGroup("E-Commerce Solutions", "From ₹3,000", [["Basic Online Store", "₹3,000–₹7,000"], ["Standard E-Commerce", "₹7,000–₹15,000"], ["Advanced E-Commerce", "₹15,000–₹30,000+"], ["Custom E-Commerce Platform", "Custom"]], Globe, "Online stores and e-commerce workflows."),
  catalogGroup("Business Integrations", "From ₹500", [["Payment Integration", "₹1,000–₹3,000"], ["Email Integration", "₹500–₹2,000"], ["WhatsApp Integration", "₹1,000–₹5,000"], ["API Integration", "₹500–₹5,000+"], ["Third-Party Integration", "₹500–₹5,000+"], ["Custom Integration", "Custom"]], Code2, "Connect business tools, APIs, payments, and communication channels."),
  catalogGroup("Business Maintenance", "From ₹100", [["Bug Fix", "₹100+"], ["System Update", "₹500+"], ["Feature Addition", "₹500+"], ["Optimization", "₹500+"], ["Monthly Maintenance", "₹1,000+/month"], ["Custom Maintenance", "Custom"]], Wrench, "Ongoing fixes, updates, improvements, and maintenance."),
  catalogGroup("Custom Business Solutions", "Custom quote", [["Custom Business Solution", "Custom"]], Code2, "A tailored technology solution based on the business problem and requirements."),
];

const DESIGN_BRANDING_SERVICES: AppService[] = [
  catalogGroup("Logo Design", "From ₹100", [["Basic Logo", "₹100–₹250"], ["Standard Logo", "₹250–₹500"], ["Premium Logo", "₹500–₹1,000"], ["Professional Brand Logo", "₹1,000–₹2,500+"], ["Custom Logo", "Custom"]], Palette, "Logo work for personal projects, creators, communities, and businesses."),
  catalogGroup("Brand Identity", "From ₹500", [["Basic Brand Identity", "₹500–₹1,500"], ["Standard Brand Identity", "₹1,500–₹3,000"], ["Complete Brand Identity", "₹3,000–₹7,500+"], ["Brand Guidelines", "₹1,000–₹3,000"], ["Full Branding Package", "₹5,000–₹15,000+"]], Palette, "A consistent visual identity with the core assets your brand needs."),
  catalogGroup("Minecraft and Gaming Branding", "From ₹100", [["SMP Logo", "₹50–₹150"], ["Gaming Logo", "₹100–₹300"], ["Gaming Banner", "₹100–₹300"], ["Server Icon", "₹50–₹150"], ["Server Branding Pack", "₹300–₹1,000"], ["Gaming Brand Package", "₹500–₹2,000+"]], Gamepad2, "Branding assets for gaming communities, servers, and creators."),
  catalogGroup("YouTube and Creator Design", "From ₹100", [["YouTube Thumbnail", "₹100–₹250"], ["Thumbnail Pack", "₹500–₹1,000"], ["YouTube Banner", "₹150–₹400"], ["YouTube Profile Picture", "₹100–₹250"], ["Stream Overlay", "₹200–₹750"], ["Stream Graphics Pack", "₹500–₹2,000+"], ["Creator Branding Package", "₹750–₹3,000+"]], Palette, "Thumbnails, channel graphics, stream assets, and creator branding."),
  catalogGroup("Social Media Design", "From ₹100", [["Social Media Post", "₹50–₹150"], ["Social Media Banner", "₹100–₹300"], ["Profile Picture", "₹50–₹150"], ["Story Design", "₹50–₹150"], ["Social Media Pack", "₹300–₹1,000+"], ["Complete Social Branding", "₹750–₹3,000+"]], Palette, "Reusable social graphics for regular posting and campaigns."),
  catalogGroup("Business Design", "From ₹100", [["Business Logo", "₹250–₹750"], ["Business Card", "₹100–₹300"], ["Letterhead", "₹100–₹300"], ["Brochure", "₹200–₹750"], ["Flyer", "₹100–₹400"], ["Poster", "₹100–₹500"], ["Business Design Pack", "₹500–₹2,000+"]], Palette, "Practical print and digital assets for businesses."),
  catalogGroup("UI and UX Design", "From ₹100", [["Basic UI Screen", "₹100–₹300"], ["Website UI Design", "₹500–₹2,000+"], ["App UI Design", "₹750–₹3,000+"], ["Dashboard UI", "₹500–₹2,000"], ["UI/UX Prototype", "₹1,000–₹5,000+"], ["Complete UI/UX Design", "Custom"]], Smartphone, "Interfaces and prototypes for websites, apps, and dashboards."),
  catalogGroup("Banners and Graphics", "From ₹100", [["Website Banner", "₹100–₹300"], ["Discord Banner", "₹100–₹300"], ["YouTube Banner", "₹150–₹400"], ["Advertisement Banner", "₹100–₹300"], ["Promotional Graphic", "₹100–₹500"], ["Banner Pack", "₹300–₹1,000+"]], Palette, "Banners and promotional graphics for digital channels."),
  catalogGroup("Presentation and Documents", "From ₹200", [["Presentation Design", "₹200–₹1,000+"], ["Pitch Deck", "₹500–₹2,500+"], ["Resume/CV Design", "₹100–₹500"], ["Portfolio Design", "₹200–₹1,000"], ["Business Document Design", "₹200–₹1,000+"]], Code2, "Clear, polished presentations, resumes, portfolios, and documents."),
  catalogGroup("Design Packs", "From ₹300", [["Starter Design Pack", "₹300–₹750"], ["Creator Design Pack", "₹750–₹1,500"], ["Gaming Design Pack", "₹500–₹1,500"], ["Business Design Pack", "₹1,000–₹3,000"], ["Premium Branding Pack", "₹3,000–₹7,500+"], ["Complete Brand Package", "₹5,000–₹15,000+"]], Palette, "Grouped assets for a consistent look across a project or brand."),
  catalogGroup("Custom Design", "Custom quote", [["Custom Design Project", "Custom"]], Palette, "Tell Fubrio what you need and we will scope a design or branding package around it."),
];

const DISCORD_SERVICES: AppService[] = [
  catalogGroup("Discord Server Setup", "From ₹100", [["Basic Discord Server Setup", "₹100–₹250"], ["Standard Discord Server Setup", "₹250–₹500"], ["Advanced Discord Server Setup", "₹500–₹1,000"], ["Professional Community Setup", "₹1,000–₹2,500+"], ["Custom Discord Server", "Custom"]], Bot, "A clear server foundation for communities, teams, and projects."),
  catalogGroup("Discord Server Design", "From ₹100", [["Server Structure", "₹100–₹300"], ["Channel Organization", "₹100–₹300"], ["Role Structure", "₹100–₹300"], ["Permission Setup", "₹100–₹500"], ["Server Branding", "₹200–₹750"], ["Complete Server Design", "₹500–₹1,500+"]], Wrench, "Channels, roles, permissions, and server structure arranged around your needs."),
  catalogGroup("Discord Bots", "From ₹100", [["Basic Bot Setup", "₹100–₹300"], ["Custom Bot", "₹300–₹1,500"], ["Advanced Bot", "₹1,000–₹5,000+"], ["AI Discord Bot", "₹1,000–₹5,000+"], ["Custom Bot Development", "Custom"]], Bot, "Bot setup and development for moderation, utility, community, and automation."),
  catalogGroup("Moderation and Security", "From ₹100", [["Moderation Setup", "₹100–₹300"], ["Auto Moderation", "₹200–₹500"], ["Anti-Raid Setup", "₹200–₹750"], ["Anti-Spam Setup", "₹100–₹500"], ["Verification System", "₹200–₹750"], ["Security Configuration", "₹300–₹1,000"], ["Complete Security Setup", "₹500–₹1,500+"]], ShieldCheck, "Moderation and server protection configuration for your community."),
  catalogGroup("Tickets and Support", "From ₹100", [["Basic Ticket System", "₹100–₹300"], ["Advanced Ticket System", "₹300–₹750"], ["Application System", "₹200–₹750"], ["Support System", "₹200–₹750"], ["Custom Ticket System", "Custom"]], Wrench, "Ticket, application, and support flows for members and staff."),
  catalogGroup("Discord Community Systems", "From ₹100", [["Welcome System", "₹100–₹300"], ["Reaction Roles", "₹100–₹300"], ["Leveling System", "₹200–₹500"], ["Economy System", "₹300–₹1,000"], ["Verification System", "₹200–₹750"], ["Giveaway System", "₹100–₹500"], ["Suggestion System", "₹100–₹500"], ["Custom Community System", "Custom"]], Bot, "Community features that make everyday server management easier."),
  catalogGroup("Discord Integrations", "From ₹100", [["YouTube Integration", "₹100–₹300"], ["Twitch Integration", "₹100–₹300"], ["GitHub Integration", "₹200–₹500"], ["Minecraft Server Integration", "₹200–₹750"], ["Website Integration", "₹300–₹1,000"], ["API Integration", "₹500–₹2,000+"], ["Custom Integration", "Custom"]], Cloud, "Connect Discord with websites, games, developer tools, and external services."),
  catalogGroup("Discord Graphics", "From ₹100", [["Server Icon", "₹50–₹150"], ["Server Banner", "₹100–₹300"], ["Emoji Pack", "₹100–₹500"], ["Sticker Pack", "₹100–₹500"], ["Server Graphics Pack", "₹300–₹1,000+"]], Palette, "Visual assets for your server identity and community experience."),
  catalogGroup("Discord Maintenance", "From ₹100", [["Bot Fix", "₹100+"], ["Configuration Fix", "₹100+"], ["Permission Fix", "₹100+"], ["Security Update", "₹200+"], ["Bot Update", "₹200+"], ["Monthly Maintenance", "₹500+/month"], ["Custom Maintenance", "Custom"]], Wrench, "Ongoing fixes, updates, and maintenance for Discord systems."),
  catalogGroup("Custom Discord Development", "Custom quote", [["Custom Discord Project", "Custom"]], Bot, "Tell Fubrio what you need and we will scope a custom Discord solution."),
];


const MAINTENANCE_SERVICES: AppService[] = [
  catalogGroup("Website Maintenance", "From ₹100", [["Basic Website Maintenance", "₹500–₹1,000/month"], ["Standard Website Maintenance", "₹1,000–₹2,500/month"], ["Advanced Website Maintenance", "₹2,500–₹5,000/month"], ["Enterprise Website Maintenance", "₹5,000+/month"], ["One-Time Website Update", "₹200+"]], Wrench, "Ongoing website updates, fixes, optimization, and support."),
  catalogGroup("App Maintenance", "From ₹100", [["Basic App Maintenance", "₹1,000–₹2,500/month"], ["Standard App Maintenance", "₹2,500–₹5,000/month"], ["Advanced App Maintenance", "₹5,000–₹10,000/month"], ["Enterprise App Maintenance", "₹10,000+/month"], ["One-Time App Update", "₹500+"]], Smartphone, "Maintenance and updates for mobile applications."),
  catalogGroup("Software Maintenance", "From ₹100", [["Bug Fixes", "₹200+"], ["Software Updates", "₹500+"], ["Feature Updates", "₹500+"], ["Dependency Updates", "₹300+"], ["Performance Optimization", "₹500+"], ["Code Cleanup", "₹500+"], ["Security Updates", "₹500+"], ["Custom Software Maintenance", "Custom"]], Code2, "Updates, fixes, cleanup, optimization, and security maintenance."),
  catalogGroup("Server & Hosting Maintenance", "From ₹100", [["Basic Server Maintenance", "₹500/month"], ["Standard Server Maintenance", "₹1,000/month"], ["Advanced Server Maintenance", "₹2,500/month"], ["Server Optimization", "₹500+"], ["Server Migration", "₹1,000+"], ["Backup Configuration", "₹500+"], ["Monitoring Setup", "₹500+"], ["Custom Server Maintenance", "Custom"]], Server, "Server, hosting, migration, backup, and monitoring maintenance."),
  catalogGroup("Minecraft Server Maintenance", "From ₹100", [["Basic Server Maintenance", "₹300/month"], ["Plugin Management", "₹300/month"], ["Server Optimization", "₹500+"], ["Plugin Updates", "₹200+"], ["Configuration Updates", "₹200+"], ["Backup Setup", "₹300+"], ["Performance Optimization", "₹500+"], ["Full Server Management", "₹1,000+/month"]], Gamepad2, "Maintenance and management for Minecraft servers and plugins."),
  catalogGroup("Discord Maintenance", "From ₹100", [["Basic Discord Maintenance", "₹300/month"], ["Bot Maintenance", "₹300/month"], ["Bot Updates", "₹200+"], ["Security Configuration", "₹300+"], ["Automation Updates", "₹300+"], ["Full Discord Management", "₹1,000+/month"]], Bot, "Updates, maintenance, security, and automation support for Discord."),
  catalogGroup("Database Maintenance", "From ₹100", [["Database Backup", "₹300+"], ["Database Optimization", "₹500+"], ["Database Migration", "₹1,000+"], ["Database Cleanup", "₹300+"], ["Database Monitoring", "₹500+/month"], ["Database Maintenance", "₹1,000+/month"]], Database, "Database backups, optimization, migrations, cleanup, and monitoring."),
  catalogGroup("AI System Maintenance", "From ₹100", [["AI Model/API Updates", "₹500+"], ["Prompt/System Updates", "₹300+"], ["AI Integration Maintenance", "₹1,000+"], ["AI Performance Optimization", "₹1,000+"], ["AI System Monitoring", "₹1,000+/month"], ["Custom AI Maintenance", "Custom"]], Sparkles, "Maintenance for AI integrations, prompts, APIs, and systems."),
  catalogGroup("Emergency Support", "From ₹100", [["Critical Bug Fix", "₹500+"], ["Emergency Website Fix", "₹500+"], ["Emergency Server Fix", "₹750+"], ["Emergency App Fix", "₹1,000+"], ["Priority Support", "Custom"]], ShieldCheck, "Priority assistance for urgent project issues."),
  catalogGroup("Maintenance Packages", "From ₹999", [["Starter Maintenance", "₹999/month"], ["Professional Maintenance", "₹2,499/month"], ["Business Maintenance", "₹4,999/month"], ["Enterprise Maintenance", "₹10,000+/month"]], Wrench, "Structured monthly maintenance packages for different support needs."),
  catalogGroup("Custom Maintenance", "Custom quote", [["Custom Maintenance Plan", "Custom"]], Wrench, "A maintenance plan tailored to your project, technology, workload, and support requirements."),
];

const CONSULTING_SERVICES: AppService[] = [
  catalogGroup("Technology Consulting", "From ₹100", [["General Technology Consultation", "₹300/hour"], ["Technical Consultation", "₹500/hour"], ["Advanced Technical Consultation", "₹1,000/hour"], ["Enterprise Technology Consulting", "Custom"]], Cpu, "Technology guidance, technical decisions, and architecture discussions."),
  catalogGroup("Website Consulting", "From ₹100", [["Website Review", "₹300"], ["Website Improvement Consultation", "₹500"], ["Website Architecture Consultation", "₹750"], ["Website Performance Consultation", "₹750"], ["Website Security Consultation", "₹750"], ["Website Strategy Consultation", "₹1,000"]], Globe, "Reviews and planning for website quality, performance, security, and strategy."),
  catalogGroup("App Consulting", "From ₹100", [["App Idea Consultation", "₹300"], ["App Planning Session", "₹500"], ["App Architecture Consultation", "₹750"], ["Feature Planning", "₹500"], ["App Technology Selection", "₹500"], ["App Development Roadmap", "₹1,000"], ["Custom App Consultation", "Custom"]], Smartphone, "Planning, architecture, technology selection, and roadmaps for apps."),
  catalogGroup("Software Consulting", "From ₹100", [["Software Idea Consultation", "₹300"], ["Software Architecture", "₹750"], ["Technology Stack Selection", "₹500"], ["Development Planning", "₹750"], ["Codebase Review", "₹1,000+"], ["Software Roadmap", "₹1,000+"], ["Custom Software Consulting", "Custom"]], Code2, "Software planning, architecture, codebase review, and development roadmaps."),
  catalogGroup("AI Consulting", "From ₹100", [["AI Idea Consultation", "₹300"], ["AI Tool Selection", "₹500"], ["AI Integration Planning", "₹750"], ["AI Automation Consultation", "₹750"], ["AI Architecture Planning", "₹1,000"], ["AI Product Roadmap", "₹1,500+"], ["Custom AI Consulting", "Custom"]], Sparkles, "AI product planning, tool selection, integrations, and architecture."),
  catalogGroup("Business Technology Consulting", "From ₹100", [["Digital Transformation Consultation", "₹750"], ["Business Automation Consultation", "₹750"], ["Software Selection Consultation", "₹500"], ["Technology Planning", "₹1,000"], ["Digital Product Planning", "₹1,000"], ["Business System Planning", "₹1,500+"], ["Custom Business Consulting", "Custom"]], Wrench, "Technology strategy and systems planning for businesses."),
  catalogGroup("Hosting & Infrastructure Consulting", "From ₹100", [["Hosting Consultation", "₹300"], ["Server Selection", "₹500"], ["Infrastructure Planning", "₹750"], ["Cloud Architecture Consultation", "₹1,000"], ["Deployment Planning", "₹500"], ["Migration Planning", "₹750"], ["Infrastructure Optimization", "₹1,000+"], ["Custom Infrastructure Consulting", "Custom"]], Cloud, "Hosting, infrastructure, deployment, migration, and cloud planning."),
  catalogGroup("Security Consulting", "From ₹100", [["Basic Security Review", "₹500"], ["Website Security Review", "₹750"], ["Application Security Review", "₹1,000+"], ["Server Security Review", "₹1,000+"], ["Discord Security Review", "₹500"], ["Security Recommendations", "₹500+"], ["Custom Security Consulting", "Custom"]], ShieldCheck, "Security reviews and recommendations for authorized systems."),
  catalogGroup("Creator Consulting", "From ₹100", [["Creator Technology Consultation", "₹300"], ["Website Planning", "₹500"], ["Portfolio Planning", "₹500"], ["YouTube/Content Technology Consultation", "₹500"], ["Creator Automation Planning", "₹750"], ["Creator Brand Technology Consultation", "₹750"]], Palette, "Technology and planning support for creators and their platforms."),
  catalogGroup("Project Consultation", "From ₹100", [["Project Idea Review", "₹300"], ["Project Feasibility Review", "₹500"], ["Project Planning", "₹750"], ["Feature Planning", "₹500"], ["Development Roadmap", "₹1,000+"], ["Technology Roadmap", "₹1,000+"], ["Full Project Consultation", "Custom"]], Code2, "Idea reviews, feasibility, planning, roadmaps, and implementation guidance."),
  catalogGroup("Consultation Packages", "From ₹100", [["Quick Consultation", "₹299"], ["Standard Consultation", "₹599"], ["Professional Consultation", "₹1,499"], ["Business Consultation", "₹2,999+"]], Wrench, "Consultation packages with discussion, analysis, recommendations, and roadmaps."),
  catalogGroup("Custom Consulting", "Custom quote", [["Custom Consulting Session", "Custom"]], Wrench, "Guidance for problems, ideas, projects, technology, architecture, and next steps."),
];

function enforceMinimumInr(price: string): string {
  return price.replace(/₹\s*([\d,]+)/g, (_, raw: string) => {
    const value = Number(raw.replace(/,/g, ""));
    return `₹${Math.max(100, value).toLocaleString("en-IN")}`;
  });
}

function formatPrice(s: any): string {
  if (s.pricingType === "custom") return "Custom";
  const currency = s.currency || "INR";
  const symbol = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  const rawPrice = s.price ?? 0;
  const rawPriceMax = s.priceMax ?? 0;
  const price = currency === "INR" ? Math.max(100, rawPrice) : rawPrice;
  const priceMax = rawPriceMax ? (currency === "INR" ? Math.max(100, rawPriceMax) : rawPriceMax) : 0;
  const autoConvert = s.autoConvertCurrency === true;
  const usdPrice = currency === "INR" ? Math.round(price / 83) : price;
  const usdPriceMax = currency === "INR" && priceMax ? Math.round(priceMax / 83) : priceMax;

  if (priceMax > 0) {
    const range = `${symbol}${price.toLocaleString()}–${symbol}${priceMax.toLocaleString()}`;
    if (autoConvert && currency === "INR") return `${range} ($${usdPrice.toLocaleString()}–$${usdPriceMax.toLocaleString()})`;
    return range;
  }
  if (s.pricingType === "hourly" && price) {
    const val = `${symbol}${price.toLocaleString()}/hr`;
    if (autoConvert && currency === "INR") return `${val} ($${usdPrice}/hr)`;
    return val;
  }
  if (s.pricingType === "fixed" && price) {
    const val = `${symbol}${price.toLocaleString()}`;
    if (autoConvert && currency === "INR") return `${val} ($${usdPrice.toLocaleString()})`;
    return val;
  }
  return "Custom";
}


function formatUsdPrice(price: string, rate: number): string | null {
  const normalizedPrice = enforceMinimumInr(price);
  if (!normalizedPrice || /custom/i.test(normalizedPrice)) return null;
  const values = [...normalizedPrice.matchAll(/₹\s*([\d,]+)/g)].map((match) => Number(match[1].replace(/,/g, "")));
  if (!values.length) return null;
  const usdValues = values.map((value) => Math.round(value * rate));
  let index = 0;
  const converted = normalizedPrice.replace(/₹\s*[\d,]+/g, () => `$${usdValues[index++].toLocaleString("en-US")}`);
  return `≈ ${converted}`;
}

function UsdPrice({ price, rate }: { price: string; rate: number }) {
  const converted = formatUsdPrice(enforceMinimumInr(price), rate);
  if (!converted) return null;
  return <div className="mt-1 text-xs text-muted-foreground">{converted}</div>;
}


export function ServicesGrid({ services, categories }: { services: SerializedService[]; categories?: SerializedCategory[] }) {
  const [selectedHosting, setSelectedHosting] = useState<HostingService | null>(null);
  const [selectedAppService, setSelectedAppService] = useState<AppService | null>(null);
  const [hostingOpen, setHostingOpen] = useState(false);
  const [appDevelopmentOpen, setAppDevelopmentOpen] = useState(false);
  const [selectedWebService, setSelectedWebService] = useState<WebDevelopmentService | null>(null);
  const [webDevelopmentOpen, setWebDevelopmentOpen] = useState(false);
  const [selectedSoftwareService, setSelectedSoftwareService] = useState<AppService | null>(null);
  const [softwareDevelopmentOpen, setSoftwareDevelopmentOpen] = useState(false);
  const [selectedAiService, setSelectedAiService] = useState<AppService | null>(null);
  const [aiAutomationOpen, setAiAutomationOpen] = useState(false);
  const [gameDevelopmentOpen, setGameDevelopmentOpen] = useState(false);
  const [minecraftOpen, setMinecraftOpen] = useState(false);
  const [selectedGameService, setSelectedGameService] = useState<AppService | null>(null);
  const [selectedMinecraftService, setSelectedMinecraftService] = useState<AppService | null>(null);
  const [designBrandingOpen, setDesignBrandingOpen] = useState(false);
  const [discordOpen, setDiscordOpen] = useState(false);
  const [selectedDesignService, setSelectedDesignService] = useState<AppService | null>(null);
  const [selectedDiscordService, setSelectedDiscordService] = useState<AppService | null>(null);
  const [videoMotionOpen, setVideoMotionOpen] = useState(false);
  const [businessSolutionsOpen, setBusinessSolutionsOpen] = useState(false);
  const [selectedVideoMotionService, setSelectedVideoMotionService] = useState<AppService | null>(null);
  const [selectedBusinessSolutionsService, setSelectedBusinessSolutionsService] = useState<AppService | null>(null);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [creatorServicesOpen, setCreatorServicesOpen] = useState(false);
  const [selectedMarketingService, setSelectedMarketingService] = useState<AppService | null>(null);
  const [selectedCreatorService, setSelectedCreatorService] = useState<AppService | null>(null);
  const [fubzSecurityOpen, setFubzSecurityOpen] = useState(false);
  const [communityServicesOpen, setCommunityServicesOpen] = useState(false);
  const [selectedFubzSecurityService, setSelectedFubzSecurityService] = useState<AppService | null>(null);
  const [selectedCommunityService, setSelectedCommunityService] = useState<AppService | null>(null);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [consultingOpen, setConsultingOpen] = useState(false);
  const [selectedMaintenanceService, setSelectedMaintenanceService] = useState<AppService | null>(null);
  const [selectedConsultingService, setSelectedConsultingService] = useState<AppService | null>(null);
  const [usdRate, setUsdRate] = useState(1 / 83);

  useEffect(() => {
    let active = true;
    fetch("https://open.er-api.com/v6/latest/INR", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const rate = Number(data?.rates?.USD);
        if (active && Number.isFinite(rate) && rate > 0) setUsdRate(rate);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  const serviceCategories = (categories ?? []).filter((c: any) => c.type === "service" || c.type === "Service");
  const categorized = serviceCategories.map((cat) => ({
    category: cat,
    services: services.filter((s: any) => s.category?.id === cat.id),
  })).filter((g) => g.services.length > 0);
  const uncategorized = services.filter((s: any) => !s.category);

  return (
    <section className="py-24 sm:py-32 bg-secondary/30 border-y border-border/60" id="services">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Services</div>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Custom development for ambitious teams.
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl">
              Websites, apps, software, hosting, automation, and practical support for people building something of their own.
            </p>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <Button variant="outline" onClick={() => navigate("#contact")} className="rounded-full">
              Start a project
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-border/70 bg-background/60 p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Fubrio Hosting</div>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold">Hosting that fits the project.</h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">Servers, websites, bots, databases, storage, and deployment support. Open a service to see its available plans and request a setup.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button variant="outline" className="rounded-full" onClick={() => setHostingOpen((open) => !open)}>
                {hostingOpen ? "Hide services" : "Explore hosting"}
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => navigate("#contact")}>
                Talk to us <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
          {hostingOpen && <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOSTING_SERVICES.map((hosting) => {
              const HostingIcon = hosting.icon;
              return (
                <button key={hosting.title} type="button" onClick={() => setSelectedHosting(hosting)} className="group rounded-2xl border border-border/70 bg-card/50 p-5 text-left transition-colors hover:border-[var(--fubrio-accent)] hover:bg-[var(--fubrio-accent-soft)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background">
                      <HostingIcon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <h4 className="mt-5 font-display text-lg font-semibold">{hosting.title}</h4>
                  <p className="mt-1 min-h-12 text-sm text-muted-foreground">{hosting.summary}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <div><div className="font-medium">{enforceMinimumInr(hosting.from)}</div><UsdPrice price={hosting.from} rate={usdRate} /></div>
                    <span className="text-muted-foreground">View plans</span>
                  </div>
                </button>
              );
            })}
          </div>} 
        </div>

        <div className="mt-8 rounded-3xl border border-border/70 bg-background/60 p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">App Development</div>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold">Apps built around your idea.</h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">Android, iOS, cross-platform, business, e-commerce, social, AI, and custom app work. Open a service to view its starting plans.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button variant="outline" className="rounded-full" onClick={() => setAppDevelopmentOpen((open) => !open)}>
                {appDevelopmentOpen ? "Hide services" : "Explore app development"}
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => navigate("#contact")}>
                Talk to us <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
          {appDevelopmentOpen && <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {APP_DEVELOPMENT_SERVICES.map((appService) => {
              const AppIcon = appService.icon;
              return (
                <button key={appService.title} type="button" onClick={() => setSelectedAppService(appService)} className="group rounded-2xl border border-border/70 bg-card/50 p-5 text-left transition-colors hover:border-[var(--fubrio-accent)] hover:bg-[var(--fubrio-accent-soft)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background">
                      <AppIcon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <h4 className="mt-5 font-display text-lg font-semibold">{appService.title}</h4>
                  <p className="mt-1 min-h-12 text-sm text-muted-foreground">{appService.summary}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <div><div className="font-medium">{enforceMinimumInr(appService.from)}</div><UsdPrice price={appService.from} rate={usdRate} /></div>
                    <span className="text-muted-foreground">View plans</span>
                  </div>
                </button>
              );
            })}
          </div>}
        </div>

        <div className="mt-8 rounded-3xl border border-border/70 bg-background/60 p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Web Development</div>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold">Websites that fit the work.</h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">Landing pages, business websites, stores, web apps, SaaS products, dashboards, and custom web projects.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button variant="outline" className="rounded-full" onClick={() => setWebDevelopmentOpen((open) => !open)}>
                {webDevelopmentOpen ? "Hide services" : "Explore web development"}
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => navigate("#contact")}>
                Talk to us <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
          {webDevelopmentOpen && <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WEB_DEVELOPMENT_SERVICES.map((webService) => {
              const WebIcon = webService.icon;
              return (
                <button key={webService.title} type="button" onClick={() => setSelectedWebService(webService)} className="group rounded-2xl border border-border/70 bg-card/50 p-5 text-left transition-colors hover:border-[var(--fubrio-accent)] hover:bg-[var(--fubrio-accent-soft)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background">
                      <WebIcon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <h4 className="mt-5 font-display text-lg font-semibold">{webService.title}</h4>
                  <p className="mt-1 min-h-12 text-sm text-muted-foreground">{webService.summary}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <div><div className="font-medium">{enforceMinimumInr(webService.from)}</div><UsdPrice price={webService.from} rate={usdRate} /></div>
                    <span className="text-muted-foreground">View plans</span>
                  </div>
                </button>
              );
            })}
          </div>}
        </div>


        <ServiceCollectionSection
          label="Software Development"
          heading="Software shaped around the work."
          description="Custom software, desktop applications, business systems, APIs, databases, integrations, and maintenance."
          open={softwareDevelopmentOpen}
          onToggle={() => setSoftwareDevelopmentOpen((open) => !open)}
          services={SOFTWARE_DEVELOPMENT_SERVICES}
          onSelect={setSelectedSoftwareService}
          buttonLabel="Explore software development"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="AI and Automation"
          heading="Useful AI and automation, built for the task."
          description="Chatbots, assistants, AI applications, agents, business automation, knowledge systems, and custom integrations."
          open={aiAutomationOpen}
          onToggle={() => setAiAutomationOpen((open) => !open)}
          services={AI_AUTOMATION_SERVICES}
          onSelect={setSelectedAiService}
          buttonLabel="Explore AI and automation"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Game Development"
          heading="Games built around the way you want to play."
          description="Prototypes, 2D and 3D games, mobile and PC projects, multiplayer systems, Minecraft work, assets, and maintenance."
          open={gameDevelopmentOpen}
          onToggle={() => setGameDevelopmentOpen((open) => !open)}
          services={GAME_DEVELOPMENT_SERVICES}
          onSelect={setSelectedGameService}
          buttonLabel="Explore game development"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Minecraft"
          heading="Minecraft services for servers and communities."
          description="Server setup, plugins, mods, builds, skins, texture packs, SMP systems, minigames, optimization, and maintenance."
          open={minecraftOpen}
          onToggle={() => setMinecraftOpen((open) => !open)}
          services={MINECRAFT_SERVICES}
          onSelect={setSelectedMinecraftService}
          buttonLabel="Explore Minecraft services"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Vidz and Motions"
          heading="Video and motion work for your next release."
          description="Video editing, shorts, gaming videos, motion graphics, animation, promotional content, and custom production."
          open={videoMotionOpen}
          onToggle={() => setVideoMotionOpen((open) => !open)}
          services={VIDEO_MOTION_SERVICES}
          onSelect={setSelectedVideoMotionService}
          buttonLabel="Explore video and motion"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Business Solutions"
          heading="Technology built around your business."
          description="Business websites, management systems, CRM, inventory, billing, booking, analytics, automation, integrations, and maintenance."
          open={businessSolutionsOpen}
          onToggle={() => setBusinessSolutionsOpen((open) => !open)}
          services={BUSINESS_SOLUTIONS_SERVICES}
          onSelect={setSelectedBusinessSolutionsService}
          buttonLabel="Explore business solutions"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Marketing"
          heading="Marketing built around your audience and goals."
          description="Social media, advertising, SEO, content, campaigns, analytics, consultation, and brand promotion."
          open={marketingOpen}
          onToggle={() => setMarketingOpen((open) => !open)}
          services={MARKETING_SERVICES}
          onSelect={setSelectedMarketingService}
          buttonLabel="Explore marketing services"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Creator Services"
          heading="Tools and services for creators building their presence."
          description="YouTube, video editing, branding, streaming, social media, portfolios, growth, assets, and consultation."
          open={creatorServicesOpen}
          onToggle={() => setCreatorServicesOpen((open) => !open)}
          services={CREATOR_SERVICES}
          onSelect={setSelectedCreatorService}
          buttonLabel="Explore creator services"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Fubz Security"
          heading="Security services for systems you own or are explicitly authorized to test."
          description="Website, application, server, Discord, Minecraft, API, database, monitoring, recovery, maintenance, consultation, and responsible security testing. All testing requires explicit client authorization."
          open={fubzSecurityOpen}
          onToggle={() => setFubzSecurityOpen((open) => !open)}
          services={FUBZ_SECURITY_SERVICES}
          onSelect={setSelectedFubzSecurityService}
          buttonLabel="Explore Fubz Security"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Community Services"
          heading="Build, organize, automate, and grow your community."
          description="Discord setup, structure, bots, engagement, events, websites, portals, branding, moderation, growth, and maintenance."
          open={communityServicesOpen}
          onToggle={() => setCommunityServicesOpen((open) => !open)}
          services={COMMUNITY_SERVICES}
          onSelect={setSelectedCommunityService}
          buttonLabel="Explore community services"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Maintenance"
          heading="Keep your projects reliable and up to date."
          description="Website, app, software, server, Minecraft, Discord, database, AI, emergency, and ongoing maintenance services."
          open={maintenanceOpen}
          onToggle={() => setMaintenanceOpen((open) => !open)}
          services={MAINTENANCE_SERVICES}
          onSelect={setSelectedMaintenanceService}
          buttonLabel="Explore maintenance services"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Consulting"
          heading="Clear technical direction for your next step."
          description="Technology, website, app, software, AI, business, infrastructure, security, creator, project, and consultation packages."
          open={consultingOpen}
          onToggle={() => setConsultingOpen((open) => !open)}
          services={CONSULTING_SERVICES}
          onSelect={setSelectedConsultingService}
          buttonLabel="Explore consulting services"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Dezign by Fubrio"
          heading="Design that gives your work a clear identity."
          description="Logos, branding, creator graphics, social media assets, UI and UX design, presentations, and custom design work."
          open={designBrandingOpen}
          onToggle={() => setDesignBrandingOpen((open) => !open)}
          services={DESIGN_BRANDING_SERVICES}
          onSelect={setSelectedDesignService}
          buttonLabel="Explore design services"
          rate={usdRate}
        />

        <ServiceCollectionSection
          label="Discord"
          heading="Discord setup, bots, and community systems."
          description="Server structure, bots, moderation, tickets, integrations, graphics, maintenance, and custom Discord development."
          open={discordOpen}
          onToggle={() => setDiscordOpen((open) => !open)}
          services={DISCORD_SERVICES}
          onSelect={setSelectedDiscordService}
          buttonLabel="Explore Discord services"
          rate={usdRate}
        />

        <div className="mt-12 space-y-10">
          {categorized.map(({ category, services: catServices }) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-5">
                {category.image && <img src={category.image} alt="" className="h-8 w-8 rounded-lg object-cover" />}
                <h3 className="font-display text-xl font-semibold">{category.name}</h3>
                <Badge variant="outline" className="text-[10px]">{catServices.length}</Badge>
              </div>
              {category.description && <p className="text-sm text-muted-foreground mb-4 -mt-3">{category.description}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catServices.map((s) => <ServiceCard key={s.id} service={s} rate={usdRate} />)}
              </div>
            </div>
          ))}

          {uncategorized.length > 0 && (
            <div>
              {categorized.length > 0 && <h3 className="font-display text-xl font-semibold mb-5">Other</h3>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {uncategorized.map((s) => <ServiceCard key={s.id} service={s} rate={usdRate} />)}
              </div>
            </div>
          )}


        </div>
      </div>
      {selectedHosting && (
        <HostingDetails service={selectedHosting} rate={usdRate} onClose={() => setSelectedHosting(null)} />
      )}
      {selectedAppService && (
        <AppDevelopmentDetails service={selectedAppService} rate={usdRate} onClose={() => setSelectedAppService(null)} />
      )}
      {selectedWebService && (
        <AppDevelopmentDetails service={selectedWebService} rate={usdRate} onClose={() => setSelectedWebService(null)} />
      )}
      {selectedSoftwareService && (
        <AppDevelopmentDetails service={selectedSoftwareService} rate={usdRate} onClose={() => setSelectedSoftwareService(null)} />
      )}
      {selectedAiService && (
        <AppDevelopmentDetails service={selectedAiService} rate={usdRate} onClose={() => setSelectedAiService(null)} />
      )}
      {selectedGameService && (
        <AppDevelopmentDetails service={selectedGameService} rate={usdRate} onClose={() => setSelectedGameService(null)} />
      )}
      {selectedMinecraftService && (
        <AppDevelopmentDetails service={selectedMinecraftService} rate={usdRate} onClose={() => setSelectedMinecraftService(null)} />
      )}
      {selectedVideoMotionService && (
        <AppDevelopmentDetails service={selectedVideoMotionService} rate={usdRate} onClose={() => setSelectedVideoMotionService(null)} />
      )}
      {selectedBusinessSolutionsService && (
        <AppDevelopmentDetails service={selectedBusinessSolutionsService} rate={usdRate} onClose={() => setSelectedBusinessSolutionsService(null)} />
      )}
      {selectedMarketingService && (
        <AppDevelopmentDetails service={selectedMarketingService} rate={usdRate} onClose={() => setSelectedMarketingService(null)} />
      )}
      {selectedCreatorService && (
        <AppDevelopmentDetails service={selectedCreatorService} rate={usdRate} onClose={() => setSelectedCreatorService(null)} />
      )}
      {selectedFubzSecurityService && (
        <AppDevelopmentDetails service={selectedFubzSecurityService} rate={usdRate} onClose={() => setSelectedFubzSecurityService(null)} />
      )}
      {selectedCommunityService && (
        <AppDevelopmentDetails service={selectedCommunityService} rate={usdRate} onClose={() => setSelectedCommunityService(null)} />
      )}
      {selectedMaintenanceService && (
        <AppDevelopmentDetails service={selectedMaintenanceService} rate={usdRate} onClose={() => setSelectedMaintenanceService(null)} />
      )}
      {selectedConsultingService && (
        <AppDevelopmentDetails service={selectedConsultingService} rate={usdRate} onClose={() => setSelectedConsultingService(null)} />
      )}
      {selectedDesignService && (
        <AppDevelopmentDetails service={selectedDesignService} rate={usdRate} onClose={() => setSelectedDesignService(null)} />
      )}
      {selectedDiscordService && (
        <AppDevelopmentDetails service={selectedDiscordService} rate={usdRate} onClose={() => setSelectedDiscordService(null)} />
      )}
    </section>
  );
}


function ServiceCollectionSection({
  label,
  heading,
  description,
  open,
  onToggle,
  services,
  onSelect,
  buttonLabel,
  rate,
}: {
  label: string;
  heading: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  services: AppService[];
  onSelect: (service: AppService) => void;
  buttonLabel: string;
  rate: number;
}) {
  return (
    <div className="mt-8 rounded-3xl border border-border/70 bg-background/60 p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">{label}</div>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold">{heading}</h3>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button variant="outline" className="rounded-full" onClick={onToggle}>
            {open ? "Hide services" : buttonLabel}
            <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("#contact")}>
            Talk to us <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
      {open && (
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button key={service.title} type="button" onClick={() => onSelect(service)} className="group rounded-2xl border border-border/70 bg-card/50 p-5 text-left transition-colors hover:border-[var(--fubrio-accent)] hover:bg-[var(--fubrio-accent-soft)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <h4 className="mt-5 font-display text-lg font-semibold">{service.title}</h4>
                <p className="mt-1 min-h-12 text-sm text-muted-foreground">{service.summary}</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <div><div className="font-medium">{enforceMinimumInr(service.from)}</div><UsdPrice price={service.from} rate={rate} /></div>
                  <span className="text-muted-foreground">View plans</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HostingDetails({ service, rate, onClose }: { service: HostingService; rate: number; onClose: () => void }) {
  const Icon = service.icon;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={`${service.title} plans`}>
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-semibold">{service.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{service.summary}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close plans" className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-2 sm:grid-cols-2">
            {service.features.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fubrio-accent)]" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {service.plans.map((plan) => (
              <div key={`${plan.name}-${plan.price}`} className="rounded-2xl border border-border/80 bg-card/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-display font-semibold">{plan.name}</h4>
                  <div className="text-right"><div className="text-sm font-semibold">{enforceMinimumInr(plan.price)}</div><UsdPrice price={plan.price} rate={rate} /></div>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {plan.specs.map((spec) => <li key={spec} className="text-sm text-muted-foreground">{spec}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium">Need a different setup?</div>
              <p className="mt-1 text-sm text-muted-foreground">Tell us what you need and we can discuss a custom option.</p>
            </div>
            <Button className="rounded-full shrink-0" onClick={() => { onClose(); navigate("#contact"); }}>
              Contact Fubrio <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


function AppDevelopmentDetails({ service, rate, onClose }: { service: AppService; rate: number; onClose: () => void }) {
  const Icon = service.icon;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={`${service.title} plans`}>
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card"><Icon className="h-5 w-5" /></div>
            <div><h3 className="font-display text-xl sm:text-2xl font-semibold">{service.title}</h3><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{service.summary}</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close plans" className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-2 sm:grid-cols-2">{service.features.map((feature) => <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--fubrio-accent)]" /><span>{feature}</span></div>)}</div>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {service.plans.map((plan) => <div key={`${plan.name}-${plan.price}`} className="rounded-2xl border border-border/80 bg-card/40 p-4"><div className="flex items-start justify-between gap-3"><h4 className="font-display font-semibold">{plan.name}</h4><div className="text-right"><div className="text-sm font-semibold">{enforceMinimumInr(plan.price)}</div><UsdPrice price={plan.price} rate={rate} /></div></div><ul className="mt-3 space-y-1.5">{plan.specs.map((spec) => <li key={spec} className="text-sm text-muted-foreground">{spec}</li>)}</ul></div>)}
          </div>
          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-medium">Have a different app idea?</div><p className="mt-1 text-sm text-muted-foreground">Share the features you need and we can discuss the scope.</p></div><Button className="rounded-full shrink-0" onClick={() => { onClose(); navigate("#contact"); }}>Contact Fubrio <ArrowUpRight className="ml-1.5 h-4 w-4" /></Button></div>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service, rate }: { service: SerializedService; rate: number }) {
  const s = service as any;
  const Icon = ICONS[s.icon ?? ""] ?? Code2;
  const img = s.image;
  return (
    <div className="group relative rounded-2xl glass-card overflow-hidden transition-all hover:-translate-y-0.5">
      {img && (
        <div className="aspect-[16/10] relative overflow-hidden">
          <img src={img} alt={s.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between">
          {!img && (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background border border-border group-hover:bg-[var(--fubrio-accent-soft)] transition-colors">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="text-right ml-auto">
            <div className="text-xs text-muted-foreground capitalize">{s.pricingType}</div>
            <div className="font-display font-semibold">{formatPrice(s)}</div><UsdPrice price={formatPrice(s)} rate={rate} />
          </div>
        </div>
        <h3 className="mt-5 text-lg font-display font-semibold">{s.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.shortDesc}</p>
        {s.features && s.features.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {s.features.slice(0, 4).map((f: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-[var(--fubrio-accent)] flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full w-full"
            onClick={() => navigate(s.contactEnabled ? "#contact" : s.purchaseUrl ? s.purchaseUrl : "#contact")}
          >
            {s.ctaText || (s.contactEnabled ? "Contact us" : s.purchaseUrl ? "Buy now" : "Get a quote")}
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
