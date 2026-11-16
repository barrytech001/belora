# Belora

Dispatch built on Nigeria's National Digital Alphanumeric Postcode. Enter a postcode, confirm the building with NIPOST, price the delivery, assign the nearest rider, track the trip.

## Run it

```bash
npm i -g netlify-cli
cp .env.example .env      # fill in POSTCODE_API_KEY (and ANTHROPIC_API_KEY for the address resolver)
netlify dev               # http://localhost:8888
```

Deploy: push to GitHub, connect on Netlify, add the same two env vars. No build step.

## How it works
- `index.html`: Order, Dispatch and Track screens (Leaflet map, state in localStorage for the demo).
- `netlify/functions/pc.js`: proxy to api.postcode.gov.ng (autocomplete, lookup L1). Your key stays server-side.
- `netlify/functions/resolve.js`: Claude turns a messy address into search keywords, then NIPOST autocomplete returns real postcodes. The AI never invents a code.
- `supabase/schema.sql`: tables for riders and orders (not yet wired to the UI).

## Demo with the test key
The sandbox only resolves a few public places in Abuja. Use `FC-01-A01-KP-27`, `FC-01-A01-LR-01`, `FC-01-A01-MH-01`, `FC-01-A01-MV-01`, `FC-01-A01-MW-01`.

## Known gaps (say "next step" in the pitch)
- Response shapes were read defensively; confirm against a real call and adjust `listFrom` / `coordsFrom` in `index.html`.
- If the API returns no coordinates, pins are approximate and distance is straight-line.
- Nearest rider uses seeded riders and haversine distance. The NIPOST nearby-search route was not verified.
- Supabase and Paystack are not connected yet.
