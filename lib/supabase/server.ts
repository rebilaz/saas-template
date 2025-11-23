// lib/supabase/server.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServer() {
  // Next 15/16 : cookies() est vu comme async → on l'await
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 🔥 VERSION RECOMMANDÉE PAR SUPABASE (getAll / setAll)
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // on laisse Next gérer l'écriture des cookies
              // (côté Route Handler / Layout / Server Action)
              cookieStore.set(name, value, options);
            });
          } catch {
            // Si on est dans un Server Component pur, setAll peut throw → on ignore
          }
        },
      },
    }
  );
}
