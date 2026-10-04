/* BRUNO DEV.AI V3 · home.js — HeroVideoPlaylist (7 filmes) e abas Interface/Sistema.
   O fundo do hero e a FOTO 01 do Bruno (imagem estatica, sem JS). O frame da direita toca 7 filmes em ordem:
   01 Presence (filme de marca, o antigo video atmosferico do fundo) + 02..07 os estudos do Lab -> 01. So o filme ATIVO
   toca (o anterior pausa e volta a 0); janela de apresentacao = min(duracao do filme, 8 s), ou 'ended' se acabar antes;
   falha de play nao trava: o poster fica e a playlist segue. Maximo simultaneo no hero: 1 video.
   Contrato do Owner: a playlist avanca por padrao em QUALQUER modo; so para com Pausar, aba oculta ou interacao ativa de
   teclado. REDUCED e SAVE: sequencia de POSTERS (4,8 s, sem video; SAVE com imagem just-in-time).
   Motor de reproducao (ensureVideoPlaying), recuperado do historico provado no Chrome (c9b6af8 / e3447a5 / 06a6f19):
   muted/defaultMuted/autoplay/playsInline reafirmados, playPending + stopVideo seguro, retentativas limitadas, nova
   tentativa no load, nos eventos de ciclo de vida e no primeiro gesto real.
   Leitores de tela: a legenda so vira aria-live quando o usuario troca o slide (nunca no avanco automatico). */
