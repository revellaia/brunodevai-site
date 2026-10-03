/* BRUNO DEV.AI V3 · cases completos: /work/vakon-universe/ e /work/vi-cico/ (shell V3 sobre o conteudo factual da V2).
   Regras: so fatos confirmados (PUBLISHED_OWNER / PUBLIC_FACT); TBC omitido (PAGAMENTO e cliente do CICO ficam fora);
   CICO: so area publica — nunca dados pessoais, telas de admin, credenciais, endpoints ou detalhes de banco.
   Midia de case: NATURAL_RATIO puro (width/height do arquivo, sem corte). A camada SYSTEM global da V2 foi superada (V3). */
import { h, raw } from '../lib/html.mjs';
import { ext, live } from './common.mjs';

function figure(c, [src, w, hh], alt, { cls = '', load = 'lazy' } = {}) {
  return h`<figure class="case-fig ${cls}" data-reveal="media">
      <img class="nat" src="${src}" width="${w}" height="${hh}" alt="${alt}" loading="${load}" decoding="async"${load === 'eager' ? raw(' fetchpriority="high"') : ''}>
    </figure>`;
}

function phones(c, list, alts) {
  /* no mobile a faixa rola na horizontal: tabindex deixa o teclado rolar (WCAG 2.1.1, axe scrollable-region-focusable) */
  return h`<ul class="case-phones" tabindex="0">${list.map(([src, w, hh], i) => h`<li>${figure(c, [src, w, hh], alts[i], { cls: 'case-fig--phone' })}</li>`)}</ul>`;
}

/* Secao editorial: rotulo mono numerado (cols 1-3) + conteudo (cols 4-12). */
function sec(n, label, inner, { id = '', cls = '', after = '' } = {}) {
  return h`<section class="case-sec ${cls}"${id ? raw(` id="${id}"`) : ''} aria-labelledby="cs-${n}">
    <div class="case-sec-in grid">
      <h2 class="case-k eyebrow" id="cs-${n}"><span class="eyebrow-n">${n}</span><span class="eyebrow-rule" aria-hidden="true"></span>${label}</h2>
      ${inner ? h`<div class="case-body">${inner}</div>` : ''}
    </div>
    ${after}
  </section>`;
}

const stmt = (txt, cls = '') => h`<p class="case-stmt ${cls}">${txt}</p>`;
const body = txt => h`<p class="case-text">${txt}</p>`;
/* "Chave · resto" -> linha de sistema (dt/dd). */
const sysRows = rows => h`<dl class="case-rows">${rows.map(r => { const [k, ...v] = r.split(' · '); return h`<div><dt>${k}</dt><dd>${v.join(' · ')}</dd></div>`; })}</dl>`;

function hero(c, p, { label, l1, l2, lede, media, cta }) {
  const m = c.site.cases[p.id];
  return h`<header class="case-hero">
  <div class="case-hero-in">
    <nav class="crumb" aria-label="${c.T('a11y.breadcrumb')}"><ol><li><a href="${c.url('home')}">Bruno Dev.AI</a></li><li><a href="${c.url('work')}">${c.T('v3.nav.work')}</a></li><li aria-current="page">${c.T(`project.${p.id}.name`)}</li></ol></nav>
    <p class="eyebrow"><span class="eyebrow-rule" aria-hidden="true"></span>${label}</p>
    <h1 class="h1 case-title" id="case-title">${l1}${l2 ? h` <span class="it">${l2}</span>` : ''}</h1>
    <div class="case-hero-row">
      <p class="case-lede">${lede}</p>
      <p class="case-ctas">${cta}</p>
    </div>
  </div>
  <figure class="case-hero-media">
    ${media}
  </figure>
</header>`;
}

