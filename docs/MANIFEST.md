# Shipment manifests

The journey is driven by one JSON file per shipment. Load a different manifest and the same 3D scenes show that shipment: its farm, ports, warehouse and supermarket on the map, its vessel, lorries and container, its routes, its stage events and its quality-control result. No code changes are needed for a valid manifest.

## Using it

- **Switch:** Settings (gear) → Shipment manifest → pick one of the samples.
- **Import:** Settings → Import manifest JSON → choose a `.json` file. It is validated first. If anything is wrong you get a list of problems and the previous manifest stays active.
- Imported files live only in the open page; they are not uploaded anywhere.

## Files

| File | Role |
|---|---|
| `manifests/manifest.schema.json` | The schema, version 1.0 (JSON Schema, for reference and for tooling) |
| `manifests/sample-*.json`, `manifests/index.json` | Three demonstration manifests and the list shown in Settings |
| `manifests/template.json` | A canonical manifest to copy |
| `src/data/adapters.js` | Format detection and conversion to the canonical format; `prepareManifest()` |
| `src/data/manifest.js` | `validateManifest()` and `normalizeManifest()` |
| `src/data/providers.js` | Where manifests come from, and `useManifest()`, the single entry point |
| `src/journey/manifest-ui.js` | `applyManifest()` (pushes a manifest into the running journey) and the Settings picker |

The schema file documents the format; the checks themselves are hand-written in `validateManifest()` so there is no library to load. Keep the two in step when the format changes.

## Importing a file: what happens

1. **Recognise the format.** `src/data/adapters.js` checks the file against the registered formats.
2. **Convert** it to the canonical format using explicit tables of known names. Each conversion is listed.
3. **Validate** the result against the canonical rules. Nothing is relaxed for converted files.
4. **Preview.** You see the manifest id, product, farm, ports, vessel, voyage, warehouse, supermarket and stage count, then three lists: converted automatically, not provided (optional), and anything that must be fixed. "Load this journey" is only enabled when there is nothing to fix.

Nothing changes in the journey until you press Load. A file that fails leaves the current manifest active.

## Supported formats

| Format | How it is recognised | What is converted |
|---|---|---|
| Canonical | locations have `role` and `{lon, lat}`, `transport` is an object | nothing |
| Canonical with alternative names | locations use `type` or another known role name | role names, coordinate forms, `fromLocationId`/`toLocationId`, vessel `imoNumber`/`voyageNumber`, route `mode` words, ISO dates |
| Manifest with a transport list | `transport` or `cargo` is a list, or stages have `highlightTarget` | all of the above, plus: transport list split into lorries, vessel and containers; `tracking.mode`; fine-grained steps merged into the supported stage types; travel steps folded into the route legs |

Known names (the full tables are at the top of `adapters.js`):

- **Roles:** `farm`; `export_port`, `origin_port`, `port_of_loading`; `arrival_port`, `destination_port`, `import_port`, `port_of_discharge`; `warehouse`, `distribution_centre`; `supermarket`, `store`, `retail`.
- **Stage types:** `growing` → farm; `harvesting`, `packing`, `loading` → harvest; `port_loading` → exportPort; `ocean_transport` → ocean; `customs_clearance` → customs; `port_unloading` → unloading; `quality_control`, `qc` → qualityControl; `claim` → claims; `supermarket` → delivery.
- **Coordinates:** `{lon, lat}`, `{lng, lat}`, `{longitude, latitude}`.
- **Coordinate pairs** such as `[125.8, 7.45]` are only converted when the order is known: the file says so (`"coordinateOrder": "lon,lat"` or `"lat,lon"`), or one pair only fits one way round (a first value above 90 cannot be a latitude), or you choose the order in the preview. If the values fit both ways and nothing says which, the import stops and asks.

Two conversions add something the file does not contain, and both are listed in the preview: a file with a harvest step but no growing step gets a farm stage at the same location, and a file with port unloading but no customs step gets a customs stage. Both are added empty, because the scenes need them; no data is invented for them.

An unknown role, stage type, vehicle type or structure is never mapped to "the nearest thing". It is reported with the accepted values.

## Routes: roads for lorries, water for the vessel

Every leg is routed and checked before anything moves along it (`src/geo/routing.js`).

