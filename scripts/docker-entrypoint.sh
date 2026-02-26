#!/bin/bash
set -e

echo "🚀 Starting FlowWink..."

# Check if Supabase CLI is available and migrations exist
if [ -d "supabase/migrations" ] && command -v supabase &> /dev/null; then
  echo "📦 Running database migrations..."
  
  # Run migrations against the configured Supabase instance
  # This is idempotent - safe to run multiple times
  npx supabase db push --db-url "$VITE_SUPABASE_URL" || {
    echo "⚠️  Warning: Could not run migrations. Database may be out of sync."
    echo "   This is normal if you're using a managed Supabase instance."
  }
else
  echo "ℹ️  Skipping migrations (Supabase CLI not available or no migrations found)"
fi

# Start the application
echo "✅ Starting Vite server..."
exec npm run dev
