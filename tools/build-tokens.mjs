#!/usr/bin/env node
/* WORLDCRAFT tokens: data/tokens.json -> src/tokens.css (gerado; nao editar o CSS a mao).
   node tools/build-tokens.mjs           -> escreve src/tokens.css
   node tools/build-tokens.mjs --check   -> exit 1 se src/tokens.css estiver desatualizado

   Fonte: 04_DESIGN_SYSTEM/TOKENS.json do handoff (copiado byte a byte para data/tokens.json).
   Line-height/tracking por papel vem de 04_DESIGN_SYSTEM/TYPOGRAPHY.md (tabela "Scale"), que TOKENS.json
   so traz por categoria. Valores RECOMMENDED podem mudar no Gate 2: troque data/tokens.json e regenere. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(fs.readFileSync(path.join(root, 'data/tokens.json'), 'utf8'));
const OUT = path.join(root, 'src/tokens.css');

/* TYPOGRAPHY.md · Scale: [line-height, tracking]. Tamanhos vem de TOKENS.json (1440 / 390). */
const ROLES = {
  'display-hero': [1, '-0.045em'],
  'display-wordmark': [0.78, '-0.05em'],
  'display-flagship': [0.82, '-0.045em'],
  'display-section': [0.8, '-0.045em'],
  'display-contact': [0.84, '-0.045em'],
  'display-manifesto': [0.9, '-0.04em'],
  'display-l': [0.92, '-0.035em'],
  'display-m': [0.95, '-0.03em'],
  'display-s': [1, '-0.03em'],
  'display-xs': [1.04, '-0.025em'],
  'display-xxs': [1.04, '-0.025em'],
  statement: [1.14, '0'],
  lede: [1.25, '0'],
  body: [1.5, '0'],
  ui: [1.2, '0.12em'],
  mono: [1.7, '0.08em'],
  'mono-s': [1.6, '0.06em'],
};
const MIN_VW = 390, MAX_VW = 1440;
const r = n => +n.toFixed(4);

/* Interpolacao linear 390 -> 1440 (TOKENS.json fluid_rule) e teto no valor de 1440.
   Excecao explicita do fluid_rule: hero = clamp(112px, 20.1vw, 300px). */
function fluid(name, mobile, desktop) {
  if (name === 'display-hero') return 'clamp(112px, 20.1vw, 300px)';
  if (mobile === desktop) return `${desktop}px`;
  const slope = (desktop - mobile) / (MAX_VW - MIN_VW);
  const base = mobile - slope * MIN_VW;
  const [lo, hi] = [Math.min(mobile, desktop), Math.max(mobile, desktop)];
  return `clamp(${lo}px, ${r(base)}px + ${r(slope * 100)}vw, ${hi}px)`;
}

const c = tokens.color, f = tokens.font, m = tokens.motion;
const lines = [];
const push = (k, v) => lines.push(`  --wc-${k}: ${v};`);

for (const [k, v] of Object.entries(c)) {
  if (k === 'ratio') continue;
  if (k === 'media-dim') { push('media-dim', String(v.value).replace(/^filter:\s*/, '')); continue; }
  push(k, v.value);
}
lines.push('');
push('font-display', f.family.display.value.replace("'Newsreader',", "'Newsreader', 'Newsreader Fallback',"));
push('font-text', f.family.text.value.replace("'Archivo',", "'Archivo', 'Archivo Fallback',"));
push('font-system', f.family.system.value.replace("'JetBrains Mono',", "'JetBrains Mono', 'JetBrains Mono Fallback',"));
push('fw-display', f.weight.display.value);
push('fw-text', f.weight.text.value);
push('fw-text-strong', f.weight.textStrong.value);
push('fw-ui', f.weight.ui.value);
push('fw-system', 400);
push('fw-system-strong', 500);
lines.push('');
for (const [name, [lh, ls]] of Object.entries(ROLES)) {
  const d = f.size_desktop_1440[name], mo = f.size_mobile_390[name];
  if (d === undefined || mo === undefined) throw new Error(`token de tamanho ausente: ${name}`);
  push(`fs-${name}`, fluid(name, mo, d));
  push(`lh-${name}`, lh);
  push(`ls-${name}`, ls);
}
lines.push('');
tokens.space.scale.forEach((v, i) => push(`space-${i + 1}`, `${v}px`));
push('section', `${tokens.space.section_mobile.default}px`);
push('section-l', `${tokens.space.section_mobile.large}px`);
push('section-xl', `${tokens.space.section_mobile.large}px`);
lines.push('');
push('content-max', `${tokens.grid.maxWidth.content}px`);
push('text-max', `${tokens.grid.maxWidth.text}px`);
const g390 = tokens.grid['390'];
push('cols', g390.cols);
push('margin', `${g390.margin}px`);
push('gutter', `${g390.gutter}px`);
lines.push('');
push('radius', `${tokens.radius.value}px`);
push('hairline', `1px solid var(--wc-line)`);
push('control-border', `1px solid var(--wc-line-strong)`);
push('target-min', '44px');
lines.push('');
for (const [k, v] of Object.entries(m.easing)) push(`ease-${k}`, v.value);
for (const [k, v] of Object.entries(m.duration)) if (!k.startsWith('_')) push(`dur-${k}`, `${v}ms`);
lines.push('');
for (const [k, v] of Object.entries(tokens.z)) if (!k.startsWith('_')) push(`z-${k.replace(/[A-Z]/g, x => '-' + x.toLowerCase())}`, v);

/* Grid e ritmo por breakpoint (min-width). 430 repete 390 por definicao do GRID.md. */
const bp = [];
for (const w of ['768', '1024', '1440', '1920']) {
  const gg = tokens.grid[w];
  const extra = w === '1024' ? `\n    --wc-section: ${tokens.space.section_desktop.default}px;\n    --wc-section-l: ${tokens.space.section_desktop.large}px;\n    --wc-section-xl: ${tokens.space.section_desktop.manifesto}px;` : '';
  bp.push(`  @media (min-width: ${w}px) {\n  :root {\n    --wc-cols: ${gg.cols};\n    --wc-margin: ${gg.margin}px;\n    --wc-gutter: ${gg.gutter}px;${extra}\n  }\n  }`);
}

const css = `/* GERADO por tools/build-tokens.mjs a partir de data/tokens.json (${tokens.$meta.version}).
   Nao editar a mao. Valores RECOMMENDED podem mudar no Gate 2. */
:root {
${lines.join('\n')}
}
${bp.join('\n').replace(/^ {2}/gm, '')}
`;

if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== css) { console.error('TOKENS=STALE (rode node tools/build-tokens.mjs)'); process.exit(1); }
  console.log('TOKENS=FRESH');
} else {
  fs.writeFileSync(OUT, css);
  console.log(`src/tokens.css escrito (${Buffer.byteLength(css)} bytes, ${lines.filter(l => l.startsWith('  --')).length} props)`);
}
