# From Farm to Shelf

An interactive 3D journey of melons from a farm in Brazil to a supermarket shelf in the UK, showing the physical journey and the data captured at each of ten stages.

One continuous camera travels from a globe, down through a road map, into five 3D sites (farm, export port, UK port, warehouse and QC, supermarket) and back up again to follow lorries and a cargo vessel between them.

## Run it

```sh
npm start        # or: scripts/serve.sh
```

Then open http://127.0.0.1:8080 (`PORT=3000 npm start` for another port). It needs a local server (the globe texture will not load from a `file://` page) and an internet connection for the map tiles.

There is no build step and no dependency to install. `npm run check` syntax-checks the scripts.

## Layout

| Path | What is in it |
|---|---|
| `index.html`, `styles/` | Page markup and styling |
| `src/config.js` | Placeholder coordinates, texture and map tile source |
| `src/engine/` | WebGL renderer, geometry builders, camera, picking |
| `src/geo/` | Globe, map tiles, routes, placing sites on the globe |
| `src/sites/` | The 3D models and the animated vehicles, people and cargo, in two visual styles |
| `src/journey/` | Stage text, stage timelines and camera shots, the UI |
| `assets/` | Earth texture |
| `docs/` | Architecture and configuration notes |

## Visual style

The gear button (top right) switches the 3D sites and vehicles between **Industrial** (default) and **Cartoon**. The choice is remembered in the browser. `?style=cartoon` in the URL forces one.

## What is illustrative

The farm, port, warehouse and supermarket locations, the routes between them, sensor readings and report contents are placeholders. See `docs/CONFIGURATION.md` for how to replace them.

## Credits

- Earth imagery: Solar System Scope, CC BY 4.0.
- Map tiles: © OpenStreetMap contributors. The default tile server is for light use only; use a keyed provider for anything public.
