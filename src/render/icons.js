import { ICON_CATEGORIES } from "../../assets/icons/icons.js";

export function flattenIcons(enabledCategories) {
  return enabledCategories.flatMap((category) => ICON_CATEGORIES[category] || []);
}

export function getIconPath(icon) {
  return new Path2D(icon.path);
}

export function drawIcon(ctx, icon, x, y, size, rotation, style, strokeWidth = 2) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const scale = size / 24;
  ctx.scale(scale, scale);
  ctx.translate(-12, -12);
  if (style === "stroke") {
    ctx.lineWidth = strokeWidth;
    ctx.stroke(getIconPath(icon));
  } else {
    ctx.fill(getIconPath(icon));
  }
  ctx.restore();
}

export function listIconCategories() {
  return Object.keys(ICON_CATEGORIES);
}

export function listIconsForCategory(category) {
  return ICON_CATEGORIES[category] || [];
}
