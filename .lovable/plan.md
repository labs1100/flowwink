

# Fix: FlowPilot Autonomy Not Starting on New Installations

## Root Cause

The heartbeat cron job is **never automatically registered**. It's documented as a manual SQL step in `SETUP.md`, but `setup-flowpilot` (the bootstrap function called during template installation) doesn't create it. So objectives get seeded, but nothing ever triggers the heartbeat loop to decompose and advance them.

You confirmed the logic works — when the heartbeat fires (e.g., manually in dev), it correctly decomposes objectives into executable steps. The problem is purely that the cron trigger is missing on fresh installations.

## The Fix

### 1. Auto-register heartbeat cron in `setup-flowpilot`

At the end of the bootstrap function, after seeding objectives, register the `pg_cron` + `pg_net` scheduled job that calls the heartbeat edge function every 12 hours. This uses the same SQL pattern already documented in `SETUP.md`, but executed automatically.

The function will:
- Check if the cron job already exists (idempotent)
- Register `flowpilot-heartbeat` cron (`0 0,12 * * *`)
- Optionally register `flowpilot-learn` cron (`0 3 * * *`) if not already present

**File**: `supabase/functions/setup-flowpilot/index.ts`

### 2. Database migration: ensure `pg_cron` and `pg_net` extensions are enabled

Create a migration that enables both extensions (idempotent `CREATE EXTENSION IF NOT EXISTS`).

**New migration SQL**

### 3. Add a "first heartbeat" trigger after template install

In `useTemplateInstaller.ts`, after `setup-flowpilot` completes successfully and objectives were seeded, fire a single immediate heartbeat invocation (`supabase.functions.invoke('flowpilot-heartbeat')`). This ensures the freshly seeded objectives get decomposed right away — the user doesn't have to wait up to 12 hours for the first cron tick.

**File**: `src/hooks/useTemplateInstaller.ts`

## Technical Detail

**Cron registration SQL** (executed inside `setup-flowpilot` via `supabase.rpc` or direct insert into `cron.job`):
```sql
SELECT cron.schedule(
  'flowpilot-heartbeat',
  '0 0,12 * * *',
  $$
  SELECT net.http_post(
    url := '<SUPABASE_URL>/functions/v1/flowpilot-heartbeat',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
    body := concat('{"time":"', now(), '"}')::jsonb
  ) AS request_id;
  $$
);
```

The `SUPABASE_URL` and anon key are already available inside the edge function via environment variables.

**Idempotency**: Before scheduling, check `SELECT * FROM cron.job WHERE jobname = 'flowpilot-heartbeat'` — skip if already exists.

## Summary

| Change | File | What |
|--------|------|------|
| Auto-register cron | `setup-flowpilot/index.ts` | Add heartbeat + learn cron jobs after bootstrap |
| Enable extensions | New migration | `pg_cron` + `pg_net` |
| Immediate first run | `useTemplateInstaller.ts` | Fire heartbeat right after template install |

**Result**: Objectives seeded from templates will be automatically decomposed and advanced within minutes of installation — no manual setup needed.

