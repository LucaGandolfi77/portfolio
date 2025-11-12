// --- Theme toggle ---
const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme) {
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
}
// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) applyTheme(savedTheme);
themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next === 'light' ? 'light' : 'dark');
    localStorage.setItem('theme', next === 'light' ? 'light' : 'dark');
});

// --- Translations ---
const translations = {
    en: {
        nav: { about: 'About Me', skills: 'Skills', experience: 'Experience', achievements: 'Achievements', projects: 'Projects', books: 'Books', blog: 'Blog', testimonials: 'Testimonials', contact: 'Contact', cv: 'Download CV' },
        hero: { title: 'Luca Gandolfi — Full‑Stack Engineer', subtitle: 'Developer • Embedded Systems • AI • Web', contactBtn: 'Contact me', cvBtn: 'Download CV' },
        sections: { about: 'About Me', skills: 'Technical Skills', experience: 'Work Experience', achievements: 'Achievements & Certifications', contact: 'Personal Information', cv: 'Curriculum Vitae', social: 'Social & Contact', projects: 'My Projects', testimonials: 'Testimonials' },
        about: { p1: "Hello! I'm Luca, a passionate full-stack developer with a love for creating innovative digital solutions. With years of experience in web development, embedded systems and AI. I specialize in building modern, scalable applications that make a difference.", p2: 'My journey in tech started with curiosity and has evolved into a career driven by continuous learning and problem-solving. I believe in writing clean code, embracing new technologies, and creating user-centric experiences.', lifeIntro: 'I also created a short illustrated comic that tells the story of my life — a playful timeline in images.', lifeLink: 'Read my life in comics' },
        contact: { email: 'Email', phone: 'Phone', location: 'Location', specialization: 'Specialization' },
        cv: { download: 'Download CV' },
        footer: { text: '© 2025 Luca Gandolfi. Built with passion and technology.' }
    },
    es: {
        nav: { about: 'Sobre mí', skills: 'Habilidades', experience: 'Experiencia', achievements: 'Logros', projects: 'Proyectos', books: 'Libros', blog: 'Blog', testimonials: 'Testimonios', contact: 'Contacto', cv: 'Descargar CV' },
        hero: { title: 'Luca Gandolfi — Ingeniero Full‑Stack', subtitle: 'Desarrollador • Sistemas embebidos • IA • Web', contactBtn: 'Contáctame', cvBtn: 'Descargar CV' },
        sections: { about: 'Sobre mí', skills: 'Habilidades técnicas', experience: 'Experiencia laboral', achievements: 'Logros y Certificaciones', contact: 'Información personal', cv: 'Currículum Vitae', social: 'Redes & Contacto', projects: 'Mis Proyectos', testimonials: 'Testimonios' },
        about: { p1: '¡Hola! Soy Luca, un desarrollador full-stack apasionado por crear soluciones digitales innovadoras. Con años de experiencia en desarrollo web, sistemas embebidos y IA. Me especializo en construir aplicaciones modernas y escalables que marcan la diferencia.', p2: 'Mi trayectoria en tecnología comenzó con la curiosidad y se ha convertido en una carrera impulsada por el aprendizaje continuo y la resolución de problemas. Creo en escribir código limpio, adoptar nuevas tecnologías y crear experiencias centradas en el usuario.' },
        contact: { email: 'Correo', phone: 'Teléfono', location: 'Ubicación', specialization: 'Especialización' },
        cv: { download: 'Descargar CV' },
        footer: { text: '© 2025 Luca Gandolfi. Construido con pasión y tecnología.' }
    },
    zh: {
        nav: { about: '关于我', skills: '技能', experience: '经验', achievements: '成就', projects: '项目', books: '图书', blog: '博客', testimonials: '推荐', contact: '联系', cv: '下载简历' },
        hero: { title: '卢卡·甘多尔菲 — 全栈工程师', subtitle: '开发者 • 嵌入式系统 • 人工智能 • Web', contactBtn: '联系我', cvBtn: '下载简历' },
        sections: { about: '关于我', skills: '技术技能', experience: '工作经历', achievements: '成就与认证', contact: '个人信息', cv: '简历', social: '社交 & 联系', projects: '我的项目', testimonials: '推荐' },
        about: { p1: '你好！我是卢卡，一名热衷于创造创新数字解决方案的全栈开发者。在网络开发、嵌入式系统和人工智能领域有多年经验。我专注于构建现代且可扩展的应用程序。', p2: '我的技术之旅始于好奇心，并发展为以持续学习与解决问题为动力的职业。我相信编写整洁的代码、拥抱新技术并创造以用户为中心的体验。' },
        contact: { email: '邮箱', phone: '电话', location: '位置', specialization: '专长' },
        cv: { download: '下载简历' },
        footer: { text: '© 2025 卢卡·甘多尔菲。以热情与技术构建。' }
    },
    ru: {
        nav: { about: 'Обо мне', skills: 'Навыки', experience: 'Опыт', achievements: 'Достижения', projects: 'Проекты', books: 'Книги', blog: 'Блог', testimonials: 'Отзывы', contact: 'Контакт', cv: 'Скачать CV' },
        hero: { title: 'Лука Гандольфи — Full‑Stack инженер', subtitle: 'Разработчик • Встроенные системы • ИИ • Веб', contactBtn: 'Связаться', cvBtn: 'Скачать CV' },
        sections: { about: 'Обо мне', skills: 'Технические навыки', experience: 'Опыт работы', achievements: 'Достижения и сертификаты', contact: 'Личная информация', cv: 'Резюме', social: 'Соцсети & Контакт', projects: 'Мои проекты', testimonials: 'Отзывы' },
        about: { p1: 'Привет! Я Лука, увлеченный full-stack разработчик, создающий инновационные цифровые решения. Многолетний опыт в веб-разработке, встроенных системах и ИИ. Я специализируюсь на создании современных масштабируемых приложений.', p2: 'Моё путешествие в IT началось с любопытства и превратилось в карьеру, основанную на постоянном обучении и решении задач. Я верю в чистый код, освоение новых технологий и создание удобного для пользователей опыта.' },
        contact: { email: 'Эл. почта', phone: 'Телефон', location: 'Местоположение', specialization: 'Специализация' },
        cv: { download: 'Скачать CV' },
        footer: { text: '© 2025 Лука Гандольфи. Создано с страстью и технологиями.' }
    },
    de: {
        nav: { about: 'Über mich', skills: 'Fähigkeiten', experience: 'Erfahrung', achievements: 'Erfolge', projects: 'Projekte', books: 'Bücher', blog: 'Blog', testimonials: 'Referenzen', contact: 'Kontakt', cv: 'CV herunterladen' },
        hero: { title: 'Luca Gandolfi — Full‑Stack Entwickler', subtitle: 'Entwickler • Eingebettete Systeme • KI • Web', contactBtn: 'Kontaktiere mich', cvBtn: 'CV herunterladen' },
        sections: { about: 'Über mich', skills: 'Technische Fähigkeiten', experience: 'Berufserfahrung', achievements: 'Erfolge & Zertifikate', contact: 'Persönliche Informationen', cv: 'Lebenslauf', social: 'Soziales & Kontakt', projects: 'Meine Projekte', testimonials: 'Referenzen' },
        about: { p1: 'Hallo! Ich bin Luca, ein leidenschaftlicher Full‑Stack‑Entwickler, der gerne innovative digitale Lösungen erstellt. Mit mehrjähriger Erfahrung in Webentwicklung, Embedded Systems und KI. Ich spezialisiere mich auf moderne, skalierbare Anwendungen.', p2: 'Meine Reise in der Technik begann mit Neugier und entwickelte sich zu einer Karriere, die von kontinuierlichem Lernen und Problemlösung angetrieben wird. Ich glaube an sauberen Code, neue Technologien und benutzerzentrierte Erlebnisse.' },
        contact: { email: 'E‑Mail', phone: 'Telefon', location: 'Standort', specialization: 'Spezialisierung' },
        cv: { download: 'CV herunterladen' },
        footer: { text: '© 2025 Luca Gandolfi. Mit Leidenschaft und Technologie erstellt.' }
    },
    it: {
        nav: { about: 'Chi sono', skills: 'Competenze', experience: 'Esperienza', achievements: 'Risultati', projects: 'Progetti', books: 'Libri', blog: 'Blog', testimonials: 'Testimonianze', contact: 'Contatto', cv: 'Scarica CV' },
        hero: { title: 'Luca Gandolfi — Ingegnere Full‑Stack', subtitle: 'Sviluppatore • Sistemi Embedded • IA • Web', contactBtn: 'Contattami', cvBtn: 'Scarica CV' },
        sections: { about: 'Chi sono', skills: 'Competenze tecniche', experience: 'Esperienza lavorativa', achievements: 'Risultati e Certificazioni', contact: 'Informazioni personali', cv: 'Curriculum Vitae', social: 'Social & Contatto', projects: 'I miei progetti', testimonials: 'Testimonianze' },
        about: { p1: "Ciao! Sono Luca, uno sviluppatore full-stack appassionato di creare soluzioni digitali innovative. Con anni di esperienza nello sviluppo web, sistemi embedded e IA. Mi specializzo nella costruzione di applicazioni moderne e scalabili che fanno la differenza.", p2: 'Il mio percorso nella tecnologia è iniziato con la curiosità e si è evoluto in una carriera guidata dall\'apprendimento continuo e dalla risoluzione dei problemi. Credo nel codice pulito, nell\'adozione di nuove tecnologie e nella creazione di esperienze centrate sull\'utente.', lifeIntro: 'Ho anche creato un breve fumetto illustrato che racconta la mia vita — una timeline giocosa in immagini.', lifeLink: 'Leggi la mia vita a fumetti' },
        contact: { email: 'Email', phone: 'Telefono', location: 'Posizione', specialization: 'Specializzazione' },
        cv: { download: 'Scarica CV' },
        footer: { text: '© 2025 Luca Gandolfi. Costruito con passione e tecnologia.' }
    },
    fr: {
        nav: { about: 'À propos', skills: 'Compétences', experience: 'Expérience', achievements: 'Réalisations', projects: 'Projets', books: 'Livres', blog: 'Blog', testimonials: 'Témoignages', contact: 'Contact', cv: 'Télécharger le CV' },
        hero: { title: 'Luca Gandolfi — Ingénieur Full‑Stack', subtitle: 'Développeur • Systèmes embarqués • IA • Web', contactBtn: 'Contactez‑moi', cvBtn: 'Télécharger le CV' },
        sections: { about: 'À propos', skills: 'Compétences techniques', experience: 'Expérience professionnelle', achievements: 'Réalisations & Certifications', contact: 'Informations personnelles', cv: 'Curriculum Vitae', social: 'Social & Contact', projects: 'Mes projets', testimonials: 'Témoignages' },
        about: { p1: "Bonjour ! Je suis Luca, un développeur full-stack passionné par la création de solutions numériques innovantes. Avec plusieurs années d'expérience en développement web, systèmes embarqués et IA. Je me spécialise dans la création d'applications modernes et évolutives qui font la différence.", p2: "Mon parcours dans la tech a commencé par la curiosité et est devenu une carrière guidée par l'apprentissage continu et la résolution de problèmes. Je crois en l'écriture d'un code propre, l'adoption de nouvelles technologies et la création d'expériences centrées sur l'utilisateur." },
        contact: { email: 'Email', phone: 'Téléphone', location: 'Localisation', specialization: 'Spécialisation' },
        cv: { download: 'Télécharger le CV' },
        footer: { text: '© 2025 Luca Gandolfi. Construit avec passion et technologie.' }
    },
    ja: {
        nav: { about: '私について', skills: 'スキル', experience: '経験', achievements: '実績', projects: 'プロジェクト', books: '書籍', blog: 'ブログ', testimonials: '推薦', contact: '連絡先', cv: '履歴書をダウンロード' },
        hero: { title: 'ルカ・ガンドルフィ — フルスタックエンジニア', subtitle: '開発者 • 組み込みシステム • AI • Web', contactBtn: 'お問い合わせ', cvBtn: '履歴書をダウンロード' },
        sections: { about: '私について', skills: '技術スキル', experience: '職務経歴', achievements: '実績と認定', contact: '個人情報', cv: '履歴書', social: 'ソーシャル & 連絡先', projects: '私のプロジェクト', testimonials: '推薦' },
        about: { p1: 'こんにちは！私はルカ、革新的なデジタルソリューションの作成を愛するフルスタック開発者です。ウェブ開発、組み込みシステム、AIでの豊富な経験があります。モダンでスケーラブルなアプリケーション構築を専門としています。', p2: '技術への道は好奇心から始まり、継続的な学習と問題解決によって駆動されるキャリアに発展しました。私はクリーンなコード、新しい技術の採用、ユーザー中心の体験を信じています。' },
        contact: { email: 'メール', phone: '電話', location: '所在地', specialization: '専門分野' },
        cv: { download: '履歴書をダウンロード' },
        footer: { text: '© 2025 ルカ・ガンドルフィ。情熱と技術で作成。' }
    }
};

