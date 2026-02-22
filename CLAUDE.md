# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FRET — интерактивное React-приложение для изучения гитарного грифа, визуализации гамм/аккордов и практики прогрессий с синтезом звука в реальном времени. Интерфейс на русском языке.

## Commands

```bash
npm start        # Dev-сервер (port 3000)
npm run build    # Production-сборка
npm test         # Jest в watch-режиме
```

Проект создан через Create React App (react-scripts 5.0.1) — конфигурация webpack/babel/eslint скрыта за CRA. ESLint использует пресеты `react-app` и `react-app/jest`.

## Architecture

```
src/
  constants/          — музыкально-теоретические данные и визуальные константы
    notes.js          — NOTES, SCALES, CHORD_DEGREES, CHORD_INT, ROMAN, COMMON_PROGRESSIONS
    fretboard.js      — OPEN_MIDI, STR_NAMES, FRETBOARD_DATA (6 струн × 16 ладов)
    colors.js         — SCALE_COLORS, CHROMA_COLORS, SOLO_COLOR, noteColor()
    styles.js         — общие inline-стили кнопок (MINI_BTN, MET_BTN, NAV_BTN)
  engine/
    audioEngine.js    — Web Audio API синтез (двойной осциллятор, фильтр, envelope). Синглтон audioEngine.
    metronomeEngine.js — метроном с BPM, тактовым размером, паттернами повтора. Синглтон metronomeEngine.
  theory/
    harmony.js        — getScaleNotes(), getHarmony() — вычисление нот гаммы и диатонических аккордов
  hooks/
    useLocalStorage.js — хук-обёртка над useState с автосохранением в localStorage (префикс fret_)
  components/
    Fretboard.js      — SVG-гриф (FbNote + Fretboard). 1-я струна (высокая e) сверху.
    HarmonyPanel.js   — кнопки 7 диатонических аккордов
    ProgressionBuilder.js — конструктор прогрессий + ChordSlot (drag-reorder, пресеты)
    MetronomeWidget.js — управление BPM, тактовым размером, паттерном повтора
    Controls.js       — выбор тоники, гаммы, расширений аккордов, режимов цвета/подписей
    SoloControls.js   — настройка соло-слоя
    Legend.js          — легенда нот и ступеней
    ui/Seg.js, ui/Lbl.js — переиспользуемые UI-примитивы
  App.js              — корневой компонент: стейт, localStorage, layout
```

### Ключевые паттерны

- **Синглтоны движков**: `audioEngine` и `metronomeEngine` создаются на уровне модуля и импортируются напрямую компонентами, которым нужен звук.
- **localStorage**: Настройки (тоника, гамма, BPM, громкость, прогрессия) сохраняются через хук `useLocalStorage`. Прогрессия хранится как индексы ступеней + привязка к тоника/гамма; восстанавливается только если совпадает.
- **Гриф перевёрнут визуально** (`5-s` в SVG-координатах), но данные (`OPEN_MIDI`, `FRETBOARD_DATA`) идут в порядке low E → high E (индекс 0 = 6-я струна).

### Стилизация

Inline-стили (без CSS-in-JS библиотек). Тёмная тема (#0a0a0a). Акцентные цвета: золотой (#e8b84b) для активных элементов, циан (#2dd4bf) для аккордовых нот, розовый (#f472b6) для соло-нот.

## Key Technical Details

- MIDI → частота: `440 * 2^((midi-69)/12)`
- Строй гитары: E2-A2-D3-G3-B3-E4 (стандартный)
- Аудио-контекст требует resume по клику (браузерная политика autoplay)
- Шрифты: Unbounded (заголовки), DM Mono (моноширинный) — подключены через @import в App.js
- Зависимости: React 19, Tone.js (подключён, но основной синтез через кастомный AudioEngine на Web Audio API)
