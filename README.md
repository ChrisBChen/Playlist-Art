# Playlist Series Cover Art Generator

A static, client-side Swiss-inspired cover art generator designed for building cohesive playlist series on Spotify and similar platforms. The app runs entirely in the browser, uses deterministic seeded randomness, and exports 3000×3000 artwork in PNG or optional JPG.

## Features

- **Series-based generation** with consistent layout, typography, and background color.
- **Deterministic theme suggestions** based on your master seed, variation mode, and cover count.
- **Two variation modes**: vary colors or vary shapes/icons.
- **Swiss-style minimalist patterns** with controlled density and safe text zone.
- **Per-cover text editing** for header, title, and subheader.
- **Theme export/import** to regenerate the same series later.
- **Canvas export** at 3000×3000 pixels, PNG and optional JPG.

## Getting started

This repo is a static site. To run locally:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Usage guide

1. **Series Setup**
   - Choose your master seed, number of covers, variation mode, and background color.
2. **Theme Suggestions**
   - Click **Generate Theme Suggestions** and select one.
3. **Theme Finalization**
   - Adjust pattern mode, density, shape scale, icon mix, and icon categories.
4. **Text & Export**
   - Fill in header/title/subheader for each cover.
   - Export individual covers or export all.
5. **Save and Restore**
   - Download the theme JSON to recreate the series later.
   - Import a theme JSON to continue editing and exporting.

## GitHub Pages deployment

1. Commit the repository to GitHub.
2. Enable GitHub Pages for the repository (Settings → Pages).
3. Set the source to the root of the main branch.
4. The app will be served from the repo root.

## Example theme files

Example theme exports live in `assets/examples/` for reference and import testing.

## Determinism notes

All randomness uses a seeded PRNG. Theme suggestions and per-cover motifs are derived from the master seed, theme id, cover index, and the per-cover suffix so the same inputs always regenerate identical artwork.

## License

MIT. See `LICENSE`.
