# Froth City Research

Website for Froth City Research, an independent equity research firm based in Battery Park, Manhattan. Pages are HTML. Vite bundles the reports table and copies the site into `dist/`. Netlify serves that folder. Accounts, when configured, talk to Supabase from the browser. There is no application server in this repo.

See the live site: https://froth-city.netlify.app/

---

## Run locally

From the repository root:

```sh
npm install
npm run dev
```

`dev` starts Vite at http://127.0.0.1:3000. With no Supabase keys, the site still builds and runs. Reports come from `src/data/reports.json`. The account button, `/login/`, and `/account/` use a dev-only picker labeled "Dev mode" that stores a test reader, subscriber, or premium in this browser. That picker is not active in a production build.

```sh
npm test
npm run build
npm run preview
```

`build` writes `dist/`. `preview` serves that folder. A production build with no Supabase keys shows "Sign-in is unavailable" on `/login/` and does not offer the dev picker.

## Reports and the one-month rule

`src/data/reports.json` is the list of notes: slug, title, tickers, industry, direction, publish date, and PDF file name. The reports table reads it. `npm run db:seed` writes `supabase/seed.sql` from that file and from `src/data/weekly-5-5.json`. `prebuild` regenerates the seed before `npm run build`.

A note is free for everyone one calendar month after its publish date. Until then only Subscriber and Premium can open the PDF. Reader is the free tier. The same rule applies to each Weekly 5/5 week, counted from its Monday `week_of` date.

The long-form HTML of each note stays in `reports/<slug>/index.html`. The home page, feeds page, and noscript table are still written by hand. The catalog test checks that each note's date and PDF path still match the JSON.

## Accounts

`/login/` supports Google, email and password, a magic link, and password reset when Supabase is configured. `/account/` shows email, tier, and member since, and a placeholder for managing a subscription. Billing is not connected. New accounts are Reader until the tier is changed in the Supabase dashboard (the account page cannot change its own tier).

The person button in the header goes to `/account/` when someone is signed in and to `/login/` otherwise.

## What is in Supabase, and what stays static

Moved into the database, seeded from the JSON files:

- `profiles`, created when someone signs up. Row Level Security lets a person read their own row and edit only `display_name`.
- `reports`, the same fields as the JSON. Public read. Storage policies use the publish date.
- `weekly_5_5`, one row per sector in a week. Example rows are public. A real week is readable by Subscriber and Premium, and by everyone else once it is a calendar month old. A date-only function lets the page say that a locked week exists without returning the sector names.
- `contact_messages`. Anyone can insert. No one can read rows through the anon key.

Left static:

- Page HTML, CSS, and the prose of each note. A new note is still a page in this repo.
- The on-screen report list. It is the JSON file, so a database edit does not change the table until the JSON changes and the site is rebuilt. That keeps the page and the seed from drifting.
- PDFs in `private/downloads/`. They are not in `public/`.

PDF gating is real on a build that has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. That build does not copy the PDFs into `dist/`. The download button asks Supabase Storage for a short-lived signed URL, and the bucket policy checks tier and date. A build without those keys still copies the PDFs into `dist/downloads/` so the current site keeps working, and a direct URL still bypasses the button. Local `npm run dev` can also serve the private files so the button can be tried. Set the Netlify keys, upload the PDFs, and redeploy to close the direct URL.

## Weekly 5/5

`/weekly-5-5/` is five sectors long and five sectors short. `src/data/weekly-5-5.json` holds the week of November 23, 2026, with `example` set to false. That week is for Subscriber and Premium members until December 23, 2026, one calendar month after its Monday. An `example: true` week, if you add one again, is shown as a placeholder and is hidden once a real week exists.

To publish a week:

