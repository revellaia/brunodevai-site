/* BRUNO DEV.AI V3 · Home (01_MASTER/V3Page.dc.html + 10_SECTIONS). Ordem canonica: 01 Hero · 02 Client strip ·
   03 Selected work · 04 VI CICO · 05 Capabilities · 06 Engineering · 07 Lab · 08 About · 09 Contact (00/10 no shell).
   Regras: copy so de data/copy.json; framing so via data-adm (MEDIA_FRAMING_MANIFEST -> src/media.css);
   slides 2-5 do hero sem src (carregados sob demanda; SAVE DATA nunca baixa); Engineering so com fatos de src/proof.json. */
import { h, raw } from '../lib/html.mjs';
import { ext, live, adm, eyebrow } from './common.mjs';

const P = (c, id) => c.site.projects.find(p => p.id === id);
const shotSet = p => `${p.img['640']} 640w, ${p.img['960']} 960w`;

/* Slides do HeroProjectFrame: framing por slide = manifest (Vakon ART_DIRECTED_CROP 55% 50%; screenshots NATURAL_RATIO). */
function slides(c) {
  const v = P(c, 'vakon');
  return [
    { id: 'vakon', adm: 'hero.frame.vakon', src: v.img['960'], srcset: `${v.img['640']} 760w, ${v.img['960']} 1200w`, w: v.img.w, h: v.img.h, name: c.T('v3.slide.vakon.name'), type: c.T('v3.slide.vakon.type'), alt: c.T('v3.slide.vakon.alt'), href: c.url('vakon') },
    ...['cico', 'pires', 'paula', 'memore'].map(id => {
      const p = P(c, id);
      return { id, adm: `shot.${id}`, src: p.img['960'], srcset: shotSet(p), w: p.img.w, h: p.img.h, name: c.T(`v3.slide.${id}.name`), type: c.T(`v3.type.${id}`), alt: c.T(`v3.slide.${id}.alt`), href: p.case ? c.url(p.case) : p.url, external: !p.case };
    }),
  ];
}

function hero(c) {
  const s = c.site.media.hero;
  const S = slides(c);
  const sizes = '(min-width: 1024px) 50vw, 100vw';
  return h`<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="hero-bd" aria-hidden="true" data-hero-bd>
    <div class="adm" data-adm="hero.backdrop">
      <picture>
        <source media="(max-width: 767px)" type="image/avif" srcset="${s.poster.mobile.avif}">
        <source media="(max-width: 767px)" type="image/webp" srcset="${s.poster.mobile.webp}">
        <source type="image/avif" srcset="${s.poster.desktop.avif}">
        <img class="adm-m" src="${s.poster.desktop.webp}" width="${s.poster.desktop.w}" height="${s.poster.desktop.h}" alt="" loading="lazy" decoding="async" fetchpriority="low">
      </picture>
      <video class="adm-m" muted playsinline loop preload="none" disablepictureinpicture tabindex="-1" data-hero-video data-src-desktop="${s.video.desktop}" data-src-mobile="${s.video.mobile}"></video>
    </div>
  </div>
  <div class="hero-grad" aria-hidden="true"></div>
  <div class="hero-grid grid">
    <div class="hero-text">
      <p class="eyebrow"><span class="eyebrow-rule" aria-hidden="true"></span><span><span class="hero-eb-name">${c.T('v3.hero.eyebrow.name')} · </span>${c.T('v3.hero.eyebrow.role')}</span></p>
      <h1 class="h1" id="hero-title">${c.T('v3.hero.h1.a')} <span class="it">${c.T('v3.hero.h1.b')}</span></h1>
      <p class="hero-lead">${c.T('v3.hero.sub')}</p>
      <p class="hero-ctas">
        <a class="btn btn--primary" href="mailto:${c.site.contact.email}" data-contact-flow>${c.T('v3.hero.cta.primary')} <span aria-hidden="true">→</span></a>
        <a class="link-u hero-cta2" href="#work">${c.T('v3.hero.cta.secondary')}</a>
      </p>
    </div>
    <div class="hero-media" data-hpf>
      <div class="hpf-frame" role="region" aria-roledescription="${c.T('v3.hero.frame.roledesc')}" aria-label="${c.T('v3.hero.frame.region')}">
        ${S.map((x, i) => h`<div class="hpf-slide${i === 0 ? ' is-active' : ''}" data-slide="${i}" data-name="${x.name}" data-type="${x.type}"${i ? raw(' aria-hidden="true"') : ''}>${adm(c, { id: x.adm, src: x.src, srcset: x.srcset, sizes, w: x.w, h: x.h, alt: x.alt, loading: 'eager', priority: i === 0, deferred: i > 0 })}</div>`)}
        <p class="hpf-count mono" aria-hidden="true"><span data-hpf-n>01</span> / ${String(S.length).padStart(2, '0')}</p>
        <button type="button" class="hpf-pause" data-hpf-pause data-label-pause="${c.T('v3.hero.frame.pause')}" data-label-play="${c.T('v3.hero.frame.play')}" aria-label="${c.T('v3.hero.frame.pause')}" hidden><span aria-hidden="true" data-hpf-icon>II</span></button>
      </div>
      <div class="hpf-cap">
        <div class="hpf-meta" data-hpf-live>
          <p class="label">${c.T('v3.hero.frame.label')}</p>
          <p class="hpf-name" data-hpf-name>${S[0].name}</p>
          <p class="hpf-type" data-hpf-type>${S[0].type}</p>
        </div>
        <div class="hpf-bars" data-hpf-bars hidden>${S.map((x, i) => h`<button type="button" class="hpf-bar" data-go="${i}" aria-label="${c.T('v3.hero.frame.show')}: ${x.name}"${i === 0 ? raw(' aria-current="true"') : ''}><span></span></button>`)}</div>
      </div>
      <ul class="hpf-nojs" aria-label="${c.T('v3.hero.frame.list')}">${S.map(x => h`<li><a href="${x.href}"${x.external ? raw(' target="_blank" rel="noopener noreferrer"') : ''}>${x.name}${x.external ? ext(c.T) : ''}</a></li>`)}</ul>
    </div>
  </div>
</section>`;
}

