# Bilde-KI-proxy (ikke en del av GitHub Pages-siden)
- Miljøvariabel: `XAI_API_KEY` (fylles inn av eier, aldri i repo). Valgfritt: `XAI_IMAGE_MODEL` (standard `grok-imagine-image-2.0`), `ALLOW_ORIGIN`, `PORT`.
- Endepunkt mot xAI: `POST https://api.x.ai/v1/images/edits` (docs.x.ai, sjekket 02.11.2026).
- Pris (docs.x.ai/developers/pricing, 02.11.2026): grok-imagine-image-2.0 ca. $0.01 per inndatabilde + $0.04–0.08 per utdatabilde.
- Start: `XAI_API_KEY=... node server/xai-proxy.mjs`, og sett `endpoint` i `js/ai-config.js`.
- Kan flyttes til serverless (Vercel/Netlify/Cloudflare) – samme logikk, nøkkel som env var.
