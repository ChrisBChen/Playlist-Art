import {
  APP_VERSION,
  ART_PALETTES,
  ART_SYSTEMS,
  BACKGROUND_MODES,
  INDEX_PRESETS,
  applyThemeImport,
  buildIndexLabel,
  buildSeriesItemsFromText,
  buildThemeExport,
  createInitialState,
  getPalette,
  resolvePalette,
} from './state.js';
import { renderCover } from './render/render.js';
import { createZip } from './utils/zip.js';

const state = createInitialState();
const previewSize = 1000;
const thumbnailSize = 240;

const elements = {
  appVersion: document.getElementById('app-version'),
  coverCount: document.getElementById('cover-count'),
  playlistInput: document.getElementById('playlist-input'),
  applyPlaylists: document.getElementById('apply-playlists'),
  defaultKicker: document.getElementById('default-kicker'),
  defaultFooter: document.getElementById('default-footer'),
  indexPreset: document.getElementById('index-preset'),
  indexStart: document.getElementById('index-start'),
  applySeriesDefaults: document.getElementById('apply-series-defaults'),
  templateCards: document.getElementById('template-cards'),
  masterSeed: document.getElementById('master-seed'),
  paletteSelect: document.getElementById('palette-select'),
  backgroundMode: document.getElementById('background-mode'),
  customBackground: document.getElementById('custom-background'),
  customInk: document.getElementById('custom-ink'),
  customAccent: document.getElementById('custom-accent'),
  customAccent2: document.getElementById('custom-accent2'),
  gridDensity: document.getElementById('grid-density'),
  typeScale: document.getElementById('type-scale'),
  variationStrength: document.getElementById('variation-strength'),
  exportJpg: document.getElementById('export-jpg'),
  jpgQuality: document.getElementById('jpg-quality'),
  exportSelectedPng: document.getElementById('export-selected-png'),
  exportAllPng: document.getElementById('export-all-png'),
  exportSelectedJpg: document.getElementById('export-selected-jpg'),
  exportAllJpg: document.getElementById('export-all-jpg'),
  downloadTheme: document.getElementById('download-theme'),
  importTheme: document.getElementById('import-theme'),
  importInput: document.getElementById('import-input'),
  determinismCheck: document.getElementById('determinism-check'),
  determinismResult: document.getElementById('determinism-result'),
  previewCanvas: document.getElementById('preview-canvas'),
  selectedIndex: document.getElementById('selected-index'),
  previewTitle: document.getElementById('preview-title'),
  titleWarning: document.getElementById('title-warning'),
  seriesGallery: document.getElementById('series-gallery'),
  seriesList: document.getElementById('series-list'),
};

const previewCtx = elements.previewCanvas.getContext('2d');
elements.previewCanvas.width = previewSize;
elements.previewCanvas.height = previewSize;

function initialize() {
  elements.appVersion.textContent = APP_VERSION;
  initSelect(elements.paletteSelect, ART_PALETTES, 'id', 'name');
  initSelect(elements.backgroundMode, BACKGROUND_MODES, 'id', 'name');
  initSelect(elements.indexPreset, INDEX_PRESETS, 'id', 'name');
  updateControlsFromState();
  registerEvents();
  renderAll();
}

function initSelect(select, options, valueKey, labelKey) {
  select.innerHTML = '';
  options.forEach((option) => {
    const el = document.createElement('option');
    el.value = option[valueKey];
    el.textContent = option[labelKey];
    select.appendChild(el);
  });
}

