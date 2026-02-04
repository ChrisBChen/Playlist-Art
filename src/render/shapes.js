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

export function drawShape(ctx, shape, x, y, size, rotation = 0, stroke = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  const half = size / 2;
  switch (shape) {
    case "circle":
      ctx.arc(0, 0, half, 0, Math.PI * 2);
      break;
    case "square":
      ctx.rect(-half, -half, size, size);
      break;
    case "rounded-square":
      roundedRect(ctx, -half, -half, size, size, size * 0.2);
      break;
    case "rectangle":
      ctx.rect(-half, -half * 0.6, size, size * 0.6);
      break;
    case "triangle":
      polygon(ctx, 3, half);
      break;
    case "right-triangle":
      ctx.moveTo(-half, -half);
      ctx.lineTo(half, 0);
      ctx.lineTo(-half, half);
      ctx.closePath();
      break;
    case "diamond":
      ctx.moveTo(0, -half);
      ctx.lineTo(half, 0);
      ctx.lineTo(0, half);
      ctx.lineTo(-half, 0);
      ctx.closePath();
      break;
    case "pentagon":
      polygon(ctx, 5, half);
      break;
    case "hexagon":
      polygon(ctx, 6, half);
      break;
    case "octagon":
      polygon(ctx, 8, half);
      break;
    case "star":
      star(ctx, 5, half, half * 0.5);
      break;
    case "plus":
      drawPlus(ctx, size);
      break;
    case "x":
      drawX(ctx, size);
      break;
    case "line":
      ctx.moveTo(-half, 0);
      ctx.lineTo(half, 0);
      break;
    case "arc":
      ctx.arc(0, 0, half, 0, Math.PI);
      break;
    case "ring":
      ctx.arc(0, 0, half, 0, Math.PI * 2);
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, half * 0.6, 0, Math.PI * 2);
      break;
    case "half-circle":
      ctx.arc(0, 0, half, 0, Math.PI, true);
      break;
    default:
      ctx.arc(0, 0, half, 0, Math.PI * 2);
  }
  if (stroke) {
    ctx.stroke();
  } else {
    ctx.fill();
  }
  ctx.restore();
}

function polygon(ctx, sides, radius) {
  for (let i = 0; i < sides; i += 1) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

function star(ctx, points, outerRadius, innerRadius) {
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawPlus(ctx, size) {
  const thickness = size * 0.2;
  ctx.rect(-thickness / 2, -size / 2, thickness, size);
  ctx.rect(-size / 2, -thickness / 2, size, thickness);
}

function drawX(ctx, size) {
  const thickness = size * 0.18;
  ctx.rotate(Math.PI / 4);
  ctx.rect(-thickness / 2, -size / 2, thickness, size);
  ctx.rotate(Math.PI / 2);
  ctx.rect(-thickness / 2, -size / 2, thickness, size);
}