function meta(c, p, rows) {
  return h`<section class="case-meta-sec" aria-labelledby="cs-meta">
  <div>
    <h2 class="sr-only" id="cs-meta">${c.T('case.meta')}</h2>
    <dl class="case-meta">${rows.filter(Boolean).map(([k, v]) => h`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>
  </div>
</section>`;
}

const liveLink = (c, p, label) => h`<a class="btn btn--secondary" href="${p.url}" target="_blank" rel="noopener noreferrer">${label} ↗${ext(c.T)}</a>`;
const hostLink = (c, p) => h`<a href="${p.url}" target="_blank" rel="noopener noreferrer">${p.host}${ext(c.T)}</a>`;

function liveSec(c, p, n) {
  return sec(n, c.T('case.live'), h`<p class="case-live"><a class="case-live-link" href="${p.url}" target="_blank" rel="noopener noreferrer"><span class="case-live-host">${p.host}</span> <span aria-hidden="true">↗</span>${ext(c.T)}</a></p>
      <p class="case-live-st">${live(c)}</p>`, { cls: 'case-sec--live' });
}

function next(c, id) {
  const p = c.site.projects.find(x => x.id === id);
  return h`<nav class="case-next" aria-label="${c.T('case.next')}">
  <a class="case-next-link" href="${c.url(p.case)}">
    <span class="eyebrow"><span class="eyebrow-n">${p.n}</span><span class="eyebrow-rule" aria-hidden="true"></span>${c.T('case.next')}</span>
    <span class="case-next-name">${c.T(`project.${id}.name`)} <span aria-hidden="true">→</span></span>
    <span class="case-next-type">${c.T(`project.${id}.type`)}</span>
  </a>
</nav>`;
}

export function vakonCase(c) {
  const p = c.site.projects.find(x => x.id === 'vakon'), m = c.site.cases.vakon, name = c.T('project.vakon.name');
  const alt = k => `${name} · ${c.T(k)}`;
  const media = h`<picture>
      <source media="(max-width: 767px)" srcset="${m.heroMobile}">
      <img class="nat" src="${m.hero}" width="${m.hw}" height="${m.hh}" alt="${name} · ${c.T('vakon.title')}" decoding="async" fetchpriority="high">
    </picture>`;
  const nodes = ['narrative', 'visual', 'web'].map(k => c.T(`vakon.sys.${k}`));
  const node = (txt, cls) => { const [a, ...b] = txt.split(' · '); return h`<li class="umap-node ${cls}"><span class="umap-k">${a}</span><span class="umap-d">${b.join(' · ')}</span></li>`; };
  return h`<article class="case case--vakon" aria-labelledby="case-title">
${hero(c, p, {
    label: c.T('vakon.eyebrow'), l1: name, l2: c.T('vakon.title'), lede: c.T('vakon.case.desc'), media,
    cta: h`<a class="btn btn--primary" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.T('vakon.cta.live')} ↗${ext(c.T)}</a>`,
  })}
${meta(c, p, [
    [c.T('ui.meta.project'), name],
    [c.T('ui.meta.type'), c.T('project.vakon.type')],
    [c.T('ui.meta.status'), live(c)],
    [c.T('ui.meta.url'), hostLink(c, p)],
  ])}
${sec('01', c.T('case.idea'), h`${stmt(c.T('vakon.case.solution'))}
      <dl class="case-pair"><div><dt>${c.T('case.challenge')}</dt><dd>${c.T('vakon.case.challenge')}</dd></div></dl>`)}
${sec('02', c.T('case.world'), stmt(c.T('vakon.case.world'), 'case-stmt--s'), { after: figure(c, m.world, alt('case.world'), { cls: 'case-fig--bleed' }) })}
${sec('03', c.T('case.experience'), stmt(c.T('vakon.lede'), 'case-stmt--s'), { after: figure(c, m.experience, alt('case.experience'), { cls: 'case-fig--bleed' }) })}
${sec('04', c.T('case.design'), body(c.T('vakon.case.design')))}
${sec('05', c.T('case.system'), h`${sysRows(['vakon.case.sys.content', 'vakon.case.sys.languages', 'vakon.case.sys.book', 'vakon.case.sys.media'].map(k => c.T(k)))}
      ${h`<div class="case-diagram"><p class="sys-head"><span class="dot" aria-hidden="true"></span>${c.T('vakon.sys.label')}</p>
        <div class="umap umap--case">
          <p class="umap-center">${c.T('vakon.title')}<span>${name}</span></p>
          <ul class="umap-nodes">${node(nodes[0], 'umap-n')}${node(nodes[1], 'umap-w')}${node(nodes[2], 'umap-e')}${node(c.T('vakon.case.sys.book'), 'umap-s')}</ul>
        </div></div>`}`)}
${sec('06', c.T('case.responsive'), h`${body(c.T('vakon.case.responsive'))}${phones(c, m.mobile, [alt('case.mobile'), alt('case.mobile'), alt('case.mobile')])}`)}
${sec('07', c.T('case.details'), '', { after: figure(c, m.details, alt('case.details'), { cls: 'case-fig--bleed' }) })}
${liveSec(c, p, '08')}
${next(c, 'cico')}
</article>`;
}

export function cicoCase(c) {
  const p = c.site.projects.find(x => x.id === 'cico'), m = c.site.cases.cico, name = c.T('project.cico.name');
  const alt = k => `${name} · ${c.T(k)} · ${c.T('cico.public_only')}`;
  const media = h`<img class="nat" src="${m.hero}" width="${m.hw}" height="${m.hh}" alt="${alt('case.portal')}" decoding="async" fetchpriority="high">`;
  const nodes = c.site.cico.nodes.map(([k, kind], i) => h`<li class="cico-node cico-node--${i + 1} is-${kind}"><span class="cico-k">${c.T(`cico.sys.${k}`)}</span><span class="cico-d">${c.T(`cico.sys.${k}.desc`)}</span></li>`);
  const flow = [1, 2, 3, 4, 5].map(i => c.T(`cico.case.flow.${i}`));
  return h`<article class="case case--cico" aria-labelledby="case-title">
${hero(c, p, {
    label: c.T('cico.eyebrow'), l1: name, l2: '', lede: c.T('cico.case.desc'), media,
    cta: h`<a class="btn btn--primary" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.T('cico.cta.live')} ↗${ext(c.T)}</a>`,
  })}
${meta(c, p, [
    [c.T('ui.meta.project'), c.T('cico.meta.project')],
    [c.T('ui.meta.type'), c.T('project.cico.type')],
    [c.T('ui.meta.event'), c.T('cico.case.event')],
    [c.T('ui.meta.year'), p.year],
    [c.T('ui.meta.status'), live(c)],
    [c.T('ui.meta.url'), hostLink(c, p)],
  ])}
${sec('01', c.T('case.challenge'), h`${stmt(c.T('cico.headline'))}${body(c.T('cico.case.challenge'))}`)}
${sec('02', c.T('case.experience'), stmt(c.T('cico.case.idea'), 'case-stmt--s'))}
${sec('03', c.T('case.portal'), body(c.T('cico.case.portal')), { after: figure(c, m.portal, alt('case.portal'), { cls: 'case-fig--bleed' }) })}
${sec('04', c.T('case.registration'), h`<div class="case-split">${body(c.T('cico.case.registration'))}${figure(c, m.registration, alt('case.registration'), { cls: 'case-fig--phone' })}</div>`)}
${sec('05', c.T('case.congressist'), body(c.T('cico.case.congressist')))}
${sec('06', c.T('case.scientific'), h`${body(c.T('cico.case.scientific'))}
      <ol class="case-flow">${flow.map((f, i) => { const [k, ...v] = f.split(' · '); return h`<li><span class="case-flow-n">${String(i + 1).padStart(2, '0')}</span><span class="case-flow-k">${k}</span>${v.length ? h`<span class="case-flow-v">${v.join(' · ')}</span>` : ''}</li>`; })}</ol>
      ${figure(c, m.scientific, alt('case.scientific'))}`)}
${sec('07', c.T('case.certification'), h`${body(c.T('cico.case.certification'))}${figure(c, m.certification, alt('case.certification'))}`)}
${sec('08', c.T('case.operations'), body(c.T('cico.case.operations')))}
${sec('09', c.T('case.mobile'), h`${body(c.T('cico.case.mobile'))}${phones(c, m.mobile, [alt('case.portal'), alt('case.registration'), alt('case.certification')])}`)}
${sec('10', c.T('case.systemview'), h`<div class="case-diagram">
        <p class="sys-head"><span class="dot" aria-hidden="true"></span>${c.T('cico.sys.label')}</p>
        <ol class="cico-diagram">${nodes}</ol>
        <p class="cico-never">${c.T('cico.sys.never')}</p>
      </div>`)}
${sec('11', c.T('case.engineering'), h`<ul class="case-list">${[1, 2, 3, 4].map(i => h`<li>${c.T(`cico.case.eng.${i}`)}</li>`)}</ul>`)}
${liveSec(c, p, '12')}
${next(c, 'vakon')}
</article>`;
}
