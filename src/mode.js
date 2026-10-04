/* BRUNO DEV.AI V3 · mode.js (base tecnica V2 preservada)
   Detecta o modo de motion e espelha em <html data-motion="full|reduced|save"> (06_MOTION).
   SAVE  = SO preferencia EXPLICITA de economia: navigator.connection.saveData === true ou prefers-reduced-data: reduce.
           effectiveType (2g/slow-2g) NAO entra no gate (hotfix 2026-10-04): e uma estimativa de rede que o Chrome
           muda sozinho e desligava carrossel e video do hero sem o usuario pedir. Fica so como sinal (WC.mode.network()).
   REDUCED = prefers-reduced-motion: reduce.  FULL = nenhum dos anteriores.
   Carregar SINCRONO no <head> (antes do CSS pintar), sem defer. Evento 'wc:mode' a cada mudanca. */
(function () {
  'use strict';
  var root = document.documentElement;
  var WC = window.WC = window.WC || {};
  if (WC.mode) return;
  root.setAttribute('data-js', ''); /* progressive enhancement: sem JS a pagina e completa e estatica */

  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var reducedMotion = mq('(prefers-reduced-motion: reduce)');
  var reducedData = mq('(prefers-reduced-data: reduce)');

  function detect() {
    if ((conn && conn.saveData === true) || reducedData.matches) return 'save';
    if (reducedMotion.matches) return 'reduced';
    return 'full';
  }

  var current = null;
  function apply() {
    var next = detect();
    if (next === current) return;
    current = next;
    root.setAttribute('data-motion', next);
    try { window.dispatchEvent(new CustomEvent('wc:mode', { detail: { mode: next } })); } catch (e) { /* IE-class engines */ }
  }

  function listen(m) {
    if (m.addEventListener) m.addEventListener('change', apply);
    else if (m.addListener) m.addListener(apply);
  }
  listen(reducedMotion);
  listen(reducedData);
  if (conn && conn.addEventListener) conn.addEventListener('change', apply);

  apply();

  /* Poster decorativo do hero (meta bd-backdrop, so na home): pre-carregado cedo fora do SAVE DATA para nao virar
     um LCP tardio (o <img> e lazy); no SAVE nao ha backdrop e nada e baixado. */
  var bd = document.querySelector('meta[name="bd-backdrop"]');
  if (bd && current !== 'save') {
    var l = document.createElement('link');
    l.rel = 'preload'; l.as = 'image'; l.type = 'image/avif';
    l.href = bd.getAttribute(window.matchMedia && window.matchMedia('(max-width: 767px)').matches ? 'data-mobile' : 'data-desktop');
    document.head.appendChild(l);
  }

  WC.mode = {
    get: function () { return current; },
    /* Videos so podem ser requisitados fora do SAVE (AC-09). */
    allowsVideo: function () { return current !== 'save'; },
    /* sinal de rede (otimizacao), nunca gate de modo */
    network: function () { return conn ? { effectiveType: conn.effectiveType || null, saveData: conn.saveData === true } : null; },
  };
})();
