const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { bot, pinterestSearch, addExif } = require('../lib');

const LS_MD = '/tmp/ls';
const LS_FB = path.join(process.cwd(), 'media', 'ls');
const LS_NC = 'nice -n 15';
const LS_FM = `${LS_NC} ffmpeg -y -v error`;
const LS_QS = [50, 43, 36, 29, 22, 15, 8, 1];
const LS_QG = [80, 50, 40, 30, 20, 10, 1];
const LS_ZM = ['application/zip', 'application/x-zip-compressed', 'application/x-zip'];
const LS_EM = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' };

const LS_CL = (v, a, b) => Math.min(b, Math.max(a, v));
const LS_IA = m => m === 'image/gif' || m === 'image/webp' || m.startsWith('video/');
const LS_GE = m => Object.keys(LS_EM).find(k => LS_EM[k] === m) || m.split('/')[1] || 'bin';

class LS_Q {
  constructor() { this.n = 0; this.m = 2; this.q = []; }
  add(t) { return new Promise((rs, rj) => { this.q.push([t, rs, rj]); this.nx(); }); }
  nx() {
    while (this.n < this.m && this.q.length) {
      const [t, rs, rj] = this.q.shift();
      this.n++;
      t().then(rs, rj).finally(() => { this.n--; this.nx(); });
    }
  }
}
const LS_QI = new LS_Q();

let LS_HW = null;
async function LS_HF(c) {
  if (LS_HW === null) {
    try { await fsp.access('/dev/dri/renderD128', fs.constants.R_OK); LS_HW = '-hwaccel vaapi -hwaccel_device /dev/dri/renderD128'; }
    catch { LS_HW = ''; }
  }
  return c.hw ? LS_HW : '';
}

let LS_BS = null;
async function LS_BD() {
  if (LS_BS) return LS_BS;
  try { await fsp.mkdir(LS_MD, { recursive: true }); await fsp.access(LS_MD, fs.constants.W_OK); LS_BS = LS_MD; }
  catch { await fsp.mkdir(LS_FB, { recursive: true }); LS_BS = LS_FB; }
  return LS_BS;
}

const LS_PF = s => {
  const f = {};
  const r = s.replace(/--(fps|time)\s+(\d+)/gi, (_, k, v) => { f[k.toLowerCase()] = +v; return ' '; }).trim();
  return [r, f];
};

const LS_CF = (x, f) => {
  const fps = LS_CL(f.fps || parseInt(x.LS_FPS, 10) || 15, 1, 60);
  const sz = parseInt(x.LS_SIZE, 10) || 256;
  return {
    fps,
    sz,
    t: LS_CL(f.time || parseInt(x.LS_TIME, 10) || 10, 1, 300),
    fl: !!(f.fps || f.time),
    vf: `fps=${fps},scale=${sz}:${sz}`,
    mx: (parseInt(x.LS_MAXKB, 10) || 1024) * 1024,
    qh: parseInt(x.LS_QH, 10) || 99,
    hw: String(x.LS_HWA).toUpperCase() !== 'FALSE',
    uk: x.LS_UK || '',
    tk: x.LS_TK || '',
    tu: x.LS_TU || 'https://g.tenor.com/v1/search',
  };
};

async function LS_FF(i, o, q, a, c) {
  const hw = await LS_HF(c);
  await exec(`${LS_FM} ${hw} ${a ? `-t ${c.t}` : ''} -i "${i}" -vf "${c.vf}" -c:v libwebp -quality ${q} ${a ? '-loop 0 -an' : '-frames:v 1'} "${o}"`);
}

async function LS_GP(i, o, q, c) {
  const p = i.replace(/\.\w+$/, '_pal.png');
  await exec(`${LS_FM} -t ${c.t} -i "${i}" -vf "${c.vf},palettegen=stats_mode=full" "${p}"`);
  await exec(`${LS_FM} -t ${c.t} -i "${i}" -i "${p}" -lavfi "${c.vf} [x]; [x][1:v] paletteuse=dither=bayer" -c:v libwebp_anim -quality ${q} -loop 0 "${o}"`);
  await fsp.unlink(p).catch(() => {});
}

const LS_UM = async (f, m) => { try { return (await fsp.stat(f)).size < m; } catch { return false; } };

async function LS_FQ(fn, o, m, qs = LS_QS) {
  for (const q of qs) { await fn(q); if (await LS_UM(o, m)) return true; }
  return false;
}

async function LS_CG(i, o, c) {
  if (!c.fl) {
    try {
      await exec('which gif2webp');
      if (await LS_FQ(q => exec(`${LS_NC} gif2webp -q ${q} -m 4 -mt -resize ${c.sz} ${c.sz} "${i}" -o "${o}"`), o, c.mx, LS_QG)) return;
    } catch {}
  }
  await LS_FQ(q => LS_GP(i, o, q, c), o, c.mx);
}

async function LS_PS(i, o, c) {
  if (await LS_FQ(q => LS_FF(i, o, q, false, c), o, c.mx, [c.qh])) return;
  await LS_FQ(q => LS_FF(i, o, q, false, c), o, c.mx);
}

async function LS_PM(i, o, mt, c) {
  const a = LS_IA(mt);
  if (!a) await LS_PS(i, o, c);
  else if (mt === 'image/gif') await LS_CG(i, o, c);
  else await LS_FQ(q => LS_FF(i, o, q, true, c), o, c.mx);
  return a;
}

