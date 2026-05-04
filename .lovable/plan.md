## Goal

Move the entire app off Lovable Cloud (`fthaqhgejkuuodvbqxsc`) and onto your external Supabase project (`clwjecqqmjbjcpivvgmd`), including:
- Recreate every table, enum, function, trigger, RLS policy, and storage bucket in the new project
- Copy all existing row data
- Repoint the app's Supabase client at the new project

## Important constraints (please read)

1. **Lovable Cloud cannot be "re-linked" to an external Supabase project.** The auto-managed files (`.env`, `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`) will keep regenerating against the Cloud project. To use your external project we have to **bypass** them with a separate, hand-written client.
2. **I do not have credentials to your external project.** I cannot run SQL or insert rows there. You will run the scripts I generate in your Supabase SQL Editor.
3. **Trade-off of switching:** You lose Lovable's managed integration — the in-product Cloud DB UI, migrations tool, edge function deploy, auto-typed `Database`, and managed auth wiring will no longer reflect the project the app actually talks to. Future schema changes must be made by you in the external project's dashboard.
4. **Auth users do not migrate via SQL Editor.** `auth.users` rows can only be moved by you via the Supabase dashboard's "Migrate users" flow or admin API. Existing logins will need to be recreated unless you do that step.

If any of the above is a dealbreaker, tell me and we'll stop here.

## Steps

### 1. Generate a single schema bootstrap SQL file
Create `migration/001_schema.sql` containing, in order:
- `create extension if not exists pgcrypto;`
- `create type public.app_role as enum ('admin','editor');`
- All tables: `admin_access_requests`, `appointments`, `banners`, `categories`, `collections`, `enquiries`, `offers`, `products`, `profiles`, `store_info`, `testimonials`, `user_roles` (exact columns + defaults from current schema)
- Functions: `is_staff`, `has_role`, `set_updated_at`, `handle_new_user`
- Trigger `on_auth_user_created` on `auth.users` calling `handle_new_user`
- `enable row level security` + every existing RLS policy verbatim
- `GRANT EXECUTE` on `has_role` and `is_staff` to `authenticated, anon`

You run this once in the new project's **SQL Editor**.

### 2. Export current data → generate `migration/002_data.sql`
I'll query the current Cloud DB table-by-table and emit `INSERT ... ON CONFLICT DO NOTHING` statements for every row in:
`categories, collections, banners, offers, products, store_info, testimonials, appointments, enquiries, admin_access_requests, profiles, user_roles`

You run this in the new project's SQL Editor after step 1.

Note: `profiles` and `user_roles` reference user IDs from `auth.users`. If you don't migrate auth users (step 5), these inserts will succeed but won't match real logins until users sign up again with the same email and you re-grant roles.

### 3. Recreate the `media` storage bucket
SQL snippet to create the public `media` bucket in the new project, plus a script to re-upload files. Storage objects can't be moved via SQL — I'll provide a small Node script you run locally with both projects' service-role keys to copy files from old → new bucket. (Optional if you don't have uploaded media yet.)

### 4. Repoint the app at the new project
Since I can't edit `.env` / `client.ts` / `types.ts`, I will:
- Create `src/integrations/supabase/external-client.ts` with a hard-coded URL/anon key for `clwjecqqmjbjcpivvgmd` (anon keys are safe in client code)
- Create `src/integrations/supabase/external-types.ts` — a minimal hand-written `Database` type covering only the tables the app uses (so TypeScript stays happy)
- Update **every** file that currently does `import { supabase } from "@/integrations/supabase/client"` to import from `external-client` instead. Files affected (from grep): `useAuth.tsx`, `useAdmin.ts`, `useContent.ts`, all admin pages, `Product.tsx`, `Auth.tsx`, `Contact.tsx`, `RequestAccessDialog.tsx`, etc.

After this, the app talks exclusively to `clwjecqqmjbjcpivvgmd`. The Lovable Cloud project becomes dormant (still billed if it stays enabled — disable from Connectors if you want).

### 5. (You) Migrate auth users — manual
In the **old** project's dashboard: Authentication → Users → export.
In the **new** project's dashboard: Authentication → Users → "Migrate users" (or use the admin API). I'll include the exact steps in a `migration/README.md`.

After migration, re-run a small SQL snippet to insert your admin row in `user_roles` for the new auth user IDs.

### 6. Verify
- Open `/admin/login`, sign in, confirm dashboard loads
- Open `/` and a product page, confirm data renders
- Submit a test enquiry, confirm it lands in the new DB

## Deliverables you'll get
- `migration/001_schema.sql`
- `migration/002_data.sql`
- `migration/003_storage_bucket.sql` (+ optional `copy-storage.mjs`)
- `migration/README.md` with click-by-click instructions
- New `src/integrations/supabase/external-client.ts` + `external-types.ts`
- All app imports repointed

## What you need to do during execution
1. Open the new project's SQL Editor and run `001_schema.sql`, then `002_data.sql`
2. Create `media` storage bucket (or run `003_storage_bucket.sql`)
3. (Optional) Run the storage copy script with both service-role keys
4. (Optional) Migrate auth users via dashboard
5. Test the app

Approve this plan and I'll generate all the files in one pass.