// Expose the embedded translations on window so loadTranslations fallback can use them
window.translations = window.translations || {};
// Merge the embedded `translations` object into window.translations for each language
Object.keys(translations).forEach(lang => {
    window.translations[lang] = Object.assign(window.translations[lang] || {}, translations[lang]);
});

// Try to load translations from /i18n/<lang>.json first, fall back to the embedded `translations` object
async function loadTranslations(lang) {
    if (!lang) lang = 'en';
    try {
        const res = await fetch('/i18n/' + lang + '.json');
        if (res.ok) return await res.json();
        throw new Error('fetch-not-ok');
    } catch (err) {
        // fallback to inline translations bundle if available
        console.warn('Failed to fetch /i18n/' + lang + '.json — falling back to embedded translations.', err);
        if (window.translations && window.translations[lang]) return window.translations[lang];
        return window.translations && window.translations['en'] ? window.translations['en'] : {};
    }
}

function getNested(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
}

// applyTranslations now uses loadTranslations (async). It sets any [data-i18n] text content.
async function applyTranslations(lang) {
    const t = await loadTranslations(lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        // prefer nested lookup in fetched JSON, fallback to embedded translations if needed
        let txt = getNested(t, key);
        if (txt === undefined && window.translations && window.translations[lang]) txt = getNested(window.translations[lang], key);
        if (txt === undefined && window.translations && window.translations['en']) txt = getNested(window.translations['en'], key);
        if (txt !== undefined) el.innerText = txt;
    });
    const select = document.getElementById('langSelect');
    if (select) select.value = lang || 'en';
}

