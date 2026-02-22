import { ROMAN } from '../constants/notes';
import { SOLO_COLOR, noteColor } from '../constants/colors';

export default function Legend({ scaleNotes, colorMode, showSolo, soloScaleName, chordName }) {
  return (
    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
      {scaleNotes.map((note,i) => {
        const col = noteColor(note, colorMode, scaleNotes);
        return (
          <div key={note} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:col,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:8,fontWeight:700,color:"#0a0a0a",fontFamily:"'DM Mono',monospace"}}>
              {ROMAN[i]}
            </div>
            <span style={{fontSize:12,color:"#666",fontFamily:"'DM Mono',monospace"}}>{note}</span>
          </div>
        );
      })}
      {chordName && (
        <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:8,
          borderLeft:"1px solid #2a2a2a",paddingLeft:8}}>
          <div style={{width:22,height:22,borderRadius:"50%",border:"2px solid #2dd4bf",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:14,height:14,borderRadius:"50%",background:"#2dd4bf44"}}/>
          </div>
          <span style={{fontSize:12,color:"#2dd4bf",fontFamily:"'DM Mono',monospace"}}>{chordName}</span>
        </div>
      )}
      {showSolo && (
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:SOLO_COLOR,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:9,fontWeight:700,color:"#0a0a0a",fontFamily:"'DM Mono',monospace"}}>S</div>
          <span style={{fontSize:12,color:SOLO_COLOR,fontFamily:"'DM Mono',monospace"}}>
            {soloScaleName}
          </span>
        </div>
      )}
    </div>
  );
}
