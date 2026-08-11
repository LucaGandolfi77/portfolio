// === EASTER EGGS SYSTEM ===

const EasterEggs = {
  // 1. Konami Code
  konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
  konamiIndex: 0,
  
  initKonami() {
    document.addEventListener('keydown', (e) => {
      if (e.key === this.konamiCode[this.konamiIndex]) {
        this.konamiIndex++;
        if (this.konamiIndex === this.konamiCode.length) {
          this.activateMatrix();
          this.konamiIndex = 0;
        }
      } else {
        this.konamiIndex = 0;
      }
    });
  },
  
  activateMatrix() {
    document.documentElement.setAttribute('data-theme', 'matrix');
    this.showHint('🟢 Matrix mode activated!');
    this.createMatrixRain();
  },
  
  createMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-rain';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:0.3;';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    
    const interval = setInterval(draw, 33);
    
    setTimeout(() => {
      clearInterval(interval);
      canvas.remove();
    }, 10000);
  },
  
  // 2. Logo Click Explosion
  initLogoExplosion() {
    const logo = document.querySelector('.profile-img');
    if (!logo) return;
    
    logo.addEventListener('click', (e) => {
      e.stopPropagation();
      this.createExplosion(e.clientX, e.clientY);
    });
  },
  
  createExplosion(x, y) {
    const particles = 30;
    const colors = ['#00d4ff', '#ff006e', '#ffbe0b', '#06ffa5'];
    
    for (let i = 0; i < particles; i++) {
      const particle = document.createElement('div');
      const angle = (Math.PI * 2 * i) / particles;
      const velocity = 100 + Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 8px;
        height: 8px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
      `;
      
      document.body.appendChild(particle);
      
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0, 0.9, 0.57, 1)'
      }).onfinish = () => particle.remove();
    }
    
    this.showHint('💥 Boom!');
  },
  
  // 3. Keyboard Shortcuts
  shortcuts: {
    '?': () => EasterEggs.showShortcutsOverlay(),
    'e': () => EasterEggs.showEasterEggMenu(),
    'g': () => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' }),
    'p': () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
  },
  
  initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const handler = this.shortcuts[e.key];
      if (handler) handler();
    });
  },
  
  showShortcutsOverlay() {
    const existing = document.querySelector('.shortcuts-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'shortcuts-overlay';
    overlay.innerHTML = `
      <div class="shortcuts-modal">
        <h2>⌨️ Keyboard Shortcuts</h2>
        <ul>
          <li><kbd>?</kbd> Show this help</li>
          <li><kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> Command palette</li>
          <li><kbd>E</kbd> Easter eggs menu</li>
          <li><kbd>G</kbd> Jump to Games</li>
          <li><kbd>P</kbd> Jump to Projects</li>
          <li><kbd>↑↑↓↓←→←→BA</kbd> Secret mode</li>
        </ul>
        <button onclick="this.closest('.shortcuts-overlay').remove()">Close</button>
      </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  },
  
  showEasterEggMenu() {
    this.showHint('🥚 Easter eggs: Try Konami code, click logo, or press ?');
  },
  
  // 4. Scroll Patterns
  initScrollPatterns() {
    let lastScroll = 0;
    let scrollSpeed = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      scrollSpeed = Math.abs(currentScroll - lastScroll);
      
      if (scrollSpeed > 50) {
        document.body.classList.add('warp-speed');
        setTimeout(() => document.body.classList.remove('warp-speed'), 500);
      }
      
      if (currentScroll + window.innerHeight >= document.body.scrollHeight - 100) {
        if (!this.footerHintShown) {
          this.showHint('🎉 You found the bottom!');
          this.footerHintShown = true;
        }
      }
      
      lastScroll = currentScroll;
    });
  },
  
  // 5. Hover Secrets
  initHoverSecrets() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;
    
    let hoverTime = 0;
    let hoverInterval;
    
    aboutSection.addEventListener('mouseenter', () => {
      hoverInterval = setInterval(() => {
        hoverTime++;
        if (hoverTime >= 3) {
          this.showRandomQuote();
          hoverTime = 0;
          clearInterval(hoverInterval);
        }
      }, 1000);
    });
    
    aboutSection.addEventListener('mouseleave', () => {
      clearInterval(hoverInterval);
      hoverTime = 0;
    });
  },
  
  showRandomQuote() {
    const quotes = [
      "The best way to predict the future is to invent it. — Alan Kay",
      "Talk is cheap. Show me the code. — Linus Torvalds",
      "First, solve the problem. Then, write the code. — John Johnson",
      "Code is like humor. When you have to explain it, it's bad. — Cory House",
      "Simplicity is the soul of efficiency. — Austin Freeman"
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    this.showHint(`💭 ${quote}`);
  },
  
  // 6. Mobile Gestures
  initMobileGestures() {
    let lastTap = 0;
    
    document.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        if (e.target.closest('.header')) {
          const touch = e.changedTouches[0];
          this.createExplosion(touch.clientX, touch.clientY);
        }
      }
      lastTap = currentTime;
    });
    
    if (window.DeviceMotionEvent) {
      let lastX, lastY, lastZ;
      let lastTime;
      
      window.addEventListener('devicemotion', (e) => {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;
        
        const { x, y, z } = acc;
        const currentTime = new Date().getTime();
        
        if (lastTime && currentTime - lastTime > 100) {
          const deltaX = Math.abs(x - lastX);
          const deltaY = Math.abs(y - lastY);
          const deltaZ = Math.abs(z - lastZ);
          
          if (deltaX > 15 || deltaY > 15 || deltaZ > 15) {
            this.applyRandomTheme();
          }
        }
        
        lastX = x;
        lastY = y;
        lastZ = z;
        lastTime = currentTime;
      });
    }
  },
  
  applyRandomTheme() {
    const themes = ['retro', 'vaporwave', 'pixel-art', 'matrix'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    document.documentElement.setAttribute('data-theme', randomTheme);
    this.showHint(`🎨 Random theme: ${randomTheme}`);
  },
  
  // 7. Time-based Themes
  initTimeBased() {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    const day = new Date().getDate();
    
    if (hour >= 0 && hour < 6) {
      document.documentElement.setAttribute('data-theme', 'night');
    }
    
    if (month === 11 && day === 25) {
      document.documentElement.setAttribute('data-theme', 'christmas');
      this.showHint('🎄 Merry Christmas!');
    }
    
    if (month === 9 && day === 31) {
      document.documentElement.setAttribute('data-theme', 'halloween');
      this.showHint('👻 Happy Halloween!');
    }
  },
  
  // Helper: Show hint
  showHint(message) {
    const existing = document.querySelector('.easter-hint');
    if (existing) existing.remove();
    
    const hint = document.createElement('div');
    hint.className = 'easter-hint show';
    hint.innerHTML = message;
    document.body.appendChild(hint);
    
    setTimeout(() => hint.classList.remove('show'), 3000);
    setTimeout(() => hint.remove(), 3500);
  },
  
  // Init all
  init() {
    this.initKonami();
    this.initLogoExplosion();
    this.initShortcuts();
    this.initScrollPatterns();
    this.initHoverSecrets();
    this.initMobileGestures();
    this.initTimeBased();
    
    // Show initial hint after 5 seconds
    setTimeout(() => {
      this.showHint('💡 Try <kbd>Ctrl+K</kbd> or <kbd>↑↑↓↓←→←→BA</kbd>');
    }, 5000);
  }
};

