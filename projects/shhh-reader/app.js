/* helpers — explicitly global so reader.js/browser.js can use them */
var gid = id => document.getElementById(id)
var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
var ls = (k, def) => { try { const v = JSON.parse(localStorage.getItem('shhh_' + k)); return v !== null ? v : def } catch { return def } }
var lss = (k, v) => localStorage.setItem('shhh_' + k, JSON.stringify(v))

/* dynamic viewport height for iPhone Safari */
function setVH() {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', vh + 'px')
}
setVH()
window.addEventListener('resize', setVH)
window.addEventListener('orientationchange', () => setTimeout(setVH, 100))

const App = {
  /* state */
  mode: 'threshold',        // 'threshold' | 'fade'
  tab: 'library',
  overlayVisible: false,
  graceTimer: null,
  contentOpacity: 1,
  settings: {
    threshold: -20,
    floor: -40,
    ceiling: -15,
    gracePeriod: 1.5,
    hysteresis: 3,
  },
  stats: { today: 0, total: 0, streak: 0, pages: 0 },

  async init() {
    this.loadPrefs()
    this.checkStreak()
    this.renderHistory()

    /* install prompt */
    this._installSetup()

    /* pre-permission screen — mic only on explicit user consent */
    const granted = ls('micGranted', false)
    if (!granted) {
      gid('perm-screen').hidden = false
      gid('perm-btn').onclick = async () => {
        try {
          await this.audio.start()
          gid('mic-dot').className = 'dot green'
          this._requestMic()
          gid('perm-screen').hidden = true
          gid('audiobar').hidden = false
        } catch {
          gid('mic-dot').className = 'dot off'
          gid('level-text').textContent = '🎤 no'
          /* degrade gracefully: allow use without mic */
          gid('perm-screen').hidden = true
          gid('audiobar').hidden = false
        }
      }
      gid('perm-skip').onclick = () => {
        gid('perm-screen').hidden = true
        gid('audiobar').hidden = false
        this._requestMic()
      }
      gid('audiobar').hidden = true
      return
    }

    await this._initAudio()
    this._initConsent()
    this._initNotifications()
    this._initWidget()
  },

  /* ── Notifications for daily focus reminders ── */
  async _initNotifications() {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/app/' })
        reg.showNotification = true
      } catch {}
      /* schedule daily reminder */
      this._scheduleReminder()
    }
  },

  _scheduleReminder() {
    const hour = 20 /* 8 PM daily reminder */
    const now = new Date()
    const delay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour) - now
    setTimeout(() => {
      this._sendReminder()
      /* repeat daily */
      setInterval(() => this._sendReminder(), 24 * 60 * 60 * 1000)
    }, Math.max(delay, 60000))
  },

  async _sendReminder() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    try {
      const reg = await navigator.serviceWorker.getRegistration('/app/')
      if (reg && reg.showNotification) {
        reg.showNotification('SHHH', {
          body: 'Time to find silence and read! 📖',
          icon: '/app/icons/icon-192.png',
          badge: '/app/icons/icon-192.png',
          tag: 'shhh-focus-reminder',
          renotify: true,
          actions: [{ action: 'open', title: 'Open SHHH' }]
        })
      } else {
        new Notification('SHHH', { body: 'Time to find silence and read! 📖' })
      }
    } catch {}
  },

  /* ── Widget support (Android 13+) ── */
  _initWidget() {
    if (!('getModules' in window) && !('widget' in document)) return
    /* Register a static widget via Web App Widget API */
    try {
      if (window.widget) {
        window.widget.register('shhh-stats', {
          description: 'Daily silence stats',
          preview: '/app/icons/icon-192.png',
          targetState: { daily: true }
        })
      }
    } catch {}
  },

  /* ── Share Target API ── */

  _initConsent() {
    const banner = gid('ump-banner')
    const accepted = ls('umpConsent', null)
    if (!accepted) {
      banner.hidden = false
      gid('ump-accept').onclick = () => {
        try { localStorage.setItem('shhh_ad_consent', 'true') } catch {}
        try { localStorage.setItem('shhh_ump_consent', 'accepted') } catch {}
        banner.hidden = true
        this._loadAdMob()
      }
      gid('ump-decline').onclick = () => {
        try { localStorage.setItem('shhh_ad_consent', 'false') } catch {}
        try { localStorage.setItem('shhh_ump_consent', 'denied') } catch {}
        banner.hidden = true
      }
    } else {
      /* already consented — check if ads allowed */
      const adConsent = ls('shhh_ad_consent', null)
      if (adConsent === 'true') this._loadAdMob()
    }
  },

  _loadAdMob() {
    /* inject AdMob banner into stats tab */
    const statsSection = gid('tab-stats')
    if (!statsSection) return
    const adDiv = document.createElement('div')
    adDiv.id = 'admob-banner'
    adDiv.style.cssText = 'background:#f8f8f8;border:1px solid #ddd;border-radius:8px;padding:12px;margin-top:16px;text-align:center;min-height:50px'
    adDiv.innerHTML = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"><\/script><ins class="adsbygoogle" style="display:block;margin:0 auto" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot="XXXXXXXXXX" data-ad-format="banner" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});<\/script>'
    statsSection.appendChild(adDiv)
    /* trigger AdMob */
    if (window.adsbygoogle) adsbygoogle.push([])
  },

  _requestMic() {
    lss('micGranted', true)
  },

  async _initAudio() {
    this.audio = new AudioMonitor()
    this.audio.onLevel = dB => this.onLevel(dB)
    this.audio.onError = () => {
      gid('mic-dot').className = 'dot off'
      gid('level-text').textContent = '🎤 no'
    }

    try {
      await this.audio.start()
      gid('mic-dot').className = 'dot green'
      const resumeCtx = () => {
        if (this.audio.ctx && this.audio.ctx.state === 'suspended')
          this.audio.ctx.resume()
      }
      document.addEventListener('click', resumeCtx, { once: true })
      document.addEventListener('touchstart', resumeCtx, { once: true })
    } catch {
      gid('mic-dot').className = 'dot off'
      gid('level-text').textContent = '🎤 no'
    }

    /* reader & browser */
    this.reader = new Reader()
    this.browser = new Browser()
    this.reader.onPageChange = () => { this.stats.pages++; this.saveStats() }

    /* events */
    this.bindEvents()

    /* ui */
    this.updateUI()
    this.showTab('library')

    /* stats tick */
    this._silenceAccum = 0
    this._silenceTimer = setInterval(() => {
      if (this._silenceAccum > 0) {
        this.stats.today += this._silenceAccum
        this.stats.total += this._silenceAccum
        this._silenceAccum = 0
        this.saveStats()
        this.renderStats()
      }
    }, 1000)
  },

  _installSetup() {
    let deferred = null
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      deferred = e
      if (navigator.platform && navigator.platform.indexOf('Mac') !== -1) gid('install-banner').hidden = false
    })
    window.addEventListener('appinstalled', () => {
      gid('install-banner').hidden = true
      deferred = null
    })
    gid('install-btn').onclick = async () => {
      if (deferred) { await deferred.prompt(); deferred = null }
      gid('install-banner').hidden = true
    }
    gid('install-dismiss').onclick = () => { gid('install-banner').hidden = true }
  },

  /* ── Share Target API ── */
  async _handleShareTarget() {
    const params = new URLSearchParams(location.search)
    if (params.get('share-target') === 'file' || location.pathname === '/?share-target') {
      /* read shared file from POST body (simplified GET fallback) */
      const fileParam = params.get('file')
      if (fileParam) {
        try {
          const resp = await fetch(fileParam)
          const blob = await resp.blob()
          const file = new File([blob], 'shared-file.pdf', { type: blob.type })
          this.reader.open(file)
        } catch {}
      }
      /* clean URL */
      history.replaceState({}, '', location.pathname)
    }
    /* Listen for shared files via Service Worker message */
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', e => {
        if (e.data && e.data.type === 'SHARED_FILE') {
          const { blob, name } = e.data
          const file = new File([blob], name, { type: blob.type || 'application/octet-stream' })
          this.reader.open(file)
        }
      })
    }
  },

  /* ── audio processing ── */
  onLevel(dB) {
    this.updateMeter(dB)

    if (this.mode === 'threshold') {
      this.thresholdLogic(dB)
    } else {
      this.fadeLogic(dB)
    }

    /* accumulate silence (below threshold - 5dB) */
    if (dB < this.settings.threshold - 5) {
      this._silenceAccum += 0.066 // ~15fps worth
    }
  },

  thresholdLogic(dB) {
    const { threshold, hysteresis, gracePeriod } = this.settings
    if (dB > threshold) {
      /* too loud → hide immediately */
      if (this.graceTimer) { clearTimeout(this.graceTimer); this.graceTimer = null }
      this.showOverlay()
    } else if (dB < threshold - hysteresis) {
      /* quiet enough → start grace timer */
      if (this.overlayVisible && !this.graceTimer) {
        this.graceTimer = setTimeout(() => {
          this.hideOverlay()
          this.graceTimer = null
        }, gracePeriod * 1000)
      }
    } else {
      /* hysteresis zone → do nothing (cancel grace if level rises back) */
      if (this.graceTimer && dB >= threshold - hysteresis * 0.5) {
        clearTimeout(this.graceTimer)
        this.graceTimer = null
      }
    }
  },

  fadeLogic(dB) {
    const { floor, ceiling } = this.settings
    let t = (dB - floor) / (ceiling - floor)
    t = clamp(t, 0, 1)
    this.contentOpacity = 1 - t
    gid('content').style.opacity = this.contentOpacity
    this.overlayVisible = false
    gid('overlay-shhh').hidden = true
  },

  /* ── overlay ── */
  showOverlay() {
    if (this.overlayVisible) return
    this.overlayVisible = true
    gid('overlay-shhh').hidden = false
    gid('content').style.opacity = '1'
    if (navigator.vibrate) navigator.vibrate(30)
  },

  hideOverlay() {
    if (!this.overlayVisible) return
    this.overlayVisible = false
    gid('overlay-shhh').hidden = true
  },

  /* ── meter ── */
  updateMeter(dB) {
    const norm = clamp((dB + 55) / 50, 0, 1)
    gid('level-fill').style.width = (norm * 100) + '%'
    gid('level-text').textContent = dB.toFixed(1) + ' dB'
    gid('shhh-fill').style.width = (norm * 100) + '%'
    gid('shhh-level').textContent = dB.toFixed(1) + ' dB'

    /* mic dot color */
    const dot = gid('mic-dot')
    if (dB < this.settings.threshold - 5) dot.className = 'dot green'
    else if (dB < this.settings.threshold) dot.className = 'dot yellow'
    else dot.className = 'dot red'
  },

  /* ── tabs ── */
  showTab(name) {
    this.tab = name
    document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', el.dataset.tab === name))
    document.querySelectorAll('.tab-content').forEach(el => el.classList.toggle('active', el.id === 'tab-' + name))
  },

  /* ── settings / prefs ── */
  loadPrefs() {
    const s = ls('settings', null)
    if (s) Object.assign(this.settings, s)
    this.mode = ls('mode', 'threshold')
    const st = ls('stats', null)
    if (st) {
      /* check if same day */
      const now = new Date()
      const dayKey = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
      if (st.day === dayKey) this.stats.today = st.today
      this.stats.total = st.total || 0
      this.stats.streak = st.streak || 0
      this.stats.pages = st.pages || 0
    }
    this.graceTimer = null
  },

  saveStats() {
    const now = new Date()
    const dayKey = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
    const st = { day: dayKey, today: this.stats.today, total: this.stats.total, streak: this.stats.streak, pages: this.stats.pages }
    lss('stats', st)
    if (this.stats.today >= 300) this._markSuccessDay(dayKey)
  },

  savePrefs() {
    lss('settings', { ...this.settings })
    lss('mode', this.mode)
  },

  checkStreak() {
    const now = new Date()
    const todayKey = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate()
    const prev = ls('lastSuccessDay', null)
    if (todayKey === prev) return
    if (prev === yesterdayKey && this.stats.today >= 300) {
      this.stats.streak++
    } else if (prev !== todayKey && this.stats.today >= 300) {
      this.stats.streak = 1
    }
    if (this.stats.today >= 300) {
      this._markSuccessDay(todayKey)
    }
  },

  _markSuccessDay(key) {
    try { localStorage.setItem('shhh_lastSuccessDay', key) } catch {}
  },

  renderStats() {
    gid('stat-today').textContent = Math.round(this.stats.today) + 's'
    gid('stat-total').textContent = Math.round(this.stats.total) + 's'
    gid('stat-streak').textContent = this.stats.streak + '🔥'
    gid('stat-pages').textContent = this.stats.pages
  },

  renderHistory() {
    const el = gid('recent-books')
    const hist = JSON.parse(localStorage.getItem('shhh_hist') || '[]')
    if (!hist.length) { el.innerHTML = ''; return }
    el.innerHTML = '<h3>Aperti di recente</h3>' + hist.map(n => `<div class="recent-item">${n}</div>`).join('')
  },

  updateUI() {
    gid('mode-badge').textContent = this.mode === 'threshold' ? '🚫 Soglia' : '🌫️ Dissolvenza'
    gid('mode-toggle').textContent = this.mode === 'threshold' ? '🌫️' : '🚫'
    gid('sel-mode').value = this.mode
    gid('threshold-slider').value = this.settings.threshold
    gid('threshold-val').textContent = this.settings.threshold
    gid('floor-slider').value = this.settings.floor
    gid('floor-val').textContent = this.settings.floor
    gid('ceiling-slider').value = this.settings.ceiling
    gid('ceiling-val').textContent = this.settings.ceiling
    gid('grace-slider').value = this.settings.gracePeriod
    gid('grace-val').textContent = this.settings.gracePeriod.toFixed(1)
    gid('threshold-settings').hidden = this.mode !== 'threshold'
    gid('fade-settings').hidden = this.mode !== 'fade'
    this.renderStats()
  },

  switchMode(mode) {
    this.mode = mode
    if (mode === 'threshold') {
      gid('content').style.opacity = '1'
      this.contentOpacity = 1
    } else {
      this.hideOverlay()
    }
    this.savePrefs()
    this.updateUI()
  },

  /* ── events ── */
  bindEvents() {
    /* tabs */
    document.querySelectorAll('.tab').forEach(el => {
      el.addEventListener('click', () => this.showTab(el.dataset.tab))
    })

    /* language toggle */
    gid('lang-btn').addEventListener('click', () => {
      const next = lang === 'it' ? 'en' : 'it'
      setLang(next)
      gid('lang-btn').textContent = next === 'it' ? '🇮🇹' : '🇬🇧'
    })
    /* mode toggle (audiobar) */
    gid('mode-toggle').addEventListener('click', () => {
      this.switchMode(this.mode === 'threshold' ? 'fade' : 'threshold')
    })

    /* settings panel */
    gid('settings-btn').addEventListener('click', () => { gid('settings-panel').hidden = false })
    gid('settings-close').addEventListener('click', () => { gid('settings-panel').hidden = true })

    gid('sel-mode').addEventListener('change', e => this.switchMode(e.target.value))

    gid('threshold-slider').addEventListener('input', e => {
      this.settings.threshold = +e.target.value
      gid('threshold-val').textContent = this.settings.threshold
      this.savePrefs()
    })

    gid('floor-slider').addEventListener('input', e => {
      this.settings.floor = +e.target.value
      gid('floor-val').textContent = this.settings.floor
      this.savePrefs()
    })

    gid('ceiling-slider').addEventListener('input', e => {
      this.settings.ceiling = +e.target.value
      gid('ceiling-val').textContent = this.settings.ceiling
      this.savePrefs()
    })

    gid('grace-slider').addEventListener('input', e => {
      this.settings.gracePeriod = +e.target.value
      gid('grace-val').textContent = this.settings.gracePeriod.toFixed(1)
      this.savePrefs()
    })

    gid('reset-stats-btn').addEventListener('click', () => {
      if (confirm('Resettare tutte le statistiche?')) {
        this.stats = { today: 0, total: 0, streak: 0, pages: 0 }
        this._silenceAccum = 0
        this.saveStats()
        this.renderStats()
      }
    })

    /* file picker / dropzone */
    gid('file-picker-link').addEventListener('click', () => gid('file-input').click())
    gid('file-input').addEventListener('change', () => {
      if (gid('file-input').files[0]) {
        this.reader.open(gid('file-input').files[0])
        this.renderHistory()
      }
    })

    const dz = gid('dropzone')
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover') })
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'))
    dz.addEventListener('drop', e => {
      e.preventDefault(); dz.classList.remove('dragover')
      const f = e.dataTransfer.files[0]
      if (f) {
        this.reader.open(f)
        this.renderHistory()
      }
    })
    dz.addEventListener('click', () => gid('file-input').click())

    /* reader nav */
    gid('reader-back').addEventListener('click', () => this.reader.close())
    gid('prev-page').addEventListener('click', () => this.reader.prev())
    gid('next-page').addEventListener('click', () => this.reader.next())

     /* keyboard shortcuts */
     document.addEventListener('keydown', e => {
       if (e.key === 'ArrowLeft' && !gid('reader-view').hidden) this.reader.prev()
       if (e.key === 'ArrowRight' && !gid('reader-view').hidden) this.reader.next()
       if (e.key === 'Escape') {
         gid('settings-panel').hidden = true
         if (!gid('reader-view').hidden) this.reader.close()
       }
     })

     /* focus timer */
     gid('focus-start').addEventListener('click', () => this.startFocus())
     gid('focus-stop').addEventListener('click', () => this.stopFocus())

     /* share card */
     gid('stat-streak').addEventListener('click', () => this.shareStats())

      /* Share Target API — gestisce file condivisi da altre app */
      this._handleShareTarget()
    },

    /* ── focus timer ── */
   startFocus() {
     this.focusSeconds = 0
     this.focusInterval = setInterval(() => {
       this.focusSeconds++
       const m = Math.floor(this.focusSeconds / 60).toString().padStart(2, '0')
       const s = (this.focusSeconds % 60).toString().padStart(2, '0')
       gid('focus-timer').textContent = `${m}:${s}`
     }, 1000)
     gid('focus-start').hidden = true
     gid('focus-stop').hidden = false
     gid('focus-done').hidden = true
     gid('focus-section').hidden = false
   },

   stopFocus() {
     clearInterval(this.focusInterval)
     gid('focus-start').hidden = false
     gid('focus-stop').hidden = true
     gid('focus-done').hidden = false
     gid('focus-minutes').textContent = `${Math.floor(this.focusSeconds / 60)} ${t('focusMinutes')}`
     this.stats.today += this.focusSeconds
     this.stats.total += this.focusSeconds
     this.saveStats()
     this.renderStats()
   },

   /* ── share card ── */
   async shareStats() {
     const canvas = document.createElement('canvas')
     canvas.width = 600
     canvas.height = 400
     const ctx = canvas.getContext('2d')
     ctx.fillStyle = '#0a0a0a'
     ctx.fillRect(0, 0, 600, 400)
     ctx.fillStyle = '#e94560'
     ctx.font = 'bold 48px -apple-system, sans-serif'
     ctx.fillText('SHHH', 40, 80)
     ctx.fillStyle = '#d0d0d0'
     ctx.font = '28px -apple-system, sans-serif'
     ctx.fillText(`${Math.round(this.stats.total)}s di silenzio`, 40, 140)
     ctx.fillText(`${this.stats.streak}🔥 streak`, 40, 180)
     ctx.fillText(`${this.stats.pages} pagine lette`, 40, 220)
     ctx.fillStyle = '#666'
     ctx.font = '18px -apple-system, sans-serif'
     ctx.fillText('Leggi in silenzio', 40, 280)
     const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
     const file = new File([blob], 'shhh-stats.png', { type: 'image/png' })
     if (navigator.share) {
       try {
         await navigator.share({
           title: 'SHHH – Il mio silenzio',
           text: `${Math.round(this.stats.total)}s di silenzio · ${this.stats.streak}🔥 streak`,
           files: [file]
         })
       } catch {}
     } else {
       const url = URL.createObjectURL(blob)
       const a = document.createElement('a')
       a.href = url
       a.download = 'shhh-stats.png'
       a.click()
       URL.revokeObjectURL(url)
     }
   },
 }

document.addEventListener('DOMContentLoaded', () => App.init())
