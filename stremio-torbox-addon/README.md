# Stremio Cloud Addon (TorBox + Premiumize)

Browse and stream your **own TorBox or Premiumize cloud** inside Stremio. Mock mode included to test instantly; switch to real providers by filling in a couple API calls.

## Requirements
- Node.js 18+
- Stremio desktop or mobile

## Setup
```bash
npm i
npm run dev
# Addon URL → http://localhost:7000/manifest.json
```

## Real Providers
### TorBox
1. `cp .env.example .env` and set `TORBOX_ENABLED=true` + your API details
2. Edit `src/torbox.ts` methods in `RealTorBoxClient` with the real endpoints
3. `npm run build && npm start`

### Premiumize
1. In `.env` set `PREMIUMIZE_ENABLED=true` and your token
2. Edit `src/premiumize.ts` methods in `RealPremiumizeClient` with the real endpoints (placeholders show where)
3. `npm run build && npm start`

## Notes
- If a provider returns cookie‑bound URLs, enable proxying in `streams.ts` (or add the `/proxy` route shown in the guide).
- For folders-as-series, switch `type: 'series'` and generate episodes by filename.
- **IMDb artwork**: set `IMDB_ENABLED=true` and `OMDB_API_KEY` in `.env` to fetch posters from IMDb via the OMDb API. Files named like `Title (Year).ext` or including `tt1234567` match best.

## Legal
Use only with content you have the rights to stream. You are responsible for compliance.
