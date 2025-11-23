import { createSupabaseServer } from "@/lib/supabase/server";

type Profile = {
  role?: string | null;
  subscription_status?: string | null;
  trial_end?: string | null;
};

function formatStatus(profile?: Profile | null) {
  const status = profile?.subscription_status;

  if (status === "active") return "Active subscription";
  if (status === "trialing") return "Trialing";
  if (status === "past_due") return "Payment past due";
  if (status === "canceled") return "Canceled";
  return "Not subscribed";
}

export default async function SaasHomePage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const demoPriceId =
    process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || "price_placeholder";

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("role, subscription_status, trial_end")
        .eq("id", user.id)
        .maybeSingle<Profile>()
    : { data: null };

  const subscriptionStatus = formatStatus(profile);

  return (
    <div className="w-full px-6 md:px-10 lg:px-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 pb-24 pt-14">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Dashboard
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-50 tracking-tight">
            Your SaaS workspace is ready.
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            You have Supabase authentication, Stripe checkout, and the core UI
            shell wired up. Swap the copy, connect your keys, and start shipping
            features for your product.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Account
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-50">
              Signed in as {user?.email ?? "your user"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Role:{" "}
              <span className="text-slate-100">
                {profile?.role ?? "member"}
              </span>
            </p>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-200">
              Subscription status: {subscriptionStatus}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Billing
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-50">
              Connect Stripe to go live
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Update the price IDs in <code>utils/stripe/configuration.ts</code>{" "}
              and add your Stripe keys to the environment. The checkout and
              billing panel are already wired to Supabase auth.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(14,165,233,0.35)] transition hover:bg-sky-400"
              >
                View pricing page
              </a>
              <a
                href={`/start-checkout?priceId=${demoPriceId}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-700 hover:bg-slate-800 transition"
              >
                Trigger checkout (demo)
              </a>
            </div>
          </section>
        </div>

        <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.7)] sm:grid-cols-3">
          <StepCard
            title="1. Configure env"
            body="Copy .env.example, add your Supabase and Stripe keys, and set NEXT_PUBLIC_APP_URL."
          />
          <StepCard
            title="2. Wire data"
            body="Use Supabase client/server helpers in lib/supabase to fetch profile data or build new features."
          />
          <StepCard
            title="3. Ship"
            body="Replace the placeholder copy and start adding your product modules inside the /saas area."
          />
        </section>
      </div>
    </div>
  );
}

function StepCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-sm font-semibold text-slate-50">{title}</p>
      <p className="mt-2 text-xs text-slate-400">{body}</p>
    </div>
  );
}
