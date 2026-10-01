#!/usr/bin/env node
/* WORLDCRAFT · Engineering Proof gerado do build real (TBC-020): nunca valores escritos a mao.
   node tools/build-proof.mjs  -> src/proof.json (dados medidos; a apresentacao PT/EN fica nos templates).
   Fontes: media gate, arvore implantavel, fontes, vercel.json, varredura de origens externas,
   baseline de producao (git) e data/qa-summary.json (escrito pelo harness de QA real, se existir).
   Fronteira de seguranca: sem versoes de software, endpoints, IDs de deploy ou dados privados. */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { root, deployableFiles, size } from './lib/deploy-tree.mjs';

const OUT = 'src/proof.json';
const files = deployableFiles().filter(f => f !== OUT);
const read = f => fs.readFileSync(path.join(root, f));
const mib = b => +(b / 1048576).toFixed(2);
const kb = b => +(b / 1024).toFixed(1);
const gz = list => list.reduce((a, f) => a + zlib.gzipSync(read(f), { level: 9 }).length, 0);
const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' }).trim();

/* O gate sai com 1 quando reprova: a prova registra PASS/FAIL em vez de abortar. */
const media = JSON.parse(spawnSync(process.execPath, [path.join(root, 'tools/media-budget.mjs'), '--json'], { encoding: 'utf8' }).stdout);
const headers = (JSON.parse(read('vercel.json')).headers || []).flatMap(h => h.headers);
const header = k => (headers.find(h => h.key.toLowerCase() === k.toLowerCase()) || {}).value || null;
const csp = header('Content-Security-Policy') || '';

/* Origens externas carregadas como RECURSO (nao conta <a href>, canonical/alternate). */
const external = new Set();
for (const f of files.filter(x => /\.(html|css|js)$/.test(x))) {
  const t = read(f).toString('utf8');
  for (const m of t.matchAll(/<(script|link|img|source|video|audio|iframe)\b[^>]*?\s(?:src|href|srcset)=["'](?:https?:)?\/\/([^/"'\s]+)/gi)) {
    if (/rel=["'](?:canonical|alternate)["']/i.test(m[0])) continue;
    external.add(m[2]);
  }
  for (const m of t.matchAll(/url\(\s*["']?(?:https?:)?\/\/([^/"')]+)/gi)) external.add(m[1]);
}

/* Baseline: a arvore da producao pre-WORLDCRAFT, medida do proprio Git quando o commit existe. */
const baseline = JSON.parse(read('data/proof-baseline.json'));
try {
  git('cat-file', '-e', `${baseline.commit}^{tree}`);
  const bytes = git('ls-tree', '-r', '-l', baseline.commit).split('\n').reduce((a, l) => a + (+l.split(/\s+/)[3] || 0), 0);
  baseline.tree_mib = mib(bytes);
  baseline.source = `git ls-tree ${baseline.commit}`;
} catch { baseline.source = `recorded ${baseline.measured}`; }

const sumOf = re => files.filter(f => re.test(f)).reduce((a, f) => a + size(f), 0);
const critFonts = files.filter(f => /^assets\/fonts\/wc-.*-latin\.woff2$/.test(f));
const runtimeJs = files.filter(f => /^(src\/.*|assets\/contact-flow)\.js$/.test(f));
const runtimeCss = files.filter(f => /^src\/.*\.css$/.test(f));
const qaFile = path.join(root, 'data/qa-summary.json');
const qa = fs.existsSync(qaFile) ? JSON.parse(fs.readFileSync(qaFile, 'utf8')) : null;

let commit = 'uncommitted';
try { commit = git('rev-parse', '--short', 'HEAD'); } catch { /* sem git */ }

const proof = {
  $meta: {
    generator: 'tools/build-proof.mjs',
    base_commit: commit,
    note: 'Measured from the real tree. qa = last local QA run (null = not measured yet, rows depending on it are omitted). Do not edit by hand.',
  },
  media: {
    tree_mib: media.TOTAL_REPO_DEPLOYABLE_SIZE_MIB, budget_mib: media.gates.budget.limit_mib, target_mib: media.gates.budget.target_mib,
    mp4_mib: media.TOTAL_MP4_SIZE_MIB, media_mib: media.TOTAL_MEDIA_SIZE_MIB, orphans: media.UNREFERENCED_MEDIA.length, pass: media.pass,
    hero_desktop_mib: mib(sumOf(/^assets\/cinematic\/presence-landscape\.mp4$/)),
    hero_mobile_mib: mib(sumOf(/^assets\/cinematic\/presence-landscape-mobile-portrait\.mp4$/)),
  },
  baseline,
  fonts: { critical_files: critFonts.length, critical_kb: kb(critFonts.reduce((a, f) => a + size(f), 0)), cdn: false },
  runtime: { js_files: runtimeJs.length, js_gz_kb: kb(gz(runtimeJs)), css_files: runtimeCss.length, css_gz_kb: kb(gz(runtimeCss)) },
  security: { csp_self: /default-src 'self'/.test(csp), xfo: header('X-Frame-Options'), third_party_origins: [...external].sort() },
  targets: { wcag: '2.2 AA', lcp_s: 2.5, inp_ms: 200, cls: 0.05 },
  qa,
};
fs.writeFileSync(path.join(root, OUT), JSON.stringify(proof, null, 2) + '\n');
console.log(`PROOF tree ${proof.media.tree_mib} MiB (baseline ${baseline.commit} ${baseline.tree_mib} MiB) · gate ${media.pass ? 'PASS' : 'FAIL'} · 3P ${external.size} · JS ${proof.runtime.js_gz_kb} KB gz · CSS ${proof.runtime.css_gz_kb} KB gz · QA ${qa ? qa.at : 'none'}`);
