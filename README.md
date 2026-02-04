# Playlist Series Cover Art Generator

A static GitHub Pages-ready app for generating cohesive, deterministic Swiss-style playlist cover series. It supports seeded regeneration, theme import/export, and 3000×3000 PNG/JPG exports — no backend required.

## Features

- Deterministic cover generation with seeded randomness.
- Two variation modes: vary colors or vary shapes.
- Swiss-style grid-based pattern modes with safe zone for text.
- Theme suggestions, locking, and theme JSON export/import.
- Per-cover text editing and deterministic seed suffixes.
- 3000×3000 PNG export plus optional JPG toggle.
- Local icon library (no CDN dependency).

## Project Structure

```
/index.html
/styles.css
/src/main.js
/src/state.js
/src/render/render.js
/src/render/patterns.js
/src/render/shapes.js
/src/render/icons.js
/src/render/textFit.js
/src/utils/seed.js
/src/utils/color.js
/assets/icons/icon-data.js
/assets/examples/theme-example.json
```

## Usage

1. Open `index.html` in a modern browser or serve it locally:

```bash
python -m http.server 8000
```

2. Configure **Series Setup** and click **Generate Theme Suggestions**.
3. Select a theme card, finalize motif/palette options, and edit text per cover.
4. Export PNG (and JPG if enabled) per cover or in bulk.
5. Use **Download Theme JSON** to save, or **Import Theme JSON** to resume later.

## Determinism

- All generative content uses a seeded PRNG (`cyrb128` + `mulberry32`).
- The master seed, theme id, cover index, and suffix combine to reproduce covers exactly.
- Theme suggestions are deterministic per seed + variation mode + cover count.

## GitHub Pages Deployment

No build step is required. Commit the repository and enable GitHub Pages with the root directory.

## Example Theme JSON

An example exported theme file is available at:

```
/assets/examples/theme-example.json
```

## Notes

- The app stores the last used state in `localStorage` for convenience.
- If you need strict reproducibility, always keep the exported theme JSON.
