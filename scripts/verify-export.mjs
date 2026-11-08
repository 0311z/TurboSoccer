import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join, extname, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
const root = process.argv[2] ? resolve(process.argv[2]) : resolve(import.meta.dirname, '../out');
const errors = [], warnings = [], bytesCache = new Map();
async function walk(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path)); else paths.push(path);
  }
  return paths;
}
function attributes(raw) {
  const map = new Map();
  for (const match of raw.matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    map.set(match[1].toLowerCase(), (match[2] ?? match[3] ?? match[4] ?? '').replaceAll('&amp;', '&').replaceAll('&#x27;', "'"));
  }
  return map;
}
function elements(html) {
  const stripped = html.replace(/<!--[^]*?-->/g, '').replace(/<(script|style)\b([^>]*?)>[^]*?<\/\1\s*>/gi, '<$1$2></$1>');
  return [...stripped.matchAll(/<([a-z][\w:-]*)\b([^>]*?)>/gi)].map(match => ({ tag: match[1].toLowerCase(), attrs: attributes(match[2]) }));
}
async function localTarget(value, page) {
  if (!value || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(value)) return null;
  const base = relative(root, page).replaceAll('\\', '/');
  const url = new URL(value, `https://export.test/${base}`);
  let path;
  try { path = resolve(root, '.' + decodeURIComponent(url.pathname)); }
  catch { errors.push(`${base}: invalid escaped URL ${value}`); return null; }
  if (path !== root && !path.startsWith(root + sep)) { errors.push(`${base}: URL escapes export root`); return null; }
  try { if ((await stat(path)).isDirectory()) path = join(path, 'index.html'); await stat(path); return { path, hash: url.hash }; }
  catch { errors.push(`${base}: missing ${url.pathname}`); return null; }
}
async function compressedBytes(path) {
  if (!bytesCache.has(path)) bytesCache.set(path, gzipSync(await readFile(path)).length);
  return bytesCache.get(path);
}
try {
  const files = await walk(root), pages = files.filter(path => extname(path) === '.html'), budgets = [];
  for (const page of pages) {
    const name = relative(root, page).replaceAll('\\', '/'), html = await readFile(page, 'utf8'), tags = elements(html);
    const ids = new Set(), duplicateIds = new Set();
    for (const element of tags) {
      const id = element.attrs.get('id');
      if (id) { if (ids.has(id)) duplicateIds.add(id); ids.add(id); }
    }
    for (const id of duplicateIds) errors.push(`${name}: duplicate id ${id}`);
    if (!/<html[^>]*\blang=["']en["']/i.test(html)) errors.push(`${name}: English document language missing`);
    if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${name}: page title missing`);
    const noindex = tags.some(tag => tag.tag === 'meta' && tag.attrs.get('name') === 'robots' && tag.attrs.get('content')?.includes('noindex'));
    const headingCount = tags.filter(tag => tag.tag === 'h1').length;
    if (!noindex && headingCount !== 1) errors.push(`${name}: expected one h1, found ${headingCount}`);
    if (tags.filter(tag => tag.tag === 'main').length !== 1) errors.push(`${name}: expected one main landmark`);
    if (/^(?:profile|admin|u|trade|auth)\//.test(name) && !noindex) errors.push(`${name}: private/query route must be noindex`);
    let modern = 0, legacy = 0;
    const loadedScripts = new Set();
    const inlineScripts = [];
    for (const element of tags) {
      if (element.tag === 'img') {
        if (!element.attrs.has('alt')) errors.push(`${name}: image missing alt`);
        if (!element.attrs.has('width') || !element.attrs.has('height')) warnings.push(`${name}: image missing explicit dimensions`);
      }
      for (const key of ['href', 'src']) {
        const target = await localTarget(element.attrs.get(key), page);
        if (!target) continue;
        if (element.tag === 'script' && key === 'src' && extname(target.path) === '.js' && !loadedScripts.has(target.path)) {
          loadedScripts.add(target.path);
          if (element.attrs.has('nomodule')) legacy += await compressedBytes(target.path); else modern += await compressedBytes(target.path);
        }
        if (target.hash && extname(target.path) === '.html') {
          const targetIds = target.path === page ? ids : new Set(elements(await readFile(target.path, 'utf8')).map(tag => tag.attrs.get('id')).filter(Boolean));
          let fragment; try { fragment = decodeURIComponent(target.hash.slice(1)); } catch { fragment = target.hash.slice(1); }
          if (fragment && !targetIds.has(fragment)) errors.push(`${name}: missing fragment ${element.attrs.get(key)}`);
        }
      }
    }
    for (const match of html.matchAll(/<script\b([^>]*?)>([^]*?)<\/script\s*>/gi)) {
      const attrs = attributes(match[1]);
      if (attrs.get('type') !== 'application/ld+json') { if (!attrs.has('src') && match[2].trim()) inlineScripts.push(match[2]); continue; }
      try { JSON.parse(match[2]); } catch { errors.push(`${name}: invalid JSON-LD`); }
    }
    const inline = inlineScripts.length ? gzipSync(Buffer.from(inlineScripts.join('\n'))).length : 0;
    budgets.push({ page: '/' + name.replace(/index\.html$/, ''), modernGzipBytes: modern, inlineGzipBytes: inline, legacyGzipBytes: legacy });
  }
  const values = budgets.find(entry => entry.page === '/values/');
  const indexable = pages.length;
  console.log(`[TSV][export] ${errors.length ? 'FAIL' : 'OK'} ${indexable} HTML files · ${errors.length} errors · ${warnings.length} warnings`);
  if (values) console.log(`[TSV][budget] /values/: modern external ${values.modernGzipBytes} bytes gzip + inline estimate ${values.inlineGzipBytes} + legacy-only ${values.legacyGzipBytes}; target 174080 modern+inline bytes; ${values.modernGzipBytes + values.inlineGzipBytes <= 174080 ? 'PASS' : 'OVER BUDGET'}`);
  for (const error of errors) console.error(`[TSV][export] ${error}`);
  for (const warning of [...new Set(warnings)]) console.warn(`[TSV][export] ${warning}`);
  if (errors.length) process.exitCode = 1;
} catch (error) {
  console.error('[TSV][export] FAIL', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
}
