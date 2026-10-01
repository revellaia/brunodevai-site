/* WORLDCRAFT · engine.js — a mecanica EXPERIENCE <-> SYSTEM (06_MOTION/EXPERIENCE_SYSTEM_MECHANIC.md).
   Le e escreve SO o store de src/layer.js (uma engine). Responsavel por: switches (role=switch),
   tecla S, live region, montagem dos <details> SYSTEM e as transicoes por modo:
   FULL = wipe circular no hero / inset no CICO / fade 320ms no resto; REDUCED = crossfade 200ms; SAVE = instantaneo. */
(function () {
  'use strict';
  var WC = window.WC, root = document.documentElement;
  if (!WC || !WC.layer || WC.engine) return;
  WC.engine = true;

  var switches = [].slice.call(document.querySelectorAll('[data-layer-switch]'));
  var blocks = [].slice.call(document.querySelectorAll('[data-sys]'));
  var live = document.querySelector('[data-layer-live]');
  var heroSys = document.querySelector('.hero-sys');
  var origin = null;

  /* <details> vira camada: aberto, sumario oculto por CSS, nao fechavel. */
  blocks.forEach(function (d) {
    d.open = true;
    d.setAttribute('data-js-mounted', '');
    d.addEventListener('toggle', function () { if (!d.open) d.open = true; });
  });

  function sync(layer) {
    var on = layer === 'system';
    switches.forEach(function (s) { s.setAttribute('aria-checked', on ? 'true' : 'false'); });
    if (heroSys) {
      heroSys.inert = !on;
      if (on) heroSys.removeAttribute('aria-hidden'); else heroSys.setAttribute('aria-hidden', 'true');
    }
  }

  function centerOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function animate(el, frames, opts, done) {
    if (!el.animate) { if (done) done(); return; }
    var a = el.animate(frames, opts);
    a.onfinish = a.oncancel = function () { if (done) done(); };
  }

  function transition(detail) {
    var mode = WC.mode ? WC.mode.get() : 'full';
    var toSystem = detail.layer === 'system';
    if (mode === 'save') return;
    var dur = mode === 'reduced' ? 200 : 480, ease = mode === 'reduced' ? 'linear' : 'cubic-bezier(.2,0,0,1)';
    blocks.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return; /* fora da tela: troca instantanea */
      if (!toSystem && !el.classList.contains('hero-sys')) el.classList.add('is-leaving');
      var clear = function () { el.classList.remove('is-leaving'); };
      if (mode === 'reduced') {
        animate(el, [{ opacity: toSystem ? 0 : 1 }, { opacity: toSystem ? 1 : 0 }], { duration: 200, easing: 'linear' }, clear);
      } else if (el.classList.contains('hero-sys')) {
        var o = origin || { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        var at = ' at ' + (o.x - r.left) + 'px ' + (o.y - r.top) + 'px)';
        animate(el, [{ clipPath: 'circle(' + (toSystem ? '0px' : '150%') + at }, { clipPath: 'circle(' + (toSystem ? '150%' : '0px') + at }],
          { duration: toSystem ? dur : 320, easing: ease }, clear);
      } else if (el.classList.contains('cico-sys')) {
        animate(el, [{ clipPath: toSystem ? 'inset(0 0 0 100%)' : 'inset(0)' }, { clipPath: toSystem ? 'inset(0)' : 'inset(0 0 0 100%)' }],
          { duration: dur, easing: ease }, clear);
      } else {
        animate(el, [{ opacity: toSystem ? 0 : 1 }, { opacity: toSystem ? 1 : 0 }], { duration: 320, easing: ease }, clear);
      }
    });
    origin = null;
  }

  WC.layer.subscribe(function (detail) {
    sync(detail.layer);
    transition(detail);
    if (live) live.textContent = live.getAttribute(detail.layer === 'system' ? 'data-on-system' : 'data-on-experience');
  });

  /* Switches: clique num segmento escolhe aquela camada; teclado (Space/Enter = click sem ponteiro) alterna. */
  switches.forEach(function (s) {
    s.hidden = false;
    s.addEventListener('click', function (e) {
      var seg = e.target.closest && e.target.closest('[data-seg]');
      origin = centerOf(s);
      if (seg && e.detail !== 0) WC.layer.set(seg.getAttribute('data-seg'), 'switch');
      else WC.layer.toggle('switch');
    });
  });

  /* Tecla S: ignorada em campos editaveis, com modificadores, com dialog aberto ou repeticao. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 's' && e.key !== 'S') return;
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.querySelector('dialog[open]') || document.body.classList.contains('cf-locked')) return;
    var visible = switches.filter(function (s) { return s.offsetParent !== null; })[0];
    origin = visible ? centerOf(visible) : null;
    WC.layer.toggle('key');
  });

  /* Compacto fixado no desktop depois que o hero sai da tela (paginas sem hero ja nascem com data-hero-out). */
  var hero = document.getElementById('hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) root.removeAttribute('data-hero-out'); else root.setAttribute('data-hero-out', '');
    }, { threshold: 0 }).observe(hero);
  }

  sync(WC.layer.get());
})();
