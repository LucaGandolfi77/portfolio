// === PROJECTS DATA ===
// Estratti automaticamente da index.html

const PROJECTS_DATA = [
  {
    "id": "world-weather-map",
    "title": "World Weather Map",
    "description": "Interactive world map with real-time weather data for any location.",
    "href": "projects/world_weather.html",
    "emoji": "🌍",
    "badge": "API / Map",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "payamazadi-mesh-p2p",
    "title": "Payamazadi — Mesh P2P",
    "description": "Rete mesh peer-to-peer via Bluetooth e WebRTC — demo di connessione tra pagine con ID univoci.",
    "href": "projects/payamazadi.html",
    "emoji": "🌐",
    "badge": "Mesh / P2P",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "tiny-local-ai",
    "title": "Tiny Local AI",
    "description": "Chat con modelli AI piccoli e allo stato dell'arte che girano DAVVERO nel browser: Transformers.js con 18 modelli verificati, inclusi i ⚡ ultra-tiny per iPhone (TinyStories 1M ≈ 15 MB, TinyStories 3M ≈ 22 MB, DistilGPT2 82M, SmolLM2 135M, Qwen 2.5 0.5B…) su WebGPU con fallback WASM — zero chiavi, zero server. In più Web-LLM/WebGPU (SmolLM2, Qwen 2.5/3/3.5, Llama 3.2, Phi, Gemma, DeepSeek R1…), OpenRouter cloud e server Flask locale.",
    "href": "projects/tiny_ai.html",
    "emoji": "🤖",
    "badge": "Local AI",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "audio-transcriber",
    "title": "Audio Transcriber",
    "description": "Transcribe audio/video files to text using in-browser AI.",
    "href": "projects/audio_transcriber.html",
    "emoji": "🎙️",
    "badge": "AI Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "radio-player",
    "title": "Radio Player",
    "description": "Listen to curated internet radio stations directly in your browser. Search, play and visualize streams.",
    "href": "projects/radio.html",
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
    "href": "projects/scraping.html",
    "emoji": "🧾",
    "badge": "Tool / Scraper",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "seconds-distance",
    "title": "Seconds Distance",
    "description": "Calculate the exact time difference in seconds between two dates.",
    "href": "projects/seconds_distance.html",
    "emoji": "⏱️",
    "badge": "Calculator",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "streaming",
    "title": "Streaming",
    "description": "Browse and play free video content and public TV archives from the Internet Archive and other public sources.",
    "href": "projects/streaming.html",
    "emoji": "📺",
    "badge": "Video / Streams",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "sankey-generator",
    "title": "Sankey — diagrammi di flusso",
    "description": "Generatore interattivo di diagrammi Sankey dal vivo: esempi pronti (energia, budget, app), layout con slider (spessore, distanza, altezza, allineamento), palette moderne o personalizzate, focus al tocco su un nodo, tooltip, valori su nodi e flussi, export PNG/JPEG/SVG. Ottimizzato per iPhone.",
    "href": "projects/sankey.html",
    "emoji": "🌊",
    "badge": "Visual / Data",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "rsa-keygen",
    "title": "Laboratorio Crittografico",
    "description": "RSA passo-passo con visualizzazione del flusso (p, q, n, φ, e, d, cifra e decifra con numeri veri), generazione chiavi BigInt, firma/verifica SHA-256, AES-256-GCM con PBKDF2, cifrari classici (Cesare, Vigenère, XOR) e hash/HMAC (SHA-1…SHA-512). Solo educativo, in-browser, ottimizzato per iPhone.",
    "href": "projects/RSA.html",
    "emoji": "🔐",
    "badge": "Crypto",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "p2p-walkie-talkie",
    "title": "📻 P2P Walkie Talkie",
    "description": "Secure, peer-to-peer voice chat using WebRTC. Push-to-talk functionality with retro interface.",
    "href": "projects/walkietalkie.html",
    "emoji": "🎙️",
    "badge": "AI Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "facemesh-camera",
    "title": "FaceMesh Camera",
    "description": "Real-time face tracking and mesh visualization.",
    "href": "projects/facemesh_camera.html",
    "emoji": "👤",
    "badge": "AI / AR",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "camera-jpeg-compression-preview",
    "title": "Camera — JPEG Compression Preview",
    "description": "Capture a photo and compare JPEG compressions with file sizes; download variants.",
    "href": "projects/camera_compression.html",
    "emoji": "📷",
    "badge": "Camera / Tools",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "camera-sentinel",
    "title": "CAM//SENTINEL — chi ti sta guardando?",
    "description": "Accende la fotocamera del dispositivo e analizza in tempo reale ciò che vede: LED a infrarossi e riflessi di lenti delle telecamere di sorveglianza attive, lampeggio dei LED di stato, e AI on-device (COCO-SSD) per i dispositivi che possono nascondere una camera. Rileva anche se la tua camera è già in uso da un'altra app (NotReadableError) ed elenca tutte le telecamere collegate. Spiega perché il browser NON può vedere le telecamere sulla rete e come lo farebbe un'app nativa.",
    "href": "projects/camera-sentinel.html",
    "emoji": "🕵️",
    "badge": "Camera / Tools",
    "badgeColor": "#ff5c7a"
  },
  {
    "id": "face-compare-ai",
    "title": "Face Compare AI",
    "description": "Compare your face with a reference image and visualize differences.",
    "href": "projects/face_compare.html",
    "emoji": "🎭",
    "badge": "AI Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "armochromy-ai",
    "title": "Armochromy AI",
    "description": "Discover your seasonal color palette based on your features.",
    "href": "projects/armochromy.html",
    "emoji": "🎨",
    "badge": "AI / Style",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "fruit-eater",
    "title": "Fruit Eater",
    "description": "Catch falling fruits with your mouth using AI!",
    "href": "projects/mesh_camera2.html",
    "emoji": "🍎",
    "badge": "Game / AI",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "morse-converter",
    "title": "Morse Converter",
    "description": "Convert text to Morse code.",
    "href": "projects/morse.html",
    "emoji": "🔤",
    "badge": "Utility",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "longest-midi",
    "title": "Longest MIDI",
    "description": "Analizza file .mid/.midi: durata esatta, statistiche, partitura e piano roll con riproduzione audio.",
    "href": "projects/longest_midi.html",
    "emoji": "🎵",
    "badge": "Audio / Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "universal-reader",
    "title": "Universal Reader",
    "description": "Text-to-speech tool for EPUBs.",
    "href": "projects/reader.html",
    "emoji": "🗣️",
    "badge": "Accessibility",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "iqos-timer",
    "title": "IQOS Timer",
    "description": "Track IQOS sessions.",
    "href": "projects/iqos_timer.html",
    "emoji": "⏱️",
    "badge": "Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "gps-distance",
    "title": "GPS Distance",
    "description": "Calculate distance between points.",
    "href": "projects/gps.html",
    "emoji": "🗺️",
    "badge": "Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "pixel-draw",
    "title": "Pixel Draw",
    "description": "Draw on a resizable pixel canvas (16x16, 32x32 or custom). Pinch to zoom and use two fingers to pan on touch devices.",
    "href": "projects/draw.html",
    "emoji": "🎨",
    "badge": "Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "fashion-detector",
    "title": "Fashion Detector",
    "description": "Upload a photo to classify clothing/shoes using a Hugging Face zero-shot CLIP model (requires your HF token).",
    "href": "projects/fashion_detect.html",
    "emoji": "🛍️",
    "badge": "AI Demo",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "bodyweight-timer",
    "title": "Bodyweight Timer",
    "description": "Workout companion timer.",
    "href": "projects/workout.html",
    "emoji": "💪",
    "badge": "Health",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "sierpinski-explorer",
    "title": "Sierpinski Explorer",
    "description": "Visualize fractal triangles.",
    "href": "projects/sierpinski.html",
    "emoji": "📐",
    "badge": "Math",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "people-simulator",
    "title": "People Simulator",
    "description": "US population statistics map.",
    "href": "projects/people_simulator.html",
    "emoji": "👥",
    "badge": "Data",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "ar-tracker",
    "title": "AR Tracker",
    "description": "Real-time camera filters.",
    "href": "projects/tracker.html",
    "emoji": "📷",
    "badge": "AR",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "kinect-game",
    "title": "Kinect Game",
    "description": "Interactive body tracking game.",
    "href": "projects/kinect.html",
    "emoji": "🎮",
    "badge": "AR",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "hand-tracker",
    "title": "Hand Tracker",
    "description": "Simplified hand tracking tool.",
    "href": "projects/kinect_2.html",
    "emoji": "✋",
    "badge": "AI",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "air-canvas",
    "title": "Air Canvas",
    "description": "Draw in the air using your finger.",
    "href": "projects/air_canvas.html",
    "emoji": "🎨",
    "badge": "Creative",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "rock-paper-scissors",
    "title": "Rock Paper Scissors",
    "description": "Challenge the AI with gestures.",
    "href": "projects/rock_paper_scissors.html",
    "emoji": "✊",
    "badge": "Game",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "virtual-puppeteer",
    "title": "Virtual Puppeteer",
    "description": "Turn your hand into a puppet.",
    "href": "projects/virtual_puppeteer.html",
    "emoji": "🎭",
    "badge": "Fun",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "virtual-drums",
    "title": "Virtual Drums",
    "description": "Play drums in the air.",
    "href": "projects/virtual_drums.html",
    "emoji": "🥁",
    "badge": "Music",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "qr-code-reader",
    "title": "QR Code Reader",
    "description": "Scan QR codes instantly.",
    "href": "projects/qrcode.html",
    "emoji": "📱",
    "badge": "Utility",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "qr-code-generator",
    "title": "QR Code Generator",
    "description": "Create and download QR codes.",
    "href": "projects/create_qrcode.html",
    "emoji": "🔳",
    "badge": "Utility",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "3d-bird-flocking",
    "title": "3D Bird Flocking",
    "description": "3D bird flocking simulation.",
    "href": "projects/birds.html",
    "emoji": "🐦",
    "badge": "Sim",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "crochet-simulator",
    "title": "Crochet Simulator",
    "description": "Interactive crochet learning tool.",
    "href": "projects/croquet.html",
    "emoji": "🧶",
    "badge": "Sim",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "lyrics-search",
    "title": "Reverse Lyrics Finder",
    "description": "Incolla una frase di una canzone e trova il brano: anteprime audio 30s (iTunes), testo completo con la frase evidenziata (Lyrics.ovh), link Genius/Apple Music, copy & share. PWA-friendly, iPhone + desktop.",
    "href": "projects/lyrics_finder.html",
    "emoji": "🎵",
    "badge": "Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "nba-simulator-2k26",
    "title": "NBA Simulator 2K26",
    "description": "Live match text simulation with real stats.",
    "href": "projects/nba_simulator.html",
    "emoji": "🏀",
    "badge": "Sim",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "royal-derby-sim",
    "title": "Royal Derby Sim",
    "description": "Simulatore di corse di cavalli con scommesse: porta€500 virtuali, punta sui cavalli (evidenziati in oro) con quote live, vincite e perdite sul portafoglio. Cavalli rinomina-bili con colori della casacca, statistiche (velocità, scatto, stamina, forma), record di carriera (corse, vittorie, podi, guadagni), commento live con sorpassi e scatti, grafica canvas curata. Ottimizzato per iPhone.",
    "href": "projects/horse_simulator.html",
    "emoji": "🏇",
    "badge": "Sim",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "serie-a-simulator",
    "title": "Serie A Simulator",
    "description": "Simulatore di partite di Serie A 2025/26 con commento live, statistiche avanzate (xG, possesso, tiri, parate, falli, corner, fuorigioco), VAR, rigori, cartellini, legni, voti dei giocatori, migliore in campo, formazioni e risultato condivisibile. Rose e squadre aggiornate alla stagione 2025/26 (promosse: Sassuolo, Pisa, Cremonese). Ottimizzato per iPhone.",
    "href": "projects/seriea_simulator.html",
    "emoji": "⚽",
    "badge": "Sim",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "fantapanchina",
    "title": "FantaPanchina",
    "description": "Il fantacalcio che gioca da solo. Idle game con squadre parodiche, mercato svincolati, bidoni leggendari, telecronaca da bar, scudetti d'oro e guadagni offline. La tua squadra segna anche mentre dormi. PWA installabile.",
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
    "href": "games/slot_collect.html",
    "emoji": "🎰",
    "badge": "Game",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "text-recognition",
    "title": "Text Recognition",
    "description": "Extract text from images using AI.",
    "href": "projects/text_recognition.html",
    "emoji": "📷",
    "badge": "AI",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "ai-colorizer",
    "title": "AI Colorizer",
    "description": "Colorize B&W photos using Deep Learning.",
    "href": "projects/ai_colorizer.html",
    "emoji": "🎨",
    "badge": "AI",
    "badgeColor": "#00d4ff"
  },
    {
    "id": "coloring-book",
    "title": "Coloring Book",
    "description": "Interactive coloring book with various designs.",
    "href": "projects/coloring.html",
    "emoji": "🎨",
    "badge": "Fun",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "nail-art-ar",
    "title": "Nail Art AR",
    "description": "Design nails and try them on in real-time.",
    "href": "projects/nails.html",
    "emoji": "💅",
    "badge": "AR",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "gba-emulator",
    "title": "GBA Emulator",
    "description": "Web-based Game Boy Advance emulator.",
    "href": "projects/gba-emulator.html",
    "emoji": "🎮",
    "badge": "Emu",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "quizzes",
    "title": "Quizzes",
    "description": "Short interactive quizzes — test your knowledge.",
    "href": "projects/quiz.html",
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
    "href": "book-writer/index.html",
    "emoji": "📖",
    "badge": "AI Tool",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "ai-chat-assistant",
    "title": "AI Chat Assistant",
    "description": "Chatbot AI client-side powered by Pollinations.ai — gratis, senza chiave API. Storia sessione e multilingua.",
    "href": "projects/ai_chat.html",
    "emoji": "🤖",
    "badge": "AI · Free API",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "e-commerce-platform",
    "title": "E-Commerce Platform",
    "description": "Demo e-commerce vanilla: catalogo prodotti, carrello e checkout con persistenza in localStorage.",
    "href": "projects/ecommerce.html",
    "emoji": "🛒",
    "badge": "E-Commerce",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "ios-file-manager",
    "title": "File Manager & Reader",
    "description": "Virtual file system with a Notepad++-style code viewer (.py, .cpp…), PDF reader and image preview — optimized for iPhone.",
    "href": "projects/file_manager.html",
    "emoji": "📁",
    "badge": "Utility / iOS",
    "badgeColor": "#00d4ff"
  },
  {
    "id": "genetic-art",
    "title": "Genetic Art — Evoluzione Artistica",
    "description": "Disegna creature bioluminescenti e falli evolvere: crossover, mutazioni, fitness che impara il tuo gusto, albero genealogico 3D, diorama e suoni. Three.js + algoritmi genetici puri.",
    "href": "projects/genetic-art.html",
    "emoji": "🧬",
    "badge": "GA / Three.js",
    "badgeColor": "#00ffd0"
  },
  {
    "id": "tsne-3d",
    "title": "T-SNE 3D — Dispiegamento dei Dati",
    "description": "Carica un CSV e guarda i dati dispiegarsi in 3D: t-SNE in-browser (Web Worker), coerenza del clustering live, k-means, pianeta dei dati, export PNG/JSON/CSV. Three.js + riduzione dimensionale.",
    "href": "projects/tsne-3d.html",
    "emoji": "🌌",
    "badge": "ML / 3D",
    "badgeColor": "#3ee6ff"
  },
  {
    "id": "face-lab",
    "title": "FACE LAB — Distortion Mirror",
    "description": "Live facial-landmark AI: 68 points trace your face in 3D with a holographic wireframe, real-time telemetry (blink, smile, head pose, emotion) and ten distortion modes (giant eyes, funhouse, fish-eye, emoji, cartoon, swirl, chromatic, pixelate, neon, squash) plus seven props (glasses, crown, mustache, hat, blush, beard, halo). MediaPipe + Three.js, on-device.",
    "href": "projects/face-lab.html",
    "emoji": "👁️",
    "badge": "CV / AI",
    "badgeColor": "#ff5f9e"
  },
  {
    "id": "neural-flock",
    "title": "NEURAL FLOCK — Smart Swarm",
    "description": "A hypnotic 3D swarm of boids steered by a tiny neural network (19→28→3) trained live in your browser. Pick a target shape — heart, spiral, text, your drawing — and watch the flock learn to form it. Three.js + pure-JS AI.",
    "href": "projects/neural-flock.html",
    "emoji": "🕊️",
    "badge": "NN / Particles",
    "badgeColor": "#b28dff"
  },
  {
    "id": "alcohol-tracker",
    "title": "🍺 AlcoTracker — Tasso Alcolemico",
    "description": "Calcola il tuo tasso alcolemico con la formula di Widmark: inserisci sesso, peso, altezza ed età, aggiungi bevande e pasti con l'orario, e il grafico mostra la curva alcolica con picco, tempo per tornare sotto il limite di 0.5 g/L (quando puoi guidare) e ora in cui sarai completamente sobrio. Doppia visuale: classica con grafico dettagliato e timeline -12h/+12h dove trascini cibo e bevande sull'orario (con ⭐ preferiti sempre in vista). Timeline zoomabile (-12h/+12h, +/− o rotella) con selezione ed eliminazione degli elementi inseriti e cibo che influenza l'alcol SOLO dal momento del pasto in poi. Metabolismo regolabile (0.10/0.15/0.20 g/L/h), unità alcoliche, ottimizzato per iPhone. ⚠️ Vietato ai minori di 18 anni.",
    "href": "projects/alcohol_tracker.html",
    "emoji": "🍺",
    "badge": "Health / Tool",
    "badgeColor": "#ffb84d"
  },
  {
    "id": "pocket-wild",
    "title": "POCKET WILD — Catch. Build. Mutate.",
    "description": "A 2D top-down creature-capture survival game à la Palworld: procedural biomes, throw spheres to catch geometric Pals, evolve, splice genes in the lab, fuse, build a base, fight Alpha bosses. Vanilla JS, zero assets, iPhone + desktop.",
    "href": "projects/pocket-wild.html",
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
  }
];
