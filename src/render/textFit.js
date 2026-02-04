function measureTextWidth(ctx, text) {
  return ctx.measureText(text).width;
}

function splitTitle(text) {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return [text];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function fitTitleText({
  ctx,
  text,
  maxWidth,
  fontFamily,
  fontWeight,
  tracking,
  minSize,
  maxSize
}) {
  let size = maxSize;
  let lines = [text];
  while (size >= minSize) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    const widths = lines.map((line) => measureTextWidth(ctx, line) + line.length * tracking * size);
    const widest = Math.max(...widths);
    if (widest <= maxWidth) {
      return { size, lines, warning: false };
    }
    if (lines.length === 1) {
      lines = splitTitle(text);
    } else {
      size -= 12;
    }
  }
  return { size: minSize, lines, warning: true };
}

export function fitSmallText({ ctx, text, maxWidth, fontFamily, fontWeight, tracking, size }) {
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  const width = measureTextWidth(ctx, text) + text.length * tracking * size;
  if (width <= maxWidth) {
    return { size, warning: false };
  }
  let nextSize = size;
  while (nextSize > 12) {
    nextSize -= 2;
    ctx.font = `${fontWeight} ${nextSize}px ${fontFamily}`;
    const nextWidth = measureTextWidth(ctx, text) + text.length * tracking * nextSize;
    if (nextWidth <= maxWidth) {
      return { size: nextSize, warning: false };
    }
  }
  return { size: nextSize, warning: true };
}
