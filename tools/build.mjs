#!/usr/bin/env node
/* WORLDCRAFT · build local (nada roda no Vercel; os artefatos gerados sao commitados).
   node tools/build.mjs          -> tokens -> proof -> paginas (2 passadas: a prova mede a arvore que inclui as paginas)
   node tools/build.mjs --check  -> tokens/paginas atualizados + copy + media gate; exit 1 se algo falhar */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { root } from './lib/deploy-tree.mjs';

const run = (script, ...args) => execFileSync(process.execPath, [path.join(root, 'tools', script), ...args], { stdio: 'inherit' });
if (process.argv.includes('--check')) {
  run('build-tokens.mjs', '--check');
  run('copy-check.mjs');
  run('build-pages.mjs', '--check');
  run('media-budget.mjs');
} else {
  run('build-tokens.mjs');
  run('build-proof.mjs');
  run('build-pages.mjs');
  run('build-proof.mjs');
  run('build-pages.mjs');
}
