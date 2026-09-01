# Luca Gandolfi Portfolio

Static portfolio, browser laboratory, games arcade, and interactive experiments by Luca Gandolfi.

The main site is designed for GitHub Pages. The portfolio shell and most demos run entirely in the browser. A few optional projects include local Node.js, Python, or Electron tooling, but no backend is required to serve the main portfolio.

## Live Site

- Portfolio: <https://lucagandolfi77.github.io/portfolio/>
- Games directory: <https://lucagandolfi77.github.io/portfolio/games/>
- Browser Lab: <https://lucagandolfi77.github.io/portfolio/lab/>
- Arcade Lab: <https://lucagandolfi77.github.io/portfolio/games/arcade-lab/>
- QuoteSmith: <https://lucagandolfi77.github.io/portfolio/games/quotesmith/>

## What This Site Contains

The repository is a collection of static pages rather than one framework application. It combines a personal portfolio with a large set of small, focused browser experiences.

- Responsive portfolio homepage with profile, work, skills, experience, education, achievements, projects, games, music, books, poems, and contact sections
- Selected-work overview for AI, data, computer vision, peer-to-peer, and 3D projects
- Browser Lab with ten local-first tools and experiments
- Arcade Lab with ten playable mini-games
- Large games directory containing board games, card games, arcade games, simulations, multiplayer experiments, and story games
- Multilingual interface with English, Italian, French, Spanish, Chinese, Russian, German, Japanese, Swedish, Arabic, and Hebrew translations
- PWA manifests and service workers for selected apps
- Offline-capable games and tools with local score and preference storage
- Camera, microphone, motion, geolocation, speech, fullscreen, Bluetooth, WebGL, Web Audio, and file-input experiments where supported by the browser
- AI, machine-learning, computer-vision, graphics, audio, networking, and embedded-systems projects
- SEO metadata, Open Graph metadata, structured data, robots policy, sitemap, security headers, and link-audit reports
- Mobile and iPhone-oriented layouts with safe-area handling in newer applications

## Browser Lab

Open [`lab/index.html`](lab/index.html) for the static project collection.

| Project | Purpose | Main browser technologies |
| --- | --- | --- |
| Hardware Dashboard | Device orientation and motion values with a simulator fallback | Device Orientation, Device Motion, Screen Orientation, Canvas |
| Offline Portfolio CMS | Create project records and export JSON | LocalStorage, Blob downloads, JSON |
| Network Laboratory | WebRTC loopback data channel and message timing | RTCPeerConnection, RTCDataChannel |
| Motion MIDI Instrument | Pointer or camera input mapped to an oscillator | MediaDevices, Web Audio, Pointer Events |
| Private Data Observatory | Paste CSV and render a local chart | Text parsing, local data, DOM rendering |
| Local AI Explorer | Transparent prompt token and intent classifier | JavaScript, local deterministic inference |
| Circuit Sketcher | Place components and export a circuit sketch | Canvas, Pointer Events, JSON |
| Markdown Vault | Write, preview, save, and reload local notes | LocalStorage, DOM rendering |
| Shader Playground | Animated field with speed and density controls | Canvas 2D, animation frames |
| Accessibility Inspector | Inspect pasted markup for common accessibility issues | DOMParser, HTML inspection, ARIA checks |

The Lab intentionally has no server dependency. Camera and motion features fall back gracefully when permission or hardware is unavailable.

## Arcade Lab

Open [`games/arcade-lab/index.html`](games/arcade-lab/index.html) for ten playable prototypes.

| Game | Core system |
| --- | --- |
| Tap Rush | Reaction speed and timed targets |
| Memory Grid | Pair matching and move counting |
| Sound Sequence | Audio and visual pattern memory |
| Star Route | Fuel management and route selection |
| Fake Answer | Multiple-choice trivia with generated distractors |
| Pocket Roguelike | Short runs with health, supplies, and risk choices |
| Physics Toybox | Canvas gravity, bounce, and launch simulation |
| Music Memory | Web Audio rhythm memory |
| Local Escape Room | Pass-and-play clue solving |
| Mini Football | Formation, tactics, and deterministic-feeling match simulation |

The existing [`games/quotesmith/`](games/quotesmith/) game is a separate full quiz experience with bilingual quotes, fourteen categories, difficulty selection, streaks, persistent records, speech playback, and offline PWA support.

## Existing Project Areas

The repository also contains many standalone applications and experiments, including:

