# Completed verification

Production build, asset checks, contact tests and SEO/social metadata validation passed on 5 October 2026.

Chromium (installed Chrome) and WebKit 26.5 passed at 360, 390, 430, 768 and 1440 px. The machine-readable results are in `browser-qa.json`. Full-page captures were inspected for mobile and desktop composition, image cropping and room labels.

Verified:

- Zero video requests while initially at the hero.
- Muted inline autoplay in view, surface tap pause/resume, separate sound toggle.
- Manual pause survives re-entry; playback position is retained; offscreen playback pauses.
- Floating WhatsApp hides at the hero, video, gallery and final contact section. Mobile collision detection also hides it over text and interactive content. Bottom placement accounts for the safe area.
- Reduced motion disables automatic video loading and autoplay; explicit playback works.
- Keyboard gallery navigation, Escape, dialog focus management and focus restoration.
- Mobile navigation, no horizontal overflow, no JavaScript exceptions or HTTP asset errors.
- Without JavaScript, native video controls and all gallery image links remain available.
- Every WhatsApp CTA uses the confirmed number and exact prefilled message.
- Responsive WebP/JPEG, explicit media dimensions, lazy below-fold images, eager high-priority hero.
- Open Graph and X/Twitter cards reference the same absolute HTTPS 1200 × 630 social image; canonical and JSON-LD URLs use the verified Vercel project domain.
- JSON-LD `WebPage` and `Accommodation` facts parse correctly and contain only confirmed property details.

Media:

- Source video: HEVC/AAC, 1320 × 2286, 23.9 seconds, 46,678,239 bytes.
- Published video: H.264/AAC, 720 × 1246, 30 fps, limited-range YUV420P, 4,682,426 bytes (90% smaller).
- MP4 moov atom precedes mdat, enabling progressive delivery.
- Mobile 480 px WebP hero: about 38 KB.
- Production JavaScript: about 9 KB uncompressed; no external runtime dependencies or fonts.

Limits: these are desktop browser-engine and viewport tests, not tests on physical iPhones or Android devices. Real cellular Core Web Vitals depend on hosting, caching and network; no field-performance score is claimed. No exact address, prices or availability were invented.
