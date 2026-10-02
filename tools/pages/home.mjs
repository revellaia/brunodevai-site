/* WORLDCRAFT · Home (02_HOMEPAGE_MASTER, Gate 2 aprovado). Secoes 00-10 do SECTION_MAP.
   Regras: copy so de data/copy.json; TBC omitido; SYSTEM real em <details> (sem JS) e camada com JS;
   anotacoes SYSTEM sao aria-hidden e dizem a verdade sobre a implementacao. */
import { h, raw, splitTwo } from '../lib/html.mjs';
import { t, tOptional } from '../lib/copy.mjs';
import { layerSwitch, ext } from './common.mjs';
import { proofRows, heroIndex } from './proof-text.mjs';

export const live = c => h`<span class="wc-live"><span class="wc-dot" aria-hidden="true"></span>${c.T('status.live')}</span>`;
export const sysDetails = (c, cls, inner, label) => h`<details class="wc-sysblock ${cls}" data-sys><summary class="wc-sys-summary wc-t-ui">${c.T('cta.see_build')}</summary><section class="wc-sys-layer" aria-label="${label || c.T('toggle.system')}">${inner}</section></details>`;
export const grid = () => raw('<div class="wc-grid-overlay" aria-hidden="true"></div>');

function hero(c, routes) {
  const s = c.site.media.hero, idx = heroIndex(c.proof, c.lang, routes);
  const dl = rows => h`<dl class="sys-index">${rows.map(([k, v]) => h`<div><dt>${c.T(k)}</dt><dd>${v}</dd></div>`)}</dl>`;
  const nameLines = (cls) => h`<span class="wc-mask hero-m1"><span class="hero-l1 ${cls}">${c.T('hero.name.line1')}</span></span><span class="wc-mask hero-m2"><span class="hero-l2 wc-italic ${cls}">${c.T('hero.name.line2')}</span></span>`;
  return h`<section class="hero" id="hero" aria-labelledby="hero-title">
  <div class="hero-media" aria-hidden="true">
    <picture>
      <source media="${s.mobileQuery}" type="image/avif" srcset="${s.poster.mobile.avif}">
      <source media="${s.mobileQuery}" type="image/webp" srcset="${s.poster.mobile.webp}">
      <source type="image/avif" srcset="${s.poster.desktop.avif}">
      <img class="hero-poster" src="${s.poster.desktop.webp}" width="${s.poster.desktop.w}" height="${s.poster.desktop.h}" alt="" fetchpriority="high" decoding="async">
    </picture>
    <video class="hero-video" muted playsinline loop preload="none" disablepictureinpicture tabindex="-1" data-hero-video data-src-desktop="${s.video.desktop}" data-src-mobile="${s.video.mobile}" data-mobile-query="${s.mobileQuery}"></video>
    <div class="hero-shade"></div>
  </div>
  <div class="hero-body wc-container">
    <h1 class="hero-name" id="hero-title"><span class="wc-sr-only">${c.T('nav.brand.primary')}</span><span aria-hidden="true">${nameLines('')}</span></h1>
    <p class="hero-statement wc-reveal-hero">${c.T('hero.primary.01')}<br><span class="wc-italic">${c.T('hero.primary.02')}</span></p>
    <div class="hero-meta">
      <p class="hero-role">${c.T('hero.role').replace(' / ', '\n')}</p>
      <div class="hero-switch">
        <p class="hero-sig" aria-hidden="true">${c.T('hero.signature')} <span>${c.T('hero.toggle.hint')}</span></p>
        ${layerSwitch(c, 'wc-switch--hero')}
      </div>
      <p class="hero-loc">${c.T('hero.location')}</p>
    </div>
    <a class="hero-viewwork wc-btn" href="#work">${c.T('hero.cta.mobile')}</a>
  </div>
  ${sysDetails(c, 'hero-sys', h`${grid()}
    <div class="hero-sys-body wc-container" aria-hidden="true">
      <p class="wc-annot hero-annot-h1">h1 · Newsreader 300 · clamp(112px, 20.1vw, 300px) · −0.045em · cols 1–8 · mask reveal 900ms surface</p>
      <p class="hero-name hero-name--outline">${nameLines('')}</p>
    </div>
    <div class="hero-sys-notes wc-container">
      <p class="wc-annot hero-annot-l2" aria-hidden="true">offset <span class="hero-off-3">+3</span><span class="hero-off-2">+2</span> cols · italic · +120ms</p>
      <div class="hero-sys-row">
        <div class="hero-sys-left">
          <p class="wc-annot hero-annot-st" aria-hidden="true">p.statement · Newsreader 300 · 38/1.14 · cols 1–6 · +240ms<br>bg · hero 16:9 · ${String(c.proof.media.hero_desktop_mib)} MiB · critical · poster = LCP</p>
          <p class="hero-sys-sig">${c.T('hero.signature')}</p>
        </div>
        <div class="hero-sys-index">
          <p class="sys-head"><span class="wc-dot" aria-hidden="true"></span>${c.T('toggle.system')} <span>${c.T('sys.this_page')}</span></p>
          <div class="sys-index--d">${dl(idx.desktop)}</div>
          <div class="sys-index--m">${dl(idx.mobile)}</div>
        </div>
      </div>
    </div>`)}
</section>`;
}

