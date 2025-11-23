// components/ConnectExtensionButton.tsx
"use client";

import { useSupabaseUser } from "@/lib/hooks/use-supabase-user";

export function ConnectExtensionButton() {
  const { user } = useSupabaseUser();

  if (!user?.email) return null;

  const handleClick = () => {
    // envoie un message au content script "site-bridge.js"
    window.postMessage(
      {
        type: "YTSCALE_CONNECT_EXTENSION",
        email: user.email,
      },
      window.location.origin
    );

    alert("Si l’extension YTScale est installée, elle vient d’être connectée ✅");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400"
    >
      Connecter l’extension à ce compte
    </button>
  );
}
