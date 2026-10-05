import http from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8' };
const port = Number(process.env.PORT || 4173);
http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filename = path.resolve(root, `.${pathname.endsWith('/') ? pathname + 'index.html' : pathname}`);
    if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const info = await stat(filename);
    if (!info.isFile()) throw new Error('not a file');
    const headers = { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' };
    if (req.headers.range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      const start = match ? Number(match[1]) : -1;
      const end = match && match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (start < 0 || start > end || start >= info.size) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return; }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${info.size}`, 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD') res.end(); else createReadStream(filename, { start, end }).pipe(res);
    } else { res.writeHead(200, { ...headers, 'Content-Length': info.size }); if (req.method === 'HEAD') res.end(); else createReadStream(filename).pipe(res); }
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Página no encontrada'); }
}).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}`));
