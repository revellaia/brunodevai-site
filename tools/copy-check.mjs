#!/usr/bin/env node
/* Gate de copy (AC-07): todo COPY_ID tem PT e EN nao vazios; relata o que nao pode ir para producao.
   node tools/copy-check.mjs  -> exit 1 se faltar texto em algum idioma. */
import { COPY, LANGS, statusFor } from './lib/copy.mjs';

const ids = Object.keys(COPY);
const missing = [];
const blocked = { TBC: [], REVISE_BEFORE_FREEZE: [], ALTERNATIVE: [] };
for (const id of ids) {
  for (const lang of LANGS) {
    const v = COPY[id][lang];
    if (typeof v !== 'string' || !v.trim()) missing.push(`${id} [${lang}]`);
    const st = statusFor(COPY[id], lang);
    for (const k of Object.keys(blocked)) if (st.startsWith(k)) blocked[k].push(`${id} [${lang}]`);
  }
}
console.log(`COPY_IDS ${ids.length} · idiomas ${LANGS.join('/')}`);
console.log(`MISSING ${missing.length}`); missing.forEach(m => console.log(`  ${m}`));
for (const [k, list] of Object.entries(blocked)) {
  console.log(`${k} ${list.length} (nunca em producao${k === 'TBC' ? ', nunca renderizado' : ' antes do Gate 2'})`);
  list.forEach(m => console.log(`  ${m}`));
}
console.log(missing.length ? 'COPY=FAIL' : 'COPY=PASS');
process.exit(missing.length ? 1 : 0);
