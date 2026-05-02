export const SCHEMA_VERSION = 2;
export const APP_VERSION = '1.0.0';

export const ART_SYSTEMS = [
  {
    id: 'type-block',
    name: 'Type Block',
    description: 'Asymmetric type, rules, and one decisive color block.',
  },
  {
    id: 'modular-bars',
    name: 'Modular Bars',
    description: 'A strict grid of vertical and horizontal poster bars.',
  },
  {
    id: 'circle-study',
    name: 'Circle Study',
    description: 'Cropped circles and measured typographic anchors.',
  },
  {
    id: 'index-field',
    name: 'Index Field',
    description: 'Large catalog numbers with small-system details.',
  },
];

export const ART_PALETTES = [
  {
    id: 'zurich-red',
    name: 'Zurich Red',
    colors: {
      background: '#f4f1ea',
      ink: '#111111',
      muted: '#7f7b72',
      accent: '#e03125',
      accent2: '#111111',
    },
  },
  {
    id: 'basel-blue',
    name: 'Basel Blue',
    colors: {
      background: '#f3f5f6',
      ink: '#101317',
      muted: '#6d747c',
      accent: '#0057b8',
      accent2: '#f0c808',
    },
  },
  {
    id: 'graphite-orange',
    name: 'Graphite Orange',
    colors: {
      background: '#111111',
      ink: '#f7f4ed',
      muted: '#898780',
      accent: '#f04e23',
      accent2: '#d7d2c8',
    },
  },
  {
    id: 'signal-green',
    name: 'Signal Green',
    colors: {
      background: '#f7f5ec',
      ink: '#0d0d0d',
      muted: '#74746c',
      accent: '#0f8f5f',
      accent2: '#1e5aa8',
    },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: {
      background: '#f0efe8',
      ink: '#0c0c0c',
      muted: '#77756e',
      accent: '#0c0c0c',
      accent2: '#d4d0c5',
    },
  },
  {
    id: 'custom',
    name: 'Custom',
    colors: {
      background: '#f4f1ea',
      ink: '#111111',
      muted: '#77756e',
      accent: '#e03125',
      accent2: '#0057b8',
    },
  },
];

export const BACKGROUND_MODES = [
  { id: 'paper', name: 'Paper' },
  { id: 'reverse', name: 'Reverse' },
  { id: 'accent', name: 'Accent Field' },
];

export const DEFAULT_PLAYLIST_TITLES = [
  'Morning Run',
  'Tempo Work',
  'Long Miles',
  'Recovery Set',
];

export const INDEX_PRESETS = [
  { id: 'numeric', name: 'Numeric' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
  { id: 'yearly', name: 'Yearly' },
];

export const DEFAULT_SERIES_DEFAULTS = {
  kicker: 'PLAYLIST',
  footer: 'SWISS SERIES',
  indexPreset: 'numeric',
  indexStart: '01',
};

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const DEFAULT_CUSTOM_COLORS = {
  background: '#f4f1ea',
  ink: '#111111',
  muted: '#77756e',
  accent: '#e03125',
  accent2: '#0057b8',
};

export function createInitialState() {
  const seriesDefaults = { ...DEFAULT_SERIES_DEFAULTS };

  return {
    masterSeed: 'playlist-series-2026',
    batchInput: DEFAULT_PLAYLIST_TITLES.join('\n'),
    seriesDefaults,
    artSystem: {
      templateId: 'type-block',
      gridDensity: 8,
      paletteId: 'zurich-red',
      customColors: { ...DEFAULT_CUSTOM_COLORS },
      typeScale: 1,
      variationStrength: 0.55,
      backgroundMode: 'paper',
    },
    typography: {
      family: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      kickerTracking: 2.6,
      titleTracking: -0.5,
      detailTracking: 1.2,
    },
    exportSettings: {
      jpgEnabled: false,
      jpgQuality: 0.92,
      size: 3000,
    },
    seriesItems: buildSeriesItemsFromTitles(DEFAULT_PLAYLIST_TITLES, [], seriesDefaults),
    ui: {
      selectedIndex: 0,
    },
  };
}

export function buildSeriesItemsFromText(text, existingItems = [], defaults = DEFAULT_SERIES_DEFAULTS) {
  const titles = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 24);

  return buildSeriesItemsFromTitles(titles.length ? titles : ['Untitled Playlist'], existingItems, defaults);
}

export function buildSeriesItemsFromTitles(titles, existingItems = [], defaults = DEFAULT_SERIES_DEFAULTS) {
  return titles.map((title, index) => {
    const existing = existingItems[index] || {};
    const indexLabel = existing.indexLabel || buildIndexLabel(index, defaults);
    return normalizeSeriesItem(
      {
        title,
        kicker: existing.kicker || defaults.kicker,
        footer: existing.footer || defaults.footer,
        variantSeed: existing.variantSeed || indexLabel,
        indexLabel,
      },
      index,
      titles.length,
    );
  });
}

export function normalizeSeriesItem(item, index, count) {
  const indexLabel = item.indexLabel || formatIndexLabel(index);

  return {
    index,
    title: item.title || `Playlist ${index + 1}`,
    kicker: item.kicker || item.header || DEFAULT_SERIES_DEFAULTS.kicker,
    footer: item.footer || item.subheader || DEFAULT_SERIES_DEFAULTS.footer,
    variantSeed: item.variantSeed || item.suffix || defaultVariantSeed(index, count),
    indexLabel,
  };
}

