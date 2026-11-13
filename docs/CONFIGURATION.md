# Configuration

Everything below is in `src/config.js`.

## Locations

`CONFIG.geo` holds `[longitude, latitude]` for the farm, the Brazilian export port, the UK port, the warehouse and the supermarket. All five are illustrative placeholders. Replace them when the real locations are confirmed; the sites, pins and routes follow automatically.

Road routes are drawn as simple curves between locations, not real roads. The sea route's waypoints are in `src/geo/globe.js` (`ROUTES`).

## Map tiles

`CONFIG.tiles.url` is any XYZ raster tile URL. The default is OpenStreetMap's standard tile server, which is free for light use with attribution. For a public or commercial deployment, use a provider that gives you a key and check its licence. Set `url` to `''` to turn the map off and keep the satellite globe.

`CONFIG.tiles.px` is the on-screen size a tile is drawn at (smaller is sharper, and loads more tiles). `maxZoom` caps the detail level.

## Globe texture

`CONFIG.earthTexture` points at `assets/earth.jpg` (8192×4096). If it cannot load, a simple drawn map is used instead.
