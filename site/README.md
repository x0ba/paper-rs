# Sketch site

The download page for [Sketch](https://github.com/michaelshimeles/sketch): one prerendered
SvelteKit page, built for Vercel. It self-hosts its font and loads no scripts
from other sites.

The page counts visits with [Vercel Web Analytics](https://vercel.com/docs/analytics), which
sets no cookies and collects no personal data. `src/routes/+layout.ts` injects it. In production
the script and its events go to `/_vercel/insights` on the site's own domain; `npm run dev`
loads Vercel's debug script instead, which logs events to the console and sends nothing. Turn
Web Analytics on in the Vercel project's Analytics tab, or the script returns 404 and Vercel
records nothing.

`/download` is a Vercel function that answers with a 302 to
`https://github.com/michaelshimeles/sketch/releases/latest/download/Sketch.dmg`, the
universal app that `scripts/release-macos.sh` builds, so the button works once the newest
published Sketch release includes `Sketch.dmg`.

## Develop

Node 22.17 or later.

```sh
npm install
npm run dev       # http://localhost:5173
npm run check     # svelte-check
npm run build     # writes .vercel/output
npm run preview   # serves the build, including /download
```

## Copy and version

- Headline, features, shortcuts, install section and footer: `src/routes/+page.svelte`
- The demo under the hero: `src/lib/demo/`. `script.ts` holds its timeline, chapters, captions
  and sound cues; `Scene.svelte` lays out the desktop and the app window, and `board.ts` the
  canvas. The page draws it live in HTML and SVG, with hand-drawn shapes from rough.js.
- The feature cards: `src/lib/cards/`, one looping animation per card.
- Version, name, title, description and URLs: `src/lib/site.ts`. Bump `VERSION` when a release ships.
- `static/robots.txt` and `static/sitemap.xml` repeat the site URL; update them if `SITE_URL` changes.

## Images

Everything in `static/` comes from two scripts:

```sh
npm run shots    # renders scripts/screenshots/out/og.png with Sketch itself
npm run images   # favicons, the touch icon and og.jpg into static/
```

`npm run shots` builds `scripts/screenshots`, a small Rust program that links the Sketch library
from the root of this repository. It builds the board through Sketch's MCP tools and renders it
with the app's own renderer in dark mode, at 2160 × 1350, framed for the part of the window the
Open Graph card shows. Rerun it when the app's look changes. Its Cargo target directory defaults to
`~/.cache/sketch-rs-site-shots`; set `CARGO_TARGET_DIR` to change it.

`npm run images` needs Google Chrome to render the Open Graph card from
`scripts/brand/og.html`; set `CHROME` to use another binary. The app icon is drawn in
`scripts/brand/icon.svg`, and `icon-small.svg` is the simplified version for favicons and small
sizes. The page inlines both through `src/lib/Logo.svelte`.

## Deploy

Import the paper-rs repository as a Vercel project and set its Root Directory to `site`; the
framework preset is SvelteKit and needs no other settings. Vercel builds every push to the
repository, including commits that only touch the app, unless the project has an Ignored Build
Step.

The canonical URL and the social card URLs come from `SITE_URL` in `src/lib/site.ts`, so every
deployment, previews included, points them at the production domain.
