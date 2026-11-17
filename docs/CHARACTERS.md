# Worker characters

Workers are drawn in one of two ways:

- **Built-in model** (`src/sites/people.js`): made from code, with outfits by role and a jointed rig for walking, bending, carrying and reaching. Always available, and used for distant views.
- **Rigged character model** (`src/engine/gltf.js`): a `.glb` file (glTF 2.0) with one skinned humanoid and its animations. When one is configured and the camera is close to a site, it replaces the built-in model for every moving worker there.

## Adding a character model

1. Put the file in `assets/characters/`, for example `assets/characters/worker.glb`.
2. In `src/config.js`, set `characters.url` to that path, and name its animations under `characters.clips`:

   ```js
   characters: { url: 'assets/characters/worker.glb', heightM: 1.8, rotateYDeg: 0, lodDistance: 320,
                 clips: { walk: 'Walk', idle: 'Idle', carry: 'Carry_Idle', carryWalk: 'Carry_Walk', pick: 'Pick_Up' } }
   ```

3. Reload. To try a file without changing the config, open the page with `?characters=assets/characters/worker.glb`.

What the file needs: one skinned mesh, Y up, facing +Z (otherwise use `rotateYDeg`), and ideally walk, idle, carry and pick-up clips. The walk clip should be one full stride cycle; it is played in step with the distance the worker covers. Missing clips fall back: no idle means the first frame of the walk; no carry or pick means idle.

Colour comes from the material's base colour factor, or its base colour texture sampled once per vertex, so models that use flat colours or palette textures look right. Detailed photo textures will look blurred.

The model is resized to `heightM` and placed with its feet on the ground. It picks up the scene's lighting, shadows, gold tracking highlight, click-to-select and fade, like everything else.

## Performance

Skinning runs on the CPU, about 1 ms per character per frame for a 14,000-vertex model, plus uploading the vertices to the GPU. Only workers in the site in view, with the camera within `lodDistance`, use the model. Keep a worker model to roughly 5,000 to 15,000 triangles.

## Current model

Quaternius "Farmer" (February 2022), CC0 public domain, from poly.pizza/m/7pn3R6hPvE, saved as `assets/characters/farmer.glb`. It is used for the farm and harvest workers only (`characters.roles`); port, warehouse, QC and store workers keep the built-in model with their role outfits. Its file has Walk, Idle and Interact clips, used for walking, standing and picking; it has no carry clip, so a worker carrying a crate stands in the idle pose.

## Not covered yet

- One model file at a time. Other roles (port worker, QC inspector) would need their own files and a small extension to choose a file per role.
- Hands do not attach to objects: a carried crate is placed at hand height by the journey, not parented to the hand bone.
