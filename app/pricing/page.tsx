"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { checkout } from "@/utils/stripe/checkout";
import { STRIPE_PLANS } from "@/utils/stripe/configuration";
import { useSupabaseUser } from "@/lib/hooks/use-supabase-user";
import { PricingCard } from "@/components/PricingCard";
import { AuthSection } from "@/components/AuthSection";
import { AnimatePresence, motion } from "framer-motion";
import { supabaseClient } from "@/lib/supabaseClient";

export default function PricingPage() {
  const { user } = useSupabaseUser();
  const router = useRouter();

  const [isWaiting, setWaiting] = useState(false);

  // popup auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState<string | null>(null);

  // On ne gère plus que le plan mensuel
  const currentPlan = STRIPE_PLANS.StarterMonthly;
  const oldPrice = STRIPE_PLANS.StarterMonthly.realPriceInUSD;

  /* ----- HANDLERS ----- */

  const handleStartTrial = async () => {
    const priceId = STRIPE_PLANS.StarterMonthly.priceId;

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
      router.push("/"); // ou "/pricing" selon ce que tu préfères
    }
  };

  /* ----- RENDER ----- */

  return (
    <>
      <div className="z-10 w-full px-4 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-10 text-center text-slate-100">
          {/* Top bar avec bouton de déconnexion si connecté */}
          <div className="flex items-center justify-end mb-4">
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:border-slate-500 transition"
              >
                Se déconnecter
              </button>
            )}
          </div>

          {/* HERO */}
          <div className="space-y-4">
            <h1 className="text-[38px] sm:text-[48px] lg:text-[80px] font-[990] leading-[1.25] tracking-tight">
              <span className="block bg-gradient-to-b from-slate-50 via-slate-200 to-slate-600 bg-clip-text text-transparent">
                Lance ton essai gratuit
              </span>
              <span className="mt-1 block bg-gradient-to-b from-slate-50 via-slate-200 to-slate-600 bg-clip-text text-transparent">
                dès aujourd’hui
              </span>
            </h1>
          </div>

          {/* ---------- PRICING CARD ---------- */}
          <PricingCard
            isPricingYearly={false} // plus de mode annuel, toujours false
            currentPlan={currentPlan}
            oldPrice={oldPrice}
            isWaiting={isWaiting}
            onClickCTA={handleStartTrial}
            onClickLogin={handleLoginRedirect}
            onToggleBillingMode={() => {}} // noop, plus de toggle affiché
          />
        </div>
      </div>

      {/* ---------- POPUP D'AUTH ---------- */}
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
              {/* Bouton fermer */}
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-slate-50 hover:border-slate-400 transition"
              >
                ✕
              </button>

              {/* AuthSection en mode MODAL */}
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
