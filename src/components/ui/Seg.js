export default function Seg({ value, options, onChange }) {
  return (
    <div style={{display:"flex",background:"#141414",borderRadius:8,
      border:"1px solid #222",overflow:"hidden"}}>
      {options.map(([val, label]) => {
        const a = value === val;
        return (
          <button key={val} onClick={() => onChange(val)} style={{
            padding:"7px 13px",border:"none",cursor:"pointer",
            background:a?"#e8b84b":"transparent",
            color:a?"#0a0a0a":"#666",
            fontFamily:"'DM Mono',monospace",fontSize:11,
            fontWeight:a?700:400,whiteSpace:"nowrap",
          }}>{label}</button>
        );
      })}
    </div>
  );
}