function work(c) {
  const P = c.site.projects;
  const label = id => c.T(`project.${id}.name`);
  const type = id => c.T(`project.${id}.type`);
  /* Vakon e CICO abrem o case interno; Pires, Paula e Memore seguem externos (nova aba). */
  const link = p => (p.case ? h`href="${c.url(p.case)}"` : h`href="${p.url}" target="_blank" rel="noopener noreferrer"`);
  const rows = P.map((p, i) => h`<li class="work-item"><a class="work-row" ${link(p)} data-i="${i}">
      <span class="work-n">${p.n}</span>
      <span class="work-namecell"><img class="work-thumb" src="${p.img['640']}" width="640" height="${Math.round(640 * p.img.h / p.img.w)}" alt="" loading="lazy" decoding="async"><span class="work-name">${label(p.id)}</span></span>
      <span class="work-type">${type(p.id)}</span>
      <span class="work-meta">${p.year ? h`<span class="k">${c.T('ui.meta.year')}</span><span>${p.year}</span>` : ''}<span class="k">${c.T('ui.meta.status')}</span>${live(c)}</span>${p.case ? '' : ext(c.T)}
    </a></li>`);
  const table = h`<table class="work-table" data-work-table hidden>
      <caption class="wc-sr-only">${c.T('work.label')}</caption>
      <thead><tr><th scope="col" aria-sort="ascending"><button type="button" data-sort="n">#</button></th><th scope="col"><button type="button" data-sort="name">${c.T('nav.work')}</button></th><th scope="col"><button type="button" data-sort="type">${c.T('ui.meta.type')}</button></th><th scope="col"><button type="button" data-sort="year">${c.T('ui.meta.year')}</button></th><th scope="col">${c.T('ui.meta.status')}</th></tr></thead>
      <tbody>${P.map(p => h`<tr data-n="${p.n}" data-name="${label(p.id)}" data-type="${type(p.id)}" data-year="${p.year || ''}"><td>${p.n}</td><th scope="row"><a ${link(p)}>${label(p.id)}${p.case ? '' : ext(c.T)}</a></th><td>${type(p.id)}</td><td>${p.year || ''}</td><td>${live(c)}</td></tr>`)}</tbody>
    </table>`;
  return h`<section class="work" id="work" aria-labelledby="work-title">
  <div class="work-preview" aria-hidden="true" data-work-preview>${P.map((p, i) => h`<img data-i="${i}" data-src="${p.img['960']}" width="${p.img.w}" height="${p.img.h}" alt="" decoding="async">`)}</div>
  ${grid()}
  <div class="work-in wc-container">
    <div class="work-head">
      <h2 class="wc-label" id="work-title">01 · ${c.T('work.label')}</h2>
      <div class="work-modes" role="group" aria-label="${c.T('work.label')}" data-work-modes hidden>[ <button type="button" aria-pressed="true" data-mode="immersive">${c.T('work.mode.immersive')}</button> | <button type="button" aria-pressed="false" data-mode="index">${c.T('work.mode.index')}</button> ]</div>
    </div>
    <ol class="work-list" data-work-list>${rows}</ol>
    ${table}
    <div class="work-foot"><p class="work-hint" aria-hidden="true">${c.T('work.hint')}</p><a class="wc-cta-u" href="${c.url('work')}">${c.T('work.all')} →</a></div>
  </div>
  <p class="wc-annot work-annot-1" aria-hidden="true">ProjectIndex · 5 × ProjectRow · Newsreader 300 · skew ≤ 4° from pointer velocity</p>
  <p class="wc-annot work-annot-2" aria-hidden="true">ProjectMediaPreview · 1 image in memory per hover · no video</p>
  <p class="wc-annot wc-annot--signal work-annot-3" aria-hidden="true">● a11y: rows are &lt;a&gt; · focus = hover · preview is aria-hidden · INDEX mode = &lt;table&gt;</p>
</section>`;
}

