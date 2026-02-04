import { generatePatternElements } from './patterns.js';
import { drawShape } from './shapes.js';
import { drawIcon } from './icons.js';
import { fitText, drawTextLines } from './textFit.js';
import { makeRng } from '../utils/seed.js';

const placementCache = new Map();

export function renderCover({
  ctx,
  size,
  cover,
  theme,
  typography,
  masterSeed,
  variationMode,
}) {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  const seed = `${masterSeed}|${theme.themeId}|${cover.index}|${cover.suffix}`;
  const cacheKey = `${seed}|${theme.pattern.mode}|${theme.pattern.density}|${theme.pattern.scale}|${theme.pattern.rotationVariance}|${theme.pattern.opacity}`;
  let elements = placementCache.get(cacheKey);

  if (!elements) {
    const rng = makeRng(seed);
    elements = generatePatternElements({
      rng,
      size,
      density: theme.pattern.density,
      elementScale: theme.pattern.scale,
      rotationVariance: theme.pattern.rotationVariance,
      opacity: theme.pattern.opacity,
      safeZone: theme.pattern.safeZone,
      marginPct: theme.pattern.marginPct,
      palette: theme.palette,
      motif: theme.motif,
      patternMode: theme.pattern.mode,
    });
    placementCache.set(cacheKey, elements);
  }

  ctx.save();
  ctx.globalAlpha = theme.pattern.opacity;
  elements.forEach((element) => {
    ctx.save();
    ctx.globalAlpha = element.opacity;
    if (element.isIcon) {
      drawIcon(ctx, element.shape, element.x, element.y, element.size, element.color, theme.motif.iconStrokeWidth, theme.motif.iconFilled);
    } else {
      drawShape(ctx, element.shape, element.x, element.y, element.size, element.rotation, element.color, theme.motif.strokeWidth, theme.motif.shapeFilled);
    }
    ctx.restore();
  });
  ctx.restore();

  const textColor = typography.color;
  const safeMargin = size * theme.pattern.marginPct;
  const maxWidth = size * typography.maxTitleWidth - safeMargin * 2;

  const titleFit = fitText({
    ctx,
    text: cover.title || 'Playlist Title',
    maxWidth,
    baseSize: size * 0.12,
    fontFamily: typography.title.family,
    fontWeight: typography.title.weight,
    tracking: typography.title.tracking,
  });

  const headerFit = fitText({
    ctx,
    text: cover.header || 'HEADER',
    maxWidth,
    baseSize: size * 0.04,
    fontFamily: typography.header.family,
    fontWeight: typography.header.weight,
    tracking: typography.header.tracking,
    maxLines: 1,
    minSize: size * 0.02,
  });

  const subFit = fitText({
    ctx,
    text: cover.subheader || 'SUBHEADER',
    maxWidth,
    baseSize: size * 0.035,
    fontFamily: typography.subheader.family,
    fontWeight: typography.subheader.weight,
    tracking: typography.subheader.tracking,
    maxLines: 1,
    minSize: size * 0.02,
  });

  const centerY = size / 2;
  const headerY = centerY - titleFit.fontSize * 0.9;
  const titleY = centerY;
  const subY = centerY + titleFit.fontSize * 0.9 + subFit.fontSize * 0.2;

  ctx.save();
  ctx.font = `${typography.header.weight} ${headerFit.fontSize}px ${typography.header.family}`;
  drawTextLines({
    ctx,
    lines: headerFit.lines,
    x: size / 2,
    y: headerY,
    lineHeight: headerFit.fontSize * 1.1,
    tracking: typography.header.tracking,
    color: textColor,
  });

  ctx.font = `${typography.title.weight} ${titleFit.fontSize}px ${typography.title.family}`;
  drawTextLines({
    ctx,
    lines: titleFit.lines,
    x: size / 2,
    y: titleY,
    lineHeight: titleFit.fontSize * 1.1,
    tracking: typography.title.tracking,
    color: textColor,
  });

  ctx.font = `${typography.subheader.weight} ${subFit.fontSize}px ${typography.subheader.family}`;
  drawTextLines({
    ctx,
    lines: subFit.lines,
    x: size / 2,
    y: subY,
    lineHeight: subFit.fontSize * 1.1,
    tracking: typography.subheader.tracking,
    color: textColor,
  });
  ctx.restore();

  return { titleFit, headerFit, subFit };
}

export function clearPlacementCache() {
  placementCache.clear();
}
