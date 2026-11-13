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

Stage wording lives in `src/journey/stages.js`.

## Render order

Per frame (`src/engine/render.js`): shadow map for the nearest site, globe and atmosphere, map tiles, route ribbons, the travelling vehicle marker, then the visible sites and their data-flow particles.
