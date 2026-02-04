import { randomBetween, pickRandom } from '../utils/seed.js';

export const patternModes = [
  'Tiled Grid',
  'Offset Grid',
  'Diagonal Drift',
  'Radial Scatter',
  'Isometric-ish',
  'Border Band',
];

export function generatePatternElements({
  rng,
  mode,
  size,
  density,
  elementScale,
  safeZone,
  marginPct,
}) {
  const elements = [];
  const margin = size * marginPct;
  const available = size - margin * 2;
  const baseSpacing = (size / 8) * (1 / density);
  const gridCount = Math.ceil(available / baseSpacing);
  const jitter = baseSpacing * 0.25;

  const isInSafeZone = (x, y) => {
    const cx = size / 2;
    const cy = size / 2;
    const dx = Math.abs(x - cx) / (size * safeZone.width);
    const dy = Math.abs(y - cy) / (size * safeZone.height);
    const dist = Math.max(dx, dy);
    return dist < 0.5;
  };

  const safeFalloff = (x, y) => {
    const cx = size / 2;
    const cy = size / 2;
    const dx = Math.abs(x - cx) / (size * safeZone.width);
    const dy = Math.abs(y - cy) / (size * safeZone.height);
    const dist = Math.max(dx, dy);
    if (dist < 0.5) {
      return 0.2;
    }
    if (dist < 0.75) {
      return 0.4;
    }
    return 1;
  };

  const pushElement = (x, y, scaleMultiplier = 1) => {
    const falloff = safeFalloff(x, y);
    if (rng() > falloff) {
      return;
    }
    elements.push({
      x,
      y,
      size: baseSpacing * elementScale * scaleMultiplier,
      rotation: randomBetween(rng, -Math.PI, Math.PI),
    });
  };

  if (mode === 'Radial Scatter') {
    const count = Math.floor(gridCount * gridCount * density * 0.35);
    for (let i = 0; i < count; i += 1) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.sqrt(rng()) * (size / 2 - margin);
      const bias = 0.7 + rng() * 0.6;
      const x = size / 2 + Math.cos(angle) * radius * bias;
      const y = size / 2 + Math.sin(angle) * radius * bias;
      if (isInSafeZone(x, y) && rng() < 0.6) {
        continue;
      }
      pushElement(x, y, 0.8 + rng() * 0.6);
    }
  } else if (mode === 'Border Band') {
    const bandCount = Math.floor(gridCount * gridCount * density * 0.3);
    for (let i = 0; i < bandCount; i += 1) {
      const edge = pickRandom(rng, ['top', 'bottom', 'left', 'right']);
      const offset = rng() * available + margin;
      const depth = margin * 0.5 + rng() * margin;
      let x = offset;
      let y = offset;
      if (edge === 'top') {
        y = margin + depth * 0.3;
      } else if (edge === 'bottom') {
        y = size - margin - depth * 0.3;
      } else if (edge === 'left') {
        x = margin + depth * 0.3;
      } else {
        x = size - margin - depth * 0.3;
      }
      pushElement(x, y, 0.7 + rng() * 0.5);
    }
  } else {
    for (let row = 0; row <= gridCount; row += 1) {
      for (let col = 0; col <= gridCount; col += 1) {
        let x = margin + col * baseSpacing;
        let y = margin + row * baseSpacing;
        if (mode === 'Offset Grid' || mode === 'Isometric-ish') {
          const offset = (row % 2) * baseSpacing * 0.5;
          x += offset;
        }
        if (mode === 'Diagonal Drift') {
          x += row * baseSpacing * 0.15;
        }
        x += randomBetween(rng, -jitter, jitter);
        y += randomBetween(rng, -jitter, jitter);
        if (x < margin || x > size - margin || y < margin || y > size - margin) {
          continue;
        }
        if (mode === 'Isometric-ish') {
          y += col * baseSpacing * 0.15;
        }
        pushElement(x, y, 0.8 + rng() * 0.5);
      }
    }
  }

  return elements;
}
