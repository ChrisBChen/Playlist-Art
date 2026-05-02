import { fitText, drawTextLines } from './textFit.js';
import { makeRng, range } from '../utils/seed.js';
import { resolvePalette } from '../state.js';

const TEMPLATE_RENDERERS = {
  'type-block': renderTypeBlock,
  'modular-bars': renderModularBars,
  'circle-study': renderCircleStudy,
  'index-field': renderIndexField,
};

export function renderCover({
  ctx,
  size,
  cover,
  artSystem,
  palette,
  typography,
  masterSeed,
}) {
  const resolvedPalette = palette || resolvePalette(artSystem);
  const colors = resolveColors(resolvedPalette.colors, artSystem.backgroundMode);
  const grid = buildGrid(size, artSystem.gridDensity);
  const seed = `${masterSeed}|${artSystem.templateId}|${cover.index}|${cover.variantSeed}|${artSystem.gridDensity}|${artSystem.variationStrength}`;
  const rng = makeRng(seed);

  ctx.clearRect(0, 0, size, size);
  drawBase(ctx, size, grid, colors);

  const renderer = TEMPLATE_RENDERERS[artSystem.templateId] || renderTypeBlock;
  const result = renderer({
    ctx,
    size,
    cover,
    artSystem,
    typography,
    colors,
    grid,
    rng,
  });

  return result;
}

export function clearPlacementCache() {
  // Kept for compatibility with older callers; v2 rendering is stateless.
}

function renderTypeBlock({ ctx, size, cover, artSystem, typography, colors, grid, rng }) {
  const accentCol = Math.floor(range(rng, 3, Math.max(4, grid.cols - 2)));
  const accentRows = Math.max(2, Math.round(range(rng, 2, 4 + artSystem.variationStrength * 2)));
  const blockWidth = grid.colW * range(rng, 1.1, 2.4);

  ctx.fillStyle = colors.accent;
  ctx.fillRect(grid.x + accentCol * grid.colW, grid.y, blockWidth, grid.rowH * accentRows);

  ctx.fillStyle = colors.ink;
  ctx.fillRect(grid.x, grid.y + grid.rowH * (grid.rows - 1), grid.colW * range(rng, 1.2, 2.8), grid.rowH * 0.16);

  drawMicroLabel(ctx, `${cover.kicker || 'PLAYLIST'} / ${cover.indexLabel}`, grid.x, grid.y + grid.rowH * 0.2, colors, typography, size);
  drawRightIndex(ctx, cover.indexLabel, grid.right, grid.y + grid.rowH * 0.2, colors, typography, size);

  const titleFit = drawTitleBlock({
    ctx,
    text: cover.title,
    x: grid.x,
    y: grid.y + grid.rowH * 4.8,
    maxWidth: grid.colW * Math.min(6.8, grid.cols - 1),
    baseSize: size * 0.15 * artSystem.typeScale,
    color: colors.ink,
    typography,
    maxLines: 3,
  });

  drawDetailRule(ctx, grid.x, grid.y + grid.rowH * 7.6, grid.colW * 3.4, colors.accent);
  drawFooter(ctx, cover.footer, grid.x, grid.y + grid.rowH * 8.05, grid.colW * 5.8, colors, typography, size);

  return { titleFit };
}

function renderModularBars({ ctx, size, cover, artSystem, typography, colors, grid, rng }) {
  const barCount = Math.round(5 + artSystem.variationStrength * 8);
  const titleFloor = grid.y + grid.rowH * 5.3;

  for (let i = 0; i < barCount; i += 1) {
    const isVertical = rng() > 0.35;
    const color = pickColor(rng, [colors.accent, colors.ink, withAlpha(colors.muted, 0.8), colors.accent2]);
    ctx.fillStyle = color;

    if (isVertical) {
      const col = Math.floor(range(rng, 2, grid.cols));
      const width = Math.max(grid.colW * 0.22, grid.colW * range(rng, 0.35, 1.2));
      const y = grid.y + grid.rowH * Math.floor(range(rng, 0, 4));
      const height = Math.min(titleFloor - y - grid.rowH * 0.2, grid.rowH * range(rng, 1.4, 4.8));
      if (height > grid.rowH * 0.4) ctx.fillRect(grid.x + col * grid.colW, y, width, height);
    } else {
      const row = Math.floor(range(rng, 0, 5));
      const x = grid.x + grid.colW * Math.floor(range(rng, 0, 5));
      const width = grid.colW * range(rng, 1.8, 5.2);
      ctx.fillRect(x, grid.y + row * grid.rowH, width, grid.rowH * range(rng, 0.16, 0.42));
    }
  }

  ctx.fillStyle = withAlpha(colors.ink, colors.mode === 'reverse' ? 0.1 : 0.06);
  ctx.fillRect(grid.x, grid.y + grid.rowH * 5.1, grid.w, grid.rowH * 2.75);

  drawMicroLabel(ctx, cover.kicker || 'PLAYLIST', grid.x, grid.y + grid.rowH * 0.25, colors, typography, size);
  drawRightIndex(ctx, cover.indexLabel, grid.right, grid.y + grid.rowH * 0.25, colors, typography, size);

  const titleFit = drawTitleBlock({
    ctx,
    text: cover.title,
    x: grid.x,
    y: grid.y + grid.rowH * 5.8,
    maxWidth: grid.colW * Math.min(6.2, grid.cols - 1),
    baseSize: size * 0.13 * artSystem.typeScale,
    color: colors.ink,
    typography,
    maxLines: 3,
  });

  drawFooter(ctx, cover.footer, grid.x, grid.y + grid.rowH * 8.25, grid.colW * 5.8, colors, typography, size);
  return { titleFit };
}

