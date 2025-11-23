// app/layout.tsx
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import cx from "classnames";
import { sfPro, inter } from "./fonts";
import { Suspense } from "react";
import { VideoProvider } from "@/contexts/videoContext";
import { Toaster } from "react-hot-toast";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ReactNode } from "react";

// Métadonnées "classiques"
export const metadata = {
  title: "YTScale - Upgrade your channel",
  description: "",
  metadataBase: new URL("https://app.ytscale.co"),
};

// Pour Next 16 : themeColor doit aller dans viewport
export const viewport = {
  themeColor: "#020617",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

        {/* background */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute -top-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="absolute bottom-[-120px] right-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <VideoProvider>
          {/* plus de items-center, moins de padding top */}
          <main className="flex w-full min-h-screen flex-col pt pb-10">
            {children}
          </main>
        </VideoProvider>


        <Analytics />
      </body>
    </html>
  );
}