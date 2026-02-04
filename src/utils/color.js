const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function hexToRgb(hex) {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function rgbToHex({ r, g, b }) {
  return (
    '#' +
    [r, g, b]
      .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function rgbToHsl({ r, g, b }) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  if (sNorm === 0) {
    const grey = Math.round(lNorm * 255);
    return { r: grey, g: grey, b: grey };
  }

  const hue2rgb = (p, q, t) => {
    let tMod = t;
    if (tMod < 0) tMod += 1;
    if (tMod > 1) tMod -= 1;
    if (tMod < 1 / 6) return p + (q - p) * 6 * tMod;
    if (tMod < 1 / 2) return q;
    if (tMod < 2 / 3) return p + (q - p) * (2 / 3 - tMod) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

export const PALETTE_PRESETS = [
  {
    name: 'Mono + Neon Accent',
    roles: {
      primary: '#39ffb8',
      secondary: '#2c2c2c',
      accent1: '#8dfcff',
      accent2: '#ffffff',
      neutral: '#f2f2f2',
    },
  },
  {
    name: 'Mono + Warm Accent',
    roles: {
      primary: '#ff8c5a',
      secondary: '#2b2b2b',
      accent1: '#ffb86b',
      accent2: '#ffd3c2',
      neutral: '#f2f2f2',
    },
  },
  {
    name: 'Mono + Cool Accent',
    roles: {
      primary: '#6bb6ff',
      secondary: '#303030',
      accent1: '#b3d7ff',
      accent2: '#89f3ff',
      neutral: '#f2f2f2',
    },
  },
  {
    name: 'Mono + Two-tone Accents',
    roles: {
      primary: '#f15bb5',
      secondary: '#1f1f1f',
      accent1: '#00bbf9',
      accent2: '#fee440',
      neutral: '#f2f2f2',
    },
  },
  {
    name: 'Grayscale + Bold Primary',
    roles: {
      primary: '#f15a24',
      secondary: '#2a2a2a',
      accent1: '#cfcfcf',
      accent2: '#ffffff',
      neutral: '#f2f2f2',
    },
  },
];

export function buildPaletteFromPrimary(primaryHex) {
  const primaryHsl = rgbToHsl(hexToRgb(primaryHex));
  const accent1 = hslToRgb({
    h: (primaryHsl.h + 25) % 360,
    s: clamp(primaryHsl.s, 45, 70),
    l: clamp(primaryHsl.l + 12, 55, 75),
  });
  const accent2 = hslToRgb({
    h: (primaryHsl.h + 190) % 360,
    s: clamp(primaryHsl.s - 10, 35, 65),
    l: clamp(primaryHsl.l + 5, 50, 70),
  });

  return {
    name: 'Custom Palette',
    roles: {
      primary: primaryHex,
      secondary: '#2b2b2b',
      accent1: rgbToHex(accent1),
      accent2: rgbToHex(accent2),
      neutral: '#f2f2f2',
    },
  };
}

export function paletteToList(palette) {
  return Object.values(palette.roles);
}
