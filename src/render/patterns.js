import { range } from '../utils/seed.js';

export const PATTERN_MODES = [
  'Tiled Grid',
  'Offset Grid',
  'Diagonal Drift',
  'Radial Scatter',
  'Isometric-ish',
  'Border Band',
];

export function generatePatternLayout({
  rng,
  size,
  density,
  elementScale,
  rotationVariance,
  safeZone,
  marginPct,
  patternMode,
}) {
  const elements = [];
  const margin = size * marginPct;
  const areaSize = size - margin * 2;
  const baseSpacing = size * (0.12 - density * 0.04);
  const gridCount = Math.max(6, Math.floor(areaSize / baseSpacing));
  const spacing = areaSize / gridCount;

  const safeX = size / 2 - size * safeZone.width / 2;
  const safeY = size / 2 - size * safeZone.height / 2;
  const safeW = size * safeZone.width;
  const safeH = size * safeZone.height;

  const addElement = (x, y) => {
    const distX = Math.max(0, Math.abs(x - size / 2) - safeW / 2);
    const distY = Math.max(0, Math.abs(y - size / 2) - safeH / 2);
    const dist = Math.sqrt(distX * distX + distY * distY);
    const falloff = Math.min(1, dist / (size * safeZone.falloff));
    if (rng() > falloff) return;
    const rotation = range(rng, -rotationVariance, rotationVariance);
    const scale = size * (0.03 + elementScale * 0.04) * range(rng, 0.7, 1.2);
    elements.push({
      x,
      y,
      size: scale,
      rotation,
    });
  };

  if (patternMode === 'Radial Scatter') {
    const count = Math.floor(gridCount * gridCount * (density + 0.2));
    for (let i = 0; i < count; i += 1) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.sqrt(rng()) * areaSize * 0.5;
      const x = size / 2 + Math.cos(angle) * radius;
      const y = size / 2 + Math.sin(angle) * radius;
      addElement(x, y);
    }
  } else if (patternMode === 'Border Band') {
    const bandThickness = size * 0.2;
    for (let row = 0; row <= gridCount; row += 1) {
      for (let col = 0; col <= gridCount; col += 1) {
        const x = margin + col * spacing + range(rng, -spacing * 0.15, spacing * 0.15);
        const y = margin + row * spacing + range(rng, -spacing * 0.15, spacing * 0.15);
        const inBand =
          y < margin + bandThickness || y > size - margin - bandThickness || x < margin + bandThickness || x > size - margin - bandThickness;
        if (inBand) addElement(x, y);
      }
    }
  } else {
    for (let row = 0; row <= gridCount; row += 1) {
      for (let col = 0; col <= gridCount; col += 1) {
        let x = margin + col * spacing;
        let y = margin + row * spacing;
        if (patternMode === 'Offset Grid') {
          x += (row % 2) * spacing * 0.4;
        }
        if (patternMode === 'Diagonal Drift') {
          x += row * spacing * 0.1;
          y += col * spacing * 0.05;
        }
        if (patternMode === 'Isometric-ish') {
          x += (row % 2) * spacing * 0.5;
          y += row * spacing * 0.3;
        }
        x += range(rng, -spacing * 0.2, spacing * 0.2);
        y += range(rng, -spacing * 0.2, spacing * 0.2);
        addElement(x, y);
      }
    }
  }

  return elements;
}
