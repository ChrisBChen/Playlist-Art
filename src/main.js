import { DEFAULT_STATE, DEFAULT_FONTS, createSeriesItems } from "./state.js";
import { SHAPES } from "./render/shapes.js";
import { listIconCategories } from "./render/icons.js";
import { renderCover } from "./render/render.js";
import { seededRandom, stringToSeed } from "./utils/seed.js";
import { adjustHsl } from "./utils/color.js";

const dom = {
  seriesSeed: document.getElementById("series-seed"),
  coverCount: document.getElementById("cover-count"),
  variationMode: document.querySelectorAll("input[name='variation-mode']"),
  backgroundColor: document.getElementById("background-color"),
  exportJpg: document.getElementById("export-jpg"),
  generateThemes: document.getElementById("generate-themes"),
  themeSuggestions: document.getElementById("theme-suggestions"),
  patternMode: document.getElementById("pattern-mode"),
  primaryShape: document.getElementById("primary-shape"),
  iconMix: document.getElementById("icon-mix"),
  iconMixValue: document.getElementById("icon-mix-value"),
  iconCategories: document.getElementById("icon-categories"),
  paletteSelect: document.getElementById("palette-select"),
  varyColorsControls: document.getElementById("vary-colors-controls"),
  varyShapesControls: document.getElementById("vary-shapes-controls"),
  density: document.getElementById("density"),
  shapeScale: document.getElementById("shape-scale"),
  rotationVariance: document.getElementById("rotation-variance"),
  opacity: document.getElementById("opacity"),
  strictSwiss: document.getElementById("strict-swiss"),
  iconStyle: document.getElementById("icon-style"),
  fontHeader: document.getElementById("font-header"),
  fontTitle: document.getElementById("font-title"),
  fontSubheader: document.getElementById("font-subheader"),
  textColor: document.getElementById("text-color"),
  titleWidth: document.getElementById("title-width"),
  jpegQuality: document.getElementById("jpeg-quality"),
  seriesList: document.getElementById("series-list"),
  previewCanvas: document.getElementById("preview-canvas"),
  previewLabel: document.getElementById("preview-label"),
  exportCurrent: document.getElementById("export-current"),
  exportAllPng: document.getElementById("export-all-png"),
  exportAllJpg: document.getElementById("export-all-jpg"),
  downloadTheme: document.getElementById("download-theme"),
  importTheme: document.getElementById("import-theme")
};

let state = structuredClone(DEFAULT_STATE);
let paletteLibrary = [];
let suggestionCache = [];

const previewCtx = dom.previewCanvas.getContext("2d");

function init() {
  populateShapes();
  populateFonts();
  populateIconCategories();
  rebuildPaletteLibrary();
  rebuildSeriesItems();
  bindEvents();
  renderSeriesList();
  renderPreview();
}

function populateShapes() {
  dom.primaryShape.innerHTML = "";
  SHAPES.forEach((shape) => {
    const option = document.createElement("option");
    option.value = shape;
    option.textContent = shape;
    dom.primaryShape.append(option);
  });
}

function populateFonts() {
  [dom.fontHeader, dom.fontTitle, dom.fontSubheader].forEach((select) => {
    select.innerHTML = "";
    DEFAULT_FONTS.forEach((font) => {
      const option = document.createElement("option");
      option.value = font;
      option.textContent = font;
      select.append(option);
    });
  });
  dom.fontHeader.value = state.typography.headerFont;
  dom.fontTitle.value = state.typography.titleFont;
  dom.fontSubheader.value = state.typography.subheaderFont;
}

function populateIconCategories() {
  dom.iconCategories.innerHTML = "";
  listIconCategories().forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = category;
    button.dataset.value = category;
    if (state.motif.iconCategories.includes(category)) {
      button.classList.add("active");
    }
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      state.motif.iconCategories = Array.from(dom.iconCategories.querySelectorAll(".chip.active")).map((chip) => chip.dataset.value);
      renderPreviewDebounced();
    });
    dom.iconCategories.append(button);
  });
}

