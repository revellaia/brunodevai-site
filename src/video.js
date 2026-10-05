/* BRUNO DEV.AI V3 · video.js — motor UNICO de reproducao de video (hero + cards do Lab).
   Recuperado do historico provado no Chrome (c9b6af8 / e3447a5 / 06a6f19): nunca uma unica tentativa de play().
   ensurePlaying reafirma muted/defaultMuted/autoplay/playsInline/controls (propriedade + atributo) e chama play();
   playPending + stop seguro evitam "play() request was interrupted by a call to pause()"; retry() tenta de novo a cada
   800 ms (ate 10x) enquanto o consumidor ainda quiser o video tocando. Video so fora do SAVE DATA (WC.mode.allowsVideo).
   Carregado com defer ANTES de home.js e hover-video.js. */
(function () {
  'use strict';
  var WC = window.WC = window.WC || {};
  if (WC.video) return;

  /* para e (por padrao) volta a 0; com play() em voo, so marca e para quando a promise resolver */
  var stop = function (v, reset) {
    if (!v) return;
    var r = reset !== false;
    if (v.__playPending) { v.__wantStop = true; v.__wantReset = r; return; }
    v.pause();
    if (r) { try { v.currentTime = 0; } catch (e) { /* sem metadata ainda */ } }
    v.autoplay = false; v.removeAttribute('autoplay');
  };

  /* garante reproducao muda; true = tocando ou pedido de play em curso */
  var ensurePlaying = function (v, loop) {
    if (!v || !v.getAttribute('src')) return false;
    if (!v.paused && v.currentTime > 0) return true;
    if (v.__playPending) return true;
    v.__wantStop = false;
    v.muted = true; v.defaultMuted = true; v.autoplay = true; v.playsInline = true; v.controls = false; v.loop = !!loop;
    v.setAttribute('muted', ''); v.setAttribute('autoplay', ''); v.setAttribute('playsinline', '');
    if (loop) v.setAttribute('loop', ''); else v.removeAttribute('loop');
    var p;
    try { v.__playPending = true; p = v.play(); } catch (e) { v.__playPending = false; return false; }
    if (!p || !p.then) { v.__playPending = false; return true; }
    var settle = function () { v.__playPending = false; if (v.__wantStop) stop(v, v.__wantReset); };
    p.then(settle, settle);
    return true;
  };

  /* retentativas limitadas enquanto wanted() for verdadeiro; devolve a funcao que cancela */
  var retry = function (v, wanted, max) {
    var n = 0, id = setInterval(function () {
      if (++n > (max || 10) || !wanted() || (!v.paused && v.currentTime > 0)) { clearInterval(id); return; }
      if (!document.hidden && !v.__playPending) ensurePlaying(v, v.loop);
    }, 800);
    return function () { clearInterval(id); };
  };

  WC.video = {
    allowed: function () { return WC.mode ? WC.mode.allowsVideo() : true; },
    ensurePlaying: ensurePlaying,
    stop: stop,
    retry: retry,
  };
})();
