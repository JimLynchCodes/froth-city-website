# Froth City Research

Static website for Froth City Research, an independent equity research firm based in Battery Park, Manhattan. The site is plain HTML, CSS, and a small script — no application server and no build step.

## Run locally

From the repository root:

```sh
npx serve
```

`serve` prints a local URL (usually http://localhost:3000). The same thing is available as `npm run dev`.

## Deploy to Netlify

Connect the repository and use the committed `netlify.toml`:

- **Publish directory:** `.` (the repository root)
- **Build command:** none

Netlify serves each folder's `index.html` (`/about/` is `about/index.html`, each report lives at `/reports/<slug>/`). Unknown URLs use `404.html`.

There is no contact form. The contact page links to `research@frothcity.com` and `(212) 555-0147`.

Report PDFs live in `downloads/`. A report stays subscriber-only for 30 days after its publication date; after that, the download button appears once the reader checks the agreement. That check runs in the browser from the date in the page, so it stays correct without a server.

## Pages

- `/` Home
- `/about/` Our firm
- `/philosophy/` Philosophy
- `/services/` Services
- `/reports/` Reports, plus one page per report
- `/pricing/` Subscriptions
- `/contact/` Contact
- `/faq/` FAQ
- `/feeds/` Research wire
