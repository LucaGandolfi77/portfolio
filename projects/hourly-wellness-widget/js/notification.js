// notification.js — Local notification scheduling for Hourly Wellness Widget
// Uses Service Worker for background scheduling (Capacitor/Bubblewrap)

function gid(id) { return document.getElementById(id); }

var NotificationService = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.requestPermission();
  },

  requestPermission() {
    if (!('Notification' in window)) return;
    Notification.requestPermission().then(p => {
      if (p === 'granted') {
        this.scheduleReminder();
      }
    });
  },

  scheduleReminder() {
    // Simple approach: setInterval (works when app is open)
    // For true background, would need Service Worker with push
    clearInterval(NotificationService.timer);
    NotificationService.timer = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification('Hourly Wellness Widget', {
          body: 'Tempo per una pausa di respirazione di 60 secondi.',
          icon: '/icons/icon-192.png',
          tag: 'hourly-break',
          renotify: false,
          data: { url: '/app/' }
        });
      }
    }, 60 * 60 * 1000); // Every hour
  },

  // Service Worker integration (Capacitor/Bubblewrap)
  setupSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/app/' })
      .then(reg => {
        console.log('SW registered', reg);
        // Listen for push messages
        self.addEventListener('push', e => {
          const data = e.data ? e.data.json() : {};
          self.registration.showNotification(data.title || 'Hourly Wellness', {
            body: data.body || 'Promemoria pausa respiro',
            icon: data.icon || '/icons/icon-192.png',
            tag: data.tag || 'hourly-break',
          });
        });
      });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  NotificationService.init();
  NotificationService.setupSW();
});