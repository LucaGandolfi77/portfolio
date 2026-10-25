// === TWIN MODE ===
// Floating AI chat widget — Luca's digital twin.
// Uses Pollinations.ai (free, no API key) and a local knowledge base
// so it can answer questions about Luca with accurate, curated facts.
//
// Simple CORS Solution:
// - Uses corsproxy.io as the primary proxy service
// - Added to CSP connect-src directive in index.html
// - Provides local fallback responses when proxy services fail
// - Ensures the chat widget always works, even with connection issues

(function () {
    'use strict';

    // Direct endpoint first (Pollinations supports CORS natively), then CORS proxy fallback
    const PROXY_SERVICES = ['', 'https://corsproxy.io/?'];
    const POLLINATIONS_URL = 'https://text.pollinations.ai/';
    const STORAGE_KEY = 'twin_history_v1';

    // Local fallback responses for when proxy services fail
    const LOCAL_FALLBACK_RESPONSES = {
        en: [
            "Hi there! I'm having connection issues with the AI service, but I can still help you with basic information about Luca. Luca is a Full-Stack Engineer based in Milan, Italy. He specializes in Python, JavaScript, React, Node.js, and has 10+ years of experience in web development and AI. You can contact him at luca.gandolfi7@hotmail.com.",
            "Hello! I'm Luca's digital twin. Due to connection issues with the AI service, let me give you some key information: Luca has worked on 50+ projects including AI chatbots, games, and web applications. He's also a university tutor and has experience with embedded systems. His skills include Python, C++, JavaScript, and various web technologies.",
            "Hi! I'm Twin Luca. The AI connection is currently unavailable, but I can share some facts: Luca was born in Parma, Italy, and is currently working as a Full-Stack Developer at Alten Italia. He has a BSc in Computer Science and is passionate about technology, AI, and creating useful applications. His interests include piano, music, and quantum physics."
        ],
        it: [
            "Ciao! Sono il gemello digitale di Luca. Ho problemi di connessione con il servizio AI, ma posso comunque darti informazioni di base: Luca è un Full-Stack Engineer basato a Milano, Italia. Si specializza in Python, JavaScript, React, Node.js e ha 10+ anni di esperienza nello sviluppo web e nell'AI. Puoi contattarlo a luca.gandolfi7@hotmail.com.",
            "Salve! Sono il gemello digitale di Luca. A causa di problemi di connessione con il servizio AI, ecco alcune informazioni: Luca ha lavorato su 50+ progetti inclusi chatbot AI, giochi e applicazioni web. È anche tutor universitario e ha esperienza con sistemi embedded. Le sue competenze includono Python, C++, JavaScript e varie tecnologie web.",
            "Ciao! Sono Twin Luca. La connessione AI è attualmente non disponibile, ma posso condividere alcuni fatti: Luca è nato a Parma, Italia, e attualmente lavora come Full-Stack Developer presso Alten Italia. Ha una laurea in Informatica e ama la tecnologia, l'AI e la creazione di applicazioni utili. I suoi interessi includono il pianoforte, la musica e la fisica quantistica."
        ]
    };

    // ---- Knowledge base (curated facts about Luca) ----
    const LUCA_KB = {
        identity: 'Luca Gandolfi, born 28 April 1994 in Parma, Italy. Full-Stack Engineer, developer, maker. Based in Milan and Fidenza (PR), Italy.',
        contact: {
            email: 'luca.gandolfi7@hotmail.com',
            phone: '+39 333 1827 911',
            location: 'Milan / Fidenza (PR), Italy',
            specialization: 'Full Stack Development'
        },
        skills: 'JavaScript (Expert), Python (Expert), C++ (Expert), C (Expert), Embedded C (Expert), Bash / Linux (Expert), FreeRTOS (Advanced), CAN / OpcUa (Advanced), Qt (Advanced), TensorFlow (Advanced), PySpark (Advanced), Pandas (Advanced), React (Advanced), Node.js (Advanced), CSS/SCSS (Advanced), STM-32 (Intermediate), I2C / PWM (Intermediate), NLP with BERT (Intermediate), SQL (Intermediate), Go (Intermediate). Also: HTML, Git, hardware/software integration, verification & validation, avionics.',
        languages: 'Italian (native), English (C1 advanced), French (A1), Spanish (A1), Russian (A1), Latin (A1).',
        experience: [
            '2022 – Present: Full Stack Developer at Alten Italia — software testing, software engineering, verification and validation, hw/sw integration for Aerospace & Defence.',
            '2021 – 2022: ICT Developer at Alten Italia — software testing, verification and validation, hw/sw integration for Aerospace & Defence.',
            '2019 – 2021: University Tutor at Università degli Studi di Parma — teaching Go, Python and C; developing projects for "Foundations of Informatics", "Paradigms and Programming Languages" and "Foundations of Programming".'
        ],
        education: 'Master Degree in Computer Engineering (ongoing) and Bachelor Degree in Computer, Electrical and Telecom Engineering, 2013-2018, Università degli Studi di Parma. Bachelor thesis: "An overview of Internet of Things: challenges and opportunities".',
        achievements: 'Google Cloud Certified. 4+ years at Alten Italia in the Aerospace & Defence Division doing software and hardware verification and validation. Bachelor + Master of Computer Engineering at the University of Parma. BERT + PySpark emotion detection project. 230 published projects across 11 languages.',
        projects: '230 projects published on the portfolio, including: AI (Tiny Local AI, emotion detection with BERT + PySpark), P2P and computer vision (face mesh, walkie-talkie mesh, 3D), 3D and simulation (Apollo 11 AGC, t-SNE, neural flock), web and e-commerce, and over a hundred browser games (Snake, Tetris, Chess, poker, battleships, multiplayer card games), plus a GBA emulator, virtual drums, quantum lab, Morse, RSA, world weather and a small RPG.',
        interests: 'Technology, tea ("The"), piano, music, poems, movies, TV shows, cooking recipes, quantum physics, history, memes. He created a life-comic and a personal timeline.',
        personality: 'Smart, creative, "crazy", genius but expert and engineer. Playful and curious, loves easter eggs (try the Konami code ↑↑↓↓←→←→BA) and hidden themes (Matrix, Vaporwave, Pixel Art...). Friendly and helpful. He wants to be seen both as a creative personality and as a serious, skilled engineer.',
        site: 'This portfolio is a static site hosted on GitHub Pages (lucagandolfi77.github.io/portfolio). It supports 11 languages, a command palette (Ctrl+K), recruiter/business mode (toggle in the top bar), themes (light/dark + seasonal + secret), a contact modal, a daily quote and an offline service worker.',
        cv: 'The CV is available on the site at assets/CV_Gandolfi_Luca.pdf.'
    };

    function kbToSystemPrompt() {
        return [
            'You are Twin Luca, the "digital twin" of Luca Gandolfi, a Full-Stack Engineer. You represent Luca himself.',
            'Answer questions about Luca accurately, ONLY using the facts below. If you do not know something, say so and suggest emailing luca.gandolfi7@hotmail.com.',
            'Keep answers concise (max ~120 words), warm and a bit witty — Luca is smart, creative, a bit "crazy genius" but a professional engineer. For business-mode visitors, be more formal and professional.',
            '',
            'FACTS:',
            LUCA_KB.identity,
            '- Contact: email ' + LUCA_KB.contact.email + ', phone ' + LUCA_KB.contact.phone + ', location ' + LUCA_KB.contact.location + '.',
            '- Skills: ' + LUCA_KB.skills,
            '- Languages: ' + LUCA_KB.languages,
            '- Experience: ' + LUCA_KB.experience.join(' / '),
            '- Education: ' + LUCA_KB.education,
            '- Achievements: ' + LUCA_KB.achievements,
            '- Projects: ' + LUCA_KB.projects,
            '- Interests: ' + LUCA_KB.interests,
            '- Personality: ' + LUCA_KB.personality,
            '- About this site: ' + LUCA_KB.site,
            '- CV: ' + LUCA_KB.cv
        ].join('\n');
    }

    const SYSTEM_BY_LANG = {
        en: kbToSystemPrompt(),
        it: kbToSystemPrompt() + '\nRispondi in italiano.',
        es: kbToSystemPrompt() + '\nResponde en español.',
        fr: kbToSystemPrompt() + '\nRéponds en français.',
        de: kbToSystemPrompt() + '\nAntworte auf Deutsch.',
        zh: kbToSystemPrompt() + '\n请用中文回答。',
        ru: kbToSystemPrompt() + '\nОтвечай на русском.',
        ja: kbToSystemPrompt() + '\n日本語で答えてください。',
        ar: kbToSystemPrompt() + '\nأجب باللغة العربية.',
        he: kbToSystemPrompt() + '\nהשב בעברית.',
        sv: kbToSystemPrompt() + '\nSvara på svenska.'
    };

    const SUGGESTIONS = {
        en: ['Who is Luca?', 'What are his skills?', 'Work experience?', 'How to contact him?', 'What projects?'],
        it: ['Chi è Luca?', 'Quali competenze?', 'Esperienza lavorativa?', 'Come contattarlo?', 'Quali progetti?']
    };

    let history = [];
    let busy = false;
    let panel = null;
    let launcher = null;
    let isOpen = false;

    function currentLang() {
        const sel = document.getElementById('langSelect');
        return (sel && sel.value) || localStorage.getItem('lang') || 'en';
    }

    function getSystemMsg() {
        const lang = currentLang();
        return SYSTEM_BY_LANG[lang] || SYSTEM_BY_LANG.en;
    }

    function loadHistory() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr) && arr.length) history = arr;
            }
        } catch (e) { history = []; }
    }

    function saveHistory() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20))); } catch (e) {}
    }

    function addMsg(text, role) {
        const d = document.createElement('div');
        d.className = 'twin-msg ' + role;
        d.textContent = text;
        document.getElementById('twinMessages').appendChild(d);
        scrollBottom();
        return d;
    }

    function scrollBottom() {
        const m = document.getElementById('twinMessages');
        if (m) m.scrollTop = m.scrollHeight;
    }

    function addTyping() {
        const t = document.createElement('div');
        t.className = 'twin-typing';
        t.innerHTML = '<span></span><span></span><span></span>';
        document.getElementById('twinMessages').appendChild(t);
        scrollBottom();
        return t;
    }

    function renderSuggestions() {
        const wrap = document.getElementById('twinSuggestions');
        if (!wrap) return;
        wrap.innerHTML = '';
        const lang = currentLang();
        const chips = SUGGESTIONS[lang] || SUGGESTIONS.en;
        chips.forEach(text => {
            const b = document.createElement('button');
            b.className = 'twin-chip';
            b.textContent = text;
            b.type = 'button';
            b.addEventListener('click', () => {
                document.getElementById('twinInput').value = text;
                send();
            });
            wrap.appendChild(b);
        });
    }

    async function send() {
        const input = document.getElementById('twinInput');
        const sendBtn = document.getElementById('twinSend');
        const text = (input.value || '').trim();
        if (!text || busy) return;
        busy = true;
        sendBtn.disabled = true;
        addMsg(text, 'twin-user');
        input.value = '';
        history.push({ role: 'user', content: text });
        const typing = addTyping();
        let replyText = '';
        try {
            const payload = JSON.stringify({
                messages: [{ role: 'system', content: getSystemMsg() }, ...history.slice(-10)],
                seed: Math.floor(Date.now() / 1000) % 2147483647,
                model: 'openai'
            });

            for (let i = 0; i < PROXY_SERVICES.length; i++) {
                const proxyUrl = PROXY_SERVICES[i];
                const targetUrl = proxyUrl ? proxyUrl + encodeURIComponent(POLLINATIONS_URL) : POLLINATIONS_URL;
                try {
                    const res = await fetch(targetUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: payload
                    });
                    if (res.ok) {
                        const raw = (await res.text()).trim();
                        if (raw) {
                            try {
                                const parsed = JSON.parse(raw);
                                replyText = (parsed?.choices?.[0]?.message?.content || raw).trim();
                            } catch (_) {
                                replyText = raw;
                            }
                            break;
                        }
                    }
                } catch (err) {
                    // Try next endpoint
                }
            }
        } catch (e) {
            // Fall through to local knowledge base fallback
        } finally {
            typing.remove();
        }

        if (!replyText) {
            replyText = getLocalFallbackReply(text);
        }

        history.push({ role: 'assistant', content: replyText });
        saveHistory();
        addMsg(replyText, 'twin-bot');
        busy = false;
        sendBtn.disabled = false;
        input.focus();
    }

    function getLocalFallbackReply(userMessage) {
        const lang = currentLang();
        const isIt = lang === 'it';
        const q = (userMessage || '').toLowerCase();

        if (/skill|competenz|linguagg|stack|tecnolog|python|javascript|react|c\+\+/i.test(q)) {
            return isIt
                ? 'Competenze principali di Luca:\n• Expert: Python, C++, C, Bash, JavaScript\n• Advanced: React, Node.js, CSS/SCSS\n• Intermediate: Go, Java, SQL, MongoDB, OpenGL\n• Ambiti: Full-Stack Web, AI/ML in-browser, Embedded Systems & V&V aerospaziale.'
                : 'Luca\'s core technical skills:\n• Expert: Python, C++, C, Bash, JavaScript\n• Advanced: React, Node.js, CSS/SCSS\n• Intermediate: Go, Java, SQL, MongoDB, OpenGL\n• Domains: Full-Stack Web, in-browser AI/ML, Embedded Systems & Aerospace V&V.';
        }
        if (/experien|esperienz|lavor|work|job|alten|tutor|carriera|azienda/i.test(q)) {
            return isIt
                ? 'Esperienza lavorativa di Luca:\n• 2022–Oggi: Full-Stack Developer @ Alten Italia (SW engineering, testing, V&V e integrazione HW/SW per Aerospazio & Difesa)\n• 2021–2022: ICT Developer @ Alten Italia\n• 2019–2021: Tutor Universitario @ Università di Parma (Go, Python, C).'
                : 'Luca\'s work experience:\n• 2022–Present: Full-Stack Developer @ Alten Italia (SW engineering, testing, V&V, HW/SW integration for Aerospace & Defence)\n• 2021–2022: ICT Developer @ Alten Italia\n• 2019–2021: University Tutor @ University of Parma (teaching Go, Python, C).';
        }
        if (/stud|educat|laurea|universit|scuola|degree|parma/i.test(q)) {
            return isIt
                ? 'Formazione:\n• Laurea in Ingegneria Informatica, Elettronica e delle Telecomunicazioni presso l\'Università degli Studi di Parma (2018)\n• Diploma di Liceo Scientifico con orientamento Informatico (2013).'
                : 'Education:\n• BSc in Computer, Electronic & Telecommunications Engineering at the University of Parma (2018)\n• Scientific High School Diploma with IT specialization (2013).';
        }
        if (/project|progett|game|gioc|lab|app|pwa/i.test(q)) {
            return isIt
                ? 'Luca ha realizzato oltre 65 progetti e 65+ giochi browser/PWA! Tra i principali: Tiny Local AI (LLM nel browser con WebGPU), FaceMesh Camera, Vola! 3D, Payamazadi Mesh P2P, QuoteSmith, De Rerum Gatta, Zero Assoluto e Coverage Galaxy. Puoi esplorarli nelle sezioni Projects e Arcade!'
                : 'Luca has built 65+ browser projects and 65+ games/PWAs! Highlights include Tiny Local AI (in-browser WebGPU LLMs), FaceMesh Camera, Vola! 3D, Payamazadi P2P Mesh, QuoteSmith, De Rerum Gatta, Zero Assoluto, and Coverage Galaxy. Explore them in the Projects and Arcade sections!';
        }
        if (/contact|contatt|mail|email|phone|telefon|linkedin|github|reach/i.test(q)) {
            return isIt
                ? 'Puoi contattare Luca tramite:\n• Email: luca.gandolfi7@hotmail.com\n• Telefono: +39 333 1827 911\n• GitHub: github.com/LucaGandolfi77\n• LinkedIn: it.linkedin.com/in/luca-gandolfi7\n• Località: Milano / Fidenza (PR), Italia.'
                : 'You can reach Luca via:\n• Email: luca.gandolfi7@hotmail.com\n• Phone: +39 333 1827 911\n• GitHub: github.com/LucaGandolfi77\n• LinkedIn: it.linkedin.com/in/luca-gandolfi7\n• Location: Milan / Fidenza (PR), Italy.';
        }
        if (/cv|curriculum|resume/i.test(q)) {
            return isIt
                ? 'Puoi scaricare il CV completo di Luca in PDF cliccando su "Scarica CV" nell\'header della pagina (assets/CV_Gandolfi_Luca.pdf) oppure attivando la modalità "Business" nella barra in alto!'
                : 'You can download Luca\'s full PDF resume by clicking "Download CV" in the hero header (assets/CV_Gandolfi_Luca.pdf) or by toggling "Business" mode in the top bar!';
        }

        const fallbackResponses = LOCAL_FALLBACK_RESPONSES[lang] || LOCAL_FALLBACK_RESPONSES.en;
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    function buildUI() {
        launcher = document.createElement('button');
        launcher.id = 'twinLauncher';
        launcher.type = 'button';
        launcher.setAttribute('aria-label', 'Chat with Luca\'s twin');
        launcher.title = 'Twin Mode — chat with Luca\'s AI twin';
        launcher.innerHTML = '<i class="fas fa-comment-dots"></i><span class="twin-launcher-badge"></span>';
        launcher.addEventListener('click', toggle);

        panel = document.createElement('div');
        panel.id = 'twinPanel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Twin Mode chat');
        panel.innerHTML = `
            <div class="twin-head">
                <div class="twin-avatar"><i class="fas fa-user-astronaut"></i></div>
                <div>
                    <p class="twin-title">Twin Luca</p>
                    <p class="twin-subtitle">AI · Pollinations · no API key</p>
                </div>
                <button class="twin-close" aria-label="Close chat" type="button">✕</button>
            </div>
            <div id="twinMessages"></div>
            <div class="twin-suggestions" id="twinSuggestions"></div>
            <div class="twin-input-row">
                <input id="twinInput" type="text" autocomplete="off"
                       placeholder="Ask Luca's twin..." />
                <button id="twinSend" type="button"><i class="fas fa-paper-plane"></i></button>
            </div>
            <div class="twin-foot">Powered by <a href="https://pollinations.ai" target="_blank" rel="noopener">pollinations.ai</a></div>
        `;
        panel.querySelector('.twin-close').addEventListener('click', close);
        panel.querySelector('#twinSend').addEventListener('click', send);
        panel.querySelector('#twinInput').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

        document.body.appendChild(launcher);
        document.body.appendChild(panel);
    }

    function open() {
        if (!panel) buildUI();
        isOpen = true;
        panel.classList.add('twin-open');
        if (launcher) launcher.style.display = 'none';
        if (!document.getElementById('twinMessages').children.length) {
            const lang = currentLang();
            addMsg(lang === 'it'
                ? 'Ciao! Sono il gemello digitale di Luca. Chiedimi qualsiasi cosa su di lui — competenze, esperienza, progetti, o come contattarlo.'
                : 'Hi! I\'m Luca\'s digital twin. Ask me anything about him — skills, experience, projects, or how to reach him.', 'twin-bot');
        }
        renderSuggestions();
        setTimeout(() => document.getElementById('twinInput').focus(), 100);
        if (window.PortfolioXP) window.PortfolioXP.add(2, 'Talked to Twin', { cooldown: 15000, toast: false });
    }

    function close() {
        isOpen = false;
        if (!panel) return;
        panel.classList.remove('twin-open');
        if (launcher) launcher.style.display = '';
    }

    function toggle() {
        if (isOpen) close();
        else open();
    }

    function init() {
        buildUI();
        loadHistory();
        // Restore history messages visually (non-system)
        if (history.length) {
            history.forEach(msg => {
                if (msg.role === 'user' || msg.role === 'assistant') addMsg(msg.content, msg.role === 'user' ? 'twin-user' : 'twin-bot');
            });
        }
    }

    // Expose a small public API for the top-bar button
    window.TwinMode = { open, close, toggle, isOpen: () => isOpen };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
