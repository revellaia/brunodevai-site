/* WORLDCRAFT · reveal.js — reveals de uma vez so (flagship.reveal, media.reveal, manifesto.lines, proof rows).
   O estado inicial oculto so existe depois que este script liga data-reveal-on (sem JS = conteudo estatico).
   SAVE DATA: nada e ocultado. Cada observer desconecta o elemento assim que ele entra. */
(function () {
  'use strict';
  var WC = window.WC, root = document.documentElement;
  var els = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (!els.length || !('IntersectionObserver' in window) || (WC && WC.mode && WC.mode.get() === 'save')) return;
  /* So oculta o que ainda esta abaixo da dobra: nada visivel some depois de pintado. */
  var below = els.filter(function (el) { return el.getBoundingClientRect().top > innerHeight; });
  els.forEach(function (el) { if (below.indexOf(el) < 0) el.classList.add('is-in'); });
  root.setAttribute('data-reveal-on', '');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.2 });
  below.forEach(function (el) { io.observe(el); });
})();
