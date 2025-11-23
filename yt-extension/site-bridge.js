// site-bridge.js

const STORAGE_EMAIL_KEY = "ytscale_user_email";

window.addEventListener("message", (event) => {
  // On ne prend que les messages de la page elle-même
  if (event.source !== window) return;
  const msg = event.data;
  if (!msg || msg.type !== "YTSCALE_CONNECT_EXTENSION") return;

  const email = msg.email;
  if (typeof email !== "string" || !email) return;

  if (!chrome.storage || !chrome.storage.sync) {
    console.warn("[YTScale EXT] chrome.storage non dispo");
    return;
  }

  chrome.storage.sync.set({ [STORAGE_EMAIL_KEY]: email }, () => {
    console.log("[YTScale EXT] Email enregistré depuis le site :", email);
  });
});
