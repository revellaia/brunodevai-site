/* BRUNO DEV.AI V3 · shell comum (head, header com logo real, menu mobile, footer) + primitivas (logo, status, ArtDirectedMedia).
   Todo texto vem de data/copy.json. Rotas por id (data/site.json routes): canonical no host final (www),
   hreflang so para pares existentes. Infra SEO/PT-EN/OG/JSON-LD da V2 preservada; so o visual muda. */
import { h, raw } from '../lib/html.mjs';
import { t } from '../lib/copy.mjs';

export const ORIGIN = 'https://www.brunodevai.com';
export const ext = (T) => h`<span class="sr-only"> (${T('a11y.newtab')})</span>`;

export function makeCtx(lang, site, proof, id) {
  const T = id2 => t(id2, lang, { stage: 'production' });
  const other = lang === 'pt' ? 'en' : 'pt';
  const url = (rid, l = lang) => { const r = site.routes[rid]; if (!r) throw new Error('rota desconhecida: ' + rid); return r[l] || r.pt; };
  const pair = site.routes[id];
  return {
    lang, other, site, proof, id, T, url,
    route: url(id),
    alt: pair[other] || null,
    htmlLang: site.locales[lang].htmlLang,
    otherLang: site.locales[other].htmlLang,
    home: url('home'),
  };
}

/* Logo OFICIAL completo (03_BRAND/Logo Oficial.png 2069x760, canvas e proporcao preservados; sem recorte).
   Derivados WebP lossless 490/735/980w (V3_IMPLEMENTATION/brand/build_brand_assets.py), nunca acima do nativo.
   sizes = largura renderizada por faixa (altura do token logo-h x 2.7224). */
const LOCKUP = '/assets/brand/logo-official-490.webp 490w, /assets/brand/logo-official-735.webp 735w, /assets/brand/logo-official-980.webp 980w';
const SIZES = {
  header: '(min-width: 1600px) 188px, (min-width: 1024px) 177px, (min-width: 768px) 150px, (min-width: 430px) 131px, 125px',
  footer: '(min-width: 1024px) 226px, (min-width: 768px) 188px, 169px',
};
export const logo = (c, where) => h`<img class="logo" src="/assets/brand/logo-official-490.webp" srcset="${LOCKUP}" sizes="${SIZES[where]}" width="2069" height="760" alt="${c.T('v3.logo.alt')}" decoding="async">`;

/* "No ar" so para projeto com URL publica confirmada (OD-07: verificado 2026-10-02; re-check antes do release). */
export const live = (c) => h`<span class="status"><span class="dot" aria-hidden="true"></span>${c.T('v3.status.live')}</span>`;

/* ArtDirectedMedia (05_COMPONENTS/ArtDirectedMedia.md): o framing (fit/posicao/proporcao por breakpoint) vem de
   src/media.css, gerado do MEDIA_FRAMING_MANIFEST, pelo data-adm. mobile = ALTERNATE_ASSET (<picture>) quando existe.
   deferred = sem src (o carrossel do hero injeta antes de mostrar; SAVE DATA nunca baixa). */
export function adm(c, { id, src, w, h: hh, alt = '', srcset = '', sizes = '', mobile = null, loading = 'lazy', priority = false, deferred = false, cls = '', reveal = false }) {
  const img = h`<img class="adm-m" ${raw(deferred ? 'data-src' : 'src')}="${src}"${srcset ? raw(` ${deferred ? 'data-srcset' : 'srcset'}="${srcset}" sizes="${sizes}"`) : ''} width="${w}" height="${hh}" alt="${alt}"${deferred ? '' : raw(` loading="${loading}"`)} decoding="async"${priority ? raw(' fetchpriority="high"') : ''}>`;
  return h`<div class="adm${cls ? ' ' + cls : ''}" data-adm="${id}"${reveal ? raw(' data-reveal="media"') : ''}>${mobile ? h`<picture><source media="(max-width: 767px)" srcset="${mobile}">${img}</picture>` : img}</div>`;
}

