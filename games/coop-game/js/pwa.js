let deferredInstallPrompt = null;

function setupPwa() {
  if (!dom.installButton) {
    return;
  }

  dom.installButton.hidden = true;
  dom.installButton.disabled = true;
  dom.installButton.title = "";
  dom.installButton.textContent = "Install";
  dom.installButton.addEventListener("click", promptInstall);

  if (location.protocol !== "file:" && window.isSecureContext && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  }

  if (isStandaloneMode()) {
    return;
  }

  if (isIosDevice()) {
    revealInstallButton("Safari: Add", true, "On iPhone or iPad, use Share > Add to Home Screen.");
    return;
  }

  if (location.protocol === "file:" || !window.isSecureContext) {
    revealInstallButton("Install via HTTPS", true, "To install the PWA, serve it from localhost or HTTPS.");
    return;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    revealInstallButton("Install", false, "Install the app on your phone.");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    dom.installButton.hidden = true;
  });
}

async function promptInstall() {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  dom.installButton.hidden = true;
}

function revealInstallButton(label, disabled, title) {
  dom.installButton.hidden = false;
  dom.installButton.disabled = disabled;
  dom.installButton.textContent = label;
  dom.installButton.title = title;
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
