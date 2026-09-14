// Create all SFX as Howl instances
// Each sound is a simple generated tone using Web Audio API (no external files needed)
// We'll use Howl with html5: false for Web Audio

let audioContext: AudioContext | null = null

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

// Simple tone generator using Web Audio API
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch (e) {
    // Audio not supported
  }
}

export const SFX = {
  // Attack sounds
  attackSlash: () => { playTone(800, 0.1, 'sawtooth', 0.2); playTone(400, 0.15, 'sawtooth', 0.15) },
  attackHit: () => { playTone(200, 0.1, 'square', 0.3); playTone(150, 0.2, 'square', 0.2) },
  attackHeavy: () => { playTone(600, 0.15, 'sawtooth', 0.25); playTone(300, 0.2, 'square', 0.2) },

  // Combo
  comboComplete: () => { playTone(523, 0.1, 'sine', 0.2); setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 100); setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 200) },
  comboFail: () => { playTone(200, 0.3, 'sawtooth', 0.15) },

  // Skill sounds
  fireball: () => { playTone(1200, 0.1, 'sawtooth', 0.2); playTone(800, 0.2, 'sawtooth', 0.15); playTone(400, 0.3, 'sawtooth', 0.1) },
  shield: () => { playTone(400, 0.2, 'sine', 0.2); playTone(600, 0.3, 'sine', 0.15) },
  dash: () => { playTone(200, 0.1, 'sawtooth', 0.2); playTone(400, 0.15, 'sawtooth', 0.15) },
  heal: () => { playTone(523, 0.15, 'sine', 0.2); setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 150); setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 300); setTimeout(() => playTone(1047, 0.3, 'sine', 0.15), 450) },

  // UI sounds
  buttonClick: () => { playTone(800, 0.05, 'sine', 0.15) },
  buttonHover: () => { playTone(1000, 0.03, 'sine', 0.1) },
  menuOpen: () => { playTone(400, 0.1, 'sine', 0.15); playTone(600, 0.1, 'sine', 0.15) },
  menuClose: () => { playTone(600, 0.1, 'sine', 0.15); playTone(400, 0.1, 'sine', 0.15) },

  // Game sounds
  itemPickup: () => { playTone(880, 0.1, 'sine', 0.2); playTone(1100, 0.15, 'sine', 0.2) },
  itemDrop: () => { playTone(400, 0.1, 'sine', 0.15) },
  levelUp: () => { playTone(523, 0.1, 'sine', 0.2); setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 100); setTimeout(() => playTone(784, 0.1, 'sine', 0.2), 200); setTimeout(() => playTone(1047, 0.3, 'sine', 0.25), 300) },
  coin: () => { playTone(1200, 0.1, 'sine', 0.2); playTone(1600, 0.15, 'sine', 0.15) },
  chestOpen: () => { playTone(300, 0.15, 'sine', 0.2); playTone(500, 0.2, 'sine', 0.2) },
  doorOpen: () => { playTone(200, 0.2, 'square', 0.15); playTone(300, 0.3, 'square', 0.1) },
  questComplete: () => { playTone(523, 0.1, 'sine', 0.25); setTimeout(() => playTone(659, 0.1, 'sine', 0.25), 150); setTimeout(() => playTone(784, 0.1, 'sine', 0.25), 300); setTimeout(() => playTone(1047, 0.2, 'sine', 0.3), 450) },

  // Damage sounds
  playerHit: () => { playTone(200, 0.1, 'square', 0.3); playTone(150, 0.2, 'sawtooth', 0.2) },
  playerDeath: () => { playTone(400, 0.3, 'sawtooth', 0.25); playTone(200, 0.5, 'sawtooth', 0.2); playTone(100, 0.8, 'sawtooth', 0.15) },

  // Environment
  footsteps: () => { playTone(100, 0.05, 'sine', 0.05) },
  magic: () => { playTone(1000, 0.2, 'sine', 0.15); playTone(1500, 0.3, 'sine', 0.1) },
}

// Initialize audio context on first user interaction
export const initAudio = () => {
  try {
    getAudioContext()
  } catch (e) {
    // Audio not supported
  }
}
