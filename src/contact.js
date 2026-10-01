/* WORLDCRAFT · contact.js — UM fluxo comercial, muitos CTAs.
   Links diretos de WhatsApp/e-mail passam a usar as MESMAS URLs do fluxo existente (assets/contact-flow.js);
   sem JS ficam os hrefs estaticos (wa.me e mailto). CTA magnetico <=6px so em FULL com ponteiro fino. */
(function () {
  'use strict';
  var flow = window.BrunoContactFlow, WC = window.WC;
  var lang = /^en/i.test(document.documentElement.lang) ? 'en' : 'pt';
  if (flow) {
    [].forEach.call(document.querySelectorAll('[data-cf-wa]'), function (a) { a.href = flow.whatsappUrl(lang, ''); });
    [].forEach.call(document.querySelectorAll('[data-cf-mail]'), function (a) { a.href = flow.mailtoUrl(lang, ''); });
  }
  var cta = document.querySelector('[data-magnetic]');
  if (!cta || !WC || !WC.mode || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var rect = null;
  function reset() { cta.style.transform = ''; }
  addEventListener('pointermove', function (e) {
    if (WC.mode.get() !== 'full') return reset();
    if (!rect) rect = cta.getBoundingClientRect();
    var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    var dx = e.clientX - cx, dy = e.clientY - cy;
    var near = Math.abs(dx) < rect.width / 2 + 80 && Math.abs(dy) < rect.height / 2 + 80;
    cta.style.transform = near ? 'translate(' + Math.max(-6, Math.min(6, dx * 0.08)).toFixed(1) + 'px,' + Math.max(-6, Math.min(6, dy * 0.08)).toFixed(1) + 'px)' : '';
  }, { passive: true });
  addEventListener('scroll', function () { rect = null; reset(); }, { passive: true });
  addEventListener('resize', function () { rect = null; }, { passive: true });
})();
