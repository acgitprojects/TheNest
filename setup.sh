#!/usr/bin/env bash
# =============================================================
# The Nest — First-time setup script
# Run this ONCE after cloning: bash setup.sh
# =============================================================

set -e

echo ""
echo "🪺  The Nest — Setup"
echo "=============================="

# 1. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# 2. Generate Prisma client
echo ""
echo "⚙️  Generating Prisma client..."
npx prisma generate

# 3. Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo ""
  echo "🔑 Creating .env.local..."

  # Generate session secret
  SESSION_SECRET=$(openssl rand -base64 32)

  # Generate bcrypt hash of the PIN (sf576)
  PIN_HASH=$(node -e "const b=require('bcryptjs');console.log(b.hashSync('sf576',12))")

  cat > .env.local << EOF
# PostgreSQL — update with your Tencent Cloud connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/thenest"

# Session secret (auto-generated)
SESSION_SECRET="${SESSION_SECRET}"

# Admin PIN hash (auto-generated for PIN: sf576)
ADMIN_PIN_HASH="${PIN_HASH}"
EOF

  echo "✅ .env.local created"
  echo ""
  echo "⚠️  IMPORTANT: Update DATABASE_URL in .env.local with your Tencent Cloud PostgreSQL connection."
  echo "   Format: postgresql://USER:PASSWORD@HOST:PORT/thenest"
else
  echo ""
  echo "ℹ️  .env.local already exists — skipping creation"
fi

echo ""
echo "=============================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update DATABASE_URL in .env.local with Tencent Cloud credentials"
echo "  2. Run: npm run db:migrate   (creates tables)"
echo "  3. Run: npm run db:seed      (seeds hosts + PIN)"
echo "  4. Run: npm run dev          (start development server)"
echo ""
