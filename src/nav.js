/* WORLDCRAFT · nav.js — fundo da barra apos 80px (sem esconder no scroll) e menu mobile em <dialog>
   (focus trap, Esc e retorno de foco nativos). Sem JS, "Menu" e uma ancora para o rodape. */
(function () {
  'use strict';
  var root = document.documentElement;
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (window.scrollY > 80) root.setAttribute('data-scrolled', ''); else root.removeAttribute('data-scrolled');
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var dialog = document.querySelector('[data-menu]');
  var opener = document.querySelector('[data-menu-open]');
  if (!dialog || !opener || typeof dialog.showModal !== 'function') return;
  opener.setAttribute('role', 'button');
  opener.addEventListener('click', function (e) { e.preventDefault(); dialog.showModal(); });
  opener.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); dialog.showModal(); } });
  dialog.addEventListener('click', function (e) {
    if (e.target.closest('[data-menu-close]') || e.target.closest('[data-menu-link]')) dialog.close();
  });
  dialog.addEventListener('close', function () { opener.focus({ preventScroll: true }); });
})();