function vakon(c) {
  const v = c.site.vakon, p = c.site.projects.find(x => x.id === 'vakon');
  const title = c.T('vakon.title'); const cut = title.lastIndexOf(' ');
  const nodes = ['narrative', 'visual', 'web'].map(k => c.T(`vakon.sys.${k}`));
  const book = tOptional('vakon.sys.book', c.lang) || c.T('vakon.sys.book.safe');
  const node = (txt, cls) => { const [a, ...b] = txt.split(' · '); return h`<li class="umap-node ${cls}"><span class="umap-k">${a}</span><span class="umap-d">${b.join(' · ')}</span></li>`; };
  return h`<section class="vakon" id="vakon" aria-labelledby="vakon-title">
  <picture class="vakon-media" aria-hidden="true">
    <source media="(max-width: 767px)" srcset="${v.img.mobile}">
    <img src="${v.img.desktop}" width="${p.img.w}" height="${p.img.h}" alt="" loading="lazy" decoding="async" fetchpriority="low">
  </picture>
  <div class="vakon-shade" aria-hidden="true"></div>
  <div class="vakon-in wc-container">
    <div class="vakon-top"><p class="wc-label">${c.T('vakon.eyebrow')}</p><p class="vakon-live">${live(c)}<span class="vakon-host"> · ${p.host}</span></p></div>
    <h2 class="vakon-title" id="vakon-title" data-reveal="mask"><span class="wc-mask"><span>${title.slice(0, cut)}</span></span><span class="wc-mask"><span class="wc-italic">${title.slice(cut + 1)}</span></span></h2>
    <div class="vakon-row">
      <p class="vakon-lede">${c.T('vakon.lede')}</p>
      <p class="vakon-meta">${c.T('project.vakon.type')}</p>
      <p class="vakon-ctas"><a class="wc-btn wc-btn--primary" href="${c.url('vakon')}">${c.T('vakon.cta.case')}</a><a class="wc-btn wc-btn--line" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.T('vakon.cta.live')} ↗${ext(c.T)}</a></p>
    </div>
  </div>
  ${sysDetails(c, 'vakon-sys', h`<div class="vakon-sys-in wc-container">
    <p class="sys-head"><span class="wc-dot" aria-hidden="true"></span>${c.T('vakon.sys.label')}</p>
    <div class="umap">
      <p class="umap-center">${title}<span>${c.T('project.vakon.name')}</span></p>
      <ul class="umap-nodes">${node(nodes[0], 'umap-n')}${node(nodes[1], 'umap-w')}${node(nodes[2], 'umap-e')}${node(book, 'umap-s')}</ul>
    </div>
    <p class="wc-annot vakon-annot" aria-hidden="true">FlagshipCase · art / system split · nodes = HTML list · no game HUD language</p>
  </div>`)}
</section>`;
}

