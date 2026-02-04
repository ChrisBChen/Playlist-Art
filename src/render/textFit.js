export function measureTextWidth(ctx, text) {
  return ctx.measureText(text).width;
}

export function fitText({
  ctx,
  text,
  maxWidth,
  baseSize,
  minSize,
  maxLines = 2,
  tracking = 0,
}) {
  let size = baseSize;
  let lines = [text];
  const getWidth = (line) => measureTextWidth(ctx, line) + tracking * line.length * size;

  const splitText = (value) => {
    const words = value.split(' ');
    if (words.length === 1) {
      return [value];
    }
    const midpoint = Math.ceil(words.length / 2);
    return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')];
  };

  while (size >= minSize) {
    ctx.font = `${size}px ${ctx.font.split(' ').slice(1).join(' ')}`;
    lines = [text];
    if (getWidth(text) > maxWidth && maxLines > 1) {
      lines = splitText(text);
    }
    const tooWide = lines.some((line) => getWidth(line) > maxWidth);
    if (!tooWide) {
      return { size, lines, tooSmall: false };
    }
    size -= 8;
  }

  return { size: minSize, lines, tooSmall: true };
}

export function drawTextLines({
  ctx,
  lines,
  x,
  y,
  lineHeight,
  tracking,
  align = 'center',
}) {
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  lines.forEach((line, index) => {
    const offset = (index - (lines.length - 1) / 2) * lineHeight;
    if (tracking) {
      drawTextWithTracking(ctx, line, x, y + offset, tracking);
    } else {
      ctx.fillText(line, x, y + offset);
    }
  });
}

function drawTextWithTracking(ctx, text, x, y, tracking) {
  const chars = Array.from(text);
  const totalWidth = chars.reduce((sum, char) => sum + ctx.measureText(char).width, 0);
  const sizeMatch = ctx.font.match(/(\d+(?:\.\d+)?)px/);
  const fontSize = sizeMatch ? parseFloat(sizeMatch[1]) : 16;
  const spacing = tracking * fontSize;
  let currentX = x - totalWidth / 2 - (spacing * (chars.length - 1)) / 2;
  chars.forEach((char) => {
    ctx.fillText(char, currentX, y);
    currentX += ctx.measureText(char).width + spacing;
  });
}