function strip(c) {
  return h`<section class="strip" aria-label="${c.T('v3.strip.label')}">
  <p class="label">${c.T('v3.strip.label')}</p>
  <ul class="strip-list">${['vakon', 'cico', 'pires', 'paula', 'memore'].map(id => h`<li>${c.T(`v3.strip.${id}`)}</li>`)}</ul>
</section>`;
}

function work(c) {
  const v = P(c, 'vakon');
  const cards = ['cico', 'pires', 'paula', 'memore'].map(id => {
    const p = P(c, id);
    const href = p.case ? c.url(p.case) : p.url;
    return h`<article>
      <a class="card" href="${href}"${p.case ? '' : raw(' target="_blank" rel="noopener noreferrer"')}>
        ${adm(c, { id: `shot.${id}`, src: p.img['960'], srcset: shotSet(p), sizes: '(min-width: 768px) 50vw, 100vw', w: p.img.w, h: p.img.h, alt: c.T(`v3.slide.${id}.alt`), reveal: true })}
        <div class="card-meta">
          <div class="card-id"><h3 class="card-name">${c.T(`v3.slide.${id}.name`)}${p.case ? '' : ext(c.T)}</h3><p class="card-type">${c.T(`v3.type.${id}`)}</p></div>
          ${live(c)}
        </div>
      </a>
    </article>`;
  });
  return h`<section class="sec" id="work" aria-labelledby="work-title">
  <div class="sec-head">
    <div class="sec-title">${eyebrow('01', c.T('v3.work.eyebrow'))}<h2 class="h2" id="work-title">${c.T('v3.work.h2')}</h2></div>
    <a class="link-u" href="${c.url('work')}">${c.T('v3.work.all')}</a>
  </div>
  <a class="feat" href="${c.url('vakon')}" aria-label="The Frozen Legacy · ${c.T('v3.work.cta').replace(' →', '')}">
    ${adm(c, { id: 'work.vakon.feature', src: v.img['960'], w: v.img.w, h: v.img.h, alt: c.T('v3.slide.vakon.alt'), mobile: v.img['640'], reveal: true })}
    <span class="feat-grad" aria-hidden="true"></span>
    <span class="feat-body">
      <span class="feat-txt"><span class="feat-eb">${c.T('v3.work.vakon.eyebrow')}</span><span class="feat-title">The Frozen Legacy</span><span class="feat-lede">${c.T('v3.work.vakon.lede')}</span></span>
      <span class="feat-act">${live(c)}<span class="link-u">${c.T('v3.work.cta')}</span></span>
    </span>
  </a>
  <div class="wgrid">${cards}</div>
</section>`;
}

