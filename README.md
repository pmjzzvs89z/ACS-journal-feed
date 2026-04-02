# Literature Tracker

A React app for following and tracking journal articles across ACS, Wiley, RSC, Elsevier, Springer, MDPI, and more.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (auth, database, edge functions)
- **Edge functions**: `fetch-rss` (RSS proxy), `proxy-image` (image proxy)

## Getting started

```bash
npm install
npm run dev
```

## Environment

Create a `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_publishable_key
```

## Deployment

Push to GitHub. Deploy frontend via Vercel or Netlify (set the env vars above in the platform settings). Edge functions are deployed to Supabase via the Supabase MCP or CLI.
