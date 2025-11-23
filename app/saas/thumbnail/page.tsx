"use client";

import {
  useState,
  useCallback,
  KeyboardEvent,
  FormEvent,
  ChangeEvent,
} from "react";
import { supabaseClient } from "@/lib/supabaseClient";

type Mode = "prompt" | "recreate" | "edit";

type ApiResponse = {
  prompt?: string;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
};

export default function CleanPrompt() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<Mode>("prompt");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const maxChars = 400;

  const runGeneration = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const { data, error } = await supabaseClient.functions.invoke(
        "dynamic-api",
        {
          body: {
            userText: prompt,
            niche: null,
            realism: null,
            referenceImage: mode === "edit" ? referenceImage : null,
          },
        }
      );

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(
          error.message || "Erreur lors de la génération de l'image"
        );
      }

      const json = data as ApiResponse;

      if (json.error) {
        throw new Error(json.error);
      }

      if (!json.imageBase64 || !json.mimeType) {
        throw new Error("Réponse invalide du serveur (pas d'image)");
      }

      const url = `data:${json.mimeType};base64,${json.imageBase64}`;
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, mode, referenceImage]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runGeneration();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        void runGeneration();
      }
    }
  };

  const handleNew = () => {
    setPrompt("");
    setImageUrl(null);
    setError(null);
    setMode("prompt");
    setReferenceImage(null);
  };

  const handleModify = () => {
    // On enlève juste l'image, on revient au formulaire avec le prompt existant
    setImageUrl(null);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setReferenceImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const remaining = maxChars - prompt.length;
  const isOverLimit = remaining < 0;
  const isDisabled = !prompt.trim() || isOverLimit || isLoading;

  const placeholderByMode: Record<Mode, string> = {
    prompt: "Décris ta scène…",
    recreate: "Colle ici un prompt existant à recréer / améliorer…",
    edit: "Colle un prompt à éditer ou décris ce que tu veux modifier…",
  };

  // 🔁 ÉTAT CHARGEMENT : barre de progression, côté gauche fixe
  // 🔁 LOADER — barre lente et régulière
if (isLoading) {
  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-64 h-2.5 rounded-full bg-neutral-700/60 overflow-hidden">
            <div className="progress-fill h-full rounded-full bg-white" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
            Génération en cours…
          </p>
        </div>
      </div>

      {/* Barre LENTE */}
      <style jsx>{`
        .progress-fill {
          width: 0%;
          animation: slow-progress 6s ease-in-out forwards;
        }

        @keyframes slow-progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}


  // 🖼️ ÉTAT IMAGE : image plus petite, simple contour
  if (imageUrl) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4">
        <div className="p-2 rounded-2xl border border-white/15">
          <img
            src={imageUrl}
            alt="Vignette générée"
            className="max-w-md max-h-[360px] rounded-xl"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {/* Télécharger */}
          <a
            href={imageUrl}
            download="thumbnail.png"
            className="
              px-5 py-2.5 rounded-full text-sm font-medium
              bg-white text-slate-900
              hover:bg-slate-100
              transition
            "
          >
            Télécharger
          </a>

          {/* Modifier */}
          <button
            type="button"
            onClick={handleModify}
            className="
              px-5 py-2.5 rounded-full text-sm font-medium
              border border-white/30 text-slate-100
              bg-white/5 hover:bg-white/10
              transition
            "
          >
            Modifier
          </button>

          {/* Nouveau */}
          <button
            type="button"
            onClick={handleNew}
            className="
              px-5 py-2.5 rounded-full text-sm font-medium
              text-slate-900
              bg-slate-100/90 hover:bg-white
              transition
            "
          >
            Nouveau
          </button>
        </div>

        {error && (
          <p className="mt-4 text-[11px] text-rose-400">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }

  // 📝 ÉTAT PAR DÉFAUT : formulaire
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4">
      {/* FX premium : halo + gradient subtil */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[260px] bg-[radial-gradient(circle,_rgba(255,145,55,0.2),transparent_70%)] blur-3xl opacity-60" />
        <div className="absolute bottom-10 right-10 w-[700px] h-[260px] bg-[radial-gradient(circle,_rgba(255,60,80,0.12),transparent_75%)] blur-3xl opacity-40" />
      </div>

      {/* CARD principale */}
      <form
        onSubmit={handleSubmit}
        className="
          relative w-full max-w-4xl
          bg-[#060b15]/80 
          border border-white/5
          rounded-[26px]
          backdrop-blur-2xl 
          shadow-[0_0_80px_rgba(0,0,0,0.45)]
          px-8 py-10
          transition-all
        "
      >
        {/* Glow top */}
        <div className="pointer-events-none absolute inset-x-40 -top-12 h-16 bg-[radial-gradient(circle,_rgba(255,160,100,0.5),transparent_70%)] blur-xl opacity-60" />

        {/* TABS modernisés */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {(["prompt", "recreate", "edit"] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={[
                  "px-4 py-1.5 rounded-full text-xs tracking-wide transition-all backdrop-blur-xl border",
                  active
                    ? "font-semibold text-slate-950 bg-gradient-to-r from-orange-400 to-amber-300 shadow-[0_0_16px_rgba(255,190,130,0.6)] border-transparent"
                    : "text-slate-400 border-white/10 bg-white/5 hover:bg-white/10 hover:text-slate-200",
                ].join(" ")}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            );
          })}
        </div>

        {/* TEXTAREA container */}
        <div
          className="
            rounded-2xl border border-white/10 
            bg-white/[0.03] 
            px-5 py-4 shadow-inner
            transition-all
          "
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderByMode[mode]}
            className="
              w-full bg-transparent text-[15px] leading-relaxed
              text-slate-100 placeholder:text-slate-500
              resize-none focus:outline-none
            "
            rows={4}
          />

          {/* Import image en mode Edit */}
          {mode === "edit" && (
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-200">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span
                  className="
                    px-3 py-1.5 rounded-full border border-white/20 
                    bg-white/5 hover:bg-white/10
                    text-[11px] font-medium
                  "
                >
                  Importer une image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {referenceImage && (
                <span className="text-[11px] text-emerald-300/80">
                  Image importée ✓
                </span>
              )}
            </div>
          )}
        </div>

        {/* FOOTER : juste le bouton + éventuelle erreur */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div className="text-[11px] text-rose-400">
            {error && <>⚠️ {error}</>}
          </div>

          {/* BOUTON */}
          <button
            type="submit"
            disabled={isDisabled}
            className="
              inline-flex items-center justify-center
              px-7 py-2.5
              rounded-full text-sm font-semibold
              text-[#0b0f15]
              bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200
              shadow-[0_0_18px_rgba(255,190,130,0.65)]
              hover:brightness-110
              active:scale-95
              transition-all
              disabled:opacity-50 disabled:brightness-100 disabled:cursor-not-allowed
            "
          >
            Générer
          </button>
        </div>
      </form>
    </div>
  );
}