- **Road legs** (farm → export port, arrival port → warehouse, warehouse → supermarket) come from a road-network router, OSRM by default (`CONFIG.routing.roadUrl` in `src/config.js`). The default is the public OSRM demo server, which is for light use; point it at your own or a keyed OSRM-compatible service for production. A road leg is rejected if there is no road connection, if the only route needs a ferry, or if a place is more than 8 km from the nearest road. Geometry in the manifest is used for a road leg only when it is marked `"geometrySource": "actual"`.
- **The sea leg** is calculated on a water grid built from the Earth image (about 25 km cells): the shortest path over water, kept off the coast where possible, then straightened wherever the straight line stays on water. Sea geometry in the manifest is used if every segment of it stays on water; if it crosses land it is replaced by the calculated route and the preview says so. A port more than about 250 km from open water on the map cannot be routed.
- **A leg that cannot be routed** is drawn dashed, labelled "illustrative connection", and no vehicle is animated on it. The reason appears under Settings → Shipment manifest, with a retry button when the routing service could not be reached.
- Road results are cached in the browser, so the router is asked once per pair of places.
- Vehicles inside a 3D site (forklifts, the tractor) run on fixed paths in that site and are not routed.

Limits: the water grid is coarse, so straits narrower than about 25 km may be closed to it and the route goes the long way round; it knows nothing about depth or restricted waters. The road router is only as good as the service behind `roadUrl`.

## Template

`manifests/template.json` is a complete canonical manifest to start from (Settings → Download JSON template). Keys beginning with `_` are notes and are ignored.

## Adding a format

Add an entry to `FORMATS` in `src/data/adapters.js` with `detect(raw)` (a structural signature or version check) and `convert(raw, notes, opts, state)` returning a canonical manifest. Record every change in `notes.converted`. An MCP adapter is one more entry feeding the same pipeline.

## Sections of a manifest

- `manifest`: id, shipment reference, product, status, quantities. `demo: true` makes the UI label everything Demo Data.
- `tracking`: batch, pallet and container the followed melon belongs to, and `level`. With `level: "batch"` the UI calls it a Representative melon and says single melons are not tracked. Only `level: "item"` changes that wording.
- `locations`: exactly one each of `farm`, `exportPort`, `arrivalPort`, `warehouse`, `supermarket`, with `coordinates` (`lon`, `lat`). `coordinateSource: "actual"` removes the "illustrative location" tag. Ports may give `seaBearingDeg` (compass bearing from quay to open water) so the 3D quay faces the sea.
- `transport`: `vehicles` (each with a `leg`, or `legs` if one lorry serves several), `vessel` (name, IMO, voyage), `containers` (id, temperature, CO₂, readings).
- `routes`: one per leg, `from` and `to` are location ids. Optional `geometry` is a list of `[lon, lat]` points; mark it `geometrySource: "actual"` only if it is the real route. Without geometry the leg is drawn as a straight line and labelled as not the actual route.
- `stages`: the journey in order. Supported types: `farm`, `harvest`, `exportPort`, `ocean`, `customs`, `unloading`, `warehouse`, `qualityControl`, `claims`, `delivery`. `claims` may be left out; the others are needed by the scenes. Each stage may carry `events` (type, timestamp, status, reference, system) and its own `title` and `summary`. An event with `simulated: true` is storytelling, not a record.
- `qualityControl`: report id, date, quantities, and an optional `claim`.

Anything optional that is missing shows as "Unavailable". Nothing is filled in on the shipment's behalf.

## What validation catches

Wrong or missing schema version, missing manifest id, missing or duplicated location roles, coordinates out of range, duplicate ids, routes or stages that point at unknown locations, unsupported or repeated stage types, stages out of order, a tracked container that is not in the transport list. Each problem names the place in the file.

## Adding a sample

1. Copy one of the `manifests/sample-*.json` files and edit it.
2. Add it to `manifests/index.json`.
3. Reload. It goes through the same pipeline as an imported file.

## What is and is not driven by the manifest

Driven: map positions, place names, country labels, port orientation, route lines, camera way-points, stage list and numbering, panel values, vessel and lorry labels, tracking wording, the closing summary.

Not driven: the 3D models and choreography. A farm is the same farm scene wherever it is; the harvest, crane and forklift sequences are fixed animations. The movements of the single melon are always a simulated illustration.

## Connecting MCP later

`src/data/providers.js` defines what a provider is: an object with `list()` (what manifests are available) and `load(ref)` (return one manifest object in the schema above). The samples and the file import are two providers. An MCP adapter is a third:

1. Call the MCP tool through your own backend. Credentials stay on the server.
2. Convert its response into the manifest schema, either in the adapter or by registering its shape as a format in `adapters.js`: map its shipment, location, transport and event fields onto the sections above, leave out what it does not provide, and set `demo: false`.
3. Hand the object to `useManifest(obj, key, label, 'mcp')`. Validation, normalisation and the journey update are the same as for a file.

No MCP connection exists in this project yet, and none is simulated.
