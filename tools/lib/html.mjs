/* Template HTML com escape por padrao: todo valor interpolado e escapado, exceto o que vier
   embrulhado em raw() (markup ja construido por outro template). Arrays sao concatenados. */
class Raw { constructor(s) { this.s = String(s); } toString() { return this.s; } }
export const raw = s => new Raw(s);

export function esc(v) {
  return String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function part(v) {
  if (v === null || v === undefined || v === false) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(part).join('');
  return esc(v);
}

export function h(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += part(values[i]) + strings[i + 1];
  return raw(out);
}

/* Divide um texto aprovado em duas linhas (roman / italico) sem alterar o texto.
   marker: { en, pt } e o trecho onde quebrar; mode 'before' mantem o marcador na linha 2. */
export function splitTwo(text, lang, marker, mode = 'before') {
  const m = marker[lang];
  const i = text.indexOf(m);
  if (i < 0) throw new Error(`splitTwo: marcador "${m}" ausente em "${text}"`);
  if (mode === 'after') return [text.slice(0, i + m.length).trim(), text.slice(i + m.length).trim()];
  return [text.slice(0, i).trim(), text.slice(i).trim()];
}
