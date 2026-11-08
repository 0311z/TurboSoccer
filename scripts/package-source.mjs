import { readdir, readFile, mkdir, writeFile, rename, lstat } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '..');
const destination = join(root, 'public/downloads');
const directories = ['src', 'data', 'supabase', 'scripts', 'docs', 'public', '.github', '.openai'];
const rootFiles = ['package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts', 'next-env.d.ts', 'postcss.config.mjs', 'eslint.config.mjs', '.gitignore', '.gitattributes', '.nvmrc', '.env.example', '.cursorrules', 'README.md', 'skills.lock.json'];
const omitted = new Set(['node_modules', '.next', 'out', '.git', 'downloads', 'assets-src', 'work', '.env.local']);
const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  return value >>> 0;
});
function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) value = (value >>> 8) ^ crcTable[(value ^ byte) & 0xff];
  return (value ^ 0xffffffff) >>> 0;
}
function allowed(name) {
  return !omitted.has(name) && (!name.startsWith('.env') || name === '.env.example') && !/\.(pem|key|p12|pfx|tsbuildinfo)$/i.test(name);
}
async function walk(directory) {
  const files = [];
  try {
    if (!(await lstat(directory)).isDirectory() || (await lstat(directory)).isSymbolicLink()) return files;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!allowed(entry.name) || entry.isSymbolicLink()) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await walk(path));
      else if (entry.isFile()) files.push(path);
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return files;
}
function zip(entries) {
  const local = [], central = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(`turbo-soccer-values/${entry.name}`);
    const compressed = deflateRawSync(entry.body, { level: 9 });
    const checksum = crc32(entry.body);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(8, 8); header.writeUInt16LE(33, 12); header.writeUInt32LE(checksum, 14);
    header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(entry.body.length, 22); header.writeUInt16LE(name.length, 26);
    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50); record.writeUInt16LE(20, 4); record.writeUInt16LE(20, 6);
    record.writeUInt16LE(0x800, 8); record.writeUInt16LE(8, 10); record.writeUInt16LE(33, 14);
    record.writeUInt32LE(checksum, 16); record.writeUInt32LE(compressed.length, 20); record.writeUInt32LE(entry.body.length, 24);
    record.writeUInt16LE(name.length, 28); record.writeUInt32LE(offset, 42);
    local.push(header, name, compressed); central.push(record, name);
    offset += header.length + name.length + compressed.length;
  }
  if (entries.length > 65535 || offset > 0xffffffff) throw new Error('Source exceeds portable ZIP32 limits.');
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}
async function atomicWrite(path, body) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, body); await rename(temporary, path);
}
try {
  const paths = (await Promise.all(directories.map(directory => walk(join(root, directory))))).flat();
  for (const file of rootFiles) {
    try { const info = await lstat(join(root, file)); if (info.isFile() && !info.isSymbolicLink()) paths.push(join(root, file)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const entries = await Promise.all([...new Set(paths)].sort().map(async path => ({ name: relative(root, path).replaceAll('\\', '/'), body: await readFile(path) })));
  const manifest = entries.map(entry => ({ path: entry.name, bytes: entry.body.length, sha256: createHash('sha256').update(entry.body).digest('hex') }));
  entries.push({ name: 'SOURCE-MANIFEST.json', body: Buffer.from(JSON.stringify({ format: 1, files: manifest }, null, 2) + '\n') });
  const archive = zip(entries), name = 'turbo-soccer-values-source.zip';
  await mkdir(destination, { recursive: true });
  await atomicWrite(join(destination, name), archive);
  await atomicWrite(join(destination, `${name}.sha256`), `${createHash('sha256').update(archive).digest('hex')}  ${name}\n`);
  await atomicWrite(join(destination, 'GUIA.md'), await readFile(join(root, 'docs/DELIVERY.md')));
  console.log(`[TSV][package] OK ${manifest.length} source files · ${archive.length} bytes · no dependencies or local environment files`);
} catch (error) {
  console.error('[TSV][package] FAIL', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
}
