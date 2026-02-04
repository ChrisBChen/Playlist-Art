export const ICON_CATEGORIES = {
  music: [
    { id: "note", name: "Note", path: "M9 18V5l12-2v13" },
    { id: "music-2", name: "Music 2", path: "M9 18V5l12-2v13M5 20h4" },
    { id: "equalizer", name: "Equalizer", path: "M4 10h2M8 6h2M12 14h2M16 8h2M20 12h2" },
    { id: "headphones", name: "Headphones", path: "M3 18v-2a9 9 0 0 1 18 0v2" },
    { id: "microphone", name: "Microphone", path: "M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" }
  ],
  fitness: [
    { id: "dumbbell", name: "Dumbbell", path: "M2 10h2v4H2zM6 9h2v6H6zM10 8h4v8h-4zM16 9h2v6h-2zM20 10h2v4h-2z" },
    { id: "activity", name: "Activity", path: "M4 12h4l2-5 4 10 2-5h4" },
    { id: "flame", name: "Flame", path: "M12 2c2 4 5 6 5 10a5 5 0 1 1-10 0c0-4 3-6 5-10" },
    { id: "zap", name: "Zap", path: "M13 2L3 14h7l-1 8 10-12h-7z" },
    { id: "heart-pulse", name: "Heart Pulse", path: "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10" }
  ],
  general: [
    { id: "sun", name: "Sun", path: "M12 4V2m0 20v-2m8-8h2M2 12h2m14.1 5.9 1.4 1.4M4.5 4.5l1.4 1.4m0 12.2-1.4 1.4m12.2-12.2 1.4-1.4" },
    { id: "moon", name: "Moon", path: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" },
    { id: "sparkles", name: "Sparkles", path: "M5 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM16 12l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" },
    { id: "bolt", name: "Bolt", path: "M13 2 3 14h7l-1 8 10-12h-7z" },
    { id: "arrow", name: "Arrow", path: "M5 12h14m0 0-5-5m5 5-5 5" }
  ],
  arrows: [
    { id: "arrow-up", name: "Arrow Up", path: "M12 19V5m0 0-5 5m5-5 5 5" },
    { id: "arrow-right", name: "Arrow Right", path: "M5 12h14m0 0-5-5m5 5-5 5" },
    { id: "arrow-down", name: "Arrow Down", path: "M12 5v14m0 0-5-5m5 5 5-5" },
    { id: "arrow-left", name: "Arrow Left", path: "M19 12H5m0 0 5-5m-5 5 5 5" }
  ],
  abstract: [
    { id: "dot", name: "Dot", path: "M12 12h0" },
    { id: "check", name: "Check", path: "M5 12l4 4L19 6" },
    { id: "arc", name: "Arc", path: "M5 15a7 7 0 0 1 14 0" },
    { id: "ring", name: "Ring", path: "M12 6a6 6 0 1 1-0.1 0" },
    { id: "plus", name: "Plus", path: "M12 5v14m-7-7h14" }
  ]
};

export const ALL_ICON_IDS = Object.values(ICON_CATEGORIES).flat();
