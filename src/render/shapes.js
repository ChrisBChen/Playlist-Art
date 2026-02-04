export const SHAPES = [
  "circle",
  "square",
  "rounded-square",
  "rectangle",
  "triangle",
  "right-triangle",
  "diamond",
  "pentagon",
  "hexagon",
  "octagon",
  "star",
  "plus",
  "x",
  "line",
  "arc",
  "ring",
  "half-circle"
];

export function drawShape(ctx, { shape, x, y, size, rotation = 0, strokeOnly = false, lineWidth = 1 }) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  switch (shape) {
    case "circle":
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      break;
    case "square":
      ctx.rect(-size / 2, -size / 2, size, size);
      break;
    case "rounded-square": {
      const radius = size * 0.2;
      const offset = size / 2;
      ctx.moveTo(-offset + radius, -offset);
      ctx.arcTo(offset, -offset, offset, offset, radius);
      ctx.arcTo(offset, offset, -offset, offset, radius);
      ctx.arcTo(-offset, offset, -offset, -offset, radius);
      ctx.arcTo(-offset, -offset, offset, -offset, radius);
      break;
    }
    case "rectangle":
      ctx.rect(-size * 0.6, -size * 0.3, size * 1.2, size * 0.6);
      break;
    case "triangle":
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      break;
    case "right-triangle":
      ctx.moveTo(-size / 2, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      break;
    case "diamond":
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 2, 0);
      ctx.closePath();
      break;
    case "pentagon":
    case "hexagon":
    case "octagon": {
      const sides = shape === "pentagon" ? 5 : shape === "hexagon" ? 6 : 8;
      for (let i = 0; i < sides; i += 1) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const px = Math.cos(angle) * size * 0.5;
        const py = Math.sin(angle) * size * 0.5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case "star": {
      const spikes = 5;
      const outer = size / 2;
      const inner = size / 4;
      for (let i = 0; i < spikes * 2; i += 1) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI * i) / spikes - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case "plus":
      ctx.rect(-size * 0.1, -size * 0.5, size * 0.2, size);
      ctx.rect(-size * 0.5, -size * 0.1, size, size * 0.2);
      break;
    case "x":
      ctx.rotate(Math.PI / 4);
      ctx.rect(-size * 0.1, -size * 0.5, size * 0.2, size);
      ctx.rect(-size * 0.5, -size * 0.1, size, size * 0.2);
      break;
    case "line":
      ctx.rect(-size * 0.5, -size * 0.05, size, size * 0.1);
      break;
    case "arc":
      ctx.arc(0, 0, size / 2, 0, Math.PI * 1.2);
      break;
    case "ring":
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.arc(0, 0, size / 3, 0, Math.PI * 2, true);
      break;
    case "half-circle":
      ctx.arc(0, 0, size / 2, 0, Math.PI, true);
      ctx.closePath();
      break;
    default:
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  }
  if (strokeOnly) {
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  } else {
    ctx.fill();
  }
  ctx.restore();
}
