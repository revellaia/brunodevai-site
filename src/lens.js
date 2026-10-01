/* WORLDCRAFT · lens.js — lente de assinatura do hero (EXPERIENCE_SYSTEM_MECHANIC §7).
   So: (hover:hover) and (pointer:fine), modo FULL, camada experience, sem forced-colors.
   Aparece apos o ponteiro repousar >400ms; some em movimento rapido (>1.2px/ms), saida, scroll ou hero <50% visivel.
   Orcamento: 1 escrita de estilo por frame (custom properties), 0 leituras de layout por frame (rect em cache). */
(function () {
  'use strict';
  var WC = window.WC;
  var hero = document.getElementById('hero');
  var sys = hero && hero.querySelector('.hero-sys');
  if (!sys || !WC || !WC.mode || !WC.layer) return;
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var forced = matchMedia('(forced-colors: active)');

  var rect = null, rest = 0, last = null, frame = 0, x = 0, y = 0, shown = false, half = true;
  function enabled() { return fine.matches && !forced.matches && half && WC.mode.get() === 'full' && WC.layer.get() === 'experience'; }
  function measure() { rect = hero.getBoundingClientRect(); }
  function write() {
    frame = 0;
    sys.style.setProperty('--lx', x + 'px');
    sys.style.setProperty('--ly', y + 'px');
  }
  function show(on) {
    if (shown === on) return;
    shown = on;
    sys.style.setProperty('--lr', on ? '170px' : '0px');
  }
  function hide() { clearTimeout(rest); show(false); }

  hero.addEventListener('pointerenter', measure, { passive: true });
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || !enabled()) { hide(); return; }
    if (!rect) measure();
    var now = e.timeStamp;
    if (last) {
      var v = Math.hypot(e.clientX - last.x, e.clientY - last.y) / Math.max(1, now - last.t);
      if (v > 1.2) hide();
    }
    last = { x: e.clientX, y: e.clientY, t: now };
    x = e.clientX - rect.left; y = e.clientY - rect.top;
    if (!frame) frame = requestAnimationFrame(write);
    clearTimeout(rest);
    if (!shown) rest = setTimeout(function () { if (enabled()) show(true); }, 400);
  }, { passive: true });
  hero.addEventListener('pointerleave', function () { last = null; hide(); }, { passive: true });
  addEventListener('scroll', function () { rect = null; hide(); }, { passive: true });
  addEventListener('resize', function () { rect = null; }, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { half = en[0].intersectionRatio >= 0.5; if (!half) hide(); }, { threshold: [0.5] }).observe(hero);
  }
  WC.layer.subscribe(function () { hide(); });
  addEventListener('wc:mode', hide);
})();
