"use client";

import Link from "next/link";

const features = [
  { title: "Recherche de niche", href: "/saas/nichefinder" },
  { title: "Miniatures", href: "/saas/thumbnail" },
  { title: "Extension", href: "/saas/extension" },
];

export default function SaasHomePage() {
  return (
    <div className="w-full px-6 md:px-10 lg:px-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 pb-28 pt-14">

        {/* ------------------ HERO ------------------ */}
        <section>
          <div className="flex flex-col items-start gap-16 lg:flex-row lg:items-center lg:gap-24">
            {/* TEXT */}
            <div className="w-full space-y-7 lg:w-1/2">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-slate-50 tracking-tight">
                Upgrade ta chaîne{" "}
                <span className="text-orange-400">YouTube</span>.
              </h1>

              <p className="max-w-md text-[15px] text-slate-300">
                Idée → miniature → publication. Tout en un seul endroit.
              </p>

              <Link
                href="/saas/nichefinder"
                className="
                  inline-flex items-center gap-2 rounded-full
                  bg-sky-500 px-7 py-3 text-sm font-semibold text-slate-950
                  shadow-[0_18px_45px_rgba(12,74,110,0.65)]
                  transition hover:bg-sky-400 hover:shadow-[0_22px_60px_rgba(12,74,110,0.9)]
                "
              >
                Commencer →
              </Link>
            </div>

            {/* WORKFLOW */}
            <div className="w-full lg:w-1/2">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-orange-500/35 via-purple-500/30 to-fuchsia-500/35 opacity-60 blur-2xl" />

                <div className="relative rounded-3xl border border-slate-900/90 bg-slate-950/85 px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.9)] backdrop-blur">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-50">
                      Ta prochaine vidéo
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <div className="h-2 w-2 rounded-full bg-amber-400" />
                      <div className="h-2 w-2 rounded-full bg-rose-400" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <WorkflowItem step="1" text="Trouve l’idée avec Niche Finder." color="sky" />
                    <WorkflowItem step="2" text="Génère la miniature en quelques secondes." color="emerald" />
                    <WorkflowItem step="3" text="Publie et optimise depuis YouTube." color="purple" />
                  </div>

                  <p className="mt-5 text-[11px] text-slate-500">3 étapes. Zéro friction.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- ESPACE SUPPLÉMENTAIRE ---------------- */}
        <div className="h-10 md:h-16 lg:h-24"></div>

        {/* ------------------ MODULES ------------------ */}
        <section>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">

            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="
                  group relative flex h-40 flex-col justify-between
                  rounded-3xl p-7
                  border border-slate-900/90 bg-slate-950/85
                  shadow-[0_18px_60px_rgba(0,0,0,0.9)]
                  transition-transform transition-shadow
                  hover:-translate-y-2 hover:border-orange-500/70
                  hover:shadow-[0_24px_80px_rgba(0,0,0,1)]
                "
              >
                <h3 className="text-lg font-semibold text-slate-50 tracking-tight">
                  {feature.title}
                </h3>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">Ouvrir</span>
                  <span className="
                    inline-flex h-10 w-10 items-center justify-center
                    rounded-full border border-slate-700 text-[14px] text-slate-400
                    transition group-hover:border-orange-400/90 
                    group-hover:text-orange-300 group-hover:bg-orange-500/5
                  ">
                    →
                  </span>
                </div>
              </Link>
            ))}

          </div>
        </section>

      </div>
    </div>
  );
}

function WorkflowItem({ step, text, color }: any) {
  const colors: any = {
    sky: "border-sky-500/50 bg-sky-500/15 text-sky-200",
    emerald: "border-emerald-500/45 bg-emerald-500/10 text-emerald-200",
    purple: "border-purple-500/45 bg-purple-500/10 text-purple-200",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${colors[color]} text-xs font-semibold`}>
        {step}
      </div>
      <p className="text-xs text-slate-100">{text}</p>
    </div>
  );
}
