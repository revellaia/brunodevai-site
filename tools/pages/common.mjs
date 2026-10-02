/* WORLDCRAFT · layout comum (head, nav, menu, toggles, footer). Todo texto vem de data/copy.json.
   Rotas por id (data/site.json routes): canonical no host final (www), hreflang so para pares existentes. */
import { h, raw } from '../lib/html.mjs';
import { t } from '../lib/copy.mjs';

export const ORIGIN = 'https://www.brunodevai.com';
export const ext = (T) => h`<span class="wc-sr-only"> (${T('a11y.newtab')})</span>`;

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
    brand: T('nav.brand.signature').replace(/\s*\(.*\)\s*$/, ''),
  };
}

export function layerSwitch(c, cls = '') {
  return h`<button type="button" class="wc-switch ${cls}" role="switch" aria-checked="false" aria-label="${c.T('a11y.layer.switch')}" data-layer-switch hidden><span class="wc-seg" data-seg="experience">${c.T('toggle.experience')}</span><span class="wc-seg" data-seg="system">${c.T('toggle.system')}</span></button>`;
}

const PERSON = c => ({ '@type': 'Person', '@id': ORIGIN + '/#bruno', name: c.T('nav.brand.primary'), jobTitle: c.T('hero.role'), url: ORIGIN + '/' });

