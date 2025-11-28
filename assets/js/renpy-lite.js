/**
 * RenPy-Lite JS
 * A lightweight Visual Novel engine for the web, inspired by Ren'Py.
 * 
 * Usage:
 * RenPy.init({ container: 'game-container' });
 * RenPy.define('e', 'Eileen', '#c8ffc8');
 * RenPy.script({
 *   start: [
 *     "scene bg room",
 *     "show eileen happy",
 *     "e 'Hello, world!'",
 *     { choice: "What to do?", options: { "Say hi": "say_hi", "Ignore": "ignore" } }
 *   ]
 * });
 * RenPy.run();
 */

const RenPy = (function() {
    // State
    const state = {
        characters: {},
        images: {},
        script: {},
        label: 'start',
        index: 0,
        history: [],
        waitingForInput: false,
        inventory: [],
        metCharacters: new Set()
    };

    // DOM Elements
    let container, bgLayer, charLayer, uiLayer, dialogueBox, nameLabel, dialogueText, choiceMenu, menuOverlay;

    // Config
    const config = {
        typingSpeed: 30
    };

    // --- Initialization ---
    function init(opts) {
        const contId = opts.container || 'renpy-game';
        container = document.getElementById(contId);
        
        if (!container) {
            console.error("RenPy: Container not found");
            return;
        }

        // Inject Styles
        const style = document.createElement('style');
        style.textContent = `
            .rp-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
            .rp-bg { background-size: cover; background-position: center; transition: background 0.5s; }
            .rp-chars { display: flex; align-items: flex-end; justify-content: center; }
            .rp-char { max-height: 90%; max-width: 40%; transition: 0.3s; filter: drop-shadow(0 0 10px rgba(0,0,0,0.3)); }
            .rp-ui { pointer-events: none; display: flex; flex-direction: column; justify-content: flex-end; padding-bottom: 20px; align-items: center; }
            .rp-box { 
                width: 90%; max-width: 1000px; min-height: 150px; 
                background: rgba(0, 0, 0, 0.8); border: 2px solid rgba(255,255,255,0.2); border-radius: 10px; 
                padding: 20px; pointer-events: auto; cursor: pointer; 
                display: flex; flex-direction: column;
                backdrop-filter: blur(5px);
            }
            .rp-name { font-size: 1.4rem; font-weight: bold; margin-bottom: 8px; color: #fff; text-shadow: 1px 1px 2px #000; }
            .rp-text { font-size: 1.1rem; color: #fff; line-height: 1.5; }
            .rp-choice-overlay { 
                position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.6); display: none; 
                flex-direction: column; justify-content: center; align-items: center; gap: 15px; 
                pointer-events: auto; z-index: 100;
            }
            .rp-btn {
                padding: 15px 40px; font-size: 1.2rem; background: rgba(255,255,255,0.9); color: #000;
                border: none; border-radius: 30px; cursor: pointer; transition: 0.2s; min-width: 300px;
                font-family: inherit; font-weight: bold;
            }
            .rp-btn:hover { transform: scale(1.05); background: #fff; color: #0984e3; }
            .rp-menu-btn {
                position: absolute; top: 20px; right: 20px; pointer-events: auto;
                background: rgba(0,0,0,0.5); color: #fff; border: 1px solid #fff;
                padding: 8px 16px; border-radius: 4px; cursor: pointer; z-index: 50;
            }
            .rp-menu-overlay {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.9); display: none; z-index: 200;
                color: #fff; padding: 40px; box-sizing: border-box; pointer-events: auto;
                flex-direction: column;
            }
            .rp-menu-title { font-size: 2rem; margin-bottom: 20px; border-bottom: 1px solid #555; padding-bottom: 10px; }
            .rp-menu-section { margin-bottom: 30px; }
            .rp-menu-list { display: flex; flex-wrap: wrap; gap: 10px; }
            .rp-tag { background: #333; padding: 5px 10px; border-radius: 4px; border: 1px solid #555; }
            .rp-close-btn {
                position: absolute; top: 20px; right: 20px; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer;
            }
            .rp-hidden { display: none !important; }
        `;
        document.head.appendChild(style);

        // Create Layers
        bgLayer = document.createElement('div'); bgLayer.className = 'rp-layer rp-bg';
        charLayer = document.createElement('div'); charLayer.className = 'rp-layer rp-chars';
        uiLayer = document.createElement('div'); uiLayer.className = 'rp-layer rp-ui';
        
        // UI Components
        dialogueBox = document.createElement('div'); dialogueBox.className = 'rp-box';
        nameLabel = document.createElement('div'); nameLabel.className = 'rp-name';
        dialogueText = document.createElement('div'); dialogueText.className = 'rp-text';
        
        dialogueBox.appendChild(nameLabel);
        dialogueBox.appendChild(dialogueText);
        uiLayer.appendChild(dialogueBox);

        // Menu Button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'rp-menu-btn';
        menuBtn.textContent = 'MENU';
        menuBtn.onclick = toggleMenu;
        uiLayer.appendChild(menuBtn);

        // Choice Menu
        choiceMenu = document.createElement('div'); choiceMenu.className = 'rp-choice-overlay';

        // Menu Overlay (Inventory/Status)
        menuOverlay = document.createElement('div'); menuOverlay.className = 'rp-menu-overlay';
        menuOverlay.innerHTML = `
            <button class="rp-close-btn" onclick="RenPy.toggleMenu()">×</button>
            <div class="rp-menu-title">Status</div>
            <div class="rp-menu-section">
                <h3>Inventory</h3>
                <div class="rp-menu-list" id="rp-inventory-list"></div>
            </div>
            <div class="rp-menu-section">
                <h3>Characters Met</h3>
                <div class="rp-menu-list" id="rp-chars-list"></div>
            </div>
        `;

        // Assemble
        container.appendChild(bgLayer);
        container.appendChild(charLayer);
        container.appendChild(uiLayer);
        container.appendChild(choiceMenu);
        container.appendChild(menuOverlay);

        // Event Listeners
        dialogueBox.addEventListener('click', () => {
            if (!state.waitingForInput) next();
        });
    }

    // --- API ---
    function define(id, name, color) {
        state.characters[id] = { name, color };
    }

    function image(name, src) {
        state.images[name] = src;
    }

    function script(data) {
        state.script = data;
    }

    function run(startLabel = 'start') {
        state.label = startLabel;
        state.index = 0;
        processLine();
    }

    function toggleMenu() {
        const isHidden = menuOverlay.style.display === 'none' || menuOverlay.style.display === '';
        menuOverlay.style.display = isHidden ? 'flex' : 'none';
        
        if (isHidden) {
            updateMenuUI();
        }
    }

    function updateMenuUI() {
        const invList = document.getElementById('rp-inventory-list');
        const charList = document.getElementById('rp-chars-list');
        
        invList.innerHTML = state.inventory.length ? '' : '<span style="color:#888">Empty</span>';
        state.inventory.forEach(item => {
            const tag = document.createElement('div');
            tag.className = 'rp-tag';
            tag.textContent = item;
            invList.appendChild(tag);
        });

        charList.innerHTML = state.metCharacters.size ? '' : '<span style="color:#888">None</span>';
        state.metCharacters.forEach(charId => {
            const char = state.characters[charId];
            if (char) {
                const tag = document.createElement('div');
                tag.className = 'rp-tag';
                tag.style.borderColor = char.color;
                tag.style.color = char.color;
                tag.textContent = char.name;
                charList.appendChild(tag);
            }
        });
    }

    // --- Engine Logic ---
    function processLine() {
        if (!state.script[state.label] || state.index >= state.script[state.label].length) {
            return; // End
        }

        const line = state.script[state.label][state.index];

        // Parse String Commands
        if (typeof line === 'string') {
            const parts = line.split(' ');
            const cmd = parts[0];

            if (cmd === 'scene') {
                const img = parts[1];
                bgLayer.style.backgroundImage = state.images[img] ? `url('${state.images[img]}')` : 'none';
                if (!state.images[img]) bgLayer.style.backgroundColor = img; 
                state.index++;
                processLine();
            } 
            else if (cmd === 'show') {
                const charId = parts[1];
                state.metCharacters.add(charId); // Track character
                
                const charImg = state.images[charId] || null;
                const existing = document.getElementById(`rp-char-${charId}`);
                if (existing) existing.remove();

                if (charImg) {
                    const img = document.createElement('img');
                    img.src = charImg;
                    img.className = 'rp-char';
                    img.id = `rp-char-${charId}`;
                    charLayer.appendChild(img);
                } else {
                    const div = document.createElement('div');
                    div.className = 'rp-char';
                    div.id = `rp-char-${charId}`;
                    div.textContent = charId; 
                    div.style.fontSize = '10rem';
                    charLayer.appendChild(div);
                }
                state.index++;
                processLine();
            }
            else if (cmd === 'hide') {
                const charId = parts[1];
                const el = document.getElementById(`rp-char-${charId}`);
                if (el) el.remove();
                state.index++;
                processLine();
            }
            else if (cmd === 'jump') {
                const label = parts[1];
                state.label = label;
                state.index = 0;
                processLine();
            }
            else if (cmd === 'add_item') {
                // add_item Item Name (can contain spaces)
                const item = line.substring(9).trim();
                if (!state.inventory.includes(item)) {
                    state.inventory.push(item);
                    // Optional: Notification
                }
                state.index++;
                processLine();
            }
            else if (cmd === 'remove_item') {
                const item = line.substring(12).trim();
                state.inventory = state.inventory.filter(i => i !== item);
                state.index++;
                processLine();
            }
            else {
                // Character Say
                if (state.characters[cmd]) {
                    state.metCharacters.add(cmd); // Track character if they speak
                    const text = line.substring(line.indexOf(' ') + 1).replace(/^['"]|['"]$/g, '');
                    showDialogue(state.characters[cmd], text);
                } else {
                    showDialogue(null, line.replace(/^['"]|['"]$/g, ''));
                }
            }
        } 
        // Object Commands
        else if (typeof line === 'object') {
            if (line.choice) {
                showMenu(line.choice, line.options);
            }
        }
    }

    function showDialogue(char, text) {
        if (char) {
            nameLabel.textContent = char.name;
            nameLabel.style.color = char.color || '#fff';
        } else {
            nameLabel.textContent = '';
        }
        dialogueText.textContent = text;
        state.waitingForInput = false;
    }

    function showMenu(prompt, options) {
        state.waitingForInput = true;
        choiceMenu.innerHTML = '';
        choiceMenu.style.display = 'flex';

        if (prompt) {
            const p = document.createElement('div');
            p.textContent = prompt;
            p.style.color = '#fff';
            p.style.fontSize = '1.5rem';
            p.style.marginBottom = '20px';
            choiceMenu.appendChild(p);
        }

        for (const [label, target] of Object.entries(options)) {
            const btn = document.createElement('button');
            btn.className = 'rp-btn';
            btn.textContent = label;
            btn.onclick = () => {
                choiceMenu.style.display = 'none';
                state.waitingForInput = false;
                
                if (target === 'exit') {
                    window.history.back();
                } else {
                    state.label = target;
                    state.index = 0;
                    processLine();
                }
            };
            choiceMenu.appendChild(btn);
        }
    }

    function next() {
        state.index++;
        processLine();
    }

    return {
        init,
        define,
        image,
        script,
        run,
        toggleMenu
    };
})();
