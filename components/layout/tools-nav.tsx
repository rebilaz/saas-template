"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { UserMenu } from "./UserMenu";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const items: NavItem[] = [
  {
    href: "/saas/nichefinder",
    label: "Recherche de niche",
    icon: (
      <Image
        src="/icons/niche.svg"
        alt=""
        width={22}
        height={22}
        className="shrink-0"
      />
    ),
  },
  {
    href: "/saas/thumbnail",
    label: "Miniatures",
    icon: (
      <Image
        src="/icons/thumbnail.svg"
        alt=""
        width={22}
        height={22}
        className="shrink-0"
      />
    ),
  },
  
{
  href: "/saas/video",
  label: "Métadonnées Vidéo",
  icon: (
    <Image
      src="/icons/video-meta.svg"
      alt=""
      width={22}
      height={22}
      className="shrink-0"
    />
  ),
},
{
    href: "/saas/extension",
    label: "Extension",
    icon: (
      <Image
        src="/icons/extension.svg"
        alt=""
        width={22}
        height={22}
        className="shrink-0"
      />
    ),
  },

];

export default function ToolsNav() {
  const pathname = usePathname() ?? "";
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <nav className="relative z-20 flex h-full w-full flex-col justify-between bg-slate-950/90 text-slate-100">

      {/* ---------------- LOGO ---------------- */}
      <div className="px-6 pt-10 pb-4 flex justify-center">
        <div
          className={cn(
            "relative rounded-2xl bg-slate-900/40 overflow-hidden",
            "w-[300px] h-[70px]",
            "ring-10 ring-orange-500",
            "shadow-lg shadow-orange-500/70",
            "outline outline-1 outline-white/5"
          )}
        >
          <Image
            src="/logo.svg"
            alt="YTScale logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* ---------------- NAVIGATION ---------------- */}
      <ul className="mt-8 space-y-3 px-4">
        {items.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.06,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <Link href={item.href} className="block">
                <motion.div
                  className={cn(
                    "group relative w-full flex items-center gap-4 rounded-2xl px-5 py-4",
                    "transition-all duration-300"
                  )}
                  whileHover={{ scale: isActive ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >

                  {/* BG Active / Hover */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-2xl border transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90 border-slate-700/50 shadow-xl shadow-orange-500/10"
                        : "bg-slate-900/30 border-slate-800/30 group-hover:bg-slate-900/50 group-hover:border-slate-700/50 group-hover:shadow-lg group-hover:shadow-black/20"
                    )}
                    animate={
                      isActive
                        ? {
                            boxShadow: [
                              "0 20px 40px -12px rgba(251,146,60,0.1), 0 4px 6px -1px rgba(0,0,0,0.3)",
                              "0 20px 40px -12px rgba(251,146,60,0.15), 0 4px 6px -1px rgba(0,0,0,0.3)",
                              "0 20px 40px -12px rgba(251,146,60,0.1), 0 4px 6px -1px rgba(0,0,0,0.3)",
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  {/* Barre latérale active */}
                  {isActive && (
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-orange-400 via-rose-500 to-amber-400"
                    >
                      <div className="absolute inset-0 rounded-r-full blur-sm bg-gradient-to-b from-orange-400 via-rose-500 to-amber-400 opacity-60" />
                    </motion.div>
                  )}

                  {/* ICON */}
                  <motion.span
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300",
                      isActive
                        ? "border-orange-400/30 bg-gradient-to-br from-orange-500/20 via-rose-500/15 to-transparent text-orange-100 shadow-lg shadow-orange-500/30"
                        : "border-slate-800/60 bg-slate-950/80 text-slate-400 group-hover:border-slate-700/60 group-hover:bg-slate-900/90 group-hover:text-slate-200 group-hover:shadow-md group-hover:shadow-black/30"
                    )}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
                    <span className="relative">{item.icon}</span>
                  </motion.span>

                  {/* LABEL */}
                  <div className="relative z-10 flex-1 text-left">
                    <span
                      className={cn(
                        "block font-semibold tracking-tight text-sm transition-all duration-300",
                        isActive
                          ? "text-slate-50"
                          : "text-slate-300 group-hover:text-slate-100"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              </Link>
            </motion.li>
          );
        })}
      </ul>

      {/* ---------------- CRÉDITS ---------------- */}
      <div className="px-4 pb-6">
        <button
          className={cn(
            "group relative w-full flex items-center justify-center gap-3",
            "rounded-xl px-4 py-3",
            "text-sm font-semibold",
            "bg-gradient-to-br from-[#0d1117]/60 via-[#0d1117]/40 to-[#0d1117]/20",
            "backdrop-blur-xl border border-white/5",
            "shadow-[0_0_25px_-5px_rgba(255,115,0,0.35)]",
            "hover:shadow-[0_0_35px_-6px_rgba(255,140,0,0.55)]",
            "transition-all duration-300"
          )}
        >
          <span className="relative z-10 text-slate-200 tracking-wide">
            Crédits : <span className="text-orange-300 font-bold">4.55K</span>
          </span>
        </button>
      </div>

      <UserMenu
        name="Nom utilisateur"
        email="email.connexion@exemple.com"
        plan="Premium"
      />
    </nav>
  );
}
