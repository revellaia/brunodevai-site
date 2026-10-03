/* BRUNO DEV.AI V3 · mode.js (base tecnica V2 preservada)
   Detecta o modo de motion e espelha em <html data-motion="full|reduced|save"> (06_MOTION).
   SAVE  = navigator.connection.saveData, effectiveType slow-2g/2g ou prefers-reduced-data: reduce.
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
    var slow = conn && /^(slow-)?2g$/.test(conn.effectiveType || '');
    if ((conn && conn.saveData === true) || slow || reducedData.matches) return 'save';
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
  WC.mode = {
    get: function () { return current; },
    /* Videos so podem ser requisitados fora do SAVE (AC-09). */
    allowsVideo: function () { return current !== 'save'; },
  };
})();