(function () {
  'use strict';
  var WC = window.WC || {};
  var mode = function () { return WC.mode ? WC.mode.get() : 'full'; };
  var POSTER_INTERVAL = 4800, VIDEO_WINDOW = 8000, PRELOAD_AHEAD = 1500;

  /* ---------- motor de reproducao (generico) ---------- */
  var stopVideo = function (v) {
    if (!v) return;
    if (v.__playPending) { v.__wantStop = true; return; } /* nunca pausar com play() em voo */
    v.pause(); try { v.currentTime = 0; } catch (e) { /* sem metadata ainda */ }
    v.autoplay = false; v.removeAttribute('autoplay');
  };
  var ensureVideoPlaying = function (v, loop) {
    if (!v || !v.getAttribute('src')) return false;
    if (!v.paused && v.currentTime > 0) return true;
    if (v.__playPending) return false;
    v.__wantStop = false;
    v.muted = true; v.defaultMuted = true; v.autoplay = true; v.playsInline = true; v.controls = false; v.loop = !!loop;
    v.setAttribute('muted', ''); v.setAttribute('autoplay', ''); v.setAttribute('playsinline', '');
    if (loop) v.setAttribute('loop', ''); else v.removeAttribute('loop');
    var p;
    try { v.__playPending = true; p = v.play(); } catch (e) { v.__playPending = false; return false; }
    if (!p || !p.then) { v.__playPending = false; return true; }
    p.then(function () { v.__playPending = false; if (v.__wantStop) stopVideo(v); }, function () { v.__playPending = false; if (v.__wantStop) stopVideo(v); });
    return true;
  };

  /* ---------- HeroVideoPlaylist ---------- */
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
      var userPaused = false, kbActive = false, timer = null, ahead = null, guard = null, retry = null, retries = 0;
      var lastRotationAt = Date.now(), expectedNextAt = 0, windowMs = 0;

      var vid = function (n) { return slides[n] && slides[n].querySelector('video'); };
      var useVideo = function () { return mode() === 'full'; };
      var loadPoster = function (n) {
        if (!slides[n]) return;
        [].forEach.call(slides[n].querySelectorAll('img[data-src]'), function (img) { img.setAttribute('src', img.getAttribute('data-src')); img.removeAttribute('data-src'); });
      };
      var attachVideo = function (n, preloadOnly) {
        var v = vid(n); if (!v || v.getAttribute('src')) return v;
        if (preloadOnly) { v.autoplay = false; v.removeAttribute('autoplay'); v.preload = 'metadata'; }
        v.src = slides[n].getAttribute('data-video');
        return v;
      };
      var canRotate = function () { return !userPaused && !document.hidden && !kbActive; };
      var clearTimers = function () { clearTimeout(timer); clearTimeout(ahead); clearTimeout(guard); timer = ahead = guard = null; };
      var stopRetry = function () { clearInterval(retry); retry = null; };
      /* retentativas limitadas do filme ativo (800 ms, ate 10x): cobre recusa silenciosa do primeiro play() */
      var armRetry = function () {
        stopRetry(); retries = 0;
        retry = setInterval(function () {
          var v = vid(i);
          if (++retries > 10 || !useVideo() || !v || (!v.paused && v.currentTime > 0)) { stopRetry(); return; }
          if (!document.hidden && !userPaused && !v.__playPending) ensureVideoPlaying(v, false);
        }, 800);
      };
      var playActive = function () {
        if (!useVideo() || document.hidden || userPaused) return;
        var v = attachVideo(i, false); ensureVideoPlaying(v, false); armRetry();
      };
      var schedule = function () {
        clearTimers();
        if (!canRotate()) { expectedNextAt = 0; return; }
        var v = vid(i);
        windowMs = useVideo() ? Math.min(VIDEO_WINDOW, v && v.duration > 0 && isFinite(v.duration) ? v.duration * 1000 - 300 : VIDEO_WINDOW) : POSTER_INTERVAL;
        windowMs = Math.max(3000, windowMs);
        expectedNextAt = Date.now() + windowMs;
        /* just-in-time: so o PROXIMO poster (e, em FULL, a metadata do proximo filme) pouco antes da troca */
        ahead = setTimeout(function () { var n = (i + 1) % slides.length; loadPoster(n); if (useVideo()) attachVideo(n, true); }, Math.max(0, windowMs - PRELOAD_AHEAD));
        timer = setTimeout(function () { timer = null; if (canRotate()) show(i + 1, false); else schedule(); }, windowMs);
        /* autocura: troca atrasada > 1,5 s (timer perdido/estrangulado) -> avanca */
        guard = setTimeout(function () { guard = null; if (canRotate() && Date.now() - lastRotationAt > windowMs + 1500) show(i + 1, false); }, windowMs + 1500);
      };
      var show = function (n, byUser) {
        n = (n + slides.length) % slides.length;
        if (n !== i) {
          stopVideo(vid(i)); slides[i].classList.remove('is-playing');
          loadPoster(n);
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
        playActive();
        schedule();
      };
      slides.forEach(function (s, k) {
        var v = s.querySelector('video'); if (!v) return;
        v.addEventListener('playing', function () { if (k === i) s.classList.add('is-playing'); else stopVideo(v); });
        v.addEventListener('ended', function () { if (k === i && canRotate()) show(i + 1, false); });
        v.addEventListener('loadedmetadata', function () { if (k === i && canRotate() && timer) { var left = expectedNextAt - Date.now(); var target = Math.min(VIDEO_WINDOW, v.duration * 1000 - 300); if (target < windowMs && left > 0) schedule(); } });
      });
      var setPaused = function (p) {
        userPaused = p; /* SO o botao muda isto */
        pauseBtn.setAttribute('aria-label', pauseBtn.getAttribute(p ? 'data-label-play' : 'data-label-pause'));
        icon.textContent = p ? '▶' : 'II';
        var v = vid(i);
        if (p) { stopRetry(); if (v) { if (v.__playPending) v.__wantStop = true; else v.pause(); } } else playActive();
        lastRotationAt = Date.now();
        schedule();
      };
      var rearm = function () { kbActive = kbActive && hpf.contains(document.activeElement); if (canRotate() && (!timer || Date.now() - lastRotationAt > windowMs + 1500)) { lastRotationAt = Date.now(); playActive(); schedule(); } };

      /* controles visiveis em todos os modos: avanco automatico exige Pausar sempre disponivel (WCAG 2.2.2) */
      pauseBtn.hidden = false; barsWrap.hidden = false;
      bars.forEach(function (b) { b.addEventListener('click', function (e) { if (e.detail !== 0) kbActive = false; show(+b.getAttribute('data-go'), true); }); });
      pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
      hpf.addEventListener('keydown', function (e) {
        if (/^(Tab|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|Enter| |Spacebar)$/.test(e.key)) { kbActive = true; schedule(); }
      });
      var lastTabAt = 0;
      document.addEventListener('keydown', function (e) { if (e.key === 'Tab') lastTabAt = Date.now(); }, true);
      hpf.addEventListener('focusin', function () { if (Date.now() - lastTabAt < 400) { kbActive = true; schedule(); } });
      hpf.addEventListener('focusout', function (e) { if (!hpf.contains(e.relatedTarget)) { kbActive = false; rearm(); } });
      document.addEventListener('pointerdown', function () { if (kbActive) { kbActive = false; rearm(); } }, { passive: true });
      document.addEventListener('visibilitychange', function () {
        var v = vid(i);
        if (document.hidden) { clearTimers(); stopRetry(); if (v && !v.__playPending) v.pause(); }
        else { lastRotationAt = Date.now(); playActive(); schedule(); }
      });
      window.addEventListener('pageshow', function () { kbActive = false; lastRotationAt = Date.now(); playActive(); schedule(); });
      window.addEventListener('focus', rearm);
      /* load: nova tentativa do filme ativo (sessao nova do Chrome pode recusar o primeiro play() em silencio) */
      window.addEventListener('load', function () { var v = vid(i); if (useVideo() && v && v.paused && !userPaused && !document.hidden) { ensureVideoPlaying(v, false); armRetry(); } }, { once: true });
      window.addEventListener('wc:mode', function () { if (!useVideo()) { stopVideo(vid(i)); slides[i].classList.remove('is-playing'); } lastRotationAt = Date.now(); playActive(); schedule(); });
      /* primeiro gesto real: nova tentativa do filme ativo (autoplay recusado em silencio) */
      ['click', 'scroll', 'keydown', 'touchstart', 'pointerdown'].forEach(function (t) { document.addEventListener(t, function () { var v = vid(i); if (useVideo() && v && v.paused && !userPaused) ensureVideoPlaying(v, false); }, { once: true, passive: true }); });
      window.WC = window.WC || {};
      window.WC.hero = { state: function () { var v = vid(i); return { slide: i, userPaused: userPaused, kbActive: kbActive, hidden: document.hidden, timerArmed: !!timer, guardArmed: !!guard, windowMs: windowMs, lastRotationAt: lastRotationAt, expectedNextAt: expectedNextAt, sinceLastMs: Date.now() - lastRotationAt, video: v ? { src: (v.getAttribute('src') || '').split('/').pop(), paused: v.paused, t: +v.currentTime.toFixed(2) } : null }; } };
      playActive(); /* imediato: o filme 01 ja entra (nao espera o load) */
      schedule();
    }
  } catch (e) { /* a playlist nunca pode derrubar o resto da pagina */ }

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
