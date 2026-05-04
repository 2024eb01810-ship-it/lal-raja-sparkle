# Migration to external Supabase project `clwjecqqmjbjcpivvgmd`

This folder contains everything needed to recreate the current backend
in your external Supabase project.

## Files

| File | What it does |
|---|---|
| `001_schema.sql` | Creates all tables, enums, functions, triggers, RLS policies |
| `002_data.sql`   | Inserts all current row data (categories, collections, banners, offers, products, store_info, testimonials, profiles, user_roles) |
| `003_storage.sql`| Creates the public `media` storage bucket + policies |

## Step-by-step

1. Open https://supabase.com/dashboard/project/clwjecqqmjbjcpivvgmd/sql
2. Paste **`001_schema.sql`** → Run.
3. **Migrate auth users** (do this BEFORE step 4 if you want `profiles` / `user_roles` rows to link to real logins):
   - Old project → Authentication → Users → "..." → Export users (CSV)
   - New project → Authentication → Users → Import users (CSV)
   - Passwords: only the official "Migrate users" admin endpoint preserves password hashes. CSV import requires users to reset their password.
4. Paste **`002_data.sql`** → Run.
   - If you skipped step 3, the `profiles` and `user_roles` INSERTs at the bottom will fail with FK errors — that's fine, the rest will succeed. You can re-run those two statements after creating users.
5. Paste **`003_storage.sql`** → Run.
6. Re-upload images from the old `media` bucket into the new `media` bucket
   (download via the old dashboard → upload via the new dashboard), or use
   a service-role copy script.
7. After the new project is populated, the app needs to be repointed at it.
   Tell me and I'll generate the new client + repoint imports.

## What is NOT migrated automatically

- **`auth.users`** (logins) — must be exported/imported via the dashboard.
- **Storage objects** (uploaded image files) — must be re-uploaded.
- **Edge functions** — none are deployed in this project, so nothing to do.
