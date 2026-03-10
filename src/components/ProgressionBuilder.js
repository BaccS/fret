import { useState, useEffect } from 'react';
import { audioEngine } from '../engine/audioEngine';
import { buildChord } from '../theory/harmony';
import { NOTES, COMMON_PROGRESSIONS, TAG_COLORS, ALL_TAGS, ROMAN, MOD_VALID_EXT } from '../constants/notes';
import { MINI_BTN, NAV_BTN } from '../constants/styles';
import MetronomeWidget from './MetronomeWidget';

const EXT_CYCLE = [3, 7, 9, 11];
const EXT_LABEL = { 3:"3", 7:"7", 9:"9", 11:"11" };
const MOD_OPTIONS = [null, "sus2", "sus4", "6", "m6", "dom7", "aug", "dim"];
const MOD_LABEL = { sus2:"sus2", sus4:"sus4", "6":"6", m6:"m6", dom7:"dom7", aug:"aug", dim:"dim" };
const POS_LABELS = ["Open", "III", "V", "VII", "IX", "XII"];
const POS_VALUES = [0, 3, 5, 7, 9, 12];
const PLAY_STYLES = ["sustain", "palm", "staccato", "arp"];
const STYLE_LABEL = { sustain:"Sustain", palm:"Palm mute", staccato:"Staccato", arp:"Arpeggio" };
const STYLE_SHORT = { sustain:"sus", palm:"palm", staccato:"stac", arp:"arp" };
const STYLE_COLOR = { sustain:"#e8b84b", palm:"#b07050", staccato:"#50a0b0", arp:"#a070c0" };

function ChordSlot({ chord, index, isActive, isSelected, currentBeat, beatsPerBar,
                     onSelect, onRemove,
                     onDragStart, onDragOver, onDrop, isDragOver }) {
  const bars = chord.bars || 2;
  const ext  = chord.ext || 3;
  const mod  = chord.mod || null;
  const pos  = chord.position || 0;
  const style = chord.playStyle || "sustain";
  const totalBeats = beatsPerBar * bars;
  const progress = (isActive && currentBeat != null) ? ((currentBeat % totalBeats) / totalBeats) : 0;

  const posLabel = POS_LABELS[POS_VALUES.indexOf(pos)] || ("F" + pos);

  return (
    <div draggable
      onDragStart={e => { e.dataTransfer.effectAllowed="move"; onDragStart(index); }}
      onDragOver={e => { e.preventDefault(); onDragOver(index); }}
      onDrop={e => { e.preventDefault(); onDrop(index); }}
      onClick={() => onSelect(index)}
      style={{
        background: isSelected ? "#1a1a00" : isActive ? "#1c1600" : isDragOver ? "#162016" : "#141414",
        border: "1px solid "+(isSelected?"#c8a030":isActive?"#e8b84b":isDragOver?"#3a6a3a":"#222"),
        borderRadius:10, padding:"8px 10px 5px", cursor:"grab",
        display:"flex", flexDirection:"column", alignItems:"center",
        gap:2, position:"relative", minWidth:64, userSelect:"none",
        boxShadow: isSelected?"0 0 20px rgba(232,184,75,0.25)":isActive?"0 0 16px rgba(232,184,75,0.18)":"none",
        transition:"border-color 0.1s,background 0.1s",
      }}>
      {isActive && (
        <div style={{position:"absolute",bottom:0,left:0,height:3,borderRadius:"0 0 0 10px",
          background:"#e8b84b",width:(progress*100)+"%",transition:"width 0.05s linear"}}/>
      )}
      <div style={{position:"absolute",top:3,left:"50%",transform:"translateX(-50%)",
        fontSize:8,color:"#444",letterSpacing:2,lineHeight:1,pointerEvents:"none"}}>&#x2807;</div>
      <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,
        color:isActive?"#a08020":"#939393",marginTop:6}}>{chord.degree}</span>
      <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:12,fontWeight:700,
        color:isSelected?"#f0c850":isActive?"#e8b84b":"#ccc"}}>{chord.name}</span>
      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,
          color:"#777"}}>{bars}m</span>
        {ext > 3 && <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,
          color:"#8a7a40"}}>{EXT_LABEL[ext]}</span>}
        {mod && <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,
          color:"#7a9abf"}}>{MOD_LABEL[mod]}</span>}
      </div>
      {(pos > 0 || style !== "sustain") && <div style={{display:"flex",gap:4,alignItems:"center"}}>
        {pos > 0 && <span style={{fontFamily:"'DM Mono',monospace",fontSize:7,
          color:"#5a8a5a"}}>{posLabel}</span>}
        {style !== "sustain" && <span style={{fontFamily:"'DM Mono',monospace",fontSize:7,
          color:STYLE_COLOR[style]||"#777"}}>{STYLE_SHORT[style]}</span>}
      </div>}
      <button onClick={e=>{e.stopPropagation();onRemove(index);}} style={{
        position:"absolute",top:-6,right:-6,width:16,height:16,
        background:"#2a2a2a",border:"1px solid #3a3a3a",borderRadius:"50%",
        cursor:"pointer",fontSize:9,color:"#666",
        display:"flex",alignItems:"center",justifyContent:"center",padding:0,
      }}>&#x2715;</button>
    </div>
  );
}

