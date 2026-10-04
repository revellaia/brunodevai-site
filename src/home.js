/* BRUNO DEV.AI V3 · home.js — HeroProjectFrame (carrossel acessivel), video do backdrop e abas Interface/Sistema.
   Uma arquitetura de motion (CSS transitions + IntersectionObserver), por modo (src/mode.js):
   CARROSSEL (contrato do Owner 2026-10-04): autoplay 4.8 s em TODOS os modos; so para com Pausar, aba oculta ou interacao
             ativa de teclado. FULL = crossfade 1.1 s; REDUCED = troca com fade <= 200 ms; SAVE = gira com imagem just-in-time.
   VIDEO do backdrop (independente do carrossel): so em FULL, src depois do load, motor historico de reproducao.
             REDUCED = poster; SAVE = sem backdrop e sem video.
   Leitores de tela: a legenda so vira aria-live quando o usuario troca o slide (nunca na rotacao automatica). */
(function () {
  'use strict';
  var WC = window.WC || {};
  var mode = function () { return WC.mode ? WC.mode.get() : 'full'; };
  var INTERVAL = 4800, PRELOAD_AHEAD = 1000;

  /* ---------- HeroProjectFrame (CONTRATO DO OWNER 2026-10-04: autoplay e o comportamento padrao) ----------
     Gira 01>02>03>04>05>01 a cada 4,8 s em QUALQUER modo. So para com: (A) Pausar explicito, (B) aba oculta,
     (C) interacao ATIVA de teclado nos controles (keydown de navegacao; termina quando o foco sai do frame ou num clique).
     Foco de mouse, foco restaurado pelo navegador, hover, reduced motion, reduced data, saveData e effectiveType NAO param.
     WC.mode decide so a transicao (CSS por data-motion) e o carregamento (proxima imagem just-in-time, nunca as 5).
     Um unico timer de rotacao (setTimeout em cadeia) + um guarda de autocura (>6 s sem troca -> re-arma), sem polling. */
  try {
    var hpf = document.querySelector('[data-hpf]');
    if (hpf) {
      var slides = [].slice.call(hpf.querySelectorAll('.hpf-slide'));
      var bars = [].slice.call(hpf.querySelectorAll('[data-go]'));
      var barsWrap = hpf.querySelector('[data-hpf-bars]');
      var pauseBtn = hpf.querySelector('[data-hpf-pause]');
      var icon = hpf.querySelector('[data-hpf-icon]');
      var live = hpf.querySelector('[data-hpf-live]');
      var nameEl = hpf.querySelector('[data-hpf-name]'), typeEl = hpf.querySelector('[data-hpf-type]'), numEl = hpf.querySelector('[data-hpf-n]');
      var i = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('is-active'); }));
      var userPaused = false, kbActive = false, timer = null, ahead = null, guard = null;
      var lastRotationAt = Date.now(), expectedNextAt = 0;

      var load = function (n) {
        var img = slides[n] && slides[n].querySelector('img[data-src]');
        if (!img) return;
        if (img.getAttribute('data-srcset')) { img.setAttribute('srcset', img.getAttribute('data-srcset')); img.removeAttribute('data-srcset'); }
        img.setAttribute('src', img.getAttribute('data-src'));
        img.removeAttribute('data-src');
      };
      var canRotate = function () { return !userPaused && !document.hidden && !kbActive; };
      var clearTimers = function () { clearTimeout(timer); clearTimeout(ahead); clearTimeout(guard); timer = ahead = guard = null; };
      var schedule = function () {
        clearTimers();
        if (!canRotate()) { expectedNextAt = 0; return; }
        expectedNextAt = Date.now() + INTERVAL;
        /* just-in-time: so a PROXIMA imagem, ~1 s antes da troca (vale para SAVE tambem) */
        ahead = setTimeout(function () { load((i + 1) % slides.length); }, INTERVAL - PRELOAD_AHEAD);
        timer = setTimeout(function () { timer = null; if (canRotate()) show(i + 1, false); else schedule(); }, INTERVAL);
        /* autocura: se a troca nao aconteceu ~1,2 s depois do previsto (timer perdido/estrangulado), re-arma */
        guard = setTimeout(function () { guard = null; if (canRotate() && Date.now() - lastRotationAt > INTERVAL + 1200) show(i + 1, false); }, INTERVAL + 1200);
      };
      var show = function (n, byUser) {
        n = (n + slides.length) % slides.length;
        if (n !== i) {
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
        }
        lastRotationAt = Date.now();
        schedule();
      };
      var setPaused = function (p) {
        userPaused = p; /* SO o botao muda isto */
        pauseBtn.setAttribute('aria-label', pauseBtn.getAttribute(p ? 'data-label-play' : 'data-label-pause'));
        icon.textContent = p ? '▶' : 'II';
        lastRotationAt = Date.now();
        schedule();
      };
      var rearm = function () { kbActive = kbActive && hpf.contains(document.activeElement); if (canRotate() && (!timer || Date.now() - lastRotationAt > INTERVAL + 1200)) { lastRotationAt = Date.now(); schedule(); } };

      /* controles visiveis em todos os modos: autoplay em todo modo exige Pausar sempre disponivel (WCAG 2.2.2) */
      pauseBtn.hidden = false; barsWrap.hidden = false;
      bars.forEach(function (b) { b.addEventListener('click', function (e) { if (e.detail !== 0) kbActive = false; /* clique de mouse; Enter/Espaco (detail 0) mantem a pausa de teclado */ show(+b.getAttribute('data-go'), true); }); });
      pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
      /* interacao de teclado explicita e temporaria */
      hpf.addEventListener('keydown', function (e) {
        if (/^(Tab|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|Enter| |Spacebar)$/.test(e.key)) { kbActive = true; schedule(); }
      });
      /* entrar no frame com Tab (o keydown ocorre no elemento anterior): so conta se o Tab foi agora (< 400 ms);
         foco programatico ou restaurado pelo navegador nao tem Tab recente e NAO pausa */
      var lastTabAt = 0;
      document.addEventListener('keydown', function (e) { if (e.key === 'Tab') lastTabAt = Date.now(); }, true);
      hpf.addEventListener('focusin', function () { if (Date.now() - lastTabAt < 400) { kbActive = true; schedule(); } });
      hpf.addEventListener('focusout', function (e) { if (!hpf.contains(e.relatedTarget)) { kbActive = false; rearm(); } });
      document.addEventListener('pointerdown', function () { if (kbActive) { kbActive = false; rearm(); } }, { passive: true });
      document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimers(); else { lastRotationAt = Date.now(); schedule(); } });
      window.addEventListener('pageshow', function () { kbActive = false; lastRotationAt = Date.now(); schedule(); }); /* BFCache: nunca herda pausa acidental */
      window.addEventListener('focus', rearm);
      window.WC = window.WC || {};
      window.WC.hero = { state: function () { return { slide: i, userPaused: userPaused, kbActive: kbActive, hidden: document.hidden, timerArmed: !!timer, guardArmed: !!guard, lastRotationAt: lastRotationAt, expectedNextAt: expectedNextAt, sinceLastMs: Date.now() - lastRotationAt }; } };
      schedule(); /* imediato: nao espera video, load, IntersectionObserver, rede nem modo */
    }
  } catch (e) { /* o carrossel nunca pode derrubar o resto da pagina */ }

  try {
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
  } catch (e) { /* o video e decorativo: falha dele nunca afeta o carrossel */ }

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
