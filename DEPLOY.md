# Persona.Credit — Deploy to Vercel

## Required: 1 environment variable

In Vercel → Settings → Environment Variables:

| Name | Value | Environments |
|------|-------|--------------|
| `GEMINI_API_KEY` | your Google Gemini API key | Production, Preview, Development |

Get your key at: https://aistudio.google.com/app/apikey

## Optional: Vercel KV (persistent storage across devices)

Without KV, data is stored in browser localStorage (works fine for alpha).

To enable:
1. Vercel Dashboard → Storage → Create → KV Database
2. Connect to project → Vercel auto-adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`

## Deploy steps

### Option A: GitHub (recommended)
1. Push this folder to a GitHub repo
2. Vercel → New Project → Import repo
3. Add `GEMINI_API_KEY` environment variable
4. Deploy

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Option C: Drag & Drop
Drag the project folder into vercel.com/new

## Local development
```bash
cp .env.local.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm install
vercel dev        # Runs Vite + API functions together
# OR
npm run dev       # Vite only (API calls won't work without vercel dev)
```

## What's in /api
- `validate-file.ts`    — validates uploaded documents (30s timeout)
- `extract-document.ts` — extracts financial data from documents (60s timeout)
- `run-agent.ts`        — runs scoring agents: identity/financial/fraud/country/behavioral
- `synthesize.ts`       — final synthesis agent
- `kv.ts`               — Vercel KV storage proxy

All Gemini API calls are server-side. GEMINI_API_KEY never reaches the browser.
