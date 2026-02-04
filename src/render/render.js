import { drawShape, SHAPES } from "./shapes.js";
import { drawIcon, getIconById } from "./icons.js";
import { generatePatternElements } from "./patterns.js";
import { fitSmallText, fitTitleText } from "./textFit.js";

const placementCache = new Map();

function pickFromArray(random, array) {
  return array[Math.floor(random() * array.length)];
}

function selectMotifElement({ random, motif, strictSwiss }) {
  if (!strictSwiss && random() < motif.iconMix && motif.iconIds.length > 0) {
    return { type: "icon", value: pickFromArray(random, motif.iconIds) };
  }
  return { type: "shape", value: pickFromArray(random, motif.secondaryShapes) };
}

export function renderCover({
  ctx,
  size,
  theme,
  cover,
  seedKey,
  random
}) {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  const cacheKey = `${seedKey}|${theme.themeId}|${size}`;
  let placements = placementCache.get(cacheKey);
  if (!placements) {
    placements = generatePatternElements({ size, pattern: theme.pattern, random });
    placementCache.set(cacheKey, placements);
  }

  const paletteValues = Object.values(theme.palette.roles);

  ctx.save();
  ctx.globalAlpha = theme.pattern.opacity;
  placements.forEach((placement) => {
    const element = selectMotifElement({
      random,
      motif: theme.motif,
      strictSwiss: theme.motif.strictSwiss
    });
    const sizeScale = size * 0.05 * theme.pattern.elementScale * (0.7 + random() * 0.6);
    const rotation = (random() - 0.5) * Math.PI * 2 * theme.pattern.rotationVariance;
    const color = pickFromArray(random, paletteValues);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    if (element.type === "shape") {
      drawShape(ctx, {
        shape: element.value,
        x: placement.x,
        y: placement.y,
        size: sizeScale,
        rotation,
        strokeOnly: ["ring", "arc", "line"].includes(element.value),
        lineWidth: size * 0.003
      });
    } else {
      const icon = getIconById(element.value);
      if (theme.motif.strokeIcons) {
        ctx.lineWidth = size * 0.003;
        ctx.strokeStyle = color;
      }
      drawIcon(ctx, icon, placement.x, placement.y, sizeScale, theme.motif.strokeIcons);
    }
  });
  ctx.restore();

  const { typography } = theme;
  const margin = size * theme.pattern.marginPct;
  const contentWidth = size - margin * 2;

  ctx.fillStyle = typography.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const baseline = typography.baselineUnit;
  const titleFit = fitTitleText({
    ctx,
    text: cover.title || "",
    maxWidth: contentWidth * typography.maxTitleWidthPct,
    fontFamily: typography.titleFont,
    fontWeight: typography.titleWeight,
    tracking: typography.titleTracking,
    minSize: size * 0.06,
    maxSize: size * 0.16
  });

  const headerFit = fitSmallText({
    ctx,
    text: cover.header || "",
    maxWidth: contentWidth * 0.8,
    fontFamily: typography.headerFont,
    fontWeight: typography.headerWeight,
    tracking: typography.headerTracking,
    size: size * 0.035
  });

  const subheaderFit = fitSmallText({
    ctx,
    text: cover.subheader || "",
    maxWidth: contentWidth * 0.8,
    fontFamily: typography.subheaderFont,
    fontWeight: typography.subheaderWeight,
    tracking: typography.subheaderTracking,
    size: size * 0.03
  });

  const titleLines = titleFit.lines;
  const titleLineHeight = titleFit.size * 1.1;
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const headerOffset = cover.header ? headerFit.size * 1.6 : 0;
  const subheaderOffset = cover.subheader ? subheaderFit.size * 1.6 : 0;
  const centerY = size / 2;
  let cursorY = centerY - titleBlockHeight / 2;

  if (cover.header) {
    ctx.font = `${typography.headerWeight} ${headerFit.size}px ${typography.headerFont}`;
    ctx.fillText(cover.header.toUpperCase(), size / 2, cursorY - headerOffset);
  }

  ctx.font = `${typography.titleWeight} ${titleFit.size}px ${typography.titleFont}`;
  titleLines.forEach((line) => {
    ctx.fillText(line, size / 2, cursorY);
    cursorY += titleLineHeight;
  });

  if (cover.subheader) {
    ctx.font = `${typography.subheaderWeight} ${subheaderFit.size}px ${typography.subheaderFont}`;
    ctx.fillText(cover.subheader.toUpperCase(), size / 2, cursorY + subheaderOffset - titleLineHeight * 0.3);
  }

  return {
    titleWarning: titleFit.warning,
    headerWarning: headerFit.warning,
    subheaderWarning: subheaderFit.warning
  };
}

export function clearRenderCache() {
  placementCache.clear();
}

export function getShapeOptions() {
  return SHAPES;
}
