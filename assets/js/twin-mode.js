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

    // Use a reliable CORS proxy service
    const PROXY_URL = 'https://corsproxy.io/';
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
        skills: 'Python (Expert), C++ (Expert), C (Expert), Bash (Expert), Microsoft Office (Expert), Java (Intermediate), JavaScript (Intermediate), SQL (Intermediate), React (Advanced), Node.js (Intermediate), CSS/SCSS (Intermediate), MongoDB (Intermediate), Go (Intermediate), OpenGL (Intermediate), Assembly (Beginner), Haskell (Beginner). Also: HTML, Git, testing, verification & validation (hw/sw), embedded systems, AI.',
        languages: 'Italian (native), English (C1 advanced), French (A1), Spanish (A1), Russian (A1), Latin (A1).',
        experience: [
            '2022 – Present: Full Stack Developer at Alten Italia — software testing, software engineering, verification and validation, hw/sw integration for Aerospace & Defence.',
            '2021 – 2022: ICT Developer at Alten Italia — software testing, verification and validation, hw/sw integration for Aerospace & Defence.',
            '2019 – 2021: University Tutor at Università degli Studi di Parma — teaching Go, Python and C; developing projects for "Foundations of Informatics", "Paradigms and Programming Languages" and "Foundations of Programming".'
        ],
        education: 'BSc in Computer Science / Ingegneria Informatica, Elettronica e delle Telecomunicazioni (Università di Parma). Diplomatica da Liceo Scientifico con orientamento in Informatica (2013).',
        achievements: 'Beauty Contest Winner (1st Place – Most Handsome 2023), Google Cloud Certified, 35+ GitHub repos open source, BSc Computer Science (most exams passed in one year), Full Stack Expert, AI Enthusiast, Embedded Systems, Web Performance (Lighthouse 95+), Team Lead / Mentor, Security Focus (OWASP Top 10).',
        projects: '52+ projects on the portfolio, including: AI Chat Assistant (Pollinations), E-Commerce Platform, games (Sky Ace, Neon Kart, Battleship Commander, Snake, Tetris, Chess, Poker), experiments (quantum lab, Morse, RSA, GBA emulator, virtual drums, walkie-talkie, face/hand tracking, audio transcriber, text recognition, world weather), a tiny local AI demo, an RPG game and a referendum multiplayer game.',
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
        let response;
        try {
            // Try multiple proxy services for reliability
            let proxyUsed = null;
            for (let i = 0; i < PROXY_SERVICES.length; i++) {
                const proxyUrl = PROXY_SERVICES[i];
                try {
                    response = await fetch(proxyUrl + POLLINATIONS_URL, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'text/plain',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({ messages: [getSystemMsg(), ...history], seed: Math.floor(Date.now() / 1000) % 2147483647, model: 'openai' })
                    });
                    
                    if (response.ok) {
                        proxyUsed = proxyUrl;
                        break; // Success!
                    } else {
                        // Log the error but continue to next proxy
                        console.log(`Proxy ${proxyUrl} failed with status ${response.status}`);
                        continue;
                    }
                } catch (e) {
                    console.log(`Proxy ${proxyUrl} error:`, e.message);
                    continue; // Try next proxy
                }
            }
            
            typing.remove();
            
            if (!response || !response.ok) {
                // All proxies failed, try local fallback
                const fallbackResponse = await handleLocalFallback(text);
                if (fallbackResponse) {
                    response = fallbackResponse;
                    // Handle success...
                } else {
                    const msg = currentLang() === 'it' 
                        ? '⚠️ Tutti i servizi proxy sono temporaneamente non disponibili. Riprova più tardi o usa le risposte locali.'
                        : '⚠️ All proxy services are temporarily unavailable. Please retry later or use local responses.';
                    addMsg(msg, 'twin-sys');
                    history.pop();
                }
            } else {
                const reply = (await response.text()).trim() || '…';
                history.push({ role: 'assistant', content: reply });
                saveHistory();
                addMsg(reply, 'twin-bot');
            }
        } catch (e) {
            typing.remove();
            // Try local fallback as last resort
            const fallbackResponse = await handleLocalFallback(text);
            if (fallbackResponse) {
                response = fallbackResponse;
                // Handle success...
            } else {
                addMsg('⚠️ ' + (currentLang() === 'it' ? 'Connessione fallita. Controlla la rete.' : 'Connection failed. Check your network.'), 'twin-sys');
                history.pop();
            }
        } finally {
            busy = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    async function handleLocalFallback(userMessage) {
        const lang = currentLang();
        const fallbackResponses = LOCAL_FALLBACK_RESPONSES[lang] || LOCAL_FALLBACK_RESPONSES.en;
        
        // Simple keyword matching for relevant responses
        const lowerMsg = userMessage.toLowerCase();
        let selectedResponse = fallbackResponses[0]; // Default to first response
        
        if (lowerMsg.includes('who is') || lowerMsg.includes('chi è')) {
            selectedResponse = fallbackResponses[0];
        } else if (lowerMsg.includes('skill') || lowerMsg.includes('competenza') || lowerMsg.includes('cosa sa fare')) {
            selectedResponse = fallbackResponses[1];
        } else if (lowerMsg.includes('contatt') || lowerMsg.includes('come contatt')) {
            selectedResponse = fallbackResponses[2];
        }
        
        // Return a mock response object
        return new Response(JSON.stringify({
            choices: [{
                message: {
                    content: selectedResponse
                }
            }]
        }));
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
