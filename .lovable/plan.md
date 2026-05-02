# Make nagadurga20054@gmail.com a full admin

## Current state
A lookup in the backend shows **no account exists** yet for `nagadurga20054@gmail.com` — neither in the auth users table nor in profiles. So we need to (1) create the account, then (2) grant it the `admin` role, which gives full control over every admin section (Products, Categories, Collections, Banners, Offers, Testimonials, Store Info, Appointments, Enquiries, and the admin-only Users & Roles page).

The existing role system already supports this: `has_role(uid, 'admin')` and `is_staff(uid)` gate every staff-only RLS policy, and the admin layout shows the "Users & Roles" nav item only to admins.

## Plan

1. **Create the auth user** via a one-off migration that calls Supabase's internal account creation, with:
   - email: `nagadurga20054@gmail.com`
   - password: `8074992074`
   - email auto-confirmed (so they can sign in immediately, no OTP needed for this seeded admin)
   The existing `handle_new_user` trigger will auto-create the matching `profiles` row.
   
   If the trigger isn't currently attached to `auth.users` (the schema dump shows no triggers), the migration will also insert the profile row directly as a fallback.

2. **Grant the `admin` role** by inserting into `public.user_roles`:
   ```
   (user_id = <new uid>, role = 'admin')
   ```
   This unlocks: full read/write on all content tables, the Users & Roles page, and the ability to grant/revoke roles for other staff.

3. **Verify** by re-querying `profiles` joined with `user_roles` to confirm the admin row exists.

## How the user signs in afterward
- Go to `/admin/login`
- Email: `nagadurga20054@gmail.com`
- Password: `8074992074`
- They will land directly in the admin dashboard with full access.

## Security note
Seeding a password through a migration is fine for bootstrapping an admin, but the password `8074992074` is weak (looks like a phone number) and is now visible in chat history. Recommended follow-up: have this admin sign in once, then change their password from a "Change password" flow (can be added on request).

## Technical details
- Migration uses `INSERT INTO auth.users` with `crypt(password, gen_salt('bf'))` for the encrypted password and sets `email_confirmed_at = now()`, `aud = 'authenticated'`, `role = 'authenticated'`.
- Followed by `INSERT INTO public.profiles (id, email) ...ON CONFLICT DO NOTHING`.
- Followed by `INSERT INTO public.user_roles (user_id, role) VALUES (<uid>, 'admin') ON CONFLICT DO NOTHING`.
- No application code changes needed — the existing `useAuth` hook, `RequireStaff` guard, and `AdminUsers` page already handle admin permissions correctly.
