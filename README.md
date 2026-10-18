# Addistream

Addistream is a music creator workspace for private audio uploads, release metadata, and admin moderation. It is built with Next.js, Supabase, and Vercel Analytics.

## What works

- Email/password account creation and sign-in through Supabase Auth
- Private audio storage with per-user access controls
- Creator track queue backed by Supabase Postgres
- Upload credits enforced by a database function
- Admin-only review queue with approve/reject actions
- Vercel Web Analytics on deployed pages

Audio uploads are stored privately. The mastering control currently records a requested gain value; it does not process or master audio. Streaming service delivery, payouts, and paid credit packs are not connected yet. Credit purchases remain disabled until a payment provider and verified webhook are configured.

## Local development

Requirements: Node.js 20 or newer and a Supabase project.

1. Install dependencies:

  ```powershell
  npm install
  ```

2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and public anon key. These values are available in your Supabase project API settings.

3. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) once. This creates the profile and track tables, access policies, private audio bucket, and upload-credit function.

4. In Supabase Authentication URL Configuration, allow the local callback `http://localhost:3000/login`.

5. Start Next.js:

  ```powershell
  npm run dev
  ```

Open http://localhost:3000.

## Granting administrator access

Create and confirm your account from `/login`, then run this in the Supabase SQL Editor, replacing the email:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = lower('you@example.com')
);
```

New accounts receive the `creator` role by default. Admin role changes are intentionally restricted to the Supabase project owner.

## Deploying on Vercel

The GitHub repository is `Addistreams/Addistreams`.

1. Sign in to Vercel with GitHub and import that repository. Vercel must be authorized to read the GitHub repository.
2. Keep the detected Next.js settings and deploy.
3. In Vercel Project Settings → Environment Variables, add:
  - `NEXT_PUBLIC_APP_URL` set to the production URL
  - `NEXT_PUBLIC_SUPABASE_URL` set to the Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` set to the Supabase public anon key
4. Redeploy after adding or changing environment variables.
5. In Supabase Authentication URL Configuration, set the production site URL and add `https://<your-domain>/login` to the redirect allow list.
6. To use a custom domain, add it under Vercel Project Settings → Domains, follow the DNS instructions, then set `NEXT_PUBLIC_APP_URL` to that domain and redeploy.

Vercel Analytics is included and begins collecting production traffic when Analytics is enabled for the Vercel project. No analytics keys are required.

## Production build

```powershell
npm run build
npm run start
```

## Security notes

- Never commit `.env.local` or add Supabase service-role, Stripe secret, or webhook signing keys to `NEXT_PUBLIC_*` variables.
- The public Supabase anon key is designed for browser use; database and storage row-level security policies enforce access.
- Do not collect real payments until Stripe Checkout and a signed webhook are implemented and tested.
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
