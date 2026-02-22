import { SCALES } from '../constants/notes';
import Seg from './ui/Seg';
import Lbl from './ui/Lbl';

export default function Controls({ st, set }) {
  const ALL_ROOTS = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const upd = (key, val) => set(s => ({...s, [key]:val}));
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:18,alignItems:"flex-start"}}>
      <div>
        <Lbl>Тональность</Lbl>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,maxWidth:290}}>
          {ALL_ROOTS.map(n => (
            <button key={n} onClick={() => upd("root",n)} style={{
              width:42,height:34,border:"none",borderRadius:7,cursor:"pointer",
              background:st.root===n?"#e8b84b":"#1a1a1a",
              color:st.root===n?"#0a0a0a":"#bebebe",
              fontFamily:"'DM Mono',monospace",fontSize:11,
              fontWeight:st.root===n?700:400,
            }}>{n}</button>
          ))}
        </div>
      </div>
      <div>
        <Lbl>Гамма</Lbl>
        <select value={st.scaleKey} onChange={e => upd("scaleKey",e.target.value)}
          style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:8,
            color:"#e0e0e0",padding:"8px 12px",fontFamily:"'DM Mono',monospace",
            fontSize:12,outline:"none",cursor:"pointer",width:210}}>
          {Object.entries(SCALES).map(([k,{name}]) => (
            <option key={k} value={k}>{name}</option>
          ))}
        </select>
      </div>
      <div>
        <Lbl>Аккорды</Lbl>
        <Seg value={st.chordExt} options={[[3,"Трезв."],[7,"7"],[9,"9"],[11,"11"]]}
          onChange={v => upd("chordExt",v)}/>
      </div>
      <div>
        <Lbl>Цвет нот</Lbl>
        <Seg value={st.colorMode} options={[["chromatic","C-B"],["scale","I-VII"]]}
          onChange={v => upd("colorMode",v)}/>
      </div>
      <div>
        <Lbl>Подписи</Lbl>
        <Seg value={st.labelMode} options={[["note","Нота"],["degree","Ступень"],["both","Оба"]]}
          onChange={v => upd("labelMode",v)}/>
      </div>
    </div>
  );
}
