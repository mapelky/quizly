import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

test('ships noindex before JavaScript and a global hosting header rule', async () => {
  assert.match(await readFile('index.html', 'utf8'), /<meta name="robots" content="noindex, nofollow"/);
  assert.match(await readFile('public/_headers', 'utf8'), /^\/\*\s+X-Robots-Tag: noindex, nofollow/m);
});

test('ships the original React Bits notice with the app', async () => {
  assert.equal(await readFile('public/licenses/react-bits-LICENSE.txt', 'utf8'), await readFile('src/components/react-bits/LICENSE.md', 'utf8'));
});

test('keeps review sources outside public and excludes generated benches', async () => {
  await assert.rejects(access('public/prototypes'));
  await assert.rejects(access('public/hairline/network-preview.html'));
  for (const name of ['island', 'layers', 'rack']) await access(`design/network/${name}.js`);
});
