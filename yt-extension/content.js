// content.js

const STORAGE_EMAIL_KEY = "ytscale_user_email";

function getStoredUserEmail() {
  return new Promise((resolve) => {
    if (!chrome.storage || !chrome.storage.sync) {
      resolve(null);
      return;
    }

    chrome.storage.sync.get([STORAGE_EMAIL_KEY], (result) => {
      resolve(result[STORAGE_EMAIL_KEY] || null);
    });
  });
}

const SUPABASE_FUNCTION_URL =
  "https://vzgehyyounqqnzjlvaxj.supabase.co/functions/v1/clever-handler";

// ⚠️ remplace ceci par ta vraie anon key Supabase (clé PUBLIC, pas service_role)
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Z2VoeXlvdW5xcW56amx2YXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTQ2NTAsImV4cCI6MjA3ODAzMDY1MH0.bgv9T4svLYROFlwybYrP2Jiu0RaU8tpy7X0c-dKHgXQ";


function onYouTubePageReady(callback) {
  window.addEventListener("yt-navigate-finish", () => {
    setTimeout(callback, 1000);
  });

  // Cas d'un rechargement normal
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(callback, 1000);
  } else {
    window.addEventListener("DOMContentLoaded", () => setTimeout(callback, 1000));
  }
}


// --- récup ID vidéo ---
function getVideoId() {
  const url = new URL(window.location.href);
  if (url.pathname.startsWith("/shorts/"))
    return url.pathname.split("/shorts/")[1].split(/[/?]/)[0];
  return url.searchParams.get("v");
}

// --- type contenu ---
function getContentType() {
  const url = new URL(window.location.href);
  return url.pathname.startsWith("/shorts/") ? "short" : "longform";
}

// --- récupérer titre ---
function getVideoTitle() {
  const selectors = [
    "h1.title",
    "h1.ytd-watch-metadata",
    "ytd-watch-metadata h1",
    "#title h1"
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim()) return el.innerText.trim();
  }
  return "";
}

// --- récupérer description ---
function getVideoDescription() {
  const selectors = [
    "#description yt-formatted-string",
    "ytd-watch-metadata #description",
    "ytd-expander #description",
    "#description",
    "ytd-text-inline-expander yt-formatted-string"
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim()) return el.innerText.trim();
  }
  return "";
}

// --- parse vues ---
function parseViewsText(text) {
  text = text
    .toLowerCase()
    .replace(/vues?|views?/g, "")
    .replace(/de/g, "")
    .trim()
    .replace(/\u00A0/g, " ");

  const match = text.match(/([\d.,\s]+)\s*([kmb])?/i);
  if (!match) return null;

  let numStr = match[1].trim().replace(/\s/g, "");
  const suffix = match[2]?.toLowerCase() || null;

  if (numStr.includes(",") && !numStr.includes(".")) {
    numStr = numStr.replace(",", ".");
  } else {
    numStr = numStr.replace(/,/g, "");
  }

  let num = Number(numStr);
  if (isNaN(num)) return null;

  if (suffix === "k") num *= 1000;
  if (suffix === "m") num *= 1_000_000;
  if (suffix === "b") num *= 1_000_000_000;

  return Math.round(num);
}

function getViewsFromDom() {
  const selectors = [
    "span.view-count",
    "yt-formatted-string.view-count",
    "#info #info-text yt-formatted-string",
    "ytd-watch-metadata #info-text yt-formatted-string"
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim()) {
      return parseViewsText(el.innerText.trim());
    }
  }

  return null;
}

// --- UI panneau ---
// Inject panel inside YouTube suggestions (replace first video)
function insertPanelInSuggestions(panel) {
  function tryInsert() {
    const suggestions = document.querySelector("#secondary #related");

    if (!suggestions) {
      // YouTube charge parfois les suggestions en retard → retry
      setTimeout(tryInsert, 300);
      return;
    }

    const firstVideo = suggestions.querySelector("ytd-compact-video-renderer");

    if (firstVideo) {
      suggestions.insertBefore(panel, firstVideo);
    } else {
      suggestions.prepend(panel);
    }
  }

  tryInsert();
}

