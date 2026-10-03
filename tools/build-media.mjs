#!/usr/bin/env node
/* BRUNO DEV.AI V3 · enquadramento de midia: data/media-framing.json -> src/media.css (gerado; nao editar a mao).
   node tools/build-media.mjs           -> escreve src/media.css
   node tools/build-media.mjs --check   -> exit 1 se src/media.css estiver desatualizado

   Fonte: 07_MEDIA/MEDIA_FRAMING_MANIFEST.json do handoff V3 (copiado byte a byte). Regra: MEDIA COMPOSITION >
   CONTAINER CONVENIENCE. Cada midia critica tem fit + posicao + proporcao por breakpoint; nada de cover/center
   global. A CSP proibe style="" inline, entao o framing vive aqui, por seletor [data-adm="<asset_id>"].
   NATURAL_RATIO -> container com a proporcao nativa + object-fit: contain (nunca corta, mesmo se a proporcao divergir).
   ART_DIRECTED_CROP / COVER -> object-fit: cover + object-position do manifest (corte deliberado, zona segura documentada).
   CONTAIN -> object-fit: contain. Midia DECORATIVE nao recebe aspect-ratio (preenche a secao). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/media-framing.json'), 'utf8'));
const OUT = path.join(root, 'src/media.css');

/* faixa mobile-first -> chave do manifest */
const BANDS = [[0, 'mobile_390'], [430, 'mobile_430'], [768, 'tablet_768'], [1024, 'tablet_1024'], [1200, 'desktop_1366'], [1440, 'desktop_1440'], [1600, 'desktop_1920']];
const FIT = { NATURAL_RATIO: 'contain', ART_DIRECTED_CROP: 'cover', COVER: 'cover', CONTAIN: 'contain' };

const out = [];
const perBand = BANDS.map(() => []);
let rules = 0;
for (const m of manifest.media) {
  const sel = `[data-adm="${m.asset_id}"]`;
  const decorative = m.role === 'DECORATIVE';
  const brand = m.role === 'BRAND';
  out.push(`/* ${m.asset_id} · ${m.native_width}x${m.native_height} (${m.native_aspect_ratio}) · ${m.role} · safe: ${m.safe_crop_zone} */`);
  let prev = {};
  BANDS.forEach(([, key], bi) => {
    const f = m.framing[key];
    if (!f) throw new Error(`${m.asset_id}: framing.${key} ausente`);
    if (!FIT[f.fit_mode]) throw new Error(`${m.asset_id}.${key}: fit_mode desconhecido ${f.fit_mode}`);
    const ratio = typeof f.container_aspect_ratio === 'number' && !decorative && !brand ? String(f.container_aspect_ratio) : null;
    const pos = f.object_position && f.object_position !== '—' ? f.object_position : '50% 50%';
    const fit = FIT[f.fit_mode];
    const why = `${f.fit_mode}${f.crop_percent_estimate ? ` · crop ~${f.crop_percent_estimate}%` : ''} · src ${f.source_used}`;
    const lines = [];
    if (ratio && ratio !== prev.ratio) lines.push(`  ${sel} { aspect-ratio: ${ratio}; }`);
    if (!brand && (fit !== prev.fit || pos !== prev.pos)) lines.push(`  ${sel} .adm-m { object-fit: ${fit}; object-position: ${pos}; } /* ${why} */`);
    if (lines.length) { (bi === 0 ? out : perBand[bi]).push(...(bi === 0 ? lines.map(l => l.slice(2)) : lines)); rules += lines.length; }
    prev = { ratio: ratio || prev.ratio, fit, pos };
  });
}
let css = `/* GERADO por tools/build-media.mjs a partir de data/media-framing.json (${manifest.$meta.date} · ${manifest.$meta.rule}).
   Nao editar a mao. Mudanca de framing = atualizar o manifest + contact sheet (07_MEDIA/MEDIA_FRAMING_GUIDE.md). */
${out.join('\n')}
`;
BANDS.slice(1).forEach(([min, key], i) => {
  const r = perBand[i + 1];
  if (r.length) css += `@media (min-width: ${min}px) { /* ${key} */\n${r.join('\n')}\n}\n`;
});

if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== css) { console.error('MEDIA_CSS=STALE (rode node tools/build-media.mjs)'); process.exit(1); }
  console.log(`MEDIA_CSS=FRESH (${manifest.media.length} midias)`);
} else {
  fs.writeFileSync(OUT, css);
  console.log(`MEDIA_CSS ${manifest.media.length} midias · ${rules} regras -> src/media.css`);
}
