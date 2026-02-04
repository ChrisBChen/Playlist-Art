import {
  createInitialState,
  buildSeriesItems,
  buildThemeExport,
  applyThemeImport,
  APP_VERSION,
} from './state.js';
import { PALETTE_PRESETS, buildPaletteFromPrimary } from './utils/color.js';
import { makeRng, pick, stringToSeed } from './utils/seed.js';
import { SHAPE_TYPES } from './render/shapes.js';
import { ICON_CATEGORIES, ICONS } from './render/icons.js';
import { PATTERN_MODES } from './render/patterns.js';
import { renderCover, clearPlacementCache } from './render/render.js';

const state = createInitialState();
const previewSize = 1000;
const exportSize = 3000;

const elements = {
  countInput: document.getElementById('series-count'),
  variationInputs: document.querySelectorAll('input[name="variation-mode"]'),
  backgroundInput: document.getElementById('background-color'),
  masterSeedInput: document.getElementById('master-seed'),
  exportJpgToggle: document.getElementById('export-jpg'),
  jpgQuality: document.getElementById('jpg-quality'),
  generateThemesBtn: document.getElementById('generate-themes'),
  themeCards: document.getElementById('theme-cards'),
  motifSection: document.getElementById('motif-section'),
  paletteSection: document.getElementById('palette-section'),
  patternMode: document.getElementById('pattern-mode'),
  density: document.getElementById('density'),
  scale: document.getElementById('scale'),
  rotationVariance: document.getElementById('rotation'),
  opacity: document.getElementById('opacity'),
  primaryShape: document.getElementById('primary-shape'),
  iconMix: document.getElementById('icon-mix'),
  iconFilled: document.getElementById('icon-filled'),
  shapeFilled: document.getElementById('shape-filled'),
  strictSwiss: document.getElementById('strict-swiss'),
  playful: document.getElementById('playful'),
  iconCategories: document.getElementById('icon-categories'),
  palettePreset: document.getElementById('palette-preset'),
  customPrimary: document.getElementById('custom-primary'),
  fontHeader: document.getElementById('font-header'),
  fontTitle: document.getElementById('font-title'),
  fontSubheader: document.getElementById('font-subheader'),
  textColor: document.getElementById('text-color'),
  previewCanvas: document.getElementById('preview-canvas'),
  seriesList: document.getElementById('series-list'),
  exportAllPng: document.getElementById('export-all-png'),
  exportAllJpg: document.getElementById('export-all-jpg'),
  downloadTheme: document.getElementById('download-theme'),
  importTheme: document.getElementById('import-theme'),
  importInput: document.getElementById('import-input'),
  titleWarning: document.getElementById('title-warning'),
  devPanel: document.getElementById('dev-panel'),
  determinismCheck: document.getElementById('determinism-check'),
  determinismResult: document.getElementById('determinism-result'),
  selectedIndexLabel: document.getElementById('selected-index'),
};

const previewCtx = elements.previewCanvas.getContext('2d');

elements.previewCanvas.width = previewSize;

elements.previewCanvas.height = previewSize;

const fontOptions = [
  'system-ui, Helvetica Neue, Helvetica, Arial, sans-serif',
  'Helvetica Neue, Helvetica, Arial, sans-serif',
  'Inter, system-ui, sans-serif',
  'SF Pro Display, system-ui, sans-serif',
  'Segoe UI, system-ui, sans-serif',
  'Roboto, system-ui, sans-serif',
];

function initSelectOptions(select, options) {
  select.innerHTML = '';
  options.forEach((option) => {
    const el = document.createElement('option');
    el.value = option;
    el.textContent = option.split(',')[0];
    select.appendChild(el);
  });
}

initSelectOptions(elements.fontHeader, fontOptions);
initSelectOptions(elements.fontTitle, fontOptions);
initSelectOptions(elements.fontSubheader, fontOptions);

SHAPE_TYPES.forEach((shape) => {
  const option = document.createElement('option');
  option.value = shape;
  option.textContent = shape;
  elements.primaryShape.appendChild(option);
});

PALETTE_PRESETS.forEach((palette, index) => {
  const option = document.createElement('option');
  option.value = index;
  option.textContent = palette.name;
  elements.palettePreset.appendChild(option);
});

PATTERN_MODES.forEach((mode) => {
  const option = document.createElement('option');
  option.value = mode;
  option.textContent = mode;
  elements.patternMode.appendChild(option);
});

