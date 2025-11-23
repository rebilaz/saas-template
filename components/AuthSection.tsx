"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { GeistSans } from "geist/font/sans";

import { supabaseClient } from "@/lib/supabaseClient";

type Variant = "page" | "modal";

export interface AuthSectionProps {
  redirectToOverride?: string;
  variant?: Variant;
}

export function AuthSection({
  redirectToOverride,
  variant = "page",
}: AuthSectionProps) {
  const supabase = supabaseClient;

  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const redirectTo =
    redirectToOverride ?? searchParams?.get("redirectTo") ?? "/saas";

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    setMessage(null);
    setErrorMsg(null);

    const callbackBaseUrl = `${window.location.origin}/auth/callback`;

    try {
      document.cookie = `redirect_after_login=${encodeURIComponent(
        redirectTo
      )}; Path=/; Max-Age=600; SameSite=Lax`;
    } catch (err) {
      console.warn("Unable to write redirect_after_login cookie", err);
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackBaseUrl,
        shouldCreateUser: true,
      },
    });

    setLoadingEmail(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("Check your inbox for a magic link to sign in.");
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setMessage(null);
    setErrorMsg(null);

    const callbackUrl = `${window.location.origin}/auth/callback?redirect_to=${encodeURIComponent(
      redirectTo
    )}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoadingGoogle(false);
    }
  };

  const card = (
    <div className="w-full max-w-md rounded-[28px] border border-slate-900 bg-slate-950/90 p-8 shadow-[0_40px_130px_rgba(0,0,0,0.9)] backdrop-blur-xl flex flex-col items-stretch gap-6">
      <div className="flex flex-col items-center text-center gap-3">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-50 tracking-tight">
          Access Your SaaS Name
        </h1>

        <p className="text-xs text-slate-400">
          Use email magic links or Google OAuth. Accounts are created
          automatically on first sign-in.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 space-y-4">
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/60 placeholder:text-slate-600"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loadingEmail || !email}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(14,165,233,0.6)] transition hover:brightness-110 disabled:opacity-60 disabled:hover:brightness-100"
          >
            {loadingEmail ? "Sending..." : "Email me a link"}
          </button>
        </form>

        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 text-sm font-semibold text-slate-100 hover:border-sky-400 hover:bg-slate-900 disabled:opacity-60 flex items-center justify-center gap-2 transition"
        >
          {loadingGoogle ? "Redirecting..." : "Continue with Google"}
        </button>

        {message && (
          <p className="text-xs text-center text-emerald-300">{message}</p>
        )}
        {errorMsg && (
          <p className="text-xs text-center text-rose-300">{errorMsg}</p>
        )}
      </div>

      <p className="text-[10px] text-center text-slate-500">
        By continuing you agree to the terms of Your SaaS Name.
      </p>
    </div>
  );

  if (variant === "modal") {
    return <div className={GeistSans.className}>{card}</div>;
  }

  return (
    <div
      className={`${GeistSans.className} flex min-h-[calc(100vh-5rem)] w-full items-center justify-center px-4 py-8`}
    >
      {card}
    </div>
  );
}

export default AuthSection;
