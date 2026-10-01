/* WORLDCRAFT · layer.js (store)
   Estado global unico: layer = "experience" | "system", espelhado em <html data-layer>
   (06_MOTION/EXPERIENCE_SYSTEM_MECHANIC.md §1).
   - Padrao: experience em toda primeira visita.
   - Persistencia: sessionStorage "wc.layer" (sobrevive a navegacao na sessao).
   - Deep link: ?layer=system|experience define o estado no load; nunca e reescrito na URL.
   Carregar SINCRONO no <head> para nao piscar a camada errada. Toggle, tecla S, live region e
   anuncio a leitores de tela entram na Fase 03 consumindo esta API (WC.layer.set/toggle/subscribe). */
(function () {
  'use strict';
  var root = document.documentElement;
  var WC = window.WC = window.WC || {};
  if (WC.layer) return;

  var KEY = 'wc.layer';
  var VALID = { experience: 1, system: 1 };
  var subs = [];
  var layer = 'experience';

  function read() {
    try { return window.sessionStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { window.sessionStorage.setItem(KEY, v); } catch (e) { /* storage bloqueado: estado so em memoria */ }
  }

  var stored = read();
  if (VALID[stored]) layer = stored;
  var fromUrl = null;
  try { fromUrl = new URLSearchParams(window.location.search).get('layer'); } catch (e) { /* URLSearchParams ausente */ }
  if (VALID[fromUrl]) { layer = fromUrl; write(layer); }

  root.setAttribute('data-layer', layer);

  function set(next, source) {
    if (!VALID[next] || next === layer) return layer;
    var prev = layer;
    layer = next;
    root.setAttribute('data-layer', layer);
    write(layer);
    var detail = { layer: layer, previous: prev, source: source || 'api' };
    for (var i = 0; i < subs.length; i++) {
      try { subs[i](detail); } catch (e) { setTimeout(function () { throw e; }); }
    }
    try { window.dispatchEvent(new CustomEvent('wc:layer', { detail: detail })); } catch (e) { /* sem CustomEvent */ }
    return layer;
  }

  WC.layer = {
    get: function () { return layer; },
    set: set,
    toggle: function (source) { return set(layer === 'system' ? 'experience' : 'system', source); },
    subscribe: function (fn) {
      subs.push(fn);
      return function () { subs = subs.filter(function (f) { return f !== fn; }); };
    },
  };
})();