function cico(c) {
  const p = c.site.projects.find(x => x.id === 'cico');
  const [l1, l2] = splitTwo(c.T('cico.headline'), c.lang, { en: ' to ', pt: ' a sistema' });
  const nodes = c.site.cico.nodes.map(([k, kind], i) => h`<li class="cico-node cico-node--${i + 1} is-${kind}"><span class="cico-k">${c.T(`cico.sys.${k}`)}</span><span class="cico-d">${c.T(`cico.sys.${k}.desc`)}</span></li>`);
  const strip = c.site.cico.nodes.map(([k]) => c.T(`cico.sys.${k}`)).join(' · ');
  return h`<section class="cico" id="vi-cico" aria-labelledby="cico-title">
  <div class="cico-in wc-container">
    <div class="cico-text">
      <p class="wc-label">${c.T('cico.eyebrow')}</p>
      <h2 class="cico-title" id="cico-title" data-reveal="mask"><span class="wc-mask"><span>${l1}</span></span> <span class="wc-mask"><span class="wc-italic">${l2}</span></span></h2>
      <dl class="cico-meta">
        <div><dt>${c.T('ui.meta.project')}</dt><dd>${c.T('cico.meta.project')}</dd></div>
        <div><dt>${c.T('ui.meta.type')}</dt><dd>${c.T('project.cico.type')}</dd></div>
        <div><dt>${c.T('ui.meta.year')}</dt><dd>${p.year}</dd></div>
        <div><dt>${c.T('ui.meta.status')}</dt><dd>${live(c)}</dd></div>
      </dl>
      <p class="cico-ctas"><a class="wc-btn wc-btn--primary" href="${c.url('cico')}">${c.T('cico.cta.system')}</a><a class="wc-btn wc-btn--line" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.T('cico.cta.live')} ↗${ext(c.T)}</a></p>
    </div>
    <div class="cico-stage">
      <div class="cico-bar">${layerSwitch(c, 'wc-switch--local')}<p class="cico-host">${p.host} · ${c.T('cico.public_only')}</p></div>
      <div class="cico-frame">
        <img class="cico-shot" src="${p.img['960']}" srcset="${p.img['640']} 640w, ${p.img['960']} 960w" sizes="(min-width: 1024px) 58vw, 100vw" width="${p.img.w}" height="${p.img.h}" alt="${c.T('project.cico.name')} · ${c.T('cico.public_only')}" loading="lazy" decoding="async">
        ${sysDetails(c, 'cico-sys', h`<p class="sys-head"><span class="wc-dot" aria-hidden="true"></span>${c.T('cico.sys.label')}</p>
          <ol class="cico-diagram">${nodes}</ol>
          <p class="cico-never">${c.T('cico.sys.never')}</p>`)}
      </div>
      <p class="cico-strip" aria-hidden="true">${strip}</p>
    </div>
  </div>
</section>`;
}

