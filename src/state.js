import { SHAPES } from "./render/shapes.js";
import { listIconCategories } from "./render/icons.js";

export const DEFAULT_FONTS = [
  "system-ui",
  "Helvetica Neue",
  "Helvetica",
  "Arial",
  "Inter",
  "SF Pro Display",
  "Segoe UI",
  "Roboto"
];

export const PRESET_FONTS = {
  header: "Helvetica Neue",
  title: "Helvetica Neue",
  subheader: "Helvetica Neue"
};

export function createSeriesItems(count) {
  return Array.from({ length: count }, (_, index) => ({
    header: "",
    title: `Playlist ${index + 1}`,
    subheader: "",
    suffix: count <= 4 ? `Q${index + 1}` : String(index + 1).padStart(2, "0")
  }));
}

export const DEFAULT_STATE = {
  seriesSetup: {
    masterSeed: "workout-series-2026",
    count: 4,
    variationMode: "colors",
    backgroundColor: "#111111",
    exportJpg: false
  },
  themeSuggestions: [],
  selectedThemeId: null,
  theme: null,
  seriesItems: createSeriesItems(4),
  ui: {
    selectedIndex: 0
  },
  typography: {
    headerFont: PRESET_FONTS.header,
    titleFont: PRESET_FONTS.title,
    subheaderFont: PRESET_FONTS.subheader,
    headerWeight: 500,
    titleWeight: 600,
    subheaderWeight: 500,
    textColor: "#f2f2f2",
    maxTitleWidthPct: 80
  },
  motif: {
    primaryShape: SHAPES[0],
    secondaryShapes: SHAPES.slice(1, 6),
    iconCategories: listIconCategories(),
    iconMix: 25,
    iconStyle: "stroke",
    strictSwiss: false
  },
  pattern: {
    mode: "tiled",
    density: 60,
    elementScale: 16,
    rotationVariance: 0.2,
    opacity: 0.25,
    marginPct: 0.08,
    safeZoneWidthPct: 0.55,
    safeZoneHeightPct: 0.3,
    safeZoneFalloff: 0.4,
    borderPaddingPct: 0.12
  }
};
