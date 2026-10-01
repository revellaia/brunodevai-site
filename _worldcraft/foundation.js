/* Scaffolding da pagina de fundacao (Gate A): le o estado real das engines e dos tokens. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var css = getComputedStyle(root);
  var v = function (n) { return css.getPropertyValue('--wc-' + n).trim(); };

  function state() {
    css = getComputedStyle(root);
    $('#st-motion').textContent = root.getAttribute('data-motion');
    $('#st-layer').textContent = root.getAttribute('data-layer');
    var c = navigator.connection;
    $('#st-conn').textContent = c ? 'saveData=' + c.saveData + ' · ' + (c.effectiveType || '?') : 'API indisponivel';
    $('#st-grid').textContent = v('cols') + ' cols · margin ' + v('margin') + ' · gutter ' + v('gutter');
    $('#st-vp').textContent = innerWidth + ' × ' + innerHeight;
    document.querySelectorAll('[data-set-layer]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-layer') === WC.layer.get()));
    });
    var cols = $('#cols'), n = parseInt(v('cols'), 10) || 4;
    if (cols.children.length !== n) { cols.innerHTML = ''; for (var i = 1; i <= n; i++) { var s = document.createElement('span'); s.textContent = i; cols.appendChild(s); } }
  }

  /* Contraste WCAG (luminancia relativa) de cada token sobre ink-0. */
  function lum(hex) {
    var m = hex.replace('#', '').match(/../g).map(function (h) { var x = parseInt(h, 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2];
  }
  var base = lum(v('ink-0'));
  document.querySelectorAll('#swatches li').forEach(function (li) {
    var hex = v(li.getAttribute('data-token'));
    li.style.setProperty('--sw', hex);
    var l = lum(hex), ratio = (Math.max(l, base) + 0.05) / (Math.min(l, base) + 0.05);
    li.textContent = li.getAttribute('data-token') + ' · ' + hex + ' · ' + ratio.toFixed(2) + ':1';
  });

  var space = $('#space');
  for (var i = 1; i <= 19; i++) {
    var px = v('space-' + i);
    var li = document.createElement('li'); var bar = document.createElement('i'); bar.style.width = px;
    li.appendChild(bar); li.appendChild(document.createTextNode('space-' + i + ' · ' + px)); space.appendChild(li);
  }

  document.querySelectorAll('[data-set-layer]').forEach(function (b) {
    b.addEventListener('click', function () { WC.layer.set(b.getAttribute('data-set-layer'), 'foundation'); });
  });
  $('#replay').addEventListener('click', function () { $('.fd-motion').classList.toggle('is-on'); });
  addEventListener('wc:layer', state);
  addEventListener('wc:mode', state);
  addEventListener('resize', state, { passive: true });
  state();

  if (document.fonts) document.fonts.ready.then(function () {
    var loaded = []; document.fonts.forEach(function (f) { if (f.status === 'loaded') loaded.push(f.family.replace(/"/g, '') + ' ' + f.style + ' ' + f.weight); });
    $('#st-fonts').textContent = loaded.join(' · ') || 'nenhuma';
  });

  function rows(sel, list) {
    var tb = $(sel + ' tbody'); tb.innerHTML = '';
    list.forEach(function (cells) {
      var tr = document.createElement('tr');
      cells.forEach(function (c) { var td = document.createElement('td'); td.textContent = c.text; if (c.cls) td.className = c.cls; if (c.lang) td.lang = c.lang; tr.appendChild(td); });
      tb.appendChild(tr);
    });
  }
  fetch('/src/proof.json').then(function (r) { return r.json(); }).then(function (p) {
    rows('#proof', p.rows.map(function (r) { return [{ text: r.label }, { text: r.value }, { text: r.source }, { text: r.status }]; }));
  });
  fetch('/data/copy.json').then(function (r) { return r.json(); }).then(function (c) {
    var ids = ['nav.brand.primary', 'hero.name.line1', 'hero.name.line2', 'hero.primary.01', 'hero.primary.02', 'hero.signature', 'hero.role', 'hero.location', 'hero.available', 'toggle.experience', 'toggle.system', 'cico.meta.client'];
    rows('#copy', ids.filter(function (id) { return c[id]; }).map(function (id) {
      var st = c[id].status || '', blocked = /TBC|REVISE|ALTERNATIVE/.test(st);
      return [{ text: id }, { text: c[id].pt, lang: 'pt-BR' }, { text: c[id].en, lang: 'en' }, { text: st, cls: blocked ? 'is-blocked' : '' }];
    }));
  });
})();
