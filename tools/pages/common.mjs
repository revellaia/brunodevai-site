/* WORLDCRAFT · layout comum (head, nav, menu, toggles, footer). Todo texto vem de data/copy.json. */
import { h, raw } from '../lib/html.mjs';
import { t } from '../lib/copy.mjs';

export const ORIGIN = 'https://brunodevai.com';
export const ext = (T) => h`<span class="wc-sr-only"> (${T('a11y.newtab')})</span>`;

/* Rotas equivalentes entre idiomas (o switch PT/EN leva a rota equivalente, nunca a home). */
export function makeCtx(lang, site, proof, route) {
  const T = id => t(id, lang, { stage: 'production' });
  const other = lang === 'pt' ? 'en' : 'pt';
  const loc = l => (p => (l === 'en' ? `/en${p}` : p));
  return {
    lang, other, site, proof, route, T,
    htmlLang: site.locales[lang].htmlLang,
    href: loc(lang),
    hrefOther: loc(other)(route),
    about: lang === 'en' ? '/sobre/?lang=en' : '/sobre/',
    brand: T('nav.brand.signature').replace(/\s*\(.*\)\s*$/, ''),
  };
}

/* Nome do produto da camada: 'EXPERIENCE' / 'SYSTEM' (copy toggle.*). */
export function layerSwitch(c, cls = '') {
  return h`<button type="button" class="wc-switch ${cls}" role="switch" aria-checked="false" aria-label="${c.T('a11y.layer.switch')}" data-layer-switch hidden><span class="wc-seg" data-seg="experience">${c.T('toggle.experience')}</span><span class="wc-seg" data-seg="system">${c.T('toggle.system')}</span></button>`;
}

export function head(c, { title, description, robots = 'index, follow', alternates = true, preload = '' }) {
  const canon = ORIGIN + c.href(c.route);
  const pt = ORIGIN + c.route, en = ORIGIN + '/en' + c.route;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Person', name: c.T('nav.brand.primary'), jobTitle: c.T('hero.role'), url: ORIGIN + '/' },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: c.T('nav.brand.primary'), url: ORIGIN + c.href('/'), inLanguage: c.htmlLang },
  ];
  return h`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canon}">
${alternates ? h`<link rel="alternate" hreflang="pt-BR" href="${pt}">
<link rel="alternate" hreflang="en" href="${en}">
<link rel="alternate" hreflang="x-default" href="${pt}">` : ''}
<meta name="theme-color" content="#070706">
<meta property="og:type" content="website">
<meta property="og:url" content="${canon}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ORIGIN + c.site.media.og}">
<meta property="og:locale" content="${c.site.locales[c.lang].ogLocale}">
<meta property="og:site_name" content="${c.T('nav.brand.primary')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ORIGIN + c.site.media.og}">
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
<script type="application/ld+json">${raw(JSON.stringify(ld).replace(/</g, '\\u003c'))}</script>
</head>`;
}

export function nav(c, { home = false } = {}) {
  const work = home ? '#work' : c.href('/#work');
  const langLink = (cls) => h`<a class="${cls}" href="${c.hrefOther}" hreflang="${c.site.locales[c.other].htmlLang}" lang="${c.site.locales[c.other].htmlLang}" aria-label="${c.T('a11y.lang.other')}"><span class="${c.lang === 'pt' ? 'is-cur' : ''}">PT</span> / <span class="${c.lang === 'en' ? 'is-cur' : ''}">EN</span></a>`;
  const route = r => (c.route === r ? raw(' aria-current="page"') : '');
  return h`<header class="nav" data-nav>
  <div class="nav-in">
    <a class="nav-brand" href="${c.href('/')}"><span class="nav-name">${c.T('nav.brand.primary')}</span> <span class="nav-sig">${c.brand}</span></a>
    <nav class="nav-links" aria-label="${c.T('a11y.nav.primary')}">
      <a href="${work}">${c.T('nav.work')}</a>
      <a href="${c.href('/lab/')}"${route('/lab/')}>${c.T('nav.lab')}</a>
      <a href="${c.about}">${c.T('nav.about')}</a>
    </nav>
    <div class="nav-end">
      ${langLink('nav-lang')}
      <a class="nav-cta wc-cta-u" href="mailto:${c.site.contact.email}" data-contact-flow>${c.T('nav.cta')}</a>
      <a class="nav-menu" href="#footer" data-menu-open aria-haspopup="dialog">${c.T('nav.menu')}</a>
    </div>
  </div>
</header>
<dialog class="menu" data-menu aria-label="${c.T('a11y.menu.dialog')}">
  <div class="menu-in">
    <button type="button" class="menu-close" data-menu-close>${c.T('a11y.menu.close')}</button>
    <ul class="menu-links">
      <li><a href="${work}" data-menu-link>${c.T('nav.work')}</a></li>
      <li><a href="${c.href('/lab/')}" data-menu-link>${c.T('nav.lab')}</a></li>
      <li><a href="${c.about}" data-menu-link>${c.T('nav.about')}</a></li>
      <li><a href="${home ? '#contact' : c.href('/#contact')}" data-menu-link>${c.T('nav.contact')}</a></li>
    </ul>
    <p class="menu-channels"><a href="mailto:${c.site.contact.email}" data-cf-mail>${c.T('contact.email')}</a><a href="${c.site.contact.whatsapp}" target="_blank" rel="noopener noreferrer" data-cf-wa>${c.T('contact.whatsapp')} ↗${ext(c.T)}</a></p>
    ${langLink('menu-lang')}
  </div>
</dialog>`;
}

