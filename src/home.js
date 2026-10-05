/* BRUNO DEV.AI V3 · home.js — HeroVideoPlaylist (7 filmes) e abas Interface/Sistema.
   O fundo do hero e a FOTO 01 do Bruno (imagem estatica, sem JS). O frame da direita toca 7 filmes em ordem:
   01 Presence (filme de marca) + 02..07 os estudos do Lab -> 01, em loop infinito.
   CONTRATO DO OWNER (P0 2026-10-05): O FILME E O RELOGIO. Cada filme comeca em 0, toca ate o fim e o evento 'ended'
   troca para o proximo; cada slide fica na tela a duracao REAL do seu filme (nao existe janela fixa). A duracao
   (loadedmetadata; sem ela, a duracao real lida do MP4 no build: data-duration) serve so para diagnostico e para o
   watchdog de emergencia: filme que nao progride por (duracao propria + 2 s) — quebrado, travado ou bloqueado — e
   pulado, e a playlist nunca congela.
   Video toca em FULL e em REDUCED (prefers-reduced-motion so encurta as transicoes); so o SAVE DATA explicito usa a
   sequencia de POSTERS (4,8 s, imagem just-in-time, nenhum video). So o filme ativo toca.
   So param a playlist: Pausar (o filme pausa onde esta e Retomar continua dele), aba oculta, ou interacao ativa de
   teclado no frame (o filme termina e a troca espera o foco sair).
   Motor de reproducao compartilhado: src/video.js (WC.video: ensurePlaying / stop / retry).
   Leitores de tela: a legenda so vira aria-live quando o usuario troca o slide (nunca no avanco automatico). */
