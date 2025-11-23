import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import cx from "classnames";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { inter, sfPro } from "./fonts";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata = {
  title: "Your SaaS Name",
  description:
    "Plug-and-play SaaS starter with Next.js, Supabase auth, and Stripe billing.",
  metadataBase: new URL(appUrl),
};

export const viewport = {
  themeColor: "#020617",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cx(
          sfPro.variable,
          inter.variable,
          "bg-slate-950 text-slate-50 antialiased"
        )}
      >
        <Toaster />

        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute -top-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="absolute bottom-[-120px] right-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <main className="flex w-full min-h-screen flex-col pb-10">
          {children}
        </main>

        <Analytics />
      </body>
    </html>
  );
}
