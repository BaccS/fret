export const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export const SCALES = {
  major:          { name: "Major",               intervals: [0,2,4,5,7,9,11] },
  natural_minor:  { name: "Natural minor",   intervals: [0,2,3,5,7,8,10] },
  harmonic_minor: { name: "Harmonic minor", intervals: [0,2,3,5,7,8,11] },
  melodic_minor:  { name: "Melodic minor",  intervals: [0,2,3,5,7,9,11] },
  dorian:         { name: "Dorian",           intervals: [0,2,3,5,7,9,10] },
  phrygian:       { name: "Phrygian",          intervals: [0,1,3,5,7,8,10] },
  lydian:         { name: "Lydian",           intervals: [0,2,4,6,7,9,11] },
  mixolydian:     { name: "Mixolydian",      intervals: [0,2,4,5,7,9,10] },
  locrian:        { name: "Locrian",          intervals: [0,1,3,5,6,8,10] },
  major_penta:    { name: "Major pentatonics",intervals: [0,2,4,7,9] },
  minor_penta:    { name: "Minor pentatonics",intervals: [0,3,5,7,10] },
  blues:          { name: "Blues",                intervals: [0,3,5,6,7,10] },
};

export const CHORD_DEGREES = {
  major:          ["maj","min","min","maj","maj","min","dim"],
  natural_minor:  ["min","dim","maj","min","min","maj","maj"],
  harmonic_minor: ["min","dim","aug","min","maj","maj","dim"],
  melodic_minor:  ["min","min","aug","maj","maj","dim","dim"],
  dorian:         ["min","min","maj","maj","min","dim","maj"],
  phrygian:       ["min","maj","maj","min","dim","maj","min"],
  lydian:         ["maj","maj","min","dim","maj","min","min"],
  mixolydian:     ["maj","min","dim","maj","min","min","maj"],
  locrian:        ["dim","maj","min","min","maj","maj","min"],
  major_penta:    ["maj","min","min","maj","min"],
  minor_penta:    ["min","maj","min","min","maj"],
  blues:          ["min","dim","min","min","maj","maj"],
};

export const CHORD_INT = {
  maj: { 3:[0,4,7],   7:[0,4,7,11],   9:[0,4,7,11,14],   11:[0,4,7,11,14,17] },
  min: { 3:[0,3,7],   7:[0,3,7,10],   9:[0,3,7,10,14],   11:[0,3,7,10,14,17] },
  dim: { 3:[0,3,6],   7:[0,3,6,9],    9:[0,3,6,9,14],    11:[0,3,6,9,14,17]  },
  aug: { 3:[0,4,8],   7:[0,4,8,11],   9:[0,4,8,11,14],   11:[0,4,8,11,14,17] },
};

export const ROMAN = ["I","II","III","IV","V","VI","VII"];

export const COMMON_PROGRESSIONS = [
  { name: "I-V-VI-IV",      tag:"Pop",   degrees:[0,4,5,3],           desc:"The most popular in pop music" },
  { name: "I-IV-V",         tag:"Rock",   degrees:[0,3,4],             desc:"Classic rock and blues" },
  { name: "I-IV-I-V",       tag:"Rock",   degrees:[0,3,0,4],           desc:"Rock and roll" },
  { name: "I-VI-IV-V",      tag:"Pop",   degrees:[0,5,3,4],           desc:"1950s, doo-wop" },
  { name: "I-VI-II-V",      tag:"Pop",   degrees:[0,5,1,4],           desc:"Standard pop/jazz" },
  { name: "I-VII-VI-VII",   tag:"Minor", degrees:[0,6,5,6],           desc:"Dark rock, metal" },
  { name: "I-IV-VII-IV",    tag:"Minor", degrees:[0,3,6,3],           desc:"Grunge, alternative" },
  { name: "I-VI-III-VII",   tag:"Minor", degrees:[0,5,2,6],           desc:"Pop rock" },
  { name: "I-III-VI-VII",   tag:"Minor", degrees:[0,2,5,6],           desc:"Pop minor" },
  { name: "I-V-VI-III-IV",  tag:"Minor", degrees:[0,4,5,2,3],         desc:"Canon minor" },
  { name: "12-bar blues",   tag:"Blues",  degrees:[0,0,0,0,3,3,0,0,4,3,0,4], desc:"12-bar blues" },
  { name: "8-bar blues",    tag:"Blues",  degrees:[0,3,0,4,3,0],       desc:"8-bar blues" },
  { name: "II-V-I",         tag:"Jazz",  degrees:[1,4,0],             desc:"Main jazz progression" },
  { name: "I-VI-II-V loop", tag:"Jazz",  degrees:[0,5,1,4],           desc:"Rhythm changes A" },
  { name: "III-VI-II-V",    tag:"Jazz",  degrees:[2,5,1,4],           desc:"Extended jazz progression" },
  { name: "I-VII-VI",       tag:"Modal", degrees:[0,6,5],             desc:"Dorian mode descent" },
  { name: "I-IV-I-IV",      tag:"Funk",  degrees:[0,3,0,3],           desc:"Funk, vamp" },
  { name: "I-II-IV-I",      tag:"Modal", degrees:[0,1,3,0],           desc:"Lydian mode rotation" },
  { name: "VI-IV-I-V",      tag:"Pop",   degrees:[5,3,0,4],           desc:"Pop rotation" },
  { name: "I-V-IV",         tag:"Rock",   degrees:[0,4,3],             desc:"Power ballad" },
];