(function () {
  'use strict';
  var WC = window.WC || {};
  var mode = function () { return WC.mode ? WC.mode.get() : 'full'; };
  var V = WC.video;
  var POSTER_INTERVAL = 4800, END_MARGIN = 2000, PRELOAD_AHEAD = 2.5, NO_META_FALLBACK = 20000;

  /* ---------- HeroVideoPlaylist ---------- */
  try {
    var hpf = document.querySelector('[data-hpf]');
    if (hpf && V) {
      var slides = [].slice.call(hpf.querySelectorAll('.hpf-slide'));
      var bars = [].slice.call(hpf.querySelectorAll('[data-go]'));
      var barsWrap = hpf.querySelector('[data-hpf-bars]');
      var pauseBtn = hpf.querySelector('[data-hpf-pause]');
      var icon = hpf.querySelector('[data-hpf-icon]');
      var live = hpf.querySelector('[data-hpf-live]');
      var nameEl = hpf.querySelector('[data-hpf-name]'), typeEl = hpf.querySelector('[data-hpf-type]'), numEl = hpf.querySelector('[data-hpf-n]');
      var i = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('is-active'); }));
      var userPaused = false, kbActive = false, pendingAdvance = false, preloaded = false;
      var posterTimer = null, ahead = null, watch = null, cancelRetry = null;
      var activatedAt = Date.now(), lastProgressAt = Date.now(), lastT = -1;

      var vid = function (n) { return slides[n] && slides[n].querySelector('video'); };
      var useVideo = function () { return mode() !== 'save'; }; /* FULL e REDUCED tocam video; so SAVE e poster */
      var duration = function (v) { return v && isFinite(v.duration) && v.duration > 0 ? v.duration : 0; };
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
      var clearTimers = function () { clearTimeout(posterTimer); clearTimeout(ahead); clearInterval(watch); posterTimer = ahead = watch = null; };
      var stopRetry = function () { if (cancelRetry) { cancelRetry(); cancelRetry = null; } };
      var preloadNext = function () { var n = (i + 1) % slides.length; loadPoster(n); if (useVideo()) attachVideo(n, true); };

      /* o filme ativo DEVE estar tocando: pagina visivel, sem Pausar, fora do SAVE */
      var playActive = function () {
        if (!useVideo() || document.hidden || userPaused) return;
        var v = attachVideo(i, false); if (!v || v.ended) return;
        V.ensurePlaying(v, false);
        stopRetry();
        cancelRetry = V.retry(v, function () { return useVideo() && !userPaused && !document.hidden && vid(i) === v && !v.ended; });
      };
      /* watchdog de EMERGENCIA (a troca normal e o 'ended'): sem progresso por duracao propria + 2 s -> proximo */
      var tick = function () {
        var v = vid(i); if (!v || !canRotate()) return;
        /* duracao: a do navegador (metadata); sem metadata (rede lenta), a REAL do arquivo gravada no build (data-duration) */
        var d = duration(v) || +slides[i].getAttribute('data-duration') || 0, t = v.currentTime, now = Date.now();
        if (t > lastT) lastProgressAt = now;
        lastT = t;
        if (!preloaded && d && d - t <= PRELOAD_AHEAD) { preloaded = true; preloadNext(); }
        if (v.ended) { show(i + 1, false); return; } /* 'ended' perdido */
        if (now - lastProgressAt > (d ? d * 1000 : NO_META_FALLBACK) + END_MARGIN) show(i + 1, false);
      };
      var arm = function () {
        clearTimers();
        if (!canRotate()) return;
        if (!useVideo()) { /* SAVE: sequencia de posters, imagem do proximo just-in-time */
          ahead = setTimeout(preloadNext, POSTER_INTERVAL - 1500);
          posterTimer = setTimeout(function () { posterTimer = null; if (canRotate()) show(i + 1, false); else arm(); }, POSTER_INTERVAL);
          return;
        }
        lastProgressAt = Date.now(); lastT = -1;
        watch = setInterval(tick, 500);
      };
      var show = function (n, byUser) {
        n = (n + slides.length) % slides.length;
        if (n !== i) {
          V.stop(vid(i), true); slides[i].classList.remove('is-playing');
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
        /* todo filme ativado comeca do 0 (automatico ou escolhido pelo usuario) */
        var v = vid(i); if (v && v.getAttribute('src')) { try { v.currentTime = 0; } catch (e) { /* sem metadata */ } }
        pendingAdvance = false; preloaded = false; activatedAt = Date.now();
        playActive();
        arm();
      };
      slides.forEach(function (s, k) {
        var v = s.querySelector('video'); if (!v) return;
        v.addEventListener('playing', function () { if (k === i) s.classList.add('is-playing'); else V.stop(v, true); });
        /* O RELOGIO: fim do filme ativo -> proximo (ou espera, se o teclado estiver ativo no frame) */
        v.addEventListener('ended', function () { if (k !== i) return; if (canRotate()) show(i + 1, false); else pendingAdvance = true; });
      });
      var setPaused = function (p) {
        userPaused = p; /* SO o botao muda isto */
        pauseBtn.setAttribute('aria-label', pauseBtn.getAttribute(p ? 'data-label-play' : 'data-label-pause'));
        icon.textContent = p ? '▶' : 'II';
        if (p) { stopRetry(); clearTimers(); V.stop(vid(i), false); return; } /* pausa ONDE esta */
        if (pendingAdvance || (vid(i) && vid(i).ended)) { show(i + 1, false); return; }
        playActive(); arm(); /* Retomar: o MESMO filme continua de onde parou */
      };
      var rearm = function () {
        kbActive = kbActive && hpf.contains(document.activeElement);
        if (!canRotate()) return;
        if (pendingAdvance) { show(i + 1, false); return; }
        if (!watch && !posterTimer) { playActive(); arm(); }
      };

      /* controles visiveis em todos os modos: avanco automatico exige Pausar sempre disponivel (WCAG 2.2.2) */
      pauseBtn.hidden = false; barsWrap.hidden = false;
      bars.forEach(function (b) { b.addEventListener('click', function (e) { if (e.detail !== 0) kbActive = false; show(+b.getAttribute('data-go'), true); }); });
      pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
      hpf.addEventListener('keydown', function (e) {
        if (/^(Tab|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|Enter| |Spacebar)$/.test(e.key)) { kbActive = true; clearTimers(); }
      });
      var lastTabAt = 0;
      document.addEventListener('keydown', function (e) { if (e.key === 'Tab') lastTabAt = Date.now(); }, true);
      hpf.addEventListener('focusin', function () { if (Date.now() - lastTabAt < 400) { kbActive = true; clearTimers(); } });
      hpf.addEventListener('focusout', function (e) { if (!hpf.contains(e.relatedTarget)) { kbActive = false; rearm(); } });
      document.addEventListener('pointerdown', function () { if (kbActive) { kbActive = false; rearm(); } }, { passive: true });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { clearTimers(); stopRetry(); V.stop(vid(i), false); return; } /* pausa onde esta */
        if (pendingAdvance && canRotate()) { show(i + 1, false); return; }
        playActive(); arm();
      });
      window.addEventListener('pageshow', function () { kbActive = false; playActive(); arm(); });
      window.addEventListener('focus', rearm);
      window.addEventListener('wc:mode', function () { if (!useVideo()) { stopRetry(); V.stop(vid(i), true); slides[i].classList.remove('is-playing'); } playActive(); arm(); });
      /* load e primeiro gesto real: nova tentativa do filme ativo (sessao nova do Chrome pode recusar o 1o play()) */
      var nudge = function () { var v = vid(i); if (useVideo() && v && v.paused && !v.ended && !userPaused && !document.hidden) { V.ensurePlaying(v, false); } };
      window.addEventListener('load', nudge, { once: true });
      ['click', 'scroll', 'keydown', 'touchstart', 'pointerdown'].forEach(function (t) { document.addEventListener(t, nudge, { once: true, passive: true }); });
      window.WC = window.WC || {};
      window.WC.hero = { state: function () { var v = vid(i); return { slide: i, mode: mode(), useVideo: useVideo(), userPaused: userPaused, kbActive: kbActive, pendingAdvance: pendingAdvance, hidden: document.hidden, watchArmed: !!watch, posterTimerArmed: !!posterTimer, activatedAt: activatedAt, sinceActivationMs: Date.now() - activatedAt, video: v ? { src: (v.getAttribute('src') || '').split('/').pop(), paused: v.paused, ended: v.ended, t: +v.currentTime.toFixed(2), duration: duration(v) } : null }; } };
      playActive(); /* imediato: o filme 01 ja entra (nao espera o load) */
      arm();
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
