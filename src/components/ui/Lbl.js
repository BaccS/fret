export default function Lbl({ children }) {
  return (
    <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,
      color:"#555",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>
      {children}
    </div>
  );
}
