/* ═══════════════════════════════════════════════════════════════════
   WebLinux — app.js
   Collega xterm.js (UI terminale) con v86 (macchina virtuale x86/Wasm).
   Tutto avviene nel browser: nessun server di backend.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
"use strict";

/* ────────────────────────────────────────────────────────────────
   1. RISORSE BINARIE DA CDN PUBBLICI (zero file da scaricare in locale)

   • libv86.js + v86.wasm  → pacchetto npm ufficiale "v86"
                             https://www.jsdelivr.com/package/npm/v86
   • seabios.bin/vgabios   → repo GitHub ufficiale di v86 (cartella bios/)
                             https://github.com/copy/v86/tree/master/bios
   • linux.iso             → immagine Linux Buildroot ~5.6MB con shell
                             BusyBox: permette di eseguire comandi veri,
                             creare file/script su tmpfs.
                             https://github.com/copy/images

   ALTERNATIVE (se vuoi un'altra distro):
   - Alpine reale: non esiste su CDN un'immagine ext2 pronta; puoi
     costruirtela seguendo https://docs.google.com/document/d/1eXfS8cLddB2S8ED/y
     oppure la guida ufficiale v86 docs/linux-9p-image.md, poi pubblicare
     l'immagine e sostituire URL_ISO qui sotto.
   - Qualsiasi ISO x86 bootabile (<50MB) funziona al posto di linux.iso.
   ──────────────────────────────────────────────────────────────── */
var VER      = "0.5.441";
var CDN_V86  = "https://cdn.jsdelivr.net/npm/v86@" + VER + "/build/";
var URL_WASM = CDN_V86 + "v86.wasm";                                            // motore CPU in Wasm
var URL_BIOS = "https://cdn.jsdelivr.net/gh/copy/v86@master/bios/seabios.bin";  // BIOS open-source
var URL_VGAB = "https://cdn.jsdelivr.net/gh/copy/v86@master/bios/vgabios.bin";  // BIOS video
var URL_ISO  = "https://cdn.jsdelivr.net/gh/copy/images@master/linux.iso";      // OS guest

var RAM_MB = 128;   // RAM della VM: 96-128 ok per Buildroot sul telefono

/* ────────────────────────────────────────────────────────────────
   2. RIFERIMENTI AL DOM
   ──────────────────────────────────────────────────────────────── */
var $ = function (id) { return document.getElementById(id); };
var elTerm   = $("terminal");
var elLoader = $("loader"), elMsg = $("load-msg"), elFile = $("load-file"),
    elBar    = $("bar"),     elErr = $("load-error");
var elDot    = $("vm-dot"), elLabel = $("vm-label");

function setStatus(kind, label) {
  elDot.className = kind;
  elLabel.textContent = label;
}
function showLoader(msg) { elMsg.textContent = msg; elLoader.classList.remove("done"); }
function hideLoader()    { elLoader.classList.add("done"); }

/* ────────────────────────────────────────────────────────────────
   3. XTERM.JS — il terminale visibile
   ──────────────────────────────────────────────────────────────── */
var fitAddon = new FitAddon.FitAddon();
var term = new Terminal({
  cursorBlink: true,
  fontSize: 15,
  fontFamily: '"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace',
  scrollback: 2000,
  theme: {
    background: "#0b0e14",
    foreground: "#d4d9e3",
    cursor: "#22d3ee",
    selectionBackground: "rgba(124,92,255,.35)",
    black: "#10141f", red: "#ff453a",  green: "#32d74b", yellow: "#ffd60a",
    blue:  "#0a84ff", magenta:"#bf5af2", cyan:  "#64d2ff", white: "#eef1f8"
  }
});
term.loadAddon(fitAddon);
term.open(elTerm);
fit();

/* Ri-adatta il terminale a ogni resize (anche rotazione iPhone e
   comparsa/sparizione della barra URL di Safari). */
window.addEventListener("resize", fit);
if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
function fit() { try { fitAddon.fit(); } catch (e) {} }

term.writeln("\x1b[1;36m  WebLinux\x1b[0m \x1b[90m· Linux x86 reale in WebAssembly\x1b[0m");
term.writeln("\x1b[90m  Download di kernel+BIOS in corso… la prima volta richiede qualche secondo.\x1b[0m");
term.writeln("");

/* ────────────────────────────────────────────────────────────────
   4. V86 — la macchina virtuale
   ──────────────────────────────────────────────────────────────── */
var EmuClass = window.V86 || window.V86Starter;  // compat versioni vecchie della libreria
var emulator = null;

setStatus("loading", "download");

try {
  emulator = new EmuClass({
    wasm_path:        URL_WASM,
    screen_container: $("screen-container"),
    autostart:        true,
    memory_size:      RAM_MB * 1024 * 1024,
    vga_memory_size:  8 * 1024 * 1024,
    disable_speaker:  true,

    /* File del sistema ospite (guest) */
    bios:     { url: URL_BIOS },
    vga_bios: { url: URL_VGAB },
    cdrom:    { url: URL_ISO }

    /* RETWORKING OPZIONALE: decommenta per abilitare la rete nella VM
       tramite relay WebSocket pubblico (ping ~alto, ma wget/ping funzionano)
       network_relay_url: "wss://relay.widgetry.org/"               */
  });
} catch (err) {
  bootError("Impossibile creare l'emulatore: " + err.message);
}