function cico(c) {
  const p = P(c, 'cico');
  const nodes = [1, 2, 3, 4, 5, 6].map(i => h`<li${i === 3 ? raw(' class="is-key"') : ''}><span class="cico-n mono">0${i}</span><span class="cico-t">${c.T(`v3.cico.node.${i}.t`)}</span><span class="cico-d">${c.T(`v3.cico.node.${i}.d`)}</span></li>`);
  return h`<section class="cico grid" id="vi-cico" aria-labelledby="cico-title">
  <div class="cico-text">
    ${eyebrow('02', c.T('v3.cico.eyebrow'))}
    <h2 class="h2" id="cico-title">${c.T('v3.cico.h2.a')} <span class="it">${c.T('v3.cico.h2.b')}</span></h2>
    <p class="cico-lede">${c.T('v3.cico.lede')}</p>
    <dl class="cico-meta">
      <dt>${c.T('v3.cico.meta.type')}</dt><dd>${c.T('v3.type.cico')}</dd>
      <dt>${c.T('v3.cico.meta.year')}</dt><dd>${p.year}</dd>
      <dt>${c.T('v3.cico.meta.status')}</dt><dd><span class="dot" aria-hidden="true"></span>${c.T('v3.status.live')}</dd>
    </dl>
    <p class="cico-ctas"><a class="link-u" href="${c.url('cico')}">${c.T('v3.cico.cta.case')}</a><a class="link-plain" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.T('v3.cico.cta.live')}${ext(c.T)}</a></p>
  </div>
  <div class="cico-media" data-cico>
    <div class="cico-bar">
      <div class="tabs" role="tablist" aria-label="${c.T('v3.cico.tabs')}" hidden data-tabs>
        <button type="button" class="tab" role="tab" id="cico-tab-ui" data-tab="ui" aria-selected="true" aria-controls="cico-ui">${c.T('v3.cico.tab.ui')}</button>
        <button type="button" class="tab" role="tab" id="cico-tab-sys" data-tab="sys" aria-selected="false" aria-controls="cico-sys" tabindex="-1">${c.T('v3.cico.tab.sys')}</button>
      </div>
      <p class="cico-sig">${c.T('v3.cico.signature')}</p>
    </div>
    <div class="browser">
      <div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span><span class="browser-url mono">${p.host}</span></div>
      <div class="cico-panel" id="cico-ui" role="tabpanel" aria-labelledby="cico-tab-ui">${adm(c, { id: 'shot.cico', src: p.img['960'], srcset: shotSet(p), sizes: '(min-width: 1200px) 55vw, 100vw', w: p.img.w, h: p.img.h, alt: c.T('v3.cico.shot.alt') })}</div>
      <div class="cico-panel cico-sys" id="cico-sys" role="tabpanel" aria-labelledby="cico-tab-sys" data-sys-panel>
        <p class="cico-sys-label">${c.T('v3.cico.sys.label')}</p>
        <ol class="cico-nodes">${nodes}</ol>
        <p class="cico-note">${c.T('v3.cico.note')}</p>
      </div>
    </div>
  </div>
</section>`;
}

function capabilities(c) {
  return h`<section class="sec" id="capabilities" aria-labelledby="caps-title">
  <div class="sec-head">
    <div class="sec-title sec-title--s">${eyebrow('03', c.T('v3.caps.eyebrow'))}<h2 class="h2" id="caps-title">${c.T('v3.caps.h2')}</h2></div>
    <p class="sec-lede">${c.T('v3.caps.lede')}</p>
  </div>
  <ul class="caps">${[1, 2, 3, 4].map(i => h`<li class="cap"><span class="cap-n mono">0${i}</span><h3 class="cap-t">${c.T(`v3.caps.${i}.t`)}</h3><p class="cap-d">${c.T(`v3.caps.${i}.d`)}</p></li>`)}</ul>
</section>`;
}

/* Engineering: linhas so com evidencia (src/proof.json + build). Linha sem evidencia = omitida. */
function engRows(c) {
  const p = c.proof, q = p.qa;
  const rows = [];
  if (p.security.csp_self && p.security.xfo === 'DENY') rows.push(['security', c.T('v3.eng.v.security')]);
  if (q && q.overflow_max === 0) rows.push(['responsive', c.T('v3.eng.v.responsive').replace('{n}', String(q.viewports.length))]);
  if (!q || q.video_requests.full <= 1) rows.push(['performance', c.T('v3.eng.v.performance')]);
  rows.push(['a11y', c.T('v3.eng.v.a11y')]);
  if (p.media.pass) rows.push(['media', c.T('v3.eng.v.media')]);
  rows.push(['delivery', c.T('v3.eng.v.delivery')]);
  return rows;
}