function buildIconCategoryToggles() {
  elements.iconCategories.innerHTML = '';
  Object.keys(ICON_CATEGORIES).forEach((category) => {
    const label = document.createElement('label');
    label.className = 'checkbox';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = category;
    input.checked = state.motifControls.iconCategories[category];
    input.addEventListener('change', () => {
      state.motifControls.iconCategories[category] = input.checked;
      updateThemeFromControls();
    });
    const span = document.createElement('span');
    span.textContent = category;
    label.appendChild(input);
    label.appendChild(span);
    elements.iconCategories.appendChild(label);
  });
}

function getEnabledIcons() {
  const enabled = [];
  Object.entries(ICON_CATEGORIES).forEach(([category, icons]) => {
    if (state.motifControls.iconCategories[category]) {
      icons.forEach((icon) => {
        if (ICONS[icon]) enabled.push(icon);
      });
    }
  });
  return enabled;
}

function setVariationMode(value) {
  state.seriesSetup.variationMode = value;
  elements.motifSection.classList.toggle('hidden', value === 'vary-shapes');
  elements.paletteSection.classList.toggle('hidden', value === 'vary-colors');
}

function handleSeriesCountChange(value) {
  const count = Math.max(1, Math.min(24, Number.parseInt(value, 10)) || 1);
  state.seriesSetup.count = count;
  state.seriesItems = buildSeriesItems(count);
  state.ui.selectedIndex = 0;
  renderSeriesList();
  renderPreview();
}

function generateThemeSuggestions() {
  const { masterSeed, variationMode, count } = state.seriesSetup;
  const suggestions = [];
  for (let i = 0; i < 5; i += 1) {
    const seed = `${masterSeed}|themeCandidate|${i}|${variationMode}|${count}`;
    const rng = makeRng(seed);
    const palette = pick(rng, PALETTE_PRESETS);
    const motifSet = buildMotifSet(rng);
    const patternMode = pick(rng, PATTERN_MODES);
    const theme = {
      themeId: `theme-${stringToSeed(seed)}`,
      backgroundColor: state.seriesSetup.backgroundColor,
      palette: variationMode === 'vary-colors' ? palette : PALETTE_PRESETS[state.paletteControls.presetIndex],
      motif: variationMode === 'vary-shapes' ? motifSet : buildMotifSet(rng),
      pattern: {
        ...state.patternControls,
        mode: patternMode,
      },
    };
    suggestions.push(theme);
  }
  state.themeSuggestions = suggestions;
  renderThemeSuggestions();
}

function buildMotifSet(rng) {
  const strictShapes = ['circle', 'square', 'rectangle', 'triangle', 'diamond', 'ring'];
  const playfulShapes = SHAPE_TYPES;
  const shapes = state.motifControls.strictSwiss ? strictShapes : playfulShapes;
  const primaryShape = pick(rng, shapes);
  const secondaryShapes = [pick(rng, shapes), pick(rng, shapes)].filter((shape) => shape !== primaryShape);
  const icons = state.motifControls.playful ? getEnabledIcons() : [];
  return {
    primaryShape,
    secondaryShapes: secondaryShapes.length ? secondaryShapes : [primaryShape],
    icons,
    iconMix: state.motifControls.iconMix,
    iconCategories: { ...state.motifControls.iconCategories },
    iconFilled: state.motifControls.iconFilled,
    iconStrokeWidth: state.motifControls.iconStrokeWidth,
    shapeFilled: state.motifControls.shapeFilled,
    strokeWidth: state.motifControls.strokeWidth,
  };
}

function updateThemeFromControls() {
  if (!state.selectedTheme) return;
  const palette = state.seriesSetup.variationMode === 'vary-colors'
    ? state.selectedTheme.palette
    : PALETTE_PRESETS[state.paletteControls.presetIndex];
  const motif = {
    ...state.selectedTheme.motif,
    primaryShape: state.motifControls.primaryShape,
    secondaryShapes: state.motifControls.secondaryShapes,
    icons: getEnabledIcons(),
    iconMix: state.motifControls.iconMix,
    iconCategories: { ...state.motifControls.iconCategories },
    iconFilled: state.motifControls.iconFilled,
    iconStrokeWidth: state.motifControls.iconStrokeWidth,
    shapeFilled: state.motifControls.shapeFilled,
    strokeWidth: state.motifControls.strokeWidth,
  };

  state.selectedTheme = {
    ...state.selectedTheme,
    backgroundColor: state.seriesSetup.backgroundColor,
    palette,
    motif,
    pattern: { ...state.patternControls },
  };
  clearPlacementCache();
  renderPreview();
}