function rebuildPaletteLibrary() {
  const seedBase = `${state.seriesSetup.masterSeed}|paletteLibrary|${state.seriesSetup.variationMode}`;
  const rng = seededRandom(seedBase);
  paletteLibrary = Array.from({ length: 5 }, (_, index) => {
    const baseHue = Math.floor(rng() * 360);
    const base = `#${Math.floor(rng() * 0xffffff).toString(16).padStart(6, "0")}`;
    const primary = adjustHsl(base, { h: baseHue, s: 25, l: 20 });
    const secondary = adjustHsl(primary, { h: 20, s: 10, l: 10 });
    const accent1 = adjustHsl(primary, { h: 160, s: 15, l: 15 });
    const accent2 = adjustHsl(primary, { h: -45, s: 10, l: 20 });
    return {
      id: `palette-${index}`,
      name: ["Mono + Neon Accent", "Mono + Warm Accent", "Mono + Cool Accent", "Mono + Two-tone", "Grayscale + Bold"][index] || `Palette ${index + 1}`,
      colors: [primary, secondary, accent1, accent2, "#f2f2f2"],
      roles: {
        primary,
        secondary,
        accent1,
        accent2,
        neutral: "#f2f2f2"
      },
      generated: true
    };
  });

  dom.paletteSelect.innerHTML = "";
  paletteLibrary.forEach((palette) => {
    const option = document.createElement("option");
    option.value = palette.id;
    option.textContent = palette.name;
    dom.paletteSelect.append(option);
  });
}

function rebuildSeriesItems() {
  state.seriesItems = createSeriesItems(state.seriesSetup.count);
  state.ui.selectedIndex = 0;
}

function bindEvents() {
  dom.seriesSeed.addEventListener("input", (event) => {
    state.seriesSetup.masterSeed = event.target.value;
    rebuildPaletteLibrary();
    renderPreviewDebounced();
  });

  dom.coverCount.addEventListener("change", (event) => {
    state.seriesSetup.count = Number(event.target.value);
    rebuildSeriesItems();
    renderSeriesList();
    renderPreview();
  });

  dom.variationMode.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      state.seriesSetup.variationMode = event.target.value;
      dom.varyColorsControls.classList.toggle("hidden", event.target.value !== "colors");
      dom.varyShapesControls.classList.toggle("hidden", event.target.value !== "shapes");
      rebuildPaletteLibrary();
      renderPreviewDebounced();
    });
  });

  dom.backgroundColor.addEventListener("input", (event) => {
    state.seriesSetup.backgroundColor = event.target.value;
    renderPreviewDebounced();
  });

  dom.exportJpg.addEventListener("change", (event) => {
    state.seriesSetup.exportJpg = event.target.checked;
  });

  dom.generateThemes.addEventListener("click", () => {
    suggestionCache = buildThemeSuggestions();
    renderThemeSuggestions();
  });

  dom.patternMode.addEventListener("change", (event) => {
    state.pattern.mode = event.target.value;
    renderPreviewDebounced();
  });

  dom.primaryShape.addEventListener("change", (event) => {
    state.motif.primaryShape = event.target.value;
    renderPreviewDebounced();
  });

  dom.iconMix.addEventListener("input", (event) => {
    state.motif.iconMix = Number(event.target.value);
    dom.iconMixValue.textContent = `${event.target.value}%`;
    renderPreviewDebounced();
  });

  dom.paletteSelect.addEventListener("change", (event) => {
    const palette = paletteLibrary.find((item) => item.id === event.target.value);
    if (palette) {
      state.theme = { ...state.theme, palette };
      renderPreviewDebounced();
    }
  });

  dom.density.addEventListener("input", (event) => {
    state.pattern.density = Number(event.target.value);
    renderPreviewDebounced();
  });

  dom.shapeScale.addEventListener("input", (event) => {
    state.pattern.elementScale = Number(event.target.value);
    renderPreviewDebounced();
  });

  dom.rotationVariance.addEventListener("input", (event) => {
    state.pattern.rotationVariance = Number(event.target.value);
    renderPreviewDebounced();
  });

  dom.opacity.addEventListener("input", (event) => {
    state.pattern.opacity = Number(event.target.value);
    renderPreviewDebounced();
  });

  dom.strictSwiss.addEventListener("change", (event) => {
    state.motif.strictSwiss = event.target.checked;
    if (event.target.checked) {
      state.motif.iconCategories = [];
      populateIconCategories();
    }
    renderPreviewDebounced();
  });

  dom.iconStyle.addEventListener("change", (event) => {
    state.motif.iconStyle = event.target.value;
    renderPreviewDebounced();
  });

  dom.fontHeader.addEventListener("change", (event) => {
    state.typography.headerFont = event.target.value;
    renderPreviewDebounced();
  });

  dom.fontTitle.addEventListener("change", (event) => {
    state.typography.titleFont = event.target.value;
    renderPreviewDebounced();
  });

  dom.fontSubheader.addEventListener("change", (event) => {
    state.typography.subheaderFont = event.target.value;
    renderPreviewDebounced();
  });

  dom.textColor.addEventListener("input", (event) => {
    state.typography.textColor = event.target.value;
    renderPreviewDebounced();
  });

  dom.titleWidth.addEventListener("input", (event) => {
    state.typography.maxTitleWidthPct = Number(event.target.value);
    renderPreviewDebounced();
  });

  dom.exportCurrent.addEventListener("click", () => {
    exportCover(state.ui.selectedIndex, "png");
  });

  dom.exportAllPng.addEventListener("click", () => {
    exportAll("png");
  });

  dom.exportAllJpg.addEventListener("click", () => {
    exportAll("jpg");
  });

  dom.downloadTheme.addEventListener("click", () => {
    const payload = buildThemeExport(true);
    downloadBlob(JSON.stringify(payload, null, 2), "playlist-theme.json", "application/json");
  });

  dom.importTheme.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      importTheme(data);
    };
    reader.readAsText(file);
  });
}

