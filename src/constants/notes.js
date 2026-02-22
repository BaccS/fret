export const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export const SCALES = {
  major:          { name: "Мажор",               intervals: [0,2,4,5,7,9,11] },
  natural_minor:  { name: "Натуральный минор",   intervals: [0,2,3,5,7,8,10] },
  harmonic_minor: { name: "Гармонический минор", intervals: [0,2,3,5,7,8,11] },
  melodic_minor:  { name: "Мелодический минор",  intervals: [0,2,3,5,7,9,11] },
  dorian:         { name: "Дорийский",           intervals: [0,2,3,5,7,9,10] },
  phrygian:       { name: "Фригийский",          intervals: [0,1,3,5,7,8,10] },
  lydian:         { name: "Лидийский",           intervals: [0,2,4,6,7,9,11] },
  mixolydian:     { name: "Миксолидийский",      intervals: [0,2,4,5,7,9,10] },
  locrian:        { name: "Локрийский",          intervals: [0,1,3,5,6,8,10] },
  major_penta:    { name: "Мажорная пентатоника",intervals: [0,2,4,7,9] },
  minor_penta:    { name: "Минорная пентатоника",intervals: [0,3,5,7,10] },
  blues:          { name: "Блюз",                intervals: [0,3,5,6,7,10] },
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
  { name: "I-V-VI-IV",      tag:"Поп",   degrees:[0,4,5,3],           desc:"Самая популярная в поп-музыке" },
  { name: "I-IV-V",         tag:"Рок",   degrees:[0,3,4],             desc:"Классический рок и блюз" },
  { name: "I-IV-I-V",       tag:"Рок",   degrees:[0,3,0,4],           desc:"Рок-н-ролл" },
  { name: "I-VI-IV-V",      tag:"Поп",   degrees:[0,5,3,4],           desc:"50-е, doo-wop" },
  { name: "I-VI-II-V",      tag:"Поп",   degrees:[0,5,1,4],           desc:"Стандарт поп/джаз" },
  { name: "I-VII-VI-VII",   tag:"Минор", degrees:[0,6,5,6],           desc:"Тёмный рок, метал" },
  { name: "I-IV-VII-IV",    tag:"Минор", degrees:[0,3,6,3],           desc:"Гранж, альтернатива" },
  { name: "I-VI-III-VII",   tag:"Минор", degrees:[0,5,2,6],           desc:"Кино, Цой" },
  { name: "I-III-VI-VII",   tag:"Минор", degrees:[0,2,5,6],           desc:"Поп-минор" },
  { name: "I-V-VI-III-IV",  tag:"Минор", degrees:[0,4,5,2,3],         desc:"Canon minor" },
  { name: "12-bar blues",   tag:"Блюз",  degrees:[0,0,0,0,3,3,0,0,4,3,0,4], desc:"12-тактовый блюз" },
  { name: "8-bar blues",    tag:"Блюз",  degrees:[0,3,0,4,3,0],       desc:"8-тактовый блюз" },
  { name: "II-V-I",         tag:"Джаз",  degrees:[1,4,0],             desc:"Главный джазовый оборот" },
  { name: "I-VI-II-V loop", tag:"Джаз",  degrees:[0,5,1,4],           desc:"Rhythm changes A" },
  { name: "III-VI-II-V",    tag:"Джаз",  degrees:[2,5,1,4],           desc:"Расширенный джаз-оборот" },
  { name: "I-VII-VI",       tag:"Модал", degrees:[0,6,5],             desc:"Дорийский спуск" },
  { name: "I-IV-I-IV",      tag:"Фанк",  degrees:[0,3,0,3],           desc:"Фанк, вамп" },
  { name: "I-II-IV-I",      tag:"Модал", degrees:[0,1,3,0],           desc:"Лидийский оборот" },
  { name: "VI-IV-I-V",      tag:"Поп",   degrees:[5,3,0,4],           desc:"Pop rotation" },
  { name: "I-V-IV",         tag:"Рок",   degrees:[0,4,3],             desc:"Power ballad" },
];

export const TAG_COLORS = {
  "Поп":"#60a8e0","Рок":"#e07060","Минор":"#9060d8",
  "Блюз":"#e0a040","Джаз":"#50c898","Фанк":"#e050a8","Модал":"#8890e0",
};

export const ALL_TAGS = ["Все","Поп","Рок","Минор","Блюз","Джаз","Фанк","Модал"];
