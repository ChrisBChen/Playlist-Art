export function hexToHsl(hex) {
  const stripped = hex.replace('#', '');
  const bigint = parseInt(stripped, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

export function hslToHex({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toHex = (value) => {
    const hex = Math.round((value + m) * 255).toString(16).padStart(2, '0');
    return hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function adjustHsl(hex, adjustments) {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex({
    h: (h + (adjustments.h || 0) + 360) % 360,
    s: clamp(s + (adjustments.s || 0), 0, 1),
    l: clamp(l + (adjustments.l || 0), 0, 1),
  });
}

export function generatePaletteFromPrimary(primary) {
  const base = hexToHsl(primary);
  const accent = hslToHex({
    h: (base.h + 40) % 360,
    s: clamp(base.s + 0.1, 0.2, 0.7),
    l: clamp(base.l + 0.1, 0.35, 0.7),
  });
  const accent2 = hslToHex({
    h: (base.h + 220) % 360,
    s: clamp(base.s + 0.05, 0.15, 0.6),
    l: clamp(base.l + 0.15, 0.4, 0.75),
  });
  const secondary = hslToHex({
    h: (base.h + 10) % 360,
    s: clamp(base.s - 0.15, 0.1, 0.4),
    l: clamp(base.l + 0.2, 0.45, 0.8),
  });
  return {
    name: 'Auto Palette',
    roles: {
      primary,
      secondary,
      accent1: accent,
      accent2: accent2,
      neutral: '#f2f2f2',
    },
    generation: {
      method: 'auto-from-primary',
      base: primary,
    },
  };
}

export function palettePresets() {
  return [
    {
      name: 'Mono + Neon Accent',
      roles: {
        primary: '#6dff8e',
        secondary: '#c8c8c8',
        accent1: '#4ce3ff',
        accent2: '#ffffff',
        neutral: '#f2f2f2',
      },
    },
    {
      name: 'Mono + Warm Accent',
      roles: {
        primary: '#ff9c7b',
        secondary: '#c2c2c2',
        accent1: '#ffc46b',
        accent2: '#fef2d0',
        neutral: '#f2f2f2',
      },
    },
    {
      name: 'Mono + Cool Accent',
      roles: {
        primary: '#76c7ff',
        secondary: '#b0b0b0',
        accent1: '#9cf3ff',
        accent2: '#dfe8ff',
        neutral: '#f2f2f2',
      },
    },
    {
      name: 'Mono + Two-tone Accents',
      roles: {
        primary: '#ff7e6b',
        secondary: '#bfbfbf',
        accent1: '#7bd9ff',
        accent2: '#f7ffa4',
        neutral: '#f2f2f2',
      },
    },
    {
      name: 'Grayscale + Bold Primary',
      roles: {
        primary: '#f15b5b',
        secondary: '#d6d6d6',
        accent1: '#ffffff',
        accent2: '#9a9a9a',
        neutral: '#f2f2f2',
      },
    },
  ];
}