1. Edit `src/data/weekly-5-5.json`. Add an object with `weekOf` (the Monday), `example: false`, and `long` and `short` arrays of up to five items. Each item has `sector`, an optional primary `etf`, an optional `tickers` array for further ETFs or stocks, `thesis`, and an optional `report` path when a note on the site matches.
2. Run `npm run db:seed` so `supabase/seed.sql` matches.
3. If this deployment has no Supabase keys, the next build reads the JSON and you are done.
4. If Supabase is on, the site reads the table, not the JSON bundle. Run `npm run content:sync` with `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, or paste the new `insert` statements into the Supabase SQL editor. Do not put the service role key in Netlify or in a `VITE_` variable.

A new equity note is the same pattern: add the page, add a row to `src/data/reports.json`, put the PDF in `private/downloads/`, run `npm run db:seed`, then `npm run content:sync` and `npm run storage:upload` when Supabase is on.

## Local Supabase

```sh
npx supabase start
npm run db:reset
```

`db:reset` regenerates the seed and loads it into the local stack. Copy the API URL and anon key into `.env.local` (see `.env.example`), then:

```sh
npm run dev:supabase
```

`dev:supabase` refuses to start if `.env.local` is missing those two values. Inbucket on the local stack catches auth email (magic link, confirm, reset).

Google on the local stack stays off until you set `[auth.external.google]` in `supabase/config.toml` and restart.

## Going live with Supabase

Do these in order. The site keeps working before they are done.

1. Create a Supabase project.
2. Install the Supabase CLI, run `npx supabase login`, then `npx supabase link --project-ref <ref>`.
3. Apply the schema: `npx supabase db push`. That runs `supabase/migrations`.
4. Load the catalog. Either run `npm run content:sync` with the project URL and the service role key in your shell, or open the SQL editor and run `supabase/seed.sql`.
5. Create a private Storage bucket named `reports` if the migration did not create it. Run `npm run storage:upload` so each PDF lands under the file name in `pdf_path` (`memory.pdf`, and the rest). The bucket stays private.
6. In Netlify, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for production and for deploy previews. Trigger a new deploy. Vite bakes these in at build time. The anon key is public. Do not add `SUPABASE_SERVICE_ROLE_KEY` to Netlify.
7. Confirm the new deploy has no files at `/downloads/*.pdf`. A members-only note should download only after sign-in as Subscriber or Premium. A note older than a month should download signed out.
8. Authentication, URL configuration:
   - Site URL: `https://froth-city.netlify.app`
   - Additional redirect URLs: `https://froth-city.netlify.app/**`, `http://localhost:3000/**`, `http://127.0.0.1:3000/**`, and `https://deploy-preview-*--froth-city.netlify.app/**` if the project allows a wildcard. If it does not, add each preview origin you use.
9. Google provider:
   - In Google Cloud, create an OAuth web client.
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Also add `http://127.0.0.1:54321/auth/v1/callback` if you test Google locally.
   - Authorized JavaScript origins: `https://froth-city.netlify.app`, `http://localhost:3000`, `http://127.0.0.1:3000`, and the Netlify preview host if you use it.
   - Paste the client id and secret into Supabase Auth, Google provider, and enable it.
10. Email. The built-in Supabase mailer is enough to try magic links and password reset, and it is rate limited. For a real membership, set custom SMTP (the Auth SMTP settings) and review the invite, confirmation, magic link, and recovery templates. Point every link at the Site URL above. Local mail is visible in Inbucket, not in a real inbox.
11. Tiers. The trigger creates a Reader profile on signup. Change `profiles.tier` to `subscriber` or `premium` in the table editor. The member cannot do that from the site. Billing can replace this later. The account page leaves a placeholder for it.

Contact form rows land in `contact_messages`. Read them in the table editor. The form tells the reader to use email when Supabase is not configured.

## Pages

- `/` Home
- `/about/` Our firm
- `/philosophy/` Philosophy
- `/services/` Services
- `/reports/` Reports, plus one page per report
- `/weekly-5-5/` Weekly sector list
- `/pricing/` Subscriptions
- `/contact/` Contact
- `/faq/` FAQ
- `/feeds/` Research wire
- `/login/` Sign in
- `/account/` Account
