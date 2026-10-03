/* BRUNO DEV.AI V3 · /work/ (indice), /sobre/ + /en/about/ (About B text-first) e /privacy.html (texto juridico verbatim).
   About: sem retrato (OD-06: B text-first ate existir foto real; nunca retrato gerado). Conteudo factual da V2 preservado.
   Privacy: fragmento data/legal/privacy.pt.html portado verbatim; so PT (sem par EN = sem hreflang). */
import fs from 'node:fs';
import path from 'node:path';
import { h, raw } from '../lib/html.mjs';
import { root } from '../lib/deploy-tree.mjs';
import { ext, live, adm, eyebrow } from './common.mjs';
import { aboutFacts } from './home.mjs';

const crumb = (c, label) => h`<nav class="crumb" aria-label="${c.T('a11y.breadcrumb')}"><ol><li><a href="${c.home}">Bruno Dev.AI</a></li><li aria-current="page">${label}</li></ol></nav>`;

export function workBody(c) {
  const rows = c.site.projects.map(p => {
    const name = p.id === 'vakon' ? c.T('project.vakon.name') : c.T(`v3.slide.${p.id}.name`);
    const type = p.id === 'vakon' ? c.T('v3.slide.vakon.type') : c.T(`v3.type.${p.id}`);
    const id = p.id === 'vakon' ? 'work.vakon.feature' : `shot.${p.id}`;
    const media = p.id === 'vakon'
      ? adm(c, { id: 'hero.frame.vakon', src: p.img['960'], srcset: `${p.img['640']} 760w, ${p.img['960']} 1200w`, sizes: '(min-width: 768px) 50vw, 100vw', w: p.img.w, h: p.img.h, alt: c.T('v3.slide.vakon.alt'), reveal: true })
      : adm(c, { id, src: p.img['960'], srcset: `${p.img['640']} 640w, ${p.img['960']} 960w`, sizes: '(min-width: 768px) 50vw, 100vw', w: p.img.w, h: p.img.h, alt: c.T(`v3.slide.${p.id}.alt`), reveal: true });
    const primary = p.case
      ? h`<a href="${c.url(p.case)}">${name}</a>`
      : h`<a href="${p.url}" target="_blank" rel="noopener noreferrer">${name}${ext(c.T)}</a>`;
    return h`<li class="wrow">
      <div class="wrow-media">${p.case ? h`<a href="${c.url(p.case)}" tabindex="-1" aria-hidden="true">${media}</a>` : media}</div>
      <div class="wrow-info">
        <p class="wrow-n mono" aria-hidden="true">${p.n}</p>
        <h2 class="wrow-name">${primary}</h2>
        <p class="wrow-type">${type}</p>
        <p class="wrow-meta">${p.year ? h`<span>${p.year}</span>` : ''}${live(c)}</p>
        <p class="wrow-ctas">${p.case ? h`<a class="link-u" href="${c.url(p.case)}">${c.T(p.id === 'cico' ? 'v3.cico.cta.case' : 'v3.work.cta')}</a>` : ''}<a class="link-plain" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.T('v3.work.live')}${ext(c.T)}</a></p>
      </div>
    </li>`;
  });
  return h`<header class="page-hero">
  ${crumb(c, c.T('v3.nav.work'))}
  ${eyebrow('', c.T('v3.work.eyebrow'))}
  <h1 class="h1">${c.T('v3.work.h2')}</h1>
  <p class="page-lede">${c.T('meta.work.desc')}</p>
</header>
<ol class="wlist">${rows}</ol>`;
}

export function aboutBody(c) {
  const steps = [1, 2, 3, 4, 5, 6, 7];
  const sec = (n, label, inner) => h`<section class="ax-sec grid" aria-labelledby="ax-${n}"><h2 class="ax-k eyebrow" id="ax-${n}"><span class="eyebrow-n">0${n}</span><span class="eyebrow-rule" aria-hidden="true"></span>${label}</h2><div class="ax-body">${inner}</div></section>`;
  return h`<article aria-labelledby="ax-title">
  <header class="ax-hero">
    ${crumb(c, c.T('v3.nav.about'))}
    ${eyebrow('', c.T('v3.about.eyebrow'))}
    <h1 class="about-name" id="ax-title">${c.T('v3.about.first')}<br><span class="it">${c.T('v3.about.last')}</span></h1>
    <p class="about-role">${c.T('v3.about.role')}</p>
    <p class="about-st">${c.T('v3.about.statement')}</p>
    ${aboutFacts(c)}
  </header>
  ${sec(1, c.T('about.label'), h`<p class="ax-lede">${c.T('about.page.lede')}</p><p class="ax-text">${c.T('about.page.complement')}</p>`)}
  ${sec(2, c.T('about.competences'), h`<ul class="ax-caps">${c.T('about.capabilities').split(' · ').map(x => h`<li>${x}</li>`)}</ul>`)}
  ${sec(3, c.T('about.view'), h`<p class="ax-lede">${c.T('about.view.headline')}</p><p class="ax-text">${c.T('about.view.text')}</p>`)}
  ${sec(4, c.T('about.method'), h`<p class="ax-lede">${c.T('about.method.title')}</p><ol class="ax-steps">${steps.map(i => h`<li><span class="ax-sn mono">${String(i).padStart(2, '0')}</span><span class="ax-st">${c.T(`about.method.${i}`)}</span><span class="ax-sd">${c.T(`about.method.${i}.desc`)}</span></li>`)}</ol>`)}
  <section class="ax-cta" aria-labelledby="ax-5">
    <h2 class="sr-only" id="ax-5">${c.T('v3.nav.contact')}</h2>
    <a class="btn btn--primary" href="mailto:${c.site.contact.email}" data-contact-flow>${c.T('v3.nav.cta')} <span aria-hidden="true">→</span></a>
    <a class="link-u" href="${c.url('work')}">${c.T('v3.work.all')}</a>
  </section>
</article>`;
}

export function privacyBody(c) {
  const frag = fs.readFileSync(path.join(root, 'data/legal/privacy.pt.html'), 'utf8').replace(/^<!--[\s\S]*?-->\n/, '');
  return h`<article class="legal" aria-labelledby="legal-title">
  <div class="legal-in">
    ${crumb(c, c.T('v3.footer.privacy'))}
    ${raw(frag.replace('<h1>', '<h1 id="legal-title">'))}
  </div>
</article>`;
}
