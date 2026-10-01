/* WORLDCRAFT · hero.js — midia do hero (12_ENGINEERING/MEDIA_BUDGET.md, 06_MOTION).
   Poster = LCP (HTML). O video so e requisitado depois do load, fora do SAVE DATA, em UM perfil por
   dispositivo; toca muted/loop; pausa fora da tela e quando a camada SYSTEM cobre o hero. */
(function () {
  'use strict';
  var WC = window.WC;
  var video = document.querySelector('[data-hero-video]');
  var hero = document.getElementById('hero');
  if (!video || !hero || !WC || !WC.mode) return;

  var visible = true, started = false;
  function wanted() { return visible && WC.mode.allowsVideo() && (!WC.layer || WC.layer.get() !== 'system'); }

  function start() {
    if (started || !WC.mode.allowsVideo()) return;
    started = true;
    var mobile = window.matchMedia(video.getAttribute('data-mobile-query')).matches;
    video.src = video.getAttribute(mobile ? 'data-src-mobile' : 'data-src-desktop');
    video.addEventListener('playing', function () { video.classList.add('is-playing'); }, { once: true });
    update();
  }

  function update() {
    if (!started) return;
    if (wanted()) { var p = video.play(); if (p && p.catch) p.catch(function () { /* autoplay bloqueado: o poster fica */ }); }
    else video.pause();
  }

  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; update(); }, { threshold: 0 }).observe(hero);
  }
  addEventListener('wc:mode', function () { if (!WC.mode.allowsVideo()) video.pause(); else { start(); update(); } });
  if (WC.layer) WC.layer.subscribe(function (d) {
    /* Pausa so depois que o wipe cobre o hero inteiro; volta a tocar ao sair. */
    if (d.layer === 'system') setTimeout(update, 520); else update();
  });
})();
