export const APP_VERSION = "1.0.0";
export const SCHEMA_VERSION = "1.0";

export const FONT_OPTIONS = [
  "system-ui",
  "Helvetica Neue",
  "Helvetica",
  "Arial",
  "Inter",
  "SF Pro Display",
  "Segoe UI",
  "Roboto"
];

export const PATTERN_MODES = [
  "Tiled Grid",
  "Offset Grid",
  "Diagonal Drift",
  "Radial Scatter",
  "Isometric-ish",
  "Border Band"
];

export const DEFAULT_TYPOGRAPHY = {
  headerFont: "system-ui",
  titleFont: "Helvetica Neue",
  subheaderFont: "system-ui",
  headerWeight: 500,
  titleWeight: 700,
  subheaderWeight: 500,
  headerTracking: 0.12,
  titleTracking: 0.08,
  subheaderTracking: 0.16,
  textColor: "#F2F2F2",
  maxTitleWidthPct: 0.8,
  baselineUnit: 12
};

export const DEFAULT_THEME = {
  themeId: "",
  variationMode: "colors",
  backgroundColor: "#111111",
  palette: {
    name: "Mono + Neon Accent",
    roles: {
      primary: "#7CF6FF",
      secondary: "#E8E8E8",
      accent1: "#63B3FF",
      accent2: "#FFB454",
      neutral: "#F2F2F2"
    },
    method: "preset"
  },
  motif: {
    primaryShape: "circle",
    secondaryShapes: ["square", "triangle", "ring"],
    iconIds: ["music-note", "sparkles", "headphones"],
    iconCategories: ["music", "general", "abstract"],
    iconMix: 0.25,
    strokeIcons: true,
    strictSwiss: false
  },
  pattern: {
    mode: "Tiled Grid",
    density: 0.6,
    elementScale: 0.7,
    rotationVariance: 0.2,
    opacity: 0.25,
    gridSpacing: 0.12,
    jitter: 0.25,
    borderPadding: 0.12,
    safeZoneWidthPct: 0.55,
    safeZoneHeightPct: 0.3,
    safeZoneFalloff: 0.6,
    marginPct: 0.08
  },
  typography: { ...DEFAULT_TYPOGRAPHY }
};

export function createSeriesItems(count) {
  return Array.from({ length: count }, (_, index) => {
    const label = count === 4 ? `Q${index + 1}` : `${index + 1}`.padStart(2, "0");
    return {
      header: "",
      title: "Playlist Name",
      subheader: "",
      suffix: label
    };
  });
}

export function createInitialState() {
  const count = 4;
  return {
    seriesSeed: "workout-series-2026",
    seriesSetup: {
      count,
      variationMode: "colors",
      backgroundColor: "#111111",
      exportJpg: false
    },
    themeSuggestions: [],
    selectedTheme: { ...DEFAULT_THEME },
    seriesItems: createSeriesItems(count),
    ui: {
      selectedIndex: 0
    }
  };
}
