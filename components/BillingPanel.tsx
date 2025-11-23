"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BillingPanelProps {
  open: boolean;
  onClose: () => void;
  name: string;
  email: string;
  planLabel: "ADMIN" | "PREMIUM";
  isAdmin?: boolean;
  initialTab?: "billing" | "account";
}

type Tab = "billing" | "account";

export function BillingPanel({
  open,
  onClose,
  name,
  email,
  planLabel,
  isAdmin = false,
  initialTab = "billing",
}: BillingPanelProps) {
  const [tab, setTab] = useState<Tab>(initialTab);

  // reset de l’onglet quand on ouvre
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  // ESC pour fermer
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const prettyPlan = planLabel === "ADMIN" ? "ADMIN" : "PREMIUM";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="
              relative
              w-full max-w-4xl
              rounded-[32px]
              border border-[#262a37]
              bg-[#15171f]
              shadow-[0_40px_140px_rgba(0,0,0,0.95)]
              backdrop-blur-xl
              overflow-hidden
            "
          >
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-[#181b25] text-slate-300 hover:text-slate-50 hover:border-slate-400 transition"
            >
              <span className="sr-only">Fermer</span>
              ✕
            </button>

            {/* Contenu en 2 colonnes */}
            <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[230px,minmax(0,1fr)]">
              {/* SIDEBAR GAUCHE */}
              <aside className="border-b md:border-b-0 md:border-r border-[#262a37] bg-[#11131b] pt-14 md:pt-12 pb-4">
                <nav className="flex flex-col gap-2 px-3 md:px-4">
                  <SidebarItem
                    label="Abonnement & facturation"
                    active={tab === "billing"}
                    onClick={() => setTab("billing")}
                  />
                  <SidebarItem
                    label="Paramètres du compte"
                    active={tab === "account"}
                    onClick={() => setTab("account")}
                  />
                </nav>
              </aside>

              {/* PANE CONTENU DROITE */}
              <section className="pt-14 md:pt-8 pb-6 px-5 sm:px-7 space-y-6">
                {tab === "billing" ? (
                  <>
                    <div className="space-y-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
                        Abonnement &amp; facturation
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                        Consulte ton plan actuel, ton statut et gère la
                        facturation pour YTScale.
                      </p>
                    </div>

                    {/* Carte récap plan */}
                    <div className="rounded-2xl border border-[#262a37] bg-[#181b25] px-4 py-4 sm:px-5 sm:py-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-300 border border-orange-400/40">
                          YT
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-50">
                            {prettyPlan}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Email :{" "}
                            <span className="text-slate-200">{email}</span>
                          </p>
                        </div>
                        {isAdmin && (
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-400/50 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                            ADMIN
                          </span>
                        )}
                        {!isAdmin && (
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                            PREMIUM
                          </span>
                        )}
                      </div>

                      <div className="h-px bg-[#262a37]" />

                      <div className="space-y-2.5 text-xs sm:text-[13px]">
                        <InfoRow label="Type d’abonnement" value={prettyPlan} />
                        <InfoRow label="Statut" value="Actif" />
                        <InfoRow
                          label="Renouvellement"
                          value="Mensuel (modifiable sur la page de facturation)"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="rounded-2xl border border-[#262a37] bg-[#181b25] px-4 py-4 sm:px-5 sm:py-5 space-y-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        Actions
                      </p>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-[0_0_32px_rgba(249,115,22,0.7)] hover:brightness-110 transition"
                        >
                          Gérer la facturation
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-xl border border-slate-700 bg-[#131620] py-2.5 text-xs sm:text-sm font-medium text-slate-200 hover:bg-[#1b1f2c] transition"
                        >
                          Mettre à jour le moyen de paiement
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 pt-1">
                        Pour toute question de facturation, contacte le support
                        YTScale.
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-2">
                      Connecté en tant que{" "}
                      <span className="text-slate-200 font-medium">{name}</span>.
                    </p>
                  </>
                ) : (
                  <>
                    {/* Onglet Paramètres du compte */}
                    <div className="space-y-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
                        Paramètres du compte
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                        Gère les informations principales de ton compte YTScale.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#262a37] bg-[#181b25] px-4 py-4 sm:px-5 sm:py-5 space-y-4">
                      <div className="space-y-3 text-xs sm:text-sm">
                        <InfoRow label="Nom" value={name} />
                        <InfoRow label="Email" value={email} />
                      </div>

                      <button
                        type="button"
                        className="mt-2 inline-flex items-center justify-center rounded-xl border border-slate-700 bg-[#131620] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200 hover:bg-[#1b1f2c] transition"
                      >
                        Modifier les informations du compte
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Sous-composants ---------- */

function SidebarItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-[13px] transition-colors ${
        active
          ? "bg-[#181b25] text-slate-50 border border-slate-100/70 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
          : "text-slate-300 border border-transparent hover:bg-[#181b25] hover:text-slate-50"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-slate-100" : "bg-slate-500"
        }`}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-100 sm:text-right">{value}</span>
    </div>
  );
}