function clients(c) {
  const ids = ['pires', 'paula', 'memore'];
  const P = Object.fromEntries(c.site.projects.map(p => [p.id, p]));
  const types = ids.map(id => c.T(`project.${id}.type`).split(' / ')[0]).join(' · ');
  return h`<section class="clients" id="clients" aria-labelledby="clients-title">
  ${grid()}
  <div class="clients-in wc-container">
    <div class="clients-head"><h2 class="wc-label" id="clients-title">04 · ${c.T('client.label')}</h2><p class="clients-types" aria-hidden="true">${types}</p></div>
    ${ids.map(id => { const p = P[id]; return h`<article class="client client--${id}" aria-labelledby="client-${id}">
      <a href="${p.url}" target="_blank" rel="noopener noreferrer">
        <figure class="client-media" data-reveal="media"><img src="${p.img['960']}" srcset="${p.img['640']} 640w, ${p.img['960']} 960w" sizes="(min-width: 1024px) 60vw, 100vw" width="${p.img.w}" height="${p.img.h}" alt="${c.T(`project.${id}.name`)} · ${c.T(`project.${id}.type`)}" loading="lazy" decoding="async"></figure>
        <span class="client-cap"><span class="client-name" id="client-${id}">${c.T(`project.${id}.name`)}</span><span class="client-type">${c.T(`project.${id}.type`)} · ${live(c)}</span></span>${ext(c.T)}
      </a>
    </article>`; })}
  </div>
  <p class="wc-annot clients-annot-1" aria-hidden="true">EditorialCaseGrid · rhythm L(8) / S(3, offset 10) / L(9, offset 4) · 16:10 · 4:5 · 16:9</p>
  <p class="wc-annot clients-annot-2" aria-hidden="true">images: existing 640/960 · lazy · mask reveal · 0 video · no hover dependency</p>
</section>`;
}

export function labCard(c, s, order) {
  return h`<li class="lab-card lab-card--${s.ratio === '4/5' ? 'p' : 'l'} lab-card--o${order}${s.letterbox ? ' lab-card--lb' : ''}">
    <a href="${c.url('lab-' + s.slug)}" data-film="${s.film}">
      <span class="lab-media"><img src="${s.poster}" width="${s.pw}" height="${s.ph}" alt="" loading="lazy" decoding="async"><span class="lab-badge" aria-hidden="true">▶ ${c.T('lab.card.film')}</span></span>
      <span class="lab-meta"><span>${s.code}</span><span>${c.T('lab.card.type')}</span></span>
      <span class="lab-name">${s.title}</span>
    </a>
  </li>`;
}

export function labCards(c) {
  const L = c.site.lab;
  /* Ordem do Master por colunas (001+004 | 002+005 | 003+006); a faixa mobile reordena por --o (001..006). */
  return h`<ul class="lab-grid">${c.site.labColumns.flat().map(i => labCard(c, L[i], i + 1))}</ul>`;
}

function lab(c) {
  return h`<section class="lab" id="lab" aria-labelledby="lab-title">
  ${grid()}
  <div class="lab-in wc-container">
    <div class="lab-head">
      <h2 class="lab-title" id="lab-title" data-reveal="mask"><span class="wc-mask"><span>${c.T('lab.title')}</span></span></h2>
      <div class="lab-intro"><p class="wc-label">05 · ${c.T('lab.label')}</p><p class="lab-lede">${c.T('lab.lede')}</p></div>
    </div>
    ${labCards(c)}
    <div class="lab-foot"><p><span class="lab-swipe">${c.T('ui.swipe')} · </span>${c.T('lab.count')}</p><a href="${c.url('lab')}">${c.T('lab.cta')} →</a></div>
  </div>
  <p class="wc-annot lab-annot-1" aria-hidden="true">LabIndex · 3 staggered columns (0 / 120 / 48px) · LabCard: poster 4:5 or 16:10, grayscale 60% at rest</p>
  <p class="wc-annot wc-annot--signal lab-annot-2" aria-hidden="true">● G-004: 1 delivery profile per study · film requested on hover/focus only · max 1 playing · masters off-deploy</p>
</section>`;
}

