# Persona.Credit — Deploy to Vercel

## Required: environment variables

In Vercel → Settings → Environment Variables:

| Name | Value | Environments |
|------|-------|--------------|
| `GEMINI_API_KEY` | your Google Gemini API key | Production, Preview, Development |
| `ADMIN_EMAIL` | email of the account that gets the admin role (v34.13) | Production, Preview, Development |

Get your Gemini key at: https://aistudio.google.com/app/apikey

`ADMIN_EMAIL` (v34.13): the hardcoded admin backdoor is removed. Sign up as a
normal account with this email — it is granted the admin role on login/verify.
Server-side only; never expose it with a `VITE_` prefix.

## Required: Vercel KV (accounts & sessions)

v34.13 server-side authentication stores password hashes and session tokens in
Vercel KV — sign-up/login return a "Storage not configured" error without it.
(Anonymous flows still fall back to browser localStorage.)

To enable:
1. Vercel Dashboard → Storage → Create → KV Database
2. Connect to project → Vercel auto-adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`

Migration from v34.12: existing accounts in the legacy `pc:fulldb` blob are
migrated automatically on their first successful login (per-user keys, passwords
stay server-side).

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
- `auth.ts`             — server-side auth: signup/login/sessions (v34.13)
- `kv.ts`               — Vercel KV storage proxy (session-authorized, v34.13)

All Gemini API calls are server-side. GEMINI_API_KEY never reaches the browser.
