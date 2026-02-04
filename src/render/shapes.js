export const SHAPE_TYPES = [
  'circle',
  'square',
  'rounded-square',
  'rectangle',
  'triangle',
  'right-triangle',
  'diamond',
  'pentagon',
  'hexagon',
  'octagon',
  'star',
  'plus',
  'x',
  'line',
  'arc',
  'ring',
  'half-circle',
];

function drawPolygon(ctx, sides, radius) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawShape(ctx, type, x, y, size, rotation, color, strokeWidth = 2, filled = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const half = size / 2;

  switch (type) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, half, 0, Math.PI * 2);
      break;
    case 'ring':
      ctx.beginPath();
      ctx.arc(0, 0, half, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(1, strokeWidth * 1.5);
      ctx.stroke();
      ctx.restore();
      return;
    case 'square':
      ctx.beginPath();
      ctx.rect(-half, -half, size, size);
      break;
    case 'rounded-square': {
      const r = size * 0.2;
      ctx.beginPath();
      ctx.moveTo(-half + r, -half);
      ctx.lineTo(half - r, -half);
      ctx.quadraticCurveTo(half, -half, half, -half + r);
      ctx.lineTo(half, half - r);
      ctx.quadraticCurveTo(half, half, half - r, half);
      ctx.lineTo(-half + r, half);
      ctx.quadraticCurveTo(-half, half, -half, half - r);
      ctx.lineTo(-half, -half + r);
      ctx.quadraticCurveTo(-half, -half, -half + r, -half);
      break;
    }
    case 'rectangle':
      ctx.beginPath();
      ctx.rect(-half, -half / 1.5, size, size / 1.5);
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, -half);
      ctx.lineTo(half, half);
      ctx.lineTo(-half, half);
      ctx.closePath();
      break;
    case 'right-triangle':
      ctx.beginPath();
      ctx.moveTo(-half, -half);
      ctx.lineTo(half, half);
      ctx.lineTo(-half, half);
      ctx.closePath();
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(0, -half);
      ctx.lineTo(half, 0);
      ctx.lineTo(0, half);
      ctx.lineTo(-half, 0);
      ctx.closePath();
      break;
    case 'pentagon':
      drawPolygon(ctx, 5, half);
      break;
    case 'hexagon':
      drawPolygon(ctx, 6, half);
      break;
    case 'octagon':
      drawPolygon(ctx, 8, half);
      break;
    case 'star': {
      ctx.beginPath();
      const spikes = 5;
      const outer = half;
      const inner = half * 0.5;
      for (let i = 0; i < spikes * 2; i += 1) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI * i) / spikes - Math.PI / 2;
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      ctx.closePath();
      break;
    }
    case 'plus': {
      const w = half * 0.35;
      ctx.beginPath();
      ctx.rect(-w, -half, w * 2, size);
      ctx.rect(-half, -w, size, w * 2);
      break;
    }
    case 'x': {
      ctx.rotate(Math.PI / 4);
      const w = half * 0.25;
      ctx.beginPath();
      ctx.rect(-w, -half, w * 2, size);
      ctx.rect(-half, -w, size, w * 2);
      break;
    }
    case 'line':
      ctx.beginPath();
      ctx.moveTo(-half, 0);
      ctx.lineTo(half, 0);
      ctx.lineWidth = Math.max(1, strokeWidth * 1.2);
      ctx.stroke();
      ctx.restore();
      return;
    case 'arc':
      ctx.beginPath();
      ctx.arc(0, 0, half, Math.PI * 0.1, Math.PI * 1.3);
      ctx.lineWidth = Math.max(1, strokeWidth * 1.2);
      ctx.stroke();
      ctx.restore();
      return;
    case 'half-circle':
      ctx.beginPath();
      ctx.arc(0, 0, half, Math.PI, Math.PI * 2);
      ctx.closePath();
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, half, 0, Math.PI * 2);
  }

  if (filled) ctx.fill();
  else ctx.stroke();
  ctx.restore();
}
