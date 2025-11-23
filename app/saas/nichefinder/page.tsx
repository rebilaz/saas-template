"use client";

import React, { useState } from "react";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabaseClient";
import { HotNichesStrip } from "@/components/HotNichesStrip";

const supabase = supabaseClient;

type NicheStats = {
  query: string;
  totalVideos: number;
  totalChannels: number;
  avgViews: number;
  medianViews: number;
  avgLikeRate: number;
  avgCommentRate: number;
};

type Video = {
  videoId: string;
  title: string;
};

type Channel = {
  channelId: string;
  title: string;
};

type ApiResult = {
  stats: NicheStats;
  videos: Video[];
  channels: Channel[];
};

type FiltersState = {
  order: "date" | "viewCount" | "relevance";
  videoDuration: "any" | "short" | "medium" | "long";
  minViews: string;
  regionCode: string;
  onlyShorts: boolean;
};

// Helpers pour formats lisibles
const formatNumber = (value: number) => {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return Math.round(value).toLocaleString();
};

const formatPercent = (value: number) => {
  const v = value < 1 ? value * 100 : value;
  return v.toFixed(1).replace(/\.0$/, "") + "%";
};

export default function NicheFinderPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FiltersState>({
    order: "viewCount",
    videoDuration: "any",
    minViews: "",
    regionCode: "",
    onlyShorts: false,
  });

  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Entre un sujet ou une niche YouTube.");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const bodyFilters: any = {
        order: filters.order,
        videoDuration: filters.videoDuration,
      };

      if (filters.minViews) {
        bodyFilters.minViews = Number(filters.minViews);
      }

      if (filters.regionCode.trim()) {
        bodyFilters.regionCode = filters.regionCode.trim().toUpperCase();
      }

      if (filters.onlyShorts) {
        bodyFilters.onlyShorts = true;
      }

      const { data, error } = await supabase.functions.invoke(
        "dynamic-handler",
        {
          body: {
            query,
            filters: bodyFilters,
          },
        }
      );

      if (error) throw new Error(error.message || "Function error");
      setResult(data as ApiResult);
    } catch (err: any) {
      setError(err.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ On laisse le fond au layout : pas de gradient ici
    <div className="w-full px-4 py-10 lg:px-10 text-slate-100">
      <div className="mx-auto max-w-5xl flex flex-col gap-8">
        {/* Hero */}
        <header className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Niche Finder
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
            Analyse une niche YouTube en 1 clic.
          </h1>
          <p className="max-w-xl text-sm text-slate-400">
            Tape un sujet, ajuste quelques filtres, et vois quelles vidéos et
            chaînes dominent la niche.
          </p>
        </header>

        {/* Bloc recherche + filtres */}
        <section className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              className="flex-1 rounded-xl bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none ring-0 focus:ring-2 focus:ring-orange-400/70 sm:text-base border border-slate-800/80"
              placeholder="Ex : AI montage vidéo, shorts finance, analyse foot…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(249,115,22,0.5)] transition hover:brightness-110 disabled:opacity-70 sm:text-base"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-900/40 border-t-orange-900" />
              )}
              {loading ? "Analyse en cours…" : "Analyser la niche"}
            </button>
          </form>

          {/* Filtres rapides */}
          <div className="grid gap-3 text-xs text-slate-200 sm:grid-cols-4 sm:text-sm">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Tri
              </p>
              <select
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs sm:text-sm"
                value={filters.order}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    order: e.target.value as FiltersState["order"],
                  }))
                }
              >
                <option value="viewCount">Par vues</option>
                <option value="date">Plus récentes</option>
                <option value="relevance">Pertinence</option>
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Durée
              </p>
              <select
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs sm:text-sm"
                value={filters.videoDuration}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    videoDuration: e.target
                      .value as FiltersState["videoDuration"],
                  }))
                }
              >
                <option value="any">Toutes</option>
                <option value="short">Courtes (&lt; 4 min)</option>
                <option value="medium">Moyennes (4–20 min)</option>
                <option value="long">Longues (&gt; 20 min)</option>
              </select>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Min. vues
              </p>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs sm:text-sm"
                placeholder="ex: 10000"
                value={filters.minViews}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minViews: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Pays
              </p>
              <input
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs uppercase sm:text-sm"
                placeholder="ex: FR, US…"
                value={filters.regionCode}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, regionCode: e.target.value }))
                }
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 sm:text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-700 bg-slate-950"
              checked={filters.onlyShorts}
              onChange={(e) =>
                setFilters((f) => ({ ...f, onlyShorts: e.target.checked }))
              }
            />
            Shorts uniquement
          </label>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
            <strong className="font-semibold">Erreur :</strong> {error}
          </div>
        )}
<HotNichesStrip />
        {result && (
          <div className="space-y-8">
            {/* Stats */}
            <section className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 text-lg">
                  📊
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
                  Vue d’ensemble de la niche
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Stat
                  label="Vidéos"
                  value={formatNumber(result.stats.totalVideos)}
                />
                <Stat
                  label="Chaînes"
                  value={formatNumber(result.stats.totalChannels)}
                />
                <Stat
                  label="Vues moyennes"
                  value={formatNumber(result.stats.avgViews)}
                />
                <Stat
                  label="Vues médianes"
                  value={formatNumber(result.stats.medianViews)}
                />
                <Stat
                  label="Taux de likes"
                  value={formatPercent(result.stats.avgLikeRate)}
                />
                <Stat
                  label="Taux de commentaires"
                  value={formatPercent(result.stats.avgCommentRate)}
                />
              </div>
            </section>

            {/* Top vidéos */}
            <section className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 text-lg">
                  🎥
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
                  Vidéos qui performent
                </h2>
              </div>

              <div className="space-y-4">
                {result.videos.slice(0, 8).map((v, i) => {
                  const thumb = `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;
                  const url = `https://www.youtube.com/watch?v=${v.videoId}`;

                  return (
                    <a
                      key={v.videoId + i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm transition hover:border-orange-400/60 hover:bg-slate-950"
                    >
                      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                        <Image
                          src={thumb}
                          alt={v.title}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-50 sm:text-base">
                          {v.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID : {v.videoId}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>

            {/* Top chaînes */}
            {result.channels?.length > 0 && (
              <section className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 text-lg">
                    📺
                  </span>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
                    Chaînes détectées
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.channels.slice(0, 8).map((c, i) => (
                    <div
                      key={c.channelId + i}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm"
                    >
                      <p className="truncate font-semibold text-slate-50">
                        {c.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        ID : {c.channelId}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-950/80 p-4 text-center border border-slate-800">
      <div className="text-2xl font-semibold text-slate-50">{value}</div>
      <div className="mt-1 text-xs text-slate-500 sm:text-sm">{label}</div>
    </div>
  );
}
