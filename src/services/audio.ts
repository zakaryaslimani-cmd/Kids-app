/**
 * Audio and Speech Synthesis Engine
 * Works 100% offline using Web Audio API and HTML5 SpeechSynthesis.
 * Supports English, French, and Arabic speech synthesis and localized praise.
 */

import { AudioLanguage } from './learningData';

class AudioService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private voiceEnabled: boolean = true;
  private speechRate: number = 0.85; // Slightly slower for clear toddler comprehension
  private speechPitch: number = 1.1; // Cheerful, friendly pitch
  private voices: SpeechSynthesisVoice[] = [];
  private currentLanguage: AudioLanguage = 'en';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public setSpeechRate(rate: number) {
    this.speechRate = Math.max(0.5, Math.min(1.5, rate));
  }

  public setLanguage(lang: AudioLanguage) {
    this.currentLanguage = lang;
  }

  public getLanguage(): AudioLanguage {
    return this.currentLanguage;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  /**
   * Speak a word, letter, or number clearly with child-friendly articulation in the selected language.
   */
  public speakText(text: string, langOverride?: AudioLanguage) {
    if (!this.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.playMelodicChime();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.speechRate;
      utterance.pitch = this.speechPitch;
      utterance.volume = 1.0;

      const targetLang = langOverride || this.currentLanguage;

      if (targetLang === 'fr') {
        utterance.lang = 'fr-FR';
      } else if (targetLang === 'ar') {
        utterance.lang = 'ar-SA';
      } else {
        utterance.lang = 'en-US';
      }

      // Pick matching voice
      if (this.voices.length > 0) {
        const matchingVoice = this.voices.find((v) =>
          v.lang.toLowerCase().startsWith(targetLang)
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      this.playMelodicChime();
    }
  }

  public speakNumber(num: number | string, langOverride?: AudioLanguage) {
    this.speakText(String(num), langOverride);
  }

  /**
   * Speak encouraging praise words after a smash in the chosen language.
   */
  public speakPraise(langOverride?: AudioLanguage) {
    if (!this.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const lang = langOverride || this.currentLanguage;

    let phrases: string[];
    if (lang === 'fr') {
      phrases = ['Bravo !', 'Super !', 'Génial !', 'Magnifique !', 'Hourra !', 'Excellent !'];
    } else if (lang === 'ar') {
      phrases = ['أحسنت!', 'ممتاز!', 'رائع!', 'بطل!', 'عظيم!', 'يا سلام!'];
    } else {
      phrases = [
        'Awesome!',
        'Great job!',
        'Yay!',
        'Super smash!',
        'Hooray!',
        'You got it!',
        'Woohoo!',
        'Fantastic!',
      ];
    }

    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    try {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1.0;
      utterance.pitch = 1.25;
      utterance.volume = 0.95;

      if (lang === 'fr') utterance.lang = 'fr-FR';
      else if (lang === 'ar') utterance.lang = 'ar-SA';
      else utterance.lang = 'en-US';

      if (this.voices.length > 0) {
        const matchingVoice = this.voices.find((v) =>
          v.lang.toLowerCase().startsWith(lang)
        );
        if (matchingVoice) utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignored
    }
  }

  public playMelodicChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playSmashPop() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);

    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    chime.type = 'triangle';
    chime.frequency.setValueAtTime(880, now + 0.04);
    chime.frequency.exponentialRampToValueAtTime(1760, now + 0.16);

    chimeGain.gain.setValueAtTime(0.25, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);

    chime.start(now + 0.04);
    chime.stop(now + 0.25);
  }

  public playCheerAndClap() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const numClaps = 7;
    for (let i = 0; i < numClaps; i++) {
      const clapTime = now + 0.05 + i * 0.07 + (Math.random() * 0.03);
      this.playSingleClap(ctx, clapTime);
    }

    const chordNotes = [
      { freq: 523.25, time: 0.0, dur: 0.12 },
      { freq: 659.25, time: 0.1, dur: 0.14 },
      { freq: 783.99, time: 0.2, dur: 0.16 },
      { freq: 1046.50, time: 0.32, dur: 0.45 },
      { freq: 1318.51, time: 0.34, dur: 0.45 },
    ];

    chordNotes.forEach(({ freq, time, dur }) => {
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      noteOsc.type = 'triangle';
      noteOsc.frequency.setValueAtTime(freq, now + time);

      noteGain.gain.setValueAtTime(0.28, now + time);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);

      noteOsc.start(now + time);
      noteOsc.stop(now + time + dur);
    });

    setTimeout(() => {
      this.speakPraise();
    }, 180);
  }

  private playSingleClap(ctx: AudioContext, time: number) {
    try {
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100 + Math.random() * 400;
      filter.Q.value = 1.8;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(time);
      noise.stop(time + 0.05);
    } catch {
      // Ignored
    }
  }

  public playBadgeFanfare() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [
      { freq: 440.0, time: 0.00, dur: 0.15 },
      { freq: 554.37, time: 0.12, dur: 0.15 },
      { freq: 659.25, time: 0.24, dur: 0.18 },
      { freq: 880.00, time: 0.40, dur: 0.60 },
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.35, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }

  public playClick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const audioService = new AudioService();
