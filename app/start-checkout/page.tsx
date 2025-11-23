// app/start-checkout/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { checkout } from "@/utils/stripe/checkout";

function StartCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const priceId = searchParams.get("priceId");

  useEffect(() => {
    async function run() {
      if (!priceId) {
        router.push("/pricing");
        return;
      }

      try {
        await checkout(priceId);
      } catch (e) {
        console.error(e);
        router.push("/pricing");
      }
    }

    run();
  }, [priceId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>Redirecting to Stripe Checkout...</p>
    </div>
  );
}

export default function StartCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <StartCheckoutContent />
    </Suspense>
  );
}
