# Playlist Art Swiss

A static, deterministic Swiss-style playlist cover generator built for GitHub Pages. It generates cohesive series artwork with seeded randomness, exports 3000×3000 PNGs (optional JPG), and supports theme JSON export/import for reproducibility.

## Features

- Deterministic seeded generation (no `Math.random` in rendering).
- Swiss-style grid layouts with motif safe zones and strict margins.
- Theme suggestions (4–5) based on variation mode.
- Per-cover text editing with automatic fitting.
- Export individual or bulk PNG/JPG.
- Theme JSON export/import for perfect regeneration.

## Quick start (local)

```bash
python -m http.server 5173
```

Then visit `http://localhost:5173`.

## Usage

1. **Series Setup**: choose the number of covers, variation mode, background color, and seed.
2. **Theme Suggestions**: click “Generate Theme Suggestions” and pick one.
3. **Theme Finalization**: refine motif or palette based on the variation mode.
4. **Pattern & Typography**: adjust grid mode, density, scale, rotation, and fonts.
5. **Text & Export**: edit header/title/subheader, export PNG/JPG, download/import theme JSON.

## Theme JSON

The exported theme JSON includes:

- App and schema version
- Series seed and count
- Variation mode and theme id
- Background color, palette roles
- Motif definition (shapes/icons)
- Pattern parameters (safe zones, spacing)
- Typography settings
- Per-cover text and suffixes

Example theme JSON is available at:

```
/assets/examples/theme-example.json
```

## GitHub Pages deployment

Because the app is fully static, it can be served directly from the repository root. If using GitHub Pages:

1. Commit all files.
2. Enable GitHub Pages for the repository (branch root).
3. Visit the published URL.

## Tech notes

- Rendering is done via Canvas 2D.
- Preview renders at 1000×1000 for responsiveness, exports at 3000×3000.
- All determinism derives from the master seed + theme id + index + suffix.

## License

MIT
