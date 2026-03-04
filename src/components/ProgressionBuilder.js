import { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../engine/audioEngine';
import { buildChord } from '../theory/harmony';
import { NOTES, COMMON_PROGRESSIONS, TAG_COLORS, ALL_TAGS, ROMAN, MOD_VALID_EXT } from '../constants/notes';
import { MINI_BTN, NAV_BTN } from '../constants/styles';
import MetronomeWidget from './MetronomeWidget';

const EXT_CYCLE = [3, 7, 9, 11];
const EXT_LABEL = { 3:"3", 7:"7", 9:"9", 11:"11" };
const MOD_OPTIONS = [null, "sus2", "sus4", "6", "m6", "dom7", "aug", "dim"];
const MOD_LABEL = { sus2:"sus2", sus4:"sus4", "6":"6", m6:"m6", dom7:"dom7", aug:"aug", dim:"dim" };

function ChordSlot({ chord, index, isActive, currentBeat, beatsPerBar,
                     onSelect, onRemove, onClone, onBarsChange, onExtChange, onModChange, onRootChange,
                     onDragStart, onDragOver, onDrop, isDragOver,
                     popup, onPopupToggle }) {
  const bars = chord.bars || 2;
  const ext  = chord.ext || 3;
  const mod  = chord.mod || null;
  const totalBeats = beatsPerBar * bars;
  const progress = (isActive && currentBeat != null) ? ((currentBeat % totalBeats) / totalBeats) : 0;
  const popupRef = useRef(null);
  const activePopup = popup?.index === index ? popup.type : null;

  useEffect(() => {
    if (!activePopup) return;
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onPopupToggle(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activePopup, onPopupToggle]);

  const togglePopup = (type) => {
    onPopupToggle(activePopup === type ? null : {type, index});
  };

  return (
    <div draggable
      onDragStart={e => { e.dataTransfer.effectAllowed="move"; onDragStart(index); }}
      onDragOver={e => { e.preventDefault(); onDragOver(index); }}
      onDrop={e => { e.preventDefault(); onDrop(index); }}
      onClick={() => onSelect(index)}
      style={{
        background: isActive ? "#1c1600" : isDragOver ? "#162016" : "#141414",
        border: "1px solid "+(isActive?"#e8b84b":isDragOver?"#3a6a3a":"#222"),
        borderRadius:10, padding:"8px 10px 5px", cursor:"grab",
        display:"flex", flexDirection:"column", alignItems:"center",
        gap:2, position:"relative", minWidth:64, userSelect:"none",
        boxShadow: isActive?"0 0 16px rgba(232,184,75,0.18)":"none",
        transition:"border-color 0.1s,background 0.1s",
      }}>
      {isActive && (
        <div style={{position:"absolute",bottom:0,left:0,height:3,borderRadius:"0 0 0 10px",
          background:"#e8b84b",width:(progress*100)+"%",transition:"width 0.05s linear"}}/>
      )}
      <div style={{position:"absolute",top:3,left:"50%",transform:"translateX(-50%)",
        fontSize:8,color:"#2a2a2a",letterSpacing:2,lineHeight:1,pointerEvents:"none"}}>⠿</div>
      <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,
        color:isActive?"#a08020":"#939393",marginTop:6}}>{chord.degree}</span>
      <div style={{position:"relative"}} ref={activePopup === "root" ? popupRef : undefined}>
        <span onClick={e=>{e.stopPropagation();togglePopup("root");}}
          style={{fontFamily:"'Unbounded',sans-serif",fontSize:12,fontWeight:700,
            color:isActive?"#e8b84b":"#ccc",cursor:"pointer"}}>{chord.name}</span>
        {activePopup === "root" && (
          <div onClick={e=>e.stopPropagation()} style={{
            position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",
            marginBottom:4,zIndex:20,
            background:"#1a2818",border:"1px solid #2a4a2a",borderRadius:7,
            padding:4,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2,minWidth:100,
          }}>
            {NOTES.map(n => (
              <button key={n} onClick={() => { onRootChange(index, n); onPopupToggle(null); }}
                style={{
                  fontFamily:"'DM Mono',monospace",fontSize:9,
                  color: n === chord.root ? "#c0f0c0" : "#5a8a5a",
                  background: n === chord.root ? "#2a4a2a" : "transparent",
                  border:"none",borderRadius:3,padding:"3px 4px",cursor:"pointer",
                  textAlign:"center",whiteSpace:"nowrap",
                }}>{n}</button>
            ))}
          </div>
        )}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:3,marginTop:2}}
        onClick={e=>e.stopPropagation()}>
        <button onClick={e=>{e.stopPropagation();onBarsChange(index,Math.max(1,bars-1));}}
          style={MINI_BTN}>−</button>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:600,
          color:isActive?"#e8b84b":"#666",minWidth:14,textAlign:"center"}}>{bars}</span>
        <button onClick={e=>{e.stopPropagation();onBarsChange(index,bars+1);}}
          style={MINI_BTN}>+</button>
      </div>
      <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"#333"}}>measures</span>
      <button onClick={e=>{e.stopPropagation();onExtChange(index);}}
        title="Chord Extension (click to toggle)"
        style={{
          fontFamily:"'DM Mono',monospace",fontSize:9,
          color:ext > 3 ? "#8a7a40" : "#444",
          background:ext > 3 ? "#1a1800" : "#1a1a1a",
          border:"1px solid "+(ext > 3 ? "#3a3420" : "#2a2a2a"),
          borderRadius:4,padding:"1px 6px",cursor:"pointer",marginTop:2,
        }}>{EXT_LABEL[ext] || ext}</button>
      <div style={{position:"relative"}} ref={activePopup === "mod" ? popupRef : undefined}>
        <button onClick={e=>{e.stopPropagation();togglePopup("mod");}}
          title="Chord Modifier"
          style={{
            fontFamily:"'DM Mono',monospace",fontSize:8,
            color: mod ? "#7a9abf" : "#333",
            background: mod ? "#141828" : "#1a1a1a",
            border:"1px solid "+(mod ? "#2a3458" : "#222"),
            borderRadius:4,padding:"1px 5px",cursor:"pointer",marginTop:1,
          }}>{mod ? MOD_LABEL[mod] : "mod"}</button>
        {activePopup === "mod" && (
          <div onClick={e=>e.stopPropagation()} style={{
            position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",
            marginBottom:4,zIndex:20,
            background:"#181828",border:"1px solid #2a3458",borderRadius:7,
            padding:4,display:"flex",flexDirection:"column",gap:2,minWidth:56,
          }}>
            {MOD_OPTIONS.map(m => {
              const active = m === mod;
              return (
                <button key={m||"none"} onClick={() => { onModChange(index, m); onPopupToggle(null); }}
                  style={{
                    fontFamily:"'DM Mono',monospace",fontSize:9,
                    color: active ? "#c0d0f0" : m ? "#7a9abf" : "#555",
                    background: active ? "#2a3458" : "transparent",
                    border:"none",borderRadius:4,padding:"3px 8px",cursor:"pointer",
                    textAlign:"center",whiteSpace:"nowrap",
                  }}>{m ? MOD_LABEL[m] : "—"}</button>
              );
            })}
          </div>
        )}
      </div>
      <button onClick={e=>{e.stopPropagation();onClone(index);}} style={{
        position:"absolute",top:-6,left:-6,width:16,height:16,
        background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"50%",
        cursor:"pointer",fontSize:9,color:"#666",
        display:"flex",alignItems:"center",justifyContent:"center",padding:0,
      }} title="Clone chord">+</button>
      <button onClick={e=>{e.stopPropagation();onRemove(index);}} style={{
        position:"absolute",top:-6,right:-6,width:16,height:16,
        background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"50%",
        cursor:"pointer",fontSize:9,color:"#666",
        display:"flex",alignItems:"center",justifyContent:"center",padding:0,
      }}>✕</button>
    </div>
  );
}