// --- UI panneau intégré YouTube ---
function createOrUpdatePanel(data) {
  let panel = document.getElementById("rpm-panel");

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "rpm-panel";

    // Style similaire aux cartes YouTube
    panel.style.background = "#1f1f1f";
    panel.style.borderRadius = "12px";
    panel.style.padding = "16px";
    panel.style.marginBottom = "12px";
    panel.style.width = "100%";
    panel.style.boxSizing = "border-box";
    panel.style.fontFamily = "Roboto, Arial, sans-serif";
    panel.style.color = "white";
    panel.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
    panel.style.transition = "all 0.2s ease";
    panel.style.fontSize = "13px";
    panel.style.lineHeight = "1.45";

    // Insérer dans les suggestions
    insertPanelInSuggestions(panel);
  }

  if (!data) {
    panel.innerHTML = `<strong>Analyse en cours…</strong>`;
    return;
  }

  if (data.error) {
    panel.innerHTML = `
      <div style="color:#ff6b6b;"><strong>Erreur :</strong> ${data.error}</div>
    `;
    return;
  }

  panel.innerHTML = `
    <div style="font-size:16px; font-weight:700; margin-bottom:10px;">
      Estimation revenus YouTube
    </div>

    <span style="
      background:#2b6eff;
      padding:4px 8px;
      border-radius:6px;
      font-size:12px;
      font-weight:600;
    ">
      ${data.niche.toUpperCase()}
    </span>

    <div style="margin:10px 0; opacity:0.85;">
      Vues analysées : <strong>${data.views.toLocaleString("fr-FR")}</strong>
    </div>

    <div style="margin-top:10px;">
      <div style="font-weight:600; margin-bottom:4px;">RPM (€/1000 vues)</div>
      Bas : <strong>${data.rpm.low.toFixed(2)}€</strong><br>
      Milieu : <strong>${data.rpm.mid.toFixed(2)}€</strong><br>
      Haut : <strong>${data.rpm.high.toFixed(2)}€</strong>
    </div>

    <div style="margin-top:12px;">
      <div style="font-weight:600; margin-bottom:4px;">Revenus estimés</div>
      Bas : <strong>${data.revenue.low.toFixed(2)}€</strong><br>
      Milieu : <strong>${data.revenue.mid.toFixed(2)}€</strong><br>
      Haut : <strong>${data.revenue.high.toFixed(2)}€</strong>
    </div>
  `;
}


// --- APPEL SUPABASE (détection niche + RPM) ---
async function fetchEstimation(payload) {
  createOrUpdatePanel(null);

  try {
    const email = await getStoredUserEmail();

    if (!email) {
      createOrUpdatePanel({
        error:
          "Extension non connectée. Va sur yt.scale, connecte-toi puis clique sur “Connecter l’extension”.",
      });
      return;
    }

    const res = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "x-user-email": email, // 👈 on envoie l’email de session
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error("Erreur Supabase:", data);
      createOrUpdatePanel({
        error:
          data.error === "NO_SUBSCRIPTION"
            ? "Ton abonnement YTScale n’est plus actif."
            : "Erreur API (" + (data.error || res.status) + ")",
      });
      return;
    }

    createOrUpdatePanel(data);
  } catch (e) {
    console.error("Erreur fetch Supabase:", e);
    createOrUpdatePanel({ error: "Erreur réseau" });
  }
}


// --- Fonction principale ---
function runEstimator() {
  const videoId = getVideoId();

  if (!videoId) {
    console.log("[RPM Estimator] Pas encore de vidéo, retry...");
    setTimeout(runEstimator, 500);
    return;
  }

  const title = getVideoTitle() || "";
  const description = getVideoDescription() || "";
  const views = getViewsFromDom() || 100000;
  const contentType = getContentType();
  const countryTier = "tier1";

  console.log("[RPM Estimator] vidéo détectée", {
    videoId,
    title,
    views,
    contentType
  });

  fetchEstimation({
    videoId,
    title,
    description,
    views,
    content_type: contentType,
    country_tier: countryTier
  });
}

// --- Détection navigation interne YouTube (SPA) ---
function listenToYouTubeChanges() {
  // Quand YouTube charge une nouvelle vidéo sans recharger la page
  window.addEventListener("yt-navigate-finish", () => {
    console.log("[RPM Estimator] yt-navigate-finish → relance");
    setTimeout(runEstimator, 800);
  });

  // Quand les données de la page sont mises à jour
  window.addEventListener("yt-page-data-updated", () => {
    console.log("[RPM Estimator] yt-page-data-updated → relance");
    setTimeout(runEstimator, 800);
  });

  // MutationObserver fallback (au cas où)
  const observer = new MutationObserver(() => {
    const videoId = getVideoId();
    if (videoId && videoId !== window.__lastVideoId) {
      window.__lastVideoId = videoId;
      console.log("[RPM Estimator] MutationObserver → nouvelle vidéo", videoId);
      setTimeout(runEstimator, 800);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}



// Écoute toutes les navigations internes YouTube (SPA)
listenToYouTubeChanges();

// Premier lancement au cas où
setTimeout(runEstimator, 1500);

