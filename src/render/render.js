import { generatePatternLayout } from './patterns.js';
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
  const layoutSeed = `${masterSeed}|${theme.themeId}|layout`;
  const cacheKey = `${layoutSeed}|${size}|${theme.pattern.mode}|${theme.pattern.density}|${theme.pattern.scale}|${theme.pattern.rotationVariance}|${theme.pattern.safeZone.width}|${theme.pattern.safeZone.height}|${theme.pattern.safeZone.falloff}|${theme.pattern.marginPct}`;
  let layout = placementCache.get(cacheKey);

  if (!layout) {
    const layoutRng = makeRng(layoutSeed);
    layout = generatePatternLayout({
      rng: layoutRng,
      size,
      density: theme.pattern.density,
      elementScale: theme.pattern.scale,
      rotationVariance: theme.pattern.rotationVariance,
      safeZone: theme.pattern.safeZone,
      marginPct: theme.pattern.marginPct,
      patternMode: theme.pattern.mode,
    });
    placementCache.set(cacheKey, layout);
  }

  const shapeRng = makeRng(
    variationMode === 'vary-colors' ? `${layoutSeed}|shape` : `${seed}|shape`
  );
  const colorRng = makeRng(`${seed}|color`);
  const singleColor =
    variationMode === 'vary-colors'
      ? pickSingleColor(colorRng, theme.palette)
      : theme.palette.roles.primary;

  const shapes = theme.motif.secondaryShapes.length
    ? [theme.motif.primaryShape, ...theme.motif.secondaryShapes]
    : [theme.motif.primaryShape];

  ctx.save();
  ctx.globalAlpha = theme.pattern.opacity;
  layout.forEach((element) => {
    const choice = pickMotifChoice(shapeRng, theme.motif, shapes);
    if (choice.kind === 'icon') {
      drawIcon(
        ctx,
        choice.value,
        element.x,
        element.y,
        element.size,
        singleColor,
        theme.motif.iconStrokeWidth,
        theme.motif.iconFilled
      );
    } else {
      drawShape(
        ctx,
        choice.value,
        element.x,
        element.y,
        element.size,
        element.rotation,
        singleColor,
        theme.motif.strokeWidth,
        theme.motif.shapeFilled
      );
    }
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

function pickMotifChoice(rng, motif, shapes) {
  const hasIcons = motif.icons.length > 0;
  const useIcon = hasIcons && rng() < motif.iconMix;
  if (useIcon) {
    const icon = motif.icons[Math.floor(rng() * motif.icons.length)];
    return { kind: 'icon', value: icon };
  }
  const shape = shapes[Math.floor(rng() * shapes.length)];
  return { kind: 'shape', value: shape };
}

function pickSingleColor(rng, palette) {
  const options = [palette.roles.primary, palette.roles.accent1, palette.roles.accent2];
  const idx = Math.floor(rng() * options.length);
  return options[Math.min(idx, options.length - 1)];
}
