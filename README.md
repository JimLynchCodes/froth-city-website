# Froth City Research

Static website for Froth City Research, an independent equity research firm based in Battery Park, Manhattan. Pages are HTML. Vite bundles the reports table and copies everything else into a static `dist/` folder. There is no application server at runtime.

## Run locally

From the repository root:

```sh
npm install
npm run dev
```

`dev` starts Vite at http://localhost:3000. The reports page loads AG Grid from the project dependency, not from a CDN.

## Build and preview

```sh
npm run build
npm run preview
```

`build` writes the static site to `dist/`. `preview` serves that folder at http://localhost:3000. Deploy the contents of `dist/` only. The result is HTML, CSS, JavaScript, images, and PDFs.

## Deploy to Netlify

Connect the repository and use the committed `netlify.toml`:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 22

Netlify serves each folder's `index.html` (`/about/` is `about/index.html`, each report lives at `/reports/<slug>/`). Unknown URLs use `404.html`.

There is no contact form. The contact page links to `research@frothcity.com` and `(212) 555-0147`.

Report PDFs live in `public/downloads/` and are copied to `dist/downloads/`. On a report page, the Download PDF button stays disabled until the reader checks the agreement. That check runs in the browser. There is no account and no publication delay.

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