function ChordEditor({ chord, index,
                       onBarsChange, onExtChange, onModChange, onRootChange, onPositionChange,
                       onStyleChange, onClone, onRemove }) {
  const bars = chord.bars || 2;
  const ext  = chord.ext || 3;
  const mod  = chord.mod || null;
  const pos  = chord.position || 0;
  const style = chord.playStyle || "sustain";

  const sectionStyle = {
    display:"flex",alignItems:"center",gap:8,
  };
  const labelStyle = {
    fontFamily:"'DM Mono',monospace",fontSize:10,color:"#777",
    minWidth:60,textAlign:"right",
  };

  return (
    <div style={{
      padding:"12px 16px",background:"#0f0f0f",borderRadius:10,
      border:"1px solid #2a2a1a",marginTop:10,
      display:"flex",flexDirection:"column",gap:10,
    }}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"flex-start",gap:12}}>
        <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:14,fontWeight:700,
          color:"#e8b84b"}}>{chord.name}
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#888",
            marginLeft:8,fontWeight:400}}>{chord.degree}</span>
        </span>
        <div style={{display:"flex",gap:6}}>
          <button onClick={() => onClone(index)} style={{
            fontFamily:"'DM Mono',monospace",fontSize:11,
            color:"#666",background:"#1a1a1a",border:"1px solid #664444",
            borderRadius:5,padding:"3px 10px",cursor:"pointer",
          }}>Clone</button>
          <button onClick={() => onRemove(index)} style={{
            fontFamily:"'DM Mono',monospace",fontSize:11,
            color:"#664444",background:"#1a1a1a",border:"1px solid #664444",
            borderRadius:5,padding:"3px 10px",cursor:"pointer",
          }}>Remove</button>
        </div>
      </div>

      {/* Root */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Root</span>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {NOTES.map(n => (
            <button key={n} onClick={() => onRootChange(index, n)}
              style={{
                fontFamily:"'DM Mono',monospace",fontSize:10,
                color: n === chord.root ? "#c0f0c0" : "#5a8a5a",
                background: n === chord.root ? "#2a4a2a" : "#1a1a1a",
                border:"1px solid "+(n === chord.root ? "#3a6a3a" : "#222"),
                borderRadius:4,padding:"3px 6px",cursor:"pointer",
              }}>{n}</button>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Bars</span>
        <button onClick={() => onBarsChange(index, Math.max(1, bars-1))} style={MINI_BTN}>&minus;</button>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,
          color:"#e8b84b",minWidth:18,textAlign:"center"}}>{bars}</span>
        <button onClick={() => onBarsChange(index, bars+1)} style={MINI_BTN}>+</button>
      </div>

      {/* Extension */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Ext</span>
        <div style={{display:"flex",gap:4}}>
          {EXT_CYCLE.map(e => {
            const active = ext === e;
            return (
              <button key={e} onClick={() => onExtChange(index, e)}
                style={{
                  fontFamily:"'DM Mono',monospace",fontSize:10,
                  color: active ? "#e8b84b" : "#777",
                  background: active ? "#1a1800" : "#1a1a1a",
                  border:"1px solid "+(active ? "#3a3420" : "#222"),
                  borderRadius:4,padding:"3px 8px",cursor:"pointer",
                }}>{EXT_LABEL[e]}</button>
            );
          })}
        </div>
      </div>

      {/* Modifier */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Mod</span>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {MOD_OPTIONS.map(m => {
            const active = m === mod;
            return (
              <button key={m||"none"} onClick={() => onModChange(index, m)}
                style={{
                  fontFamily:"'DM Mono',monospace",fontSize:10,
                  color: active ? "#c0d0f0" : m ? "#7a9abf" : "#666",
                  background: active ? "#1a2040" : "#1a1a1a",
                  border:"1px solid "+(active ? "#2a3458" : "#222"),
                  borderRadius:4,padding:"3px 8px",cursor:"pointer",
                }}>{m ? MOD_LABEL[m] : "\u2014"}</button>
            );
          })}
        </div>
      </div>

      {/* Position */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Position</span>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {POS_VALUES.map((v, i) => {
            const active = pos === v;
            return (
              <button key={v} onClick={() => onPositionChange(index, v)}
                style={{
                  fontFamily:"'DM Mono',monospace",fontSize:10,
                  color: active ? "#c0f0c0" : "#5a8a5a",
                  background: active ? "#1a2e1a" : "#1a1a1a",
                  border:"1px solid "+(active ? "#2a4a2a" : "#222"),
                  borderRadius:4,padding:"3px 8px",cursor:"pointer",
                }}>{POS_LABELS[i]}</button>
            );
          })}
        </div>
      </div>
      {/* Play Style */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Style</span>
        <div style={{display:"flex",gap:4}}>
          {PLAY_STYLES.map(s => {
            const active = style === s;
            const col = STYLE_COLOR[s];
            return (
              <button key={s} onClick={() => onStyleChange(index, s)}
                style={{
                  fontFamily:"'DM Mono',monospace",fontSize:10,
                  color: active ? col : "#777",
                  background: active ? (col + "18") : "#1a1a1a",
                  border:"1px solid "+(active ? (col + "66") : "#222"),
                  borderRadius:4,padding:"3px 8px",cursor:"pointer",
                }}>{STYLE_LABEL[s]}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const SAVED_KEY = 'fret_saved_progressions';
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch { return []; }
}
function saveSaved(list) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch {}
}

export default function ProgressionBuilder({ harmony, progression, onChange, currentStep, onStepChange, isPlaying, onPlayToggle, bpm, onBpmChange, beatsPerBar, onBeatsChange, currentBeat, chordRepeat, onChordRepeatChange, isMetronomeOnly, onMetronomeToggle }) {
  const [tab, setTab]           = useState("presets");
  const [filterTag, setFilterTag] = useState("All");
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [savedProgressions, setSavedProgressions] = useState(loadSaved);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const defaultBars = () => progression[0]?.bars || 2;
  const addChord  = (chord) => {
    const newProg = [...progression, {...chord, bars: defaultBars()}];
    onChange(newProg);
    const newIdx = newProg.length - 1;
    setSelectedIdx(newIdx);
    onStepChange(newIdx);
  };

  const handleSelect = (i) => {
    setSelectedIdx(i);
    onStepChange(i);
  };

  const handleBarsChange = (i, bars) => {
    const oldBars = progression[0]?.bars || 2;
    const allSame = progression.slice(1).every(c => (c.bars || 2) === oldBars);
    const next = progression.map((c, idx) => idx === i ? {...c, bars} : c);
    if (i === 0 && allSame) onChange(next.map(c => ({...c, bars})));
    else onChange(next);
  };

  const handleExtChange = (i, newExt) => {
    const chord = progression[i];
    const mod = chord.mod || null;
    const validExts = (mod && MOD_VALID_EXT[mod]) ? MOD_VALID_EXT[mod] : EXT_CYCLE;
    const ext = validExts.includes(newExt) ? newExt : validExts[0];
    const rebuilt = buildChord(chord.root, chord.type, ext, chord.degree, chord.idx, mod);
    const next = progression.map((c, idx) =>
      idx === i ? { ...rebuilt, bars: chord.bars, position: chord.position || 0, playStyle: chord.playStyle || "sustain" } : c
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
      idx === i ? { ...rebuilt, bars: chord.bars, position: chord.position || 0, playStyle: chord.playStyle || "sustain" } : c
    );
    onChange(next);
  };

  const handleRootChange = (i, newRoot) => {
    const chord = progression[i];
    const match = harmony.find(h => h.root === newRoot);
    const degree = match ? match.degree : "\u2731";
    const idx = match ? match.idx : chord.idx;
    const type = match ? match.type : chord.type;
    const rebuilt = buildChord(newRoot, type, chord.ext || 3, degree, idx, chord.mod || null);
    const next = progression.map((c, ci) =>
      ci === i ? { ...rebuilt, bars: chord.bars, position: chord.position || 0, playStyle: chord.playStyle || "sustain" } : c
    );
    onChange(next);
  };

  const handlePositionChange = (i, position) => {
    const next = progression.map((c, idx) =>
      idx === i ? { ...c, position } : c
    );
    onChange(next);
    const chord = next[i];
    if (chord) audioEngine.playChord(chord.notes, position, chord.playStyle || "sustain");
  };

  const handleStyleChange = (i, playStyle) => {
    const next = progression.map((c, idx) =>
      idx === i ? { ...c, playStyle } : c
    );
    onChange(next);
    const chord = next[i];
    if (chord) audioEngine.playChord(chord.notes, chord.position || 0, playStyle);
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
    setSelectedIdx(i);
    setDragFrom(null); setDragOver(null);
  };
  const cloneChord = (i) => {
    const next = [...progression];
    next.splice(i + 1, 0, { ...progression[i] });
    onChange(next);
    setSelectedIdx(i + 1);
  };
  const removeChord = (i) => {
    const next = progression.filter((_,idx) => idx !== i);
    onChange(next);
    if (selectedIdx !== null && selectedIdx >= next.length) setSelectedIdx(Math.max(0, next.length-1));
    if (next.length === 0) setSelectedIdx(null);
    if (currentStep !== null && currentStep >= next.length) onStepChange(Math.max(0, next.length-1));
  };
  const clearAll = () => { onChange([]); onStepChange(0); setSelectedIdx(null); };

  const handleSaveProgression = () => {
    const name = saveName.trim();
    if (!name || progression.length === 0) return;
    const chords = progression.map(c => ({
      root: c.root, type: c.type, ext: c.ext || 3, mod: c.mod || null,
      bars: c.bars || 2, position: c.position || 0, playStyle: c.playStyle || "sustain",
      degree: c.degree, idx: c.idx,
    }));
    const next = [...savedProgressions.filter(s => s.name !== name), { name, chords }];
    setSavedProgressions(next);
    saveSaved(next);
    setSaveName("");
  };

  const handleDeleteSaved = (name) => {
    const next = savedProgressions.filter(s => s.name !== name);
    setSavedProgressions(next);
    saveSaved(next);
  };

  const handleApplySaved = (saved) => {
    const bars = defaultBars();
    const chords = saved.chords.map(c => {
      const rebuilt = buildChord(c.root, c.type, c.ext || 3, c.degree, c.idx, c.mod || null);
      return { ...rebuilt, bars: c.bars || bars, position: c.position || 0, playStyle: c.playStyle || "sustain" };
    });
    if (chords.length === 0) return;
    onChange(chords);
    onStepChange(0);
    setSelectedIdx(0);
    if (chords[0]) audioEngine.playChord(chords[0].notes, chords[0].position || 0);
  };

  const applyPreset = (preset) => {
    const bars = defaultBars();
    const chords = preset.degrees.map(di => harmony[di]).filter(Boolean).map(c=>({...c,bars}));
    if (chords.length === 0) return;
    onChange(chords);
    onStepChange(0);
    setSelectedIdx(0);
    if (chords[0]) audioEngine.playChord(chords[0].notes, chords[0].position || 0);
  };

  // Keep selectedIdx in sync if progression shrinks
  useEffect(() => {
    if (selectedIdx !== null && selectedIdx >= progression.length) {
      setSelectedIdx(progression.length > 0 ? progression.length - 1 : null);
    }
  }, [progression.length, selectedIdx]);

  const filtered = filterTag === "All"
    ? COMMON_PROGRESSIONS
    : COMMON_PROGRESSIONS.filter(p => p.tag === filterTag);

  const selectedChord = selectedIdx !== null && progression[selectedIdx] ? progression[selectedIdx] : null;

  return (
    <div>
      <MetronomeWidget bpm={bpm} onBpmChange={onBpmChange}
        beatsPerBar={beatsPerBar} onBeatsChange={onBeatsChange}
        isPlaying={isPlaying || isMetronomeOnly} currentBeat={currentBeat}
        chordRepeat={chordRepeat} onChordRepeatChange={onChordRepeatChange}
        isMetronomeOnly={isMetronomeOnly} onMetronomeToggle={onMetronomeToggle}/>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,
          color:"#555",letterSpacing:1,textTransform:"uppercase"}}>Progression</span>
        {progression.length > 0 && (
          <span>
            <button onClick={onPlayToggle} style={{
              background:isPlaying?"#4a8a4a":"#1a1a1a",
              border:"1px solid #4a8a4a",
              borderRadius:6,padding:"5px 14px",cursor:"pointer",
              fontFamily:"'DM Mono',monospace",fontSize:14,
              color:isPlaying?"#0a0a0a":"#4a8a4a",marginRight:6,
            }}>
              {isPlaying ? "■ Stop" : "▶ Start"}
              
            </button>
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
              fontSize:14,color:"#939393",marginLeft:6,
            }}>Clear</button>
            <button onClick={() => setShowSaveInput(v => !v)} style={{
              background:"none",border:"1px solid #2a4a2a",borderRadius:6,
              padding:"5px 10px",cursor:"pointer",fontFamily:"'DM Mono',monospace",
              fontSize:14,color:"#4a8a4a",marginLeft:6,
            }}>Save</button>
          </span>
        )}
      </div>
      {showSaveInput && progression.length > 0 && (
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:10}}>
          <input value={saveName} onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { handleSaveProgression(); setShowSaveInput(false); } }}
            placeholder="Progression name"
            autoFocus
            style={{
              fontFamily:"'DM Mono',monospace",fontSize:12,
              background:"#111",border:"1px solid #2a2a2a",borderRadius:6,
              padding:"6px 10px",color:"#ccc",outline:"none",width:200,
            }}/>
          <button onClick={() => { handleSaveProgression(); setShowSaveInput(false); }}
            disabled={!saveName.trim()}
            style={{
              fontFamily:"'DM Mono',monospace",fontSize:12,
              color:saveName.trim()?"#4a8a4a":"#333",
              background:saveName.trim()?"#1a2e1a":"#141414",
              border:"1px solid "+(saveName.trim()?"#2a4a2a":"#1e1e1e"),
              borderRadius:6,padding:"6px 14px",cursor:saveName.trim()?"pointer":"not-allowed",
            }}>OK</button>
          <button onClick={() => { setShowSaveInput(false); setSaveName(""); }}
            style={{
              fontFamily:"'DM Mono',monospace",fontSize:12,
              color:"#666",background:"transparent",border:"1px solid #222",
              borderRadius:6,padding:"6px 10px",cursor:"pointer",
            }}>✕</button>
        </div>
      )}

      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:0,
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
            isSelected={selectedIdx === i}
            currentBeat={currentStep === i ? currentBeat : null}
            beatsPerBar={beatsPerBar}
            onSelect={handleSelect}
            onRemove={removeChord}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragOver={dragOver === i && dragFrom !== i}
          />
        ))}
      </div>

      {/* Chord Editor Panel */}
      {selectedChord && (
        <ChordEditor
          chord={selectedChord}
          index={selectedIdx}
          harmony={harmony}
          onBarsChange={handleBarsChange}
          onExtChange={handleExtChange}
          onModChange={handleModChange}
          onRootChange={handleRootChange}
          onPositionChange={handlePositionChange}
          onStyleChange={handleStyleChange}
          onClone={cloneChord}
          onRemove={removeChord}
        />
      )}

      <div style={{marginTop:16}}/>

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
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
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

          {/* Saved progressions list */}
          {savedProgressions.length > 0 && (
            <div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#555",
                marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>Saved</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {savedProgressions.map((saved) => (
                  <div key={saved.name} style={{
                    display:"flex",alignItems:"center",gap:10,
                    padding:"9px 12px",borderRadius:9,
                    background:"#111",border:"1px solid #1e1e1e",
                  }}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#ccc",fontWeight:600}}>
                        {saved.name}
                      </div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#666",marginTop:2,
                        display:"flex",gap:4,flexWrap:"wrap"}}>
                        {saved.chords.map((c, j) => (
                          <span key={j}>{c.root}{c.type === "min" ? "m" : c.type === "dim" ? "°" : ""}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <button onClick={() => handleApplySaved(saved)}
                        style={{
                          padding:"5px 12px",borderRadius:6,cursor:"pointer",
                          background:"#1a2e1a",border:"1px solid #2a4a2a",
                          fontFamily:"'DM Mono',monospace",fontSize:12,color:"#4a8a4a",
                        }}>Apply progression</button>
                      <button onClick={() => handleDeleteSaved(saved.name)}
                        style={{
                          padding:"5px 10px",borderRadius:6,cursor:"pointer",
                          background:"transparent",border:"1px solid #2a2a2a",
                          fontFamily:"'DM Mono',monospace",fontSize:12,color:"#664444",
                        }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
