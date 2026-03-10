import { useState, useEffect } from 'react';
import { MET_BTN } from '../constants/styles';

export default function MetronomeWidget({ bpm, onBpmChange, beatsPerBar, onBeatsChange,
                           isPlaying, currentBeat, chordRepeat, onChordRepeatChange,
                           isMetronomeOnly, onMetronomeToggle }) {
  const [inputBpm, setInputBpm] = useState(String(bpm));

  useEffect(() => { setInputBpm(String(bpm)); }, [bpm]);

  const commitBpm = (raw) => {
    const v = parseInt(raw, 10);
    if (!isNaN(v) && v >= 40 && v <= 240) {
      onBpmChange(v);
    } else {
      setInputBpm(String(bpm));
    }
  };

  const REPEATS = [
    [1, "\u{1D15D}",  "Whole — 1 per bar"],
    [2, "\u{1D15E}", "Half — 2 times per bar"],
    [4, "♩",  "Quarter — each part of beat"],
    [8, "♪",  "Eight — twice per beat"],
    [16, "♬",  "Sixteen — four per beat"],
  ];

  return (
    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",
      padding:"10px 14px",background:"#0d0d0d",borderRadius:10,
      border:"1px solid #1e1e1e",marginBottom:12}}>

      <button onClick={onMetronomeToggle} style={{
        background: isMetronomeOnly ? "#4a8a4a" : "#1a1a1a",
        border: "1px solid #4a8a4a", borderRadius: 6, padding: "4px 10px", cursor: "pointer",
        fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 600,
        color: isMetronomeOnly ? "#0a0a0a" : "#4a8a4a", letterSpacing: 1,
      }}>{isMetronomeOnly ? "■ Stop" : "▶ Metro"}</button>

      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        {Array.from({length: beatsPerBar}, (_, i) => {
          const active = isPlaying && currentBeat === i;
          return (
            <div key={i} style={{
              width:  i === 0 ? 13 : 9,
              height: i === 0 ? 13 : 9,
              borderRadius: "50%",
              background: active
                ? (i === 0 ? "#e8b84b" : "#aaa")
                : (i === 0 ? "#2a1e08" : "#1e1e1e"),
              boxShadow: (active && i === 0) ? "0 0 10px #e8b84baa" : "none",
              transition: "background 0.04s",
            }}/>
          );
        })}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <button onClick={() => onBpmChange(Math.max(40, bpm - 5))} style={MET_BTN}>−</button>
        <input
          type="number" min="40" max="240"
          value={inputBpm}
          onChange={e => setInputBpm(e.target.value)}
          onBlur={e => commitBpm(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { commitBpm(e.target.value); e.target.blur(); } }}
          style={{
            width: 56, textAlign: "center",
            background: "#1a1a1a", border: "1px solid #333", borderRadius: 6,
            padding: "4px 2px",
            fontFamily: "'Unbounded',sans-serif", fontSize: 15, fontWeight: 700,
            color: "#e0e0e0", outline: "none",
            MozAppearance: "textfield", WebkitAppearance: "none",
          }}
        />
        <button onClick={() => onBpmChange(Math.min(240, bpm + 5))} style={MET_BTN}>+</button>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"#939393",marginRight:2}}>BPM</span>
        <input type="range" min="40" max="240" value={bpm}
          onChange={e => onBpmChange(parseInt(e.target.value))}
          style={{width:80,accentColor:"#e8b84b",cursor:"pointer"}}/>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#939393"}}>Bar</span>
        {[[4,"4/4"],[3,"3/4"],[6,"6/8"]].map(([b, label]) => (
          <button key={b} onClick={() => onBeatsChange(b)} style={{
            padding:"3px 8px", borderRadius:5, cursor:"pointer",
            background: beatsPerBar === b ? "#e8b84b22" : "transparent",
            border: "1px solid " + (beatsPerBar === b ? "#e8b84b55" : "#2a2a2a"),
            fontFamily:"'DM Mono',monospace", fontSize:12,
            color: beatsPerBar === b ? "#e8b84b" : "#555",
          }}>{label}</button>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#939393"}}>Chord</span>
        {REPEATS.map(([r, sym, label]) => (
          <button key={r} onClick={() => onChordRepeatChange(r)} title={label} style={{
            width:28, height:28, borderRadius:5, cursor:"pointer",
            background: chordRepeat === r ? "#2dd4bf22" : "transparent",
            border: "1px solid " + (chordRepeat === r ? "#2dd4bf66" : "#2a2a2a"),
            fontSize:16, color: chordRepeat === r ? "#2dd4bf" : "#555",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>{sym}</button>
        ))}
      </div>
    </div>
  );
}
