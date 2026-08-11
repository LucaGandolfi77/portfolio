// === TERMINAL MODE ===
// Full-screen retro terminal overlay.
// Open with the top-bar terminal button or keyboard shortcut Ctrl+Shift+T.

(function () {
    'use strict';

    let overlay = null;
    let output = null;
    let input = null;
    let history = [];
    let histIdx = 0;
    let isOpen = false;
    let busy = false;

    const ASCII = [
        '   _   _   _      _   _      _   __   ___  ',
        '  | | | | | |_   | | | |    | | / /  / _ \\ ',
        '  | | | | | __|  | | | |    | |/ /  | |_| |',
        '  | |_| | | |_   | |_| |    |   <   |  _  |',
        '   \\___/   \\__|   \\___/     |_|\\_\\  |_| |_|',
        ''
    ].join('\n');

    // Reuse Luca's data for the terminal commands
    const COMMANDS = {
        help: {
            desc: 'Show all available commands',
            run: () => {
                const rows = [
                    ['help', 'show this help'],
                    ['about', 'who is Luca'],
                    ['skills', 'technical skills'],
                    ['languages', 'spoken languages'],
                    ['experience', 'work experience'],
                    ['education', 'academic background'],
                    ['achievements', 'certifications & awards'],
                    ['projects', 'list of projects'],
                    ['contact', 'contact info'],
                    ['cv', 'open the CV (PDF)'],
                    ['social', 'social links'],
                    ['theme <name>', 'switch theme (matrix, vaporwave, pixel-art, retro, minimal, night, dark, light)'],
                    ['clear', 'clear the terminal'],
                    ['exit', 'close the terminal'],
                    ['whoami', 'who am I?'],
                    ['sudo', 'try it 😏']
                ].map(([c, d]) => `<div class="term-table"><span class="term-td">${c}</span><span class="term-td">${d}</span></div>`).join('');
                return ['Available commands:', '', rows];
            }
        },
        about: {
            desc: 'Who is Luca',
            run: () => [
                '<green>Luca Gandolfi</green> — Full-Stack Engineer',
                'Born 28 April 1994 in Parma, Italy. Based in Milan / Fidenza (PR).',
                'Smart, creative, a bit "crazy genius", but a serious professional engineer.',
                'Passionate about: technology, embedded systems, AI, piano, music, poems, tea, quantum physics, history, movies, TV shows and memes.'
            ]
        },
        skills: {
            desc: 'Technical skills',
            run: () => [
                '<green>Expert:</green> Python, C++, C, Bash, Microsoft Office',
                '<cyan>Advanced:</cyan> React',
                '<yellow>Intermediate:</yellow> Java, JavaScript, SQL, Node.js, CSS/SCSS, MongoDB, Go, OpenGL',
                '<dim>Beginner:</dim> Assembly, Haskell',
                '',
                'Also: HTML, Git, testing & V&V (hw/sw), embedded systems, AI/ML, web performance (Lighthouse 95+), OWASP security.'
            ]
        },
        languages: {
            desc: 'Spoken languages',
            run: () => [
                '🇮🇹 Italian — native',
                '🇬🇧 English — C1 (advanced)',
                '🇫🇷 French — A1',
                '🇪🇸 Spanish — A1',
                '🇷🇺 Russian — A1',
                '🇻🇦 Latin — A1'
            ]
        },
        experience: {
            desc: 'Work experience',
            run: () => [
                '<cyan>2022 – Present</cyan> — Full Stack Developer @ <green>Alten Italia</green>',
                '  Software testing, engineering, verification & validation, hw/sw integration (Aerospace & Defence).',
                '<cyan>2021 – 2022</cyan> — ICT Developer @ <green>Alten Italia</green>',
                '  Software testing, V&V, hw/sw integration (Aerospace & Defence).',
                '<cyan>2019 – 2021</cyan> — University Tutor @ <green>Università di Parma</green>',
                '  Teaching Go, Python, C; building projects for Foundations of Informatics & Programming.'
            ]
        },
        education: {
            desc: 'Education',
            run: () => [
                '<green>BSc Ingegneria Informatica, Elettronica e delle Telecomunicazioni</green>',
                'Università degli Studi di Parma — graduated 2018.',
                'Liceo Scientifico con orientamento in Informatica (diploma 2013).'
            ]
        },
        achievements: {
            desc: 'Achievements & certifications',
            run: () => [
                '🏆 Beauty Contest Winner — 1st Place Most Handsome 2023',
                '📜 Google Cloud Certified',
                '⭐ Open Source — 35+ GitHub repos',
                '🌐 Web Performance — Lighthouse 95+',
                '👥 Team Lead — mentor & technical leader',
                '🔐 Security Focus — OWASP Top 10'
            ]
        },
        projects: {
            desc: 'Projects',
            run: () => [
                '52+ projects on the portfolio. Highlights:',
                '<cyan>AI Chat Assistant</cyan> — Pollinations-powered chat (projects/ai_chat.html)',
                '<cyan>E-Commerce Platform</cyan> — vanilla JS cart & checkout',
                '<cyan>Sky Ace / Neon Kart / Battleship Commander</cyan> — games',
                '<cyan>Tiny Local AI Demo</cyan> — distilgpt2 in-browser',
                '<cyan>RPG Game</cyan> + <cyan>Referendum multiplayer game</cyan>',
                '…and experiments: quantum lab, Morse, RSA, GBA emulator, virtual drums, walkie-talkie, face/hand tracking, audio transcriber, text recognition, world weather.',
                'Open <a class="term-green" style="color:#00d4ff" href="projects/" target="_blank">the projects folder</a> to explore.'
            ]
        },
        contact: {
            desc: 'Contact information',
            run: () => [
                '📧 luca.gandolfi7@hotmail.com',
                '📱 +39 333 1827 911',
                '📍 Milan / Fidenza (PR), Italy',
                '💼 Full Stack Development',
                'Open <a class="term-green" style="color:#00d4ff" href="mailto:luca.gandolfi7@hotmail.com">email client</a>'
            ]
        },
        cv: {
            desc: 'Open the CV',
            run: () => {
                window.open('assets/CV_Gandolfi_Luca.pdf', '_blank');
                return ['Opening CV… 📄'];
            }
        },
        social: {
            desc: 'Social links',
            run: () => [
                'GitHub: <a class="term-cyan" style="color:#00d4ff" href="https://github.com/LucaGandolfi77" target="_blank" rel="noopener">github.com/LucaGandolfi77</a>',
                'X/Twitter: <a class="term-cyan" style="color:#00d4ff" href="https://twitter.com/lucagandolfi" target="_blank" rel="noopener">@lucagandolfi</a>'
            ]
        },
        whoami: {
            desc: 'Who am I?',
            run: () => [
                '<green>luca@portfolio</green>',
                'Full-Stack Engineer • Embedded Systems • AI • Web',
                'Born in Parma, raised by curiosity.'
            ]
        },
        sudo: {
            desc: 'Try it',
            run: () => [
                '<red>luca is not in the sudoers file. This incident will be reported. 👀</red>',
                '<dim>(Nice try. What are you even trying to do?)</dim>'
            ]
        }
    };

    function escapeHtml(s) {
        return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    }

    // Render a line supporting inline <green>... tags (from our own output, safe).
    // Handles nested tags by processing innermost first.
    function renderLine(line) {
        if (line === '') return '<div class="term-line term-dim">&nbsp;</div>';
        if (line === '<table>') return '';
        const d = document.createElement('div');
        d.className = 'term-line';
        const clsMap = { green: 'term-green', cyan: 'term-cyan', yellow: 'term-yellow', red: 'term-red', dim: 'term-dim', magenta: 'term-magenta', muted: 'term-muted' };
        // Replace innermost tags repeatedly until no tags remain (handles nesting).
        let html = line;
        for (let pass = 0; pass < 6; pass++) {
            const next = html.replace(/<([a-z]+)>([\s\S]*?)<\/\1>/gi, (m, c, txt) => {
                const cls = clsMap[c.toLowerCase()] || 'term-dim';
                return `<span class="${cls}">${txt}</span>`;
            });
            if (next === html) break;
            html = next;
        }
        d.innerHTML = html;
        output.appendChild(d);
        scrollBottom();
        return line;
    }

    function scrollBottom() {
        output.scrollTop = output.scrollHeight;
    }

    function print(lines) {
        if (!Array.isArray(lines)) lines = [lines];
        lines.forEach(renderLine);
    }

    function typeOut(lines) {
        // Animate line-by-line for a nice boot effect
        return new Promise((resolve) => {
            let i = 0;
            (function next() {
                if (i < lines.length) {
                    renderLine(lines[i]);
                    i++;
                    if (i < lines.length) setTimeout(next, 35);
                    else resolve();
                } else resolve();
            })();
        });
    }

    function boot() {
        print(ASCII);
        const lines = [
            '<dim>' + '─'.repeat(42) + '</dim>',
            '<cyan>Luca Gandolfi — interactive terminal</cyan>',
            '<dim>Type help to see all commands. Type exit to leave.</dim>',
            '<dim>Keyboard: Ctrl+Shift+T toggles this terminal.</dim>',
            ''
        ];
        return typeOut(lines);
    }

    function runCommand(raw) {
        const trimmed = raw.trim();
        const parts = trimmed.split(/\s+/);
        const cmd = (parts[0] || '').toLowerCase();
        const arg = parts.slice(1).join(' ');

        switch (cmd) {
            case '': return null;
            case 'clear':
            case 'cls':
                output.innerHTML = '';
                return null;
            case 'exit':
            case 'quit':
                close();
                return null;
            case 'theme': {
                const themes = ['matrix', 'vaporwave', 'pixel-art', 'retro', 'minimal', 'night', 'dark', 'light'];
                if (!arg) {
                    return ['Usage: theme <name>', 'Available: ' + themes.join(', ')];
                }
                const t = arg.toLowerCase();
                if (t === 'light') { document.documentElement.setAttribute('data-theme', 'light'); }
                else if (t === 'dark') { document.documentElement.removeAttribute('data-theme'); }
                else { document.documentElement.setAttribute('data-theme', t); }
                return ['Theme set to <green>' + escapeHtml(t) + '</green> 🎨'];
            }
            default:
                if (COMMANDS[cmd]) return COMMANDS[cmd].run();
                return ['<red>command not found:</red> ' + escapeHtml(cmd), '<dim>Type <green>help</green> for a list of commands.</dim>'];
        }
    }

    function handleCommand() {
        const raw = input.value;
        input.value = '';
        if (!raw.trim()) {
            printPrompt('');
            return;
        }
        history.push(raw);
        histIdx = history.length;
        printPrompt(raw);
        if (window.PortfolioXP) window.PortfolioXP.add(1, 'Terminal command', { cooldown: 2000, toast: false });
        if (busy) return;
        busy = true;
        try {
            const result = runCommand(raw);
            if (result) print(result);
        } finally {
            busy = false;
            scrollBottom();
        }
    }

    function printPrompt(cmdText) {
        const line = document.createElement('div');
        line.className = 'term-prompt-line';
        line.innerHTML = `
            <span class="term-prompt-user">luca@portfolio</span><span class="term-prompt-sep">:</span><span class="term-prompt-sign">~$</span>
            <span style="color:#e8f4ef">${escapeHtml(cmdText)}</span>`;
        output.appendChild(line);
        scrollBottom();
    }

    function buildUI() {
        overlay = document.createElement('div');
        overlay.id = 'terminal-overlay';
        overlay.innerHTML = `
            <div class="term-titlebar">
                <span class="term-dot term-dot-red"></span>
                <span class="term-dot term-dot-yellow"></span>
                <span class="term-dot term-dot-green"></span>
                <span class="term-title">luca@portfolio: ~ — bash</span>
                <button class="term-exit" type="button">✕ Exit</button>
            </div>
            <div id="terminal-output"></div>
            <div class="term-input-row">
                <span class="term-input-prompt">luca@portfolio:~$</span>
                <input id="terminal-input" autocomplete="off" spellcheck="false" />
                <span class="term-cursor"></span>
            </div>`;
        document.body.appendChild(overlay);

        output = overlay.querySelector('#terminal-output');
        input = overlay.querySelector('#terminal-input');

        overlay.querySelector('.term-exit').addEventListener('click', close);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (history.length) {
                    histIdx = Math.max(0, histIdx - 1);
                    input.value = history[histIdx];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                histIdx = Math.min(history.length, histIdx + 1);
                input.value = histIdx < history.length ? history[histIdx] : '';
            } else if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        });
    }

    function open() {
        if (!overlay) buildUI();
        isOpen = true;
        overlay.classList.add('term-open');
        if (output.children.length === 0) boot();
        document.body.style.overflow = 'hidden';
        setTimeout(() => input.focus(), 50);
    }

    function close() {
        isOpen = false;
        if (!overlay) return;
        overlay.classList.remove('term-open');
        document.body.style.overflow = '';
        input.blur();
    }

    function toggle() {
        if (isOpen) close();
        else open();
    }

    function init() {
        buildUI();
        // Ctrl+Shift+T toggles terminal
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                toggle();
            }
        });
        // Recruiter mode: disable easter-egg terminal? No — keep terminal available in both modes.
    }

    window.TerminalMode = { open, close, toggle, isOpen: () => isOpen };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
