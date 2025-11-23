"use client";

interface PricingCardProps {
  isPricingYearly: boolean;
  currentPlan: { name: string; priceInUSD: number };
  oldPrice?: number;
  isWaiting: boolean;
  onClickCTA: () => void | Promise<void>;
  onClickLogin: () => void;
  onToggleBillingMode: () => void;
}

export function PricingCard({
  isPricingYearly,
  currentPlan,
  oldPrice,
  isWaiting,
  onClickCTA,
  onClickLogin,
  onToggleBillingMode,
}: PricingCardProps) {
  const formattedPrice = currentPlan.priceInUSD.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formattedOldPrice =
    typeof oldPrice === "number"
      ? oldPrice.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : null;

  return (
    <div className="relative mx-auto max-w-md">
      <div className="pointer-events-none absolute -bottom-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[32px] border border-sky-500/40 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 shadow-[0_40px_120px_rgba(0,0,0,0.95)] px-6 py-7 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -top-40 right-[-80px] h-64 w-64 rounded-full bg-sky-400/12 blur-3xl" />

        <div className="relative mb-6 space-y-2 text-center">
          <p className="text-[26px] sm:text-[30px] font-[800] leading-tight tracking-tight">
            <span className="bg-gradient-to-b from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {currentPlan.name}
            </span>
          </p>
          <p className="text-[11px] text-slate-500">
            {isPricingYearly ? "Billed annually" : "Billed monthly"}
          </p>
        </div>

        <div className="relative mb-6 space-y-2 text-center">
          <div className="relative flex items-baseline justify-center gap-2 -translate-y-1 sm:-translate-y-2">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/30 blur-2xl" />

            <span className="relative text-[64px] sm:text-[82px] font-[800] tracking-tight bg-gradient-to-b from-slate-50 via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
              ${formattedPrice}
            </span>
            <span className="relative text-xl sm:text-2xl font-semibold text-slate-50">
              /mo
            </span>
          </div>

          {formattedOldPrice && (
            <p className="text-sm sm:text-base font-semibold text-slate-400">
              Intro price, was{" "}
              <span className="line-through">${formattedOldPrice}/mo</span>
            </p>
          )}
        </div>

        <button
          className="mb-6 w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_45px_rgba(14,165,233,0.8)] transition hover:brightness-110 hover:shadow-[0_0_60px_rgba(14,165,233,1)] disabled:opacity-60"
          onClick={onClickCTA}
          disabled={isWaiting}
        >
          {isWaiting ? "Preparing checkout..." : "Start free trial"}
        </button>

        <div className="relative space-y-3 rounded-3xl border border-slate-800 bg-slate-950/95 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            What’s included
          </p>

          <ul className="space-y-2 text-sm text-slate-200">
            <FeatureItem text="Supabase email + Google auth" positive />
            <FeatureItem text="Stripe checkout ready to plug price IDs" positive />
            <FeatureItem text="Dashboard layout with navigation and user menu" positive />
            <FeatureItem text="Billing & account panel scaffold" positive />
            <FeatureItem text="Protected app routes under /saas" positive />
          </ul>

          <p className="pt-1 text-[11px] text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onClickLogin}
              className="text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline"
            >
              Sign in here.
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBillingMode}
          className="mt-5 w-full text-center text-[11px] text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
        >
          {isPricingYearly
            ? "Switch to monthly pricing"
            : "See yearly pricing"}
        </button>
      </div>
    </div>
  );
}

function FeatureItem({
  text,
  positive,
}: {
  text: string;
  positive?: boolean;
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${
          positive ? "bg-emerald-500/15" : "bg-red-500/15"
        }`}
      >
        {positive ? (
          <svg
            className="h-3.5 w-3.5 text-emerald-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="h-3.5 w-3.5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 8.586L5.293 3.879A1 1 0 103.879 5.293L8.586 10l-4.707 4.707a1 1 0 101.414 1.414L10 11.414l4.707 4.707a1 1 0 001.414-1.414L11.414 10l4.707-4.707a1 1 0 00-1.414-1.414L10 8.586z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
      <span className="text-xs sm:text-sm text-slate-200">{text}</span>
    </li>
  );
}
