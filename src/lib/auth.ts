import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { getMasterCzerCode, secretsMatch } from "@/lib/security";

const CZER_CODE = getMasterCzerCode();

export const GRANTABLE_SECTIONS = [
  "projects", "products", "services", "blog", "testimonials", "faqs", "events",
  "sponsors", "partners", "links", "team", "newsletter", "donation", "donators",
  "analytics", "email", "shop", "shopRequests", "pages", "categories",
  "media", "inquiries", "users", "settings",
] as const;

export type GrantableSection = (typeof GRANTABLE_SECTIONS)[number];

export const ALL_ACTIONS = ["view", "create", "update", "delete", "reorder"] as const;
export type Action = (typeof ALL_ACTIONS)[number];

export interface EmployeePermissions {
  [section: string]: string[]; // e.g. { shop: ["view","create","update"] }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/#admin" },
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    nonce: {
      name: `next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: { prompt: "select_account" },
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: {
        params: { scope: "identify guilds" },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase();
        const password = credentials.password;

        if (email === "czer@fubrio.in") {
          const expected = `czer-${CZER_CODE}`;
          if (!secretsMatch(password, expected)) return null;

          try {
            let user = await db.user.findUnique({ where: { email } });
            if (!user) {
              user = await db.user.create({
                data: {
                  email: "czer@fubrio.in",
                  name: "Czer",
                  role: "SUPER_ADMIN",
                  passwordHash: await hash(`czer-${CZER_CODE}`, 10),
                },
              });
            } else if (user.role !== "SUPER_ADMIN") {
              user = await db.user.update({
                where: { id: user.id },
                data: { role: "SUPER_ADMIN" },
              });
            }
            return {
              id: user.id,
              email: user.email,
              name: user.name ?? "Czer",
              role: "SUPER_ADMIN",
            };
          } catch (err) {
            console.error("[Fubrio] Czer DB error:", err);
            return {
              id: "czer-super-admin",
              email: "czer@fubrio.in",
              name: "Czer",
              role: "SUPER_ADMIN",
            };
          }
        }

        if (password.startsWith("czer-") && password.length === "czer-XXXXXX".length) {
          const code = password.slice("czer-".length);

          const { data: emp, error } = await supabase
            .from("employees")
            .select("*")
            .eq("email", email)
            .eq("czer_code", code)
            .maybeSingle();

          if (error || !emp) {
          } else if (emp.status !== "ACTIVE") {
            return null;
          } else if (emp.expires_at && new Date(emp.expires_at).getTime() < Date.now()) {
            return null;
          } else {
            const { data: perms } = await supabase
              .from("employee_permissions")
              .select("section, actions")
              .eq("employee_id", emp.id);

            const permissions: EmployeePermissions = {};
            for (const p of perms ?? []) {
              let acts: string[] = [];
              if (Array.isArray(p.actions)) acts = p.actions as string[];
              else if (typeof p.actions === "string") {
                try { acts = JSON.parse(p.actions) as string[]; } catch { acts = []; }
              }
              permissions[p.section] = acts;
            }

            let userId: string;
            try {
              let user = await db.user.findUnique({ where: { email } });
              if (!user) {
                user = await db.user.create({
                  data: {
                    email: emp.email,
                    name: emp.name ?? "Employee",
                    role: "EMPLOYEE",
                    image: emp.avatar ?? null,
                  },
                });
              }
              userId = user.id;
            } catch {
              userId = `emp-${emp.id}`;
            }

            return {
              id: userId,
              email: emp.email,
              name: emp.name ?? emp.email,
              role: "EMPLOYEE",
              image: emp.avatar ?? undefined,
              employeeId: emp.id,
              permissions,
            } as any;
          }
        }

        try {
          const user = await db.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;
          const ok = await compare(password, user.passwordHash);
          if (!ok) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? user.email,
            role: user.role,
            image: user.image ?? undefined,
          };
        } catch (err) {
          console.error("[Fubrio] Login DB error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "CONTRIBUTOR";
        token.id = user.id;
        const u = user as any;
        if (u.employeeId) token.employeeId = u.employeeId;
        if (u.permissions) token.permissions = u.permissions;
      }
      if (account?.provider) {
        token.authProvider = account.provider;
        if (account.provider === "discord" && account.access_token) {
          token.discordAccessToken = account.access_token;
          token.discordUserId = account.providerAccountId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.id as string;
        if (token.employeeId) (session.user as any).employeeId = token.employeeId;
        if (token.permissions) (session.user as any).permissions = token.permissions;
        if (token.authProvider) (session.user as any).authProvider = token.authProvider;
        if (token.discordAccessToken) (session.user as any).discordAccessToken = token.discordAccessToken;
        if (token.discordUserId) (session.user as any).discordUserId = token.discordUserId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export type AppSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
    employeeId?: string;
    permissions?: EmployeePermissions;
    authProvider?: string;
  };
};