/* Progress del download dei binari (wasm/bios/iso) */
if (emulator) emulator.add_listener("download-progress", function (e) {
  var pct = (e.lengthComputable && e.total) ? Math.round(e.loaded / e.total * 100) : 0;
  elBar.style.width = pct + "%";
  elFile.textContent = e.file_name || "";
  showLoader(pct ? "Scaricamento… " + pct + "%" : "Scaricamento…");
});

/* Errore di rete su uno dei file */
if (emulator) emulator.add_listener("download-error", function (e) {
  bootError("Download fallito: " + (e.file_name || "file") +
            "\nControlla la connessione e ricarica la pagina.");
});

/* Il guest è pronto ad avviare il kernel */
if (emulator) emulator.add_listener("emulator-ready", function () {
  elBar.style.width = "100%";
  showLoader("Avvio del kernel Linux…");
  setStatus("loading", "boot");
});

/* ────────────────────────────────────────────────────────────────
   5. PONTE SERIALE ⇄ XTERM
   La console del guest è su ttyS0 (seriale): ogni byte che il
   sistema scrive arriva all'evento "serial0-output-byte", ogni
   tasto premuto in xterm viene inviato con serial0_send().
   ──────────────────────────────────────────────────────────────── */
var sBuf = [], sTimer = null, firstByte = false;

function pumpSerial() {                       /* raggruppa i byte in frame ~16ms */
  sTimer = null;
  if (sBuf.length) { term.write(Uint8Array.from(sBuf)); sBuf = []; }
}
if (emulator) emulator.add_listener("serial0-output-byte", function (byte) {
  sBuf.push(byte);
  if (!sTimer) sTimer = setTimeout(pumpSerial, 16);

  if (!firstByte) {                           /* primo output ⇒ la VM vive! */
    firstByte = true;
    setStatus("ready", "online");
    hideLoader();
    term.write("\x1b[32m  ✔ Connesso alla macchina virtuale\x1b[0m\r\n\r\n");
  }
});

/* Input da tastiera (xterm normalizza già tasti speciali in sequenze VT) */
term.onData(function (data) {
  if (!emulator) return;
  /* Ctrl "a serratura": se attivo, la prossima lettera diventa un
     carattere di controllo (C → 0x03 = SIGINT, L → clear, …) */
  if (ctrlLock) {
    var c = data.charCodeAt(0);
    if (c >= 97 && c <= 122)      data = String.fromCharCode(c - 96);   // a-z
    else if (c >= 65 && c <= 90)  data = String.fromCharCode(c - 64);  // A-Z
    setCtrl(false);                                                     // si disattiva dopo l'uso
  }
  try { emulator.serial0_send(data); } catch (e) {}
});

/* ────────────────────────────────────────────────────────────────
   6. SOFT-KEYS TOUCH
   ──────────────────────────────────────────────────────────────── */
var ctrlLock = false;
function setCtrl(v) { ctrlLock = v; document.querySelector('[data-key="ctrl"]').classList.toggle("on", v); }

/* Gli attributi data-key contengono sequenze letterali tipo "\x1b[A":
   qui le decodifico nei veri caratteri di controllo VT100. */
function decodeKey(s) {
  return s.replace(/\\x1b/g, "\x1b").replace(/\\t/g, "\t");
}

document.querySelectorAll("#softkeys .key[data-key]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var k = btn.dataset.key;
    if (k === "ctrl") { setCtrl(!ctrlLock); return; }   // serratura on/off
    sendRaw(decodeKey(k));
    term.focus();
  });
});

/* Il tasto "Tastiera" apre la tastiera del telefono: term.focus()
   deve stare DENTRO il gesture handler per funzionare su iOS. */
$("btn-kbd").addEventListener("click", function () { term.focus(); });

/* Tap sull'area terminale ⇒ focus (riapre la tastiera su mobile) */
$("stage").addEventListener("click", function () { term.focus(); });

function sendRaw(str) { if (emulator) { try { emulator.serial0_send(str); } catch (e) {} } }

/* Desktop scorciatoie extra: Esc chiude il pannello VGA, F9 mostra/nasconde
   la barra dei tasti touch (utile su notebook per avere più spazio). */
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") $("vga-overlay").classList.add("hidden");
  if (e.key === "F9")     $("softkeys").classList.toggle("hidden");
});

/* ────────────────────────────────────────────────────────────────
   7. FALLBACK CONSOLE VGA
   Se la seriale fosse muta (immagini diverse da linux.iso), si può
   vedere direttamente lo schermo virtuale testuale/grafico.
   ──────────────────────────────────────────────────────────────── */
$("btn-vga").addEventListener("click",  function () { $("vga-overlay").classList.remove("hidden"); });
$("vga-close").addEventListener("click", function () { $("vga-overlay").classList.add("hidden"); });

/* ────────────────────────────────────────────────────────────────
   8. GESTIONE ERRORI DI BOOT
   ──────────────────────────────────────────────────────────────── */
function bootError(msg) {
  setStatus("error", "errore");
  elErr.hidden = false;
  elErr.textContent = msg;
  elBar.style.width = "0%";
  showLoader("Si è verificato un errore");
}

})();