function engineering(c) {
  const [l1, l2] = splitTwo(c.T('hero.signature'), c.lang, { en: ' is ', pt: ' é ' });
  const rows = proofRows(c.proof, c.lang);
  return h`<section class="proof" id="engineering" aria-labelledby="proof-title">
  <div class="proof-in wc-container">
    <div class="proof-intro">
      <p class="wc-label">06 · ${c.T('proof.label')}</p>
      <h2 class="proof-title" id="proof-title" data-reveal="mask"><span class="wc-mask"><span>${l1}</span></span> <span class="wc-mask"><span class="wc-italic">${l2}</span></span></h2>
      <p class="proof-lede">${c.T('proof.lede')}</p>
    </div>
    <div class="proof-table">
      <dl data-reveal="rows">${rows.map(([k, v, src]) => h`<div class="proof-row"><dt>${c.T(k)}</dt><dd><span>${v}</span><span class="proof-src wc-sys-inline">${c.T('sys.src')} · ${src}</span></dd></div>`)}</dl>
      <p class="proof-foot">${c.T('proof.footnote')}</p>
    </div>
  </div>
</section>`;
}

function about(c) {
  return h`<section class="about" id="about" aria-labelledby="about-title">
  <div class="about-in wc-container">
    <h2 class="wc-label" id="about-title">07 · ${c.T('about.label')}</h2>
    <div class="about-body">
      <ul class="about-caps">${c.T('about.capabilities').split(' · ').map(x => h`<li>${x}</li>`)}</ul>
      <a class="wc-cta-u" href="${c.url('about')}">${c.T('about.cta')} →</a>
    </div>
  </div>
</section>`;
}

function manifesto(c) {
  const [l1, l2] = splitTwo(c.T('manifesto.main'), c.lang, { en: '. ', pt: '. ' }, 'after');
  const lines = ['manifesto.line.01', 'manifesto.line.02', 'manifesto.line.03'].map(id => c.T(id));
  /* Pagina EN: a linha de equity da marca em PT (APPROVED · PT equity) aparece em ouro, como no Master. */
  const equity = c.lang === 'en' ? h`<li class="manifesto-eq" lang="pt-BR">${t('manifesto.main', 'pt', { stage: 'production' })}</li>` : '';
  return h`<section class="manifesto" id="principle" aria-labelledby="manifesto-title">
  <div class="manifesto-in wc-container">
    <p class="wc-label">08 · ${c.T('manifesto.label')}</p>
    <h2 class="manifesto-main" id="manifesto-title" data-reveal="mask"><span class="wc-mask"><span>${l1}</span></span> <span class="wc-mask"><span class="wc-italic">${l2}</span></span></h2>
    <ul class="manifesto-lines${c.lang === 'en' ? ' has-eq' : ''}" data-reveal="rows">${equity}${lines.map(x => h`<li>${x}</li>`)}</ul>
  </div>
</section>`;
}

function contact(c) {
  const [l1, l2] = splitTwo(c.T('contact.headline'), c.lang, { en: ' worth', pt: ' que' });
  return h`<section class="contact" id="contact" aria-labelledby="contact-title">
  <div class="contact-in wc-container">
    <p class="wc-label">09 · ${c.T('contact.label')}</p>
    <h2 class="contact-title" id="contact-title" data-reveal="mask"><span class="wc-mask"><span>${l1}</span></span> <span class="wc-mask"><span class="wc-italic">${l2}</span></span></h2>
    <div class="contact-actions">
      <a class="wc-btn wc-btn--primary" href="mailto:${c.site.contact.email}" data-contact-flow data-magnetic>${c.T('contact.cta')}</a>
      <a class="wc-btn wc-btn--line contact-wa" href="${c.site.contact.whatsapp}" target="_blank" rel="noopener noreferrer" data-cf-wa>${c.T('contact.whatsapp')} ↗${ext(c.T)}</a>
      <a class="contact-email" href="mailto:${c.site.contact.email}" data-cf-mail>${c.T('contact.email')}</a>
    </div>
  </div>
</section>`;
}

export function homeBody(c, routes) {
  return [hero(c, routes), work(c), vakon(c), cico(c), clients(c), lab(c), engineering(c), about(c), manifesto(c), contact(c)].join('\n');
}