async function LS_CM(u, mt, c) {
  const d = path.join(await LS_BD(), `lss_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  await fsp.mkdir(d, { recursive: true });
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const i = path.join(d, `in.${LS_GE(mt)}`);
    const o = path.join(d, 'out.webp');
    await fsp.writeFile(i, Buffer.from(await r.arrayBuffer()));
    await LS_PM(i, o, mt, c);
    return await fsp.readFile(o);
  } finally { await fsp.rm(d, { recursive: true, force: true }).catch(() => {}); }
}

function LS_GD(q) {
  const m = q.message?.message || q;
  const d = m?.imageMessage ? [m.imageMessage, 'image/jpeg'] : m?.videoMessage ? [m.videoMessage, 'video/mp4'] : null;
  if (d) return { mt: d[0].mimetype || d[1] };
  const mt = m?.documentMessage?.mimetype || '';
  return mt.startsWith('image/') || mt.startsWith('video/') ? { mt } : null;
}

function LS_IZ(q) {
  const d = (q.message?.message || q)?.documentMessage;
  if (!d) return false;
  return LS_ZM.includes(d.mimetype || '') || (d.fileName || d.caption || q.caption || '').toLowerCase().endsWith('.zip');
}

async function LS_HZ(c, q, sn, rp) {
  try { await exec('which unzip'); } catch { return rp('unzip no encontrado'); }
  const bf = await q.downloadMediaMessage();
  if (!bf) return rp('Error descarga');
  const w = path.join(await LS_BD(), `lsz_${Date.now()}`);
  const z = path.join(w, 'in.zip');
  const x = path.join(w, 'ex');
  try {
    await fsp.mkdir(x, { recursive: true });
    await fsp.writeFile(z, bf);
    await exec(`unzip -o -q "${z}" -d "${x}"`);
    const fl = (await exec(`find "${x}" -type f | sort`)).stdout.split('\n').filter(Boolean);
    let n = 0;
    for (const f of fl) {
      const mt = LS_EM[path.extname(f).slice(1).toLowerCase()];
      if (!mt) continue;
      const o = path.join(w, `out_${n}.webp`);
      try { const a = await LS_PM(f, o, mt, c); await sn(await fsp.readFile(o), a); n++; } catch {}
    }
    if (!n) await rp('Sin imagenes o videos validos en zip');
  } finally { await fsp.rm(w, { recursive: true, force: true }).catch(() => {}); }
}

async function LS_RN(message, q, qt, c, rp) {
  try { await exec('ffmpeg -version'); } catch { return rp('FFmpeg no encontrado'); }
  let fq = true;
  const sn = async (b, a) => {
    const x = { isAnimated: a };
    if (fq) { x.quoted = message.quoted; fq = false; }
    await message.send(await addExif(b, '', message.id), x, 'sticker');
  };
  if (qt) {
    const d = LS_GD(qt);
    if (!d) return LS_IZ(qt) ? LS_HZ(c, qt, sn, rp) : rp('No es imagen, video ni zip');
    const bf = await qt.downloadMediaMessage();
    if (!bf) return rp('Error descarga');
    const b = await LS_BD();
    const t = Date.now();
    const i = path.join(b, `lss_in_${t}.${LS_GE(d.mt)}`);
    const o = path.join(b, `lss_out_${t}.webp`);
    try {
      await fsp.writeFile(i, bf);
      const a = await LS_PM(i, o, d.mt, c);
      return await sn(await fsp.readFile(o), a);
    } finally { await Promise.all([i, o].map(p => fsp.unlink(p).catch(() => {}))); }
  }
  const J = u => fetch(u, { signal: AbortSignal.timeout(15000) }).then(r => r.json());
  const e = encodeURIComponent(q);
  const [uR, gR, pR] = await Promise.allSettled([
    c.uk ? J(`https://api.unsplash.com/search/photos?query=${e}&client_id=${c.uk}&per_page=10&page=1`) : 0,
    c.tk ? J(`${c.tu}?key=${c.tk}&q=${e}&limit=10`) : 0,
    pinterestSearch(q),
  ]);
  const ph = (uR.value?.results || []).map(p => p.urls.regular);
  const gf = (gR.value?.results || []).map(g => { const m = g.media?.[0] || g.media_formats || {}; return m.mp4?.url || m.tinygif?.url || m.gif?.url; }).filter(Boolean);
  const pn = (pR.value || []).slice(0, 10);
  if (!ph.length && !gf.length && !pn.length) return rp('Sin resultados: ' + q);
  const jb = [
    ...ph.map(u => [u, 'image/jpeg']),
    ...gf.map(u => [u, u.includes('.mp4') ? 'video/mp4' : 'image/gif']),
    ...pn.map(u => [u, 'image/jpeg']),
  ];
  for (const [u, mt] of jb) {
    try { await sn(await LS_CM(u, mt, c), LS_IA(mt)); } catch {}
  }
}

bot({
  pattern: 'ls ?(.*)',
  fromMe: true,
  desc: 'Sticker search',
  type: 'sticker',
}, async (message, match, ctx) => {
  const x = ctx || {};
  const [q, f] = LS_PF((match || '').trim());
  const c = LS_CF(x, f);
  LS_QI.m = parseInt(x.MAXSOLICITUD, 10) || 2;
  const rp = t => message.send(t, { quoted: message.quoted });
  const qt = message.reply_message;
  if (!q && !qt) return rp('Uso: ls <busqueda> | responder a media o zip | --fps N --time N');
  return LS_QI.add(() => LS_RN(message, q, qt, c, rp));
});

module.exports = {};
