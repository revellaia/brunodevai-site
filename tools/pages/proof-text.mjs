/* Apresentacao PT/EN dos dados medidos em src/proof.json. Linha sem evidencia = omitida (nunca inventada).
   Rotulos tecnicos curtos; numeros formatados por idioma. */
const n = (lang, v) => (lang === 'pt' ? String(v).replace('.', ',') : String(v));
const W = {
  en: { video: 'video', videos: 'videos', critical: 'critical', lazy: 'everything else lazy', rest: 'rest lazy', reduced: 'Reduced', save: 'Save data',
        pages: 'pages', vs: 'vs production', leaks: 'leaked secrets', target: 'target', targets: 'targets, not measurements', touch: 'targets ≥ 44px · no lens',
        mobile: 'mobile-portrait 9:16 · 1 critical' },
  pt: { video: 'vídeo', videos: 'vídeos', critical: 'crítico', lazy: 'todo o resto lazy', rest: 'resto lazy', reduced: 'Reduzido', save: 'Economia de dados',
        pages: 'páginas', vs: 'vs produção', leaks: 'segredos vazados', target: 'meta', targets: 'metas, não medições', touch: 'alvos ≥ 44px · sem lente',
        mobile: 'mobile-portrait 9:16 · 1 crítico' },
};

/* Linhas da secao 06 Engineering: [copyKey, valor, fonte, status]. */
export function proofRows(p, lang) {
  const w = W[lang], q = p.qa;
  const rows = [];
  if (q) rows.push(['sys.k.responsive', `${q.viewports.length} viewports · ${q.pages} ${w.pages} · PT/EN · ${q.overflow_max} overflow`, `QA ${q.at.slice(0, 10)} · ${q.harness}`, 'MEASURED']);
  rows.push(['sys.k.loading', `1 ${w.video} ${w.critical} · ${w.lazy}`, 'build templates · QA network log', q ? 'MEASURED' : 'DECLARED']);
  if (q) rows.push(['sys.k.motion', `${w.reduced}: ${q.video_requests.reduced} ${w.video} · ${w.save}: ${q.video_requests.save} ${w.video}`, `QA ${q.at.slice(0, 10)} · network log per mode`, 'MEASURED']);
  rows.push(['sys.k.media', `${n(lang, p.media.tree_mib)} / ${p.media.budget_mib} MiB · gate ${p.media.pass ? 'PASS' : 'FAIL'}`, 'tools/media-budget.mjs', 'MEASURED']);
  const delta = ((p.media.tree_mib - p.baseline.tree_mib) / p.baseline.tree_mib * 100).toFixed(1);
  rows.push(['sys.k.storage', `${n(lang, p.baseline.tree_mib)} → ${n(lang, p.media.tree_mib)} MiB (${n(lang, delta)}%) ${w.vs} ${p.baseline.commit}`, p.baseline.source, 'MEASURED']);
  const sec = [`CSP default-src 'self'`, p.security.xfo ? `XFO ${p.security.xfo}` : null, `${p.security.third_party_origins.length} third-party`];
  if (q && q.secrets) sec.push(`${q.secrets.leaks} ${w.leaks}`);
  rows.push(['sys.k.security', sec.filter(Boolean).join(' · '), `vercel.json${q && q.secrets ? ' · ' + q.secrets.tool : ''}`, 'MEASURED']);
  rows.push(['sys.k.targets', `AA · LCP < ${n(lang, p.targets.lcp_s)} s · CLS < ${n(lang, p.targets.cls)} · INP < ${p.targets.inp_ms} ms`, w.targets, 'TARGET']);
  return rows;
}

/* System Index do hero (desktop e mobile, mobile com menos informacao: SYSTEM_MOBILE). */
export function heroIndex(p, lang, routes) {
  const w = W[lang], q = p.qa;
  const desktop = [
    ['sys.k.media', `${n(lang, p.media.tree_mib)} / ${p.media.budget_mib} MiB · gate ${p.media.pass ? 'PASS' : 'FAIL'}`],
    ['sys.k.loading', `1 ${w.video} ${w.critical} · ${w.rest}`],
    ['sys.k.security', `CSP default-src 'self'${p.security.xfo ? ' · XFO ' + p.security.xfo : ''}`],
    q ? ['sys.k.responsive', `${q.viewports.length} viewports · ${q.overflow_max} overflow`] : null,
    ['sys.k.a11y', `WCAG ${p.targets.wcag} ${w.target}`],
    ['sys.k.routes', routes.join(' · ')],
  ].filter(Boolean);
  const mobile = [
    ['sys.k.media', `${n(lang, p.media.tree_mib)} / ${p.media.budget_mib} MiB · ${p.media.pass ? 'PASS' : 'FAIL'}`],
    ['sys.k.video', w.mobile],
    ['sys.k.security', `CSP 'self'${p.security.xfo ? ' · XFO ' + p.security.xfo : ''}`],
    q ? ['sys.k.responsive', `${q.viewports.length} viewports · ${q.overflow_max} overflow`] : null,
    ['sys.k.touch', w.touch],
  ].filter(Boolean);
  return { desktop, mobile };
}
