/* BRUNO DEV.AI V3 · hover-video.js — filme de apresentacao no hover/foco dos cards do Lab (desktop).
   So em ponteiro fino com hover real (hover: hover e pointer: fine) e modo FULL: em toque, REDUCED ou SAVE DATA nada
   acontece e nenhum video e baixado. O <video> so e criado e recebe src na PRIMEIRA intencao (mouseenter/focusin):
   nunca ha preload no carregamento. Um filme por vez: entrar noutro card para e rebobina o anterior. Ao sair: pausa,
   currentTime = 0 e o poster volta. muted + playsinline, sem controles, preload="none", sem loop (o filme da pagina do
   estudo tambem nao repete). O <video> recebe a classe .adm-m: herda o framing do poster (src/media.css, NATURAL_RATIO
   4:5 = mesmo enquadramento do poster, que e o proprio frame do filme). */
(function () {
  'use strict';
  var WC = window.WC || {};
  var mode = function () { return WC.mode ? WC.mode.get() : 'full'; };
  var fine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };
  var enabled = function () { return fine.matches && mode() === 'full'; };
  var current = null;

  function stop(card) {
    var v = card && card.querySelector('video.adm-m');
    if (!v) return;
    v.pause();
    try { v.currentTime = 0; } catch (e) { /* metadata ainda nao carregada */ }
    card.classList.remove('is-playing');
    if (current === card) current = null;
  }

  function start(card) {
    if (!enabled()) return;
    if (current && current !== card) stop(current);
    var wrap = card.querySelector('.adm');
    if (!wrap) return;
    var v = wrap.querySelector('video.adm-m');
    if (!v) {
      v = document.createElement('video');
      v.className = 'adm-m hv-video';
      v.muted = true; v.defaultMuted = true; v.playsInline = true; v.preload = 'none';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.setAttribute('tabindex', '-1');
      v.addEventListener('playing', function () { if (current === card) card.classList.add('is-playing'); });
      v.addEventListener('ended', function () { stop(card); });
      wrap.appendChild(v);
    }
    if (!v.getAttribute('src')) v.src = card.getAttribute('data-hover-video'); /* download so na intencao */
    current = card;
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay bloqueado: fica o poster */ });
  }

  var cards = [].slice.call(document.querySelectorAll('[data-hover-video]'));
  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () { start(card); });
    card.addEventListener('mouseleave', function () { stop(card); });
    card.addEventListener('focusin', function () { start(card); });
    card.addEventListener('focusout', function () { stop(card); });
  });
  /* mudou para REDUCED/SAVE, ou o dispositivo deixou de ter hover fino: para tudo */
  var guard = function () { if (!enabled() && current) stop(current); };
  window.addEventListener('wc:mode', guard);
  if (fine.addEventListener) fine.addEventListener('change', guard); else if (fine.addListener) fine.addListener(guard);
  document.addEventListener('visibilitychange', function () { if (document.hidden && current) stop(current); });
})();