// Load preferred language
const savedLang = localStorage.getItem('lang') || 'en';
document.addEventListener('DOMContentLoaded', () => applyTranslations(savedLang));

// Handle language change
const langSelect = document.getElementById('langSelect');
if (langSelect) {
    langSelect.value = savedLang;
    langSelect.addEventListener('change', (e) => {
        const v = e.target.value || 'en';
        applyTranslations(v);
        localStorage.setItem('lang', v);
    });
}

// --- EmailJS configuration (replace with your values) ---
const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';
const EMAILJS_PUBLIC_KEY = 'your_public_key';
const RECAPTCHA_SITE_KEY = 'your_recaptcha_site_key';

// Initialize EmailJS SDK (public key)
if (window.emailjs) {
    try { emailjs.init(EMAILJS_PUBLIC_KEY); } catch (e) { console.warn('emailjs init failed', e); }
}

// --- Contact modal ---
function createContactModal() {
    const modal = document.createElement('div');
    modal.id = 'contactModal';
    modal.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;z-index:2000;pointer-events:none;';
    modal.innerHTML = `
        <div style="background:rgba(10,22,40,0.95);backdrop-filter:blur(8px);padding:24px;border-radius:12px;max-width:520px;width:90%;box-shadow:0 10px 40px rgba(0,0,0,0.6);pointer-events:all;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="margin:0;color:var(--accent);">Contact me</h3>
                <button id="modalClose" aria-label="Close contact form" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer">✕</button>
            </div>
            <form id="contactForm">
                <label style="display:block;margin-bottom:8px;color:#a0c0e0">Email</label>
                <input type="email" id="cfEmail" required style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;background:transparent;color:white">
                <label style="display:block;margin-bottom:8px;color:#a0c0e0">Message</label>
                <textarea id="cfMessage" required rows="5" style="width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;background:transparent;color:white"></textarea>
                <div id="cfStatus" role="status" aria-live="polite" style="margin-bottom:8px;color:#a0c0e0;min-height:18px"></div>
                <div style="display:flex;gap:8px;justify-content:flex-end;">
                    <button type="button" id="modalCancel" class="btn btn-ghost">Cancel</button>
                    <button type="submit" class="btn btn-primary">Send</button>
                </div>
            </form>
        </div>`;
    document.body.appendChild(modal);
    modal.setAttribute('aria-hidden', 'true');

    function closeModal() { modal.style.display = 'none'; modal.style.pointerEvents = 'none'; }
    function openModal() { modal.style.display = 'flex'; modal.style.pointerEvents = 'all'; }

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);

    let previousActive = null;
    function onKeyDown(e) {
        if (e.key === 'Escape') closeModal();
    }

    function openModalWithFocus() {
        previousActive = document.activeElement;
        openModal();
        document.body.style.overflow = 'hidden';
        modal.setAttribute('aria-hidden', 'false');
        const first = modal.querySelector('#cfEmail');
        if (first) first.focus();
        document.addEventListener('keydown', onKeyDown);
    }

    function closeModalWithFocus() {
        closeModal();
        document.body.style.overflow = '';
        modal.setAttribute('aria-hidden', 'true');
        if (previousActive && previousActive.focus) previousActive.focus();
        document.removeEventListener('keydown', onKeyDown);
    }

    document.getElementById('contactForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = modal.querySelector('button[type="submit"]');
        const statusEl = modal.querySelector('#cfStatus');
        const email = document.getElementById('cfEmail').value.trim();
        const message = document.getElementById('cfMessage').value.trim();

        if (!email || !message) {
            statusEl.textContent = 'Please fill email and message.';
            statusEl.style.color = 'orange';
            return;
        }

        if (EMAILJS_SERVICE_ID.includes('your_') || EMAILJS_TEMPLATE_ID.includes('your_') || EMAILJS_PUBLIC_KEY.includes('your_')) {
            statusEl.textContent = 'EmailJS non configurato. Imposta EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID e EMAILJS_PUBLIC_KEY nello script.';
            statusEl.style.color = 'orange';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        const prevText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending <span class="spinner" aria-hidden="true"></span>';
        statusEl.textContent = '';

        try {
            let recaptchaToken = null;
            if (window.grecaptcha && RECAPTCHA_SITE_KEY && !RECAPTCHA_SITE_KEY.includes('your_')) {
                try {
                    recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
                } catch (rcErr) {
                    console.warn('reCAPTCHA execute failed', rcErr);
                }
            }

            const templateParams = {
                from_email: email,
                message: message,
                subject: 'New contact from portfolio',
                recaptcha_token: recaptchaToken || ''
            };

            const res = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            statusEl.innerHTML = '✅ Message sent. Thank you!';
            statusEl.style.color = 'lightgreen';
            document.getElementById('cfEmail').value = '';
            document.getElementById('cfMessage').value = '';
            submitBtn.innerHTML = 'Sent';
            setTimeout(() => closeModalWithFocus(), 1200);
        } catch (err) {
            console.error('EmailJS send error', err);
            statusEl.textContent = 'Errore durante l\'invio. Riprova più tardi.';
            statusEl.style.color = 'salmon';
        } finally {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
            submitBtn.innerHTML = prevText;
        }
    });

    return { open: openModalWithFocus, close: closeModalWithFocus };
}