function registerEvents() {
  elements.applyPlaylists.addEventListener('click', () => {
    state.batchInput = elements.playlistInput.value;
    state.seriesItems = buildSeriesItemsFromText(state.batchInput, state.seriesItems, state.seriesDefaults);
    state.ui.selectedIndex = Math.min(state.ui.selectedIndex, state.seriesItems.length - 1);
    renderAll();
  });

  elements.applySeriesDefaults.addEventListener('click', () => {
    readSeriesDefaultsFromControls();
    applySeriesDefaultsToItems();
    renderAll();
  });

  elements.indexPreset.addEventListener('change', (event) => {
    elements.indexStart.value = defaultIndexStart(event.target.value);
  });

  elements.masterSeed.addEventListener('input', (event) => {
    state.masterSeed = event.target.value;
    renderCanvasSurfaces();
  });

  elements.paletteSelect.addEventListener('change', (event) => {
    state.artSystem.paletteId = event.target.value;
    if (event.target.value !== 'custom') {
      state.artSystem.customColors = { ...getPalette(event.target.value).colors };
    }
    updateColorInputs();
    renderCanvasSurfaces();
  });

  elements.backgroundMode.addEventListener('change', (event) => {
    state.artSystem.backgroundMode = event.target.value;
    renderCanvasSurfaces();
  });

  [
    ['customBackground', 'background'],
    ['customInk', 'ink'],
    ['customAccent', 'accent'],
    ['customAccent2', 'accent2'],
  ].forEach(([elementKey, colorKey]) => {
    elements[elementKey].addEventListener('input', (event) => {
      state.artSystem.paletteId = 'custom';
      state.artSystem.customColors[colorKey] = event.target.value;
      elements.paletteSelect.value = 'custom';
      renderCanvasSurfaces();
    });
  });

  elements.gridDensity.addEventListener('input', (event) => {
    state.artSystem.gridDensity = Number.parseInt(event.target.value, 10);
    renderCanvasSurfaces();
  });

  elements.typeScale.addEventListener('input', (event) => {
    state.artSystem.typeScale = Number.parseFloat(event.target.value);
    renderCanvasSurfaces();
  });

  elements.variationStrength.addEventListener('input', (event) => {
    state.artSystem.variationStrength = Number.parseFloat(event.target.value);
    renderCanvasSurfaces();
  });

  elements.exportJpg.addEventListener('change', (event) => {
    state.exportSettings.jpgEnabled = event.target.checked;
    updateExportButtons();
  });

  elements.jpgQuality.addEventListener('input', (event) => {
    state.exportSettings.jpgQuality = Number.parseFloat(event.target.value) || 0.92;
  });

  elements.exportSelectedPng.addEventListener('click', () => exportSelected('png'));
  elements.exportAllPng.addEventListener('click', () => exportAll('png'));
  elements.exportSelectedJpg.addEventListener('click', () => exportSelected('jpg'));
  elements.exportAllJpg.addEventListener('click', () => exportAll('jpg'));

  elements.downloadTheme.addEventListener('click', () => {
    const data = buildThemeExport(state);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'swiss-playlist-theme.json');
  });

  elements.importTheme.addEventListener('click', () => elements.importInput.click());
  elements.importInput.addEventListener('change', handleThemeImport);
  elements.determinismCheck.addEventListener('click', runDeterminismCheck);
}

function updateControlsFromState() {
  elements.playlistInput.value = state.batchInput;
  elements.defaultKicker.value = state.seriesDefaults.kicker;
  elements.defaultFooter.value = state.seriesDefaults.footer;
  elements.indexPreset.value = state.seriesDefaults.indexPreset;
  elements.indexStart.value = state.seriesDefaults.indexStart;
  elements.masterSeed.value = state.masterSeed;
  elements.paletteSelect.value = state.artSystem.paletteId;
  elements.backgroundMode.value = state.artSystem.backgroundMode;
  elements.gridDensity.value = state.artSystem.gridDensity;
  elements.typeScale.value = state.artSystem.typeScale;
  elements.variationStrength.value = state.artSystem.variationStrength;
  elements.exportJpg.checked = state.exportSettings.jpgEnabled;
  elements.jpgQuality.value = state.exportSettings.jpgQuality;
  updateColorInputs();
  updateExportButtons();
}

function updateColorInputs() {
  const colors = resolvePalette(state.artSystem).colors;
  elements.customBackground.value = colors.background;
  elements.customInk.value = colors.ink;
  elements.customAccent.value = colors.accent;
  elements.customAccent2.value = colors.accent2;
}

function updateExportButtons() {
  elements.exportSelectedJpg.disabled = !state.exportSettings.jpgEnabled;
  elements.exportAllJpg.disabled = !state.exportSettings.jpgEnabled;
}

function renderAll() {
  updateCountLabel();
  renderTemplateCards();
  renderPreview();
  renderGallery();
  renderSeriesList();
}

