import {
  APP_VERSION,
  SCHEMA_VERSION,
  createInitialState,
  createSeriesItems,
  DEFAULT_THEME,
  FONT_OPTIONS,
  PATTERN_MODES
} from "./state.js";
import { generatePaletteFromPrimary, sanitizeFilename } from "./utils/color.js";
import { seededRandom, stringToSeed, mulberry32 } from "./utils/seed.js";
import { renderCover, clearRenderCache, getShapeOptions } from "./render/render.js";
import { getIconsByCategories, ICONS } from "./render/icons.js";

const state = createInitialState();
const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");

const elements = {
  seriesSeed: document.getElementById("seriesSeed"),
  coverCount: document.getElementById("coverCount"),
  backgroundColor: document.getElementById("backgroundColor"),
  exportJpg: document.getElementById("exportJpg"),
  variationModes: document.querySelectorAll("input[name='variationMode']"),
  generateSuggestions: document.getElementById("generateSuggestions"),
  suggestions: document.getElementById("suggestions"),
  patternMode: document.getElementById("patternMode"),
  density: document.getElementById("density"),
  shapeScale: document.getElementById("shapeScale"),
  rotationVariance: document.getElementById("rotationVariance"),
  motifOpacity: document.getElementById("motifOpacity"),
  iconMix: document.getElementById("iconMix"),
  strokeIcons: document.getElementById("strokeIcons"),
  strictSwiss: document.getElementById("strictSwiss"),
  categoryToggles: document.querySelectorAll(".category-toggles input[type='checkbox']"),
  motifControls: document.getElementById("motifControls"),
  paletteControls: document.getElementById("paletteControls"),
  headerFont: document.getElementById("headerFont"),
  titleFont: document.getElementById("titleFont"),
  subheaderFont: document.getElementById("subheaderFont"),
  textColor: document.getElementById("textColor"),
  seriesList: document.getElementById("seriesList"),
  previewTitle: document.getElementById("previewTitle"),
  exportSinglePng: document.getElementById("exportSinglePng"),
  exportSingleJpg: document.getElementById("exportSingleJpg"),
  exportAllPng: document.getElementById("exportAllPng"),
  exportAllJpg: document.getElementById("exportAllJpg"),
  downloadTheme: document.getElementById("downloadTheme"),
  importTheme: document.getElementById("importTheme"),
  devPanel: document.getElementById("devPanel"),
  runDeterminism: document.getElementById("runDeterminism"),
  determinismResult: document.getElementById("determinismResult")
};

const PALETTE_PRESETS = [
  {
    name: "Mono + Neon Accent",
    roles: {
      primary: "#7CF6FF",
      secondary: "#E8E8E8",
      accent1: "#63B3FF",
      accent2: "#FFB454",
      neutral: "#F2F2F2"
    }
  },
  {
    name: "Mono + Warm Accent",
    roles: {
      primary: "#FFB38A",
      secondary: "#E8E8E8",
      accent1: "#FF7A5C",
      accent2: "#FFC857",
      neutral: "#F2F2F2"
    }
  },
  {
    name: "Mono + Cool Accent",
    roles: {
      primary: "#8ACBFF",
      secondary: "#E8E8E8",
      accent1: "#6D8BFF",
      accent2: "#67D8FF",
      neutral: "#F2F2F2"
    }
  },
  {
    name: "Mono + Two-tone",
    roles: {
      primary: "#E0F2F1",
      secondary: "#B2DFDB",
      accent1: "#FF6F91",
      accent2: "#FF9671",
      neutral: "#F2F2F2"
    }
  },
  {
    name: "Grayscale + Bold Primary",
    roles: {
      primary: "#FFFFFF",
      secondary: "#C7C7C7",
      accent1: "#7D7D7D",
      accent2: "#36F2FF",
      neutral: "#F2F2F2"
    }
  }
];

