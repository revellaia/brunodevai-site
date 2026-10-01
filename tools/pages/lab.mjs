/* WORLDCRAFT · /lab (indice) e /lab/{slug} (detalhe). 10_LAB/LAB_CONCEPT.md.
   Detalhe: titulo, categoria, 1 filme com controles (preload none: SAVE DATA nao requisita ate o Play),
   anterior/proximo. Notas de processo nao existem no conteudo aprovado: omitidas (nao inventadas). */
import { h } from '../lib/html.mjs';
import { labCards } from './home.mjs';

export function labIndexBody(c) {
  return h`<section class="lab lab--page" aria-labelledby="lab-title">
  <div class="wc-grid-overlay" aria-hidden="true"></div>
  <div class="lab-in wc-container">
    <div class="lab-head">
      <h1 class="lab-title" id="lab-title">${c.T('lab.title')}</h1>
      <div class="lab-intro"><p class="wc-label">${c.T('lab.label')}</p><p class="lab-lede">${c.T('lab.lede')}</p></div>
    </div>
    ${labCards(c)}
    <div class="lab-foot"><p>${c.T('lab.count')}</p></div>
  </div>
  <p class="wc-annot wc-annot--signal lab-annot-2" aria-hidden="true">● G-004: 1 delivery profile per study · film requested on hover/focus only · max 1 playing · masters off-deploy</p>
</section>`;
}

export function labDetailBody(c, i) {
  const L = c.site.lab, s = L[i];
  const prev = L[(i + L.length - 1) % L.length], next = L[(i + 1) % L.length];
  return h`<article class="study" aria-labelledby="study-title">
  <div class="wc-grid-overlay" aria-hidden="true"></div>
  <div class="study-in wc-container">
    <p class="study-back wc-label"><a href="${c.href('/lab/')}">← ${c.T('lab.title')}</a></p>
    <header class="study-head">
      <p class="wc-label">${s.code} · ${c.T('lab.card.type')}</p>
      <h1 class="study-title" id="study-title">${s.title}</h1>
    </header>
    <figure class="study-film study-film--${s.ratio === '4/5' ? 'p' : 'l'}">
      <video controls playsinline preload="none" poster="${s.poster}" width="${s.pw}" height="${s.ph}" aria-label="${s.title} · ${c.T('lab.card.type')}">
        <source src="${s.film}" type="video/mp4">
      </video>
    </figure>
    <nav class="study-nav wc-t-mono" aria-label="${c.T('lab.title')}">
      <a href="${c.href(`/lab/${prev.slug}/`)}" rel="prev">← ${prev.code} · ${prev.title}</a>
      <a href="${c.href(`/lab/${next.slug}/`)}" rel="next">${next.code} · ${next.title} →</a>
    </nav>
  </div>
  <p class="wc-annot study-annot" aria-hidden="true">LabDetail · 1 film · controls · preload none · poster first · no autoplay</p>
</article>`;
}
