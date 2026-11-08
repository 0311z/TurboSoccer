import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
const root = resolve('out');
const port = Number(process.env.PORT || 3000);
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json'],
  ['.zip', 'application/zip'], ['.md', 'text/plain; charset=utf-8'], ['.sha256', 'text/plain; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.png', 'image/png'], ['.webp', 'image/webp'],
  ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'], ['.txt', 'text/plain; charset=utf-8'], ['.xml', 'application/xml'],
]);
createServer(async (request, response) => {
  const started = performance.now();
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
    }
    const url = new URL(request.url || '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    try {
      const info = await stat(file);
      if (info.isDirectory()) file = resolve(file, 'index.html');
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': mime.get(extname(file)) || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      let body = 'Page not found';
      try { body = await readFile(resolve(root, '404.html'), 'utf8'); } catch { /* WHY: Una exportación ausente conserva el 404. */ }
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : body);
    }
  } catch (error) {
    console.error('[TSV][preview] FAIL', { message: error instanceof Error ? error.message : 'Invalid request', duration: performance.now() - started });
    if (!response.headersSent) response.writeHead(400);
    response.end('Invalid request');
  }
}).listen(port, '0.0.0.0', () => console.log(`[TSV][preview] OK http://localhost:${port}`));
