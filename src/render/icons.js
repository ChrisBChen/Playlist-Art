export const ICONS = [
  {
    id: "music-note",
    category: "music",
    path: "M6 3v12.5A2.5 2.5 0 1 0 8 18V8h8V3H6z"
  },
  {
    id: "equalizer",
    category: "music",
    path: "M4 6h2v12H4V6zm7 3h2v9h-2V9zm7-5h2v14h-2V4z"
  },
  {
    id: "headphones",
    category: "music",
    path: "M4 13v5h3v-5H4zm13 0v5h3v-5h-3zM4 11a8 8 0 1 1 16 0v1h-2v-1a6 6 0 1 0-12 0v1H4v-1z"
  },
  {
    id: "microphone",
    category: "music",
    path: "M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm5 9a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zm-6 9h2v2h-2v-2z"
  },
  {
    id: "dumbbell",
    category: "fitness",
    path: "M3 10h2v4H3v-4zm16 0h2v4h-2v-4zM7 8h2v8H7V8zm8 0h2v8h-2V8zM9 11h6v2H9v-2z"
  },
  {
    id: "flame",
    category: "fitness",
    path: "M12 2s2 3 2 5a2 2 0 0 1-4 0c0-2 2-5 2-5zm-4 9a4 4 0 1 0 8 0c0-2.5-2-4.5-4-6-2 1.5-4 3.5-4 6z"
  },
  {
    id: "heart-pulse",
    category: "fitness",
    path: "M12 20s-6-4.35-8-7.5C2.5 9 4.5 6 7.5 6c1.7 0 3 1 4.5 2.5C13.5 7 14.8 6 16.5 6 19.5 6 21.5 9 20 12.5 18 15.65 12 20 12 20zm-1-8h2l1 2 2-4 2 6h-2l-1-2-2 4-2-6-2 4H6l3-6 2 2z"
  },
  {
    id: "sparkles",
    category: "general",
    path: "M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zm6 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
  },
  {
    id: "sun",
    category: "general",
    path: "M12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0-4h2v3h-2V2zm0 17h2v3h-2v-3zM4 11h3v2H4v-2zm13 0h3v2h-3v-2zM5.6 5.6l2.1 2.1-1.4 1.4L4.2 7l1.4-1.4zm12.1 12.1l2.1 2.1-1.4 1.4-2.1-2.1 1.4-1.4zm0-12.1L20 7l-1.4 1.4-2.1-2.1 1.4-1.4zM5.6 18.4l1.4 1.4-2.1 2.1-1.4-1.4 2.1-2.1z"
  },
  {
    id: "moon",
    category: "general",
    path: "M14.5 2a8 8 0 1 0 7.5 11.5A9 9 0 1 1 14.5 2z"
  },
  {
    id: "arrow-right",
    category: "arrows",
    path: "M4 11h10.5L11 7.5 12.5 6 18 11.5 12.5 17 11 15.5 14.5 12H4v-1z"
  },
  {
    id: "arrow-up",
    category: "arrows",
    path: "M11 4v10.5L7.5 11 6 12.5 11.5 18 17 12.5 15.5 11 12 14.5V4h-1z"
  },
  {
    id: "grid",
    category: "abstract",
    path: "M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"
  },
  {
    id: "orbit",
    category: "abstract",
    path: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8-2c0 4-3.6 6.5-8 6.5S4 10 4 6s3.6-6.5 8-6.5 8 2.5 8 6.5zm0 12c0 4-3.6 6.5-8 6.5S4 22 4 18s3.6-6.5 8-6.5 8 2.5 8 6.5z"
  }
];

export function getIconsByCategories(categories) {
  return ICONS.filter((icon) => categories.includes(icon.category));
}

export function getIconById(id) {
  return ICONS.find((icon) => icon.id === id) || ICONS[0];
}

export function drawIcon(ctx, icon, x, y, size, stroke = true) {
  const path = new Path2D(icon.path);
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  const scale = size / 24;
  ctx.scale(scale, scale);
  if (stroke) {
    ctx.lineWidth = 1.6;
    ctx.stroke(path);
  } else {
    ctx.fill(path);
  }
  ctx.restore();
}
