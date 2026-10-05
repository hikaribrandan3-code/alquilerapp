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
test('email and canonical are omitted until confirmed', () => { assert(!html.includes('mailto:')); assert(!html.includes('rel="canonical"')); });
test('tour is between introduction and rooms with no initial media URL', () => { assert(html.indexOf('id="el-lugar"') < html.indexOf('id="recorrido"')); assert(html.indexOf('id="recorrido"') < html.indexOf('id="habitaciones"')); const video = html.match(/<video[^>]+>/)[0]; assert(!/\ssrc=/.test(video)); });
