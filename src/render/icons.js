export const ICON_CATEGORIES = {
  music: ['music', 'headphones', 'equalizer', 'mic'],
  fitness: ['dumbbell', 'activity', 'flame', 'zap', 'heart'],
  general: ['sun', 'moon', 'cloud', 'sparkles', 'bolt', 'arrow', 'check', 'dot'],
  arrows: ['arrow', 'arrow-turn', 'chevron'],
  abstract: ['sparkles', 'orbit', 'dot', 'grid'],
};

export const ICONS = {
  music: 'M9 4v12.5a2.5 2.5 0 1 1-1.5-2.3V6.1l8-2v9.4a2.5 2.5 0 1 1-1.5-2.3V4.5L9 6z',
  headphones: 'M6 16v-2a6 6 0 0 1 12 0v2M5 16a2 2 0 0 0 2 2h1v-4H7a2 2 0 0 0-2 2zm14 0a2 2 0 0 1-2 2h-1v-4h1a2 2 0 0 1 2 2z',
  equalizer: 'M6 18V6m6 12V4m6 14V9',
  mic: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zm0 14v4m-4 0h8',
  dumbbell: 'M4 10v4m16-4v4M6 8h2v8H6zm10 0h2v8h-2zM8 12h8',
  activity: 'M4 12h4l2-5 4 10 2-5h4',
  flame: 'M12 3c2 3 3 5 3 7a3 3 0 1 1-6 0c0-2 1-4 3-7z',
  zap: 'M13 2L3 14h7l-1 8 10-12h-7z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z',
  sun: 'M12 4v2m0 12v2m8-8h-2M6 12H4m12.95-5.95-1.4 1.4M7.45 16.55l-1.4 1.4m0-11.1 1.4 1.4m9.1 9.1 1.4 1.4M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
  moon: 'M20 12.5A7.5 7.5 0 1 1 11.5 4a6 6 0 0 0 8.5 8.5z',
  cloud: 'M7 18h8a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.5 1.5A3.5 3.5 0 0 0 7 18z',
  sparkles: 'M12 3l1.6 3.6L17 8l-3.4 1.4L12 13l-1.6-3.6L7 8l3.4-1.4z',
  bolt: 'M13 3 4 14h6l-1 7 9-11h-6z',
  arrow: 'M4 12h16M14 6l6 6-6 6',
  'arrow-turn': 'M16 7l-4-4-4 4m4-4v12',
  chevron: 'M6 9l6 6 6-6',
  check: 'M5 13l4 4L19 7',
  dot: 'M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  orbit: 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  grid: 'M5 5h4v4H5zm10 0h4v4h-4zM5 15h4v4H5zm10 0h4v4h-4z',
};

export function drawIcon(ctx, iconName, x, y, size, color, strokeWidth = 2, filled = false) {
  const pathData = ICONS[iconName];
  if (!pathData) return;
  const path = new Path2D(pathData);
  const scale = size / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.translate(-12, -12);
  ctx.lineWidth = strokeWidth / scale;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (filled) {
    ctx.fill(path);
  } else {
    ctx.stroke(path);
  }
  ctx.restore();
}
