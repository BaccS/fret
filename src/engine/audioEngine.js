import { OPEN_MIDI, NOTE_MIDI } from '../constants/fretboard';

function midiToHz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
function getFretMidi(string, fret) { return OPEN_MIDI[string] + fret; }

function chordToMidi(notes) {
  const midis = [];
  let cursor = 40;
  for (const note of notes) {
    let midi = NOTE_MIDI[note] ?? 60;
    while (midi < cursor) midi += 12;
    midis.push(midi);
    cursor = midi;
  }
  return midis;
}

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.muted = false;
    this.volume = 0.65;
  }
  _init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
  }
  _resume() {
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }
  playNote(midi, duration, delay) {
    if (this.muted) return;
    const dur = duration || 1.8;
    const del = delay || 0;
    this._init(); this._resume();
    const ctx = this.ctx;
    const t = ctx.currentTime + del;
    const freq = midiToHz(midi);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc2.type = "triangle";
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.003;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = Math.min(freq * 8, 4200);
    filter.Q.value = 0.9;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.38, t + 0.008);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc1.connect(filter); osc2.connect(filter);
    filter.connect(env); env.connect(this.masterGain);
    osc1.start(t); osc1.stop(t + dur + 0.05);
    osc2.start(t); osc2.stop(t + dur + 0.05);
  }
  playChord(notes) {
    if (this.muted) return;
    const midis = chordToMidi(notes);
    midis.forEach((midi, i) => this.playNote(midi, 2.4, i * 0.055));
  }
  playFretNote(string, fret) {
    this.playNote(getFretMidi(string, fret), 1.7, 0);
  }
  setVolume(v) {
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  }
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

export const audioEngine = new AudioEngine();
