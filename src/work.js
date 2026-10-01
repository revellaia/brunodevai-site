/* WORLDCRAFT · work.js — Selected Work (05_COMPONENTS/SelectedWork.md).
   Desktop (>=1024, fora do SAVE): hover/focus na linha = preview full-bleed (1 imagem decodificada por vez,
   carregada apos 80ms de intencao), skew <=4deg pela velocidade do ponteiro (FULL), modo INDEX = <table>. */
(function () {
  'use strict';
  var WC = window.WC;
  var list = document.querySelector('[data-work-list]');
  var preview = document.querySelector('[data-work-preview]');
  if (!list || !WC || !WC.mode) return;
  var desktop = matchMedia('(min-width: 1024px)');
  var rows = [].slice.call(list.querySelectorAll('.work-row'));
  var imgs = preview ? [].slice.call(preview.querySelectorAll('img')) : [];
  var active = -1, intent = 0, unload = 0, lastY = null, lastT = 0, skewReset = 0;

  function on() { return desktop.matches && WC.mode.get() !== 'save'; }
  function activate(i) {
    if (!on() || i === active) return;
    active = i;
    list.classList.add('has-active');
    rows.forEach(function (r, k) { r.classList.toggle('is-active', k === i); });
    clearTimeout(intent);
    intent = setTimeout(function () {
      var img = imgs[i];
      if (!img) return;
      if (!img.getAttribute('src')) img.src = img.getAttribute('data-src');
      imgs.forEach(function (m, k) { m.classList.toggle('is-on', k === i); });
      clearTimeout(unload);
      unload = setTimeout(function () { imgs.forEach(function (m, k) { if (k !== active) m.removeAttribute('src'); }); }, 700);
    }, 80);
  }
  function clear() {
    active = -1; clearTimeout(intent);
    list.classList.remove('has-active');
    rows.forEach(function (r) { r.classList.remove('is-active'); r.style.removeProperty('--skew'); });
    imgs.forEach(function (m) { m.classList.remove('is-on'); });
  }
  rows.forEach(function (r, i) {
    r.addEventListener('pointerenter', function () { activate(i); });
    r.addEventListener('focus', function () { activate(i); });
    r.addEventListener('blur', function () { if (!list.contains(document.activeElement)) clear(); });
  });
  list.addEventListener('pointerleave', clear);
  list.addEventListener('pointermove', function (e) {
    if (active < 0 || WC.mode.get() !== 'full' || e.pointerType !== 'mouse') return;
    if (lastY !== null) {
      var vy = (e.clientY - lastY) / Math.max(1, e.timeStamp - lastT) * 16;
      rows[active].style.setProperty('--skew', Math.max(-4, Math.min(4, -0.6 * vy)).toFixed(2) + 'deg');
      clearTimeout(skewReset);
      skewReset = setTimeout(function () { if (rows[active]) rows[active].style.setProperty('--skew', '0deg'); }, 260);
    }
    lastY = e.clientY; lastT = e.timeStamp;
  }, { passive: true });
  addEventListener('wc:mode', clear);

  /* IMMERSIVE | INDEX */
  var modes = document.querySelector('[data-work-modes]');
  var table = document.querySelector('[data-work-table]');
  if (modes && table) {
    modes.hidden = false;
    modes.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode]');
      if (!b) return;
      var index = b.getAttribute('data-mode') === 'index';
      [].forEach.call(modes.querySelectorAll('[data-mode]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      table.hidden = !index; list.hidden = index; clear();
    });
    var tbody = table.tBodies[0];
    table.tHead.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sort]');
      if (!b) return;
      var key = b.getAttribute('data-sort'), th = b.closest('th');
      var dir = th.getAttribute('aria-sort') === 'ascending' ? -1 : 1;
      [].forEach.call(table.tHead.querySelectorAll('th'), function (x) { x.removeAttribute('aria-sort'); });
      th.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
      [].slice.call(tbody.rows).sort(function (a, c) {
        return a.getAttribute('data-' + key).localeCompare(c.getAttribute('data-' + key), undefined, { numeric: true }) * dir;
      }).forEach(function (r) { tbody.appendChild(r); });
    });
  }
})();
