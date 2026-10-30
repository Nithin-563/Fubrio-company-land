#!/usr/bin/env bash
# Fubrio database setup — run this ONCE locally before deploying.
# It creates all tables in Supabase and seeds demo content.
#
# Prerequisites:
#   1. Create a Supabase project at https://supabase.com
#   2. Copy your connection strings from Supabase → Project Settings → Database
#   3. Edit .env with your credentials (see .env.example)
#
set -e

echo "=========================================="
echo "  Fubrio — database setup"
echo "=========================================="
echo ""

if [ ! -f .env ]; then
  echo "  [!] No .env file found."
  echo "  [!] Run: cp .env.example .env"
  echo "  [!] Then edit .env with your Supabase credentials."
  exit 1
fi

# Check that DATABASE_URL is not still the placeholder
if grep -q "placeholder:placeholder" .env; then
  echo "  [!] Your .env still has placeholder values."
  echo "  [!] Edit .env and add your real Supabase connection strings."
  echo ""
  echo "  Steps:"
  echo "    1. Go to https://supabase.com → your project → Project Settings → Database"
  echo "    2. Copy 'Transaction pooler' URL → set as DATABASE_URL"
  echo "       (append ?pgbouncer=true&connection_limit=1)"
  echo "    3. Copy 'Session pooler' URL → set as DIRECT_URL"
  echo "    4. Run: openssl rand -base64 32  → set as NEXTAUTH_SECRET"
  echo "    5. Re-run this script: ./setup-db.sh"
  exit 1
fi

echo "  [ ] Installing dependencies..."
bun install
echo "  [✓] Dependencies installed"

echo ""
echo "  [ ] Pushing database schema to Supabase..."
bun run db:push
echo "  [✓] Schema pushed — all tables created"

echo ""
echo "  [ ] Seeding demo content..."
bun run scripts/seed.ts 2>&1 | tail -10
echo "  [✓] Demo content seeded"

echo ""
echo "=========================================="
echo "  Database is ready!"
echo "=========================================="
echo ""
echo "  Next steps:"
echo "    1. Test locally:   bun run dev"
echo "    2. Open:          http://localhost:3000"
echo "    3. Admin login:   configure an administrator account securely"
echo "    4. Deploy to Netlify/Vercel — set the SAME env vars"
echo ""
echo "  IMPORTANT: Do NOT run db:push or seed during deployment."
echo "  The database is already set up. Deployments only need: bun run build"
echo ""
