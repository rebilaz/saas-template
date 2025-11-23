"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { BillingPanel } from "@/components/BillingPanel";
import { supabaseClient } from "@/lib/supabaseClient";

type ProfileRow = {
  email?: string | null;
  role?: string | null;
  subscription_status?: string | null;
  trial_end?: string | null;
};

interface UserMenuProps {
  name?: string;
  email?: string;
  plan?: string;
}

function formatPlanLabel(profile?: ProfileRow | null): "ADMIN" | "PREMIUM" {
  if (profile?.role === "admin") return "ADMIN";
  return "PREMIUM";
}

export function UserMenu({
  name = "Your Name",
  email = "you@example.com",
  plan = "PREMIUM",
}: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingInitialTab, setBillingInitialTab] =
    useState<"billing" | "account">("billing");

  const [fetchedName, setFetchedName] = useState<string | null>(null);
  const [fetchedEmail, setFetchedEmail] = useState<string | null>(null);
  const [fetchedPlan, setFetchedPlan] = useState<"ADMIN" | "PREMIUM" | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data, error } = await supabaseClient.auth.getUser();

      if (error || !data?.user || !isMounted) return;

      const user = data.user;

      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("email, role, subscription_status, trial_end")
        .eq("id", user.id)
        .maybeSingle<ProfileRow>();

      if (!isMounted) return;

      const emailFromProfile = profile?.email ?? user.email ?? email;

      const metaName =
        typeof user.user_metadata?.full_name === "string"
          ? (user.user_metadata.full_name as string)
          : undefined;

      const derivedName =
        metaName ||
        (emailFromProfile ? emailFromProfile.split("@")[0] : undefined) ||
        name;

      setFetchedName(derivedName);
      setFetchedEmail(emailFromProfile || email);

      const planLabel = formatPlanLabel(profile);
      setFetchedPlan(planLabel);
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [email, name]);

  const displayName = fetchedName ?? name;
  const displayEmail = fetchedEmail ?? email;
  const displayPlan = fetchedPlan ?? (plan === "ADMIN" ? "ADMIN" : "PREMIUM");
  const isAdmin = displayPlan === "ADMIN";

  const avatarLetter = (displayName || "U").charAt(0).toUpperCase();

  const badgeLabel = displayPlan;
  const badgeClasses = isAdmin
    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
    : "border-amber-500/30 bg-amber-500/10 text-amber-300";

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push("/pricing");
  };

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleOpenBilling = (tab: "billing" | "account") => {
    setOpen(false);
    setBillingInitialTab(tab);
    setBillingOpen(true);
  };

  const handleCloseBilling = () => {
    setBillingOpen(false);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="border-t border-slate-900 pt-5 mt-6 mb-3 relative"
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="group w-full flex items-center gap-3 rounded-xl px-4 py-3 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-700 transition-all text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-slate-50 shadow-sm">
            {avatarLetter}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-medium text-slate-100 truncate">
              {displayName}
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              {displayEmail}
            </span>
          </div>

          {badgeLabel && (
            <span
              className={`hidden md:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${badgeClasses}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              {badgeLabel}
            </span>
          )}

          <svg
            className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              key="user-menu-panel"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="
                absolute bottom-[4.6rem]
                left-4 right-4
                rounded-2xl border border-slate-800
                bg-slate-900/90
                shadow-[0_18px_45px_rgba(0,0,0,0.7)]
                backdrop-blur-xl
                overflow-hidden
                z-50
              "
            >
              <div className="px-4 pt-3 pb-3 bg-slate-900/70">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-medium text-slate-100 truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {displayEmail}
                    </p>
                  </div>

                  {badgeLabel && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${badgeClasses}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      {badgeLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-800" />

              <button
                className="flex w-full items-center justify-between px-4 py-2.5 text-[11px] text-slate-200 transition-colors hover:bg-slate-800/60"
                onClick={() => handleOpenBilling("billing")}
              >
                <span>Subscription & billing</span>
                <span className="text-[10px] text-slate-400">Manage</span>
              </button>

              <button
                className="flex w-full items-center justify-between px-4 py-2.5 text-[11px] text-slate-200 transition-colors hover:bg-slate-800/60"
                onClick={() => handleOpenBilling("account")}
              >
                <span>Account settings</span>
              </button>

              <div className="h-px bg-slate-800" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-between px-4 py-2.5 text-[11px] text-rose-300 transition-colors hover:bg-rose-500/10"
              >
                <span>Sign out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BillingPanel
        open={billingOpen}
        onClose={handleCloseBilling}
        name={displayName}
        email={displayEmail}
        planLabel={displayPlan}
        isAdmin={isAdmin}
        initialTab={billingInitialTab}
      />
    </>
  );
}