function renderCircleStudy({ ctx, size, cover, artSystem, typography, colors, grid, rng }) {
  const bigRadius = size * range(rng, 0.32, 0.46);
  const cx = grid.x + grid.colW * range(rng, 4.4, grid.cols + 0.8);
  const cy = grid.y + grid.rowH * range(rng, 1.8, 4.8);

  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(cx, cy, bigRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = Math.max(3, size * 0.012);
  ctx.strokeStyle = colors.ink;
  ctx.beginPath();
  ctx.arc(cx - grid.colW * 0.75, cy + grid.rowH * 0.45, bigRadius * 0.68, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = colors.paper;
  ctx.beginPath();
  ctx.arc(grid.x + grid.colW * range(rng, 0.4, 2.1), grid.y + grid.rowH * range(rng, 0.4, 2.2), size * 0.055, 0, Math.PI * 2);
  ctx.fill();

  drawMicroLabel(ctx, cover.kicker || 'PLAYLIST', grid.x, grid.y + grid.rowH * 0.24, colors, typography, size);
  drawRightIndex(ctx, cover.indexLabel, grid.right, grid.y + grid.rowH * 0.24, colors, typography, size);

  const titleFit = drawTitleBlock({
    ctx,
    text: cover.title,
    x: grid.x,
    y: grid.y + grid.rowH * 5.55,
    maxWidth: grid.colW * Math.min(6.4, grid.cols - 1),
    baseSize: size * 0.14 * artSystem.typeScale,
    color: colors.ink,
    typography,
    maxLines: 3,
  });

  drawDetailRule(ctx, grid.x, grid.y + grid.rowH * 7.95, grid.colW * 2.7, colors.accent);
  drawFooter(ctx, cover.footer, grid.x, grid.y + grid.rowH * 8.38, grid.colW * 5.8, colors, typography, size);
  return { titleFit };
}

function renderIndexField({ ctx, size, cover, artSystem, typography, colors, grid }) {
  const index = cover.indexLabel || `${cover.index + 1}`.padStart(2, '0');

  ctx.save();
  ctx.fillStyle = withAlpha(colors.accent2, colors.mode === 'accent' ? 0.34 : 0.18);
  ctx.font = `800 ${size * 0.52}px ${typography.family}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(index, grid.x - grid.colW * 0.22, grid.y + grid.rowH * 0.45);
  ctx.restore();

  ctx.fillStyle = colors.accent;
  ctx.fillRect(grid.x, grid.y, grid.colW * 0.24, grid.h);
  ctx.fillRect(grid.x + grid.colW * 0.55, grid.y, grid.colW * 0.08, grid.h * 0.58);

  for (let row = 0; row < 6; row += 1) {
    drawSmallText({
      ctx,
      text: `${index}.${String(row + 1).padStart(2, '0')}`,
      x: grid.right - grid.colW * 1.5,
      y: grid.y + grid.rowH * (1 + row * 0.7),
      color: row === cover.index % 6 ? colors.accent : colors.muted,
      size: size * 0.016,
      typography,
      tracking: typography.detailTracking,
    });
  }

  drawMicroLabel(ctx, cover.kicker || 'PLAYLIST', grid.x + grid.colW, grid.y + grid.rowH * 0.2, colors, typography, size);

  const titleFit = drawTitleBlock({
    ctx,
    text: cover.title,
    x: grid.x + grid.colW,
    y: grid.y + grid.rowH * 5.9,
    maxWidth: grid.colW * Math.min(6.1, grid.cols - 2),
    baseSize: size * 0.13 * artSystem.typeScale,
    color: colors.ink,
    typography,
    maxLines: 3,
  });

  drawFooter(ctx, cover.footer, grid.x + grid.colW, grid.y + grid.rowH * 8.35, grid.colW * 5.8, colors, typography, size);
  return { titleFit };
}

function buildGrid(size, density) {
  const cols = Number.parseInt(density, 10) || 8;
  const rows = 9;
  const margin = size * 0.09;
  const w = size - margin * 2;
  const h = size - margin * 2;
  return {
    x: margin,
    y: margin,
    right: margin + w,
    bottom: margin + h,
    w,
    h,
    cols,
    rows,
    colW: w / cols,
    rowH: h / rows,
  };
}

function drawBase(ctx, size, grid, colors) {
  ctx.fillStyle = colors.paper;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.strokeStyle = withAlpha(colors.ink, colors.mode === 'reverse' ? 0.09 : 0.06);
  ctx.lineWidth = Math.max(1, size * 0.00065);
  for (let col = 0; col <= grid.cols; col += 1) {
    const x = grid.x + col * grid.colW;
    ctx.beginPath();
    ctx.moveTo(x, grid.y);
    ctx.lineTo(x, grid.bottom);
    ctx.stroke();
  }
  for (let row = 0; row <= grid.rows; row += 1) {
    const y = grid.y + row * grid.rowH;
    ctx.beginPath();
    ctx.moveTo(grid.x, y);
    ctx.lineTo(grid.right, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTitleBlock({ ctx, text, x, y, maxWidth, baseSize, color, typography, maxLines }) {
  const titleFit = fitText({
    ctx,
    text: text || 'Untitled Playlist',
    maxWidth,
    maxLines,
    baseSize,
    fontFamily: typography.family,
    fontWeight: 800,
    tracking: typography.titleTracking,
    minSize: baseSize * 0.42,
  });

  ctx.font = `800 ${titleFit.fontSize}px ${typography.family}`;
  drawTextLines({
    ctx,
    lines: titleFit.lines,
    x,
    y,
    lineHeight: titleFit.fontSize * 0.98,
    tracking: typography.titleTracking,
    color,
    align: 'left',
  });

  return titleFit;
}

function drawMicroLabel(ctx, text, x, y, colors, typography, size) {
  drawSmallText({
    ctx,
    text: String(text || 'PLAYLIST').toUpperCase(),
    x,
    y,
    color: colors.ink,
    size: size * 0.019,
    typography,
    tracking: typography.kickerTracking,
  });
}

function drawRightIndex(ctx, text, x, y, colors, typography, size) {
  ctx.save();
  ctx.font = `700 ${size * 0.034}px ${typography.family}`;
  drawTextLines({
    ctx,
    lines: [String(text || '01')],
    x,
    y,
    lineHeight: size * 0.034,
    tracking: typography.detailTracking,
    color: colors.ink,
    align: 'right',
  });
  ctx.restore();
}

function drawFooter(ctx, text, x, y, maxWidth, colors, typography, size) {
  const footer = fitText({
    ctx,
    text: String(text || 'SWISS SERIES').toUpperCase(),
    maxWidth,
    maxLines: 1,
    baseSize: size * 0.021,
    fontFamily: typography.family,
    fontWeight: 600,
    tracking: typography.detailTracking,
    minSize: size * 0.014,
  });

  ctx.font = `600 ${footer.fontSize}px ${typography.family}`;
  drawTextLines({
    ctx,
    lines: footer.lines,
    x,
    y,
    lineHeight: footer.fontSize,
    tracking: typography.detailTracking,
    color: colors.muted,
    align: 'left',
  });
}

function drawSmallText({ ctx, text, x, y, color, size, typography, tracking }) {
  ctx.save();
  ctx.font = `700 ${size}px ${typography.family}`;
  drawTextLines({
    ctx,
    lines: [text],
    x,
    y,
    lineHeight: size,
    tracking,
    color,
    align: 'left',
  });
  ctx.restore();
}

function drawDetailRule(ctx, x, y, width, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, Math.max(2, width * 0.012));
}

function resolveColors(colors, mode) {
  if (mode === 'reverse') {
    return {
      mode,
      paper: colors.ink,
      ink: colors.background,
      muted: colors.muted,
      accent: colors.accent,
      accent2: colors.accent2,
    };
  }

  if (mode === 'accent') {
    return {
      mode,
      paper: colors.accent,
      ink: colors.background,
      muted: colors.ink,
      accent: colors.ink,
      accent2: colors.accent2,
    };
  }

  return {
    mode: 'paper',
    paper: colors.background,
    ink: colors.ink,
    muted: colors.muted,
    accent: colors.accent,
    accent2: colors.accent2,
  };
}

function pickColor(rng, colors) {
  return colors[Math.min(colors.length - 1, Math.floor(rng() * colors.length))];
}

function withAlpha(hex, alpha) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
