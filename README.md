# Playlist Series Cover Art Generator

A static, deterministic Swiss-style playlist cover generator built for GitHub Pages. Generate a cohesive series of 3000×3000 PNGs (and optional JPGs), export/import a theme JSON, and reproduce the exact same covers on demand.

## Features

- Deterministic theme suggestions based on a master seed.
- Swiss-style minimalist layouts with consistent margins, safe zone, and typography grid.
- Palette suggestions and motif sets (geometric + icon mix).
- Canvas-based export at 3000×3000 PNG, with optional JPG toggle.
- Theme JSON export/import for perfect reproducibility.
- Local icon set (no CDN dependency).

## Getting Started

This is a static app. Open `index.html` directly or run a simple local server:

```bash
python3 -m http.server 5173
```

Then visit `http://localhost:5173` in a browser.

## GitHub Pages Deployment

1. Push this repository to GitHub.
2. Enable **GitHub Pages** in your repository settings.
3. Choose the root of the `main` branch as the Pages source.

No build step required.

## App Workflow

### 1. Series Setup
- Set the **Series Seed** and number of covers.
- Choose variation mode (Vary Colors or Vary Shapes).
- Set background color and export format options.

### 2. Theme Suggestions
- Click **Generate Theme Suggestions** to create 4–5 deterministic candidates.
- Pick a suggestion to lock a motif/palette combination.

### 3. Theme Finalization
- Adjust pattern mode, density, scale, rotation variance, opacity, and strict Swiss toggle.
- Set fonts and text color.

### 4. Text & Export
- Enter header, title, subheader, and optional seed suffix per cover.
- Export individual covers or bulk export PNG/JPG.
- Download/import theme JSON for deterministic regeneration.

## Theme JSON

Themes include all data needed for deterministic regeneration:
- Master seed, variation mode, count, theme id
- Palette and motif definitions
- Pattern parameters
- Typography settings
- Optional per-cover text and suffixes

See the included example in `assets/examples/example-theme.json`.

## Project Structure

```
index.html
styles.css
src/
  main.js
  state.js
  render/
    render.js
    patterns.js
    shapes.js
    icons.js
    textFit.js
  utils/
    seed.js
    color.js
assets/
  icons/
    icons.js
  examples/
    example-theme.json
```

## License

This project is licensed under the MIT License.
