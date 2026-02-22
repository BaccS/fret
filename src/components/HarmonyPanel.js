import { audioEngine } from '../engine/audioEngine';

export default function HarmonyPanel({ harmony, selectedIdx, onSelect }) {
  return (
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {harmony.map((chord, i) => {
        const active = selectedIdx === i;
        return (
          <button key={i}
            onClick={() => {
              onSelect(active ? null : i);
              if (!active) audioEngine.playChord(chord.notes);
            }}
            style={{
              background: active?"#2dd4bf":"#1a1a1a",
              border: active?"1px solid #2dd4bf":"1px solid #2a2a2a",
              borderRadius:10,padding:"10px 14px",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              minWidth:70,transition:"all 0.15s",
              boxShadow: active?"0 0 16px rgba(45,212,191,0.25)":"none",
            }}>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,
              color:active?"#0e2e2a":"#555",letterSpacing:1}}>{chord.degree}</span>
            <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:13,fontWeight:700,
              color:active?"#0a2826":"#e0e0e0"}}>{chord.name}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,
              color:active?"#1a3e3a":"#939393"}}>{chord.notes.slice(0,4).join(" ")}</span>
          </button>
        );
      })}
    </div>
  );
}