const contactModal = createContactModal();
const contactBtn = document.getElementById('contactBtn');
if (contactBtn) contactBtn.addEventListener('click', (e) => {
    const target = document.querySelector('#contact');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const navContact = document.querySelector('.nav-link[href="#contact"]');
if (navContact) {
    navContact.addEventListener('click', (e) => {
        e.preventDefault();
        if (burgerMenu.classList.contains('active')) toggleMenu();
        setTimeout(() => {
            try { if (contactModal && typeof contactModal.open === 'function') contactModal.open(); } catch (err) { }
        }, 350);
    });
}

// Project configuration
const projects = [
    {
        title: "E-Commerce Platform",
        description: "Full-stack e-commerce solution with real-time inventory management and payment integration",
        image: "./assets/project1.jpg",
        link: "https://github.com/lucagandolfi/project1",
        tags: ["React", "Node.js", "MongoDB"]
    },
    {
        title: "AI Chat Assistant",
        description: "Intelligent chatbot powered by machine learning for customer support automation",
        image: "./assets/project2.gif",
        link: "https://github.com/lucagandolfi/project2",
        tags: ["Python", "TensorFlow", "Flask"]
    },
    {
        title: "Task Management App",
        description: "Collaborative project management tool with real-time updates and team collaboration features",
        image: "./assets/project3.jpg",
        link: "https://github.com/lucagandolfi/project3",
        tags: ["Vue.js", "Firebase", "PWA"]
    }
];

// Burger menu toggle
const burgerMenu = document.getElementById('burgerMenu');
const sideNav = document.getElementById('sideNav');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-link');

function toggleMenu() {
    burgerMenu.classList.toggle('active');
    sideNav.classList.toggle('active');
    overlay.classList.toggle('active');
}

burgerMenu.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#contact') return;
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = href;
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            toggleMenu();
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    });
});