function buildThemeSuggestions() {
  const suggestions = [];
  const { masterSeed, variationMode, count } = state.seriesSetup;
  for (let index = 0; index < 5; index += 1) {
    const seed = `${masterSeed}|themeCandidate|${index}|${variationMode}|${count}`;
    const rng = seededRandom(seed);
    const palette = paletteLibrary[index % paletteLibrary.length];
    const motif = buildMotifFromSeed(rng);
    const pattern = {
      ...state.pattern,
      mode: ["tiled", "offset", "diagonal", "radial", "isometric", "border"][Math.floor(rng() * 6)]
    };
    suggestions.push({
      id: `theme-${index}-${stringToSeed(seed)}`,
      palette,
      motif,
      pattern
    });
  }
  return suggestions;
}

function buildMotifFromSeed(rng) {
  const primaryShape = SHAPES[Math.floor(rng() * SHAPES.length)];
  const secondaryShapes = SHAPES.filter((shape) => shape !== primaryShape).slice(0, 4);
  const categories = listIconCategories().filter(() => rng() > 0.4);
  return {
    primaryShape,
    secondaryShapes,
    iconCategories: categories.length ? categories : listIconCategories().slice(0, 2),
    iconMix: Math.floor(20 + rng() * 40),
    iconStyle: state.motif.iconStyle,
    strictSwiss: state.motif.strictSwiss
  };
}

