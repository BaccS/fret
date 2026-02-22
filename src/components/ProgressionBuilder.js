import { useState } from 'react';
import { audioEngine } from '../engine/audioEngine';
import { buildChord } from '../theory/harmony';
import { COMMON_PROGRESSIONS, TAG_COLORS, ALL_TAGS, ROMAN } from '../constants/notes';
import { MINI_BTN, NAV_BTN } from '../constants/styles';
import MetronomeWidget from './MetronomeWidget';

const EXT_CYCLE = [3, 7, 9, 11];
const EXT_LABEL = { 3:"3", 7:"7", 9:"9", 11:"11" };

function ChordSlot({ chord, index, isActive, currentBeat, beatsPerBar,
                     onSelect, onRemove, onBarsChange, onExtChange,
                     onDragStart, onDragOver, onDrop, isDragOver }) {
  const bars = chord.bars || 2;
  const ext  = chord.ext || 3;
  const totalBeats = beatsPerBar * bars;
  const progress = (isActive && currentBeat != null) ? ((currentBeat % totalBeats) / totalBeats) : 0;
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
      <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:12,fontWeight:700,
        color:isActive?"#e8b84b":"#ccc"}}>{chord.name}</span>
      <div style={{display:"flex",alignItems:"center",gap:3,marginTop:2}}
        onClick={e=>e.stopPropagation()}>
        <button onClick={e=>{e.stopPropagation();onBarsChange(index,Math.max(1,bars-1));}}
          style={MINI_BTN}>−</button>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:600,
          color:isActive?"#e8b84b":"#666",minWidth:14,textAlign:"center"}}>{bars}</span>
        <button onClick={e=>{e.stopPropagation();onBarsChange(index,bars+1);}}
          style={MINI_BTN}>+</button>
      </div>
      <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"#333"}}>тактов</span>
      <button onClick={e=>{e.stopPropagation();onExtChange(index);}}
        title="Расширение аккорда (клик для переключения)"
        style={{
          fontFamily:"'DM Mono',monospace",fontSize:9,
          color:ext > 3 ? "#8a7a40" : "#444",
          background:ext > 3 ? "#1a1800" : "#1a1a1a",
          border:"1px solid "+(ext > 3 ? "#3a3420" : "#2a2a2a"),
          borderRadius:4,padding:"1px 6px",cursor:"pointer",marginTop:2,
        }}>{EXT_LABEL[ext] || ext}</button>
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
  const [filterTag, setFilterTag] = useState("Все");
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);

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
    const current = chord.ext || 3;
    const nextExt = EXT_CYCLE[(EXT_CYCLE.indexOf(current) + 1) % EXT_CYCLE.length];
    const rebuilt = buildChord(chord.root, chord.type, nextExt, chord.degree, chord.idx);
    const next = progression.map((c, idx) =>
      idx === i ? { ...rebuilt, bars: chord.bars } : c
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

  const filtered = filterTag === "Все"
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
          color:"#555",letterSpacing:1,textTransform:"uppercase"}}>Прогрессия</span>
        {progression.length > 0 && (
          <span>
            <button onClick={onPlayToggle} style={{
              background:isPlaying?"#e8b84b":"#1a1a1a",
              border:"1px solid "+(isPlaying?"#e8b84b":"#333"),
              borderRadius:6,padding:"5px 14px",cursor:"pointer",
              fontFamily:"'DM Mono',monospace",fontSize:11,
              color:isPlaying?"#0a0a0a":"#888",marginRight:6,
            }}>{isPlaying ? "Стоп" : "Авто"}</button>
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
            }}>Очистить</button>
          </span>
        )}
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,
        padding:"10px 12px",background:"#0d0d0d",borderRadius:10,border:"1px solid #1e1e1e",
        alignItems:"flex-start",minHeight:70}}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault();setDragFrom(null);setDragOver(null);}}>
        {progression.length === 0 ? (
          <span style={{fontSize:11,color:"#2a2a2a",fontStyle:"italic",
            fontFamily:"'DM Mono',monospace",alignSelf:"center"}}>
            Выбери пресет или добавь аккорды вручную
          </span>
        ) : progression.map((chord, i) => (
          <ChordSlot key={i} chord={chord} index={i}
            isActive={currentStep === i}
            currentBeat={currentStep === i ? currentBeat : null}
            beatsPerBar={beatsPerBar}
            onSelect={onStepChange}
            onRemove={removeChord}
            onBarsChange={handleBarsChange}
            onExtChange={handleExtChange}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragOver={dragOver === i && dragFrom !== i}
          />
        ))}
      </div>

      <div style={{display:"flex",marginBottom:12,background:"#111",borderRadius:8,
        border:"1px solid #1e1e1e",overflow:"hidden",width:"fit-content"}}>
        {[["presets","Популярные"],["manual","Вручную"]].map(([t,label]) => (
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
              const col = tag === "Все" ? "#555" : (TAG_COLORS[tag] || "#666");
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
                      }}>Загрузить</button>
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
            Нажми аккорд чтобы добавить в прогрессию:
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
