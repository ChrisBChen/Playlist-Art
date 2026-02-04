import { PALETTE_PRESETS } from './utils/color.js';
import { SHAPE_TYPES } from './render/shapes.js';
import { ICON_CATEGORIES } from './render/icons.js';
import { PATTERN_MODES } from './render/patterns.js';

export const SCHEMA_VERSION = 1;
export const APP_VERSION = '0.1.0';

export function createInitialState() {
  return {
    seriesSetup: {
      count: 4,
      variationMode: 'vary-colors',
      backgroundColor: '#111111',
      masterSeed: 'workout-series-2026',
      exportJpg: false,
      jpgQuality: 0.92,
    },
    themeSuggestions: [],
    selectedTheme: null,
    typography: {
      header: { family: 'system-ui, Helvetica Neue, Helvetica, Arial, sans-serif', weight: 500, tracking: 2 },
      title: { family: 'system-ui, Helvetica Neue, Helvetica, Arial, sans-serif', weight: 700, tracking: 1 },
      subheader: { family: 'system-ui, Helvetica Neue, Helvetica, Arial, sans-serif', weight: 500, tracking: 1.5 },
      color: '#f2f2f2',
      maxTitleWidth: 0.8,
    },
    motifControls: {
      primaryShape: SHAPE_TYPES[0],
      secondaryShapes: [SHAPE_TYPES[1], SHAPE_TYPES[2]],
      iconMix: 0.25,
      iconFilled: false,
      iconStrokeWidth: 2,
      shapeFilled: true,
      strokeWidth: 2,
      strictSwiss: true,
      playful: false,
      iconCategories: Object.keys(ICON_CATEGORIES).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {}),
    },
    paletteControls: {
      presetIndex: 0,
      customPrimary: '#39ffb8',
    },
    patternControls: {
      mode: PATTERN_MODES[0],
      density: 0.5,
      scale: 0.5,
      rotationVariance: 0.3,
      opacity: 0.25,
      safeZone: { width: 0.55, height: 0.3, falloff: 0.25 },
      marginPct: 0.08,
    },
    seriesItems: buildSeriesItems(4),
    ui: {
      selectedIndex: 0,
      showDevTools: false,
    },
  };
}

export function buildSeriesItems(count) {
  return Array.from({ length: count }, (_, index) => ({
    index,
    header: `SERIES ${index + 1}`,
    title: `Playlist ${index + 1}`,
    subheader: 'Swiss Minimal',
    suffix: defaultSuffix(index, count),
  }));
}

export function defaultSuffix(index, count) {
  if (count === 4) {
    return `Q${index + 1}`;
  }
  return `${index + 1}`.padStart(2, '0');
}

export function buildThemeFromState(state, themeId) {
  const palettePreset = PALETTE_PRESETS[state.paletteControls.presetIndex] || PALETTE_PRESETS[0];
  return {
    themeId,
    backgroundColor: state.seriesSetup.backgroundColor,
    palette: palettePreset,
    motif: {
      primaryShape: state.motifControls.primaryShape,
      secondaryShapes: state.motifControls.secondaryShapes,
      icons: [],
      iconMix: state.motifControls.iconMix,
      iconCategories: state.motifControls.iconCategories,
      iconFilled: state.motifControls.iconFilled,
      iconStrokeWidth: state.motifControls.iconStrokeWidth,
      shapeFilled: state.motifControls.shapeFilled,
      strokeWidth: state.motifControls.strokeWidth,
    },
    pattern: state.patternControls,
  };
}

export function buildThemeExport(state) {
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    timestamp: new Date().toISOString(),
    masterSeed: state.seriesSetup.masterSeed,
    count: state.seriesSetup.count,
    variationMode: state.seriesSetup.variationMode,
    themeId: state.selectedTheme?.themeId || 'theme-0',
    backgroundColor: state.seriesSetup.backgroundColor,
    palette: state.selectedTheme?.palette,
    motif: state.selectedTheme?.motif,
    pattern: state.selectedTheme?.pattern,
    typography: state.typography,
    seriesItems: state.seriesItems,
  };
}

export function applyThemeImport(state, data) {
  return {
    ...state,
    seriesSetup: {
      ...state.seriesSetup,
      count: data.count ?? state.seriesSetup.count,
      variationMode: data.variationMode ?? state.seriesSetup.variationMode,
      backgroundColor: data.backgroundColor ?? state.seriesSetup.backgroundColor,
      masterSeed: data.masterSeed ?? state.seriesSetup.masterSeed,
    },
    selectedTheme: {
      themeId: data.themeId,
      backgroundColor: data.backgroundColor,
      palette: data.palette,
      motif: data.motif,
      pattern: data.pattern,
    },
    typography: data.typography ?? state.typography,
    seriesItems: data.seriesItems ?? state.seriesItems,
  };
}
