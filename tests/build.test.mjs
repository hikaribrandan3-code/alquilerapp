import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { config } from '../src/config.mjs';
const html = await readFile('dist/index.html', 'utf8');
test('all WhatsApp links target the confirmed contact and exact message', () => {
  const links = [...html.matchAll(/href="(https:\/\/wa.me\/[^\"]+)"/g)];
  assert.equal(links.length, 3);
  for (const [, link] of links) { const url = new URL(link); assert.equal(url.pathname.slice(1), config.whatsappNumber); assert.equal(url.searchParams.get('text'), config.whatsappMessage); }
});
test('email stays private and the verified production URL is canonical', () => { assert(!html.includes('mailto:')); assert.match(html, /<link rel="canonical" href="https:\/\/alquilerapp\.vercel\.app\/">/); });
test('tour is between introduction and rooms with no initial media URL', () => { assert(html.indexOf('id="el-lugar"') < html.indexOf('id="recorrido"')); assert(html.indexOf('id="recorrido"') < html.indexOf('id="habitaciones"')); const video = html.match(/<video id="tour-video"[^>]*>/)[0]; assert(!/\ssrc=/.test(video)); });
test('social card metadata references the production image', () => { assert.match(html, /<meta property="og:image" content="https:\/\/alquilerapp\.vercel\.app\/social-preview\.jpg">/); assert.match(html, /<meta property="og:image:width" content="1200">/); assert.match(html, /<meta property="og:image:height" content="630">/); assert.match(html, /<meta name="twitter:card" content="summary_large_image">/); });
test('structured data uses only confirmed property facts', () => { const data = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]); assert.equal(data['@type'], 'WebPage'); assert.equal(data.inLanguage, 'es-AR'); assert.equal(data.mainEntity['@type'], 'Accommodation'); assert.equal(data.mainEntity.numberOfRooms, 3); assert.equal(data.mainEntity.numberOfBathroomsTotal, 2); assert.equal(data.mainEntity.petsAllowed, false); assert(!JSON.stringify(data).includes('streetAddress')); });
