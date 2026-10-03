/* BRUNO DEV.AI V3 · contact.js — UM fluxo comercial, muitos CTAs (motor V2 preservado em assets/contact-flow.js).
   Links diretos de WhatsApp/e-mail passam a usar as MESMAS URLs do fluxo existente;
   sem JS ficam os hrefs estaticos (wa.me e mailto). */
(function () {
  'use strict';
  var flow = window.BrunoContactFlow;
  var lang = /^en/i.test(document.documentElement.lang) ? 'en' : 'pt';
  if (!flow) return;
  [].forEach.call(document.querySelectorAll('[data-cf-wa]'), function (a) { a.href = flow.whatsappUrl(lang, ''); });
  [].forEach.call(document.querySelectorAll('[data-cf-mail]'), function (a) { a.href = flow.mailtoUrl(lang, ''); });
})();