const MOTIF_SETS = [
  {
    name: "Circle Flow",
    primaryShape: "circle",
    secondaryShapes: ["circle", "ring", "arc"],
    iconCategories: ["music", "general"],
    iconIds: ["music-note", "headphones", "sparkles"]
  },
  {
    name: "Sharp Geometry",
    primaryShape: "triangle",
    secondaryShapes: ["triangle", "diamond", "hexagon"],
    iconCategories: ["abstract", "arrows"],
    iconIds: ["arrow-right", "grid"]
  },
  {
    name: "Grid Pulse",
    primaryShape: "square",
    secondaryShapes: ["square", "rounded-square", "line"],
    iconCategories: ["music", "fitness"],
    iconIds: ["equalizer", "dumbbell", "flame"]
  },
  {
    name: "Orbiting",
    primaryShape: "ring",
    secondaryShapes: ["ring", "circle", "arc"],
    iconCategories: ["general", "abstract"],
    iconIds: ["orbit", "sun", "moon"]
  },
  {
    name: "Minimal Angles",
    primaryShape: "diamond",
    secondaryShapes: ["diamond", "right-triangle", "line"],
    iconCategories: ["arrows", "general"],
    iconIds: ["arrow-up", "sparkles"]
  }
];

function createThemeId(seedText) {
  return `theme-${stringToSeed(seedText)}`;
}

function getVariationMode() {
  const modeInput = Array.from(elements.variationModes).find((input) => input.checked);
  return modeInput ? modeInput.value : "colors";
}

