/* WORLDCRAFT · lab.js — um unico player global para os cards do Lab (G-004, lab.card.activate).
   FULL apenas: hover/focus com intencao >=150ms -> requisita UM perfil, muted/loop; ao sair pausa e descarrega.
   Maximo 1 filme tocando na pagina. REDUCED e SAVE DATA: nenhum filme no indice (so no detalhe, por clique). */
(function () {
  'use strict';
  var WC = window.WC;
  var cards = [].slice.call(document.querySelectorAll('[data-film]'));
  if (!cards.length || !WC || !WC.mode) return;
  var player = document.createElement('video');
  player.muted = true; player.loop = true; player.playsInline = true;
  player.setAttribute('muted', ''); player.setAttribute('playsinline', ''); player.setAttribute('aria-hidden', 'true');
  player.setAttribute('preload', 'none'); player.tabIndex = -1;
  var current = null, timer = 0;

  function stop() {
    clearTimeout(timer);
    if (!current) return;
    player.pause(); player.removeAttribute('src'); player.load();
    if (player.parentNode) player.parentNode.removeChild(player);
    current.parentNode.classList.remove('is-playing');
    current = null;
  }
  function start(a) {
    if (WC.mode.get() !== 'full' || !WC.mode.allowsVideo()) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (current === a) return;
      stop();
      current = a;
      a.querySelector('.lab-media').appendChild(player);
      player.src = a.getAttribute('data-film');
      var p = player.play(); if (p && p.catch) p.catch(stop);
      a.parentNode.classList.add('is-playing');
    }, 150);
  }
  var hover = matchMedia('(hover: hover)');
  cards.forEach(function (a) {
    a.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && hover.matches) start(a); });
    a.addEventListener('pointerleave', function () { if (current === a || timer) stop(); });
    a.addEventListener('focus', function () { start(a); });
    a.addEventListener('blur', function () { if (current === a || timer) stop(); });
  });
  addEventListener('wc:mode', stop);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
})();
