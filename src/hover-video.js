/* BRUNO DEV.AI V3 · hover-video.js — filme de apresentacao no hover/foco dos 6 cards do Lab (desktop).
   Contrato do Owner (P0 2026-10-05): TODOS os 6 estudos tem video. Ponteiro fino com hover real (hover: hover e
   pointer: fine); toca em FULL e em REDUCED (reduced motion nao vira poster); so o SAVE DATA explicito desliga. Em toque
   nada acontece. mouseenter/focusin -> o filme comeca do 0; mouseleave/focusout -> pausa, currentTime = 0, poster volta.
   Um filme por vez: entrar noutro card para e rebobina o anterior. O <video> so e criado e recebe src na PRIMEIRA
   intencao (nunca ha preload no carregamento). Motor compartilhado src/video.js (ensurePlaying + retentativas limitadas:
   a recusa silenciosa do primeiro play() no Chrome nao deixa o card parado no poster).
   Framing: filme retrato 4:5 (= proporcao do card) ocupa o card; filme PAISAGEM (data-hover-landscape) entra inteiro em
   object-fit CONTAIN sobre o proprio poster desfocado/escurecido (mesmo tratamento do frame do hero): sem corte, sem
   distorcao, card preenchido. */
(function () {
  'use strict';
  var WC = window.WC || {};
  var V = WC.video;
  if (!V) return;
  var fine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };
  var enabled = function () { return fine.matches && V.allowed(); };
  var current = null, cancelRetry = null;

  function stop(card) {
    if (!card) return;
    if (current === card) { if (cancelRetry) { cancelRetry(); cancelRetry = null; } current = null; }
    var v = card.querySelector('video.hv-video');
    if (v) V.stop(v, true);
    card.classList.remove('is-playing');
  }

  function start(card) {
    if (!enabled()) return;
    if (current && current !== card) stop(current);
    var wrap = card.querySelector('.adm');
    if (!wrap) return;
    var v = wrap.querySelector('video.hv-video');
    if (!v) {
      v = document.createElement('video');
      v.className = 'adm-m hv-video';
      v.muted = true; v.defaultMuted = true; v.playsInline = true; v.preload = 'none';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.setAttribute('tabindex', '-1');
      v.addEventListener('playing', function () { if (current === card) card.classList.add('is-playing'); else V.stop(v, true); });
      v.addEventListener('ended', function () { stop(card); });
      wrap.appendChild(v);
    }
    if (!v.getAttribute('src')) v.src = card.getAttribute('data-hover-video'); /* download so na intencao */
    try { v.currentTime = 0; } catch (e) { /* sem metadata ainda */ }
    current = card;
    V.ensurePlaying(v, false);
    if (cancelRetry) cancelRetry();
    cancelRetry = V.retry(v, function () { return current === card && enabled() && !document.hidden && !v.ended; });
  }

  var cards = [].slice.call(document.querySelectorAll('[data-hover-video]'));
  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () { start(card); });
    card.addEventListener('mouseleave', function () { stop(card); });
    card.addEventListener('focusin', function () { start(card); });
    card.addEventListener('focusout', function () { stop(card); });
  });
  /* mudou para SAVE, ou o dispositivo deixou de ter hover fino: para tudo */
  var guard = function () { if (!enabled() && current) stop(current); };
  window.addEventListener('wc:mode', guard);
  if (fine.addEventListener) fine.addEventListener('change', guard); else if (fine.addListener) fine.addListener(guard);
  document.addEventListener('visibilitychange', function () { if (document.hidden && current) stop(current); });
})();
