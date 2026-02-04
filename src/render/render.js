import { drawShape } from "./shapes.js";
import { drawIcon, flattenIcons } from "./icons.js";
import { generatePattern } from "./patterns.js";
import { fitTitle, shrinkToFit } from "./textFit.js";

export function renderCover(ctx, theme, cover, options) {
  const { width, height, scale } = options;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const rng = theme.rng;
  const patternItems = theme.patternCache ?? generatePattern({
    rng,
    mode: theme.pattern.mode,
    width,
    height,
    density: theme.pattern.density,
    size: theme.pattern.elementScale * scale,
    rotationVariance: theme.pattern.rotationVariance,
    marginPct: theme.pattern.marginPct,
    safeZoneWidthPct: theme.pattern.safeZoneWidthPct,
    safeZoneHeightPct: theme.pattern.safeZoneHeightPct,
    safeZoneFalloff: theme.pattern.safeZoneFalloff,
    borderPaddingPct: theme.pattern.borderPaddingPct
  });

  const colors = theme.palette.colors;
  const enabledIcons = flattenIcons(theme.motif.iconCategories);
  const iconChance = theme.motif.iconMix / 100;

  ctx.globalAlpha = theme.pattern.opacity;
  for (const item of patternItems) {
    const pick = rng();
    const color = colors[Math.floor(rng() * colors.length)] || colors[0];
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (pick < iconChance && enabledIcons.length > 0) {
      const icon = enabledIcons[Math.floor(rng() * enabledIcons.length)];
      drawIcon(ctx, icon, item.x, item.y, item.size, item.rotation, theme.motif.iconStyle, item.size * 0.08);
    } else {
      const secondaryShapes = theme.motif.secondaryShapes;
      const shape = pick < 0.6 ? theme.motif.primaryShape : secondaryShapes[Math.floor(rng() * secondaryShapes.length)];
      drawShape(ctx, shape, item.x, item.y, item.size, item.rotation, theme.motif.iconStyle === "stroke");
    }
  }

  ctx.globalAlpha = 1;

  const textColor = theme.typography.textColor;
  const margin = width * theme.pattern.marginPct;
  const maxWidth = width * (theme.typography.maxTitleWidthPct / 100) - margin * 2;

  ctx.textAlign = "center";
  ctx.fillStyle = textColor;
  ctx.strokeStyle = textColor;

  const baseTitleSize = 220 * scale;
  ctx.font = `${theme.typography.titleWeight} ${baseTitleSize}px ${theme.typography.titleFont}`;
  let titleSize = baseTitleSize;
  let lines = fitTitle(ctx, cover.title, maxWidth, 2);
  if (lines.length > 1) {
    titleSize = shrinkToFit(ctx, lines[0], maxWidth, baseTitleSize, 100 * scale);
  } else {
    titleSize = shrinkToFit(ctx, cover.title, maxWidth, baseTitleSize, 100 * scale);
  }
  ctx.font = `${theme.typography.titleWeight} ${titleSize}px ${theme.typography.titleFont}`;
  lines = fitTitle(ctx, cover.title, maxWidth, 2);

  const baseline = 12 * scale;
  const titleLineHeight = titleSize + baseline * 0.6;
  const titleBlockHeight = lines.length * titleLineHeight;

  const titleY = height / 2 - titleBlockHeight / 2 + titleSize;

  ctx.font = `${theme.typography.headerWeight} ${68 * scale}px ${theme.typography.headerFont}`;
  const headerSize = shrinkToFit(ctx, cover.header, maxWidth, 68 * scale, 40 * scale);
  ctx.font = `${theme.typography.headerWeight} ${headerSize}px ${theme.typography.headerFont}`;
  ctx.fillText(cover.header, width / 2, titleY - titleBlockHeight / 2 - baseline * 1.8);

  ctx.font = `${theme.typography.titleWeight} ${titleSize}px ${theme.typography.titleFont}`;
  lines.forEach((line, index) => {
    const y = titleY + index * titleLineHeight;
    ctx.fillText(line, width / 2, y);
  });

  ctx.font = `${theme.typography.subheaderWeight} ${56 * scale}px ${theme.typography.subheaderFont}`;
  const subSize = shrinkToFit(ctx, cover.subheader, maxWidth, 56 * scale, 36 * scale);
  ctx.font = `${theme.typography.subheaderWeight} ${subSize}px ${theme.typography.subheaderFont}`;
  ctx.fillText(cover.subheader, width / 2, titleY + titleBlockHeight / 2 + baseline * 2.2);
}