// Generate animated particles
function createParticles() {
    const particles = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particles.appendChild(particle);
    }
    
    // Create stars and lights
    createStarsAndLights();
}

function createStarsAndLights() {
    const particlesContainer = document.getElementById('particles');
    
    // Create stars
    for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 3) + 's';
        star.style.opacity = Math.random() * 0.7 + 0.3;
        particlesContainer.appendChild(star);
    }
    
    // Create lights
    for (let i = 0; i < 15; i++) {
        const light = document.createElement('div');
        light.className = 'light';
        light.style.left = Math.random() * 100 + '%';
        light.style.top = Math.random() * 100 + '%';
        light.style.animationDelay = Math.random() * 4 + 's';
        light.style.animationDuration = (Math.random() * 3 + 4) + 's';
        light.style.setProperty('--drift-delay', (Math.random() * 6) + 's');
        particlesContainer.appendChild(light);
    }
}

// Load projects
function loadProjects() {
    const grid = document.getElementById('projectsGrid');
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.onclick = () => window.open(project.link, '_blank');
        
        const tagsHtml = project.tags ? 
            `<div class="project-tags">${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}</div>` : '';
        
        card.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-image" loading="lazy"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%231a2940%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%2300d4ff%22 font-size=%2224%22%3E${project.title}%3C/text%3E%3C/svg%3E'">
            <div class="project-info">
                <div class="project-title">${project.title}</div>
                <div class="project-description">${project.description}</div>
                ${tagsHtml}
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- Interactive bubbles for Highlights ---
function createBubbles() {
    const keywords = ["The","Pianoforte","Musica","Poesie","Fisica Quantistica","Tecnologia","Storia"];
    const wrap = document.getElementById('bubblesWrap');
    const panel = document.getElementById('bubblePanel');
    if(!wrap) return;

    const desc = {
        'The': 'Curiosity and wonder — a short personal note.',
        'Pianoforte': 'Pianoforte: learned pieces and practice. Music shapes my rhythm.',
        'Musica': 'Music is central: composing, listening, and inspiration.',
        'Poesie': 'Poesie: I write and read poems to capture moments.',
        'Fisica Quantistica': 'Fascinated by quantum physics and its weird beauty.',
        'Tecnologia': 'Technology: building practical solutions with elegant code.',
        'Storia': 'Storia: history shapes perspective and context.'
    };

    wrap.innerHTML = '';

    keywords.forEach((k,i)=>{
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'bubble ' + (i%3===0? 'large animate':'small animate');
        b.style.setProperty('--i', i);
        b.setAttribute('aria-pressed','false');
        b.setAttribute('title', k);
        b.innerText = k;
        b.addEventListener('click', ()=>{
            wrap.querySelectorAll('.bubble').forEach(bb=> bb.setAttribute('aria-pressed','false'));
            b.setAttribute('aria-pressed','true');
            panel.style.opacity = '0';
            setTimeout(()=>{ panel.textContent = desc[k] || ''; panel.style.opacity = '1'; }, 160);
        });
        b.addEventListener('keydown',(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); b.click(); } });
        wrap.appendChild(b);
    });
}

