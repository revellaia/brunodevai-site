/* BRUNO DEV.AI V3 · home.js — HeroProjectFrame (carrossel acessivel), video do backdrop e abas Interface/Sistema.
   Uma arquitetura de motion (CSS transitions + IntersectionObserver), por modo (src/mode.js):
   FULL    = autoplay continuo 4.8 s (1>2>3>4>5>1...), crossfade 1.1 s, video do backdrop apos o load. O ponteiro sobre o
             hero NAO pausa (Owner 2026-10-03). Pausa so: botao Pausar, foco de TECLADO dentro do frame (:focus-visible)
             ou aba oculta. Selecao manual reinicia o timer (a menos que o usuario tenha pausado). Um unico timer.
   REDUCED = sem auto-rotacao; troca manual com fade 200 ms; backdrop so poster.
   SAVE    = slide 1 estatico; slides 2-5 nunca baixados; sem backdrop (nem poster) e sem video.
   Leitores de tela: a legenda so vira aria-live quando o usuario troca o slide (nunca na rotacao automatica). */
(function () {
  'use strict';
  var WC = window.WC || {};
  var mode = function () { return WC.mode ? WC.mode.get() : 'full'; };
  var INTERVAL = 4800, PRELOAD_AHEAD = 1000;

  /* ---------- backdrop: video so em FULL, src so depois do load (poster decorativo e o fallback) ----------
     Arquitetura de reproducao recuperada do historico provado no Chrome (c9b6af8 / e3447a5, 2026-07): nunca uma unica
     tentativa de play(). ensureHeroVideoPlaying(reason) reafirma muted/defaultMuted/autoplay/loop/playsInline/controls
     (propriedade + atributo) e tenta de novo em cada ponto do ciclo de vida e no primeiro gesto real, porque o autoplay
     mudo do Chrome pode ser recusado em silencio em sessoes novas. playPending + safePause evitam "play() request was
     interrupted by a call to pause()". Watchdog limitado (800 ms, N tentativas) recupera sem depender de gesto.
     Portado SO o motor de reproducao (sem o parallax/visual antigo). O src continua ausente ate o load (gate V3). */
  var video = document.querySelector('[data-hero-video]');
  var heroEl = document.getElementById('top');
  if (video && heroEl) {
    var gateOpen = false, visible = true, playPending = false, watchdogTimer = null, watchdogTicks = 0;
    var safePause = function () { if (playPending) return; video.pause(); };
    var attachSrc = function () {
      if (video.getAttribute('src')) return;
      var mobile = window.matchMedia('(max-width: 767px)').matches;
      video.src = video.getAttribute(mobile ? 'data-src-mobile' : 'data-src-desktop');
    };
    var ensureHeroVideoPlaying = function (reason) {
      if (mode() !== 'full') { safePause(); return false; } /* REDUCED/SAVE: poster estatico, nenhum download */
      if (!gateOpen || !visible || document.hidden) return false;
      attachSrc();
      if (!video.paused && video.currentTime > 0) return true;
      if (playPending) return false;
      video.muted = true; video.defaultMuted = true; video.autoplay = true; video.loop = true; video.playsInline = true; video.controls = false;
      video.setAttribute('muted', ''); video.setAttribute('autoplay', ''); video.setAttribute('loop', ''); video.setAttribute('playsinline', '');
      var p;
      try { playPending = true; p = video.play(); } catch (e) { playPending = false; heroEl.setAttribute('data-video-state', 'blocked:' + reason); return false; }
      if (!p || !p.then) { playPending = false; return true; }
      p.then(function () { playPending = false; heroEl.setAttribute('data-video-state', 'playing:' + reason); },
        function () { playPending = false; heroEl.setAttribute('data-video-state', 'blocked:' + reason); });
      return true;
    };
    var armWatchdog = function (maxTicks) {
      watchdogTicks = 0;
      if (watchdogTimer) clearInterval(watchdogTimer);
      watchdogTimer = setInterval(function () {
        watchdogTicks++;
        if (watchdogTicks > maxTicks || mode() !== 'full') { clearInterval(watchdogTimer); watchdogTimer = null; return; }
        if (visible && video.paused && !playPending) ensureHeroVideoPlaying('watchdog');
      }, 800);
    };
    video.addEventListener('playing', function () { video.classList.add('is-playing'); });
    ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'].forEach(function (evt) {
      video.addEventListener(evt, function () { ensureHeroVideoPlaying('video-' + evt); }, { once: true });
    });
    var openGate = function () { setTimeout(function () { gateOpen = true; ensureHeroVideoPlaying('window-load'); armWatchdog(15); }, 200); };
    if (document.readyState === 'complete') openGate(); else window.addEventListener('load', openGate, { once: true });
    window.addEventListener('pageshow', function () { ensureHeroVideoPlaying('pageshow'); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { safePause(); return; }
      ensureHeroVideoPlaying('visibilitychange'); armWatchdog(6);
    });
    if ('IntersectionObserver' in window) {
      var pauseDebounce = null;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (pauseDebounce) { clearTimeout(pauseDebounce); pauseDebounce = null; }
          if (!e.isIntersecting && e.intersectionRatio <= 0.03) { pauseDebounce = setTimeout(function () { visible = false; safePause(); }, 400); return; }
          visible = true; ensureHeroVideoPlaying('intersection-visible');
        });
      }, { threshold: [0, 0.03, 0.05, 0.28], rootMargin: '120px 0px' }).observe(heroEl);
    }
    /* primeiro gesto real do visitante (uma vez cada) + presenca do ponteiro no hero */
    var once = function (target, type, reason) { target.addEventListener(type, function () { ensureHeroVideoPlaying(reason); }, { once: true, passive: true }); };
    once(document, 'click', 'document-click'); once(document, 'scroll', 'document-scroll'); once(document, 'keydown', 'document-keydown');
    once(document, 'touchstart', 'document-touchstart'); once(document, 'pointerdown', 'document-pointerdown'); once(heroEl, 'mouseenter', 'hero-mouseenter');
    heroEl.addEventListener('pointermove', function () { if (video.paused) ensureHeroVideoPlaying('hero-pointermove'); }, { passive: true });
    window.addEventListener('wc:mode', function () { if (mode() === 'full') ensureHeroVideoPlaying('mode-full'); else safePause(); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { ensureHeroVideoPlaying('dom-content-loaded'); }, { once: true });
    ensureHeroVideoPlaying('init');
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
    var i = 0, paused = false, focusIn = false, timer = null, ahead = null;

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

    var canRotate = function () { return mode() === 'full' && !paused && !focusIn && !document.hidden; };
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
    /* so foco de teclado pausa (WCAG 2.2.2); o foco que um clique de mouse deixa num botao nao conta */
    var kbFocus = function (el) { try { return el.matches(':focus-visible'); } catch (e) { return true; } };
    hpf.addEventListener('focusin', function (e) { focusIn = kbFocus(e.target); });
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
