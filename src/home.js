/* BRUNO DEV.AI V3 · home.js — HeroProjectFrame (carrossel acessivel), video do backdrop e abas Interface/Sistema.
   Uma arquitetura de motion (CSS transitions + IntersectionObserver), por modo (src/mode.js):
   FULL    = rotacao 4.8 s (pausa em hover, foco, botao, aba oculta), crossfade 1.1 s, video do backdrop apos o load.
   REDUCED = sem auto-rotacao; troca manual com fade 200 ms; backdrop so poster.
   SAVE    = slide 1 estatico; slides 2-5 nunca baixados; sem backdrop (nem poster) e sem video.
   Leitores de tela: a legenda so vira aria-live quando o usuario troca o slide (nunca na rotacao automatica). */
(function () {
  'use strict';
  var WC = window.WC || {};
  var mode = function () { return WC.mode ? WC.mode.get() : 'full'; };
  var INTERVAL = 4800, PRELOAD_AHEAD = 1000;

  /* ---------- backdrop: video so em FULL, depois do load (poster decorativo e o fallback) ---------- */
  var video = document.querySelector('[data-hero-video]');
  function startVideo() {
    if (!video || mode() !== 'full' || video.getAttribute('src')) return;
    var mobile = window.matchMedia('(max-width: 767px)').matches;
    video.src = video.getAttribute(mobile ? 'data-src-mobile' : 'data-src-desktop');
    video.addEventListener('playing', function () { video.classList.add('is-playing'); }, { once: true });
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay bloqueado: fica o poster */ });
  }
  if (video) {
    if (document.readyState === 'complete') setTimeout(startVideo, 200);
    else window.addEventListener('load', function () { setTimeout(startVideo, 200); });
    document.addEventListener('visibilitychange', function () {
      if (!video.getAttribute('src')) return;
      if (document.hidden) video.pause(); else if (mode() === 'full') { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }

  /* ---------- HeroProjectFrame ---------- */
  var hpf = document.querySelector('[data-hpf]');
  if (hpf) {
    var slides = [].slice.call(hpf.querySelectorAll('.hpf-slide'));
    var bars = [].slice.call(hpf.querySelectorAll('[data-go]'));
    var barsWrap = hpf.querySelector('[data-hpf-bars]');
    var pauseBtn = hpf.querySelector('[data-hpf-pause]');
    var icon = hpf.querySelector('[data-hpf-icon]');
    var live = hpf.querySelector('[data-hpf-live]');
    var nameEl = hpf.querySelector('[data-hpf-name]'), typeEl = hpf.querySelector('[data-hpf-type]'), numEl = hpf.querySelector('[data-hpf-n]');
    var i = 0, paused = false, hover = false, focusIn = false, timer = null, ahead = null;

    var load = function (n) {
      var img = slides[n] && slides[n].querySelector('img[data-src]');
      if (!img) return;
      if (img.getAttribute('data-srcset')) { img.setAttribute('srcset', img.getAttribute('data-srcset')); img.removeAttribute('data-srcset'); }
      img.setAttribute('src', img.getAttribute('data-src'));
      img.removeAttribute('data-src');
    };

    var show = function (n, byUser) {
      n = (n + slides.length) % slides.length;
      if (n === i) return;
      load(n);
      if (byUser) live.setAttribute('aria-live', 'polite'); else live.removeAttribute('aria-live');
      slides.forEach(function (s, k) {
        var on = k === n;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      });
      bars.forEach(function (b, k) { if (k === n) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      nameEl.textContent = slides[n].getAttribute('data-name');
      typeEl.textContent = slides[n].getAttribute('data-type');
      numEl.textContent = (n < 9 ? '0' : '') + (n + 1);
      i = n;
      schedule();
    };

    var canRotate = function () { return mode() === 'full' && !paused && !hover && !focusIn && !document.hidden; };
    var schedule = function () {
      clearTimeout(timer); clearTimeout(ahead);
      if (mode() !== 'full' || paused) return;
      /* carrega o proximo ~1 s antes da troca: nunca os 5 no first paint */
      ahead = setTimeout(function () { load((i + 1) % slides.length); }, INTERVAL - PRELOAD_AHEAD);
      timer = setTimeout(function tick() {
        if (canRotate()) show(i + 1, false);
        else timer = setTimeout(tick, 600);
      }, INTERVAL);
    };

    var setPaused = function (p) {
      paused = p;
      pauseBtn.setAttribute('aria-label', pauseBtn.getAttribute(p ? 'data-label-play' : 'data-label-pause'));
      icon.textContent = p ? '▶' : 'II';
      schedule();
    };

    var applyMode = function () {
      var m = mode();
      pauseBtn.hidden = m !== 'full';
      barsWrap.hidden = m === 'save';
      if (m === 'save' && i !== 0) show(0, false);
      schedule();
    };

    bars.forEach(function (b) { b.addEventListener('click', function () { show(+b.getAttribute('data-go'), true); }); });
    pauseBtn.addEventListener('click', function () { setPaused(!paused); });
    hpf.addEventListener('mouseenter', function () { hover = true; });
    hpf.addEventListener('mouseleave', function () { hover = false; });
    hpf.addEventListener('focusin', function () { focusIn = true; });
    hpf.addEventListener('focusout', function (e) { if (!hpf.contains(e.relatedTarget)) focusIn = false; });
    window.addEventListener('wc:mode', applyMode);
    applyMode();
  }

  /* ---------- Abas Interface / Sistema (WAI-ARIA tabs, ativacao automatica) ---------- */
  var tablist = document.querySelector('[data-tabs]');
  if (tablist) {
    var tabs = [].slice.call(tablist.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var select = function (k, focus) {
      tabs.forEach(function (t, j) {
        var on = j === k;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
        if (on && mode() === 'full') { panels[j].classList.remove('is-entering'); void panels[j].offsetWidth; panels[j].classList.add('is-entering'); }
      });
      if (focus) tabs[k].focus();
    };
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { select(k, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (k + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (k - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
    tablist.hidden = false;
    select(0, false);
  }
})();
