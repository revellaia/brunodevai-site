#!/usr/bin/env node
/* WORLDCRAFT · gerador estatico (sem framework, sem build no Vercel): data/*.json + src/proof.json -> HTML.
   node tools/build-pages.mjs          -> escreve as paginas
   node tools/build-pages.mjs --check  -> exit 1 se alguma pagina gerada estiver desatualizada
   PT na raiz, EN em /en/ (12_ENGINEERING/I18N.md). Copy ausente ou TBC = build falha (sem fallback silencioso). */
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/deploy-tree.mjs';
import { makeCtx, page } from './pages/common.mjs';
import { homeBody } from './pages/home.mjs';
import { labIndexBody, labDetailBody } from './pages/lab.mjs';

const site = JSON.parse(fs.readFileSync(path.join(root, 'data/site.json'), 'utf8'));
const proof = JSON.parse(fs.readFileSync(path.join(root, 'src/proof.json'), 'utf8'));
const check = process.argv.includes('--check');

const routes = ['/', '/lab/', ...site.lab.map(s => `/lab/${s.slug}/`)];
const indexRoutes = ['/', '/lab/', '/en/', '/en/lab/'];
const out = [];

for (const lang of ['pt', 'en']) {
  for (const route of routes) {
    const c = makeCtx(lang, site, proof, route);
    let html;
    if (route === '/') {
      const s = site.media.hero;
      const preload = [
        `<link rel="preload" as="image" type="image/avif" href="${s.poster.mobile.avif}" media="${s.mobileQuery}" fetchpriority="high">`,
        `<link rel="preload" as="image" type="image/avif" href="${s.poster.desktop.avif}" media="not all and ${s.mobileQuery}" fetchpriority="high">`,
      ].join('\n');
      html = page(c, {
        home: true, heroOut: false, extraScripts: ['hero', 'lens', 'work', 'lab'],
        headOpts: { title: c.T('meta.home.title'), description: `${c.T('hero.primary.01')} ${c.T('hero.primary.02')}`, preload },
        body: homeBody(c, indexRoutes),
      });
    } else if (route === '/lab/') {
      html = page(c, {
        extraScripts: ['lab'],
        headOpts: { title: c.T('meta.lab.title'), description: c.T('lab.lede') },
        body: labIndexBody(c),
      });
    } else {
      const i = site.lab.findIndex(s => route === `/lab/${s.slug}/`);
      const s = site.lab[i];
      html = page(c, {
        headOpts: { title: `${s.title} · ${s.code} · ${c.T('lab.card.type')} · ${c.T('nav.brand.primary')}`, description: c.T('lab.lede'), robots: 'noindex, follow' },
        body: labDetailBody(c, i),
      });
    }
    const file = path.join(lang === 'en' ? 'en' : '', route, 'index.html').replace(/\\/g, '/').replace(/^\//, '');
    out.push([file, html]);
  }
}

let stale = 0;
for (const [file, html] of out) {
  const abs = path.join(root, file);
  if (/\bTBC\b/.test(html.replace(/<!--[\s\S]*?-->/g, ''))) throw new Error(`"TBC" literal em ${file}`);
  if (check) {
    const cur = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
    if (cur !== html) { stale++; console.error(`STALE ${file}`); }
  } else {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, html);
  }
}
if (check) { console.log(stale ? 'PAGES=STALE' : `PAGES=FRESH (${out.length})`); process.exit(stale ? 1 : 0); }
console.log(`PAGES ${out.length}: ${out.map(([f]) => f).join(' · ')}`);
