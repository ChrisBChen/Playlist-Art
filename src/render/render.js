import { generatePatternElements } from './patterns.js';
import { drawShape } from './shapes.js';
import { drawIcon, getIconsByCategory } from './icons.js';
import { fitText, drawTextLines } from './textFit.js';
import { pickRandom } from '../utils/seed.js';

const motifCache = new Map();

export function renderCover({
  canvas,
  theme,
  cover,
  rng,
  rngPlacement,
  size,
  preview = false,
  cacheKey = '',
}) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  renderMotifLayer({ ctx, theme, rng, rngPlacement, size, cacheKey });

  if (theme.noise?.enabled) {
    renderNoise(ctx, size, theme.noise.opacity || 0.03, rng);
  }

  renderTextLayer({ ctx, theme, cover, size, preview });
}

function renderMotifLayer({ ctx, theme, rng, rngPlacement, size, cacheKey }) {
  const { pattern } = theme;
  const cacheId = `${cacheKey}|${pattern.mode}|${pattern.density}|${pattern.elementScale}|${pattern.safeZone.width}|${pattern.safeZone.height}|${size}`;
  let elements = motifCache.get(cacheId);
  if (!elements) {
    elements = generatePatternElements({
      rng: rngPlacement,
      mode: pattern.mode,
      size,
      density: pattern.density,
      elementScale: pattern.elementScale,
      safeZone: pattern.safeZone,
      marginPct: pattern.marginPct,
    });
    motifCache.set(cacheId, elements);
  }

  const palette = theme.palette.roles;
  const colors = [palette.primary, palette.secondary, palette.accent1, palette.accent2].filter(Boolean);
  const shapes = theme.motif.primaryShape ? [theme.motif.primaryShape, ...theme.motif.secondaryShapes] : theme.motif.secondaryShapes;
  const icons = getIconsByCategory(theme.motif.iconCategories);

  ctx.save();
  ctx.globalAlpha = theme.pattern.opacity;
  ctx.strokeStyle = palette.primary;
  ctx.lineWidth = size * 0.006;

  elements.forEach((element) => {
    const color = pickRandom(rng, colors);
    ctx.save();
    ctx.translate(element.x, element.y);
    ctx.rotate(element.rotation * theme.pattern.rotationVariance);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    const useIcon = theme.motif.iconMix > 0 && icons.length > 0 && rng() < theme.motif.iconMix;
    if (useIcon) {
      drawIcon(ctx, pickRandom(rng, icons).id, element.size, theme.motif.strokeIcons);
    } else {
      const shape = pickRandom(rng, shapes);
      const filled = shape !== 'line' && shape !== 'arc' && shape !== 'ring';
      if (!filled) {
        ctx.lineWidth = size * 0.004;
      }
      drawShape(ctx, shape, element.size, filled);
    }
    ctx.restore();
  });

  ctx.restore();
}

function renderTextLayer({ ctx, theme, cover, size, preview }) {
  const { typography } = theme;
  const baseUnit = size / 250;
  const headerSize = size * 0.05;
  const titleSize = size * 0.13;
  const subSize = size * 0.045;

  const maxWidth = size * typography.maxTitleWidth;
  const centerX = size / 2;
  const centerY = size / 2;

  ctx.fillStyle = typography.textColor;

  ctx.font = `${typography.headerWeight} ${headerSize}px ${typography.headerFont}`;
  const headerFit = fitText({
    ctx,
    text: cover.header || 'Header',
    maxWidth,
    baseSize: headerSize,
    minSize: size * 0.03,
    maxLines: 1,
    tracking: typography.headerTracking,
  });

  ctx.font = `${typography.titleWeight} ${titleSize}px ${typography.titleFont}`;
  const titleFit = fitText({
    ctx,
    text: cover.title || 'Playlist Name',
    maxWidth,
    baseSize: titleSize,
    minSize: size * 0.07,
    maxLines: 2,
    tracking: typography.titleTracking,
  });

  ctx.font = `${typography.subheaderWeight} ${subSize}px ${typography.subheaderFont}`;
  const subFit = fitText({
    ctx,
    text: cover.subheader || 'Subheader',
    maxWidth,
    baseSize: subSize,
    minSize: size * 0.03,
    maxLines: 1,
    tracking: typography.subheaderTracking,
  });

  const titleBlockHeight = titleFit.lines.length * titleFit.size * 1.1;
  const headerY = centerY - titleBlockHeight / 2 - baseUnit * 10;
  const titleY = centerY;
  const subY = centerY + titleBlockHeight / 2 + baseUnit * 10;

  ctx.font = `${typography.headerWeight} ${headerFit.size}px ${typography.headerFont}`;
  drawTextLines({
    ctx,
    lines: headerFit.lines,
    x: centerX,
    y: headerY,
    lineHeight: headerFit.size * 1.2,
    tracking: typography.headerTracking,
  });

  ctx.font = `${typography.titleWeight} ${titleFit.size}px ${typography.titleFont}`;
  drawTextLines({
    ctx,
    lines: titleFit.lines,
    x: centerX,
    y: titleY,
    lineHeight: titleFit.size * 1.15,
    tracking: typography.titleTracking,
  });

  ctx.font = `${typography.subheaderWeight} ${subFit.size}px ${typography.subheaderFont}`;
  drawTextLines({
    ctx,
    lines: subFit.lines,
    x: centerX,
    y: subY,
    lineHeight: subFit.size * 1.2,
    tracking: typography.subheaderTracking,
  });

  if (preview) {
    theme.uiTitleTooLong = titleFit.tooSmall;
  }
}

function renderNoise(ctx, size, opacity, rng) {
  const imageData = ctx.createImageData(size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const value = (rng() * 255) | 0;
    imageData.data[i] = value;
    imageData.data[i + 1] = value;
    imageData.data[i + 2] = value;
    imageData.data[i + 3] = opacity * 255;
  }
  ctx.putImageData(imageData, 0, 0);
}
