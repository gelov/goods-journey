'use strict';
/* ================= config (placeholders until confirmed) ================= */
const CONFIG={
 /* ILLUSTRATIVE placeholder coordinates [longitude, latitude]. Replace with the real ones once confirmed. */
 geo:{farm:[-37.6,-5.3],brPort:[-38.9,-3.6],ukPort:[1.31,51.13],wh:[-0.6,52.3],sm:[-2.0,53.6]},
 earthTexture:'assets/earth.jpg',
 /* Where journey records come from. 'mock' = the sample set in src/data/mock-records.js. See src/data/source.js. */
 data:{source:'mock'},
 /* Map tiles shown below globe altitude. Any XYZ raster tile source works; check its licence for your use.
    Default: OpenStreetMap standard tiles, (c) OpenStreetMap contributors (ODbL), fine for light use with attribution
    (see operations.osmfoundation.org/policies/tiles). For heavier or commercial use, point url at a keyed provider.
    px is the on-screen size a tile is drawn at; lower is sharper. Set url to '' to turn the map off. */
 tiles:{url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',maxZoom:11,px:210},
 brPort:'Brazilian export port (location to be confirmed)',ukPort:'UK port (Dover shown as an illustration, to be confirmed)'};
