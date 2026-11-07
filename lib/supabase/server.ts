import { cookies } from "next/headers";
import { connection } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export async function createClient() {
  await connection();
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // dipanggil dari Server Component; proxy.ts yang refresh session
        }
      },
    },
  });
}
