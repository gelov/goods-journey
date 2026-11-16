# Architecture

Plain browser JavaScript and raw WebGL. No framework, no bundler.

## How the files fit together

The scripts are classic `<script>` tags loaded in the order listed in `index.html`. They share one global scope, so a name declared at the top of one file is visible in the files after it. Two consequences:

- Load order matters. A file can only use, at load time, what earlier files declared.
- A top-level name can be declared only once across all files. `npm run check` catches duplicates.

Moving to ES modules is possible but needs the shared mutable state (the geometry builder's current colour and transform, the camera pose, the stage state) wrapped in objects first.

## One camera, one world

Everything is drawn from a single camera pose: longitude, latitude, heading, pitch and distance (`src/engine/camera.js`).

- Far away the pose shows the globe (`src/geo/globe.js`).
- Below globe altitude, road-map tiles are draped on the globe and loaded level by level (`src/geo/tiles.js`).
- Close to a configured location, that location's 3D site is drawn standing on the globe's surface (`src/geo/sites.js`, `src/sites/`).

Because it is one pose, zooming from the globe into a site is a continuous move, not a scene change.

## Stages

Each of the ten stages has a duration and a list of camera keyframes (`src/journey/scripts.js`). Vehicles, cranes and cargo read the current stage time (`src/sites/movers.js`), which is why a stage can be paused, scrubbed and replayed.

The camera follows one smooth curve through a stage's keyframes and carries its speed into the next stage, so it does not stop at each keyframe. Stage time advances at a speed factor (`SPEEDS` in `src/journey/scripts.js`: Normal 1, Cinematic 1.3, Fast 1.7, chosen in Settings), so camera, vehicles and routes speed up together. To retime one shot, change its keyframe times; to change overall pace, change the factors.

Stage wording lives in `src/journey/stages.js`.

## Visual styles

`src/sites/styles.js` holds one palette and settings entry per style. `src/sites/kit.js` is the shared entry point for every model. `src/sites/kit-diorama.js` holds the Cartoon style's detailed miniature scenery (trees, crops, houses, terrain, planting); `src/sites/kit-industrial.js` holds the Industrial models, and its vehicles, cranes, containers and vessel are used by both styles with each style's palette. All keep the same origins and footprints. The Cartoon palette tags surfaces with a texture code (foliage, grass, soil, wood, stone, roof tiles) that the shader in `src/engine/gl.js` turns into procedural surface detail. `buildStyle(name)` in `src/sites/build.js` builds every site and mover once per style and keeps the meshes; `setStyle(name)` only swaps which meshes are drawn and a shader flag. Layout, paths, timelines, camera, globe and map are shared, so switching keeps the stage, camera and playback where they are.

The Industrial style's farm is a greenhouse complex. Its glass is collected into a separate mesh per site (`glassI` in `kit-industrial.js`) and drawn last without writing depth, so objects inside stay visible; any style can use the same helper. `bldgI` is the reusable modern building block (plinth, parapet, window grids, roller doors, rooftop plant).

To add a style: add a palette and an entry in `STYLES`, give the kit functions a branch for it, and add an option button in `index.html`.

## Render order

Per frame (`src/engine/render.js`): shadow map for the nearest site, globe and atmosphere, map tiles, route ribbons, the travelling vehicle marker, then the visible sites and their data-flow particles.
