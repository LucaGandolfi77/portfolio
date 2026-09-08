# Deploy — Hourly Wellness Widget, Silent Voice Reader, Focus Lens
Zero-backend PWA/TWA. Steps:
1. Build static files (index.html, styles.css, app.js, manifest.webmanifest)
2. Copy to /public/ or web server root
3. Serve over HTTPS (required for Service Worker / notifications)
4. Verify manifest with Lighthouse PWA audit
5. Submit to App Store (TWA / Capacitor) or Play Store
6. Configure Privacy Data Safety (no data collection declared)
7. Microphone permission pre-screen already in UI
