"use client";

import { ConnectExtensionButton } from "@/components/ConnectExtensionButton";

export default function ExtensionPage() {
  return (
    <div className="w-full px-4 py-20 lg:px-10 flex flex-col items-center justify-start">
      <div className="mx-auto max-w-4xl space-y-14">
        {/* HEADER AMÉLIORÉ */}
        <header className="space-y-6 text-center pt-4">
          <h1 className="text-[40px] sm:text-[52px] lg:text-[64px] font-[900] leading-[1.05] tracking-tight">
            <span className="bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 bg-clip-text text-transparent">
              Extension Chrome
            </span>{" "}
            <span className="bg-gradient-to-b from-orange-300 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              YTScale
            </span>
          </h1>
        </header>

        {/* STEP 1 */}
        <section className="flex gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-7 py-7 sm:px-8 sm:py-8 items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[13px] font-semibold text-orange-300 border border-slate-700">
            1
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-50">
              Installer l’extension
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Installe l’extension <span className="text-slate-100">YTScale</span> dans ton
              navigateur <span className="text-slate-100">Chrome</span> ou{" "}
              <span className="text-slate-100">Edge</span>, puis reviens sur cette page.
            </p>
          </div>
        </section>

        {/* STEP 2 */}
        <section className="flex gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-7 py-7 sm:px-8 sm:py-8 items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[13px] font-semibold text-orange-300 border border-slate-700">
            2
          </div>
          <div className="space-y-5 flex-1">
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-semibold text-slate-50">
                Connecter l’extension à ton compte
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Clique sur le bouton ci-dessous pour lier l’extension à ton
                compte automatiquement.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-500/25 bg-gradient-to-r from-orange-500/15 via-slate-950/60 to-amber-400/10 px-6 py-6 flex items-center justify-center">
              <ConnectExtensionButton />
            </div>
          </div>
        </section>

        {/* STEP 3 */}
        <section className="flex gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-7 py-7 sm:px-8 sm:py-8 items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[13px] font-semibold text-orange-300 border border-slate-700">
            3
          </div>
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-slate-50">
              Utiliser YTScale directement sur YouTube
            </h2>
            <ul className="list-disc pl-5 text-sm text-slate-400 space-y-2 max-w-2xl leading-relaxed">
              <li>Ouvre simplement une vidéo YouTube comme d’habitude.</li>
              <li>L’extension détecte automatiquement la vidéo en cours.</li>
              <li>
                Un panneau <span className="text-slate-100">“Estimation revenus”</span>{" "}
                apparaît dans la colonne des suggestions.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
