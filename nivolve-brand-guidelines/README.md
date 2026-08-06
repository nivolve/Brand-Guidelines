# Nivolve Brand Guidelines — Implementation Guide

A single-page, interactive brand guideline site for Nivolve. Static HTML/CSS/JS,
no build step, ready to drag-and-drop onto Netlify.

## What's inside

```
index.html                   the entire page (hero, logo, color, type, usage, footer)
netlify.toml                 headers + cache config for Netlify
assets/
  css/main.css                all styles — tokens sourced from design.md, do not
                               hand-edit hex values without updating both places
  js/
    main.js                   nav, scroll reveals, color-copy, logo export/kit,
                               Three.js hero (capability-gated)
    gsap.min.js                vendored locally, no CDN
    ScrollTrigger.min.js
    jszip.min.js
    three.module.min.js
  fonts/                      woff2, self-hosted, loaded via @font-face in main.css
    bricolage/  manrope/  jetbrains-mono/
  fonts-download/              zipped variable-TTF + OFL license, linked from the
                               "Files" button on each type card
    Nivolve-BricolageGrotesque.zip
    Nivolve-Manrope.zip
    Nivolve-JetBrainsMono.zip
    Nivolve-AllFonts.zip
  logos/
    nivolve-logo.svg           master vector, traced from your uploaded PNG
    nivolve-logo-original.png  your original upload, kept for reference
```

The master logo is also inlined directly into `index.html` as a `<symbol id="nivolve-mark">`
so every instance on the page (nav, hero, footer, usage examples) reuses the same
source via `<use href="#nivolve-mark">` — one edit point if the mark ever changes.

## How the logo kit works

Colors are applied automatically, not pre-rendered. `main.js` takes the master
SVG paths and:

1. **On-page preview** — sets the CSS `color` property on the `<svg>` wrapper; the
   paths use `fill="currentColor"` so they pick it up live.
2. **SVG download** — writes a standalone SVG with the color baked in via inline
   `style="color:…"` (needed because the traced paths inherit `currentColor` from
   their own `<g>`, so the color has to be set on that same file, not just implied
   by an outer `fill` attribute).
3. **PNG download** — rasterizes that same SVG to a transparent-background canvas
   at 800px/1600px and exports a PNG blob.
4. **Full kit (.zip)** — loops over all seven approved colorways (Navy, Navy Deep,
   Cyan Ink, Aqua, Cream, Black, White), builds SVG + PNG (@1x/@2x) for each, adds
   a README, and zips it client-side with JSZip — no server round-trip.

Font "Files" buttons link directly to the pre-built zips in `assets/fonts-download/`.

## The Three.js hero

Gated behind `navigator.hardwareConcurrency > 2`, `deviceMemory > 2`,
`prefers-reduced-motion: no-preference`, and a real WebGL context check. If any
gate fails, the import is skipped entirely and the CSS radial-gradient
(`.hero__grain`) is the fallback background — so low-power devices never pay for
a scene they won't see rendered well.

## Deploying to Netlify

**Drag-and-drop (fastest):**
1. Unzip the delivered folder.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the folder in.
3. Point your custom domain (`nivolve.in` or a `brand.nivolve.in` subdomain) at the
   new site in Netlify's domain settings.

**Netlify CLI:**
```bash
npm install -g netlify-cli
cd nivolve-brand
netlify deploy --prod
```

**Git-based (recommended for future edits):** push this folder to a GitHub repo and
connect it in Netlify with build command left blank and publish directory set to `.`.

No environment variables, no build step, no server — it's fully static.

## Updating the logo later

If you ever replace the source mark:
1. Re-trace to SVG (or ask me to do it again from a new upload).
2. Replace the path data inside `<symbol id="nivolve-mark">` in `index.html`.
3. Update `assets/logos/nivolve-logo.svg` and `nivolve-logo-original.png` to match.
Everything else — colorways, download kit, usage examples — reads from that one
symbol and updates automatically.

## Known limitations / next pass

- I wasn't able to run a full interactive browser QA pass in this environment
  (Playwright's browser binaries require a download host that isn't reachable from
  here). The code has been checked for syntax correctness, asset-path integrity,
  and the logo color-export logic was verified by rendering it independently — but
  a live click-through on your end (desktop + mobile) before going live is a good
  idea, especially for the download buttons and the Three.js hero on your actual
  devices.
- The traced logo is a faithful vector reconstruction of your PNG, not the original
  design file — if you have the source vector (Illustrator/Figma), swapping it in
  will give marginally crisper curves at very large sizes.
