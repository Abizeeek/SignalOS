let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a sharp double-beep warning signal (sawtooth wave at 880Hz).
 */
export function playWarningBeep() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // First sharp beep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, now);
    
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second sharp beep shortly after
    setTimeout(() => {
      try {
        const ctx2 = getAudioContext();
        const now2 = ctx2.currentTime;
        const osc2 = ctx2.createOscillator();
        const gain2 = ctx2.createGain();
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(880, now2);
        
        gain2.gain.setValueAtTime(0.12, now2);
        gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.12);
        
        osc2.connect(gain2);
        gain2.connect(ctx2.destination);
        
        osc2.start(now2);
        osc2.stop(now2 + 0.15);
      } catch (e) {
        // fail silently
      }
    }, 140);
  } catch (err) {
    console.warn('SoundSynth failed to execute warning beep:', err);
  }
}

/**
 * Plays a sweeping sirens alert for critical focus breaches or long inactivity.
 */
export function playAlarmSiren() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.85;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    // Frequency sweeps up and down to create a siren effect
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(680, now + 0.22);
    osc.frequency.linearRampToValueAtTime(440, now + 0.44);
    osc.frequency.linearRampToValueAtTime(680, now + 0.66);
    osc.frequency.linearRampToValueAtTime(440, now + 0.85);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.65);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + duration);
  } catch (err) {
    console.warn('SoundSynth failed to execute alarm siren:', err);
  }
}

/**
 * Plays an arpeggiated, bright rising chime for positive events or completed sessions.
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // Sweep up to C6
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    console.warn('SoundSynth failed to execute success chime:', err);
  }
}