export const eyebrow = (n, text, { rule = true } = {}) => h`<p class="eyebrow">${n ? h`<span class="eyebrow-n">${n}</span>` : ''}${rule ? h`<span class="eyebrow-rule" aria-hidden="true"></span>` : ''}${text}</p>`;

const PERSON = c => ({ '@type': 'Person', '@id': ORIGIN + '/#bruno', name: c.T('nav.brand.primary'), jobTitle: c.T('v3.about.role'), url: ORIGIN + '/' });

export function head(c, { title, description, robots = 'index, follow', preload = '', og = 'default', ld = [] }) {
  const canon = ORIGIN + c.route;
  const pair = c.site.routes[c.id];
  const ogImg = `${ORIGIN}/assets/og/${c.site.og[og] || c.site.og.default}-${c.lang}.jpg`;
  const ogAlt = og === 'vakon' ? c.T('meta.vakon.title') : og === 'cico' ? c.T('meta.cico.title') : c.T('og.alt.home');
  const graph = { '@context': 'https://schema.org', '@graph': [
    PERSON(c),
    { '@type': 'WebSite', '@id': ORIGIN + c.url('home') + '#site', name: 'Bruno Dev.AI', alternateName: c.T('nav.brand.primary'), url: ORIGIN + c.url('home'), inLanguage: c.htmlLang, publisher: { '@id': ORIGIN + '/#bruno' } },
    ...ld,
  ] };
  return h`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canon}">
${pair.en ? h`<link rel="alternate" hreflang="pt-BR" href="${ORIGIN + pair.pt}">
<link rel="alternate" hreflang="en" href="${ORIGIN + pair.en}">
<link rel="alternate" hreflang="x-default" href="${ORIGIN + pair.pt}">` : ''}
<meta name="theme-color" content="#0A0A09">
<meta property="og:type" content="${c.id === 'vakon' || c.id === 'cico' ? 'article' : 'website'}">
<meta property="og:url" content="${canon}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${ogAlt}">
<meta property="og:locale" content="${c.site.locales[c.lang].ogLocale}">
${pair.en ? h`<meta property="og:locale:alternate" content="${c.site.locales[c.other].ogLocale}">` : ''}
<meta property="og:site_name" content="Bruno Dev.AI">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImg}">
<meta name="twitter:image:alt" content="${ogAlt}">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32.png">
<link rel="icon" type="image/png" sizes="96x96" href="/assets/brand/favicon-96.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/bd-newsreader-roman-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/bd-archivo-latin.woff2" crossorigin>
${raw(preload)}
<script src="/src/mode.js"></script>
<link rel="stylesheet" href="/src/tokens.css">
<link rel="stylesheet" href="/src/base.css">
<link rel="stylesheet" href="/src/media.css">
<link rel="stylesheet" href="/src/site.css">
<script type="application/ld+json">${raw(JSON.stringify(graph).replace(/</g, '\\u003c'))}</script>
</head>`;
}

function langLink(c, cls) {
  const target = c.alt || c.url('home', c.other);
  return h`<a class="lang ${cls}" href="${target}" hreflang="${c.otherLang}" lang="${c.otherLang}" aria-label="${c.T('a11y.lang.other')}"><span class="${c.lang === 'pt' ? 'is-cur' : ''}">PT</span>&nbsp;/&nbsp;<span class="${c.lang === 'en' ? 'is-cur' : ''}">EN</span></a>`;
}

/* Navegacao canonica V3: Trabalhos · Capacidades · Lab · Sobre · Contato (paginas quando existem; ancoras da home). */
function navItems(c) {
  const onHome = c.id === 'home';
  const anchor = id => (onHome ? '#' + id : c.home + '#' + id);
  return [
    ['work', c.url('work'), 'v3.nav.work'],
    ['capabilities', anchor('capabilities'), 'v3.nav.capabilities'],
    ['lab', c.url('lab'), 'v3.nav.lab'],
    ['about', c.url('about'), 'v3.nav.about'],
    ['contact', anchor('contact'), 'v3.nav.contact'],
  ];
}
const isCur = (c, rid) => c.id === rid || (rid === 'work' && (c.id === 'vakon' || c.id === 'cico')) || (rid === 'lab' && c.id.startsWith('lab'));