/* Controles globais de camada fora do hero: compacto fixado (desktop) e barra fixa (mobile/tablet). */
export function layerChrome(c) {
  return h`<div class="wc-pin" data-pin>${layerSwitch(c, 'wc-switch--pin')}</div>
<div class="wc-bar" data-bar>${layerSwitch(c, 'wc-switch--bar')}</div>
<p class="wc-sr-only" aria-live="polite" data-layer-live data-on-system="${c.T('a11y.layer.on.system')}" data-on-experience="${c.T('a11y.layer.on.experience')}"></p>`;
}

export function footer(c, { home = false } = {}) {
  const work = home ? '#work' : c.href('/#work');
  const [w1, w2] = c.T('footer.wordmark').split(' ');
  return h`<footer class="footer" id="footer">
  <div class="wc-container">
    <div class="footer-info">
      <p class="footer-id wc-t-mono">${c.T('nav.brand.primary')}<br>${c.T('footer.location')}</p>
      <p class="footer-ch"><a href="mailto:${c.site.contact.email}" data-cf-mail>${c.T('contact.email')}</a><br><a href="${c.site.contact.whatsapp}" target="_blank" rel="noopener noreferrer" data-cf-wa>${c.T('contact.whatsapp')}${ext(c.T)}</a></p>
      <nav class="footer-nav" aria-label="${c.T('a11y.nav.footer')}">
        <ul>
          <li><a href="${work}">${c.T('nav.work')}</a></li>
          <li><a href="${c.href('/lab/')}">${c.T('nav.lab')}</a></li>
          <li><a href="${c.about}">${c.T('nav.about')}</a></li>
          <li><a href="/privacy.html">${c.T('footer.privacy')}</a></li>
        </ul>
      </nav>
      <p class="footer-meta wc-t-mono"><a href="${c.hrefOther}" hreflang="${c.site.locales[c.other].htmlLang}" lang="${c.site.locales[c.other].htmlLang}" aria-label="${c.T('a11y.lang.other')}">${c.T('nav.lang')}</a><br>${c.T('footer.copyright')}</p>
    </div>
    <p class="footer-sig wc-t-mono">BRUNO ${c.brand}</p>
    <p class="footer-mark" aria-hidden="true"><span>${w1}</span> <span class="wc-italic">${w2}</span></p>
  </div>
</footer>`;
}

export const SCRIPTS = ['contact-flow', 'engine', 'nav', 'reveal', 'contact'];
export function scripts(extra = []) {
  return [...SCRIPTS, ...extra].map(s => (s === 'contact-flow'
    ? h`<script src="/assets/contact-flow.js" defer></script>\n`
    : h`<script src="/src/${s}.js" defer></script>\n`));
}

export function page(c, { headOpts, body, home = false, heroOut = true, extraScripts = [] }) {
  return `<!doctype html>
${h`<html lang="${c.htmlLang}" data-cf-skin${heroOut ? raw(' data-hero-out') : ''}>`}
${head(c, headOpts)}
${h`<body class="wc-grain">
<a class="wc-skip wc-t-ui" href="${home ? '#work' : '#main'}">${home ? c.T('a11y.skip') : c.T('a11y.skip.main')}</a>
${nav(c, { home })}
<main id="main">
${raw(String(body))}
</main>
${footer(c, { home })}
${layerChrome(c)}
${scripts(extraScripts)}</body>
</html>`}
`;
}