function renderThemeSuggestions() {
  dom.themeSuggestions.innerHTML = "";
  suggestionCache.forEach((suggestion, index) => {
    const card = document.createElement("div");
    card.className = "theme-card";
    if (suggestion.id === state.selectedThemeId) {
      card.classList.add("selected");
    }
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    renderCover(ctx, buildCoverTheme(index, suggestion, true), state.seriesItems[0], { width: 120, height: 120, scale: 0.04 });
    const swatches = document.createElement("div");
    swatches.className = "swatches";
    suggestion.palette.colors.slice(0, 4).forEach((color) => {
      const swatch = document.createElement("div");
      swatch.className = "swatch";
      swatch.style.background = color;
      swatches.append(swatch);
    });
    const label = document.createElement("div");
    label.textContent = suggestion.pattern.mode;
    label.className = "muted";
    card.append(canvas, swatches, label);
    card.addEventListener("click", () => {
      state.selectedThemeId = suggestion.id;
      state.theme = suggestion;
      state.pattern = { ...suggestion.pattern };
      state.motif = { ...suggestion.motif };
      dom.primaryShape.value = state.motif.primaryShape;
      dom.patternMode.value = state.pattern.mode;
      dom.iconMix.value = state.motif.iconMix;
      dom.iconMixValue.textContent = `${state.motif.iconMix}%`;
      dom.iconStyle.value = state.motif.iconStyle;
      state.motif.iconCategories = suggestion.motif.iconCategories;
      populateIconCategories();
      renderThemeSuggestions();
      renderPreview();
    });
    dom.themeSuggestions.append(card);
  });
}

function renderSeriesList() {
  dom.seriesList.innerHTML = "";
  state.seriesItems.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "series-item";
    if (state.ui.selectedIndex === index) {
      wrapper.classList.add("active");
    }
    const title = document.createElement("h3");
    title.textContent = `Cover ${index + 1}`;
    const grid = document.createElement("div");
    grid.className = "grid";
    const headerInput = createTextInput("Header", item.header, (value) => {
      item.header = value;
      renderPreviewDebounced();
    });
    const titleInput = createTextInput("Playlist Name", item.title, (value) => {
      item.title = value;
      renderPreviewDebounced();
    });
    const subheaderInput = createTextInput("Subheader", item.subheader, (value) => {
      item.subheader = value;
      renderPreviewDebounced();
    });
    const suffixInput = createTextInput("Seed Suffix", item.suffix, (value) => {
      item.suffix = value;
      renderPreviewDebounced();
    });
    const buttons = document.createElement("div");
    buttons.className = "bulk-actions";
    const exportPng = document.createElement("button");
    exportPng.textContent = "Export PNG";
    exportPng.className = "secondary";
    exportPng.addEventListener("click", () => exportCover(index, "png"));
    const exportJpg = document.createElement("button");
    exportJpg.textContent = "Export JPG";
    exportJpg.className = "secondary";
    exportJpg.addEventListener("click", () => exportCover(index, "jpg"));
    buttons.append(exportPng, exportJpg);
    grid.append(headerInput, titleInput, subheaderInput, suffixInput, buttons);
    wrapper.append(title, grid);
    wrapper.addEventListener("click", () => {
      state.ui.selectedIndex = index;
      renderSeriesList();
      renderPreview();
    });
    dom.seriesList.append(wrapper);
  });
}

function createTextInput(labelText, value, onChange) {
  const field = document.createElement("div");
  field.className = "field";
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.addEventListener("input", (event) => onChange(event.target.value));
  field.append(label, input);
  return field;
}

function buildCoverTheme(index, themeOverride, isSuggestion = false) {
  const theme = themeOverride || state.theme || {
    id: "default",
    palette: paletteLibrary[0],
    motif: state.motif,
    pattern: state.pattern
  };
  const cover = state.seriesItems[index] || state.seriesItems[0];
  const seed = `${state.seriesSetup.masterSeed}|${theme.id}|${index}|${cover.suffix}`;
  const rng = seededRandom(seed);
  return {
    ...theme,
    backgroundColor: state.seriesSetup.backgroundColor,
    motif: state.motif,
    palette: theme.palette,
    pattern: state.pattern,
    typography: state.typography,
    rng,
    isSuggestion
  };
}

