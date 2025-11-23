// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// petit helper pour lire le cookie redirect_after_login
function getRedirectCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const redirectCookie = cookies.find((c) =>
    c.startsWith("redirect_after_login=")
  );
  if (!redirectCookie) return null;

  const value = redirectCookie.split("=").slice(1).join("=");
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // 1) redirect_to éventuel dans l'URL
  const redirectFromQuery = requestUrl.searchParams.get("redirect_to");

  // 2) redirect_from cookie posé avant l'envoi du mail
  const redirectFromCookie = getRedirectCookie(request);

  // priorité : query > cookie > /saas
  let redirectToParam = redirectFromQuery ?? redirectFromCookie ?? "/saas";

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/login`);
  }

  const supabase = await createSupabaseServer();

  // échange code → session
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=auth`);
  }

  // user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${requestUrl.origin}/login`);
  }

  // profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, subscription_status")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const hasPaid =
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing";

  let finalRedirect = redirectToParam;

  // 🔥 4) Si admin / déjà abonné → JAMAIS stripe
  if (isAdmin || hasPaid) {
    finalRedirect = "/saas";
  }
  // 🔥 5) Si free user mais il vient simplement se connecter → pas de checkout
  else if (!redirectToParam.startsWith("/start-checkout")) {
    finalRedirect = "/saas";
  }

  const response = NextResponse.redirect(`${requestUrl.origin}${finalRedirect}`);

  // 🧹 on supprime le cookie redirect_after_login
  response.headers.append(
    "Set-Cookie",
    "redirect_after_login=; Path=/; Max-Age=0; SameSite=Lax"
  );

  return response;
}
