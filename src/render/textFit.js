function measureLine(ctx, text, tracking) {
  const metrics = ctx.measureText(text);
  const extra = tracking ? tracking * (text.length - 1) : 0;
  return metrics.width + extra;
}

function wrapText(ctx, text, maxWidth, tracking) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (measureLine(ctx, test, tracking) <= maxWidth || !current) {
      current = test;
    } else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines;
}

export function fitText({
  ctx,
  text,
  maxWidth,
  maxLines = 2,
  baseSize,
  fontFamily,
  fontWeight = 600,
  tracking = 0,
  minSize = 40,
}) {
  let fontSize = baseSize;
  let lines = [];
  while (fontSize >= minSize) {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    lines = wrapText(ctx, text, maxWidth, tracking);
    if (lines.length <= maxLines) {
      const longest = Math.max(...lines.map((line) => measureLine(ctx, line, tracking)));
      if (longest <= maxWidth) break;
    }
    fontSize -= 10;
  }

  return { fontSize, lines, tooSmall: fontSize <= minSize + 5 };
}

export function drawTextLines({
  ctx,
  lines,
  x,
  y,
  lineHeight,
  tracking = 0,
  color,
  align = 'center',
}) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  lines.forEach((line, index) => {
    const offsetY = y + index * lineHeight;
    if (tracking) {
      let currentX = x - (measureLine(ctx, line, tracking) / 2);
      line.split('').forEach((char) => {
        ctx.fillText(char, currentX, offsetY);
        currentX += ctx.measureText(char).width + tracking;
      });
    } else {
      ctx.fillText(line, x, offsetY);
    }
  });
}
