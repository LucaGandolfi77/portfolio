/* ═══════════════ MONETIZATION ═══════════════ */
/* Freemium: Free demo Zona 1 + Full Game $4.99 */

const STORAGE_KEY = "echoes_purchases";

const PRODUCTS = {
  fullGame: { id: "com.lucagandolfi.echoes.fullgame", price: "$4.99", label: { it: "Gioco Completo", en: "Full Game" } },
  noAds: { id: "com.lucagandolfi.echoes.noads", price: "$2.99", label: { it: "Nessuna Pubblicità", en: "No Ads" } }
};

function loadPurchases() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function savePurchases(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function isFullGame() {
  return !!loadPurchases().fullGame;
}

export function isNoAds() {
  return !!loadPurchases().noAds;
}

export function unlockFullGame() {
  const p = loadPurchases();
  p.fullGame = true;
  savePurchases(p);
}

export function unlockNoAds() {
  const p = loadPurchases();
  p.noAds = true;
  savePurchases(p);
}

export function restorePurchases() {
  // In Capacitor, this would call Store.restorePurchases()
  // For web, just return current state
  return loadPurchases();
}

export function isZoneUnlocked(zoneIndex) {
  // Zone 0 (La Soglia) is always free
  if (zoneIndex <= 0) return true;
  // Zones 1-4 require full game
  return isFullGame();
}

export function canAccessFeature(feature) {
  switch (feature) {
    case "save": return true; // Always free
    case "audio": return true; // Always free
    case "allZones": return isFullGame();
    case "noAds": return isNoAds();
    default: return true;
  }
}

/* ─── Purchase overlay ─── */
export function showPurchaseOverlay(zoneIndex, lang = "it") {
  return new Promise((res) => {
    const existing = document.getElementById("purchase-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "purchase-overlay";
    overlay.className = "purchase-overlay";

    const title = lang === "en" ? "Full Game Required" : "Gioco Completo Richiesto";
    const desc = lang === "en"
      ? `Zone ${zoneIndex + 1} is part of the full game. Unlock all 5 zones, 5 bosses, 3 endings, and 8 NPCs with bonus skills.`
      : `La Zona ${zoneIndex + 1} fa parte del gioco completo. Sblocca tutte le 5 zone, 5 boss, 3 finali e 8 NPC con skill bonus.`;
    const buyLabel = lang === "en" ? "Unlock Full Game — $4.99" : "Sblocca Gioco Completo — $4.99";
    const restoreLabel = lang === "en" ? "Restore Purchases" : "Ripristina Acquisti";
    const laterLabel = lang === "en" ? "Later" : "Più tardi";

    overlay.innerHTML = `
      <div class="purchase-card">
        <h2>${title}</h2>
        <p>${desc}</p>
        <button class="btn primary big" id="buy-fullgame">${buyLabel}</button>
        <button class="btn" id="restore-purchases">${restoreLabel}</button>
        <button class="btn small" id="purchase-later">${laterLabel}</button>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("buy-fullgame").addEventListener("click", () => {
      unlockFullGame();
      overlay.remove();
      res(true);
    });

    document.getElementById("restore-purchases").addEventListener("click", () => {
      restorePurchases();
      if (isFullGame()) {
        overlay.remove();
        res(true);
      }
    });

    document.getElementById("purchase-later").addEventListener("click", () => {
      overlay.remove();
      res(false);
    });
  });
}
