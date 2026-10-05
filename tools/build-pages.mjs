#!/usr/bin/env node
/* BRUNO DEV.AI V3 · gerador estatico (sem framework, sem build no Vercel): data/*.json + src/proof.json -> HTML + sitemap.xml + robots.txt.
   node tools/build-pages.mjs          -> escreve as paginas
   node tools/build-pages.mjs --check  -> exit 1 se algum artefato gerado estiver desatualizado
   PT na raiz, EN em /en/ (12_ENGINEERING/I18N.md). Rotas por id em data/site.json (routes).
   Copy ausente ou TBC = build falha (sem fallback silencioso). */
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib/deploy-tree.mjs';
import { ORIGIN, makeCtx, page } from './pages/common.mjs';
import { homeBody, HERO_PHOTO_SIZES } from './pages/home.mjs';
import { labIndexBody, labDetailBody } from './pages/lab.mjs';
import { vakonCase, cicoCase } from './pages/case.mjs';
import { workBody, aboutBody, privacyBody } from './pages/pages.mjs';

const site = JSON.parse(fs.readFileSync(path.join(root, 'data/site.json'), 'utf8'));
const proof = JSON.parse(fs.readFileSync(path.join(root, 'src/proof.json'), 'utf8'));
const check = process.argv.includes('--check');
const NOINDEX = 'noindex, follow';

/* Paginas por id de rota. robots != index => fora do sitemap. */
const PAGES = {
  /* Home: candidato LCP = h1 (texto) ou a FOTO 01 do Bruno no fundo do hero (preload responsivo AVIF, fetchpriority high).
     A playlist do frame nao recebe preload: o poster do filme 01 entra normal e os demais sob demanda. */
  home: c => {
    const ph = c.site.media.hero.photo;
    const preload = `<link rel="preload" as="image" type="image/avif" imagesrcset="${ph.avifSet}" imagesizes="${HERO_PHOTO_SIZES}" fetchpriority="high">`;
    return {
      extraScripts: ['video', 'home', 'hover-video'], /* video.js (motor compartilhado) antes dos consumidores */
      headOpts: { title: c.T('v3.meta.home.title'), description: c.T('v3.hero.sub'), preload, og: 'home' },
      body: homeBody(c),
    };
  },
  work: c => ({ headOpts: { title: c.T('meta.work.title'), description: c.T('meta.work.desc'), og: 'work' }, body: workBody(c) }),
  vakon: c => ({
    headOpts: { title: c.T('meta.vakon.title'), description: c.T('vakon.case.desc'), og: 'vakon', preload: casePreload(c, 'vakon'), ld: [caseLd(c, 'vakon', 'vakon.case.desc')] },
    body: vakonCase(c),
  }),
  cico: c => ({
    headOpts: { title: c.T('meta.cico.title'), description: c.T('cico.case.desc'), og: 'cico', preload: casePreload(c, 'cico'), ld: [caseLd(c, 'cico', 'cico.case.desc')] },
    body: cicoCase(c),
  }),
  about: c => ({ headOpts: { title: c.T('meta.about.title'), description: c.T('about.page.complement'), og: 'about' }, body: aboutBody(c) }),
  lab: c => ({ extraScripts: ['video', 'hover-video'], headOpts: { title: c.T('meta.lab.title'), description: c.T('lab.lede'), og: 'lab' }, body: labIndexBody(c) }),
  privacy: c => ({ headOpts: { title: c.T('meta.privacy.title'), description: c.T('meta.privacy.desc'), og: 'privacy' }, body: privacyBody(c) }),
};
for (const [i, s] of site.lab.entries()) {
  PAGES[`lab-${s.slug}`] = c => ({
    headOpts: { title: `${s.title} · ${s.code} · ${c.T('v3.lab.card')} · ${c.T('nav.brand.primary')}`, description: c.T('lab.lede'), robots: NOINDEX, og: 'lab' },
    body: labDetailBody(c, i),
  });
}

/* Hero do case: preload da imagem LCP (mobile 760 so no Vakon, que tem variante). */
function casePreload(c, id) {
  const m = site.cases[id];
  return m.heroMobile
    ? [`<link rel="preload" as="image" type="image/webp" href="${m.heroMobile}" media="(max-width: 767px)" fetchpriority="high">`,
      `<link rel="preload" as="image" type="image/webp" href="${m.hero}" media="(min-width: 768px)" fetchpriority="high">`].join('\n')
    : `<link rel="preload" as="image" type="image/webp" href="${m.hero}" fetchpriority="high">`;
}
function caseLd(c, id, desc) {
  const p = site.projects.find(x => x.id === id);
  return { '@type': 'CreativeWork', '@id': ORIGIN + c.route + '#case', name: c.T(`project.${id}.name`), description: c.T(desc), url: ORIGIN + c.route, inLanguage: c.htmlLang, creator: { '@id': ORIGIN + '/#bruno' }, sameAs: p.url };
}

const out = [];
const indexable = [];
for (const [id, pair] of Object.entries(site.routes)) {
  if (!PAGES[id]) throw new Error(`rota sem pagina: ${id}`);
  for (const lang of ['pt', 'en']) {
    if (!pair[lang]) continue;
    const c = makeCtx(lang, site, proof, id);
    const o = PAGES[id](c);
    out.push([(pair[lang] === '/' ? '/index.html' : pair[lang].endsWith('/') ? pair[lang] + 'index.html' : pair[lang]).slice(1), page(c, o)]);
    if ((o.headOpts.robots || 'index') .startsWith('index')) indexable.push([id, lang]);
  }
}

/* Sitemap: so paginas canonicas indexaveis, host final, alternates reciprocos so para pares existentes. */
const alt = id => { const r = site.routes[id]; return r.en ? [['pt-BR', r.pt], ['en', r.en], ['x-default', r.pt]] : []; };
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${indexable.map(([id, lang]) => `  <url>
    <loc>${ORIGIN}${site.routes[id][lang]}</loc>
${alt(id).map(([hl, u]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${ORIGIN}${u}"/>\n`).join('')}  </url>`).join('\n')}
</urlset>
`;
out.push(['sitemap.xml', sitemap]);
out.push(['robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`]);

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
console.log(`PAGES ${out.length} · indexable ${indexable.length}: ${out.map(([f]) => f).join(' · ')}`);
