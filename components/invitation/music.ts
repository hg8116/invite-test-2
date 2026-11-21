// A tiny generative "music box" waltz built with the Web Audio API, so the
// invitation has gentle background music without shipping an audio file.
// If `event.music.src` is set, a looping <audio> element is used instead.

export interface MusicPlayer {
  play(): Promise<void>;
  pause(): void;
  readonly playing: boolean;
}

type AudioContextCtor = typeof AudioContext;

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// D major, 3/4. Each bar: [chord root midi, chord quality, melody notes].
// Melody entries are [midi, beats]; 0 = rest.
const M = (n: number, beats = 1): [number, number] => [n, beats];
const D5 = 74, E5 = 76, Fs5 = 78, G5 = 79, A5 = 81, B5 = 83, Cs6 = 85, D6 = 86;

const BARS: { root: number; minor?: boolean; melody: [number, number][] }[] = [
  { root: 50, melody: [M(Fs5, 3)] },
  { root: 47, minor: true, melody: [M(D6), M(Cs6), M(B5)] },
  { root: 43, melody: [M(B5, 2), M(A5)] },
  { root: 45, melody: [M(A5, 3)] },
  { root: 50, melody: [M(Fs5), M(G5), M(A5)] },
  { root: 47, minor: true, melody: [M(B5, 2), M(D6)] },
  { root: 52, minor: true, melody: [M(G5), M(Fs5), M(E5)] },
  { root: 45, melody: [M(E5, 3)] },
  { root: 43, melody: [M(D6, 2), M(B5)] },
  { root: 45, melody: [M(Cs6, 2), M(A5)] },
  { root: 54, minor: true, melody: [M(A5, 2), M(Fs5)] },
  { root: 47, minor: true, melody: [M(B5, 2), M(D6)] },
  { root: 43, melody: [M(B5), M(A5), M(G5)] },
  { root: 45, melody: [M(E5), M(Fs5), M(G5)] },
  { root: 50, melody: [M(Fs5, 3)] },
  { root: 50, melody: [M(D5, 3)] },
];

const BPM = 92;
const BEAT = 60 / BPM;

function makeImpulse(ctx: AudioContext, seconds = 2.8, decay = 3.2) {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let c = 0; c < 2; c++) {
    const data = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

class SynthMusicBox implements MusicPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private nextBarTime = 0;
  private bar = 0;
  private _playing = false;

  constructor(private volume: number) {}

  get playing() {
    return this._playing;
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor: AudioContextCtor | undefined =
      typeof window !== "undefined"
        ? window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
        : undefined;
    if (!Ctor) throw new Error("Web Audio is not supported");
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    const dry = ctx.createGain();
    dry.gain.value = 0.75;
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    const verb = ctx.createConvolver();
    verb.buffer = makeImpulse(ctx);
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 5200;
    master.connect(lowpass);
    lowpass.connect(dry).connect(ctx.destination);
    lowpass.connect(verb).connect(wet).connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    return ctx;
  }

  /** One plucked music-box tine. */
  private tine(time: number, midi: number, gain: number, length = 2.2) {
    const ctx = this.ctx!;
    const f = midiToHz(midi);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(gain, time + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, time + length);
    env.connect(this.master!);
    const partials: [number, number][] = [
      [1, 1],
      [2.0, 0.28],
      [3.01, 0.08],
      [5.4, 0.035],
    ];
    for (const [mult, amp] of partials) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f * mult;
      const g = ctx.createGain();
      g.gain.value = amp;
      osc.connect(g).connect(env);
      osc.start(time);
      osc.stop(time + length + 0.05);
    }
  }

  private scheduleBar(t0: number, index: number) {
    const bar = BARS[index % BARS.length];
    const third = bar.root + (bar.minor ? 3 : 4);
    const fifth = bar.root + 7;
    // soft bass on the downbeat
    this.tine(t0, bar.root, 0.16, 2.8);
    // arpeggio in eighths (kept an octave below the melody)
    const arp = [bar.root + 12, fifth + 12, third + 12, fifth + 12, third + 12, fifth];
    arp.forEach((n, i) => this.tine(t0 + i * (BEAT / 2), n, i === 0 ? 0.065 : 0.045, 1.4));
    // melody
    let beat = 0;
    for (const [note, beats] of bar.melody) {
      if (note) this.tine(t0 + beat * BEAT + 0.004, note, 0.13, 1.6 + beats * 0.4);
      beat += beats;
    }
  }

  private tick = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextBarTime < ctx.currentTime + 0.35) {
      this.scheduleBar(this.nextBarTime, this.bar);
      this.bar += 1;
      this.nextBarTime += BEAT * 3;
    }
  };

  async play() {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    if (this._playing) return;
    this._playing = true;
    const now = ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(this.volume, now + 1.2);
    this.nextBarTime = now + 0.1;
    this.timer = window.setInterval(this.tick, 60);
    this.tick();
  }

  pause() {
    if (!this.ctx || !this._playing) return;
    this._playing = false;
    const now = this.ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(0, now + 0.4);
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    const ctx = this.ctx;
    window.setTimeout(() => {
      if (!this._playing) void ctx.suspend();
    }, 500);
  }
}

class FilePlayer implements MusicPlayer {
  private audio: HTMLAudioElement;
  constructor(src: string, volume: number) {
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.preload = "auto";
    this.audio.volume = volume;
  }
  get playing() {
    return !this.audio.paused;
  }
  async play() {
    await this.audio.play();
  }
  pause() {
    this.audio.pause();
  }
}

export function createMusicPlayer(src: string | null, volume: number): MusicPlayer {
  return src ? new FilePlayer(src, volume) : new SynthMusicBox(volume);
}
