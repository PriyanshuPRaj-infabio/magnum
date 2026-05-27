class GalleryAudioService {
  private ctx: AudioContext | null = null;
  private primaryOsc: OscillatorNode | null = null;
  private secondaryOsc: OscillatorNode | null = null;
  private primaryGain: GainNode | null = null;
  private secondaryGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private currentBaseHz: number = 110;
  private currentHarmonicHz: number = 220;

  constructor() {
    // Lazy initialize to bypass initial browser user-interaction rules
  }

  private initCtx() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master layout
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(350, this.ctx.currentTime); // Deep luxury filter
      this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      // Oscillators
      this.primaryOsc = this.ctx.createOscillator();
      this.primaryOsc.type = "sine";
      this.primaryOsc.frequency.setValueAtTime(this.currentBaseHz, this.ctx.currentTime);
      this.primaryGain = this.ctx.createGain();
      this.primaryGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Whisper volume

      this.secondaryOsc = this.ctx.createOscillator();
      this.secondaryOsc.type = "triangle"; // Soft organic harmonics
      this.secondaryOsc.frequency.setValueAtTime(this.currentHarmonicHz, this.ctx.currentTime);
      this.secondaryGain = this.ctx.createGain();
      this.secondaryGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      // Low Frequency Oscillator for ambient physical wave swelling
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = "sine";
      this.lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // Super slow swell: 8.3s cycle
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      // Node alignment
      this.primaryOsc.connect(this.primaryGain);
      this.secondaryOsc.connect(this.secondaryGain);

      this.primaryGain.connect(this.filter);
      this.secondaryGain.connect(this.filter);

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.primaryGain.gain); // Swelling primary volume

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Start all sound engines
      this.primaryOsc.start();
      this.secondaryOsc.start();
      this.lfo.start();
    } catch (e) {
      console.error("Web Audio API not supported inside user iframe context:", e);
    }
  }

  public enableAmbiance() {
    this.initCtx();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isMuted = false;
    const now = this.ctx.currentTime;
    this.masterGain?.gain.linearRampToValueAtTime(0.25, now + 2.5); // Warm slow fade-in
  }

  public disableAmbiance() {
    if (!this.ctx || !this.masterGain) return;
    this.isMuted = true;
    const now = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(0, now + 1.2); // Slow, quiet fade-out
  }

  public handleMoodAmbiance(baseHz: number, harmonicHz: number, filterCutoff: number = 280) {
    this.currentBaseHz = baseHz;
    this.currentHarmonicHz = harmonicHz;

    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    
    // Smooth glides simulating custom museum speaker setups (avoid harsh clicks)
    this.primaryOsc?.frequency.exponentialRampToValueAtTime(baseHz, now + 2.0);
    this.secondaryOsc?.frequency.exponentialRampToValueAtTime(harmonicHz, now + 2.5);
    this.filter?.frequency.exponentialRampToValueAtTime(filterCutoff, now + 2.0);
  }

  public playInquireTone() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const harpOsc = this.ctx.createOscillator();
      const harpGain = this.ctx.createGain();

      harpOsc.type = "sine";
      harpOsc.frequency.setValueAtTime(440, now); // A4
      harpOsc.frequency.exponentialRampToValueAtTime(880, now + 0.3); // High A5 harmonic chime

      harpGain.gain.setValueAtTime(0.0, now);
      harpGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      harpGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8); // Luxurious resonance tail

      harpOsc.connect(harpGain);
      harpGain.connect(this.ctx.destination);

      harpOsc.start();
      harpOsc.stop(now + 2.0);
    } catch (_) {}
  }

  public isCurrentlyAmbiant(): boolean {
    return !this.isMuted;
  }
}

export const audioAmbiance = new GalleryAudioService();
export default audioAmbiance;
