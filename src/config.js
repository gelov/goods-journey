'use strict';
/* ================= config (placeholders until confirmed) ================= */
const CONFIG={
 /* Fallback coordinates [longitude, latitude], used only if no manifest can be loaded. Real coordinates come from the manifest JSON. */
 geo:{farm:[-37.6,-5.3],brPort:[-38.9,-3.6],ukPort:[1.31,51.13],wh:[-0.6,52.3],sm:[-2.0,53.6]},
 earthTexture:'assets/earth.jpg',
 /* Map tiles shown below globe altitude. Any XYZ raster tile source works; check its licence for your use.
    Default: OpenStreetMap standard tiles, (c) OpenStreetMap contributors (ODbL), fine for light use with attribution
    (see operations.osmfoundation.org/policies/tiles). For heavier or commercial use, point url at a keyed provider.
    px is the on-screen size a tile is drawn at; lower is sharper. Set url to '' to turn the map off. */
 /* Road routing for lorries: any OSRM-compatible /route/v1/driving/ endpoint. The default is the public OSRM demo server, which
    is for light, non-commercial use; point this at your own or a keyed service for production. Set to '' to switch road routing off. */
 /* Rigged character model for the workers: a .glb (glTF 2.0) with one skinned humanoid. Empty = the built-in worker model.
    clips names the file's animations for walk, idle, carry, carryWalk and pick; any that are missing fall back sensibly.
    rotateYDeg turns the model to face +z; lodDistance is how close the camera must be before the model replaces the built-in one. */
 /* Rigged worker characters, by role. Quaternius "Farmer", "Worker" and "Casual Character" (Feb 2022), CC0 public domain,
    from poly.pizza (models 7pn3R6hPvE, Yg2bQZO6Hj, kZ3DmIoGip). All three share one skeleton and one set of clips. */
 characters:{lodDistance:900,heightM:1.8,
  clips:{walk:'CharacterArmature|Walk',idle:'CharacterArmature|Idle_Neutral',pick:'CharacterArmature|Interact'},
  models:{farmer:{url:'assets/characters/farmer.glb',roles:['farm','harvest']},
   worker:{url:'assets/characters/worker.glb',roles:['port','warehouse','qc']},
   casual:{url:'assets/characters/casual.glb',roles:['shopper','store','office']}}},
 routing:{roadUrl:'https://router.project-osrm.org/route/v1/driving/'},
 tiles:{url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',maxZoom:11,px:210},
 brPort:'Brazilian export port (location to be confirmed)',ukPort:'UK port (Dover shown as an illustration, to be confirmed)'};