export default function ProgressionBuilder({ harmony, progression, onChange, currentStep, onStepChange, isPlaying, onPlayToggle, bpm, onBpmChange, beatsPerBar, onBeatsChange, currentBeat, chordRepeat, onChordRepeatChange }) {
  const [tab, setTab]           = useState("presets");
  const [filterTag, setFilterTag] = useState("All");
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [popup, setPopup] = useState(null);

  const defaultBars = () => progression[0]?.bars || 2;
  const addChord  = (chord) => onChange([...progression, {...chord, bars: defaultBars()}]);

  const handleBarsChange = (i, bars) => {
    const oldBars = progression[0]?.bars || 2;
    const allSame = progression.slice(1).every(c => (c.bars || 2) === oldBars);
    const next = progression.map((c, idx) => idx === i ? {...c, bars} : c);
    if (i === 0 && allSame) onChange(next.map(c => ({...c, bars})));
    else onChange(next);
  };

  const handleExtChange = (i) => {
    const chord = progression[i];
    const mod = chord.mod || null;
    const current = chord.ext || 3;
    const cycle = (mod && MOD_VALID_EXT[mod]) ? MOD_VALID_EXT[mod] : EXT_CYCLE;
    const nextExt = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    const rebuilt = buildChord(chord.root, chord.type, nextExt, chord.degree, chord.idx, mod);
    const next = progression.map((c, idx) =>
      idx === i ? { ...rebuilt, bars: chord.bars } : c
    );
    onChange(next);
  };

  const handleModChange = (i, mod) => {
    const chord = progression[i];
    let ext = chord.ext || 3;
    if (mod && MOD_VALID_EXT[mod] && !MOD_VALID_EXT[mod].includes(ext)) {
      ext = MOD_VALID_EXT[mod][0];
    }
    const rebuilt = buildChord(chord.root, chord.type, ext, chord.degree, chord.idx, mod);
    const next = progression.map((c, idx) =>
      idx === i ? { ...rebuilt, bars: chord.bars } : c
    );
    onChange(next);
  };

  const handleRootChange = (i, newRoot) => {
    const chord = progression[i];
    const match = harmony.find(h => h.root === newRoot);
    const degree = match ? match.degree : "✱";
    const idx = match ? match.idx : chord.idx;
    const type = match ? match.type : chord.type;
    const rebuilt = buildChord(newRoot, type, chord.ext || 3, degree, idx, chord.mod || null);
    const next = progression.map((c, ci) =>
      ci === i ? { ...rebuilt, bars: chord.bars } : c
    );
    onChange(next);
  };

  const handleDragStart = (i) => setDragFrom(i);
  const handleDragOver  = (i) => setDragOver(i);
  const handleDrop = (i) => {
    if (dragFrom === null || dragFrom === i) { setDragFrom(null); setDragOver(null); return; }
    const next = [...progression];
    const [moved] = next.splice(dragFrom, 1);
    next.splice(i, 0, moved);
    onChange(next);
    onStepChange(i);
    setDragFrom(null); setDragOver(null);
  };
  const cloneChord = (i) => {
    const next = [...progression];
    next.splice(i + 1, 0, { ...progression[i] });
    onChange(next);
  };
  const removeChord = (i) => {
    const next = progression.filter((_,idx) => idx !== i);
    onChange(next);
    if (currentStep !== null && currentStep >= next.length) onStepChange(Math.max(0, next.length-1));
  };
  const clearAll = () => { onChange([]); onStepChange(0); };

  const applyPreset = (preset) => {
    const bars = defaultBars();
    const chords = preset.degrees.map(di => harmony[di]).filter(Boolean).map(c=>({...c,bars}));
    if (chords.length === 0) return;
    onChange(chords);
    onStepChange(0);
    if (chords[0]) audioEngine.playChord(chords[0].notes);
  };

  const filtered = filterTag === "All"
    ? COMMON_PROGRESSIONS
    : COMMON_PROGRESSIONS.filter(p => p.tag === filterTag);

  return (
    <div>
      <MetronomeWidget bpm={bpm} onBpmChange={onBpmChange}
        beatsPerBar={beatsPerBar} onBeatsChange={onBeatsChange}
        isPlaying={isPlaying} currentBeat={currentBeat}
        chordRepeat={chordRepeat} onChordRepeatChange={onChordRepeatChange}/>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,
          color:"#555",letterSpacing:1,textTransform:"uppercase"}}>Progression</span>
        {progression.length > 0 && (
          <span>
            <button onClick={onPlayToggle} style={{
              background:isPlaying?"#e8b84b":"#1a1a1a",
              border:"1px solid #e8b84b",
              borderRadius:6,padding:"5px 14px",cursor:"pointer",
              fontFamily:"'DM Mono',monospace",fontSize:11,
              color:isPlaying?"#0a0a0a":"#e8b84b",marginRight:6,
            }}>{isPlaying ? "Stop" : "Start"}</button>
            {!isPlaying && progression.length > 1 && (
              <span>
                <button onClick={() => onStepChange(((currentStep||0)-1+progression.length)%progression.length)}
                  style={NAV_BTN}>{"<"}</button>
                <button onClick={() => onStepChange(((currentStep||0)+1)%progression.length)}
                  style={{...NAV_BTN,marginLeft:4}}>{">"}</button>
              </span>
            )}
            <button onClick={clearAll} style={{
              background:"none",border:"1px solid #222",borderRadius:6,
              padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Mono',monospace",
              fontSize:12,color:"#939393",marginLeft:6,
            }}>Clear</button>
          </span>
        )}
      </div>

      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:16,
        padding:"10px 12px",background:"#0d0d0d",borderRadius:10,border:"1px solid #1e1e1e",
        alignItems:"flex-start",minHeight:70}}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault();setDragFrom(null);setDragOver(null);}}>
        {progression.length === 0 ? (
          <span style={{fontSize:11,color:"#2a2a2a",fontStyle:"italic",
            fontFamily:"'DM Mono',monospace",alignSelf:"center"}}>
            Select a preset or add chords manually
          </span>
        ) : progression.map((chord, i) => (
          <ChordSlot key={i} chord={chord} index={i}
            isActive={currentStep === i}
            currentBeat={currentStep === i ? currentBeat : null}
            beatsPerBar={beatsPerBar}
            onSelect={onStepChange}
            onRemove={removeChord}
            onClone={cloneChord}
            onBarsChange={handleBarsChange}
            onExtChange={handleExtChange}
            onModChange={handleModChange}
            onRootChange={handleRootChange}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragOver={dragOver === i && dragFrom !== i}
            popup={popup}
            onPopupToggle={setPopup}
          />
        ))}
      </div>

      <div style={{display:"flex",marginBottom:12,background:"#111",borderRadius:8,
        border:"1px solid #1e1e1e",overflow:"hidden",width:"fit-content"}}>
        {[["presets","Popular"],["manual","Manual"]].map(([t,label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:"7px 16px",border:"none",cursor:"pointer",
            background:tab===t?"#e8b84b":"transparent",
            color:tab===t?"#0a0a0a":"#555",
            fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:tab===t?700:400,
          }}>{label}</button>
        ))}
      </div>

      {tab === "presets" && (
        <div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {ALL_TAGS.map(tag => {
              const col = tag === "All" ? "#555" : (TAG_COLORS[tag] || "#666");
              const active = filterTag === tag;
              return (
                <button key={tag} onClick={() => setFilterTag(tag)} style={{
                  padding:"4px 11px",borderRadius:20,
                  border:"1px solid "+(active?col:"#222"),
                  background:active?(col+"22"):"transparent",
                  color:active?col:"#939393",
                  fontFamily:"'DM Mono',monospace",fontSize:12,cursor:"pointer",
                  fontWeight:active?600:400,
                }}>{tag}</button>
              );
            })}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {filtered.map((preset, i) => {
              const maxDeg = Math.max(...preset.degrees);
              const available = maxDeg < harmony.length;
              const tagCol = TAG_COLORS[preset.tag] || "#666";
              return (
                <div key={i} style={{
                  display:"flex",alignItems:"center",gap:10,
                  padding:"9px 12px",borderRadius:9,
                  background:"#111",border:"1px solid #1e1e1e",
                  opacity:available?1:0.4,
                }}>
                  <span style={{
                    minWidth:46,textAlign:"center",
                    fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:600,
                    color:tagCol,letterSpacing:0.5,padding:"2px 6px",borderRadius:4,
                    border:"1px solid "+(tagCol+"44"),background:tagCol+"11",
                  }}>{preset.tag}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#ccc",fontWeight:600}}>
                      {preset.name}
                    </div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#939393",
                      marginTop:1,display:"flex",gap:4,flexWrap:"wrap"}}>
                      {preset.degrees.map((di, j) => (
                        <span key={j} style={{color:harmony[di]?(tagCol+"aa"):"#333"}}>
                          {harmony[di]?harmony[di].name:("?"+ROMAN[di])}
                        </span>
                      ))}
                    </div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#383838",marginTop:2}}>
                      {preset.desc}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={() => available && applyPreset(preset)} disabled={!available}
                      style={{
                        padding:"5px 12px",borderRadius:6,
                        cursor:available?"pointer":"not-allowed",
                        background:available?"#1a2e1a":"#141414",
                        border:"1px solid "+(available?"#2a4a2a":"#1e1e1e"),
                        fontFamily:"'DM Mono',monospace",fontSize:12,
                        color:available?"#4a8a4a":"#333",
                      }}>Apply progression</button>
                    <button onClick={() => {
                        if (!available) return;
                        const bars = defaultBars();
                        const chords = preset.degrees.map(di => harmony[di]).filter(Boolean).map(c=>({...c,bars}));
                        onChange([...progression, ...chords]);
                      }} disabled={!available}
                      style={{
                        padding:"5px 10px",borderRadius:6,
                        cursor:available?"pointer":"not-allowed",
                        background:"transparent",
                        border:"1px solid "+(available?"#2a2a2a":"#1a1a1a"),
                        fontFamily:"'DM Mono',monospace",fontSize:12,
                        color:available?"#555":"#2a2a2a",
                      }}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "manual" && (
        <div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#939393",marginBottom:8}}>
            Click a chord to add it to the progression:
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {harmony.map((chord, i) => (
              <button key={i} onClick={() => addChord(chord)} style={{
                background:"#131313",border:"1px solid #222",borderRadius:7,
                padding:"7px 12px",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:2,
              }}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#939393"}}>{chord.degree}</span>
                <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:12,fontWeight:700,color:"#aaa"}}>
                  {chord.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
