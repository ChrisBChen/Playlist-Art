export function fitTitle(ctx, text, maxWidth, maxLines = 2) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || current === "") {
      current = test;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) {
    return lines;
  }
  return [text];
}

export function shrinkToFit(ctx, text, maxWidth, baseSize, minSize = 48) {
  let size = baseSize;
  ctx.font = `${size}px ${ctx.font.split(" ").slice(1).join(" ")}`;
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 4;
    ctx.font = `${size}px ${ctx.font.split(" ").slice(1).join(" ")}`;
  }
  return size;
}
