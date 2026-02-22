class MetronomeEngine {
  constructor() {
    this.bpm          = 90;
    this.beatsPerBar  = 4;
    this.chordRepeat  = 1;
    this._muted       = false;
    this.onBeat       = null;
    this.onChordChange= null;
    this.onChordPlay  = null;
    this._ctx         = null;
    this._timerID     = null;
    this._nextTime    = 0;
    this._beat        = 0;
    this._barsPerChord= 2;
    this._currentIdx  = 0;
  }

  _getCtx() {
    if (!this._ctx)
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  _click(time, isDown) {
    if (this._muted) return;
    const ctx = this._getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = isDown ? 1100 : 800;
    o.type = 'square';
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(isDown ? 0.20 : 0.10, time + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    o.start(time);
    o.stop(time + 0.06);
  }

  _tick() {
    const ctx = this._getCtx();
    const spb           = 60.0 / this.bpm;
    const beatsPerBar   = this.beatsPerBar;
    const beatsPerChord = beatsPerBar * this._barsPerChord;

    const useHalf     = this.chordRepeat === 8;
    const subdivide   = useHalf ? 2 : 1;
    const repeatEvery = Math.max(1,
      Math.round((beatsPerBar / Math.min(this.chordRepeat, 4)) * subdivide)
    );
    const subSpb      = spb / subdivide;

    while (this._nextTime < ctx.currentTime + 0.12) {
      const t            = this._nextTime;
      const subBeat      = this._beat;
      const fullBeat     = Math.floor(subBeat / subdivide);
      const beatInBar    = fullBeat % beatsPerBar;
      const beatInChord  = fullBeat % beatsPerChord;
      const isFullBeat   = subBeat % subdivide === 0;

      if (isFullBeat) {
        this._click(t, beatInBar === 0);
      }

      if (isFullBeat && this.onBeat) {
        const ms = Math.max(0, (t - ctx.currentTime) * 1000);
        const b  = beatInBar;
        setTimeout(() => { if (this.onBeat) this.onBeat(b); }, ms);
      }

      if (isFullBeat && beatInChord === 0 && fullBeat > 0) {
        if (this.onChordChange) {
          const ms = Math.max(0, (t - ctx.currentTime) * 1000);
          setTimeout(() => { if (this.onChordChange) this.onChordChange(); }, ms);
        }
      }

      if (subBeat % repeatEvery === 0) {
        if (this.onChordPlay) {
          const isChangebeat = isFullBeat && beatInChord === 0 && fullBeat > 0;
          const ms = Math.max(0, (t - ctx.currentTime) * 1000) + (isChangebeat ? 2 : 0);
          setTimeout(() => { if (this.onChordPlay) this.onChordPlay(); }, ms);
        }
      }

      this._nextTime += subSpb;
      this._beat++;
    }
  }

  start(barsPerChord) {
    this.stop();
    const ctx = this._getCtx();
    this._beat         = 0;
    this._barsPerChord = barsPerChord || 2;
    this._nextTime     = ctx.currentTime + 0.05;
    this._timerID      = setInterval(() => this._tick(), 40);
  }

  stop() {
    clearInterval(this._timerID);
    this._timerID = null;
    this._beat    = 0;
  }

  updateBars(bars) {
    this._barsPerChord = bars || 2;
  }

  setMuted(m) { this._muted = m; }
}

export const metronomeEngine = new MetronomeEngine();
