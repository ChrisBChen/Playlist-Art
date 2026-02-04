import {
  initialState,
  buildSeriesItems,
  buildThemeSuggestion,
  finalizeTheme,
  themeFromImport,
  buildDefaultTypography,
  generatePaletteWithPrimary,
  motifOptions,
  FONT_OPTIONS,
} from './state.js';
import { renderCover } from './render/render.js';
import { patternModes } from './render/patterns.js';
import { seededRandom } from './utils/seed.js';
import { iconCategories } from '../assets/icons/icon-data.js';
import { palettePresets } from './utils/color.js';

const appState = initialState();
appState.seriesItems = buildSeriesItems(appState.seriesSetup.numCovers);
appState.selectedTheme = null;

const STORAGE_KEY = 'playlist-art-state';
let saveTimeout = null;

const elements = {
  seriesSeed: document.getElementById('series-seed'),
  numCovers: document.getElementById('num-covers'),
  variationRadios: Array.from(document.querySelectorAll('input[name="variation"]')),
  backgroundColor: document.getElementById('background-color'),
  exportJpg: document.getElementById('export-jpg'),
  generateThemes: document.getElementById('generate-themes'),
  themeSuggestions: document.getElementById('theme-suggestions'),
  finalizationControls: document.getElementById('finalization-controls'),
  patternMode: document.getElementById('pattern-mode'),
  density: document.getElementById('density'),
  elementScale: document.getElementById('element-scale'),
  rotation: document.getElementById('rotation'),
  opacity: document.getElementById('opacity'),
  safeWidth: document.getElementById('safe-width'),
  safeHeight: document.getElementById('safe-height'),
  strictSwiss: document.getElementById('strict-swiss'),
  playful: document.getElementById('playful'),
  strokeIcons: document.getElementById('stroke-icons'),
  headerFont: document.getElementById('header-font'),
  titleFont: document.getElementById('title-font'),
  subheaderFont: document.getElementById('subheader-font'),
  textColor: document.getElementById('text-color'),
  headerTracking: document.getElementById('header-tracking'),
  titleTracking: document.getElementById('title-tracking'),
  subheaderTracking: document.getElementById('subheader-tracking'),
  titleWidth: document.getElementById('title-width'),
  titleWarning: document.getElementById('title-warning'),
  seriesList: document.getElementById('series-list'),
  previewCanvas: document.getElementById('preview-canvas'),
  previewLabel: document.getElementById('preview-label'),
  exportCurrent: document.getElementById('export-current'),
  exportAllPng: document.getElementById('export-all-png'),
  exportAllJpg: document.getElementById('export-all-jpg'),
  downloadTheme: document.getElementById('download-theme'),
  importTheme: document.getElementById('import-theme'),
  devPanel: document.getElementById('dev-panel'),
  determinismCheck: document.getElementById('determinism-check'),
  determinismResult: document.getElementById('determinism-result'),
};

const previewCanvas = elements.previewCanvas;
const previewSize = appState.ui.previewSize;
previewCanvas.width = previewSize;
previewCanvas.height = previewSize;

function hydrateSelect(select, options) {
  select.innerHTML = '';
  options.forEach((option) => {
    const item = document.createElement('option');
    item.value = option;
    item.textContent = option.replace(/"/g, '');
    select.appendChild(item);
  });
}

function initializeUI() {
  hydrateSelect(elements.patternMode, patternModes);
  hydrateSelect(elements.headerFont, FONT_OPTIONS);
  hydrateSelect(elements.titleFont, FONT_OPTIONS);
  hydrateSelect(elements.subheaderFont, FONT_OPTIONS);

  const typography = buildDefaultTypography();
  elements.headerFont.value = typography.headerFont;
  elements.titleFont.value = typography.titleFont;
  elements.subheaderFont.value = typography.subheaderFont;
  elements.textColor.value = typography.textColor;
  elements.titleTracking.value = typography.titleTracking;
  elements.headerTracking.value = typography.headerTracking;
  elements.subheaderTracking.value = typography.subheaderTracking;
  elements.titleWidth.value = typography.maxTitleWidth;

  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDev) {
    elements.devPanel.classList.remove('hidden');
  }
}

function scheduleSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(saveState, 300);
}

