"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type MetaResult = {
  title: string;
  description: string;
  tags: string[];
  transcript: string;
  source: "youtubeUrl" | "file";
};

const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/transcribe-video`;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function VideoMetaPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<MetaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError(null);

    if (!youtubeUrl && !file) {
      setError("Entre un lien ou importe un fichier.");
      return;
    }

    try {
      setIsLoading(true);

      const fd = new FormData();
      if (youtubeUrl) fd.append("youtubeUrl", youtubeUrl);
      if (file) fd.append("file", file);

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ANON_KEY}`,
          apikey: ANON_KEY,
        },
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Erreur");

      setResult(json as MetaResult);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full px-4 pt-20 pb-16 flex justify-center">
      {/* HALO global centré sur le contenu */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[260px] bg-[radial-gradient(circle,_rgba(255,140,60,0.26),transparent_70%)] blur-3xl opacity-80" />
      </div>

      {/* CONTENEUR CENTRAL */}
      <div className="relative w-full max-w-4xl space-y-14">
        {/* TITRE */}
        <header className="select-none max-w-4xl">
          <h1
            className="
              geist font-black
              text-4xl md:text-6xl lg:text-7xl
              leading-tight tracking-tight
              bg-gradient-to-r from-orange-300 via-amber-100 to-yellow-300
              bg-clip-text text-transparent
              drop-shadow-[0_0_35px_rgba(255,210,140,0.4)]
            "
          >
            Ton Titre,
            <br className="hidden md:block" /> Ta Description,
            <br className="hidden md:block" /> Tes Tags
          </h1>
        </header>

        {/* CARTE FORMULAIRE */}
        <form
          onSubmit={handleSubmit}
          className="
            relative
            bg-[#060b15]/80 
            border border-white/5
            rounded-[26px]
            backdrop-blur-2xl 
            shadow-[0_0_80px_rgba(0,0,0,0.45)]
            px-6 md:px-8 py-7
            transition-all
          "
        >
          {/* Glow top subtil */}
          <div className="pointer-events-none absolute inset-x-24 -top-10 h-14 bg-[radial-gradient(circle,_rgba(255,160,110,0.5),transparent_70%)] blur-xl opacity-60" />

          {/* Inputs */}
          <div className="space-y-4">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Coller un lien YouTube"
              className="
                w-full rounded-2xl border border-white/10 
                bg-white/[0.03] px-4 py-3 text-sm
                text-slate-100 placeholder:text-slate-500
                focus:outline-none focus:ring-[1px] focus:ring-orange-400/60
              "
            />

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span
                  className="
                    px-3 py-1.5 rounded-full border border-white/15 
                    bg-white/5 hover:bg-white/10
                    text-[12px] text-slate-100
                  "
                >
                  Importer un fichier
                </span>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <span className="text-[11px] text-slate-500 truncate">
                {file ? file.name : "Aucun fichier sélectionné"}
              </span>
            </div>
          </div>

          {/* Footer bouton + erreur */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 text-[11px] text-rose-400 min-h-[1rem]">
              {error && <>⚠️ {error}</>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                inline-flex items-center justify-center
                px-7 py-2.5 rounded-full text-sm font-semibold
                text-[#0b0f15]
                bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200
                shadow-[0_0_22px_rgba(255,190,130,0.7)]
                hover:brightness-110 active:scale-95
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
              "
            >
              {isLoading ? "Analyse…" : "Analyser"}
            </button>
          </div>

          {/* Overlay Loader */}
          {isLoading && (
            <>
              <div className="absolute inset-0 rounded-[26px] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="w-56 h-2 rounded-full bg-slate-800/70 overflow-hidden">
                  <div className="loader-fill h-full rounded-full bg-white/90" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Analyse en cours…
                </p>
              </div>

              <style jsx>{`
                .loader-fill {
                  width: 0%;
                  animation: vm-progress 6s ease-out forwards;
                }
                @keyframes vm-progress {
                  from {
                    width: 0%;
                  }
                  to {
                    width: 100%;
                  }
                }
              `}</style>
            </>
          )}
        </form>

        {/* RÉSULTATS */}
        {result && (
          <section className="space-y-4 text-sm">
            <div className="rounded-2xl border border-white/8 bg-[#060b15]/70 px-5 py-4">
              <p className="text-[11px] text-slate-500 mb-1">Titre</p>
              <p className="text-slate-50">{result.title}</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#060b15]/70 px-5 py-4">
              <p className="text-[11px] text-slate-500 mb-1">Description</p>
              <p className="whitespace-pre-line text-slate-200">
                {result.description}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#060b15]/70 px-5 py-4">
              <p className="text-[11px] text-slate-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {result.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="
                      px-2.5 py-1 rounded-full text-[11px]
                      border border-white/16 bg-white/5 text-slate-100
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
