import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { config } from '../src/config.mjs';
import { icon } from '../src/icons.mjs';
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const assets = JSON.parse(await readFile(new URL('../docs/assets.json', import.meta.url)));
const photo = (name, alt, cls = '', hero = false) => {
  const asset = assets.find((a) => a.name === name);
  if (!asset) throw new Error(`Unknown image: ${name}`);
  const [w, h] = asset.originalDimensions;
  const widths = asset.widths;
  const sizes = hero ? '100vw' : cls === 'gallery-photo' ? '(min-width: 1000px) 280px, (min-width: 600px) 23vw, 46vw' : '(min-width: 1000px) 600px, (min-width: 600px) 50vw, calc(100vw - 40px)';
  const srcset = (format) => widths.map((width) => `./media/${name}-${width}.${format} ${width}w`).join(', ');
  return `<picture class="${escape(cls)}"><source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}"><img src="./media/${name}-800.jpg" srcset="${srcset('jpg')}" sizes="${sizes}" width="${w}" height="${h}" alt="${escape(alt)}" loading="${hero ? 'eager' : 'lazy'}" decoding="async"${hero ? ' fetchpriority="high"' : ''}></picture>`;
};
const galleryEntries = [
  ['hero', 'La fachada de madera y sus flores'], ['wood', 'El alero y los detalles de madera'],
  ['upstairs', 'Una vista de los espacios de planta alta'], ['facade', 'El exterior de la planta alta'],
  ['roomWood', 'Luz natural en los espacios de madera'], ['exterior', 'Una ventana al aire libre'],
  ['upstairsDetail', 'Los tonos cálidos de la madera'], ['downstairs', 'La habitación de planta baja'],
  ['bathUp', 'El baño de planta alta'], ['bathDown', 'El baño de planta baja'],
  ['view', 'Una mirada al barrio desde la propiedad'], ['courtyard', 'El patio y el acceso a la propiedad'],
];
const productionUrl = new URL(config.productionUrl);
if (productionUrl.protocol !== 'https:') throw new Error('The configured production URL must use HTTPS.');
const canonicalUrl = productionUrl.href;
const socialImageUrl = new URL(config.socialImage.replace(/^\//, ''), productionUrl).href;
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': canonicalUrl + '#webpage',
  url: canonicalUrl,
  name: 'Habitaciones en Yofre Sud, Córdoba | Mariano Habitación',
  description: 'Habitaciones en Yofre Sud, Córdoba. Espacio tranquilo con Wi-Fi, servicios incluidos, 2 baños y acceso al centro en colectivo. Consultá disponibilidad por WhatsApp.',
  inLanguage: 'es-AR',
  primaryImageOfPage: { '@type': 'ImageObject', url: socialImageUrl, width: 1200, height: 630 },
  mainEntity: {
    '@type': 'Accommodation',
    '@id': canonicalUrl + '#alojamiento',
    name: 'Habitaciones en Yofre Sud',
    description: 'Tres habitaciones en dos plantas, con dos baños, Wi-Fi y servicios incluidos.',
    url: canonicalUrl,
    image: socialImageUrl,
    numberOfRooms: 3,
    numberOfBathroomsTotal: 2,
    petsAllowed: false,
    telephone: '+5493513394868',
    containedInPlace: { '@type': 'Place', name: 'Yofre Sud, Córdoba, Argentina' },
    amenityFeature: [
      'Wi-Fi', 'Servicios incluidos', 'Espacio amueblado', 'Lavadora',
      'Estacionamiento para motos', 'Cámaras de seguridad', 'Ambiente tranquilo',
    ].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
  },
};
const jsonLd = JSON.stringify(structuredData).replaceAll('<', '\\u003c');
let html = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');
const whatsapp = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`;
html = html.replaceAll('{{whatsapp}}', escape(whatsapp))
  .replaceAll(/\{\{icon:(\w+)\}\}/g, (_, name) => icon(name))
  .replaceAll(/\{\{photo:([^|]+)\|([^|]+)\|([^|}]+)(?:\|([^}]+))?\}\}/g, (_, name, alt, cls, priority) => photo(name, alt, cls, priority === 'hero'))
  .replace('{{gallery}}', galleryEntries.map(([name, caption], index) => `<a class="gallery-item" href="./media/${name}-1280.jpg" data-caption="${escape(caption)}" aria-label="Ver foto ${index + 1}: ${escape(caption)}">${photo(name, caption, 'gallery-photo')}</a>`).join('\n'))
  .replace('{{email}}', config.email ? `<a class="email-link" href="mailto:${escape(config.email)}">También podés escribirnos por email</a>` : '')
  .replace('{{captions}}', config.captions ? `<track kind="captions" src="${escape(config.captions)}" srclang="es" label="Español">` : '')
  .replaceAll('{{socialImage}}', escape(socialImageUrl))
  .replace('{{canonical}}', escape(canonicalUrl))
  .replace('{{metadata}}', `<link rel="canonical" href="${escape(canonicalUrl)}"><script type="application/ld+json">${jsonLd}</script>`);
if (/\{\{/.test(html)) throw new Error('Unresolved template value');
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
await writeFile('dist/index.html', html);
await cp('src/styles.css', 'dist/styles.css');
await cp('src/app.js', 'dist/app.js');
console.log('Built static site in dist/ (no runtime dependencies).');