function renderThemeSuggestions() {
  elements.themeCards.innerHTML = '';
  state.themeSuggestions.forEach((theme) => {
    const card = document.createElement('button');
    card.className = 'theme-card';
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    renderCover({
      ctx,
      size: 160,
      cover: { index: 0, suffix: 'preview', header: '', title: '', subheader: '' },
      theme,
      typography: state.typography,
      masterSeed: state.seriesSetup.masterSeed,
      variationMode: state.seriesSetup.variationMode,
    });
    const paletteSummary = document.createElement('div');
    paletteSummary.className = 'palette-summary';
    Object.values(theme.palette.roles).forEach((color) => {
      const swatch = document.createElement('span');
      swatch.style.backgroundColor = color;
      paletteSummary.appendChild(swatch);
    });
    const label = document.createElement('span');
    label.textContent = theme.pattern.mode;
    card.appendChild(canvas);
    card.appendChild(paletteSummary);
    card.appendChild(label);
    card.addEventListener('click', () => {
      state.selectedTheme = theme;
      state.motifControls.primaryShape = theme.motif.primaryShape;
      state.motifControls.secondaryShapes = theme.motif.secondaryShapes;
      state.motifControls.iconMix = theme.motif.iconMix;
      state.motifControls.iconFilled = theme.motif.iconFilled;
      state.motifControls.shapeFilled = theme.motif.shapeFilled;
      state.motifControls.iconCategories = { ...theme.motif.iconCategories };
      state.patternControls = { ...theme.pattern };
      renderSeriesList();
      updateInputsFromState();
      renderPreview();
    });
    elements.themeCards.appendChild(card);
  });
}

function renderSeriesList() {
  elements.seriesList.innerHTML = '';
  state.seriesItems.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `series-item ${state.ui.selectedIndex === index ? 'active' : ''}`;
    row.addEventListener('click', () => {
      state.ui.selectedIndex = index;
      renderSeriesList();
      renderPreview();
    });

    const headerInput = document.createElement('input');
    headerInput.value = item.header;
    headerInput.placeholder = 'Header';
    headerInput.addEventListener('input', (event) => {
      item.header = event.target.value;
      renderPreview();
    });

    const titleInput = document.createElement('input');
    titleInput.value = item.title;
    titleInput.placeholder = 'Playlist name';
    titleInput.addEventListener('input', (event) => {
      item.title = event.target.value;
      renderPreview();
    });

    const subInput = document.createElement('input');
    subInput.value = item.subheader;
    subInput.placeholder = 'Subheader';
    subInput.addEventListener('input', (event) => {
      item.subheader = event.target.value;
      renderPreview();
    });

    const suffixInput = document.createElement('input');
    suffixInput.value = item.suffix;
    suffixInput.placeholder = 'Seed suffix';
    suffixInput.addEventListener('input', (event) => {
      item.suffix = event.target.value;
      clearPlacementCache();
      renderPreview();
    });

    const exportPng = document.createElement('button');
    exportPng.textContent = 'Export PNG';
    exportPng.addEventListener('click', (event) => {
      event.stopPropagation();
      exportCover(item, 'png');
    });

    const exportJpg = document.createElement('button');
    exportJpg.textContent = 'Export JPG';
    exportJpg.disabled = !state.seriesSetup.exportJpg;
    exportJpg.addEventListener('click', (event) => {
      event.stopPropagation();
      exportCover(item, 'jpg');
    });

    row.appendChild(buildLabel(`Cover ${index + 1}`));
    row.appendChild(headerInput);
    row.appendChild(titleInput);
    row.appendChild(subInput);
    row.appendChild(suffixInput);
    row.appendChild(exportPng);
    row.appendChild(exportJpg);
    elements.seriesList.appendChild(row);
  });
  elements.selectedIndexLabel.textContent = `${state.ui.selectedIndex + 1} / ${state.seriesSetup.count}`;
}

function buildLabel(text) {
  const label = document.createElement('span');
  label.className = 'series-label';
  label.textContent = text;
  return label;
}

function renderPreview() {
  if (!state.selectedTheme) return;
  const cover = state.seriesItems[state.ui.selectedIndex];
  const result = renderCover({
    ctx: previewCtx,
    size: previewSize,
    cover,
    theme: state.selectedTheme,
    typography: state.typography,
    masterSeed: state.seriesSetup.masterSeed,
    variationMode: state.seriesSetup.variationMode,
  });
  elements.titleWarning.textContent = result.titleFit.tooSmall ? 'Title is very long, consider shortening.' : '';
}