- Local AI and text generation tools
- Image editing and pixel-stretch workflows
- Background removal and browser-side model inference
- Face tracking, smile analysis, FaceMesh, and camera experiments
- WebGL shader art and the RAVE visual camera tool
- Three.js low-poly worlds and JRPG-style game scenes
- Audio editor, waveform, MP3/WAV, MIDI, radio, lyrics, and virtual-drum tools
- Weather, maps, GPS, data visualization, Sankey diagrams, and telemetry-style interfaces
- File manager, ecommerce, books, reader, poems, comics, and writing tools
- RSA, Morse, QR code, quantum, fractal, and mathematical visualizations
- PWA projects such as Vola, Daisy Field, QuoteSmith, and other installable experiences
- Multiplayer and peer-to-peer projects using WebRTC, PeerJS, Bluetooth concepts, Socket.IO, or optional local servers
- Board, card, strategy, racing, sports, puzzle, simulation, and retro arcade games

Representative entry points include:

- [`projects/vola-pwa/index.html`](projects/vola-pwa/index.html): camera-controlled 3D flying PWA
- [`projects/rave/index.html`](projects/rave/index.html): camera shader and visual effects tool
- [`projects/audio-editor-pwa/index.html`](projects/audio-editor-pwa/index.html): browser audio editor PWA
- [`projects/fantapanchina/index.html`](projects/fantapanchina/index.html): idle fantacalcio PWA with parody teams and offline earnings
- [`projects/vite-carrere/index.html`](projects/vite-carrere/index.html): narrative PWA journey through Emmanuel Carrère's life and works
- [`projects/smile_detection/index.html`](projects/smile_detection/index.html): camera-based smile analysis
- [`projects/facemesh_camera.html`](projects/facemesh_camera.html): real-time face mesh experiment
- [`games/echoes-of-the-last-dawn/index.html`](games/echoes-of-the-last-dawn/index.html): Three.js story game
- [`games/card-games/public/index.html`](games/card-games/public/index.html): card-game collection with optional local server
- [`pixel-stretch-app/`](pixel-stretch-app/): React and TypeScript pixel editing application

## Technology Stack

### Core static web platform

- HTML5 semantic markup
- CSS3, custom properties, responsive grids, media queries, animations, and reduced-motion rules
- Modern browser JavaScript with modules and browser APIs
- JSON data files and local datasets
- Relative URLs for GitHub Pages project-site hosting

### Browser APIs

- Canvas 2D
- WebGL and shader rendering
- Three.js scenes
- Web Audio API
- Web Speech API and speech synthesis
- MediaDevices camera and microphone access
- MediaRecorder for audio/video capture
- Device Orientation and Device Motion
- Geolocation
- WebRTC peer connections and data channels
- Web Bluetooth experiments where supported
- Pointer Events and touch input
- Fullscreen and Screen Orientation
- File inputs, Blob downloads, and local file processing
- LocalStorage and offline persistence
- Service Workers, Cache Storage, and Web App Manifests
- Web Workers for expensive browser-side work

### JavaScript frameworks and libraries used in subprojects

- React 19
- React DOM
- TypeScript
- Vite
- Zustand
- Vitest
- Testing Library
- Lucide React
- Three.js
- Transformers.js / Hugging Face browser tooling
- MediaPipe-style browser vision models
- PeerJS
- Socket.IO
- Express
- SoundTouch, LAME, and browser audio helpers in the audio editor

### Local and optional tooling

- Node.js and npm
- Python
- Flask and Flask-CORS
- PyTorch
- Hugging Face Transformers
- Electron
- Bash
- Vitest and Node test runners
- SEO and link-audit scripts

### Programming languages represented

- HTML
- CSS
- JavaScript
- TypeScript
- Python
- C
- C++
- Java
- Go
- SQL
- Bash
- OpenGL shader code
- Assembly
- Haskell

Some languages are represented in supporting tools, experiments, or skills sections rather than being required to run the static homepage.

## Static Deployment Model

GitHub Pages serves files; it does not run a persistent Node.js, Python, database, or WebSocket server. The portfolio is structured around that constraint.

- The main homepage is static HTML, CSS, and JavaScript.
- Most projects are directly deployable as static pages.
- PWA manifests and service workers use relative paths and scoped caches.
- LocalStorage keeps preferences, scores, notes, and settings in the visitor's browser.
- Browser permissions are requested only by projects that need them.
- Projects requiring a local server are marked as optional development tools.
- Multiplayer projects using a server, Socket.IO, or custom signaling are not assumed to run from GitHub Pages alone.
- Camera, microphone, geolocation, Bluetooth, service workers, and WebRTC generally require HTTPS or `localhost`.
- GitHub Pages project URLs include the `/portfolio/` path, so root-absolute asset paths such as `/games/foo/` should not be used.

## Local Development

Run a static server from the repository root:

```bash
python3 -m http.server 8123
```

Open <http://localhost:8123/>.

A server is preferred to opening files directly because browser modules, fetch, service workers, WebRTC, camera permissions, and local asset requests are restricted by `file://` security rules.

## Optional Project Commands