function saveState() {
  const payload = {
    seriesSetup: appState.seriesSetup,
    selectedTheme: appState.selectedTheme,
    seriesItems: appState.seriesItems,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  try {
    const data = JSON.parse(stored);
    if (data.seriesSetup) {
      appState.seriesSetup = { ...appState.seriesSetup, ...data.seriesSetup };
    }
    if (Array.isArray(data.seriesItems)) {
      appState.seriesItems = data.seriesItems;
    }
    if (data.selectedTheme) {
      appState.selectedTheme = themeFromImport({ ...data.selectedTheme, themeId: data.selectedTheme.id });
    }
  } catch (error) {
    console.warn('Unable to load saved state', error);
  }
}

function updateSeriesItems(count) {
  appState.seriesItems = buildSeriesItems(count);
}

function setSelectedTheme(theme) {
  appState.selectedTheme = theme;
  renderFinalizationControls();
  renderSeriesList();
  renderPreview();
  scheduleSave();
}

function getVariationMode() {
  const selected = elements.variationRadios.find((radio) => radio.checked);
  return selected ? selected.value : 'colors';
}

function updateSetupFromUI() {
  appState.seriesSetup.seriesSeed = elements.seriesSeed.value.trim() || 'series-seed';
  appState.seriesSetup.numCovers = Number(elements.numCovers.value) || 4;
  appState.seriesSetup.variationMode = getVariationMode();
  appState.seriesSetup.backgroundColor = elements.backgroundColor.value;
  appState.seriesSetup.exportJpg = elements.exportJpg.checked;
  updateSeriesItems(appState.seriesSetup.numCovers);
  scheduleSave();
}

function renderThemeSuggestions() {
  elements.themeSuggestions.innerHTML = '';
  appState.themeSuggestions.forEach((theme) => {
    const card = document.createElement('div');
    card.className = 'theme-card';
    if (appState.selectedTheme && appState.selectedTheme.id === theme.id) {
      card.classList.add('selected');
    }
    card.innerHTML = `
      <img class="theme-thumb" src="${theme.thumbnail}" alt="Theme preview" />
      <strong>${theme.name}</strong>
      <div class="swatches">
        ${Object.values(theme.palette.roles)
          .slice(0, 4)
          .map((color) => `<span class="swatch" style="background:${color}"></span>`)
          .join('')}
      </div>
      <span class="muted">${theme.pattern.mode}</span>
    `;
    card.addEventListener('click', () => {
      const themeData = finalizeTheme({
        suggestion: theme,
        backgroundColor: appState.seriesSetup.backgroundColor,
        variationMode: appState.seriesSetup.variationMode,
        paletteOverride: theme.palette,
        motifOverride: theme.motif,
        typography: buildTypographyFromUI(),
        pattern: readPatternOverrides(),
        strictSwiss: elements.strictSwiss.checked,
        playful: elements.playful.checked,
        strokeIcons: elements.strokeIcons.checked,
      });
      setSelectedTheme(themeData);
      renderThemeSuggestions();
    });
    elements.themeSuggestions.appendChild(card);
  });
}

function buildTypographyFromUI() {
  return {
    headerFont: elements.headerFont.value,
    titleFont: elements.titleFont.value,
    subheaderFont: elements.subheaderFont.value,
    headerWeight: 500,
    titleWeight: 700,
    subheaderWeight: 500,
    headerTracking: parseFloat(elements.headerTracking.value),
    titleTracking: parseFloat(elements.titleTracking.value),
    subheaderTracking: parseFloat(elements.subheaderTracking.value),
    textColor: elements.textColor.value,
    maxTitleWidth: parseFloat(elements.titleWidth.value),
  };
}

function readPatternOverrides() {
  return {
    mode: elements.patternMode.value,
    density: parseFloat(elements.density.value),
    elementScale: parseFloat(elements.elementScale.value),
    rotationVariance: parseFloat(elements.rotation.value),
    opacity: parseFloat(elements.opacity.value),
    safeZone: {
      width: parseFloat(elements.safeWidth.value),
      height: parseFloat(elements.safeHeight.value),
      falloff: 0.6,
    },
  };
}

function renderFinalizationControls() {
  elements.finalizationControls.innerHTML = '';
  const variation = appState.seriesSetup.variationMode;
  const motifChoices = motifOptions();
  const paletteChoices = palettePresets();

  if (variation === 'colors') {
    const motifSelect = document.createElement('select');
    motifChoices.forEach((motif) => {
      const option = document.createElement('option');
      option.value = motif.name;
      option.textContent = motif.name;
      motifSelect.appendChild(option);
    });
    motifSelect.addEventListener('change', () => {
      if (!appState.selectedTheme) return;
      const motif = motifChoices.find((item) => item.name === motifSelect.value);
      appState.selectedTheme.motif = {
        ...appState.selectedTheme.motif,
        primaryShape: motif.primaryShape,
        secondaryShapes: motif.secondaryShapes,
        iconMix: motif.iconMix,
      };
      renderPreview();
    });

    const iconMix = document.createElement('input');
    iconMix.type = 'range';
    iconMix.min = '0';
    iconMix.max = '1';
    iconMix.step = '0.05';
    iconMix.value = appState.selectedTheme?.motif.iconMix ?? 0.25;
    iconMix.addEventListener('input', () => {
      if (!appState.selectedTheme) return;
      appState.selectedTheme.motif.iconMix = parseFloat(iconMix.value);
      renderPreview();
    });

    elements.finalizationControls.appendChild(wrapField('Primary Motif', motifSelect));
    elements.finalizationControls.appendChild(wrapField('Icon Mix', iconMix));
    elements.finalizationControls.appendChild(renderIconCategoryToggles());
  } else {
    const paletteSelect = document.createElement('select');
    paletteChoices.forEach((palette) => {
      const option = document.createElement('option');
      option.value = palette.name;
      option.textContent = palette.name;
      paletteSelect.appendChild(option);
    });
    paletteSelect.addEventListener('change', () => {
      if (!appState.selectedTheme) return;
      const palette = paletteChoices.find((item) => item.name === paletteSelect.value);
      appState.selectedTheme.palette = palette;
      renderPreview();
    });

    const primaryColor = document.createElement('input');
    primaryColor.type = 'color';
    primaryColor.value = appState.selectedTheme?.palette.roles.primary ?? '#76c7ff';
    primaryColor.addEventListener('input', () => {
      if (!appState.selectedTheme) return;
      appState.selectedTheme.palette = generatePaletteWithPrimary(primaryColor.value);
      renderPreview();
    });

    elements.finalizationControls.appendChild(wrapField('Palette', paletteSelect));
    elements.finalizationControls.appendChild(wrapField('Primary Accent', primaryColor));
  }
}

function renderIconCategoryToggles() {
  const wrapper = document.createElement('div');
  wrapper.className = 'field-inline';
  iconCategories.forEach((category) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = appState.selectedTheme?.motif.iconCategories.includes(category.id) ?? true;
    input.addEventListener('change', () => {
      if (!appState.selectedTheme) return;
      const categories = new Set(appState.selectedTheme.motif.iconCategories);
      if (input.checked) {
        categories.add(category.id);
      } else {
        categories.delete(category.id);
      }
      appState.selectedTheme.motif.iconCategories = Array.from(categories);
      renderPreview();
    });
    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${category.label}`));
    wrapper.appendChild(label);
  });
  return wrapField('Icon Categories', wrapper);
}

function wrapField(labelText, control) {
  const label = document.createElement('label');
  label.textContent = labelText;
  label.appendChild(control);
  return label;
}

function renderSeriesList() {
  elements.seriesList.innerHTML = '';
  appState.seriesItems.forEach((item, index) => {
    const container = document.createElement('div');
    container.className = 'series-item';
    if (index === appState.ui.selectedIndex) {
      container.classList.add('active');
    }

    const header = document.createElement('header');
    header.textContent = `Cover ${index + 1}`;
    const suffixInput = document.createElement('input');
    suffixInput.type = 'text';
    suffixInput.value = item.suffix;
    suffixInput.addEventListener('input', () => {
      item.suffix = suffixInput.value;
      renderPreview();
    });
    header.appendChild(suffixInput);

    const headerInput = document.createElement('input');
    headerInput.value = item.header;
    headerInput.addEventListener('input', () => {
      item.header = headerInput.value;
      renderPreview();
    });

    const titleInput = document.createElement('input');
    titleInput.value = item.title;
    titleInput.addEventListener('input', () => {
      item.title = titleInput.value;
      renderPreview();
    });

    const subInput = document.createElement('input');
    subInput.value = item.subheader;
    subInput.addEventListener('input', () => {
      item.subheader = subInput.value;
      renderPreview();
    });

    const buttonRow = document.createElement('div');
    buttonRow.className = 'field-inline';
    const exportPng = document.createElement('button');
    exportPng.textContent = 'Export PNG';
    exportPng.className = 'secondary';
    exportPng.addEventListener('click', () => exportCover(index, 'png'));

    const exportJpg = document.createElement('button');
    exportJpg.textContent = 'Export JPG';
    exportJpg.className = 'secondary';
    exportJpg.disabled = !appState.seriesSetup.exportJpg;
    exportJpg.addEventListener('click', () => exportCover(index, 'jpg'));

    buttonRow.append(exportPng, exportJpg);

    container.append(header);
    container.appendChild(wrapField('Header', headerInput));
    container.appendChild(wrapField('Playlist Name', titleInput));
    container.appendChild(wrapField('Subheader', subInput));
    container.appendChild(wrapField('Seed Suffix', suffixInput));
    container.appendChild(buttonRow);

    container.addEventListener('click', () => {
      appState.ui.selectedIndex = index;
      renderSeriesList();
      renderPreview();
    });

    elements.seriesList.appendChild(container);
  });
}

function generateThemes() {
  updateSetupFromUI();
  const suggestions = [];
  for (let i = 0; i < 5; i += 1) {
    const theme = buildThemeSuggestion({
      seriesSeed: appState.seriesSetup.seriesSeed,
      variationMode: appState.seriesSetup.variationMode,
      numCovers: appState.seriesSetup.numCovers,
      index: i,
    });
    const thumbnail = document.createElement('canvas');
    thumbnail.width = 200;
    thumbnail.height = 200;
    const themeData = finalizeTheme({
      suggestion: theme,
      backgroundColor: appState.seriesSetup.backgroundColor,
      variationMode: appState.seriesSetup.variationMode,
      paletteOverride: theme.palette,
      motifOverride: theme.motif,
      typography: buildTypographyFromUI(),
      pattern: readPatternOverrides(),
      strictSwiss: elements.strictSwiss.checked,
      playful: elements.playful.checked,
      strokeIcons: elements.strokeIcons.checked,
    });
    const seedKey = buildCoverSeed(themeData.id, 0);
    const rng = seededRandom(`${seedKey}|draw`);
    const rngPlacement = seededRandom(`${seedKey}|placement`);
    renderCover({
      canvas: thumbnail,
      theme: themeData,
      cover: appState.seriesItems[0],
      rng,
      rngPlacement,
      size: 200,
      preview: true,
      cacheKey: `${themeData.id}|${seedKey}|thumb`,
    });
    theme.thumbnail = thumbnail.toDataURL('image/png');
    suggestions.push(theme);
  }
  appState.themeSuggestions = suggestions;
  renderThemeSuggestions();
  scheduleSave();
}

function buildCoverSeed(themeId, index) {
  const cover = appState.seriesItems[index] || { suffix: String(index + 1) };
  return `${appState.seriesSetup.seriesSeed}|${themeId}|${index}|${cover.suffix}`;
}

function renderPreview() {
  if (!appState.selectedTheme) {
    return;
  }
  const index = appState.ui.selectedIndex;
  const cover = appState.seriesItems[index];
  const seedKey = buildCoverSeed(appState.selectedTheme.id, index);
  const rngPlacement = seededRandom(`${seedKey}|placement`);
  const rngDraw = seededRandom(`${seedKey}|draw`);
  renderCover({
    canvas: previewCanvas,
    theme: appState.selectedTheme,
    cover,
    rng: rngDraw,
    rngPlacement,
    size: previewSize,
    preview: true,
    cacheKey: `${appState.selectedTheme.id}|${seedKey}|preview`,
  });
  elements.previewLabel.textContent = `Cover ${index + 1}`;
  elements.titleWarning.classList.toggle('hidden', !appState.selectedTheme.uiTitleTooLong);
  scheduleSave();
}

function exportCover(index, format) {
  if (!appState.selectedTheme) return;
  const size = appState.seriesSetup.canvasSize;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const seedKey = buildCoverSeed(appState.selectedTheme.id, index);
  const rng = seededRandom(`${seedKey}|draw`);
  const rngPlacement = seededRandom(`${seedKey}|placement`);
  renderCover({
    canvas,
    theme: appState.selectedTheme,
    cover: appState.seriesItems[index],
    rng,
    rngPlacement,
    size,
    preview: false,
    cacheKey: `${appState.selectedTheme.id}|${seedKey}|export`,
  });
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = buildFilename(index, format);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    format === 'jpg' ? 'image/jpeg' : 'image/png',
    format === 'jpg' ? appState.ui.jpgQuality : undefined,
  );
}

function buildFilename(index, format) {
  const cover = appState.seriesItems[index];
  const raw = `${index + 1}_${cover.header}_${cover.title}_${cover.subheader}`;
  const safe = raw
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80);
  return `${safe}.${format}`;
}

function exportAll(format) {
  appState.seriesItems.forEach((_, index) => exportCover(index, format));
}

function downloadThemeJson() {
  if (!appState.selectedTheme) return;
  const payload = {
    appVersion: '1.0.0',
    schemaVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    masterSeed: appState.seriesSetup.seriesSeed,
    N: appState.seriesSetup.numCovers,
    variationMode: appState.seriesSetup.variationMode,
    themeId: appState.selectedTheme.id,
    backgroundColor: appState.selectedTheme.backgroundColor,
    palette: appState.selectedTheme.palette,
    motif: appState.selectedTheme.motif,
    pattern: appState.selectedTheme.pattern,
    typography: appState.selectedTheme.typography,
    noise: appState.selectedTheme.noise,
    seriesItems: appState.seriesItems,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `theme-${appState.selectedTheme.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function handleImportTheme(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.schemaVersion && !String(data.schemaVersion).startsWith('1.')) {
        console.warn('Unsupported schema version', data.schemaVersion);
      }
      const theme = themeFromImport(data);
      appState.seriesSetup.seriesSeed = data.masterSeed || appState.seriesSetup.seriesSeed;
      appState.seriesSetup.numCovers = data.N || appState.seriesSetup.numCovers;
      appState.seriesSetup.variationMode = data.variationMode || appState.seriesSetup.variationMode;
      appState.seriesSetup.backgroundColor = theme.backgroundColor;
      appState.seriesSetup.exportJpg = data.exportJpg || false;
      updateSeriesItems(appState.seriesSetup.numCovers);
      if (Array.isArray(data.seriesItems) && data.seriesItems.length) {
        appState.seriesItems = data.seriesItems;
      }
      appState.selectedTheme = theme;
      syncUIFromState();
      renderSeriesList();
      renderPreview();
      scheduleSave();
    } catch (error) {
      console.error('Invalid theme JSON', error);
    }
  };
  reader.readAsText(file);
}

function syncUIFromState() {
  elements.seriesSeed.value = appState.seriesSetup.seriesSeed;
  elements.numCovers.value = appState.seriesSetup.numCovers;
  elements.variationRadios.forEach((radio) => {
    radio.checked = radio.value === appState.seriesSetup.variationMode;
  });
  elements.backgroundColor.value = appState.seriesSetup.backgroundColor;
  elements.exportJpg.checked = appState.seriesSetup.exportJpg;
  elements.exportAllJpg.disabled = !appState.seriesSetup.exportJpg;
  if (appState.selectedTheme) {
    elements.patternMode.value = appState.selectedTheme.pattern.mode;
    elements.density.value = appState.selectedTheme.pattern.density;
    elements.elementScale.value = appState.selectedTheme.pattern.elementScale;
    elements.rotation.value = appState.selectedTheme.pattern.rotationVariance;
    elements.opacity.value = appState.selectedTheme.pattern.opacity;
    elements.safeWidth.value = appState.selectedTheme.pattern.safeZone.width;
    elements.safeHeight.value = appState.selectedTheme.pattern.safeZone.height;
    elements.headerFont.value = appState.selectedTheme.typography.headerFont;
    elements.titleFont.value = appState.selectedTheme.typography.titleFont;
    elements.subheaderFont.value = appState.selectedTheme.typography.subheaderFont;
    elements.textColor.value = appState.selectedTheme.typography.textColor;
    elements.headerTracking.value = appState.selectedTheme.typography.headerTracking;
    elements.titleTracking.value = appState.selectedTheme.typography.titleTracking;
    elements.subheaderTracking.value = appState.selectedTheme.typography.subheaderTracking;
    elements.titleWidth.value = appState.selectedTheme.typography.maxTitleWidth;
    elements.strictSwiss.checked = appState.selectedTheme.motif.iconCategories.length === 0 ? true : elements.strictSwiss.checked;
  }
  renderFinalizationControls();
}

function setupEventListeners() {
  elements.generateThemes.addEventListener('click', () => {
    generateThemes();
  });

  elements.seriesSeed.addEventListener('input', () => {
    updateSetupFromUI();
  });

  elements.numCovers.addEventListener('input', () => {
    updateSetupFromUI();
    renderSeriesList();
  });

  elements.variationRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      updateSetupFromUI();
      renderFinalizationControls();
    });
  });

  [
    elements.backgroundColor,
    elements.patternMode,
    elements.density,
    elements.elementScale,
    elements.rotation,
    elements.opacity,
    elements.safeWidth,
    elements.safeHeight,
    elements.strictSwiss,
    elements.playful,
    elements.strokeIcons,
    elements.headerFont,
    elements.titleFont,
    elements.subheaderFont,
    elements.textColor,
    elements.headerTracking,
    elements.titleTracking,
    elements.subheaderTracking,
    elements.titleWidth,
  ].forEach((input) => {
    input.addEventListener('input', () => {
      if (!appState.selectedTheme) return;
      appState.selectedTheme.backgroundColor = elements.backgroundColor.value;
      appState.selectedTheme.pattern = {
        ...appState.selectedTheme.pattern,
        ...readPatternOverrides(),
      };
      appState.selectedTheme.typography = buildTypographyFromUI();
      appState.selectedTheme.motif.strokeIcons = elements.strokeIcons.checked;
      if (elements.strictSwiss.checked) {
        appState.selectedTheme.motif.iconCategories = [];
      } else if (elements.playful.checked) {
        appState.selectedTheme.motif.iconCategories = iconCategories.map((cat) => cat.id);
      }
      renderPreview();
    });
  });

  elements.exportJpg.addEventListener('change', () => {
    appState.seriesSetup.exportJpg = elements.exportJpg.checked;
    renderSeriesList();
    elements.exportAllJpg.disabled = !appState.seriesSetup.exportJpg;
    scheduleSave();
  });

  elements.exportCurrent.addEventListener('click', () => exportCover(appState.ui.selectedIndex, 'png'));
  elements.exportAllPng.addEventListener('click', () => exportAll('png'));
  elements.exportAllJpg.addEventListener('click', () => exportAll('jpg'));
  elements.exportAllJpg.disabled = !appState.seriesSetup.exportJpg;

  elements.downloadTheme.addEventListener('click', downloadThemeJson);
  elements.importTheme.addEventListener('change', handleImportTheme);

  elements.determinismCheck.addEventListener('click', () => {
    if (!appState.selectedTheme) return;
    const seedKey = buildCoverSeed(appState.selectedTheme.id, 0);
    const rngA = seededRandom(`${seedKey}|draw`);
    const rngB = seededRandom(`${seedKey}|draw`);
    const rngPlacementA = seededRandom(`${seedKey}|placement`);
    const rngPlacementB = seededRandom(`${seedKey}|placement`);
    const size = 300;
    const canvasA = document.createElement('canvas');
    const canvasB = document.createElement('canvas');
    canvasA.width = size;
    canvasA.height = size;
    canvasB.width = size;
    canvasB.height = size;
    renderCover({
      canvas: canvasA,
      theme: appState.selectedTheme,
      cover: appState.seriesItems[0],
      rng: rngA,
      rngPlacement: rngPlacementA,
      size,
      cacheKey: `${appState.selectedTheme.id}|${seedKey}|dev`,
    });
    renderCover({
      canvas: canvasB,
      theme: appState.selectedTheme,
      cover: appState.seriesItems[0],
      rng: rngB,
      rngPlacement: rngPlacementB,
      size,
      cacheKey: `${appState.selectedTheme.id}|${seedKey}|dev`,
    });
    const hashA = hashCanvas(canvasA);
    const hashB = hashCanvas(canvasB);
    elements.determinismResult.textContent = hashA === hashB ? 'Determinism check passed.' : 'Determinism check failed.';
  });


function hashCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let hash = 0;
  for (let i = 0; i < data.length; i += 16) {
    hash = (hash * 31 + data[i]) >>> 0;
  }
  return hash;
}

loadState();
initializeUI();
syncUIFromState();
setupEventListeners();
renderSeriesList();
if (appState.selectedTheme) {
  renderPreview();
}