function exportCover(cover, format) {
  if (!state.selectedTheme) return;
  const canvas = document.createElement('canvas');
  canvas.width = exportSize;
  canvas.height = exportSize;
  const ctx = canvas.getContext('2d');
  renderCover({
    ctx,
    size: exportSize,
    cover,
    theme: state.selectedTheme,
    typography: state.typography,
    masterSeed: state.seriesSetup.masterSeed,
    variationMode: state.seriesSetup.variationMode,
  });

  const filename = buildFilename(cover, format);
  if (format === 'png') {
    canvas.toBlob((blob) => downloadBlob(blob, filename), 'image/png');
  } else {
    canvas.toBlob((blob) => downloadBlob(blob, filename), 'image/jpeg', state.seriesSetup.jpgQuality);
  }
}

function buildFilename(cover, format) {
  const parts = [cover.index + 1, cover.header, cover.title, cover.subheader]
    .filter(Boolean)
    .map((part) => part.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 40));
  return `${parts.join('_')}.${format}`;
}

function downloadBlob(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function updateInputsFromState() {
  elements.countInput.value = state.seriesSetup.count;
  elements.backgroundInput.value = state.seriesSetup.backgroundColor;
  elements.masterSeedInput.value = state.seriesSetup.masterSeed;
  elements.exportJpgToggle.checked = state.seriesSetup.exportJpg;
  elements.jpgQuality.value = state.seriesSetup.jpgQuality;
  elements.patternMode.value = state.patternControls.mode;
  elements.density.value = state.patternControls.density;
  elements.scale.value = state.patternControls.scale;
  elements.rotationVariance.value = state.patternControls.rotationVariance;
  elements.opacity.value = state.patternControls.opacity;
  elements.primaryShape.value = state.motifControls.primaryShape;
  elements.iconMix.value = state.motifControls.iconMix;
  elements.iconFilled.checked = state.motifControls.iconFilled;
  elements.shapeFilled.checked = state.motifControls.shapeFilled;
  elements.strictSwiss.checked = state.motifControls.strictSwiss;
  elements.playful.checked = state.motifControls.playful;
  elements.palettePreset.value = state.paletteControls.presetIndex;
  elements.customPrimary.value = state.paletteControls.customPrimary;
  elements.fontHeader.value = state.typography.header.family;
  elements.fontTitle.value = state.typography.title.family;
  elements.fontSubheader.value = state.typography.subheader.family;
  elements.textColor.value = state.typography.color;

  elements.variationInputs.forEach((input) => {
    input.checked = input.value === state.seriesSetup.variationMode;
  });

  buildIconCategoryToggles();
}

function registerEvents() {
  elements.countInput.addEventListener('change', (event) => handleSeriesCountChange(event.target.value));
  elements.backgroundInput.addEventListener('input', (event) => {
    state.seriesSetup.backgroundColor = event.target.value;
    if (state.selectedTheme) {
      state.selectedTheme.backgroundColor = event.target.value;
      renderPreview();
    }
  });
  elements.masterSeedInput.addEventListener('input', (event) => {
    state.seriesSetup.masterSeed = event.target.value;
    clearPlacementCache();
    renderPreview();
  });
  elements.exportJpgToggle.addEventListener('change', (event) => {
    state.seriesSetup.exportJpg = event.target.checked;
    renderSeriesList();
  });
  elements.jpgQuality.addEventListener('input', (event) => {
    state.seriesSetup.jpgQuality = Number.parseFloat(event.target.value) || 0.92;
  });
  elements.generateThemesBtn.addEventListener('click', generateThemeSuggestions);

  elements.variationInputs.forEach((input) => {
    input.addEventListener('change', (event) => {
      setVariationMode(event.target.value);
    });
  });

  elements.patternMode.addEventListener('change', (event) => {
    state.patternControls.mode = event.target.value;
    updateThemeFromControls();
  });
  elements.density.addEventListener('input', (event) => {
    state.patternControls.density = Number.parseFloat(event.target.value);
    updateThemeFromControls();
  });
  elements.scale.addEventListener('input', (event) => {
    state.patternControls.scale = Number.parseFloat(event.target.value);
    updateThemeFromControls();
  });
  elements.rotationVariance.addEventListener('input', (event) => {
    state.patternControls.rotationVariance = Number.parseFloat(event.target.value);
    updateThemeFromControls();
  });
  elements.opacity.addEventListener('input', (event) => {
    state.patternControls.opacity = Number.parseFloat(event.target.value);
    updateThemeFromControls();
  });

  elements.primaryShape.addEventListener('change', (event) => {
    state.motifControls.primaryShape = event.target.value;
    state.motifControls.secondaryShapes = [event.target.value];
    updateThemeFromControls();
  });
  elements.iconMix.addEventListener('input', (event) => {
    state.motifControls.iconMix = Number.parseFloat(event.target.value);
    updateThemeFromControls();
  });
  elements.iconFilled.addEventListener('change', (event) => {
    state.motifControls.iconFilled = event.target.checked;
    updateThemeFromControls();
  });
  elements.shapeFilled.addEventListener('change', (event) => {
    state.motifControls.shapeFilled = event.target.checked;
    updateThemeFromControls();
  });
  elements.strictSwiss.addEventListener('change', (event) => {
    state.motifControls.strictSwiss = event.target.checked;
  });
  elements.playful.addEventListener('change', (event) => {
    state.motifControls.playful = event.target.checked;
  });

  elements.palettePreset.addEventListener('change', (event) => {
    state.paletteControls.presetIndex = Number.parseInt(event.target.value, 10);
    if (state.selectedTheme) {
      state.selectedTheme.palette = PALETTE_PRESETS[state.paletteControls.presetIndex];
      renderPreview();
    }
  });
  elements.customPrimary.addEventListener('input', (event) => {
    state.paletteControls.customPrimary = event.target.value;
    const customPalette = buildPaletteFromPrimary(event.target.value);
    if (state.selectedTheme && state.seriesSetup.variationMode === 'vary-shapes') {
      state.selectedTheme.palette = customPalette;
      renderPreview();
    }
  });

  elements.fontHeader.addEventListener('change', (event) => {
    state.typography.header.family = event.target.value;
    renderPreview();
  });
  elements.fontTitle.addEventListener('change', (event) => {
    state.typography.title.family = event.target.value;
    renderPreview();
  });
  elements.fontSubheader.addEventListener('change', (event) => {
    state.typography.subheader.family = event.target.value;
    renderPreview();
  });
  elements.textColor.addEventListener('input', (event) => {
    state.typography.color = event.target.value;
    renderPreview();
  });

  elements.exportAllPng.addEventListener('click', () => {
    state.seriesItems.forEach((cover) => exportCover(cover, 'png'));
  });
  elements.exportAllJpg.addEventListener('click', () => {
    if (!state.seriesSetup.exportJpg) return;
    state.seriesItems.forEach((cover) => exportCover(cover, 'jpg'));
  });

  elements.downloadTheme.addEventListener('click', () => {
    const exportData = buildThemeExport(state);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'playlist-theme.json');
  });

  elements.importTheme.addEventListener('click', () => elements.importInput.click());
  elements.importInput.addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.schemaVersion) throw new Error('Missing schema version');
        const nextState = applyThemeImport(state, data);
        Object.assign(state, nextState);
        state.seriesItems = data.seriesItems || buildSeriesItems(state.seriesSetup.count);
        state.ui.selectedIndex = 0;
        renderSeriesList();
        updateInputsFromState();
        renderPreview();
      } catch (error) {
        alert('Invalid theme JSON.');
      }
    };
    reader.readAsText(file);
  });

  if (location.hostname === 'localhost') {
    state.ui.showDevTools = true;
    elements.devPanel.classList.remove('hidden');
    elements.determinismCheck.addEventListener('click', () => {
      const cover = state.seriesItems[0];
      const canvasA = document.createElement('canvas');
      const canvasB = document.createElement('canvas');
      canvasA.width = 300;
      canvasA.height = 300;
      canvasB.width = 300;
      canvasB.height = 300;
      const ctxA = canvasA.getContext('2d');
      const ctxB = canvasB.getContext('2d');
      renderCover({
        ctx: ctxA,
        size: 300,
        cover,
        theme: state.selectedTheme,
        typography: state.typography,
        masterSeed: state.seriesSetup.masterSeed,
        variationMode: state.seriesSetup.variationMode,
      });
      renderCover({
        ctx: ctxB,
        size: 300,
        cover,
        theme: state.selectedTheme,
        typography: state.typography,
        masterSeed: state.seriesSetup.masterSeed,
        variationMode: state.seriesSetup.variationMode,
      });
      const hashA = hashImage(ctxA);
      const hashB = hashImage(ctxB);
      elements.determinismResult.textContent = hashA === hashB ? 'Match ✓' : 'Mismatch!';
    });
  }
}

function hashImage(ctx) {
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
  let hash = 0;
  for (let i = 0; i < data.length; i += 4) {
    hash = (hash + data[i] + data[i + 1] + data[i + 2]) % 1000000007;
  }
  return hash;
}

function initialize() {
  setVariationMode(state.seriesSetup.variationMode);
  buildIconCategoryToggles();
  renderSeriesList();
  updateInputsFromState();
  generateThemeSuggestions();
  state.selectedTheme = state.themeSuggestions[0];
  renderPreview();
  registerEvents();
  document.getElementById('app-version').textContent = APP_VERSION;
}

initialize();
