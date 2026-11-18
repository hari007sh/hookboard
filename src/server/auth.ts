import { createClient } from "@supabase/supabase-js";

/** Returns a token verifier backed by Supabase Auth, or undefined when Supabase isn't configured. */
export function supabaseVerifier(): ((token: string) => Promise<string | null>) | undefined {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return undefined;
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return async (token) => {
    const { data, error } = await supabase.auth.getUser(token);
    return error || !data.user ? null : data.user.id;
  };
}
