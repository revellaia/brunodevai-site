/* WORLDCRAFT · copy (COPY_ID -> texto). Fonte: data/copy.json (08_CONTENT do handoff).
   Regras: nunca inventar texto; TBC nunca renderiza; REVISE_BEFORE_FREEZE/ALTERNATIVE so fora de producao
   ate o Gate 2 congelar (G-003). Status pode ser por idioma: "APPROVED (EN) · TBC (PT)". */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const LANGS = ['pt', 'en'];
export const COPY = JSON.parse(fs.readFileSync(path.join(root, 'data/copy.json'), 'utf8'));

const BLOCKED_ALWAYS = /^TBC/;
const BLOCKED_IN_PRODUCTION = /^(TBC|REVISE_BEFORE_FREEZE|ALTERNATIVE)/;

/* "APPROVED (EN) · TBC (PT)" -> status do idioma pedido; sem marcador de idioma vale para ambos. */
export function statusFor(entry, lang) {
  const parts = String(entry.status || '').split('·').map(s => s.trim()).filter(Boolean);
  const tagged = parts.find(p => new RegExp(`\\((?:[^)]*\\b)?${lang}\\b`, 'i').test(p));
  return (tagged || parts.find(p => !/\((EN|PT)\b/i.test(p)) || parts[0] || '').replace(/\s*\(.*$/, '').trim();
}

export class CopyError extends Error {}

/* stage: 'production' | 'local'. Em 'local' REVISE/ALTERNATIVE renderizam (estudo, nao congelado). */
export function t(id, lang, { stage = 'production' } = {}) {
  const entry = COPY[id];
  if (!entry) throw new CopyError(`COPY_ID inexistente: ${id}`);
  if (!LANGS.includes(lang)) throw new CopyError(`idioma invalido: ${lang}`);
  const value = entry[lang];
  if (typeof value !== 'string' || !value.trim()) throw new CopyError(`${id} sem texto em ${lang} (sem fallback silencioso)`);
  const st = statusFor(entry, lang);
  if (BLOCKED_ALWAYS.test(st)) throw new CopyError(`${id} [${lang}] e TBC: omitir o campo, nunca renderizar`);
  if (stage === 'production' && BLOCKED_IN_PRODUCTION.test(st)) throw new CopyError(`${id} [${lang}] = ${st}: bloqueado em producao ate o Gate 2`);
  return value;
}

/* Para campos TBC: devolve null (o template omite o campo) em vez de lancar. */
export function tOptional(id, lang, opts) {
  try { return t(id, lang, opts); } catch (e) { if (e instanceof CopyError && /TBC|bloqueado/.test(e.message)) return null; throw e; }
}