export function head(c, { title, description, robots = 'index, follow', preload = '', og = 'default', ld = [] }) {
  const canon = ORIGIN + c.route;
  const pair = c.site.routes[c.id];
  const ogImg = `${ORIGIN}/assets/og/${c.site.og[og] || c.site.og.default}-${c.lang}.jpg`;
  const ogAlt = og === 'vakon' ? c.T('meta.vakon.title') : og === 'cico' ? c.T('meta.cico.title') : c.T('og.alt.home');
  const graph = { '@context': 'https://schema.org', '@graph': [
    PERSON(c),
    { '@type': 'WebSite', '@id': ORIGIN + c.url('home') + '#site', name: c.T('nav.brand.primary'), url: ORIGIN + c.url('home'), inLanguage: c.htmlLang, publisher: { '@id': ORIGIN + '/#bruno' } },
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
<meta name="theme-color" content="#070706">
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
<meta property="og:site_name" content="${c.T('nav.brand.primary')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImg}">
<meta name="twitter:image:alt" content="${ogAlt}">
<link rel="icon" type="image/svg+xml" href="/assets/brand/favicon.svg">
<link rel="icon" type="image/png" sizes="96x96" href="/assets/brand/favicon-96.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/wc-newsreader-roman-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/wc-newsreader-italic-latin.woff2" crossorigin>
${raw(preload)}
<script src="/src/mode.js"></script>
<script src="/src/layer.js"></script>
<link rel="stylesheet" href="/src/tokens.css">
<link rel="stylesheet" href="/src/base.css">
<link rel="stylesheet" href="/src/site.css">
<script type="application/ld+json">${raw(JSON.stringify(graph).replace(/</g, '\\u003c'))}</script>
</head>`;
}

function langLink(c, cls) {
  const target = c.alt || c.url('home', c.other);
  return h`<a class="${cls}" href="${target}" hreflang="${c.otherLang}" lang="${c.otherLang}" aria-label="${c.T('a11y.lang.other')}"><span class="${c.lang === 'pt' ? 'is-cur' : ''}">PT</span> / <span class="${c.lang === 'en' ? 'is-cur' : ''}">EN</span></a>`;
}

export function nav(c) {
  const cur = rid => (c.id === rid || (rid === 'work' && (c.id === 'vakon' || c.id === 'cico')) || (rid === 'lab' && c.id.startsWith('lab')) ? raw(' aria-current="page"') : '');
  return h`<header class="nav" data-nav>
  <div class="nav-in">
    <a class="nav-brand" href="${c.url('home')}"><span class="nav-name">${c.T('nav.brand.primary')}</span> <span class="nav-sig">${c.brand}</span></a>
    <nav class="nav-links" aria-label="${c.T('a11y.nav.primary')}">
      <a href="${c.url('work')}"${cur('work')}>${c.T('nav.work')}</a>
      <a href="${c.url('lab')}"${cur('lab')}>${c.T('nav.lab')}</a>
      <a href="${c.url('about')}"${cur('about')}>${c.T('nav.about')}</a>
    </nav>
    <div class="nav-end">
      ${langLink(c, 'nav-lang')}
      <a class="nav-cta wc-cta-u" href="mailto:${c.site.contact.email}" data-contact-flow>${c.T('nav.cta')}</a>
      <a class="nav-menu" href="#footer" data-menu-open aria-haspopup="dialog">${c.T('nav.menu')}</a>
    </div>
  </div>
</header>
<dialog class="menu" data-menu aria-label="${c.T('a11y.menu.dialog')}">
  <div class="menu-in">
    <button type="button" class="menu-close" data-menu-close>${c.T('a11y.menu.close')}</button>
    <ul class="menu-links">
      <li><a href="${c.url('work')}" data-menu-link>${c.T('nav.work')}</a></li>
      <li><a href="${c.url('lab')}" data-menu-link>${c.T('nav.lab')}</a></li>
      <li><a href="${c.url('about')}" data-menu-link>${c.T('nav.about')}</a></li>
      <li><a href="${c.id === 'home' ? '#contact' : c.url('home') + '#contact'}" data-menu-link>${c.T('nav.contact')}</a></li>
    </ul>
    <p class="menu-channels"><a href="mailto:${c.site.contact.email}" data-cf-mail>${c.T('contact.email')}</a><a href="${c.site.contact.whatsapp}" target="_blank" rel="noopener noreferrer" data-cf-wa>${c.T('contact.whatsapp')} ↗${ext(c.T)}</a></p>
    ${langLink(c, 'menu-lang')}
  </div>
</dialog>`;
}

export function layerChrome(c) {
  return h`<div class="wc-pin" data-pin>${layerSwitch(c, 'wc-switch--pin')}</div>
<div class="wc-bar" data-bar>${layerSwitch(c, 'wc-switch--bar')}</div>
<p class="wc-sr-only" aria-live="polite" data-layer-live data-on-system="${c.T('a11y.layer.on.system')}" data-on-experience="${c.T('a11y.layer.on.experience')}"></p>`;
}

export function footer(c) {
  const [w1, w2] = c.T('footer.wordmark').split(' ');
  return h`<footer class="footer" id="footer">
  <div class="wc-container">
    <div class="footer-info">
      <p class="footer-id wc-t-mono">${c.T('nav.brand.primary')}<br>${c.T('footer.location')}</p>
      <p class="footer-ch"><a href="mailto:${c.site.contact.email}" data-cf-mail>${c.T('contact.email')}</a><br><a href="${c.site.contact.whatsapp}" target="_blank" rel="noopener noreferrer" data-cf-wa>${c.T('contact.whatsapp')}${ext(c.T)}</a></p>
      <nav class="footer-nav" aria-label="${c.T('a11y.nav.footer')}">
        <ul>
          <li><a href="${c.url('work')}">${c.T('nav.work')}</a></li>
          <li><a href="${c.url('lab')}">${c.T('nav.lab')}</a></li>
          <li><a href="${c.url('about')}">${c.T('nav.about')}</a></li>
          <li><a href="${c.url('privacy')}">${c.T('footer.privacy')}</a></li>
        </ul>
      </nav>
      <p class="footer-meta wc-t-mono"><a href="${c.alt || c.url('home', c.other)}" hreflang="${c.otherLang}" lang="${c.otherLang}" aria-label="${c.T('a11y.lang.other')}">${c.T('nav.lang')}</a><br>${c.T('footer.copyright')}</p>
    </div>
    <p class="footer-sig wc-t-mono">BRUNO ${c.brand}</p>
    <p class="footer-mark" aria-hidden="true"><span>${w1}</span> <span class="wc-italic">${w2}</span></p>
  </div>
</footer>`;
}

export const SCRIPTS = ['engine', 'nav', 'reveal', 'contact'];
export function scripts(extra = []) {
  return [h`<script src="/assets/contact-flow.js" defer></script>\n`, ...[...SCRIPTS, ...extra].map(s => h`<script src="/src/${s}.js" defer></script>\n`)];
}

export function page(c, { headOpts, body, heroOut = true, skip = 'main', extraScripts = [] }) {
  return `<!doctype html>
${h`<html lang="${c.htmlLang}"${heroOut ? raw(' data-hero-out') : ''}>`}
${head(c, headOpts)}
${h`<body class="wc-grain">
<a class="wc-skip wc-t-ui" href="${skip === 'work' ? '#work' : '#main'}">${skip === 'work' ? c.T('a11y.skip') : c.T('a11y.skip.main')}</a>
${nav(c)}
<main id="main">
${raw(String(body))}
</main>
${footer(c)}
${layerChrome(c)}
${scripts(extraScripts)}</body>
</html>`}
`;
}
