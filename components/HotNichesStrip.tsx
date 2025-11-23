"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type HotVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  badge?: string;
};

interface HotNichesStripProps {
  videos?: HotVideo[];
}

const DEFAULT_VIDEOS: HotVideo[] = [
  {
    id: "abc123",
    title: "IA pour monter 10 vidéos par jour sans équipe",
    url: "https://www.youtube.com/watch?v=abc123",
    badge: "AI",
  },
  {
    id: "def456",
    title: "Shorts crypto FR : comment repérer les trends",
    url: "https://www.youtube.com/watch?v=def456",
    badge: "Shorts",
  },
  {
    id: "ghi789",
    title: "Analyse tactique : pourquoi ce système cartonne",
    url: "https://www.youtube.com/watch?v=ghi789",
    badge: "Foot",
  },
  {
    id: "jkl012",
    title: "Finance perso : 3 formats qui explosent en shorts",
    url: "https://www.youtube.com/watch?v=jkl012",
    badge: "FR",
  },
];

export function HotNichesStrip({ videos = DEFAULT_VIDEOS }: HotNichesStripProps) {
  const scrollingVideos = [...videos, ...videos];

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.8)]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 shadow-[0_0_24px_rgba(249,115,22,0.7)]">
          <span className="text-sm font-bold text-slate-950">🔥</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Vidéos qui performent
          </p>
          <p className="text-[11px] text-slate-500">
            Aperçu des contenus forts dans ta niche
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-5 pr-6"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            repeat: Infinity,
            duration: 35,
            ease: "linear",
          }}
        >
          {scrollingVideos.map((video, index) => {
            const thumbnail =
              video.thumbnail ||
              `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

            return (
              <a
                key={video.id + index}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex min-w-[330px] max-w-sm gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/90 p-3 hover:border-orange-400/60 hover:bg-slate-900 transition-colors"
              >
                {/* THUMBNAIL — Plus grande */}
                <div className="relative h-28 w-48 flex-shrink-0 overflow-hidden rounded-xl bg-slate-900">
                  <Image
                    src={thumbnail}
                    fill
                    alt={video.title}
                    sizes="192px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-opacity" />
                </div>

                {/* INFO */}
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-50 leading-snug">
                    {video.title}
                  </p>

                  {video.badge && (
                    <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] text-orange-300 uppercase tracking-wide">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      {video.badge}
                    </span>
                  )}
                </div>
              </a>
            );
          })}
        </motion.div>

        {/* Fade Borders */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent" />
      </div>
    </div>
  );
}