export function header(c) {
  const items = navItems(c);
  return h`<header class="hd" data-header>
  <a class="hd-logo" href="${c.home}">${logo(c, 'header')}</a>
  <nav class="hd-nav" aria-label="${c.T('a11y.nav.primary')}">${items.map(([rid, href, k]) => h`<a href="${href}"${isCur(c, rid) ? raw(' aria-current="page"') : ''}>${c.T(k)}</a>`)}</nav>
  <div class="hd-end">
    ${langLink(c, 'hd-lang')}
    <a class="hd-cta" href="mailto:${c.site.contact.email}" data-contact-flow>${c.T('v3.nav.cta')} <span aria-hidden="true">→</span></a>
    <a class="hd-menu" href="#footer" data-menu-open aria-haspopup="dialog" aria-label="${c.T('v3.nav.menu')}"><span></span><span></span></a>
  </div>
</header>
<dialog class="mn" data-menu aria-label="${c.T('a11y.menu.dialog')}">
  <div class="mn-in">
    <div class="mn-top"><a class="hd-logo" href="${c.home}" data-menu-link>${logo(c, 'header')}</a><button type="button" class="mn-close" data-menu-close aria-label="${c.T('v3.nav.close')}">✕</button></div>
    <ul class="mn-links">${items.map(([, href, k]) => h`<li><a href="${href}" data-menu-link>${c.T(k)}</a></li>`)}</ul>
    <div class="mn-end">
      ${langLink(c, 'mn-lang')}
      <a class="btn btn--primary" href="mailto:${c.site.contact.email}" data-contact-flow data-menu-link>${c.T('v3.nav.cta')} <span aria-hidden="true">→</span></a>
      <p class="mn-ch"><a href="${c.site.contact.whatsapp}" target="_blank" rel="noopener noreferrer" data-cf-wa>${c.T('v3.contact.whatsapp')} · ${c.T('v3.contact.phone')}${ext(c.T)}</a><a href="mailto:${c.site.contact.email}" data-cf-mail>${c.site.contact.email}</a></p>
    </div>
  </div>
</dialog>`;
}

export function footer(c) {
  const items = navItems(c).slice(0, 4);
  return h`<footer class="ft" id="footer">
  <div class="ft-grid">
    <div class="ft-brand">
      <a href="${c.home}">${logo(c, 'footer')}</a>
      <p class="ft-desc">${c.T('v3.footer.desc')}</p>
    </div>
    <nav class="ft-col" aria-label="${c.T('a11y.nav.footer')}"><p class="label">${c.T('v3.footer.nav')}</p>${items.map(([, href, k]) => h`<a href="${href}">${c.T(k)}</a>`)}</nav>
    <div class="ft-col"><p class="label">${c.T('v3.footer.contact')}</p><a href="mailto:${c.site.contact.email}" data-cf-mail>${c.site.contact.email}</a><a href="${c.site.contact.whatsapp}" target="_blank" rel="noopener noreferrer" data-cf-wa>${c.T('v3.contact.phone')}${ext(c.T)}</a>${langLink(c, 'ft-lang')}</div>
  </div>
  <div class="ft-legal"><span>${c.T('v3.footer.copy')}</span><span>${c.T('v3.footer.place')}</span><a href="${c.url('privacy')}">${c.T('v3.footer.privacy')}</a></div>
</footer>`;
}

export const SCRIPTS = ['nav', 'reveal', 'contact'];
export function scripts(extra = []) {
  return [h`<script src="/assets/contact-flow.js" defer></script>\n`, ...[...SCRIPTS, ...extra].map(s => h`<script src="/src/${s}.js" defer></script>\n`)];
}

export function page(c, { headOpts, body, extraScripts = [] }) {
  return `<!doctype html>
${h`<html lang="${c.htmlLang}">`}
${head(c, headOpts)}
${h`<body>
<a class="skip" href="#main">${c.T('a11y.skip.main')}</a>
${header(c)}
<main id="main">
${raw(String(body))}
</main>
${footer(c)}
${scripts(extraScripts)}</body>
</html>`}
`;
}
