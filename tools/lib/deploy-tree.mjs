/* Arvore implantavel = arquivos rastreados pelo Git MENOS o que .vercelignore exclui.
   Suporta os padroes usados aqui: "dir/" (prefixo), "*.ext" (qualquer nivel) e caminho exato. */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function ignorePatterns() {
  const f = path.join(root, '.vercelignore');
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
}

export function isIgnored(rel, patterns = ignorePatterns()) {
  const p = rel.replace(/\\/g, '/').replace(/^\/+/, '');
  if (p === '.vercelignore') return true;
  return patterns.some(pt => {
    if (pt.endsWith('/')) return p.startsWith(pt) || p === pt.slice(0, -1);
    if (pt.startsWith('*.')) return p.endsWith(pt.slice(1));
    return p === pt;
  });
}

/* Rastreados + novos ainda nao commitados (sem os do .gitignore), presentes no disco: o que iria para o
   deploy se a arvore atual fosse commitada. Uma delecao nao commitada nao conta como implantavel. */
export function trackedFiles() {
  return execFileSync('git', ['-C', root, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
    .split('\0').filter((f, i, a) => f && a.indexOf(f) === i && fs.existsSync(path.join(root, f)));
}

export function deployableFiles() {
  const pats = ignorePatterns();
  return trackedFiles().filter(f => !isIgnored(f, pats));
}

export const size = f => fs.statSync(path.join(root, f)).size;