function renderCanvasSurfaces() {
  renderTemplateCards();
  renderPreview();
  renderGallery();
}

function updateCountLabel() {
  const count = state.seriesItems.length;
  elements.coverCount.textContent = `${count} ${count === 1 ? 'cover' : 'covers'}`;
}

function readSeriesDefaultsFromControls() {
  state.seriesDefaults = {
    kicker: elements.defaultKicker.value.trim() || 'PLAYLIST',
    footer: elements.defaultFooter.value.trim() || 'SWISS SERIES',
    indexPreset: elements.indexPreset.value,
    indexStart: elements.indexStart.value.trim() || '01',
  };
}

function defaultIndexStart(preset) {
  if (preset === 'monthly') return 'JAN';
  if (preset === 'quarterly') return 'Q1';
  if (preset === 'yearly') return `${new Date().getFullYear()}`;
  return '01';
}

function applySeriesDefaultsToItems() {
  state.seriesItems.forEach((item, index) => {
    const indexLabel = buildIndexLabel(index, state.seriesDefaults);
    item.kicker = state.seriesDefaults.kicker;
    item.footer = state.seriesDefaults.footer;
    item.indexLabel = indexLabel;
    item.variantSeed = indexLabel;
  });
}

function renderTemplateCards() {
  elements.templateCards.innerHTML = '';
  ART_SYSTEMS.forEach((system) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `template-card ${state.artSystem.templateId === system.id ? 'active' : ''}`;
    card.title = system.description;

    const canvas = document.createElement('canvas');
    canvas.width = thumbnailSize;
    canvas.height = thumbnailSize;
    renderCover({
      ctx: canvas.getContext('2d'),
      size: thumbnailSize,
      cover: {
        index: 0,
        title: system.name,
        kicker: 'SYSTEM',
        footer: 'PLAYLIST ART',
        variantSeed: system.id,
        indexLabel: '01',
      },
      artSystem: {
        ...state.artSystem,
        templateId: system.id,
      },
      palette: resolvePalette(state.artSystem),
      typography: state.typography,
      masterSeed: state.masterSeed,
    });

    const label = document.createElement('span');
    label.textContent = system.name;
    card.append(canvas, label);
    card.addEventListener('click', () => {
      state.artSystem.templateId = system.id;
      renderCanvasSurfaces();
    });
    elements.templateCards.appendChild(card);
  });
}

function renderPreview() {
  const cover = getSelectedCover();
  const result = renderCover({
    ctx: previewCtx,
    size: previewSize,
    cover,
    artSystem: state.artSystem,
    palette: resolvePalette(state.artSystem),
    typography: state.typography,
    masterSeed: state.masterSeed,
  });

  elements.selectedIndex.textContent = cover.indexLabel;
  elements.previewTitle.textContent = cover.title;
  elements.titleWarning.textContent = result.titleFit?.tooSmall ? 'Long title' : '';
}

function renderGallery() {
  elements.seriesGallery.innerHTML = '';
  state.seriesItems.forEach((cover, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `thumbnail-button ${state.ui.selectedIndex === index ? 'active' : ''}`;

    const canvas = document.createElement('canvas');
    canvas.width = thumbnailSize;
    canvas.height = thumbnailSize;
    renderCover({
      ctx: canvas.getContext('2d'),
      size: thumbnailSize,
      cover,
      artSystem: state.artSystem,
      palette: resolvePalette(state.artSystem),
      typography: state.typography,
      masterSeed: state.masterSeed,
    });

    const label = document.createElement('span');
    label.textContent = `${cover.indexLabel} ${cover.title}`;
    button.append(canvas, label);
    button.addEventListener('click', () => selectCover(index));
    elements.seriesGallery.appendChild(button);
  });
}

function renderSeriesList() {
  elements.seriesList.innerHTML = '';
  state.seriesItems.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `series-item ${state.ui.selectedIndex === index ? 'active' : ''}`;
    row.addEventListener('click', () => selectCover(index));

    row.append(
      buildRowInput(item, 'indexLabel', 'No.'),
      buildRowInput(item, 'kicker', 'Kicker'),
      buildRowInput(item, 'title', 'Playlist title'),
      buildRowInput(item, 'footer', 'Footer'),
      buildRowInput(item, 'variantSeed', 'Seed'),
    );

    elements.seriesList.appendChild(row);
  });
}