export const TAG_COLORS = {
  "Pop":"#60a8e0","Rock":"#e07060","Minor":"#9060d8",
  "Blues":"#e0a040","Jazz":"#50c898","Funk":"#e050a8","Modal":"#8890e0",
};

export const ALL_TAGS = ["All","Pop","Rock","Minor","Blues","Jazz","Funk","Modal"];

export const CHORD_MOD_INT = {
  sus2: { 3:[0,2,7],   7:[0,2,7,10],   9:null,          11:[0,2,7,10,17]   },
  sus4: { 3:[0,5,7],   7:[0,5,7,10],   9:[0,5,7,10,14], 11:null            },
  "6":  { 3:[0,4,7,9], 7:null,         9:null,          11:null            },
  m6:   { 3:[0,3,7,9], 7:null,         9:null,          11:null            },
  dom7: { 3:[0,4,7,10],7:[0,4,7,10],   9:[0,4,7,10,14], 11:[0,4,7,10,14,17]},
  aug:  { 3:[0,4,8],   7:[0,4,8,11],   9:[0,4,8,11,14], 11:[0,4,8,11,14,17]},
  dim:  { 3:[0,3,6],   7:[0,3,6,9],    9:[0,3,6,9,14],  11:[0,3,6,9,14,17] },
};

export const MOD_SFX = {
  sus2: { 3:"sus2", 7:"7sus2", 11:"11sus2" },
  sus4: { 3:"sus4", 7:"7sus4", 9:"9sus4" },
  "6":  { 3:"6" },
  m6:   { 3:"m6" },
  dom7: { 3:"7", 7:"7", 9:"9", 11:"11" },
  aug:  { 3:"+", 7:"+7", 9:"+9", 11:"+11" },
  dim:  { 3:"°", 7:"°7", 9:"°9", 11:"°11" },
};

export const MOD_VALID_EXT = {
  sus2:[3,7,11], sus4:[3,7,9], "6":[3], m6:[3], dom7:[3,7,9,11], aug:[3,7,9,11], dim:[3,7,9,11],
};

export const SCALE_FAMILIES = {
  pentatonic:     { label:"Pentatonic",          maj:"major_penta",    min:"minor_penta",    dim:"minor_penta",    aug:"major_penta" },
  natural:        { label:"Natural",    maj:"major",          min:"natural_minor",  dim:"locrian",        aug:"lydian" },
  blues:          { label:"Blues",                 maj:"blues",          min:"blues",           dim:"blues",          aug:"blues" },
  harmonic_minor: { label:"Harmonic Minor",  maj:"harmonic_minor", min:"harmonic_minor",  dim:"harmonic_minor", aug:"harmonic_minor" },
  melodic_minor:  { label:"Melodic Minor",   maj:"melodic_minor",  min:"melodic_minor",   dim:"melodic_minor",  aug:"melodic_minor" },
  dorian:         { label:"Dorian",            maj:"dorian",         min:"dorian",          dim:"dorian",         aug:"dorian" },
  phrygian:       { label:"Phrygian",           maj:"phrygian",       min:"phrygian",        dim:"phrygian",       aug:"phrygian" },
  lydian:         { label:"Lydian",            maj:"lydian",         min:"lydian",          dim:"lydian",         aug:"lydian" },
  mixolydian:     { label:"Mixolydian",       maj:"mixolydian",     min:"mixolydian",      dim:"mixolydian",     aug:"mixolydian" },
  locrian:        { label:"Locrian",           maj:"locrian",        min:"locrian",         dim:"locrian",        aug:"locrian" },
};
