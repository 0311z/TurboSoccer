import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const verifier = resolve(import.meta.dirname, 'verify-export.mjs');
function page(body, head = '') { return `<html lang="en"><head><title>Test catalog</title>${head}</head><body><main><h1>Item catalog</h1>${body}</main></body></html>`; }
async function check(files) {
  const directory = await mkdtemp(join(tmpdir(), 'tsv-export-test-'));
  try {
    for (const [path, html] of Object.entries(files)) {
      const full = join(directory, path);
      await mkdir(resolve(full, '..'), { recursive: true });
      await writeFile(full, html);
    }
    const result = spawnSync(process.execPath, [verifier, directory], { encoding: 'utf8' });
    return { status: result.status, output: result.stdout + result.stderr };
  } finally { await rm(directory, { recursive: true, force: true }); }
}
test('export verifier accepts complete landmarks, links and JSON-LD', async () => {
  const result = await check({ 'index.html': page('<a href="/items/rally/#facts">Rally</a>', '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>'), 'items/rally/index.html': page('<p id="facts">Cosmetic</p>') });
  assert.equal(result.status, 0, result.output);
});
test('export verifier rejects missing assets and broken anchor fragments', async () => {
  const result = await check({ 'index.html': page('<a href="#missing">Jump</a><img src="/missing.webp" alt="Item" width="128" height="128">') });
  assert.equal(result.status, 1);
  assert.match(result.output, /missing \/missing.webp/);
  assert.match(result.output, /missing fragment/);
});
test('export verifier rejects duplicate IDs and absent page headings', async () => {
  const result = await check({ 'index.html': page('<p id="same">One</p><p id="same">Two</p>').replace('<h1>Item catalog</h1>', '') });
  assert.equal(result.status, 1);
  assert.match(result.output, /duplicate id same/);
  assert.match(result.output, /expected one h1/);
});
test('export verifier requires noindex on account routes', async () => {
  const denied = await check({ 'profile/index.html': page('Profile') });
  assert.equal(denied.status, 1);
  assert.match(denied.output, /must be noindex/);
  const accepted = await check({ 'profile/index.html': page('Profile', '<meta name="robots" content="noindex,follow">') });
  assert.equal(accepted.status, 0, accepted.output);
});
test('export verifier rejects malformed structured data', async () => {
  const result = await check({ 'index.html': page('', '<script type="application/ld+json">{"name":broken}</script>') });
  assert.equal(result.status, 1);
  assert.match(result.output, /invalid JSON-LD/);
});