The main portfolio does not need a build step. Some subprojects have their own development commands:

```bash
# React / TypeScript pixel editor
cd pixel-stretch-app
npm install
npm run dev

# Card games local host and tests
cd games/card-games
npm install
npm test
npm start

# Three.js story game server, if needed by that subproject
cd games/echoes-of-the-last-dawn
npm install
npm start
```

The root [`requirements.txt`](requirements.txt) is for optional Python and local AI tooling. It is not needed for the GitHub Pages homepage.

## Repository Structure

```text
portfolio/
├── index.html                 # Main portfolio homepage
├── assets/                    # Shared images, fonts, icons, CSS, and data
├── i18n/                      # Translation JSON files
├── projects/                  # Standalone tools, PWAs, AI, audio, and visual demos
├── games/                    # Standalone games and game collections
│   ├── index.html             # Games directory
│   ├── arcade-lab/            # Ten new static game prototypes
│   └── quotesmith/            # Bilingual offline quote quiz
├── lab/                       # Ten new static browser tools
├── pixel-stretch-app/         # React / TypeScript application
├── book-writer/               # Writing tool and Python helpers
├── deepseek-harness/          # Separate TypeScript and Python project
├── scripts/                   # Maintenance and translation scripts
├── tools/seo/                 # SEO audit tooling
├── docs/                      # Architecture and project documentation
├── manifest.json              # Portfolio PWA manifest
├── sw.js                      # Portfolio service worker
├── robots.txt                 # Crawler policy
├── sitemap.xml                # Search-engine URL list
└── _headers                  # Hosting security headers where supported
```

## Mobile and Accessibility

The site and newer tools are designed for mobile browsers as well as desktop browsers.

- Responsive layouts for phone, tablet, and desktop widths
- Touch-sized controls and pointer support
- iPhone viewport and safe-area handling in PWA-style apps
- Keyboard focus styles on interactive controls
- Semantic headings, labels, and live status regions in newer tools
- Reduced-motion media-query support in newer interfaces
- Graceful fallbacks when camera, motion, WebGL, audio, or WebRTC are unavailable

Individual older experiments may have different accessibility and mobile support levels. The Browser Lab includes an accessibility inspector for testing pasted markup.

## Privacy

Most demos process data locally in the browser.

- Scores, notes, language choices, and settings may be stored in LocalStorage.
- Camera, microphone, motion, location, Bluetooth, and speech features are permission-based.
- Camera and microphone data is used by the requesting demo and is not automatically uploaded by the portfolio shell.
- Some projects intentionally call external APIs or download browser models; those projects should explain the dependency in their own page.
- No account is required for the main portfolio or the static Lab and Arcade Lab.

## Adding a New Static Project

1. Create a self-contained directory under `projects/`, `games/`, or `lab/`.
2. Use relative asset paths so the page works below `/portfolio/` on GitHub Pages.
3. Add mobile viewport metadata and a descriptive page title.
4. Keep permission requests inside an explicit user action.
5. Add an offline fallback if the page is intended to be a PWA.
6. Link the project from the appropriate directory and the homepage when it is ready.
7. Test from a local HTTP server and from a project-site URL shape.
8. Document optional servers, model downloads, APIs, and browser requirements.

## Future Direction

The static architecture supports several larger additions without introducing a backend:

- Browser hardware dashboard with sensor history export
- Offline portfolio CMS with static HTML generation
- WebRTC cooperative escape room
- Camera motion MIDI instrument
- Private personal-data observatory
- Browser-side AI benchmark and model explorer
- SVG circuit and embedded-system sketcher
- Offline Markdown knowledge base
- WebGPU particle and shader laboratory
- Accessibility regression dashboard
- QuoteSmith daily challenge and tournament mode
- Procedural space-route game
- Mobile roguelike with daily seeds
- Local multiplayer pass-and-play games
- Browser physics toybox
- Music memory and rhythm games
- Lightweight football manager simulation

The first versions of these ideas are available in the Browser Lab and Arcade Lab hubs.

## Known Limitations

- GitHub Pages cannot run the optional Node.js, Python, database, or WebSocket services.
- Browser support for WebGPU, Bluetooth, motion permissions, speech voices, and some media APIs varies by device.
- Browser AI models can be large and may require a first download.
- WebRTC connectivity may be limited by NAT, firewall, or missing signaling infrastructure.
- Some older portfolio pages use external CDNs or experimental APIs.
- The repository contains independent projects with different maturity, testing, and accessibility levels.

## Contact

- GitHub: [LucaGandolfi77](https://github.com/LucaGandolfi77)
- Portfolio: <https://lucagandolfi77.github.io/portfolio/>

## License

No repository-wide license file is currently included. Treat individual assets, libraries, fonts, models, and third-party media according to their own licenses until a project-wide license is added.
