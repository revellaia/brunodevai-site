/* BRUNO DEV.AI V3 · /lab (indice) e /lab/{slug} (estudo). Lab e secundario ao trabalho real.
   Indice: posters 4:5 (NATURAL_RATIO, MEDIA_FRAMING_MANIFEST lab.*). Estudo: 1 filme com controles, proporcao natural do
   perfil de entrega (G-004: 1 perfil por estudo, so na interacao; preload none = SAVE DATA nao requisita ate o Play). */
import { h } from '../lib/html.mjs';
import { eyebrow } from './common.mjs';
import { labCard } from './home.mjs';

const crumb = (c, items) => h`<nav class="crumb" aria-label="${c.T('a11y.breadcrumb')}"><ol><li><a href="${c.home}">Bruno Dev.AI</a></li>${items.map(([label, href]) => href ? h`<li><a href="${href}">${label}</a></li>` : h`<li aria-current="page">${label}</li>`)}</ol></nav>`;

export function labIndexBody(c) {
  return h`<header class="page-hero">
  ${crumb(c, [[c.T('v3.nav.lab')]])}
  ${eyebrow('', c.T('lab.label'))}
  <h1 class="h1">${c.T('v3.lab.h')}</h1>
  <p class="page-lede">${c.T('lab.lede')}</p>
</header>
<ul class="labx-grid">${c.site.lab.map(s => h`<li>${labCard(c, s)}</li>`)}</ul>`;
}

export function labDetailBody(c, i) {
  const L = c.site.lab, s = L[i];
  const prev = L[(i + L.length - 1) % L.length], next = L[(i + 1) % L.length];
  return h`<article class="study" aria-labelledby="study-title">
  ${crumb(c, [[c.T('v3.nav.lab'), c.url('lab')], [s.title]])}
  <header class="sec-title">
    ${eyebrow('', `${s.code} · ${c.T('v3.lab.card')}`)}
    <h1 class="h1" id="study-title">${s.title}</h1>
  </header>
  <figure class="study-film study-film--${s.ratio === '4/5' ? 'p' : 'l'}">
    <video controls playsinline preload="none" poster="${s.poster}" width="${s.pw}" height="${s.ph}" aria-label="${s.title} · ${c.T('v3.lab.card')}">
      <source src="${s.film}" type="video/mp4">
    </video>
  </figure>
  <nav class="study-nav" aria-label="${c.T('v3.nav.lab')}">
    <a href="${c.url('lab-' + prev.slug)}" rel="prev">← ${prev.code} · ${prev.title}</a>
    <a href="${c.url('lab-' + next.slug)}" rel="next">${next.code} · ${next.title} →</a>
  </nav>
</article>`;
}
