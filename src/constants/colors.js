import { NOTES } from './notes';

export const SCALE_COLORS = ["#60c8e8","#60a8e0","#7080e0","#9060d8","#c050c8","#e04898","#e05060"];
export const CHROMA_COLORS = [
  "#e05c5c","#e0785c","#e09c5c","#e0c05c","#cce05c","#8ce05c",
  "#5ce07c","#5ce0b8","#5cb8e0","#5c7ce0","#905ce0","#c05ce0",
];
export const SOLO_COLOR = "#f472b6";

export const noteColor = (note, mode, scaleNotes) => {
  if (mode === "chromatic") return CHROMA_COLORS[NOTES.indexOf(note)] || "#888";
  const idx = scaleNotes.indexOf(note);
  return idx >= 0 ? SCALE_COLORS[Math.min(idx, SCALE_COLORS.length-1)] : null;
};
