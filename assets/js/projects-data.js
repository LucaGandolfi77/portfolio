// === PROJECTS DATA ===
// Estratti automaticamente da index.html

const PROJECTS_DATA = [
  {
    "id": "atlas",
    "title": "Atlas — Weather & Distance",
    "description": "Interactive weather map, 7-day forecast and GPS distance calculator. EN/IT, local-first.",
    "href": "projects/atlas/",
    "emoji": "🧭",
    "badge": "Data",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "payamazadi-mesh-p2p",
    "title": "Payamazadi — Mesh P2P",
    "description": "Rete mesh peer-to-peer via Bluetooth e WebRTC — demo di connessione tra pagine con ID univoci.",
    "href": "projects/payamazadi/index.html",
    "emoji": "🌐",
    "badge": "Mesh / P2P",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "tiny-local-ai",
    "title": "Tiny Local AI",
    "description": "Chat AI con modelli VERIFICATI contro Hugging Face e WebLLM (2026): Transformers.js con TinyStories 1M/3M, SmolLM2 135M/360M Instruct, Gemma 3 270M, LFM 2.5, Qwen 3/3.5 e Llama/Phi su WebGPU con fallback WASM — zero chiavi, zero server. Verifica modelli live, capability detection, chat multiple con export, streaming OpenRouter, WebLLM e backend avanzati, interfaccia liquid glass, EN/IT, PWA offline.",
    "href": "projects/tiny-ai/index.html",
    "emoji": "🤖",
    "badge": "Local AI",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "audio-transcriber",
    "title": "Audio Transcriber",
    "description": "Transcribe audio/video files to text using in-browser AI.",
    "href": "projects/audio-transcriber/index.html",
    "emoji": "🎙️",
    "badge": "AI Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "radio-player",
    "title": "Radio Player",
    "description": "Listen to curated internet radio stations directly in your browser. Search, play and visualize streams.",
    "href": "projects/radio/legacy-radio.html",
    "emoji": "📻",
    "badge": "Audio / Streaming",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "python-wrapper",
    "title": "Python Wrapper",
    "description": "CLI interface to run Python code and install lightweight packages in the browser.",
    "href": "pages/main/python.html",
    "emoji": "🐍",
    "badge": "Tool / CLI",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "universal-shop-scraper",
    "title": "Universal Shop Scraper",
    "description": "Client-side heuristic e-commerce scraper — export product lists to CSV.",
    "href": "projects/scraping/index.html",
    "emoji": "🧾",
    "badge": "Tool / Scraper",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "seconds-distance",
    "title": "Seconds Distance",
    "description": "Calculate the exact time difference in seconds between two dates.",
    "href": "projects/seconds-distance/index.html",
    "emoji": "⏱️",
    "badge": "Calculator",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "streaming",
    "title": "Streaming",
    "description": "Browser fluid-glass per film e archivi pubblici di Internet Archive: collezioni curate (Prelinger, NASA), filtro pubblico dominio, sort trending, coda di riproduzione, preferiti, cronologia con ripresa, Media Session, Picture-in-Picture, export link e PWA offline EN/IT.",
    "href": "projects/streaming/index.html",
    "emoji": "📺",
    "badge": "Video / Streams",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "sankey-generator",
    "title": "Sankey — diagrammi di flusso",
    "description": "Generatore interattivo di diagrammi Sankey dal vivo: esempi pronti (energia, budget, app), layout con slider (spessore, distanza, altezza, allineamento), palette moderne o personalizzate, focus al tocco su un nodo, tooltip, valori su nodi e flussi, export PNG/JPEG/SVG. Ottimizzato per iPhone.",
    "href": "projects/sankey/index.html",
    "emoji": "🌊",
    "badge": "Visual / Data",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "rsa-keygen",
    "title": "Laboratorio Crittografico",
    "description": "RSA passo-passo con visualizzazione del flusso (p, q, n, φ, e, d, cifra e decifra con numeri veri), generazione chiavi BigInt, firma/verifica SHA-256, AES-256-GCM con PBKDF2, cifrari classici (Cesare, Vigenère, XOR) e hash/HMAC (SHA-1…SHA-512). Solo educativo, in-browser, ottimizzato per iPhone.",
    "href": "projects/rsa/index.html",
    "emoji": "🔐",
    "badge": "Crypto",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "p2p-walkie-talkie",
    "title": "📻 P2P Walkie Talkie",
    "description": "Walkie talkie P2P in liquid glass: push-to-talk con mesh audio reale fra tutti gli operatori, messaggi rapidi, VU meter, lock TX, scelta dispositivo e server di segnalazione configurabile. EN/IT e PWA offline.",
    "href": "projects/walkietalkie/index.html",
    "emoji": "🎙️",
    "badge": "P2P Voice",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "vision-lab",
    "title": "Vision Lab — Face & Smile",
    "description": "Live 478-point face mesh, expression telemetry and a playful on-device smile analysis. EN/IT, no uploads.",
    "href": "projects/vision-lab/",
    "emoji": "🪞",
    "badge": "AI / AR",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "camera-jpeg-compression-preview",
    "title": "Camera — JPEG Compression Preview",
    "description": "Capture a photo and compare JPEG compressions with file sizes; download variants.",
    "href": "projects/camera-compression/index.html",
    "emoji": "📷",
    "badge": "Camera / Tools",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "camera-sentinel",
    "title": "CAM//LAB — Camera & Privacy Diagnostics",
    "description": "Demo didattica su permessi e fotocamere locali nel browser: diagnostica degli errori, elenco dispositivi, analisi sperimentale delle luci e COCO-SSD per oggetti generici. I frame restano sul dispositivo. Spiega i limiti reali del browser e non è un rilevatore certificato di telecamere.",
    "href": "projects/camera-sentinel/index.html",
    "emoji": "🔬",
    "badge": "Privacy / Lab",
    "badgeColor": "#35e0ff"
  },
  {
    "id": "face-compare-ai",
    "title": "Face Compare AI",
    "description": "Confronta due volti on-device con MediaPipe: allineamento, descrittori e similarità, senza upload.",
    "href": "projects/face-compare/index.html",
    "emoji": "🎭",
    "badge": "AI · On-device",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "armochromy-ai",
    "title": "Armochromy AI",
    "description": "Discover your seasonal color palette based on your features.",
    "href": "projects/armochromy/index.html",
    "emoji": "🎨",
    "badge": "AI / Style",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "fruit-eater",
    "title": "Fruit Eater",
    "description": "Catch falling fruits with your mouth using AI!",
    "href": "projects/mesh-camera2/index.html",
    "emoji": "🍎",
    "badge": "Game / AI",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "morse-converter",
    "title": "Morse Converter",
    "description": "Convertitore Morse moderno: conversione live, decodifica anche senza spazi, player audio con WPM/frequenza/volume, oscilloscopio, export WAV e TXT, tabella filtrabile e allenamento con flashcard, dettato e speed run. PWA offline EN/IT.",
    "href": "projects/morse/index.html",
    "emoji": "🔤",
    "badge": "Utility",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "longest-midi",
    "title": "Longest MIDI",
    "description": "Analizza file .mid/.midi: durata esatta, statistiche, partitura e piano roll con riproduzione audio.",
    "href": "projects/longest-midi/index.html",
    "emoji": "🎵",
    "badge": "Audio / Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "universal-reader",
    "title": "Universal Reader",
    "description": "Text-to-speech tool for EPUBs.",
    "href": "projects/reader/index.html",
    "emoji": "🗣️",
    "badge": "Accessibility",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "iqos-timer",
    "title": "IQOS Timer",
    "description": "Track IQOS sessions.",
    "href": "projects/iqos-timer/index.html",
    "emoji": "⏱️",
    "badge": "Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "pixel-draw",
    "title": "Pixel Draw",
    "description": "Draw on a resizable pixel canvas (16x16, 32x32 or custom). Pinch to zoom and use two fingers to pan on touch devices.",
    "href": "projects/draw/index.html",
    "emoji": "🎨",
    "badge": "Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "fashion-detector",
    "title": "Fashion Detector",
    "description": "Upload a photo to classify clothing/shoes using a Hugging Face zero-shot CLIP model (requires your HF token).",
    "href": "projects/fashion-detect/index.html",
    "emoji": "🛍️",
    "badge": "AI Demo",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "bodyweight-timer",
    "title": "Bodyweight Timer",
    "description": "Workout companion timer.",
    "href": "projects/workout/index.html",
    "emoji": "💪",
    "badge": "Health",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "sierpinski-explorer",
    "title": "Sierpinski Explorer",
    "description": "Fractal Observatory: 11 frattali con parametri creativi (skew, twist, jitter, simmetria, glow), chaos game potenziato, render neon con blend, animazione, export PNG/SVG, preset e UI mobile. PWA offline EN/IT.",
    "href": "projects/sierpinski/index.html",
    "emoji": "📐",
    "badge": "Math",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "people-simulator",
    "title": "People Simulator",
    "description": "Simulatore agent-based di una giornata negli USA: 3 coorti con transizioni Markov orarie, eventi (neve, caldo, festività, blackout), metriche emergenti (felicità, traffico, energia, produttività), mappa coropleta con zoom, confronto tra stati, timeline 24h e scenario editor. Mappa e dati vendoriati: funziona offline. EN/IT, PWA, zero CDN.",
    "href": "projects/people-simulator/index.html",
    "emoji": "👥",
    "badge": "Data",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "ar-tracker",
    "title": "AR Tracker",
    "description": "A modern camera PWA with 19 live filters, AI vision, voice subtitles and an offline photo gallery.",
    "href": "projects/tracker/legacy-tracker.html",
    "emoji": "📷",
    "badge": "AR",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "kinect-game",
    "title": "Kinect Game",
    "description": "Hand-tracking arcade with gesture controls, WebGL2 graphics and offline PWA.",
    "href": "projects/kinect/index.html",
    "emoji": "🎮",
    "badge": "AR",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "hand-tracker",
    "title": "Hand Tracker",
    "description": "Simplified hand tracking tool.",
    "href": "projects/kinect-2/index.html",
    "emoji": "✋",
    "badge": "AI",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "air-canvas",
    "title": "Air Canvas",
    "description": "Draw in the air using your finger.",
    "href": "projects/air-canvas/index.html",
    "emoji": "🎨",
    "badge": "Creative",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "rock-paper-scissors",
    "title": "Rock Paper Scissors",
    "description": "Challenge the AI with gestures.",
    "href": "projects/rock-paper-scissors/index.html",
    "emoji": "✊",
    "badge": "Game",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "virtual-puppeteer",
    "title": "Virtual Puppeteer",
    "description": "Turn your hand into a puppet.",
    "href": "projects/virtual-puppeteer/index.html",
    "emoji": "🎭",
    "badge": "Fun",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "virtual-drums",
    "title": "Virtual Drums",
    "description": "Play drums in the air.",
    "href": "projects/virtual-drums/index.html",
    "emoji": "🥁",
    "badge": "Music",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "qr-studio",
    "title": "QR Studio — Scan & Create",
    "description": "Scan and design QR codes for links, Wi-Fi, contacts and events. Offline, local-first.",
    "href": "projects/qr-studio/",
    "emoji": "🔳",
    "badge": "Utility",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "3d-bird-flocking",
    "title": "3D Bird Flocking",
    "description": "3D bird flocking simulation.",
    "href": "projects/birds/index.html",
    "emoji": "🐦",
    "badge": "Sim",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "crochet-simulator",
    "title": "Crochet Simulator",
    "description": "Interactive crochet learning tool.",
    "href": "projects/croquet/index.html",
    "emoji": "🧶",
    "badge": "Sim",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "lyrics-search",
    "title": "Reverse Lyrics Finder",
    "description": "Incolla una frase di una canzone e trova il brano: anteprime audio 30s (iTunes), testo completo con la frase evidenziata (Lyrics.ovh), link Genius/Apple Music, copy & share. PWA-friendly, iPhone + desktop.",
    "href": "projects/lyrics-finder/index.html",
    "emoji": "🎵",
    "badge": "Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "nba-simulator-2k26",
    "title": "NBA Broadcast Simulator",
    "description": "30-team tactics simulator with real player stats, 3D player cards, franchise mode and offline PWA.",
    "href": "projects/nba_simulator/index.html",
    "emoji": "🏀",
    "badge": "Sim",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "royal-derby-sim",
    "title": "Royal Derby Sim",
    "description": "The Royal Derby — corse ippiche in stile regale inglese con scommesse Win/Place/Each-way/Forecast, meteo e terreno, tre ippodromi, paddock con jockey e silks, classifica stagionale e un fotofinish 3D in replay con Three.js. Interfaccia bilingue IT/EN, audio e export PNG.",
    "href": "projects/horse-simulator/index.html",
    "emoji": "🏇",
    "badge": "Sim · 3D",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "serie-a-simulator",
    "title": "Serie A Simulator",
    "description": "Simulatore di partite di Serie A 2025/26 con commento live, statistiche avanzate (xG, possesso, tiri, parate, falli, corner, fuorigioco), VAR, rigori, cartellini, legni, voti dei giocatori, migliore in campo, formazioni e risultato condivisibile. Rose e squadre aggiornate alla stagione 2025/26 (promosse: Sassuolo, Pisa, Cremonese). Ottimizzato per iPhone.",
    "href": "projects/seriea-simulator/index.html",
    "emoji": "⚽",
    "badge": "Sim",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "fantapanchina",
    "title": "FantaPanchina",
    "description": "Il fantacalcio che gioca da solo. Idle game con squadre parodiche, bauli da aprire, 48 carte da collezionare, doppioni da potenziare e un mercante che simula altri fantallenatori online. Mercato svincolati, bidoni leggendari, telecronaca da bar, scudetti d'oro e guadagni offline. PWA installabile.",
    "href": "projects/fantapanchina/index.html",
    "emoji": "🛋️",
    "badge": "Game",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "vite-carrere",
    "title": "VITE — Emmanuel Carrère",
    "description": "Un viaggio attraverso le 8 vite di Emmanuel Carrère: 8 capitoli-libro con narrazione, citazioni autentiche e 8 minigiochi tematici. Dalle origini russe a L'Avversario, da Vite che non sono la mia al finale toccante. PWA narrativa installabile.",
    "href": "projects/vite-carrere/index.html",
    "emoji": "📖",
    "badge": "Story",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "slot-builder-game",
    "title": "Slot Builder Game",
    "description": "Build your deck and spin to win.",
    "href": "games/slot-collect/index.html",
    "emoji": "🎰",
    "badge": "Game",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "text-lab",
    "title": "Text Lab — OCR & Scan",
    "description": "Extract editable text from pages and photos with local OCR. Camera, drag & drop, EN/IT.",
    "href": "projects/text-lab/",
    "emoji": "🔤",
    "badge": "AI",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "ai-colorizer",
    "title": "AI Colorizer",
    "description": "Colorize B&W photos using Deep Learning.",
    "href": "projects/ai-colorizer/index.html",
    "emoji": "🎨",
    "badge": "AI",
    "badgeColor": "#00d4ff"
  },
    {
    "id": "coloring-book",
    "title": "Coloring Studio",
    "description": "Interactive coloring studio with 70+ original drawings across animals, nature, food, vehicles, ocean, fantasy, space and celebrations. Includes category filters, search, flood fill, brushes, photo outlining, undo/redo and PNG export.",
    "href": "projects/coloring/index.html",
    "emoji": "🎨",
    "badge": "Fun",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "nail-art-ar",
    "title": "Nail Art AR",
    "description": "Design nails and try them on in real-time.",
    "href": "projects/nails/index.html",
    "emoji": "💅",
    "badge": "AR",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "gba-emulator",
    "title": "GBA Emulator",
    "description": "Web-based Game Boy Advance emulator.",
    "href": "projects/gba-emulator/index.html",
    "emoji": "🎮",
    "badge": "Emu",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "quizzes",
    "title": "Quizzes",
    "description": "Short interactive quizzes — test your knowledge.",
    "href": "projects/quiz-lab/index.html",
    "emoji": "❓",
    "badge": "Quiz",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "daisy-field",
    "title": "Daisy Field",
    "description": "A beautiful field of daisies — enjoy the view.",
    "href": "projects/daisy-field/index.html",
    "emoji": "🌼",
    "badge": "Daisy Field",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "book-writer",
    "title": "Book Writer",
    "description": "AI-powered novel generator — create full books chapter by chapter with Ollama, OpenAI or Google AI.",
    "href": "projects/book-writer/index.html",
    "emoji": "📖",
    "badge": "AI Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "ai-chat-assistant",
    "title": "AI Chat Assistant",
    "description": "Chatbot AI client-side powered by Pollinations.ai — gratis, senza chiave API. Storia sessione e multilingua.",
    "href": "projects/ai-chat/index.html",
    "emoji": "🤖",
    "badge": "AI · Free API",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "e-commerce-platform",
    "title": "E-Commerce Platform",
    "description": "Demo e-commerce vanilla: catalogo prodotti, carrello e checkout con persistenza in localStorage.",
    "href": "projects/ecommerce/index.html",
    "emoji": "🛒",
    "badge": "E-Commerce",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "ios-file-manager",
    "title": "File Manager & Reader",
    "description": "Virtual file system with a Notepad++-style code viewer (.py, .cpp…), PDF reader and image preview — optimized for iPhone.",
    "href": "projects/file-manager/index.html",
    "emoji": "📁",
    "badge": "Utility / iOS",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "genetic-art",
    "title": "Genetic Art — Evoluzione Artistica",
    "description": "Disegna creature bioluminescenti e falli evolvere: crossover, mutazioni, fitness che impara il tuo gusto, albero genealogico 3D, diorama e suoni. Three.js + algoritmi genetici puri.",
    "href": "projects/genetic-art/legacy-genetic-art.html",
    "emoji": "🧬",
    "badge": "GA / Three.js",
    "badgeColor": "#00ffd0"
  },
  {
    "id": "tsne-3d",
    "title": "T-SNE 3D — Dispiegamento dei Dati",
    "description": "Carica un CSV e guarda i dati dispiegarsi in 3D: t-SNE in un Web Worker, perplexity/esagerazione regolabili, k-means con K ottimale, metriche di coerenza (silhouette, Davies-Bouldin, Calinski-Harabasz), time-lapse, 7 dataset, export PNG/JSON/CSV. Three.js vendoriato, interfaccia liquid glass, offline PWA, EN/IT.",
    "href": "projects/tsne-3d/index.html",
    "emoji": "🌌",
    "badge": "ML / 3D",
    "badgeColor": "#3ee6ff"
  },
  {
    "id": "face-lab",
    "title": "FACE LAB — Distortion Mirror",
    "description": "Live facial-landmark AI: 68 points trace your face in 3D with a holographic wireframe, real-time telemetry (blink, smile, head pose, emotion) and ten distortion modes (giant eyes, funhouse, fish-eye, emoji, cartoon, swirl, chromatic, pixelate, neon, squash) plus seven props (glasses, crown, mustache, hat, blush, beard, halo). MediaPipe + Three.js, on-device.",
    "href": "projects/face-lab/legacy-face-lab.html",
    "emoji": "👁️",
    "badge": "CV / AI",
    "badgeColor": "#ff5f9e"
  },
  {
    "id": "neural-flock",
    "title": "NEURAL FLOCK — Smart Swarm",
    "description": "A hypnotic 3D swarm of boids steered by a tiny neural network (19→28→3) trained live in your browser. Pick a target shape — heart, spiral, text, your drawing — and watch the flock learn to form it. Three.js + pure-JS AI.",
    "href": "projects/neural-flock/legacy-neural-flock.html",
    "emoji": "🕊️",
    "badge": "NN / Particles",
    "badgeColor": "#b28dff"
  },
  {
    "id": "alcohol-tracker",
    "title": "🍺 AlcoTracker — Tasso Alcolemico",
    "description": "Stima il tasso alcolemico con un modello a due compartimenti (assorbimento gastrico + eliminazione epatica) e la formula di Watson per l'acqua corporea: sesso, peso, altezza ed età. Aggiungi bevande e pasti con l'orario e il grafico mostra la curva alcolica con picco, tempo per tornare sotto il limite di 0.5 g/L e ora in cui sarai sobrio. Il pasto rallenta l'assorbimento dell'alcol ancora nello stomaco, abbassa e ritarda il picco, ma non accelera lo smaltimento. Doppia visuale: dashboard con grafico interattivo e timeline zoomabile (24/12/6/3 h) dove trascini cibo e bevande sull'orario, con ⭐ preferiti e selezione degli elementi. Metabolismo regolabile (0.10/0.15/0.20 g/L/h), unità alcoliche, PWA offline, ottimizzato per iPhone. ⚠️ Vietato ai minori di 18 anni.",
    "href": "projects/alcohol-tracker/index.html",
    "emoji": "🍺",
    "badge": "Health / Tool",
    "badgeColor": "#ffb84d"
  },
  {
    "id": "pocket-wild",
    "title": "POCKET WILD — Catch. Build. Mutate.",
    "description": "A 2D top-down creature-capture survival game à la Palworld: procedural biomes, throw spheres to catch geometric Pals, evolve, splice genes in the lab, fuse, build a base, fight Alpha bosses. Vanilla JS, zero assets, iPhone + desktop.",
    "href": "projects/pocket-wild/legacy-pocket-wild.html",
    "emoji": "🐾",
    "badge": "Game / Survival",
    "badgeColor": "#52ff9e"
  },
  {
    "id": "apollo-11-agc",
    "title": "APOLLO 11 — AGC Source & Simulator",
    "description": "Il codice sorgente originale del computer di guida dell'Apollo 11 (Apollo Guidance Computer): simulatore DSKY interattivo (verbi/nomi, programmi P01-P64 con telemetria), browser degli estratti autentici (Luminary099 / Comanche055) e casi d'uso. Wrapper educativo dal repository chrislgarry/apollo-11.",
    "href": "projects/apollo-11/index.html",
    "emoji": "🚀",
    "badge": "Engineering / Sim",
    "badgeColor": "#ff9f43"
  },
  {
    "id": "cello-browser",
    "title": "CelloOS — desktop 1994",
    "description": "Un desktop del 1994 nel browser: boot screen, icone, taskbar, Start menu, finestre trascinabili e sette app native. Il browser Cello naviga le 14 pagine del web inventato del 1994 (con suono modem sintetizzato e modalità \"Modem Live\" via r.jina.ai); Esplora file, Blocco note e Terminale usano un file system virtuale salvato in localStorage. Zero dipendenze, funziona offline come PWA.",
    "href": "projects/cello-browser/index.html",
    "icon": "🖥️",
    "emoji": "🖥️",
    "badge": "Sim",
    "badgeColor": "#ff9f43"
  },
  {
    "id": "cabriolo-5am",
    "title": "Cabriolo, 5:00",
    "description": "Fidenza, estate 2021. Visual novel interattiva: Luca, Thomas e Valentina salgono sulla collina di Cabriolo alle 5 di mattina per vedere l'alba, ascoltare musica e sentirsi immortali. 5 capitoli, 5 minigiochi, 4 finali multipli. PWA offline.",
    "href": "projects/cabriolo-5am/index.html",
    "emoji": "🌄",
    "badge": "Story / PWA",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "pi-pwa-wrapper",
    "title": "Pi Agent PWA — browser wrapper",
    "description": "A PWA shell around the Pi coding agent: streaming chat with tools (read/bash/edit), thinking blocks, model switching, image attachments and extension dialogs. Run the included Node server (npm install && npm start) so the agent can work in your workspaces; install the app for a standalone window.",
    "href": "projects/pi-pwa-wrapper/public/index.html",
    "emoji": "🤖",
    "badge": "AI / PWA",
    "badgeColor": "#6ea8ff"
  },
  {
    "id": "road-to-paraguay",
    "title": "Road to Paraguay ✨",
    "description": "Il diario segreto del Monza Precision Team verso i Campionati del Mondo di pattinaggio artistico a rotelle sincronizzato in Paraguay: una casella al giorno e un countdown fino al 17 ottobre. PWA installabile.",
    "href": "projects/road-to-paraguay/index.html",
    "emoji": "⛸️",
    "badge": "Story / PWA",
    "badgeColor": "#e8a2b8"
  },
  {
    "id": "cockpit-arena",
    "title": "Cockpit Arena",
    "description": "Gestisci un gallo stilizzato: allenalo, compragli l’equipaggiamento e portalo alla vittoria del campionato. Combattimenti a turni con timing Perfect/Good/Miss, scommesse con crediti virtuali (quote, squash, storico), simulazioni AI e sfida giornaliera. PWA offline, EN/IT, zero librerie.",
    "href": "projects/cock-fight/index.html",
    "emoji": "🐓",
    "badge": "Sim",
    "badgeColor": "#ff5d8f"
  }
];
