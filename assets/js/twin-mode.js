// === TWIN MODE ===
// Floating AI chat widget — Luca's digital twin.
// Uses Pollinations.ai (free, no API key) and a local knowledge base
// so it can answer questions about Luca with accurate, curated facts.

(function () {
    'use strict';

    const POLLINATIONS_URL = 'https://text.pollinations.ai/';
    const STORAGE_KEY = 'twin_history_v1';

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
            let attempts = 0;
            const maxAttempts = 2;
            while (attempts < maxAttempts) {
                attempts++;
                response = await fetch(POLLINATIONS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ messages: [getSystemMsg(), ...history], seed: Math.floor(Date.now() / 1000) % 2147483647, model: 'openai' })
                });
                if ((response.status === 429 || response.status === 502) && attempts < maxAttempts) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                break;
            }
            typing.remove();
            if (!response.ok) {
                const msg = response.status === 429
                    ? (currentLang() === 'it' ? '⚠️ Troppe richieste — riprova tra qualche secondo.' : '⚠️ Too many requests — retry in a few seconds.')
                    : (response.status === 502 || response.status === 503
                        ? (currentLang() === 'it' ? '⚠️ Il servizio AI è temporaneamente non disponibile. Riprova più tardi.' : '⚠️ The AI service is temporarily unavailable. Please retry later.')
                        : (currentLang() === 'it' ? '⚠️ Errore ' + response.status + ' — riprova tra qualche secondo.' : '⚠️ Error ' + response.status + ' — please retry in a moment.'));
                addMsg(msg, 'twin-sys');
                history.pop();
            } else {
                const reply = (await response.text()).trim() || '…';
                history.push({ role: 'assistant', content: reply });
                saveHistory();
                addMsg(reply, 'twin-bot');
            }
        } catch (e) {
            typing.remove();
            addMsg('⚠️ ' + (currentLang() === 'it' ? 'Connessione fallita. Controlla la rete.' : 'Connection failed. Check your network.'), 'twin-sys');
            history.pop();
        } finally {
            busy = false;
            sendBtn.disabled = false;
            input.focus();
        }
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
