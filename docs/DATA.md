# Journey data

The stage panel shows records, not hardcoded text. Everything it shows today is **Demo Data** (fictional), labelled as such in the UI. Nothing is connected to BlueRing or any other system yet.

## Files

| File | Role |
|---|---|
| `manifests/*.json` | Shipment manifests: the source of truth (see `docs/MANIFEST.md`) |
| `src/data/manifest.js`, `src/data/providers.js` | Validate a manifest and turn it into the linked records below |
| `src/data/model.js` | Links between records, which fields each stage shows, and what a clicked 3D object shows |
| `src/journey/ui.js` | Draws the panel from the model |

## How records link

Farm → Harvest batch → Shipment → Container → Pallet → Pick list → QC report → Claim / Delivery.

A shipment can hold several containers, a container several pallets, and a pallet can mix batches. The panel follows one shipment (the selector under the stage title); every field is looked up from that shipment through these links. A missing record or a `null` value shows as "Unavailable".

## Connecting real data later

Real data arrives as a manifest through a provider; see `docs/MANIFEST.md`. If a source system does not provide a field, leave it out and it shows as unavailable.

## Changing what a stage shows

Edit the stage's row in `FIELDS` (`src/data/model.js`): label, record type, record key, source name. Stage wording lives in `src/journey/stages.js`.

## Following one melon

`src/journey/tracking.js` follows one representative melon through all ten stages. One list (`STEPS`) says which object carries it at each moment: the melon, its crate, a pallet, a lorry, the container, the vessel. The gold highlight, the floating marker, the camera targets, the "now" line in the panel and the closing summary all read that list.

- **From the records:** batch, pallet, container, lorry and vessel ids, dates and quantities (through the same data layer as the panel). The manifest's `tracking` section names the pallet and container shown, and its `level` field says how fine the real tracking is.
- **Simulated:** the movements of the single melon and its crate (picking, packing, loading, inspection, shelving). With `level: 'batch'` the UI calls it a "Representative melon" and states that single melons are not tracked. Only a record with `level: 'item'` changes the wording to "Tracked melon".

Real shipment events arrive through the manifest (`docs/MANIFEST.md`); the 3D choreography stays illustrative unless event-level data drives it.
