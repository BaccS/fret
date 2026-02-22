import { ROMAN } from '../constants/notes';
import { FRETBOARD_DATA, FRETS, FRET_MARKERS, DOUBLE_MARKERS, STR_NAMES } from '../constants/fretboard';
import { SOLO_COLOR, noteColor } from '../constants/colors';

function FbNote({ note, x, y, r, scaleNotes, chordNotes, chordRoot, soloNotes, colorMode, labelMode, showSoloLayer, onNoteClick, string, fret }) {
  const inScale = scaleNotes.includes(note);
  const inChord = chordNotes.length > 0 && chordNotes.includes(note);
  const inSolo  = soloNotes.length > 0 && soloNotes.includes(note);
  const isRoot  = inChord && note === chordRoot;

  if (!inScale && !inSolo) return null;

  const scCol = inScale ? noteColor(note, colorMode, scaleNotes) : null;
  const sIdx  = scaleNotes.indexOf(note);

  const topLabel = labelMode === "degree" ? (sIdx >= 0 ? ROMAN[sIdx] : note) : note;
  const botLabel = (labelMode === "both" && sIdx >= 0) ? ROMAN[sIdx] : null;

  const showScale = inScale;
  const showSolo  = inSolo && showSoloLayer;
  const split     = showScale && showSolo;
  const leftColor = scCol || "#939393";

  const handleClick = () => {
    if (onNoteClick) onNoteClick(string, fret);
  };

  return (
    <g onClick={handleClick} style={{cursor:"pointer"}}>
      {isRoot && (
        <circle cx={x} cy={y} r={r+7} fill="none" stroke="#f59e0b" strokeWidth="2"
          style={{filter:"drop-shadow(0 0 8px #f59e0b88)"}} />
      )}
      {inChord && !isRoot && (
        <circle cx={x} cy={y} r={r+5} fill="none" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.7"
          style={{filter:"drop-shadow(0 0 5px #2dd4bf66)"}} />
      )}
      {split ? (
        <g>
          <path d={"M"+x+","+(y-r)+" A"+r+","+r+",0,0,0,"+x+","+(y+r)+" Z"} fill={leftColor} />
          <path d={"M"+x+","+(y-r)+" A"+r+","+r+",0,0,1,"+x+","+(y+r)+" Z"} fill={SOLO_COLOR} />
          <circle cx={x} cy={y} r={r} fill="none" stroke="#0a0a0a" strokeWidth="1.5"/>
        </g>
      ) : showScale ? (
        <circle cx={x} cy={y} r={r} fill={leftColor} />
      ) : (
        <circle cx={x} cy={y} r={r} fill={SOLO_COLOR} opacity="0.9"/>
      )}
      {botLabel ? (
        <g>
          <text x={x} y={y - r*0.2} textAnchor="middle" dominantBaseline="central"
            fill="#0a0a0a" fontSize={r*0.72} fontWeight="800"
            fontFamily="'DM Mono',monospace" style={{pointerEvents:"none"}}>
            {topLabel}
          </text>
          <text x={x} y={y + r*0.38} textAnchor="middle" dominantBaseline="central"
            fill="#0a0a0a" fontSize={r*0.55} fontWeight="600"
            fontFamily="'DM Mono',monospace" style={{pointerEvents:"none"}}>
            {botLabel}
          </text>
        </g>
      ) : (
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
          fill="#0a0a0a" fontSize={r*0.75} fontWeight="800"
          fontFamily="'DM Mono',monospace" style={{pointerEvents:"none"}}>
          {topLabel}
        </text>
      )}
    </g>
  );
}

export default function Fretboard({ scaleNotes, chordNotes, chordRoot, soloNotes, colorMode, labelMode, showSoloLayer, label, onNoteClick }) {
  const W=1020, H=290, PL=48, PR=16, PT=36, PB=36;
  const fw = (W-PL-PR)/FRETS;
  const ss = (H-PT-PB)/5;
  const R  = 14;

  return (
    <div>
      {label && (
        <div style={{fontSize:12,color:"#555",letterSpacing:1,textTransform:"uppercase",
          fontFamily:"'DM Mono',monospace",marginBottom:4}}>{label}</div>
      )}
      <div style={{overflowX:"auto",background:"#111",borderRadius:12,border:"1px solid #252525"}}>
        <svg width={W} height={H} style={{display:"block"}}>
          <defs>
            <linearGradient id="neck" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e1e0e"/>
              <stop offset="100%" stopColor="#1a1008"/>
            </linearGradient>
          </defs>
          <rect x={PL} y={PT-10} width={W-PL-PR} height={H-PT-PB+20} fill="url(#neck)" rx={4}/>
          <rect x={PL-6} y={PT-10} width={7} height={H-PT-PB+20} fill="#c8b89a" rx={2}/>
          {Array.from({length:FRETS},(_,f)=>(
            <rect key={f} x={PL+(f+1)*fw-1.5} y={PT-10} width={3} height={H-PT-PB+20} fill="#4a3828"/>
          ))}
          {FRET_MARKERS.map(f => DOUBLE_MARKERS.has(f) ? (
            <g key={f}>
              <circle cx={PL+(f-0.5)*fw} cy={PT+ss*1.5} r={5} fill="#382e20"/>
              <circle cx={PL+(f-0.5)*fw} cy={PT+ss*3.5} r={5} fill="#382e20"/>
            </g>
          ) : (
            <circle key={f} cx={PL+(f-0.5)*fw} cy={PT+ss*2.5} r={5} fill="#382e20"/>
          ))}
          {/* Струны — перевёрнуты: s=0 (low E) внизу, s=5 (high e) вверху */}
          {Array.from({length:6},(_,s)=>(
            <line key={s} x1={PL-6} y1={PT+(5-s)*ss} x2={W-PR} y2={PT+(5-s)*ss}
              stroke={"rgba(210,185,120,"+(0.55+(5-s)*0.06)+")"}
              strokeWidth={s<2?2.8:s<4?2:1.4}/>
          ))}
          {[0,3,5,7,9,12,15].map(f=>(
            <text key={f} x={f===0?PL-28:PL+(f-0.5)*fw} y={H-6}
              textAnchor="middle" fill="#939393" fontSize={12} fontFamily="'DM Mono',monospace">{f}</text>
          ))}
          {/* Подписи струн — перевёрнуты */}
          {STR_NAMES.map((n,s)=>(
            <text key={s} x={PL-28} y={PT+(5-s)*ss} textAnchor="middle" dominantBaseline="central"
              fill="#9e9e9e" fontSize={15} fontWeight="600" fontFamily="'DM Mono',monospace">{n}</text>
          ))}
          {/* Ноты — перевёрнуты */}
          {FRETBOARD_DATA.map(strs => strs.map(({s,f,note})=>{
            const cx = f===0 ? PL-20 : PL+(f-0.5)*fw;
            const cy = PT+(5-s)*ss;
            return (
              <FbNote key={s+"-"+f} note={note} x={cx} y={cy} r={R}
                scaleNotes={scaleNotes} chordNotes={chordNotes} chordRoot={chordRoot}
                soloNotes={soloNotes} colorMode={colorMode} labelMode={labelMode}
                showSoloLayer={showSoloLayer}
                onNoteClick={onNoteClick} string={s} fret={f}/>
            );
          }))}
        </svg>
      </div>
    </div>
  );
}
