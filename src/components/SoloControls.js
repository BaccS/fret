import { SCALE_FAMILIES } from '../constants/notes';
import Seg from './ui/Seg';
import Lbl from './ui/Lbl';

export default function SoloControls({ st, set }) {
  const upd = (key, val) => set(s => ({...s, [key]:val}));
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:16,alignItems:"flex-start"}}>
      <div>
        <Lbl>Гамма соло</Lbl>
        <select value={st.soloFamily} onChange={e => upd("soloFamily",e.target.value)}
          style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:8,
            color:"#e0e0e0",padding:"8px 12px",fontFamily:"'DM Mono',monospace",
            fontSize:12,outline:"none",cursor:"pointer",width:210}}>
          {Object.entries(SCALE_FAMILIES).map(([k,{label}]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <Lbl>Отображение</Lbl>
        <Seg value={st.soloLayerMode}
          options={[["overlay","Слой поверх"],["separate","Отдельный гриф"]]}
          onChange={v => upd("soloLayerMode",v)}/>
      </div>
    </div>
  );
}
