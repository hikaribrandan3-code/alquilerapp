# Habitaciones en Yofre Sud, Córdoba

Mobile-first property website built from the supplied real photographs and tour video. Static HTML, CSS and native browser APIs; no production dependencies, tracking, forms or database.

## Run and build

Requires Node.js 22 or newer.

```sh
npm run build
npm run check
npm test
npm run dev
```

Open `http://127.0.0.1:4173`. Publish the **contents of `dist/`** to any static host. All asset paths are relative, so a subdirectory such as GitHub Pages is supported. `dist/` is generated and excluded from Git.

For GitHub Pages, select **GitHub Actions** as the Pages source in the repository settings, then manually run **Publish to GitHub Pages**. Pushes run the build checks automatically; publishing is a separate manual action. Once deployed, set the confirmed URL in `src/config.mjs` and rebuild.

## Owner settings

Edit `src/config.mjs`, then rebuild:

- `whatsappNumber` and `whatsappMessage`: one shared source for every CTA. Currently wired to the confirmed Mariela contact.
- `email`: blank until an actual address is confirmed; no public placeholder.
- `productionUrl`: blank until the real deployment URL is known; enables canonical and Open Graph URL metadata.
- `captions`: optional relative URL to an accurate Spanish WebVTT file in `public/`. The supplied video already has text embedded in the image; no separate caption file was supplied.

Page copy lives in `src/index.html`, style in `src/styles.css`, and behavior in `src/app.js`. Images and video are in `public/media/`. The build renders all static content and contact links; JavaScript only enhances interactions. Without JavaScript, the tour uses native controls and gallery photos remain accessible as image links.

## Media and room labels

All 33 supplied HEIC files were inspected. Twelve selected photographs were converted into responsive WebP and JPEG derivatives. `docs/assets.json` records source filenames and dimensions. The originals are deliberately excluded from the published site.

The supplied MOV is the real 23.9-second tour. The web derivative is portrait 720 × 1246 H.264/AAC with fast-start. It has no initial `src`; an observer attaches it near the viewport. Playback starts muted when sufficiently visible, pauses offscreen, retains position, and respects manual pause, reduced motion and data-saving preferences. The whole surface and dedicated sound control are separate interactions. Native controls are also available.

Property facts: three rooms, two floors, two bathrooms. Upstairs wooden photographs are labeled as views of the two upstairs rooms, rather than assigning an unsupported room number to each angle. The dark-floor photograph is the downstairs room. The upstairs bathroom has wood and gray tile; the downstairs bathroom has light tile.

## Browser QA

`scripts/browser-qa.mjs` runs interaction and responsive tests with Playwright as an **optional development tool**, never a site dependency. Install it separately (`npm install --no-save playwright` and `npx playwright install chromium webkit`) or point `PLAYWRIGHT_PATH` to an existing installation. Start the preview server first, then:

```sh
QA_WEBKIT=1 node scripts/browser-qa.mjs
```

`BROWSER_EXECUTABLE` optionally selects a Chrome executable. `QA_OUTPUT` selects the screenshot/report directory. `TEST_URL` selects the site to verify. Generated test results are ignored. See `docs/verification.md` for completed checks and limits.
