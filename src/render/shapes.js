export const shapeTypes = [
  'circle',
  'square',
  'roundedSquare',
  'rectangle',
  'triangle',
  'rightTriangle',
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
  'halfCircle',
];

function polygon(ctx, sides, radius) {
  const angle = (Math.PI * 2) / sides;
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const x = Math.cos(angle * i - Math.PI / 2) * radius;
    const y = Math.sin(angle * i - Math.PI / 2) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

export function drawShape(ctx, type, size, filled = true) {
  const radius = size / 2;
  ctx.beginPath();
  switch (type) {
    case 'circle':
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(-radius, -radius, size, size);
      break;
    case 'roundedSquare': {
      const r = size * 0.2;
      ctx.moveTo(-radius + r, -radius);
      ctx.lineTo(radius - r, -radius);
      ctx.quadraticCurveTo(radius, -radius, radius, -radius + r);
      ctx.lineTo(radius, radius - r);
      ctx.quadraticCurveTo(radius, radius, radius - r, radius);
      ctx.lineTo(-radius + r, radius);
      ctx.quadraticCurveTo(-radius, radius, -radius, radius - r);
      ctx.lineTo(-radius, -radius + r);
      ctx.quadraticCurveTo(-radius, -radius, -radius + r, -radius);
      break;
    }
    case 'rectangle':
      ctx.rect(-radius, -radius * 0.6, size, size * 1.2);
      break;
    case 'triangle':
      polygon(ctx, 3, radius);
      break;
    case 'rightTriangle':
      ctx.moveTo(-radius, radius);
      ctx.lineTo(radius, radius);
      ctx.lineTo(-radius, -radius);
      ctx.closePath();
      break;
    case 'diamond':
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius, 0);
      ctx.lineTo(0, radius);
      ctx.lineTo(-radius, 0);
      ctx.closePath();
      break;
    case 'pentagon':
      polygon(ctx, 5, radius);
      break;
    case 'hexagon':
      polygon(ctx, 6, radius);
      break;
    case 'octagon':
      polygon(ctx, 8, radius);
      break;
    case 'star': {
      const spikes = 5;
      const outer = radius;
      const inner = radius * 0.45;
      let rot = Math.PI / 2 * 3;
      const step = Math.PI / spikes;
      ctx.moveTo(0, -outer);
      for (let i = 0; i < spikes; i += 1) {
        ctx.lineTo(Math.cos(rot) * outer, Math.sin(rot) * outer);
        rot += step;
        ctx.lineTo(Math.cos(rot) * inner, Math.sin(rot) * inner);
        rot += step;
      }
      ctx.lineTo(0, -outer);
      ctx.closePath();
      break;
    }
    case 'plus': {
      const w = size * 0.2;
      ctx.rect(-w / 2, -radius, w, size);
      ctx.rect(-radius, -w / 2, size, w);
      break;
    }
    case 'x': {
      const w = size * 0.2;
      ctx.rotate(Math.PI / 4);
      ctx.rect(-w / 2, -radius, w, size);
      ctx.rect(-radius, -w / 2, size, w);
      break;
    }
    case 'line':
      ctx.moveTo(-radius, 0);
      ctx.lineTo(radius, 0);
      break;
    case 'arc':
      ctx.arc(0, 0, radius, 0, Math.PI * 1.2);
      break;
    case 'ring':
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.moveTo(0, -radius * 0.5);
      ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2, true);
      break;
    case 'halfCircle':
      ctx.arc(0, 0, radius, 0, Math.PI);
      break;
    default:
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
  }

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}