function buildRowInput(item, key, placeholder) {
  const input = document.createElement('input');
  input.value = item[key];
  input.placeholder = placeholder;
  input.addEventListener('click', (event) => event.stopPropagation());
  input.addEventListener('input', (event) => {
    item[key] = event.target.value;
    syncBatchInputFromItems();
    renderPreview();
    renderGallery();
  });
  return input;
}

function selectCover(index) {
  state.ui.selectedIndex = index;
  renderPreview();
  renderGallery();
  renderSeriesList();
}

function syncBatchInputFromItems() {
  state.batchInput = state.seriesItems.map((item) => item.title).join('\n');
  elements.playlistInput.value = state.batchInput;
}

function getSelectedCover() {
  return state.seriesItems[state.ui.selectedIndex] || state.seriesItems[0];
}

async function exportSelected(format) {
  if (format === 'jpg' && !state.exportSettings.jpgEnabled) return;
  const cover = getSelectedCover();
  const blob = await renderCoverBlob(cover, format);
  downloadBlob(blob, buildFilename(cover, format));
}

async function exportAll(format) {
  if (format === 'jpg' && !state.exportSettings.jpgEnabled) return;
  setExportBusy(true);
  try {
    const files = [];
    for (const cover of state.seriesItems) {
      files.push({
        name: buildFilename(cover, format),
        blob: await renderCoverBlob(cover, format),
      });
    }
    const zip = await createZip(files);
    downloadBlob(zip, `swiss-playlist-covers-${format}.zip`);
  } finally {
    setExportBusy(false);
  }
}

function setExportBusy(isBusy) {
  elements.exportAllPng.disabled = isBusy;
  elements.exportSelectedPng.disabled = isBusy;
  elements.exportAllJpg.disabled = isBusy || !state.exportSettings.jpgEnabled;
  elements.exportSelectedJpg.disabled = isBusy || !state.exportSettings.jpgEnabled;
}

async function renderCoverBlob(cover, format) {
  const canvas = document.createElement('canvas');
  canvas.width = state.exportSettings.size;
  canvas.height = state.exportSettings.size;
  renderCover({
    ctx: canvas.getContext('2d'),
    size: state.exportSettings.size,
    cover,
    artSystem: state.artSystem,
    palette: resolvePalette(state.artSystem),
    typography: state.typography,
    masterSeed: state.masterSeed,
  });

  const type = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpg' ? state.exportSettings.jpgQuality : undefined;
  return canvasToBlob(canvas, type, quality);
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function buildFilename(cover, format) {
  const title = sanitizeFilename(cover.title || `playlist-${cover.index + 1}`);
  const index = sanitizeFilename(cover.indexLabel || `${cover.index + 1}`.padStart(2, '0'));
  return `${index}-${title}.${format}`;
}

function sanitizeFilename(value) {
  return String(value)
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
    .toLowerCase() || 'playlist';
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

function handleThemeImport(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const nextState = applyThemeImport(state, data);
      Object.assign(state, nextState);
      updateControlsFromState();
      renderAll();
    } catch (error) {
      alert('Invalid theme JSON.');
    } finally {
      elements.importInput.value = '';
    }
  };
  reader.readAsText(file);
}

function runDeterminismCheck() {
  const cover = getSelectedCover();
  const hashA = renderHash(cover);
  const hashB = renderHash(cover);
  elements.determinismResult.textContent = hashA === hashB ? 'Match' : 'Mismatch';
}

function renderHash(cover) {
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  renderCover({
    ctx,
    size: 360,
    cover,
    artSystem: state.artSystem,
    palette: resolvePalette(state.artSystem),
    typography: state.typography,
    masterSeed: state.masterSeed,
  });

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let hash = 0;
  for (let i = 0; i < data.length; i += 4) {
    hash = (hash + data[i] * 3 + data[i + 1] * 5 + data[i + 2] * 7 + data[i + 3]) % 1000000007;
  }
  return hash;
}

initialize();
