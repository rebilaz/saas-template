"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { AuthSection } from "@/components/AuthSection";
import { PricingCard } from "@/components/PricingCard";
import { useSupabaseUser } from "@/lib/hooks/use-supabase-user";
import { supabaseClient } from "@/lib/supabaseClient";
import { checkout } from "@/utils/stripe/checkout";
import { STRIPE_PLANS } from "@/utils/stripe/configuration";

export default function PricingPage() {
  const { user } = useSupabaseUser();
  const router = useRouter();

  const [isWaiting, setWaiting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState<string | null>(null);

  const currentPlan = STRIPE_PLANS.ProMonthly;
  const compareAtPrice = currentPlan.compareAtPrice;

  const handleStartTrial = async () => {
    const priceId = currentPlan.priceId;

    if (!user) {
      const redirect = `/start-checkout?priceId=${priceId}`;
      setAuthRedirectTo(redirect);
      setShowAuthModal(true);
      return;
    }

    try {
      setWaiting(true);
      await checkout(priceId);
    } finally {
      setWaiting(false);
    }
  };

  const handleLoginRedirect = () => {
    if (!user) {
      setAuthRedirectTo("/saas");
      setShowAuthModal(true);
      return;
    }

    router.push("/saas");
  };

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.error(e);
    } finally {
      router.push("/");
    }
  };

  return (
    <>
      <div className="z-10 w-full px-4 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-10 text-center text-slate-100">
          <div className="flex items-center justify-end mb-4">
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Sign out
              </button>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-[38px] sm:text-[48px] lg:text-[72px] font-[900] leading-[1.15] tracking-tight">
              <span className="block bg-gradient-to-b from-slate-50 via-slate-200 to-slate-600 bg-clip-text text-transparent">
                Ship Your Product Faster
              </span>
              <span className="mt-1 block bg-gradient-to-b from-slate-50 via-slate-200 to-slate-600 bg-clip-text text-transparent">
                with a plug-and-play SaaS template
              </span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Authentication, billing, and a clean dashboard are ready out of the box.
              Swap in your brand and go live.
            </p>
          </div>

          <PricingCard
            isPricingYearly={false}
            currentPlan={currentPlan}
            oldPrice={compareAtPrice}
            isWaiting={isWaiting}
            onClickCTA={handleStartTrial}
            onClickLogin={handleLoginRedirect}
            onToggleBillingMode={() => {}}
          />
        </div>
      </div>

      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md"
            >
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 transition hover:border-slate-400 hover:text-slate-50"
              >
                ×
              </button>

              <AuthSection
                redirectToOverride={authRedirectTo ?? "/saas"}
                variant="modal"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