// Avvia al DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => EasterEggs.init());
} else {
  EasterEggs.init();
}

// Guard: disable easter eggs in Recruiter/Business mode
(function patchEasterEggsForRecruiterMode() {
  const originals = {
    initKonami: EasterEggs.initKonami,
    initShortcuts: EasterEggs.initShortcuts,
    initTimeBased: EasterEggs.initTimeBased,
    showHint: EasterEggs.showHint,
    createExplosion: EasterEggs.createExplosion,
    applyRandomTheme: EasterEggs.applyRandomTheme,
  };

  function isDisabled() {
    return document.documentElement.dataset.easterDisabled === '1';
  }

  EasterEggs.initKonami = function () {
    document.addEventListener('keydown', (e) => {
      if (isDisabled()) return;
      if (e.key === this.konamiCode[this.konamiIndex]) {
        this.konamiIndex++;
        if (this.konamiIndex === this.konamiCode.length) {
          this.activateMatrix();
          this.konamiIndex = 0;
        }
      } else {
        this.konamiIndex = 0;
      }
    });
  };

  EasterEggs.initShortcuts = function () {
    document.addEventListener('keydown', (e) => {
      if (isDisabled()) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const handler = this.shortcuts[e.key];
      if (handler && e.key !== '?') handler(); // keep ? help disabled in business
    });
  };

  EasterEggs.initTimeBased = function () {
    if (isDisabled()) return;
    originals.initTimeBased.call(this);
  };

  EasterEggs.showHint = function (message) {
    if (isDisabled()) return;
    return originals.showHint.call(this, message);
  };

  EasterEggs.createExplosion = function (x, y) {
    if (isDisabled()) return;
    return originals.createExplosion.call(this, x, y);
  };

  EasterEggs.applyRandomTheme = function () {
    if (isDisabled()) return;
    return originals.applyRandomTheme.call(this);
  };
})();
