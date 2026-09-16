// Section 12 self-check on the built site. Run after `npm run build`: node scripts/selfcheck.mjs
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const menu = JSON.parse(await readFile(join(root, 'src/data/menu.json'), 'utf8'));

async function files(dir, exts) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(p, exts)));
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

// Visible text plus alt, aria-label, title, meta content and JSON-LD.
function visible(html) {
  const attrs = [...html.matchAll(/\s(?:alt|aria-label|title|content|placeholder)="([^"]*)"/g)].map((m) => m[1]);
  const jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, (s) => s.replace(/<[^>]+>/g, ' '))
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
  return [text, ...attrs, ...jsonld].join('\n');
}

const BANNED = ['Willkommen bei', 'Genuss', 'Genusserlebnis', 'Geschmackserlebnis', 'Gaumenfreude', 'mit Liebe gemacht', 'mit Leidenschaft', 'Tauchen Sie ein', 'unvergesslich', 'einzigartig', 'authentisch', 'die besten Döner', 'Qualität, die man schmeckt', 'kulinarische Reise', 'Entdecke', 'Premium', 'Erlebnis'];

// Dish and category names come from the owner's price list, not from copy written for this site.
// Scanning them for marketing language only produces false positives (e.g. "Premium Pommes").
const MENUNAMEN = [
  ...menu.kategorien.map((k) => k.name),
  ...menu.kategorien.flatMap((k) => k.artikel.map((a) => a.name)),
].sort((a, b) => b.length - a.length);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ohneMenuNamen = (text) => MENUNAMEN.reduce((t, n) => t.replaceAll(n, ' '), text);

// A <link> only costs a request for rel values the browser actually fetches. Metadata rels such as
// canonical never leave the page, so counting them hid the real third-party requests in the noise.
const REL_OHNE_REQUEST = new Set(['canonical', 'alternate', 'author', 'license', 'next', 'prev', 'me']);
function istLadeRequest(tag) {
  if (!/^<link/i.test(tag)) return true;
  const rel = tag.match(/\srel="([^"]*)"/i)?.[1].trim().toLowerCase();
  // Unknown rel counts as a request: for a privacy check, err towards reporting.
  return !rel || !rel.split(/\s+/).every((r) => REL_OHNE_REQUEST.has(r));
}

const html = await files(join(root, 'dist'), ['.html']);
const css = [...(await files(join(root, 'dist'), ['.css'])), ...(await files(join(root, 'src'), ['.css', '.astro']))];
const js = await files(join(root, 'dist'), ['.js']);
const results = {};
const add = (k, v) => (results[k] ??= []).push(v);

let allText = '';
for (const f of html) {
  const raw = await readFile(f, 'utf8');
  const t = visible(raw);
  const rel = f.slice(root.length);
  allText += t;
  for (const m of t.matchAll(/.{0,30}[–—].{0,30}/g)) add('1 Gedankenstriche', `${rel}: ${m[0]}`);
  for (const m of raw.matchAll(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu)) add('2 Emoji', `${rel}: ${m[0]}`);
  const tOhneNamen = ohneMenuNamen(t);
  for (const w of BANNED)
    for (const m of tOhneNamen.matchAll(new RegExp(`.{0,25}${esc(w)}.{0,25}`, 'gi'))) add('5 Verbotene Wörter', `${rel}: ${m[0].trim()}`);
  for (const m of t.matchAll(/.{0,20}(lorem|TODO|fehlt noch|\[[^\]\n]{2,40}\]).{0,50}/gi)) add('6 Platzhalter', `${rel}: ${m[0].trim()}`);
  for (const m of raw.matchAll(/(?:src|href)="(https?:\/\/[^"/]+)/g)) add('7 Externe Ziele (nur Links, keine Requests)', `${rel}: ${m[1]}`);
  for (const m of raw.matchAll(/<(?:script|link|img|iframe)[^>]+(?:src|href)="https?:\/\/[^"]+"[^>]*>?/g))
    if (istLadeRequest(m[0])) add('7 Externe Requests beim Laden', `${rel}: ${m[0]}`);
  for (const m of t.matchAll(/.{0,30}!.{0,10}/g)) add('Ausrufezeichen', `${rel}: ${m[0]}`);
  if (/Sie\b|Ihnen\b|Ihre?\b/.test(t)) for (const m of t.matchAll(/.{0,30}\b(Sie|Ihnen|Ihre?)\b.{0,30}/g)) add('9 Sie-Form', `${rel}: ${m[0]}`);
}
for (const f of css) {
  const raw = await readFile(f, 'utf8');
  if (/gradient/i.test(raw)) add('3 gradient', f.slice(root.length));
  for (const m of raw.matchAll(/border-radius:\s*([^;}"]+)/g)) if (!/^(0|[1-4]px)\s*$/.test(m[1].trim())) add('4 border-radius > 4px', `${f.slice(root.length)}: ${m[0]}`);
}

// 8: homepage "ab" prices vs menu.json
const home = await readFile(join(root, 'dist/index.html'), 'utf8');
const fmt = (n) => `${n.toFixed(2).replace('.', ',')} €`;
for (const id of ['doener', 'pizza', 'falafel']) {
  const k = menu.kategorien.find((c) => c.id === id);
  const min = Math.min(...k.artikel.flatMap((a) => a.preise.map((p) => p.preis)));
  const shown = [...home.matchAll(new RegExp(`href="/speisekarte/#${id}"`, 'g'))].length > 0;
  const ok = home.includes(`ab ${fmt(min)}`);
  add('8 ab-Preise', `${k.name}: menu.json min ${fmt(min)}, auf Startseite ${ok && shown ? 'korrekt' : 'FEHLT/FALSCH'}`);
}

const jsBytes = (await Promise.all(js.map((f) => readFile(f)))).reduce((s, b) => s + b.length, 0);
add('JS gesamt', `${js.length} Datei(en), ${jsBytes} Bytes`);

for (const k of ['1 Gedankenstriche', '2 Emoji', '3 gradient', '4 border-radius > 4px', '5 Verbotene Wörter', '6 Platzhalter', '7 Externe Requests beim Laden', '7 Externe Ziele (nur Links, keine Requests)', '8 ab-Preise', '9 Sie-Form', 'Ausrufezeichen', 'JS gesamt']) {
  const v = results[k] ?? [];
  const uniq = [...new Set(v)];
  console.log(`\n## ${k}: ${v.length} Treffer`);
  uniq.slice(0, 40).forEach((x) => console.log('  ' + x.replace(/\s+/g, ' ')));
}
