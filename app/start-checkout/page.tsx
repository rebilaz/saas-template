// app/start-checkout/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { checkout } from "@/utils/stripe/checkout";

export default function StartCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const priceId = searchParams.get("priceId");

  useEffect(() => {
    async function run() {
      if (!priceId) {
        // Si pas de priceId → on revient au pricing
        router.push("/pricing");
        return;
      }

      try {
        // 🔥 Lance directement la fonction checkout (qui appelle l’Edge Function Stripe)
        await checkout(priceId);
      } catch (e) {
        console.error(e);
        // En cas d’erreur → on revient au pricing
        router.push("/pricing");
      }
    }

    run();
  }, [priceId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>Redirection vers Stripe Checkout...</p>
    </div>
  );
}
