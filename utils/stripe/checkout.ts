// utils/stripe/checkout.ts
"use client";

import { supabaseClient } from "@/lib/supabaseClient";

// On lit les variables d'env *publiques*
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Petit check runtime au cas où l'env manque vraiment
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Tu peux juste faire un console.error en prod si tu préfères
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
  );
}

// URL de la Edge Function stripe-actions
const STRIPE_ACTIONS_URL = `${SUPABASE_URL}/functions/v1/stripe-actions`;

export async function checkout(priceId: string) {
  // 1) Récupérer la session utilisateur courante
  const {
    data: { session },
    error: sessionError,
  } = await supabaseClient.auth.getSession();

  if (sessionError || !session) {
    console.error("No Supabase session", sessionError);
    throw new Error("Not authenticated");
  }

  // 2) Appel de la Edge Function Stripe
  const res = await fetch(STRIPE_ACTIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ✅ TS sait maintenant que c'est bien une string
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
    } as HeadersInit,
    body: JSON.stringify({
      action: "checkout",
      priceId,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("stripe-actions error", res.status, text);
    throw new Error(text || `Stripe actions failed: ${res.status}`);
  }

  const data = (await res.json()) as { url?: string };

  if (!data?.url) {
    console.error("Invalid response from stripe-actions", data);
    throw new Error("No checkout URL returned by stripe-actions");
  }

  // 3) Redirection vers Stripe Checkout
  window.location.assign(data.url);
}
