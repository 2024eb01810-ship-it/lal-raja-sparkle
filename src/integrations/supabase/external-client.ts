// External Supabase project client (NOT Lovable Cloud).
// Lovable Cloud's auto-managed client at ./client.ts is locked to a different
// project, so the app uses this client to talk to the user's external Supabase.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://clwjecqqmjbjcpivvgmd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_dK61TRir1LQXkgh77UbMUw_Ce3nSRe-";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