function getSelectedCategories() {
  return Array.from(elements.categoryToggles)
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function buildSuggestionCard(theme, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "suggestion-card";
  card.dataset.index = index;
  const swatchWrap = document.createElement("div");
  swatchWrap.className = "palette-swatches";
  Object.values(theme.palette.roles).forEach((color) => {
    const swatch = document.createElement("span");
    swatch.style.background = color;
    swatchWrap.appendChild(swatch);
  });
  const motif = document.createElement("div");
  motif.className = "motif-preview";
  motif.textContent = theme.motif.primaryShape;
  const label = document.createElement("div");
  label.className = "hint";
  label.textContent = theme.pattern.mode;
  card.appendChild(swatchWrap);
  card.appendChild(motif);
  card.appendChild(label);
  return card;
}

function updateSuggestionsUI() {
  elements.suggestions.innerHTML = "";
  state.themeSuggestions.forEach((theme, index) => {
    const card = buildSuggestionCard(theme, index);
    if (state.selectedTheme.themeId === theme.themeId) {
      card.classList.add("active");
    }
    card.addEventListener("click", () => {
      state.selectedTheme = JSON.parse(JSON.stringify(theme));
      syncThemeControls();
      updatePreview();
      updateSuggestionsUI();
      persistState();
    });
    elements.suggestions.appendChild(card);
  });
}

function generateSuggestions() {
  const variationMode = state.seriesSetup.variationMode;
  const count = state.seriesSetup.count;
  const total = 5;
  state.themeSuggestions = Array.from({ length: total }, (_, index) => {
    const seed = `${state.seriesSeed}|themeCandidate|${index}|${variationMode}|${count}`;
    const random = seededRandom(seed);
    const palette = variationMode === "colors"
      ? PALETTE_PRESETS[index % PALETTE_PRESETS.length]
      : PALETTE_PRESETS[Math.floor(random() * PALETTE_PRESETS.length)];
    const motif = variationMode === "shapes"
      ? MOTIF_SETS[index % MOTIF_SETS.length]
      : MOTIF_SETS[Math.floor(random() * MOTIF_SETS.length)];
    const patternMode = PATTERN_MODES[Math.floor(random() * PATTERN_MODES.length)];
    const themeSeed = `${seed}|${palette.name}|${motif.name}|${patternMode}`;
    const themeId = createThemeId(themeSeed);
    return {
      ...DEFAULT_THEME,
      themeId,
      variationMode,
      backgroundColor: state.seriesSetup.backgroundColor,
      palette: {
        ...palette,
        method: "preset"
      },
      motif: {
        ...DEFAULT_THEME.motif,
        primaryShape: motif.primaryShape,
        secondaryShapes: motif.secondaryShapes,
        iconCategories: motif.iconCategories,
        iconIds: motif.iconIds
      },
      pattern: {
        ...DEFAULT_THEME.pattern,
        mode: patternMode
      }
    };
  });

  state.selectedTheme = JSON.parse(JSON.stringify(state.themeSuggestions[0]));
  updateSuggestionsUI();
  syncThemeControls();
  updatePreview();
  persistState();
}

function buildMotifControls() {
  elements.motifControls.innerHTML = "";
  const shapeLabel = document.createElement("label");
  shapeLabel.textContent = "Primary Shape";
  const shapeSelect = document.createElement("select");
  getShapeOptions().forEach((shape) => {
    const option = document.createElement("option");
    option.value = shape;
    option.textContent = shape;
    shapeSelect.appendChild(option);
  });
  shapeLabel.appendChild(shapeSelect);
  elements.motifControls.appendChild(shapeLabel);

  const secondaryLabel = document.createElement("label");
  secondaryLabel.textContent = "Secondary Shapes";
  const secondarySelect = document.createElement("select");
  secondarySelect.multiple = true;
  getShapeOptions().forEach((shape) => {
    const option = document.createElement("option");
    option.value = shape;
    option.textContent = shape;
    secondarySelect.appendChild(option);
  });
  secondaryLabel.appendChild(secondarySelect);
  elements.motifControls.appendChild(secondaryLabel);

  shapeSelect.addEventListener("change", () => {
    state.selectedTheme.motif.primaryShape = shapeSelect.value;
    updatePreview();
    persistState();
  });

  secondarySelect.addEventListener("change", () => {
    const values = Array.from(secondarySelect.selectedOptions).map((option) => option.value);
    state.selectedTheme.motif.secondaryShapes = values.length ? values : [shapeSelect.value];
    updatePreview();
    persistState();
  });

  return { shapeSelect, secondarySelect };
}

function buildPaletteControls() {
  elements.paletteControls.innerHTML = "";
  const paletteLabel = document.createElement("label");
  paletteLabel.textContent = "Palette";
  const paletteSelect = document.createElement("select");
  PALETTE_PRESETS.forEach((palette) => {
    const option = document.createElement("option");
    option.value = palette.name;
    option.textContent = palette.name;
    paletteSelect.appendChild(option);
  });
  paletteLabel.appendChild(paletteSelect);
  elements.paletteControls.appendChild(paletteLabel);

  const primaryLabel = document.createElement("label");
  primaryLabel.textContent = "Custom Primary";
  const primaryInput = document.createElement("input");
  primaryInput.type = "color";
  primaryLabel.appendChild(primaryInput);
  elements.paletteControls.appendChild(primaryLabel);

  paletteSelect.addEventListener("change", () => {
    const palette = PALETTE_PRESETS.find((entry) => entry.name === paletteSelect.value);
    if (palette) {
      state.selectedTheme.palette = { ...palette, method: "preset" };
      updatePreview();
      persistState();
    }
  });

  primaryInput.addEventListener("change", () => {
    state.selectedTheme.palette = generatePaletteFromPrimary(primaryInput.value);
    updatePreview();
    persistState();
  });

  return { paletteSelect, primaryInput };
}

const motifInputs = buildMotifControls();
const paletteInputs = buildPaletteControls();

function syncThemeControls() {
  elements.patternMode.value = state.selectedTheme.pattern.mode;
  elements.density.value = state.selectedTheme.pattern.density;
  elements.shapeScale.value = state.selectedTheme.pattern.elementScale;
  elements.rotationVariance.value = state.selectedTheme.pattern.rotationVariance;
  elements.motifOpacity.value = state.selectedTheme.pattern.opacity;
  elements.iconMix.value = state.selectedTheme.motif.iconMix;
  elements.strokeIcons.checked = state.selectedTheme.motif.strokeIcons;
  elements.strictSwiss.checked = state.selectedTheme.motif.strictSwiss;
  elements.textColor.value = state.selectedTheme.typography.textColor;

  const shapeOptions = Array.from(motifInputs.shapeSelect.options);
  shapeOptions.forEach((option) => {
    option.selected = option.value === state.selectedTheme.motif.primaryShape;
  });
  const secondaryOptions = Array.from(motifInputs.secondarySelect.options);
  secondaryOptions.forEach((option) => {
    option.selected = state.selectedTheme.motif.secondaryShapes.includes(option.value);
  });

  const paletteOption = Array.from(paletteInputs.paletteSelect.options).find(
    (option) => option.value === state.selectedTheme.palette.name
  );
  if (paletteOption) {
    paletteOption.selected = true;
  }
}

function buildSeriesList() {
  elements.seriesList.innerHTML = "";
  state.seriesItems.forEach((item, index) => {
    const container = document.createElement("div");
    container.className = "series-item";
    if (index === state.ui.selectedIndex) {
      container.classList.add("active");
    }

    const header = document.createElement("div");
    header.className = "series-item-header";
    const title = document.createElement("strong");
    title.textContent = `Cover ${index + 1}`;
    const selectButton = document.createElement("button");
    selectButton.textContent = "Preview";
    selectButton.addEventListener("click", () => {
      state.ui.selectedIndex = index;
      updatePreview();
      buildSeriesList();
    });
    header.appendChild(title);
    header.appendChild(selectButton);

    const headerInput = document.createElement("input");
    headerInput.placeholder = "Header";
    headerInput.value = item.header;
    headerInput.addEventListener("input", (event) => {
      item.header = event.target.value;
      updatePreview();
      persistState();
    });

    const titleInput = document.createElement("input");
    titleInput.placeholder = "Playlist Name";
    titleInput.value = item.title;
    titleInput.addEventListener("input", (event) => {
      item.title = event.target.value;
      updatePreview();
      persistState();
    });

    const subheaderInput = document.createElement("input");
    subheaderInput.placeholder = "Subheader";
    subheaderInput.value = item.subheader;
    subheaderInput.addEventListener("input", (event) => {
      item.subheader = event.target.value;
      updatePreview();
      persistState();
    });

    const suffixInput = document.createElement("input");
    suffixInput.placeholder = "Seed Suffix";
    suffixInput.value = item.suffix;
    suffixInput.addEventListener("input", (event) => {
      item.suffix = event.target.value;
      updatePreview();
      persistState();
    });

    container.appendChild(header);
    container.appendChild(headerInput);
    container.appendChild(titleInput);
    container.appendChild(subheaderInput);
    container.appendChild(suffixInput);
    elements.seriesList.appendChild(container);
  });
}

function updatePreview() {
  const cover = state.seriesItems[state.ui.selectedIndex];
  const seedKey = `${state.seriesSeed}|${state.selectedTheme.themeId}|${state.ui.selectedIndex}|${cover.suffix}`;
  const seed = stringToSeed(seedKey);
  const random = mulberry32(seed);
  renderCover({
    ctx: previewCtx,
    size: previewCanvas.width,
    theme: state.selectedTheme,
    cover,
    seedKey,
    random
  });
  elements.previewTitle.textContent = `Preview: Cover ${state.ui.selectedIndex + 1}`;
}

function exportCover({ index, format }) {
  const cover = state.seriesItems[index];
  const size = 3000;
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = size;
  exportCanvas.height = size;
  const exportCtx = exportCanvas.getContext("2d");
  const seedKey = `${state.seriesSeed}|${state.selectedTheme.themeId}|${index}|${cover.suffix}`;
  const seed = stringToSeed(seedKey);
  const random = mulberry32(seed);
  renderCover({
    ctx: exportCtx,
    size,
    theme: state.selectedTheme,
    cover,
    seedKey,
    random
  });

  const filename = sanitizeFilename(
    `${index + 1}_${cover.header}_${cover.title}_${cover.subheader}.${format}`
  );

  exportCanvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `cover-${index + 1}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    format === "jpg" ? "image/jpeg" : "image/png",
    format === "jpg" ? 0.92 : undefined
  );
}

function exportAll(format) {
  state.seriesItems.forEach((_, index) => exportCover({ index, format }));
}

function buildThemeExport(includeText = true) {
  return {
    appVersion: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    masterSeed: state.seriesSeed,
    count: state.seriesSetup.count,
    variationMode: state.seriesSetup.variationMode,
    themeId: state.selectedTheme.themeId,
    backgroundColor: state.selectedTheme.backgroundColor,
    palette: state.selectedTheme.palette,
    motif: state.selectedTheme.motif,
    pattern: state.selectedTheme.pattern,
    typography: state.selectedTheme.typography,
    covers: includeText ? state.seriesItems : state.seriesItems.map((item) => ({ suffix: item.suffix }))
  };
}

function downloadTheme() {
  const data = buildThemeExport(true);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `theme-${state.selectedTheme.themeId}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function applyThemeImport(data) {
  if (!data || !data.schemaVersion) {
    throw new Error("Invalid theme file.");
  }
  state.seriesSeed = data.masterSeed || state.seriesSeed;
  state.seriesSetup.count = data.count || state.seriesSetup.count;
  state.seriesSetup.variationMode = data.variationMode || state.seriesSetup.variationMode;
  state.selectedTheme = {
    ...DEFAULT_THEME,
    ...data,
    palette: { ...DEFAULT_THEME.palette, ...data.palette },
    motif: { ...DEFAULT_THEME.motif, ...data.motif },
    pattern: { ...DEFAULT_THEME.pattern, ...data.pattern },
    typography: { ...DEFAULT_THEME.typography, ...data.typography }
  };
  state.seriesItems = data.covers && data.covers.length
    ? data.covers.map((cover, index) => ({
        header: cover.header || "",
        title: cover.title || "Playlist Name",
        subheader: cover.subheader || "",
        suffix: cover.suffix || `${index + 1}`
      }))
    : createSeriesItems(state.seriesSetup.count);
  state.ui.selectedIndex = 0;
  clearRenderCache();
  syncFormInputs();
  buildSeriesList();
  updatePreview();
  persistState();
}

function syncFormInputs() {
  elements.seriesSeed.value = state.seriesSeed;
  elements.coverCount.value = state.seriesSetup.count;
  elements.backgroundColor.value = state.seriesSetup.backgroundColor;
  elements.exportJpg.checked = state.seriesSetup.exportJpg;
  elements.variationModes.forEach((input) => {
    input.checked = input.value === state.seriesSetup.variationMode;
  });
  elements.textColor.value = state.selectedTheme.typography.textColor;
  elements.patternMode.value = state.selectedTheme.pattern.mode;
  elements.density.value = state.selectedTheme.pattern.density;
  elements.shapeScale.value = state.selectedTheme.pattern.elementScale;
  elements.rotationVariance.value = state.selectedTheme.pattern.rotationVariance;
  elements.motifOpacity.value = state.selectedTheme.pattern.opacity;
  elements.iconMix.value = state.selectedTheme.motif.iconMix;
  elements.strokeIcons.checked = state.selectedTheme.motif.strokeIcons;
  elements.strictSwiss.checked = state.selectedTheme.motif.strictSwiss;
}

function persistState() {
  const data = {
    ...state,
    themeSuggestions: []
  };
  localStorage.setItem("playlist-art-state", JSON.stringify(data));
}

function restoreState() {
  const raw = localStorage.getItem("playlist-art-state");
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
    state.themeSuggestions = [];
    syncFormInputs();
  } catch (error) {
    console.warn("Failed to restore saved state", error);
  }
}

function setupFonts() {
  FONT_OPTIONS.forEach((font) => {
    const option = document.createElement("option");
    option.value = font;
    option.textContent = font;
    elements.headerFont.appendChild(option.cloneNode(true));
    elements.titleFont.appendChild(option.cloneNode(true));
    elements.subheaderFont.appendChild(option.cloneNode(true));
  });

  elements.headerFont.value = state.selectedTheme.typography.headerFont;
  elements.titleFont.value = state.selectedTheme.typography.titleFont;
  elements.subheaderFont.value = state.selectedTheme.typography.subheaderFont;
}

function wireEvents() {
  elements.seriesSeed.addEventListener("input", (event) => {
    state.seriesSeed = event.target.value;
    persistState();
  });

  elements.coverCount.addEventListener("change", (event) => {
    const count = Math.min(24, Math.max(1, Number(event.target.value)));
    state.seriesSetup.count = count;
    state.seriesItems = createSeriesItems(count);
    state.ui.selectedIndex = 0;
    buildSeriesList();
    updatePreview();
    persistState();
  });

  elements.backgroundColor.addEventListener("input", (event) => {
    state.seriesSetup.backgroundColor = event.target.value;
    state.selectedTheme.backgroundColor = event.target.value;
    updatePreview();
    persistState();
  });

  elements.exportJpg.addEventListener("change", (event) => {
    state.seriesSetup.exportJpg = event.target.checked;
    updatePreview();
    persistState();
  });

  elements.variationModes.forEach((input) => {
    input.addEventListener("change", () => {
      state.seriesSetup.variationMode = getVariationMode();
      persistState();
    });
  });

  elements.generateSuggestions.addEventListener("click", generateSuggestions);

  PATTERN_MODES.forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode;
    elements.patternMode.appendChild(option);
  });

  elements.patternMode.addEventListener("change", (event) => {
    state.selectedTheme.pattern.mode = event.target.value;
    updatePreview();
    persistState();
  });

  elements.density.addEventListener("input", (event) => {
    state.selectedTheme.pattern.density = Number(event.target.value);
    updatePreview();
    persistState();
  });

  elements.shapeScale.addEventListener("input", (event) => {
    state.selectedTheme.pattern.elementScale = Number(event.target.value);
    updatePreview();
    persistState();
  });

  elements.rotationVariance.addEventListener("input", (event) => {
    state.selectedTheme.pattern.rotationVariance = Number(event.target.value);
    updatePreview();
    persistState();
  });

  elements.motifOpacity.addEventListener("input", (event) => {
    state.selectedTheme.pattern.opacity = Number(event.target.value);
    updatePreview();
    persistState();
  });

  elements.iconMix.addEventListener("input", (event) => {
    state.selectedTheme.motif.iconMix = Number(event.target.value);
    updatePreview();
    persistState();
  });

  elements.strokeIcons.addEventListener("change", (event) => {
    state.selectedTheme.motif.strokeIcons = event.target.checked;
    updatePreview();
    persistState();
  });

  elements.strictSwiss.addEventListener("change", (event) => {
    state.selectedTheme.motif.strictSwiss = event.target.checked;
    updatePreview();
    persistState();
  });

  elements.categoryToggles.forEach((input) => {
    input.addEventListener("change", () => {
      const categories = getSelectedCategories();
      const icons = getIconsByCategories(categories);
      state.selectedTheme.motif.iconCategories = categories;
      state.selectedTheme.motif.iconIds = icons.map((icon) => icon.id);
      updatePreview();
      persistState();
    });
  });

  elements.headerFont.addEventListener("change", (event) => {
    state.selectedTheme.typography.headerFont = event.target.value;
    updatePreview();
    persistState();
  });

  elements.titleFont.addEventListener("change", (event) => {
    state.selectedTheme.typography.titleFont = event.target.value;
    updatePreview();
    persistState();
  });

  elements.subheaderFont.addEventListener("change", (event) => {
    state.selectedTheme.typography.subheaderFont = event.target.value;
    updatePreview();
    persistState();
  });

  elements.textColor.addEventListener("input", (event) => {
    state.selectedTheme.typography.textColor = event.target.value;
    updatePreview();
    persistState();
  });

  elements.exportSinglePng.addEventListener("click", () => {
    exportCover({ index: state.ui.selectedIndex, format: "png" });
  });
  elements.exportSingleJpg.addEventListener("click", () => {
    if (!state.seriesSetup.exportJpg) return;
    exportCover({ index: state.ui.selectedIndex, format: "jpg" });
  });
  elements.exportAllPng.addEventListener("click", () => exportAll("png"));
  elements.exportAllJpg.addEventListener("click", () => {
    if (!state.seriesSetup.exportJpg) return;
    exportAll("jpg");
  });

  elements.downloadTheme.addEventListener("click", downloadTheme);

  elements.importTheme.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        applyThemeImport(data);
      } catch (error) {
        console.error(error);
      }
    };
    reader.readAsText(file);
  });

  elements.runDeterminism.addEventListener("click", async () => {
    const cover = state.seriesItems[0];
    const seedKey = `${state.seriesSeed}|${state.selectedTheme.themeId}|0|${cover.suffix}`;
    const seed = stringToSeed(seedKey);
    const makeHash = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      renderCover({
        ctx,
        size: 400,
        theme: state.selectedTheme,
        cover,
        seedKey,
        random: mulberry32(seed)
      });
      const data = ctx.getImageData(0, 0, 400, 400).data;
      let hash = 0;
      for (let i = 0; i < data.length; i += 97) {
        hash = (hash * 31 + data[i]) % 1000000007;
      }
      return hash;
    };
    const first = makeHash();
    const second = makeHash();
    elements.determinismResult.textContent = first === second
      ? `Determinism check passed (hash ${first}).`
      : `Mismatch detected: ${first} vs ${second}.`;
  });
}

function updateIconCategoriesFromTheme() {
  elements.categoryToggles.forEach((input) => {
    input.checked = state.selectedTheme.motif.iconCategories.includes(input.value);
  });
}

function init() {
  restoreState();
  setupFonts();
  wireEvents();
  syncFormInputs();
  updateIconCategoriesFromTheme();
  buildSeriesList();
  updatePreview();
  const devMode = new URLSearchParams(window.location.search).has("dev");
  elements.devPanel.hidden = !devMode;
  if (!state.themeSuggestions.length) {
    generateSuggestions();
  }
}

init();

window.addEventListener("resize", () => {
  updatePreview();
});
