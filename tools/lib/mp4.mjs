/* BRUNO DEV.AI V3 · duracao REAL de um MP4 lida do proprio arquivo (atomo moov/mvhd: timescale + duration), em segundos.
   Uso: fallback do watchdog da playlist do hero quando o navegador ainda nao tem metadata (rede lenta). Nunca a regra
   normal: a troca normal e o evento 'ended' do filme. */
import fs from 'node:fs';
import path from 'node:path';
import { root } from './deploy-tree.mjs';

const cache = new Map();
export function mp4Duration(urlPath) {
  if (cache.has(urlPath)) return cache.get(urlPath);
  const buf = fs.readFileSync(path.join(root, urlPath.replace(/^\//, '')));
  const at = buf.indexOf('mvhd');
  if (at < 4) throw new Error(`mvhd ausente em ${urlPath}`);
  const v = buf[at + 4];
  const ts = v === 1 ? buf.readUInt32BE(at + 24) : buf.readUInt32BE(at + 16);
  const du = v === 1 ? Number(buf.readBigUInt64BE(at + 28)) : buf.readUInt32BE(at + 20);
  if (!ts || !du) throw new Error(`mvhd invalido em ${urlPath}`);
  const s = +(du / ts).toFixed(2);
  cache.set(urlPath, s);
  return s;
}
