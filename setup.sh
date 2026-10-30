#!/usr/bin/env bash
# Fubrio setup — for LOCAL development only.
#
# If you're deploying to Netlify/Vercel, you DON'T need to run this script.
# Instead:
#   1. Run supabase/schema.sql in your Supabase SQL editor (creates tables)
#   2. Run `bun run seed` locally with a .env file containing your Supabase creds
#   3. On Netlify/Vercel, add the 4 env vars (see .env.example for the list)
#   4. Deploy — the build will succeed because env vars are set at runtime
#
# This script is for setting up your local dev environment.
set -e

echo "=========================================="
echo "  Fubrio — local setup"
echo "=========================================="
echo ""

if [ ! -f .env ]; then
  cp .env.example .env
  echo "  [!] Created .env from .env.example"
  echo ""
  echo "  ════════════════════════════════════════════════════════════"
  echo "  Edit .env with your Supabase credentials:"
  echo ""
  echo "    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
  echo "    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi..."
  echo "    NEXTAUTH_SECRET=$(openssl rand -base64 32)"
  echo "    NEXTAUTH_URL=http://localhost:3000"
  echo ""
  echo "  Get these from Supabase → Project Settings → API"
  echo "  ════════════════════════════════════════════════════════════"
  echo ""
  read -p "  Press Enter once you've edited .env... "
fi

echo ""
echo "  [ ] Installing dependencies..."
bun install
echo "  [✓] Dependencies installed"

echo ""
echo "  [ ] Seeding demo content into Supabase..."
bun run seed
echo "  [✓] Demo content seeded"

echo ""
echo "=========================================="
echo "  Fubrio is ready! Starting dev server..."
echo "=========================================="
echo ""
echo "  Admin login: configure an account through your secure setup process"
echo "  Czer access: set CZER_CODE in your environment before starting"
echo ""
echo "  Press Ctrl+C to stop."
echo ""

bun run dev
