## Goal

Working sign-in / register on Lal Raja with **Phone OTP** and **Google**, redirect to home on success, header reflects logged-in state.

## Important callout

Phone OTP needs an SMS provider. Lovable Cloud's phone auth requires you to plug in **Twilio** (or another SMS provider) so the codes can actually be delivered. After I build the UI, you'll need to enable Phone provider + add Twilio credentials in Cloud → Users → Auth Settings. Google sign-in works immediately, no setup needed.

## What gets built

### 1. Database (one small migration)

The `profiles` table already exists and `handle_new_user()` is defined, but the trigger that calls it on new signups is missing. Add:

- Trigger `on_auth_user_created` on `auth.users` AFTER INSERT → `public.handle_new_user()`
- INSERT policy on `profiles` so the trigger (running as the user) can write the initial row
- Add a `phone` column to `profiles` so phone-OTP users have it stored

### 2. New page: `/auth`

Two-step phone flow + Google button:

```text
┌────────────────────────────┐
│   Welcome to Lal Raja      │
│                            │
│   [ Continue with Google ] │
│   ──────── or ────────     │
│   [ +91 | 98XXXXXXXX   ]   │
│   [    Send OTP        ]   │
└────────────────────────────┘
        ↓ (after Send)
┌────────────────────────────┐
│   Enter the 6-digit code   │
│   sent to +91 98XXXXXXXX   │
│                            │
│   [ • • • • • • ]          │
│   [   Verify    ]          │
│   Resend in 30s            │
└────────────────────────────┘
```

Behavior:
- Phone is normalized to E.164 (default country +91, editable)
- `signInWithOtp({ phone })` sends code; same call handles signup + login
- `verifyOtp({ phone, token, type: 'sms' })` completes auth
- Google button uses Lovable's managed OAuth (`lovable.auth.signInWithOAuth("google")`)
- On success → redirect to `/`
- All inputs validated with zod (phone regex, 6-digit OTP)
- Toast on every error so the user always sees what went wrong

### 3. Auth state + header wiring

- New hook `useAuth()` wrapping Supabase: `onAuthStateChange` listener set up before `getSession()`, exposes `{ user, session, loading, signOut }`
- Header changes:
  - Mobile drawer: when logged in, replace "Sign In / Register" pill with the user's name/phone + a "Sign out" link
  - Desktop user icon: link to `/auth` when logged out, dropdown with name + sign out when logged in
- All existing "Sign In / Register" links point to `/auth`

### 4. Route registration

Add `<Route path="/auth" element={<Auth />} />` to the router (public route).

## Files

- `supabase/migrations/<ts>_auth_trigger.sql` — trigger + profile INSERT policy + phone column
- `src/pages/Auth.tsx` — the new page (two-step phone + Google)
- `src/hooks/useAuth.ts` — session hook
- `src/components/layout/Header.tsx` — swap Sign In pill / user info when authed
- `src/App.tsx` — register `/auth` route

## After I'm done — what you do

1. Open **Cloud → Users → Auth Settings → Sign In Methods**
2. Toggle **Phone** on, paste your Twilio Account SID, Auth Token, and From number
3. Toggle **Google** on (already managed — just confirm it's enabled)
4. Test from `/auth`

Google works the moment you flip the toggle. Phone won't deliver SMS until Twilio is connected — that step is unavoidable for OTP.
