export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

export function rgbToHex({ r, g, b }) {
  const toHex = (val) => val.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h, s, l };
}

export function hslToRgb({ h, s, l }) {
  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }
  const hue2rgb = (p, q, t) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function adjustHsl(hex, { h = 0, s = 0, l = 0 }) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return rgbToHex({
    ...hslToRgb({
      h: (hsl.h + h + 1) % 1,
      s: clamp(hsl.s + s, 0, 1),
      l: clamp(hsl.l + l, 0, 1)
    })
  });
}

export function generatePaletteFromPrimary(primaryHex) {
  const base = rgbToHsl(hexToRgb(primaryHex));
  const accent1 = adjustHsl(primaryHex, { h: 0.08, s: -0.1, l: 0.08 });
  const accent2 = adjustHsl(primaryHex, { h: -0.08, s: 0.05, l: 0.12 });
  const secondary = adjustHsl(primaryHex, { s: -0.2, l: 0.2 });
  return {
    name: "Custom Palette",
    roles: {
      primary: primaryHex,
      secondary,
      accent1,
      accent2,
      neutral: "#F2F2F2"
    },
    method: "auto-hsl"
  };
}

export function sanitizeFilename(name) {
  return name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 80);
}
