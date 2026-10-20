# paper-rs site

The download page for [paper-rs](https://github.com/michaelshimeles/paper-rs): one prerendered
SvelteKit page, built for Vercel. It self-hosts its font and loads no scripts from other sites.

`/download` is a Vercel function that answers with a 302 to
`https://github.com/michaelshimeles/paper-rs/releases/latest/download/paper-rs-universal.dmg`,
so the button works once the newest published paper-rs release includes `paper-rs-universal.dmg`.

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

- Headline, features and footer: `src/routes/+page.svelte`
- Version, name, title, description and URLs: `src/lib/site.ts`. Bump `VERSION` when a release ships.
- `static/robots.txt` and `static/sitemap.xml` repeat the site URL; update them if `SITE_URL` changes.

## Images

Everything in `static/` comes from two scripts:

```sh
npm run shots    # renders scripts/screenshots/out/app-{light,dark}.png with paper-rs itself
npm run images   # AVIF and WebP screenshots, icon, favicons and og.jpg into static/
```

`npm run shots` builds `scripts/screenshots`, a small Rust program that links the paper-rs library
from the root of this repository. It builds the board through paper-rs's MCP tools and renders it
with the app's own renderer in both themes, at 2160 × 1350, so rerun it when the app's look
changes. Its Cargo target directory defaults to `~/.cache/paper-rs-site-shots`; set
`CARGO_TARGET_DIR` to change it.

`npm run images` needs Google Chrome to render the Open Graph card from
`scripts/brand/og.html`; set `CHROME` to use another binary. The app icon is drawn in
`scripts/brand/icon.svg`, and `icon-small.svg` is the simplified version for favicons.

## Deploy

Import the paper-rs repository as a Vercel project and set its Root Directory to `site`; the
framework preset is SvelteKit and needs no other settings. Vercel builds every push to the
repository, including commits that only touch the app, unless the project has an Ignored Build
Step.

The canonical URL and the social card URLs come from `SITE_URL` in `src/lib/site.ts`, so every
deployment, previews included, points them at the production domain.
