/**
 * Cookie Consent Management System
 * GDPR-compliant cookie consent with category-based preferences.
 * No external dependencies — vanilla JS only.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'cookie_consent';
    var CONSENT_VERSION = '1.0';
    var CONSENT_MAX_AGE_DAYS = 180; // 6 months

    /* ── Consent Read/Write ───────────────────────────────── */

    function getConsent() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var consent = JSON.parse(raw);
            // Check expiry (6 months)
            if (consent.timestamp) {
                var saved = new Date(consent.timestamp).getTime();
                var now = Date.now();
                var maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
                if (now - saved > maxAge) {
                    clearConsent();
                    return null;
                }
            }
            // Check version
            if (consent.version !== CONSENT_VERSION) {
                clearConsent();
                return null;
            }
            return consent;
        } catch (e) {
            return null;
        }
    }

    function setConsent(prefs) {
        var consent = {
            necessary: true,
            analytics: !!prefs.analytics,
            marketing: !!prefs.marketing,
            functional: !!prefs.functional,
            timestamp: new Date().toISOString(),
            version: CONSENT_VERSION
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        } catch (e) { /* localStorage full or blocked */ }
        applyConsent(consent);
        hideBanner();
        hideModal();
    }

    function hasConsent(category) {
        var c = getConsent();
        if (!c) return false;
        if (category === 'necessary') return true;
        return !!c[category];
    }

    function clearConsent() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) { /* ignore */ }
    }

    /* ── Script Injection After Consent ──────────────────── */

    function applyConsent(consent) {
        if (consent.functional) {
            loadFunctionalScripts();
        }
        if (consent.analytics) {
            loadAnalyticsScripts();
        }
        if (consent.marketing) {
            loadMarketingScripts();
        }
    }

    function loadFunctionalScripts() {
        // Google reCAPTCHA v3 (only load if site key is configured)
        var recaptchaKey = document.querySelector('meta[name="recaptcha-site-key"]');
        if (recaptchaKey && recaptchaKey.content && recaptchaKey.content !== 'YOUR_RECAPTCHA_SITE_KEY') {
            if (!document.getElementById('recaptcha-script')) {
                var s = document.createElement('script');
                s.id = 'recaptcha-script';
                s.src = 'https://www.google.com/recaptcha/api.js?render=' + recaptchaKey.content;
                s.async = true;
                document.head.appendChild(s);
            }
        }
    }

    function loadAnalyticsScripts() {
        // Google Analytics 4 (placeholder — replace GA_MEASUREMENT_ID)
        // Uncomment and configure when GA is set up:
        /*
        if (!document.getElementById('ga-script')) {
            var s = document.createElement('script');
            s.id = 'ga-script';
            s.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
            s.async = true;
            document.head.appendChild(s);
            s.onload = function () {
                window.dataLayer = window.dataLayer || [];
                function gtag() { dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', 'GA_MEASUREMENT_ID', { anonymize_ip: true });
            };
        }
        */
    }

    function loadMarketingScripts() {
        // No marketing scripts currently used.
        // Add Facebook Pixel, Google Ads, etc. here if needed.
    }

    /* ── Banner Show/Hide ────────────────────────────────── */

    function showBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner) banner.removeAttribute('hidden');
    }

    function hideBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner) banner.setAttribute('hidden', '');
    }

    /* ── Modal Show/Hide ─────────────────────────────────── */

    function showModal() {
        var modal = document.getElementById('cookie-modal');
        if (!modal) return;
        modal.removeAttribute('hidden');
        // Sync toggles with current consent
        var consent = getConsent();
        var toggles = modal.querySelectorAll('input[data-category]');
        for (var i = 0; i < toggles.length; i++) {
            var cat = toggles[i].getAttribute('data-category');
            if (cat === 'necessary') {
                toggles[i].checked = true;
                toggles[i].disabled = true;
            } else {
                toggles[i].checked = consent ? !!consent[cat] : false;
            }
        }
        // Trap focus inside modal
        modal.focus();
    }

    function hideModal() {
        var modal = document.getElementById('cookie-modal');
        if (modal) modal.setAttribute('hidden', '');
    }

    /* ── Event Handlers ──────────────────────────────────── */

    function onAcceptAll() {
        setConsent({ analytics: true, marketing: true, functional: true });
    }

    function onRejectAll() {
        setConsent({ analytics: false, marketing: false, functional: false });
    }

    function onSavePreferences() {
        var modal = document.getElementById('cookie-modal');
        if (!modal) return;
        var prefs = {};
        var toggles = modal.querySelectorAll('input[data-category]');
        for (var i = 0; i < toggles.length; i++) {
            var cat = toggles[i].getAttribute('data-category');
            prefs[cat] = toggles[i].checked;
        }
        setConsent(prefs);
    }

    function onManagePreferences() {
        hideBanner();
        showModal();
    }

    /* ── Initialization ──────────────────────────────────── */

    function init() {
        // Bind banner buttons
        bindClick('cookie-accept-all', onAcceptAll);
        bindClick('cookie-reject-all', onRejectAll);
        bindClick('cookie-manage-btn', onManagePreferences);

        // Bind modal buttons
        bindClick('cookie-modal-accept-all', onAcceptAll);
        bindClick('cookie-modal-reject-all', onRejectAll);
        bindClick('cookie-modal-save', onSavePreferences);
        bindClick('cookie-modal-close', hideModal);

        // Footer "Manage Cookie Preferences" link
        bindClick('cookie-preferences-link', function (e) {
            e.preventDefault();
            showModal();
        });

        // Close modal on overlay click
        var modal = document.getElementById('cookie-modal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) hideModal();
            });
        }

        // Close modal on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                hideModal();
            }
        });

        // Check existing consent
        var consent = getConsent();
        if (consent) {
            applyConsent(consent);
        } else {
            showBanner();
        }
    }

    function bindClick(id, handler) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external use (e.g., footer link, testing)
    window.CookieConsent = {
        getConsent: getConsent,
        setConsent: setConsent,
        hasConsent: hasConsent,
        clearConsent: clearConsent,
        showModal: showModal,
        showBanner: showBanner
    };
})();
