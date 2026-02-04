import { clamp } from "../utils/color.js";

export function generatePattern({
  rng,
  mode,
  width,
  height,
  density,
  size,
  rotationVariance,
  marginPct,
  safeZoneWidthPct,
  safeZoneHeightPct,
  safeZoneFalloff,
  borderPaddingPct
}) {
  const margin = width * marginPct;
  const safeWidth = width * safeZoneWidthPct;
  const safeHeight = height * safeZoneHeightPct;
  const centerX = width / 2;
  const centerY = height / 2;
  const items = [];

  const cols = Math.floor(Math.sqrt(density * 1.6));
  const rows = Math.floor(density / Math.max(cols, 1));
  const spacingX = (width - margin * 2) / Math.max(cols, 1);
  const spacingY = (height - margin * 2) / Math.max(rows, 1);

  const isInSafeZone = (x, y) => {
    const dx = Math.abs(x - centerX) / (safeWidth / 2);
    const dy = Math.abs(y - centerY) / (safeHeight / 2);
    return dx <= 1 && dy <= 1;
  };

  const safeZoneFactor = (x, y) => {
    if (!isInSafeZone(x, y)) return 1;
    const dx = Math.abs(x - centerX) / (safeWidth / 2);
    const dy = Math.abs(y - centerY) / (safeHeight / 2);
    const dist = Math.max(dx, dy);
    return clamp((dist - safeZoneFalloff) / (1 - safeZoneFalloff), 0.1, 0.7);
  };

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      let x = margin + col * spacingX + spacingX / 2;
      let y = margin + row * spacingY + spacingY / 2;
      if (mode === "offset" && row % 2 === 1) {
        x += spacingX * 0.35;
      }
      if (mode === "diagonal") {
        x += row * spacingX * 0.12;
        y += col * spacingY * 0.08;
      }
      if (mode === "isometric") {
        x += row * spacingX * 0.2;
      }
      const jitter = (mode === "tiled" || mode === "offset") ? 0.2 : 0.35;
      x += (rng() - 0.5) * spacingX * jitter;
      y += (rng() - 0.5) * spacingY * jitter;
      if (mode === "radial") {
        const angle = rng() * Math.PI * 2;
        const radius = (Math.max(width, height) * 0.5) * Math.pow(rng(), 0.7);
        x = centerX + Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * radius;
      }
      if (mode === "border") {
        const edge = rng();
        const padding = width * borderPaddingPct;
        if (edge < 0.5) {
          y = rng() < 0.5 ? margin + padding : height - margin - padding;
          x = margin + rng() * (width - margin * 2);
        } else {
          x = rng() < 0.5 ? margin + padding : width - margin - padding;
          y = margin + rng() * (height - margin * 2);
        }
      }
      const safeFactor = safeZoneFactor(x, y);
      if (rng() > safeFactor) {
        continue;
      }
      items.push({
        x,
        y,
        size: size * (0.7 + rng() * 0.6),
        rotation: (rng() - 0.5) * Math.PI * 2 * rotationVariance,
        weight: rng()
      });
    }
  }
  return items;
}
