export function generatePatternElements({
  size,
  pattern,
  random
}) {
  const elements = [];
  const spacing = size * pattern.gridSpacing;
  const margin = size * pattern.marginPct;
  const cols = Math.floor((size - margin * 2) / spacing);
  const rows = Math.floor((size - margin * 2) / spacing);
  const safeZone = {
    x: size * 0.5,
    y: size * 0.5,
    width: size * pattern.safeZoneWidthPct,
    height: size * pattern.safeZoneHeightPct
  };

  const pushElement = (x, y, jitterScale = 1) => {
    const jitterX = (random() - 0.5) * spacing * pattern.jitter * jitterScale;
    const jitterY = (random() - 0.5) * spacing * pattern.jitter * jitterScale;
    const posX = x + jitterX;
    const posY = y + jitterY;
    const dx = Math.abs(posX - safeZone.x);
    const dy = Math.abs(posY - safeZone.y);
    const safeX = dx / (safeZone.width / 2);
    const safeY = dy / (safeZone.height / 2);
    const safeStrength = Math.max(safeX, safeY);
    const falloff = Math.min(1, Math.max(0, (safeStrength - 1) / pattern.safeZoneFalloff));
    if (random() < falloff) {
      elements.push({ x: posX, y: posY });
    }
  };

  if (pattern.mode === "Radial Scatter") {
    const count = Math.floor(cols * rows * pattern.density * 0.6);
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * (size / 2 - margin);
      const x = size / 2 + Math.cos(angle) * radius;
      const y = size / 2 + Math.sin(angle) * radius;
      pushElement(x, y, 1.2);
    }
    return elements;
  }

  for (let row = 0; row <= rows; row += 1) {
    for (let col = 0; col <= cols; col += 1) {
      if (random() > pattern.density) continue;
      let x = margin + col * spacing;
      let y = margin + row * spacing;

      if (pattern.mode === "Offset Grid" || pattern.mode === "Isometric-ish") {
        const offset = (row % 2) * spacing * 0.5;
        x += offset;
      }

      if (pattern.mode === "Diagonal Drift") {
        x += row * spacing * 0.12;
        y += col * spacing * 0.08;
      }

      if (pattern.mode === "Border Band") {
        const edgeBias = Math.min(
          x / size,
          y / size,
          (size - x) / size,
          (size - y) / size
        );
        if (edgeBias > 0.25) continue;
      }

      pushElement(x, y);
    }
  }

  return elements;
}