// Scroll animation
function handleScroll() {
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        if (isVisible) {
            section.classList.add('visible');
        }
    });
}

// Poems expand/collapse wiring
function createPoems() {
    const list = document.getElementById('poemsList');
    if (!list) return;
    list.querySelectorAll('.acc-item').forEach(item => {
        const btn = item.querySelector('.acc-btn');
        const content = item.querySelector('.acc-content');
        const caret = item.querySelector('.caret');
        if (!btn || !content) return;
        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                btn.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = '0';
                content.setAttribute('aria-hidden', 'true');
                caret.style.transform = '';
            } else {
                list.querySelectorAll('.acc-btn[aria-expanded="true"]').forEach(ob => {
                    ob.setAttribute('aria-expanded', 'false');
                    const oc = ob.closest('.acc-item').querySelector('.acc-content');
                    if (oc) { oc.style.maxHeight = '0'; oc.setAttribute('aria-hidden', 'true'); }
                    const ocaret = ob.closest('.acc-item').querySelector('.caret'); if (ocaret) ocaret.style.transform = '';
                });
                btn.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
                content.style.maxHeight = content.scrollHeight + 'px';
                caret.style.transform = 'rotate(90deg)';
            }
        });
        btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
    });
}

// Profile image fallback
document.getElementById('profileImg').onerror = function() {
    this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Ccircle cx=%22100%22 cy=%22100%22 r=%22100%22 fill=%22%231a2940%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%2300d4ff%22 font-size=%2248%22 font-weight=%22bold%22%3ELG%3C/text%3E%3C/svg%3E';
};

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    loadProjects();
    createBubbles();
    handleScroll();
    createPoems();

    const quickSearch = document.getElementById('quickSearch');
    if (quickSearch) {
        quickSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = quickSearch.value.trim().toLowerCase();
                if (val === 'easter') {
                    window.location.href = 'easter_egg.html';
                }
            }
        });
    }

    // Achievements Carousel
    const carousel = document.getElementById('achievementsCarousel');
    const arrowLeft = document.getElementById('achievementsArrowLeft');
    const arrowRight = document.getElementById('achievementsArrowRight');
    if (carousel && arrowLeft && arrowRight) {
        const scrollAmount = 250;
        arrowLeft.addEventListener('click', () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        arrowRight.addEventListener('click', () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
        
        // Update arrow visibility
        const updateArrows = () => {
            arrowLeft.style.opacity = carousel.scrollLeft > 0 ? '1' : '0.3';
            arrowRight.style.opacity = (carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 10) ? '1' : '0.3';
        };
        carousel.addEventListener('scroll', updateArrows);
        window.addEventListener('resize', updateArrows);
        updateArrows();
    }

    (async function populateMemesPreview(){
        const preview = document.getElementById('memesPreview');
        if (!preview) return;
        try {
            const res = await fetch('/assets/memes/index.json', { cache: 'no-cache' });
            let imgs = [];
            if (res && res.ok) {
                const j = await res.json();
                if (j && Array.isArray(j.images)) imgs = j.images.map(i => typeof i === 'string' ? { file: i } : i);
            }
            if (imgs.length === 0) {
                for (let i = 1; i <= 12; i++) imgs.push({ file: `meme${i}.jpg` });
            }

            preview.innerHTML = '';
            imgs.slice(0,6).forEach((item, idx) => {
                const wrapper = document.createElement('a');
                wrapper.href = `memes.html?i=${idx}`;
                wrapper.style.display = 'block';
                wrapper.style.borderRadius = '8px';
                wrapper.style.overflow = 'hidden';
                wrapper.style.background = 'rgba(255,255,255,0.02)';
                wrapper.style.border = '1px solid rgba(255,255,255,0.03)';
                wrapper.style.minHeight = '60px';
                wrapper.style.display = 'inline-block';

                const img = document.createElement('img');
                img.src = `assets/memes/${item.file}`;
                img.alt = item.caption || item.file || 'meme';
                img.style.width = '100%';
                img.style.display = 'block';
                img.style.objectFit = 'cover';
                img.style.height = '72px';
                img.loading = 'lazy';
                img.onerror = function(){ this.style.opacity = 0.45; this.parentElement.innerHTML = `<div style='padding:8px;color:#9fcfff;opacity:0.6'>${item.file}</div>` };

                wrapper.appendChild(img);
                preview.appendChild(wrapper);
            });
        } catch (err) {
        }
    })();
});

window.addEventListener('scroll', handleScroll);
