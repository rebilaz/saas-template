import { redirect } from "next/navigation";

import ToolsNav from "@/components/layout/tools-nav";
import { hasProAccess } from "@/lib/access";
import { createSupabaseServer } from "@/lib/supabase/server";
import { GeistSans } from "geist/font/sans";

export default async function SaasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/pricing");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, subscription_status, trial_end")
    .eq("id", user.id)
    .single();

  if (error || !hasProAccess(profile)) redirect("/pricing");

  return (
    <div className={`${GeistSans.className} flex w-full min-h-screen`}>
      <aside
        className="
          hidden md:block
          fixed left-0 top-0
          h-screen
          w-64
          border-r border-slate-800
          bg-slate-950/80
          z-40
          overflow-y-auto
        "
      >
        <ToolsNav />
      </aside>

      <main className="flex-1 md:ml-64 px-6 lg:px-10 py-10">{children}</main>
    </div>
  );
}
