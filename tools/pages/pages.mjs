/* WORLDCRAFT · /work/ (indice), /sobre/ + /en/about/ (About text-first) e /privacy.html (texto juridico verbatim).
   About: sem retrato (G-005/TBC-016: nenhuma foto de origem confirmada) — composicao tipografica.
   Privacy: fragmento data/legal/privacy.pt.html portado verbatim da v1; so PT (sem par EN = sem hreflang). */
import fs from 'node:fs';
import path from 'node:path';
import { h, raw } from '../lib/html.mjs';
import { root } from '../lib/deploy-tree.mjs';
import { ext } from './common.mjs';
import { live, grid } from './home.mjs';

export function workBody(c) {
  const P = c.site.projects;
  const rows = P.map(p => {
    const name = c.T(`project.${p.id}.name`);
    const primary = p.case
      ? h`<a class="workx-name" href="${c.url(p.case)}">${name}</a>`
      : h`<a class="workx-name" href="${p.url}" target="_blank" rel="noopener noreferrer">${name}${ext(c.T)}</a>`;
    return h`<li class="workx-item">
      <img class="workx-thumb" src="${p.img['640']}" width="640" height="${Math.round(640 * p.img.h / p.img.w)}" alt="" loading="lazy" decoding="async">
      <p class="workx-n wc-t-mono" aria-hidden="true">${p.n}</p>
      <h2 class="workx-h">${primary}</h2>
      <dl class="workx-meta">
        <div><dt>${c.T('ui.meta.type')}</dt><dd>${c.T(`project.${p.id}.type`)}</dd></div>
        ${p.year ? h`<div><dt>${c.T('ui.meta.year')}</dt><dd>${p.year}</dd></div>` : ''}
        <div><dt>${c.T('ui.meta.status')}</dt><dd>${live(c)}</dd></div>
      </dl>
      <p class="workx-ctas">${p.case ? h`<a class="wc-cta-u" href="${c.url(p.case)}">${c.T(p.id === 'cico' ? 'cico.cta.system' : 'work.cta.case')} →</a>` : ''}<a class="workx-live" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.T('work.cta.live')} ↗${ext(c.T)}</a></p>
    </li>`;
  });
  return h`<section class="workx" aria-labelledby="workx-title">
  ${grid()}
  <div class="workx-in wc-container">
    <header class="workx-head">
      <p class="wc-label">${c.T('work.label')}</p>
      <h1 class="workx-title" id="workx-title">${c.T('nav.work')}</h1>
      <p class="workx-lede">${c.T('meta.work.desc')}</p>
    </header>
    <ol class="workx-list">${rows}</ol>
  </div>
  <p class="wc-annot workx-annot" aria-hidden="true">WorkIndex · ${P.length} × row · 2 internal cases · ${P.length - 2} external · thumbs 640w webp lazy</p>
</section>`;
}

export function aboutBody(c) {
  const steps = [1, 2, 3, 4, 5, 6, 7];
  return h`<article class="aboutx" aria-labelledby="aboutx-title">
  ${grid()}
  <header class="aboutx-hero wc-container">
    <p class="wc-label">${c.T('nav.about')}</p>
    <h1 class="aboutx-title" id="aboutx-title"><span class="wc-mask"><span>${c.T('hero.name.line1')}</span></span> <span class="wc-mask"><span class="wc-italic">${c.T('hero.name.line2')}</span></span></h1>
    <p class="aboutx-id wc-t-mono">${c.T('hero.role')}<br>${c.T('about.page.base')}</p>
  </header>
  <section class="aboutx-sec" aria-labelledby="ax-1">
    <div class="wc-container aboutx-grid">
      <h2 class="wc-label aboutx-k" id="ax-1"><span>01</span> ${c.T('about.label')}</h2>
      <div class="aboutx-body">
        <p class="aboutx-lede">${c.T('about.page.lede')}</p>
        <p class="aboutx-text">${c.T('about.page.complement')}</p>
      </div>
    </div>
  </section>
  <section class="aboutx-sec" aria-labelledby="ax-2">
    <div class="wc-container aboutx-grid">
      <h2 class="wc-label aboutx-k" id="ax-2"><span>02</span> ${c.T('about.competences')}</h2>
      <ul class="aboutx-caps">${c.T('about.capabilities').split(' · ').map(x => h`<li>${x}</li>`)}</ul>
    </div>
  </section>
  <section class="aboutx-sec" aria-labelledby="ax-3">
    <div class="wc-container aboutx-grid">
      <h2 class="wc-label aboutx-k" id="ax-3"><span>03</span> ${c.T('about.view')}</h2>
      <div class="aboutx-body">
        <p class="aboutx-quote">${c.T('about.view.headline')}</p>
        <p class="aboutx-text">${c.T('about.view.text')}</p>
      </div>
    </div>
  </section>
  <section class="aboutx-sec" aria-labelledby="ax-4">
    <div class="wc-container aboutx-grid">
      <h2 class="wc-label aboutx-k" id="ax-4"><span>04</span> ${c.T('about.method')}</h2>
      <div class="aboutx-body">
        <p class="aboutx-mt">${c.T('about.method.title')}</p>
        <ol class="aboutx-steps">${steps.map(i => h`<li><span class="aboutx-sn wc-t-mono">${String(i).padStart(2, '0')}</span><span class="aboutx-st">${c.T(`about.method.${i}`)}</span><span class="aboutx-sd">${c.T(`about.method.${i}.desc`)}</span></li>`)}</ol>
      </div>
    </div>
  </section>
  <section class="aboutx-cta" aria-labelledby="ax-5">
    <div class="wc-container">
      <h2 class="wc-sr-only" id="ax-5">${c.T('nav.contact')}</h2>
      <p class="aboutx-actions"><a class="wc-btn wc-btn--primary" href="mailto:${c.site.contact.email}" data-contact-flow>${c.T('contact.cta')}</a><a class="wc-cta-u" href="${c.url('work')}">${c.T('work.all')} →</a></p>
    </div>
  </section>
  <p class="wc-annot aboutx-annot" aria-hidden="true">About · text-first · no portrait until source is confirmed (G-005) · copy = published v1 text</p>
</article>`;
}

export function privacyBody(c) {
  const frag = fs.readFileSync(path.join(root, 'data/legal/privacy.pt.html'), 'utf8').replace(/^<!--[\s\S]*?-->\n/, '');
  return h`<article class="legal" aria-labelledby="legal-title">
  <div class="legal-in wc-container">
    <p class="legal-back wc-label"><a href="${c.url('home')}">← ${c.T('privacy.back')}</a></p>
    ${raw(frag.replace('<h1>', '<h1 id="legal-title">'))}
  </div>
</article>`;
}
