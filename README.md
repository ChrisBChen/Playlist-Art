# Swiss Playlist Studio

A static, deterministic playlist cover generator for making a whole set of themed playlist artwork at once. The app is designed around restrained Swiss poster systems: fixed grids, asymmetric typography, limited palettes, and controlled variation from cover to cover.

## Features

- Batch playlist input with editable per-cover rows.
- Series defaults for applying shared kicker, footer, and numeric/monthly/quarterly/yearly labels.
- Four curated art systems: Type Block, Modular Bars, Circle Study, and Index Field.
- Deterministic rendering from a master seed plus per-cover variant seeds.
- Swiss-inspired palettes with custom color overrides.
- Large selected preview plus full-series thumbnail gallery.
- Individual PNG/JPG export at 3000x3000.
- Bulk PNG/JPG export as a single ZIP file.
- Theme JSON export/import with backward-compatible v1 theme import.

## Quick Start

```bash
python3 -m http.server 5173
```

Then visit:

```text
http://localhost:5173
```

## Workflow

1. Paste playlist names into the batch field and update the series.
2. Choose one of the four art systems.
3. Adjust the seed, palette, grid density, type scale, and variation strength.
4. Apply shared kicker/footer/numbering defaults, then edit any individual row as needed.
5. Export one cover or the whole set as a ZIP.

## Theme JSON

Theme exports use `schemaVersion: 2`. The important fields are:

- `masterSeed`
- `seriesDefaults`
- `artSystem.templateId`
- `artSystem.gridDensity`
- `artSystem.paletteId`
- `artSystem.customColors`
- `artSystem.typeScale`
- `artSystem.variationStrength`
- `artSystem.backgroundMode`
- `typography`
- `exportSettings`
- `seriesItems`

Each `seriesItems` entry uses:

- `title`
- `kicker`
- `footer`
- `variantSeed`
- `indexLabel`

An example is available at:

```text
/assets/examples/theme-example.json
```

## Deployment

The app is plain static HTML, CSS, and JavaScript. It can be hosted from a GitHub Pages repository root without a build step.

## License

MIT
