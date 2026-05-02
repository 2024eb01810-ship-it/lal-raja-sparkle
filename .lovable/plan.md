# Add Firebase Analytics alongside Lovable Cloud

You chose **"Add Firebase ALONGSIDE Cloud"**, so this plan keeps your existing Google login (which already stores users in Lovable Cloud / Supabase `profiles`) **untouched** and only wires Firebase in for **Analytics tracking**.

Important: Firebase Analytics does **not** create user accounts. Your Firebase config has no auth domain enabled for Google login in your code, and your `/auth` page already does Google sign-in via Lovable Cloud. Mixing a second Google sign-in into Firebase would create duplicate accounts that can't talk to your Supabase `profiles`, RLS, or admin panel — that's why we're only adding Analytics here.

## What gets built

1. **Install Firebase SDK**
   - `bun add firebase`

2. **New file: `src/integrations/firebase/client.ts`**
   - Initializes the Firebase app with your provided config.
   - Initializes `getAnalytics(app)` only in the browser (guarded for SSR/build safety with `isSupported()` from `firebase/analytics`).
   - Exports `app` and `analytics` for optional later use.

3. **Wire it into the app**
   - Import the client once at app entry (`src/main.tsx`) so Analytics initializes on page load.
   - No UI changes. No changes to `useAuth`, `/auth` page, or Supabase.

4. **Track Google sign-in success as an Analytics event (optional but useful)**
   - In `src/pages/Auth.tsx`, after a successful Google sign-in (and after successful OTP verify), fire `logEvent(analytics, 'login', { method: 'google' | 'phone' })`.
   - This gives you the "Google login happened" signal in Firebase Analytics, while the actual user record stays in Lovable Cloud `profiles` (linked by Supabase `user.id`).

## What is NOT changed

- `/auth` page flow (Google + Phone OTP) — unchanged.
- `useAuth` hook, `profiles` table, `user_roles`, RLS policies, admin panel — unchanged.
- No Firebase Auth, no Firestore, no second Google sign-in button.
- Your Firebase API key is a public web key — safe to commit in the client file (same model as `VITE_SUPABASE_PUBLISHABLE_KEY`).

## Files touched

- `package.json` (adds `firebase`)
- `src/integrations/firebase/client.ts` (new)
- `src/main.tsx` (one import line)
- `src/pages/Auth.tsx` (two `logEvent` calls)

## Heads up

If what you actually want is **"users sign in with Google and a user record appears in the Firebase console"**, that requires Firebase **Auth** (not Analytics) and would conflict with your existing Lovable Cloud auth. Tell me and I'll revise the plan to option 4 from my question (Firebase Google login + sync into Supabase). Otherwise approve and I'll implement the Analytics plan above.