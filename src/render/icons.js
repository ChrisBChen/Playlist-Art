import { iconData } from '../../assets/icons/icon-data.js';

const iconPathCache = new Map();

export function getIconList() {
  return Object.entries(iconData).map(([id, data]) => ({ id, ...data }));
}

export function getIconsByCategory(categoryIds) {
  return Object.entries(iconData)
    .filter(([, data]) => categoryIds.includes(data.category))
    .map(([id, data]) => ({ id, ...data }));
}

export function drawIcon(ctx, iconId, size, stroke = true) {
  const icon = iconData[iconId];
  if (!icon) {
    return;
  }
  let path = iconPathCache.get(iconId);
  if (!path) {
    path = new Path2D(icon.path);
    iconPathCache.set(iconId, path);
  }
  const scale = size / 24;
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-12, -12);
  if (stroke) {
    ctx.stroke(path);
  } else {
    ctx.fill(path);
  }
  ctx.restore();
}
