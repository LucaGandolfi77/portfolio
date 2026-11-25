class AudioMonitor {
  constructor() {
    this.onLevel = null
    this.onError = null
    this.running = false
    this.stream = null
    this.ctx = null
    this.analyser = null
    this.smoothed = -60
    this.smoothFactor = 0.85
    this._frame = null
  }

  async start() {
    if (this.running) return true
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        echoCancellation: false,
      })
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      const src = this.ctx.createMediaStreamSource(this.stream)
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 512
      src.connect(this.analyser)
      this.smoothed = -60
      this.running = true
      this._tick()
      return true
    } catch (e) {
      this.stop()
      if (this.onError) this.onError(e)
      return false
    }
  }

  _tick() {
    if (!this.running) return
    const buf = new Uint8Array(this.analyser.fftSize)
    this.analyser.getByteTimeDomainData(buf)
    let sum = 0
    for (let i = 0; i < buf.length; i++) {
      const v = buf[i] / 128 - 1
      sum += v * v
    }
    const rms = Math.sqrt(sum / buf.length)
    const dB = 20 * Math.log10(rms + 1e-10)
    this.smoothed = this.smoothed * this.smoothFactor + dB * (1 - this.smoothFactor)
    if (this.onLevel) this.onLevel(this.smoothed)
    this._frame = requestAnimationFrame(() => this._tick())
  }

  stop() {
    this.running = false
    if (this._frame) cancelAnimationFrame(this._frame)
    this._frame = null
    if (this.stream) this.stream.getTracks().forEach(t => t.stop())
    if (this.ctx) this.ctx.close()
    this.stream = null
    this.ctx = null
    this.analyser = null
  }

  get level() { return this.smoothed }
}
