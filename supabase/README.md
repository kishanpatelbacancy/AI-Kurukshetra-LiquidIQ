# Supabase Setup

Step `0A` for LiquidIQ is manual because the Supabase MCP is offline.

## What to run

1. Create a Supabase project named `liquidiq`.
2. Open the SQL Editor.
3. Run [`supabase/migrations/0001_liquidiq_init.sql`](/var/www/html/aiproject/supabase/migrations/0001_liquidiq_init.sql).
4. Run [`supabase/seed.sql`](/var/www/html/aiproject/supabase/seed.sql).
5. Copy the project URL, anon key, and service role key into `.env.local`.

## Notes

- The schema includes the `profiles` trigger on `auth.users`, shared `updated_at` triggers, indexes, and RLS policies.
- Seed data does not require an existing app user, but approval workflow and audit log sample rows will attach to the first profile once a user exists.
- If you rerun the seed, most core records upsert cleanly by business key.
