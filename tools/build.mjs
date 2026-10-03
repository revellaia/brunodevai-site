#!/usr/bin/env node
/* BRUNO DEV.AI V3 · build local (nada roda no Vercel; os artefatos gerados sao commitados).
   node tools/build.mjs          -> tokens -> media (framing) -> proof -> paginas (2 passadas: a prova mede a arvore que inclui as paginas)
   node tools/build.mjs --check  -> tokens/media/paginas atualizados + copy + media gate; exit 1 se algo falhar */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { root } from './lib/deploy-tree.mjs';

const run = (script, ...args) => execFileSync(process.execPath, [path.join(root, 'tools', script), ...args], { stdio: 'inherit' });
if (process.argv.includes('--check')) {
  run('build-tokens.mjs', '--check');
  run('build-media.mjs', '--check');
  run('copy-check.mjs');
  run('build-pages.mjs', '--check');
  run('media-budget.mjs');
} else {
  run('build-tokens.mjs');
  run('build-media.mjs');
  run('build-proof.mjs');
  run('build-pages.mjs');
  run('build-proof.mjs');
  run('build-pages.mjs');
}