export function defaultVariantSeed(index, count) {
  if (count === 4) return `Q${index + 1}`;
  return `${index + 1}`.padStart(2, '0');
}

export function buildIndexLabel(index, defaults = DEFAULT_SERIES_DEFAULTS) {
  const preset = defaults.indexPreset || 'numeric';
  const start = String(defaults.indexStart || DEFAULT_SERIES_DEFAULTS.indexStart).trim();

  if (preset === 'monthly') {
    const startMonth = parseMonthIndex(start);
    return MONTH_LABELS[(startMonth + index) % MONTH_LABELS.length];
  }

  if (preset === 'quarterly') {
    const startQuarter = parseQuarterIndex(start);
    return `Q${((startQuarter + index) % 4) + 1}`;
  }

  if (preset === 'yearly') {
    const startYear = Number.parseInt(start, 10) || new Date().getFullYear();
    return `${startYear + index}`;
  }

  const startNumber = Number.parseInt(start, 10) || 1;
  const padLength = Math.max(2, start.replace(/\D/g, '').length);
  return `${startNumber + index}`.padStart(padLength, '0');
}

export function formatIndexLabel(index) {
  return `${index + 1}`.padStart(2, '0');
}

export function getArtSystem(id) {
  return ART_SYSTEMS.find((system) => system.id === id) || ART_SYSTEMS[0];
}

export function getPalette(id) {
  return ART_PALETTES.find((palette) => palette.id === id) || ART_PALETTES[0];
}

export function resolvePalette(artSystem) {
  if (artSystem.paletteId === 'custom') {
    return {
      id: 'custom',
      name: 'Custom',
      colors: {
        ...DEFAULT_CUSTOM_COLORS,
        ...artSystem.customColors,
      },
    };
  }
  return getPalette(artSystem.paletteId);
}

export function buildThemeExport(state) {
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    timestamp: new Date().toISOString(),
    masterSeed: state.masterSeed,
    count: state.seriesItems.length,
    seriesDefaults: state.seriesDefaults,
    artSystem: state.artSystem,
    typography: state.typography,
    exportSettings: state.exportSettings,
    seriesItems: state.seriesItems,
  };
}

export function applyThemeImport(currentState, data) {
  if (data.schemaVersion === 1) {
    return migrateV1Theme(currentState, data);
  }

  const importedItems = Array.isArray(data.seriesItems) && data.seriesItems.length
    ? data.seriesItems.map((item, index) => normalizeSeriesItem(item, index, data.seriesItems.length))
    : currentState.seriesItems;

  const artSystem = {
    ...currentState.artSystem,
    ...data.artSystem,
    customColors: {
      ...currentState.artSystem.customColors,
      ...(data.artSystem?.customColors || {}),
    },
  };

  return {
    ...currentState,
    masterSeed: data.masterSeed || currentState.masterSeed,
    batchInput: importedItems.map((item) => item.title).join('\n'),
    seriesDefaults: {
      ...currentState.seriesDefaults,
      ...(data.seriesDefaults || {}),
    },
    artSystem,
    typography: {
      ...currentState.typography,
      ...(data.typography || {}),
    },
    exportSettings: {
      ...currentState.exportSettings,
      ...(data.exportSettings || {}),
    },
    seriesItems: importedItems,
    ui: {
      selectedIndex: 0,
    },
  };
}

function migrateV1Theme(currentState, data) {
  const oldRoles = data.palette?.roles || {};
  const items = Array.isArray(data.seriesItems) && data.seriesItems.length
    ? data.seriesItems.map((item, index) => normalizeSeriesItem(item, index, data.seriesItems.length))
    : currentState.seriesItems;

  return {
    ...currentState,
    masterSeed: data.masterSeed || currentState.masterSeed,
    batchInput: items.map((item) => item.title).join('\n'),
    seriesDefaults: {
      ...currentState.seriesDefaults,
      kicker: items[0]?.kicker || currentState.seriesDefaults.kicker,
      footer: items[0]?.footer || currentState.seriesDefaults.footer,
    },
    artSystem: {
      ...currentState.artSystem,
      templateId: 'type-block',
      gridDensity: 8,
      paletteId: 'custom',
      customColors: {
        background: data.backgroundColor || oldRoles.secondary || DEFAULT_CUSTOM_COLORS.background,
        ink: data.typography?.color || oldRoles.neutral || DEFAULT_CUSTOM_COLORS.ink,
        muted: oldRoles.secondary || DEFAULT_CUSTOM_COLORS.muted,
        accent: oldRoles.primary || DEFAULT_CUSTOM_COLORS.accent,
        accent2: oldRoles.accent1 || DEFAULT_CUSTOM_COLORS.accent2,
      },
      typeScale: 1,
      variationStrength: 0.55,
      backgroundMode: 'paper',
    },
    typography: {
      ...currentState.typography,
      family: data.typography?.title?.family || currentState.typography.family,
    },
    seriesItems: items,
    ui: {
      selectedIndex: 0,
    },
  };
}

function parseMonthIndex(value) {
  const normalized = value.slice(0, 3).toUpperCase();
  const monthIndex = MONTH_LABELS.indexOf(normalized);
  if (monthIndex >= 0) return monthIndex;
  const numericMonth = Number.parseInt(value, 10);
  if (Number.isFinite(numericMonth) && numericMonth >= 1 && numericMonth <= 12) return numericMonth - 1;
  return 0;
}

function parseQuarterIndex(value) {
  const match = value.match(/[1-4]/);
  if (match) return Number.parseInt(match[0], 10) - 1;
  return 0;
}