function engineering(c) {
  return h`<section class="eng-sec" aria-labelledby="eng-title">
  <div class="eng grid">
    <div class="eng-text">
      ${eyebrow('04', c.T('v3.eng.eyebrow'))}
      <h2 class="h3" id="eng-title">${c.T('v3.eng.h.a')} <span class="it">${c.T('v3.eng.h.b')}</span></h2>
      <p class="eng-note">${c.T('v3.eng.note')}</p>
    </div>
    <dl class="eng-list">${engRows(c).map(([k, v]) => h`<div><dt>${c.T(`v3.eng.k.${k}`)}</dt><dd>${v}</dd></div>`)}</dl>
  </div>
</section>`;
}

/* Lab: poster 4:5 (tablet-portrait) por estudo; NATURAL_RATIO (nunca paisagem forcada em retrato). Filmes so na pagina do estudo. */
export function labCard(c, s) {
  return h`<a class="lab-card" href="${c.url('lab-' + s.slug)}">
      ${adm(c, { id: `lab.${s.slug}`, src: s.poster4x5, w: 768, h: 960, alt: s.title, reveal: true })}
      <span class="lab-card-t"><span class="lab-card-name">${s.title}</span><span class="lab-card-type">${c.T('v3.lab.card')}</span></span>
    </a>`;
}

function lab(c) {
  return h`<section class="lab" id="lab" aria-labelledby="lab-title">
  <div class="lab-head">
    <div class="sec-title">${eyebrow('05', c.T('v3.lab.eyebrow'))}<h2 class="h3" id="lab-title">${c.T('v3.lab.h')}</h2></div>
    <a class="link-u" href="${c.url('lab')}">${c.T('v3.lab.cta')}</a>
  </div>
  <div class="lab-scroll" tabindex="0" role="region" aria-labelledby="lab-title"><ul class="lab-grid">${c.site.lab.map(s => h`<li>${labCard(c, s)}</li>`)}</ul></div>
</section>`;
}

export function aboutFacts(c) {
  return h`<dl class="facts"><div><dt>${c.T('v3.about.k.base')}</dt><dd>${c.T('v3.about.v.base')}</dd></div><div><dt>${c.T('v3.about.k.focus')}</dt><dd>${c.T('v3.about.v.focus')}</dd></div></dl>`;
}

function about(c) {
  return h`<section class="about grid" id="about" aria-labelledby="about-title">
  <div class="about-id">
    ${eyebrow('06', c.T('v3.about.eyebrow'))}
    <h2 class="about-name" id="about-title">${c.T('v3.about.first')}<br><span class="it">${c.T('v3.about.last')}</span></h2>
    <p class="about-role">${c.T('v3.about.role')}</p>
  </div>
  <div class="about-text">
    <p class="about-st">${c.T('v3.about.statement')}</p>
    ${aboutFacts(c)}
    <a class="link-u" href="${c.url('about')}">${c.T('v3.about.cta')}</a>
  </div>
</section>`;
}

export function contact(c) {
  return h`<section class="contact-sec" id="contact" aria-labelledby="contact-title">
  <div class="contact">
    <img class="contact-wm" src="/assets/brand/emblem-official-720.webp" width="720" height="1080" alt="" aria-hidden="true" loading="lazy" decoding="async">
    <p class="eyebrow">${c.T('v3.contact.eyebrow')}</p>
    <h2 class="contact-h" id="contact-title">${c.T('v3.contact.h2')}</h2>
    <p class="contact-p">${c.T('v3.contact.text')}</p>
    <p class="contact-btns">
      <a class="btn btn--primary" href="mailto:${c.site.contact.email}" data-contact-flow>${c.T('v3.nav.cta')} <span aria-hidden="true">→</span></a>
      <a class="btn btn--secondary" href="${c.site.contact.whatsapp}" target="_blank" rel="noopener noreferrer" data-cf-wa>${c.T('v3.contact.whatsapp')}<span class="contact-wa-num">&nbsp;· ${c.T('v3.contact.phone')}</span>${ext(c.T)}</a>
    </p>
    <p class="contact-wa-line">${c.T('v3.contact.whatsapp')} ${c.T('v3.contact.phone')}</p>
    <p class="contact-mail">${c.T('v3.contact.email.lead')} <a href="mailto:${c.site.contact.email}" data-cf-mail>${c.site.contact.email}</a></p>
  </div>
</section>`;
}

export function homeBody(c) {
  return h`${hero(c)}
${strip(c)}
${work(c)}
${cico(c)}
${capabilities(c)}
${engineering(c)}
${lab(c)}
${about(c)}
${contact(c)}`;
}
