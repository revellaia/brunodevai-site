#!/usr/bin/env node
/* BRUNO DEV.AI V3 · tokens: data/tokens.json -> src/tokens.css (gerado; nao editar o CSS a mao).
   node tools/build-tokens.mjs           -> escreve src/tokens.css
   node tools/build-tokens.mjs --check   -> exit 1 se src/tokens.css estiver desatualizado

   Fonte: 04_DESIGN_SYSTEM/TOKENS_V3.json do handoff V3 (copiado byte a byte para data/tokens.json).
   Escala tipografica: colunas [>=1600, 1440, 1366, 1024, 768, 430, 390] do TOKENS_V3.
   Valores de layout (header, logo, margem, gutter, paddings) vem da funcao layout(w) do master
   01_MASTER/V3Page.dc.html, a especificacao numerica executavel. Mobile-first: base = 390, e cada
   faixa sobrescreve so o que muda (>=430, >=768, >=1024, >=1200, >=1440, >=1600). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(fs.readFileSync(path.join(root, 'data/tokens.json'), 'utf8'));
const OUT = path.join(root, 'src/tokens.css');

/* Faixas: [min-width, indice da coluna do TOKENS_V3 font.scale]. A coluna "1366" vale para 1200-1439. */
const BANDS = [[0, 6], [430, 5], [768, 4], [1024, 3], [1200, 2], [1440, 1], [1600, 0]];

/* layout(w) do master, por faixa (mesma ordem de BANDS). null = herda a faixa anterior. */
const LAYOUT = {
  'header-h': [76, null, 88, 104, null, null, 112],
  /* Logo OFICIAL completo (03_BRAND/Logo Oficial.png, 2069x760 = 2.7224:1, com tagline e circuito; Owner 2026-10-03).
     O master media 40/42/48/56/60 e 54/60/72 com o recorte antigo 948x302 (3.139:1). Para manter a LARGURA aprovada
     (mesmo espaco no header/footer; wordmark ~94% do aprovado), altura = antiga x 3.139/2.7224 (x1.153). */
  'logo-h': [46, 48, 55, 65, null, null, 69],
  'foot-logo-h': [62, null, 69, 83, null, null, null],
  'm': [20, null, 40, 48, 80, null, 'max(120px, calc((100% - 1520px) / 2))'],
  'g': [12, null, 20, 24, null, null, null],
  'sec-pad': [76, null, 100, 136, null, null, 150],
  'sec-gap': [40, null, null, 60, null, null, null],
  'hero-pad-top': [52, null, 72, 112, null, null, 128],
  'hero-pad-bottom': [56, null, 80, 120, null, null, 136],
  'hero-row-gap': [44, null, 56, null, null, null, null],
  'hero-gap': [24, null, 32, null, null, null, null],
  'cta-gap': [12, null, 30, null, null, null, null],
  'bar-w': [18, null, 36, null, null, null, null],
  'strip-pad': [26, null, 34, null, null, null, null],
  'strip-size': [18, null, 20, 19, 22, null, null],
  'feat-inset': [20, null, 32, 44, null, null, null],
  'work-row-gap': [48, null, 56, 72, null, null, null],
  'work-offset': [0, null, 48, 64, 96, null, null],
  'sys-pad': [20, null, 32, null, null, null, null],
  'panel-pad': [26, null, 48, 72, null, null, null],
  'about-lead': [19, null, 22, 24, null, null, null],
  'contact-bottom': [64, null, 88, 120, null, null, null],
  'wm-right': [-80, null, null, -60, null, null, null],
  /* Emblema OFICIAL (03_BRAND/Logo Fanvicon.png, canvas 1024x1536 preservado; arte = 73,9% da altura do canvas, contra
     96,4% no recorte antigo 352x392). Altura da caixa x1.305 = a arte do watermark fica do tamanho aprovado (master 360/520). */
  'wm-h': [470, null, null, 679, null, null, null],
  'foot-pad': [52, null, null, 72, null, null, null],
  'foot-gap': [36, null, null, 56, null, null, null],
  'nav-gap': [40, null, null, 26, 40, null, null],
};
const SCALE_ROLES = ['h1', 'h2', 'h3', 'featureTitle', 'contactTitle', 'aboutName', 'cardTitle', 'capTitle', 'slideName', 'lead', 'body'];
const kebab = s => s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
const px = v => (typeof v === 'number' ? `${v}px` : v);

const c = tokens.color, f = tokens.font, mo = tokens.motion;
const base = [];
const push = (k, v) => base.push(`  --v-${k}: ${v};`);

for (const [k, v] of Object.entries(c)) if (k !== 'removed') push(k, v.value);
base.push('');
push('font-display', f.family.display.value);
push('font-text', f.family.text.value);
push('font-system', f.family.system.value);
for (const [k, v] of Object.entries(f.weight)) push(`fw-${kebab(k)}`, v);
for (const [k, v] of Object.entries(f.lineHeight)) push(`lh-${kebab(k)}`, v);
for (const k of ['small', 'ui', 'eyebrow', 'micro']) push(`fs-${k}`, px(f.scale[k]));
base.push('');
push('shadow-media', tokens.shadow.media);
push('border-panel', tokens.border.panel);
push('border-contact', tokens.border.contactPanel);
for (const [k, v] of Object.entries(mo.easing)) push(`ease-${k}`, v);
for (const [k, v] of Object.entries(mo.duration)) push(`dur-${kebab(k)}`, `${v}ms`);
for (const [k, v] of Object.entries(tokens.z)) if (!k.startsWith('_')) push(`z-${k}`, v);
push('touch-min', px(tokens.target.touchMin));
push('btn-h', px(tokens.target.buttonHeight));
push('header-cta-h', px(tokens.target.headerCta));

/* valores por faixa */
const perBand = BANDS.map(() => []);
for (const role of SCALE_ROLES) {
  const col = f.scale[role];
  let prev;
  BANDS.forEach(([, ci], bi) => { const v = col[ci]; if (v !== prev) perBand[bi].push(`  --v-fs-${kebab(role)}: ${v}px;`); prev = v; });
}
for (const [k, vals] of Object.entries(LAYOUT)) {
  if (vals.length !== BANDS.length) throw new Error(`LAYOUT.${k}: ${vals.length} faixas`);
  vals.forEach((v, bi) => { if (v !== null) perBand[bi].push(`  --v-${k}: ${px(v)};`); });
}
const cols = [4, null, 8, 12, null, null, null];
cols.forEach((v, bi) => { if (v) perBand[bi].push(`  --v-cols: ${v};`); });

let css = `/* GERADO por tools/build-tokens.mjs a partir de data/tokens.json (${tokens.$meta.version}).
   Nao editar a mao. Faixas mobile-first: base 390 · >=430 · >=768 · >=1024 · >=1200 · >=1440 · >=1600. */
:root {
${base.join('\n')}
${perBand[0].join('\n')}
}
`;
BANDS.slice(1).forEach(([min], i) => {
  const rules = perBand[i + 1];
  if (rules.length) css += `@media (min-width: ${min}px) {\n  :root {\n${rules.map(r => '  ' + r).join('\n')}\n  }\n}\n`;
});

if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== css) { console.error('TOKENS=STALE (rode node tools/build-tokens.mjs)'); process.exit(1); }
  console.log('TOKENS=FRESH');
} else {
  fs.writeFileSync(OUT, css);
  console.log(`TOKENS ${base.filter(l => l.trim()).length} base + ${perBand.flat().length} por faixa -> src/tokens.css`);
}
