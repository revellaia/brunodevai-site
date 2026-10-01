#!/usr/bin/env node
/* Servidor local para QA: aplica os MESMOS headers do vercel.json (CSP inclusa), indice de diretorio
   e Range (video). Sem dependencias.
   node tools/serve.mjs [porta]               -> modo dev (serve tudo, inclusive _worldcraft/ e data/)
   node tools/serve.mjs [porta] --deploy-sim  -> so a arvore implantavel (404 para o que .vercelignore exclui) */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { root, isIgnored, ignorePatterns } from './lib/deploy-tree.mjs';

const port = Number(process.argv.find(a => /^\d+$/.test(a)) || 4173);
const deploySim = process.argv.includes('--deploy-sim');
const pats = ignorePatterns();
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm',
};
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const headerRules = (vercel.headers || []).map(r => ({ re: new RegExp('^' + r.source + '$'), headers: r.headers }));

function resolve(urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  if (rel.split('/').includes('..') || rel.startsWith('.git')) return null;
  let abs = path.join(root, rel);
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) { rel = path.posix.join(rel, 'index.html'); abs = path.join(root, rel); }
  if (!fs.existsSync(abs)) return null;
  if (deploySim && isIgnored(rel, pats)) return null;
  return { rel, abs };
}

http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://x').pathname;
  for (const r of headerRules) if (r.re.test(pathname)) for (const h of r.headers) res.setHeader(h.key, h.value);
  const hit = resolve(pathname);
  if (!hit) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404'); }
  const stat = fs.statSync(hit.abs);
  const type = TYPES[path.extname(hit.abs).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (range) {
    const start = range[1] ? +range[1] : 0, end = range[2] ? +range[2] : stat.size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    return fs.createReadStream(hit.abs, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(hit.abs).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`serve: http://127.0.0.1:${port}/ ${deploySim ? '(deploy-sim)' : '(dev)'}`));