function renderPreview() {
  const cover = state.seriesItems[state.ui.selectedIndex];
  if (!cover) return;
  dom.previewLabel.textContent = `Cover ${state.ui.selectedIndex + 1}`;
  renderCover(previewCtx, buildCoverTheme(state.ui.selectedIndex), cover, { width: 1000, height: 1000, scale: 0.33 });
}

let debounceId = null;
function renderPreviewDebounced() {
  window.clearTimeout(debounceId);
  debounceId = window.setTimeout(() => {
    renderPreview();
  }, 120);
}

function exportCover(index, format) {
  if (format === "jpg" && !state.seriesSetup.exportJpg) {
    return;
  }
  const cover = state.seriesItems[index];
  const canvas = document.createElement("canvas");
  canvas.width = 3000;
  canvas.height = 3000;
  const ctx = canvas.getContext("2d");
  renderCover(ctx, buildCoverTheme(index), cover, { width: 3000, height: 3000, scale: 1 });
  const fileName = buildFilename(index, cover, format);
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const quality = format === "jpg" ? Number(dom.jpegQuality.value) : 1;
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, fileName, mime);
    }
  }, mime, quality);
}

function exportAll(format) {
  if (format === "jpg" && !state.seriesSetup.exportJpg) {
    return;
  }
  state.seriesItems.forEach((_, index) => exportCover(index, format));
}

function buildFilename(index, cover, format) {
  const safe = (text) => text.replace(/[^a-z0-9\- ]/gi, "").trim().replace(/\s+/g, "_");
  const parts = [String(index + 1).padStart(2, "0"), safe(cover.header), safe(cover.title), safe(cover.subheader)].filter(Boolean);
  const base = parts.join("_").slice(0, 80) || `cover_${index + 1}`;
  return `${base}.${format}`;
}

function downloadBlob(content, filename, mime) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildThemeExport(includeText) {
  return {
    appVersion: "1.0.0",
    schemaVersion: "1.0",
    timestamp: new Date().toISOString(),
    masterSeed: state.seriesSetup.masterSeed,
    count: state.seriesSetup.count,
    variationMode: state.seriesSetup.variationMode,
    themeId: state.selectedThemeId || "default",
    backgroundColor: state.seriesSetup.backgroundColor,
    palette: state.theme?.palette || paletteLibrary[0],
    motif: state.motif,
    pattern: state.pattern,
    typography: state.typography,
    seriesItems: includeText ? state.seriesItems : undefined
  };
}

function importTheme(payload) {
  state.seriesSetup.masterSeed = payload.masterSeed || state.seriesSetup.masterSeed;
  state.seriesSetup.count = payload.count || state.seriesSetup.count;
  state.seriesSetup.variationMode = payload.variationMode || state.seriesSetup.variationMode;
  state.selectedThemeId = payload.themeId || state.selectedThemeId;
  state.seriesSetup.backgroundColor = payload.backgroundColor || state.seriesSetup.backgroundColor;
  state.pattern = payload.pattern || state.pattern;
  state.typography = payload.typography || state.typography;
  state.motif = payload.motif || state.motif;
  state.theme = { id: state.selectedThemeId, palette: payload.palette || paletteLibrary[0], motif: state.motif, pattern: state.pattern };
  if (payload.seriesItems) {
    state.seriesItems = payload.seriesItems;
  } else {
    rebuildSeriesItems();
  }
  dom.seriesSeed.value = state.seriesSetup.masterSeed;
  dom.coverCount.value = state.seriesSetup.count;
  dom.backgroundColor.value = state.seriesSetup.backgroundColor;
  dom.patternMode.value = state.pattern.mode;
  dom.primaryShape.value = state.motif.primaryShape;
  dom.iconMix.value = state.motif.iconMix;
  dom.iconMixValue.textContent = `${state.motif.iconMix}%`;
  dom.iconStyle.value = state.motif.iconStyle;
  dom.textColor.value = state.typography.textColor;
  dom.titleWidth.value = state.typography.maxTitleWidthPct;
  populateIconCategories();
  renderSeriesList();
  renderPreview();
}

init();
