import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { SCALES } from './constants/notes';
import { SOLO_COLOR } from './constants/colors';
import { audioEngine } from './engine/audioEngine';
import { metronomeEngine } from './engine/metronomeEngine';
import { getScaleNotes, getHarmony, buildChord, resolveAdaptiveSoloScale } from './theory/harmony';
import { useLocalStorage } from './hooks/useLocalStorage';
import Fretboard from './components/Fretboard';
import HarmonyPanel from './components/HarmonyPanel';
import ProgressionBuilder from './components/ProgressionBuilder';
import Controls from './components/Controls';
import SoloControls from './components/SoloControls';
import Legend from './components/Legend';
import Lbl from './components/ui/Lbl';

const DEFAULT_STATE = {
  root:"A", scaleKey:"natural_minor", colorMode:"scale",
  labelMode:"note", chordExt:3,
  showSoloLayer:false, soloFamily:"pentatonic", soloLayerMode:"overlay",
};

export default function App() {
  const [st, set, stRestoreCompleted]               = useLocalStorage('settings', DEFAULT_STATE);
  const [isMuted, setIsMuted]   = useLocalStorage('muted', false);
  const [volume, setVolume]     = useLocalStorage('volume', 0.65);
  const [bpm, setBpm]           = useLocalStorage('bpm', 90);
  const [beatsPerBar, setBeatsPerBar] = useLocalStorage('beats', 4);
  const [chordRepeat, setChordRepeat] = useLocalStorage('chordRepeat', 1);

  // Прогрессия — сохраняем как индексы ступеней + привязка к тоника/гамма
  const [savedProgression, setSavedProgression] = useLocalStorage('progression', {
    degrees: [], bars: [], exts: [], root: null, scaleKey: null, chordExt: null,
  });

  const [activeSource, setActiveSource]       = useState(null);
  const [harmonySelectedIdx, setHarmonyIdx]   = useState(null);
  const [progression, setProgression]         = useState([]);
  const [currentStep, setCurrentStep]         = useState(0);
  const [isPlaying, setIsPlaying]             = useState(false);
  const [currentBeat, setCurrentBeat]         = useState(null);
  const progressionRef = useRef([]);
  const currentStepRef = useRef(0);

  const { root, scaleKey, colorMode, labelMode, chordExt,
          showSoloLayer, soloFamily, soloLayerMode } = st;

  const scaleNotes = useMemo(() => getScaleNotes(root, scaleKey), [root, scaleKey]);
  const harmony    = useMemo(() => getHarmony(root, scaleKey, chordExt), [root, scaleKey, chordExt]);

  // Восстанавливаем прогрессию из localStorage при первом рендере
  const restoredRef = useRef(false);
  useEffect(() => {
    if(!stRestoreCompleted) return;
    if (restoredRef.current) return;
    restoredRef.current = true;
    const sp = savedProgression;
    if (sp.degrees.length > 0 && sp.root === root && sp.scaleKey === scaleKey) {
      const restored = sp.degrees.map((di, i) => {
        const baseChord = harmony[di];
        if (!baseChord) return null;
        const chordExt_i = sp.exts?.[i] || sp.chordExt || chordExt;
        if (chordExt_i !== chordExt) {
          return { ...buildChord(baseChord.root, baseChord.type, chordExt_i, baseChord.degree, baseChord.idx), bars: sp.bars[i] || 2 };
        }
        return { ...baseChord, bars: sp.bars[i] || 2 };
      }).filter(Boolean);
      if (restored.length > 0) {
        setProgression(restored);
        setActiveSource("progression");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stRestoreCompleted]);

  // Синхронизируем прогрессию в localStorage при изменениях
  useEffect(() => {
    if (progression.length > 0) {
      const degrees = progression.map(c => c.idx);
      const bars = progression.map(c => c.bars || 2);
      const exts = progression.map(c => c.ext || chordExt);
      setSavedProgression({ degrees, bars, exts, root, scaleKey, chordExt });
    } else {
      setSavedProgression({ degrees: [], bars: [], exts: [], root: null, scaleKey: null, chordExt: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progression, root, scaleKey, chordExt]);

  // Синхронизация движков при маунте
  useEffect(() => {
    audioEngine.setVolume(volume);
    audioEngine.muted = isMuted;
    metronomeEngine.bpm = bpm;
    metronomeEngine.beatsPerBar = beatsPerBar;
    metronomeEngine.chordRepeat = chordRepeat;
    metronomeEngine.setMuted(isMuted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChord = useMemo(() => {
    if (activeSource === "harmony") {
      return harmonySelectedIdx !== null ? harmony[harmonySelectedIdx] : null;
    }
    if (activeSource === "progression") {
      return progression.length > 0 ? (progression[currentStep] || null) : null;
    }
    return null;
  }, [activeSource, harmonySelectedIdx, harmony, progression, currentStep]);

  const handleHarmonySelect = useCallback((idx) => {
    if (activeSource === "harmony" && harmonySelectedIdx === idx) {
      setActiveSource(null);
      setHarmonyIdx(null);
    } else {
      setActiveSource("harmony");
      setHarmonyIdx(idx);
      setIsPlaying(false);
    }
  }, [activeSource, harmonySelectedIdx]);

  const handleProgressionStep = useCallback((i) => {
    setActiveSource("progression");
    setCurrentStep(i);
    setIsPlaying(false);
    const chord = progression[i];
    if (chord) audioEngine.playChord(chord.notes);
  }, [progression]);

  const handleNoteClick = useCallback((string, fret) => {
    audioEngine.playFretNote(string, fret);
  }, []);

  const handleMuteToggle = () => {
    const m = audioEngine.toggleMute();
    metronomeEngine.setMuted(m);
    setIsMuted(m);
  };

  const handleVolume = (v) => {
    setVolume(v);
    audioEngine.setVolume(v);
  };

  const soloRoot  = activeChord ? activeChord.root : root;
  const chordType = activeChord ? activeChord.type : "maj";
  const effectiveSoloScale = useMemo(
    () => resolveAdaptiveSoloScale(soloFamily, chordType),
    [soloFamily, chordType]
  );
  const soloNotes = useMemo(() =>
    showSoloLayer ? getScaleNotes(soloRoot, effectiveSoloScale) : [],
    [showSoloLayer, soloRoot, effectiveSoloScale]
  );

  useEffect(() => { progressionRef.current = progression; }, [progression]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);

  // Autoplay
  useEffect(() => {
    if (isPlaying && progression.length > 0) {
      setActiveSource("progression");

      metronomeEngine.bpm          = bpm;
      metronomeEngine.beatsPerBar  = beatsPerBar;
      metronomeEngine.chordRepeat  = chordRepeat;

      metronomeEngine.onBeat = (beat) => setCurrentBeat(beat);

      metronomeEngine.onChordPlay = () => {
        const prog  = progressionRef.current;
        const chord = prog[metronomeEngine._currentIdx ?? 0];
        if (chord) audioEngine.playChord(chord.notes);
      };

      metronomeEngine.onChordChange = () => {
        const prog = progressionRef.current;
        if (!prog.length) return;
        const next = ((metronomeEngine._currentIdx ?? 0) + 1) % prog.length;
        metronomeEngine._currentIdx = next;
        currentStepRef.current = next;
        metronomeEngine.updateBars(prog[next]?.bars || 2);
        setCurrentStep(next);
      };

      metronomeEngine._currentIdx = currentStep;
      const firstBars = progression[currentStep]?.bars || 2;
      metronomeEngine.start(firstBars);
    } else {
      metronomeEngine.stop();
      metronomeEngine._currentIdx = 0;
      setCurrentBeat(null);
    }
    return () => { metronomeEngine.stop(); metronomeEngine._currentIdx = 0; setCurrentBeat(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  useEffect(() => {
    metronomeEngine.bpm = bpm;
    metronomeEngine.beatsPerBar = beatsPerBar;
    metronomeEngine.chordRepeat = chordRepeat;
  }, [bpm, beatsPerBar, chordRepeat]);

  // Reset on key/scale change
  useEffect(() => {
    setProgression([]); setCurrentStep(0);
    setIsPlaying(false); setActiveSource(null); setHarmonyIdx(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, scaleKey]);

  const chordNotes = activeChord ? activeChord.notes : [];
  const chordRoot  = activeChord ? activeChord.root  : null;
  const separateSolo = showSoloLayer && soloLayerMode === "separate";
  const overlaySolo  = showSoloLayer && soloLayerMode === "overlay";

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#f5f5f5",
      fontFamily:"'DM Mono',monospace",padding:"24px 22px",boxSizing:"border-box"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@700;900&family=DM+Mono:ital,wght@0,400;0,600;1,400&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        button { transition:all 0.13s; }
        button:hover { filter:brightness(1.12); }
        select option { background:#1a1a1a; }
        ::-webkit-scrollbar { height:4px; width:4px; }
        ::-webkit-scrollbar-track { background:#111; }
        ::-webkit-scrollbar-thumb { background:#333; border-radius:4px; }
      `}</style>

      {/* HEADER */}
      <div style={{marginBottom:24,paddingBottom:18,borderBottom:"1px solid #1a1a1a",
        display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <h1 style={{fontFamily:"'Unbounded',sans-serif",fontSize:20,fontWeight:900,
          color:"#e8b84b",letterSpacing:-0.5}}>FRETBOARD</h1>
        <span style={{fontSize:12,color:"#3a3a3a",letterSpacing:3}}>NAVIGATOR</span>
        <span style={{fontSize:11,color:"#939393"}}>
          {root} {SCALES[scaleKey] ? SCALES[scaleKey].name : ""}
          {activeChord ? <span style={{color:"#2dd4bf"}}> · {activeChord.name}</span> : null}
          {showSoloLayer ? <span style={{color:SOLO_COLOR}}> · Solo: {soloRoot} {SCALES[effectiveSoloScale]?.name || ""}</span> : null}
        </span>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={handleMuteToggle}
            style={{
              background:isMuted?"#2a1a1a":"#1a1a1a",
              border:"1px solid "+(isMuted?"#5a2a2a":"#2a2a2a"),
              borderRadius:7,padding:"6px 11px",cursor:"pointer",
              fontFamily:"'DM Mono',monospace",fontSize:13,
              color:isMuted?"#664444":"#888",
            }}>{isMuted ? "Mute" : "Vol"}</button>
          <input type="range" min="0" max="1" step="0.05" value={volume}
            onChange={(e) => handleVolume(parseFloat(e.target.value))}
            style={{width:70,accentColor:"#e8b84b",opacity:isMuted?0.3:1,
              cursor:isMuted?"default":"pointer"}}/>
        </div>
      </div>

      {/* CONTROLS */}
      <section style={{marginBottom:22}}>
        <Controls st={st} set={set}/>
      </section>

      {/* FRETBOARD 1 */}
      <section style={{marginBottom:16}}>
        <Fretboard
          scaleNotes={scaleNotes} chordNotes={chordNotes} chordRoot={chordRoot}
          soloNotes={overlaySolo ? soloNotes : []}
          colorMode={colorMode} labelMode={labelMode} showSoloLayer={overlaySolo}
          label={overlaySolo ? "Основная гамма + соло" : null}
          onNoteClick={handleNoteClick}
        />
      </section>

      {/* FRETBOARD 2 (separate solo) */}
      {separateSolo && (
        <section style={{marginBottom:16}}>
          <Fretboard
            scaleNotes={soloNotes} chordNotes={chordNotes} chordRoot={chordRoot}
            soloNotes={[]} colorMode={colorMode} labelMode={labelMode} showSoloLayer={false}
            label={"Соло-гамма: " + soloRoot + " " + (SCALES[effectiveSoloScale]?.name || "")}
            onNoteClick={handleNoteClick}
          />
        </section>
      )}

      {/* LEGEND */}
      <section style={{marginBottom:22}}>
        <Legend scaleNotes={scaleNotes} colorMode={colorMode}
          showSolo={showSoloLayer}
          soloScaleName={soloRoot + " " + (SCALES[effectiveSoloScale]?.name || "")}
          chordName={activeChord ? activeChord.name : null}/>
      </section>

      {/* SOLO LAYER */}
      <section style={{marginBottom:22,padding:"16px 18px",
        background:"#111",borderRadius:12,border:"1px solid #1e1e1e"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:st.showSoloLayer?14:0}}>
          <button onClick={() => set(s => ({...s,showSoloLayer:!s.showSoloLayer}))} style={{
            background:st.showSoloLayer?SOLO_COLOR:"#1a1a1a",
            border:"1px solid "+(st.showSoloLayer?SOLO_COLOR:"#2a2a2a"),
            borderRadius:8,padding:"7px 16px",cursor:"pointer",
            fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,
            color:st.showSoloLayer?"#0a0a0a":"#666",
            boxShadow:st.showSoloLayer?"0 0 14px rgba(244,114,182,0.3)":"none",
          }}>{st.showSoloLayer ? "Solo ON" : "Solo OFF"}</button>
          <span style={{fontSize:12,color:"#939393",fontStyle:"italic"}}>
            {st.showSoloLayer
              ? ("Гамма от корня аккорда: " + soloRoot + " " + (SCALES[effectiveSoloScale]?.name || ""))
              : "Подсвечивает гамму для соло к текущему аккорду"}
          </span>
        </div>
        {st.showSoloLayer && <SoloControls st={st} set={set}/>}
      </section>

      {/* HARMONY */}
      <section style={{marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
          <Lbl>Гармония: {root} {SCALES[scaleKey] ? SCALES[scaleKey].name : ""}</Lbl>
          <span style={{fontSize:12,color:"#939393",fontStyle:"italic"}}>
            {activeSource === "harmony" && activeChord
              ? (activeChord.name + " — нажми снова чтобы снять")
              : "Нажми аккорд для подсветки или добавь в прогрессию"}
          </span>
        </div>
        <HarmonyPanel
          harmony={harmony}
          selectedIdx={activeSource === "harmony" ? harmonySelectedIdx : null}
          onSelect={handleHarmonySelect}
        />
      </section>

      {/* PROGRESSION */}
      <section style={{padding:"16px 18px",background:"#111",
        borderRadius:12,border:"1px solid #1e1e1e",marginBottom:22}}>
        <ProgressionBuilder
          harmony={harmony}
          progression={progression}
          onChange={(p) => {
            setProgression(p);
            setCurrentStep(0);
            setActiveSource(p.length > 0 ? "progression" : null);
          }}
          currentStep={activeSource === "progression" ? currentStep : null}
          onStepChange={handleProgressionStep}
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying(p => !p)}
          bpm={bpm}
          onBpmChange={v => { setBpm(v); metronomeEngine.bpm = v; }}
          beatsPerBar={beatsPerBar}
          onBeatsChange={v => { setBeatsPerBar(v); metronomeEngine.beatsPerBar = v; }}
          currentBeat={currentBeat}
          chordRepeat={chordRepeat}
          onChordRepeatChange={v => { setChordRepeat(v); metronomeEngine.chordRepeat = v; }}
        />
      </section>

      {/* HINT */}
      <div style={{fontSize:12,color:"#939393",lineHeight:1.8}}>
        <span style={{color:"#e8b84b"}}>Совет:</span>
        {" "}Кликай по нотам на грифе чтобы слышать их высоту.
        Кликай по аккордам в гармонии или прогрессии чтобы слышать их звучание.
        Авто-плей переключает аккорды каждые 1.8 сек.
      </div>
    </div>
  );
}
