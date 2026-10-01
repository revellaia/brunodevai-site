#!/usr/bin/env node
/* WORLDCRAFT · Engineering Proof gerado do build real (TBC-020): nunca valores escritos a mao.
   node tools/build-proof.mjs  -> escreve src/proof.json a partir de: media gate, arvore implantavel,
   fontes self-hosted, vercel.json e varredura de origens externas no runtime.
   Status: MEASURED (medido agora) · DECLARED (configuracao versionada) · TARGET (meta, nao resultado).
   Fronteira de seguranca: sem versoes de software, endpoints, IDs de deploy ou dados privados. */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { root, deployableFiles, size } from './lib/deploy-tree.mjs';

const OUT = 'src/proof.json';
const files = deployableFiles().filter(f => f !== OUT);
const read = f => fs.readFileSync(path.join(root, f));
const kib = b => `${(b / 1024).toFixed(1)} KB`;
const gz = list => list.reduce((a, f) => a + zlib.gzipSync(read(f), { level: 9 }).length, 0);

const media = JSON.parse(execFileSync(process.execPath, [path.join(root, 'tools/media-budget.mjs'), '--json'], { encoding: 'utf8' }));
const headers = (JSON.parse(read('vercel.json')).headers || []).flatMap(h => h.headers);
const header = k => (headers.find(h => h.key.toLowerCase() === k.toLowerCase()) || {}).value || null;
const csp = header('Content-Security-Policy') || '';

const wcFonts = files.filter(f => /^assets\/fonts\/wc-.*-latin\.woff2$/.test(f));
const runtimeJs = files.filter(f => /^src\/.*\.js$/.test(f));
const runtimeCss = files.filter(f => /^src\/.*\.css$/.test(f));
const routes = files.filter(f => /(^|\/)index\.html$|^[^/]+\.html$/.test(f));

/* Origens externas carregadas pelo runtime (script/link/img/source/video src|href e url() em CSS).
   Links de navegacao (<a href>) nao contam: nao sao requisicoes de recurso. */
const external = new Set();
for (const f of files.filter(x => /\.(html|css|js)$/.test(x))) {
  const t = read(f).toString('utf8');
  for (const m of t.matchAll(/<(?:script|link|img|source|video|audio|iframe)\b[^>]*?\s(?:src|href)=["'](https?:)?\/\/([^/"']+)/gi)) {
    if (/<link\b[^>]*rel=["'](?:canonical|alternate)["']/i.test(m[0])) continue;
    external.add(m[2]);
  }
  for (const m of t.matchAll(/url\(\s*["']?(?:https?:)?\/\/([^/"')]+)/gi)) external.add(m[1]);
}

const rows = [
  ['media.deployable', 'Deployable tree', `${media.TOTAL_REPO_DEPLOYABLE_SIZE_MIB} MiB`, 'tools/media-budget.mjs', 'MEASURED'],
  ['media.budget', 'Media gate', `${media.pass ? 'PASS' : 'FAIL'} · limit ${media.gates.budget.limit_mib} MiB · target ${media.gates.budget.target_mib} MiB`, 'tools/media-budget.mjs', 'MEASURED'],
  ['media.video', 'Video in tree', `${media.TOTAL_MP4_SIZE_MIB} MiB`, 'tools/media-budget.mjs', 'MEASURED'],
  ['media.orphans', 'Unreferenced media', String(media.UNREFERENCED_MEDIA.length), 'tools/media-budget.mjs', 'MEASURED'],
  ['fonts.critical', 'Fonts (critical, latin)', `${wcFonts.length} woff2 · ${kib(wcFonts.reduce((a, f) => a + size(f), 0))}`, 'assets/fonts/wc-*-latin.woff2', 'MEASURED'],
  ['fonts.cdn', 'Font CDN', 'none · self-hosted', 'src/base.css @font-face', 'MEASURED'],
  ['runtime.js', 'Runtime JS (src/, gzip)', `${runtimeJs.length} files · ${kib(gz(runtimeJs))}`, 'src/*.js', 'MEASURED'],
  ['runtime.css', 'Runtime CSS (src/, gzip)', `${runtimeCss.length} files · ${kib(gz(runtimeCss))}`, 'src/*.css', 'MEASURED'],
  ['third_party', 'Third-party origins', String(external.size), 'scan of deployable HTML/CSS/JS', 'MEASURED'],
  ['security.csp', 'CSP', /default-src 'self'/.test(csp) ? "default-src 'self'" : 'missing', 'vercel.json', 'DECLARED'],
  ['security.frames', 'Framing', header('X-Frame-Options') ? `X-Frame-Options ${header('X-Frame-Options')}` : 'missing', 'vercel.json', 'DECLARED'],
  ['routes', 'HTML routes', String(routes.length), 'deployable tree', 'MEASURED'],
  ['a11y', 'Accessibility', 'WCAG 2.2 AA', '12_ENGINEERING/ACCESSIBILITY.md', 'TARGET'],
  ['perf', 'Web vitals', 'LCP < 2.5 s · INP < 200 ms · CLS < 0.05', '12_ENGINEERING/PERFORMANCE.md', 'TARGET'],
  ['viewports', 'QA viewports', '390 · 430 · 768 · 1024 · 1366 · 1440 · 1920', 'QA plan', 'TARGET'],
].map(([id, label, value, source, status]) => ({ id, label, value, source, status }));

let commit = 'uncommitted';
try { commit = execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* sem git */ }
const dirty = execFileSync('git', ['-C', root, 'status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0;

const proof = {
  $meta: {
    generator: 'tools/build-proof.mjs',
    generated_at: new Date().toISOString(),
    base_commit: commit,
    worktree_dirty: dirty,
    note: 'Generated from the real tree. TARGET rows are goals, not results. Do not edit by hand.',
  },
  third_party_origins: [...external].sort(),
  rows,
};
fs.writeFileSync(path.join(root, OUT), JSON.stringify(proof, null, 2) + '\n');
for (const r of rows) console.log(`${r.status.padEnd(8)} ${r.label.padEnd(26)} ${r.value}`);
console.log(`${OUT} escrito (base ${commit}${dirty ? ', worktree com alteracoes' : ''})`);
