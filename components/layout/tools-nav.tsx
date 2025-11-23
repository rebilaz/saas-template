'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const items: NavItem[] = [
  {
    href: "/saas",
    label: "Dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: <CreditCard className="h-5 w-5" />,
  },
];

export default function ToolsNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="relative z-20 flex h-full w-full flex-col justify-between bg-slate-950/90 text-slate-100">
      <div className="px-6 pt-10 pb-6 flex justify-center">
        <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 shadow-lg shadow-slate-950/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-100 font-bold">
            SaaS
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none text-slate-50">
              Your SaaS Name
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Next.js + Supabase + Stripe
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-3 px-4">
        {items.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <Link href={item.href} className="block">
                <motion.div
                  className={cn(
                    "group relative flex w-full items-center gap-4 rounded-2xl px-5 py-4",
                    "transition-all duration-300"
                  )}
                  whileHover={{ scale: isActive ? 1 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl border transition-all duration-300",
                      isActive
                        ? "border-sky-400/40 bg-slate-900/80 shadow-[0_12px_40px_rgba(56,189,248,0.15)]"
                        : "border-slate-800/40 bg-slate-900/40 group-hover:border-slate-700 group-hover:bg-slate-900/70"
                    )}
                  />

                  <span
                    className={cn(
                      "relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border text-slate-100",
                      isActive
                        ? "border-sky-400/50 bg-sky-500/10"
                        : "border-slate-800 bg-slate-950/70 group-hover:border-slate-700"
                    )}
                  >
                    {item.icon}
                  </span>

                  <div className="relative z-10 flex-1 text-left">
                    <span
                      className={cn(
                        "block text-sm font-semibold tracking-tight",
                        isActive ? "text-slate-50" : "text-slate-200"
                      )}
                    >
                      {item.label}
                    </span>
                    {!isActive && (
                      <span className="text-[11px] text-slate-500">
                        Manage the core template pages
                      </span>
                    )}
                  </div>
                </motion.div>
              </Link>
            </motion.li>
          );
        })}
      </ul>

      <div className="px-4 pb-6">
        <UserMenu name="Your Name" email="you@example.com" plan="Premium" />
      </div>
    </nav>
  );
}
