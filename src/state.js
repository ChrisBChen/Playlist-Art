import { palettePresets, generatePaletteFromPrimary } from './utils/color.js';
import { patternModes } from './render/patterns.js';
import { shapeTypes } from './render/shapes.js';
import { iconCategories } from '../assets/icons/icon-data.js';
import { pickRandom, seededRandom, stringToSeed } from './utils/seed.js';

export const FONT_OPTIONS = [
  'system-ui',
  '"Helvetica Neue"',
  'Helvetica',
  'Arial',
  'Inter',
  '"SF Pro"',
  '"Segoe UI"',
  'Roboto',
];

const MOTIF_SETS = [
  {
    name: 'Circles + Lines',
    primaryShape: 'circle',
    secondaryShapes: ['line', 'ring', 'arc'],
    iconMix: 0.1,
  },
  {
    name: 'Squares + Diamonds',
    primaryShape: 'square',
    secondaryShapes: ['diamond', 'roundedSquare', 'rectangle'],
    iconMix: 0.15,
  },
  {
    name: 'Triangles + Angles',
    primaryShape: 'triangle',
    secondaryShapes: ['rightTriangle', 'line', 'x'],
    iconMix: 0.2,
  },
  {
    name: 'Stars + Plus',
    primaryShape: 'star',
    secondaryShapes: ['plus', 'octagon', 'hexagon'],
    iconMix: 0.2,
  },
];

export function initialState() {
  return {
    seriesSetup: {
      seriesSeed: 'workout-series-2026',
      numCovers: 4,
      variationMode: 'colors',
      backgroundColor: '#111111',
      exportJpg: false,
      canvasSize: 3000,
    },
    themeSuggestions: [],
    selectedTheme: null,
    seriesItems: [],
    ui: {
      selectedIndex: 0,
      jpgQuality: 0.92,
      exportFormat: 'png',
      previewSize: 1000,
    },
  };
}

export function buildSeriesItems(count) {
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const suffix = count === 4 ? `Q${i + 1}` : String(i + 1).padStart(2, '0');
    items.push({
      header: 'HEADER',
      title: `Playlist ${i + 1}`,
      subheader: 'SUBHEADER',
      suffix,
    });
  }
  return items;
}

export function buildThemeSuggestion({ seriesSeed, variationMode, numCovers, index }) {
  const seed = `${seriesSeed}|themeCandidate|${index}|${variationMode}|${numCovers}`;
  const rng = seededRandom(seed);
  const paletteOptions = palettePresets();
  const palette = pickRandom(rng, paletteOptions);
  const motifSet = pickRandom(rng, MOTIF_SETS);
  const patternMode = pickRandom(rng, patternModes);
  const themeId = `${stringToSeed(seed)}-${index}`;

  return {
    id: themeId,
    name: variationMode === 'colors' ? palette.name : motifSet.name,
    palette,
    motif: {
      primaryShape: motifSet.primaryShape,
      secondaryShapes: motifSet.secondaryShapes,
      iconCategories: iconCategories.map((cat) => cat.id),
      iconMix: motifSet.iconMix,
      strokeIcons: true,
    },
    pattern: {
      mode: patternMode,
      density: 0.55,
      elementScale: 0.9,
      rotationVariance: 0.25,
      opacity: 0.25,
      safeZone: {
        width: 0.55,
        height: 0.3,
        falloff: 0.6,
      },
      marginPct: 0.08,
      gridSpacing: 1,
      jitter: 0.25,
      borderPadding: 0.08,
    },
  };
}

export function finalizeTheme({
  suggestion,
  backgroundColor,
  variationMode,
  paletteOverride,
  motifOverride,
  typography,
  pattern,
  strictSwiss,
  playful,
  strokeIcons,
}) {
  const palette = paletteOverride || suggestion.palette;
  const motif = motifOverride || suggestion.motif;
  const iconCategories = playful ? motif.iconCategories : [];
  const secondaryShapes = strictSwiss ? motif.secondaryShapes.filter((shape) => shapeTypes.includes(shape)) : motif.secondaryShapes;

  return {
    id: suggestion.id,
    name: suggestion.name,
    backgroundColor,
    variationMode,
    palette,
    motif: {
      ...motif,
      secondaryShapes,
      iconCategories,
      strokeIcons,
    },
    pattern: {
      ...suggestion.pattern,
      ...pattern,
    },
    typography: {
      ...typography,
    },
    noise: {
      enabled: false,
      opacity: 0.03,
    },
    uiTitleTooLong: false,
  };
}

export function themeFromImport(data) {
  const palette = data.palette || palettePresets()[0];
  const motif = data.motif || MOTIF_SETS[0];
  return {
    id: data.themeId || data.id || 'imported-theme',
    name: data.name || 'Imported Theme',
    backgroundColor: data.backgroundColor || '#111111',
    variationMode: data.variationMode || 'colors',
    palette: data.palette || palette,
    motif: {
      primaryShape: motif.primaryShape || 'circle',
      secondaryShapes: motif.secondaryShapes || ['circle', 'line'],
      iconCategories: motif.iconCategories || iconCategories.map((cat) => cat.id),
      iconMix: motif.iconMix ?? 0.2,
      strokeIcons: motif.strokeIcons ?? true,
    },
    pattern: {
      mode: data.pattern?.mode || 'Tiled Grid',
      density: data.pattern?.density ?? 0.55,
      elementScale: data.pattern?.elementScale ?? 0.9,
      rotationVariance: data.pattern?.rotationVariance ?? 0.25,
      opacity: data.pattern?.opacity ?? 0.25,
      safeZone: {
        width: data.pattern?.safeZone?.width ?? 0.55,
        height: data.pattern?.safeZone?.height ?? 0.3,
        falloff: data.pattern?.safeZone?.falloff ?? 0.6,
      },
      marginPct: data.pattern?.marginPct ?? 0.08,
      gridSpacing: data.pattern?.gridSpacing ?? 1,
      jitter: data.pattern?.jitter ?? 0.25,
      borderPadding: data.pattern?.borderPadding ?? 0.08,
    },
    typography: data.typography || buildDefaultTypography(),
    noise: data.noise || { enabled: false, opacity: 0.03 },
    uiTitleTooLong: false,
  };
}

export function buildDefaultTypography() {
  return {
    headerFont: 'system-ui',
    titleFont: '"Helvetica Neue"',
    subheaderFont: 'system-ui',
    headerWeight: 500,
    titleWeight: 700,
    subheaderWeight: 500,
    headerTracking: 0.04,
    titleTracking: 0.02,
    subheaderTracking: 0.04,
    textColor: '#f2f2f2',
    maxTitleWidth: 0.8,
  };
}

export function generatePaletteWithPrimary(primary) {
  return generatePaletteFromPrimary(primary);
}

export function motifOptions() {
  return MOTIF_SETS;
}
