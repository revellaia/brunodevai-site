#!/usr/bin/env node
/* Media budget + orphan gate for the deployable tree.
   node tools/media-budget.mjs           -> relatorio + exit 1 se algum gate reprovar
   node tools/media-budget.mjs --json    -> mesmo resultado em JSON

   Gates (baseline + regression guard; nao e um alvo impossivel):
   - DEPLOYABLE_BUDGET_MIB: baseline pos-otimizacao + 5 MiB. Crescer alem disso exige revisao explicita
     e atualizacao consciente deste numero no mesmo commit.
   - ORPHAN: nenhuma midia rastreada > 100 KB sem referencia (literal ou via ADAPTIVE_MEDIA_SETS).
     Caminhos contendo ARCHIVE, MASTER ou RECOVERY sao ignorados — e nem deveriam estar no repo implantavel. */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const DEPLOYABLE_BUDGET_MIB = 107;
const TARGET_MIB = 60; // objetivo de longo prazo (informativo)
const ORPHAN_MIN_BYTES = 100 * 1024;
const MEDIA = /\.(mp4|webm|webp|avif|jpe?g|png|svg|gif|woff2?|ttf|otf)$/i;
const CODE = /\.(html|js|mjs|css|json|xml|txt|webmanifest)$/i;
const EXEMPT = /(ARCHIVE|MASTER|RECOVERY)/;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tracked = execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(f => f && fs.existsSync(path.join(root, f)));
const size = f => fs.statSync(path.join(root, f)).size;
const mib = b => +(b / 1048576).toFixed(2);

/* Referencias dinamicas: executa o bloco real de createAdaptiveSet/ADAPTIVE_MEDIA_SETS do index.html. */
function adaptivePaths() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const start = html.indexOf('const createAdaptiveSet=');
  const setsAt = html.indexOf('const ADAPTIVE_MEDIA_SETS=', start);
  const end = html.indexOf('\n});', setsAt);
  if (start < 0 || setsAt < 0 || end < 0) throw new Error('ADAPTIVE_MEDIA_SETS block not found in index.html');
  const sets = vm.runInNewContext(`${html.slice(start, end + 4)};ADAPTIVE_MEDIA_SETS`, {});
  const out = new Set();
  for (const set of Object.values(sets)) for (const p of Object.values(set)) { out.add(p.videoSrc); out.add(p.posterSrc); }
  return out;
}

const dynamic = adaptivePaths();
const code = tracked.filter(f => CODE.test(f)).map(f => ({ f, t: fs.readFileSync(path.join(root, f), 'utf8') }));
const media = tracked.filter(f => MEDIA.test(f));
const referenced = f => dynamic.has(f) || code.some(c => c.f !== f && c.t.includes(path.posix.basename(f)));
const missingDynamic = [...dynamic].filter(p => !tracked.includes(p));

const total = tracked.reduce((a, f) => a + size(f), 0);
const sum = re => media.filter(f => re.test(f)).reduce((a, f) => a + size(f), 0);
const unreferenced = media.filter(f => !referenced(f) && !EXEMPT.test(f)).map(f => ({ path: f, bytes: size(f) }));
const orphans = unreferenced.filter(o => o.bytes > ORPHAN_MIN_BYTES);

const report = {
  TOTAL_REPO_DEPLOYABLE_SIZE_MIB: mib(total),
  TOTAL_MEDIA_SIZE_MIB: mib(sum(MEDIA)),
  TOTAL_MP4_SIZE_MIB: mib(sum(/\.mp4$/i)),
  LARGEST_20_FILES: tracked.map(f => ({ path: f, mib: mib(size(f)) })).sort((a, b) => b.mib - a.mib).slice(0, 20),
  UNREFERENCED_MEDIA: unreferenced.map(o => ({ path: o.path, kib: +(o.bytes / 1024).toFixed(1) })),
  MISSING_DYNAMIC_MEDIA: missingDynamic,
  gates: {
    budget: { limit_mib: DEPLOYABLE_BUDGET_MIB, target_mib: TARGET_MIB, pass: mib(total) <= DEPLOYABLE_BUDGET_MIB },
    orphan: { min_kib: ORPHAN_MIN_BYTES / 1024, count: orphans.length, pass: orphans.length === 0 },
    dynamic_media_present: { missing: missingDynamic.length, pass: missingDynamic.length === 0 },
  },
};
const pass = Object.values(report.gates).every(g => g.pass);

if (process.argv.includes('--json')) console.log(JSON.stringify({ ...report, pass }, null, 2));
else {
  console.log(`TOTAL_REPO_DEPLOYABLE_SIZE ${report.TOTAL_REPO_DEPLOYABLE_SIZE_MIB} MiB (budget ${DEPLOYABLE_BUDGET_MIB}, target ${TARGET_MIB})`);
  console.log(`TOTAL_MEDIA_SIZE ${report.TOTAL_MEDIA_SIZE_MIB} MiB · TOTAL_MP4_SIZE ${report.TOTAL_MP4_SIZE_MIB} MiB`);
  console.log('LARGEST_20_FILES'); for (const x of report.LARGEST_20_FILES) console.log(`  ${x.mib.toFixed(2).padStart(6)} MiB  ${x.path}`);
  console.log(`UNREFERENCED_MEDIA ${unreferenced.length}`); for (const o of report.UNREFERENCED_MEDIA) console.log(`  ${o.kib} KiB  ${o.path}`);
  if (missingDynamic.length) { console.log('MISSING_DYNAMIC_MEDIA'); for (const m of missingDynamic) console.log(`  ${m}`); }
  for (const [k, g] of Object.entries(report.gates)) console.log(`GATE ${k}: ${g.pass ? 'PASS' : 'FAIL'}`);
  console.log(pass ? 'MEDIA_BUDGET=PASS' : 'MEDIA_BUDGET=FAIL');
}
process.exit(pass ? 0 : 1);
