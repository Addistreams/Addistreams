# Addistream

Addistream is a polished music distribution and creator upload platform concept built with Next.js. It includes a creator dashboard, admin approval workflow, upload credit system, drag-and-drop file selection, audio preview, and a login flow to gate app access.

## Features

- Creator upload dashboard with drag-and-drop audio upload
- Upload credit packs and purchase flow
- Audio preview and mastering slider
- Upload queue listing with status labels
- Admin approval console for queued tracks
- Monetization and trial settings panel
- Login workflow for creator/admin access
- Production-ready Next.js app with Vercel deployment support

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Vercel deployment ready

## Local Development

1. Copy the sample env file:

```bash
cp .env.example .env.local
```

2. Start the app:

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Then open:

- http://127.0.0.1:3000

For Vercel, set `NEXT_PUBLIC_APP_URL` to your live production URL.

## Demo Login

Use any email/password combination, or use:

```text
creator@addistream.com
password: demo123
```

## Production Build

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

## Deploy on Vercel

1. Push this repository to GitHub.
2. Open Vercel and import the repo.
3. Keep the default framework preset for Next.js.
4. Add the environment variable:

```text
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

5. Deploy.

This project already includes a `vercel.json` configuration for a standard Next.js deployment.

## Project Structure

```text
app/
  admin/page.tsx
  creator/page.tsx
  login/page.tsx
  page.tsx
  layout.tsx
  globals.css
public/
README.md
package.json
vercel.json
```
