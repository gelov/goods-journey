# Journey data

The stage panel shows records, not hardcoded text. Everything it shows today is **Demo Data** (fictional), labelled as such in the UI. Nothing is connected to BlueRing or any other system yet.

## Files

| File | Role |
|---|---|
| `src/data/mock-records.js` | The demo records (fictional names, ids, dates and values; `null` = not available) |
| `src/data/source.js` | Integration layer: picks an adapter and fills `DATA` |
| `src/data/model.js` | Links between records, which fields each stage shows, and what a clicked 3D object shows |
| `src/journey/ui.js` | Draws the panel from the model |

## How records link

Farm → Harvest batch → Shipment → Container → Pallet → Pick list → QC report → Claim / Delivery.

A shipment can hold several containers, a container several pallets, and a pallet can mix batches. The panel follows one shipment (the selector under the stage title); every field is looked up from that shipment through these links. A missing record or a `null` value shows as "Unavailable".

## Connecting real data later

1. Add an adapter in `src/data/source.js` that returns records in the same shape as `mock-records.js`, with `status: 'live'`.
2. Set `CONFIG.data.source` to its name in `src/config.js`.
3. The adapter must call your own backend. Keep API keys and private records out of this frontend code.

No endpoint is assumed. If a source system does not provide a field, leave it out or `null`.

## Changing what a stage shows

Edit the stage's row in `FIELDS` (`src/data/model.js`): label, record type, record key, source name. Stage wording lives in `src/journey/stages.js`.
