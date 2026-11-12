// Checks every page against the rules in PLAYBOOK.md. Run: npm test
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

const ALLOWED_HOSTS = new Set([
  'cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com',
  'fonts.googleapis.com', 'fonts.gstatic.com',
  'zana-g.com', 'www.w3.org',
]);
const SCRIPT_HOSTS = new Set(['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com']);
const PINNED = /(@\d+\.\d+\.\d+)|(\/\d+\.\d+\.\d+\/)/;
const REQUIRED_FIELDS = ['file', 'date', 'slot', 'type', 'brand', 'title', 'category', 'summary', 'palette', 'techniques'];
const MAX_BYTES = 400 * 1024;

// 1. Manifest and files agree.
let list = [];
try {
  list = JSON.parse(readFileSync(join(root, 'showcases.json'), 'utf8'));
} catch (e) {
  fail('showcases.json', `invalid JSON (${e.message})`);
}
const files = readdirSync(join(root, 'pages')).filter((f) => f.endsWith('.html'));
const listed = new Set();
for (const s of list) {
  for (const k of REQUIRED_FIELDS) if (s[k] === undefined || s[k] === '') fail('showcases.json', `${s.file || '?'} is missing "${k}"`);
  if (!/^\d{4}-\d{2}-\d{2}-(am|pm)-[a-z0-9-]+\.html$/.test(s.file || '')) fail('showcases.json', `bad file name "${s.file}" (want YYYY-MM-DD-am|pm-slug.html)`);
  if (!['am', 'pm'].includes(s.slot)) fail('showcases.json', `${s.file}: slot must be am or pm`);
  if (!['product', 'other'].includes(s.type)) fail('showcases.json', `${s.file}: type must be product or other`);
  if (!Array.isArray(s.palette) || s.palette.length !== 3 || !s.palette.every((c) => /^#[0-9a-f]{6}$/i.test(c))) fail('showcases.json', `${s.file}: palette needs 3 hex colours`);
  if (listed.has(s.file)) fail('showcases.json', `${s.file} is listed twice`);
  listed.add(s.file);
  if (!files.includes(s.file)) fail('showcases.json', `${s.file} has no file in pages/`);
}
for (const f of files) if (!listed.has(f)) fail(`pages/${f}`, 'not listed in showcases.json');

// 2. Each page opens from disk and follows the playbook.
for (const f of files) {
  const path = join(root, 'pages', f);
  const name = `pages/${f}`;
  const html = readFileSync(path, 'utf8');
  if (statSync(path).size > MAX_BYTES) fail(name, `larger than ${MAX_BYTES / 1024} KB`);
  if (!/^<!doctype html>/i.test(html.trimStart())) fail(name, 'missing <!doctype html>');
  if (!/<html lang="[a-z-]+"/.test(html)) fail(name, 'missing <html lang>');
  if (!/<meta name="viewport"/.test(html)) fail(name, 'missing viewport meta');
  if (!/<title>[^<]{10,}<\/title>/.test(html)) fail(name, 'missing or short <title>');
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) fail(name, 'missing or short meta description');
  if (!html.includes('prefers-reduced-motion')) fail(name, 'no prefers-reduced-motion handling');
  if (!html.includes('data-zg-concept')) fail(name, 'no fictional-brand notice (data-zg-concept)');
  if (!html.includes('href="../index.html"')) fail(name, 'no link back to ../index.html');
  if (/(?:href|src|action)="\/(?!\/)/.test(html)) fail(name, 'root-relative URL breaks when opened from disk');
  if (/fetch\(\s*['"`](?!https:)/.test(html)) fail(name, 'fetch() of a local file is blocked from disk');
  if (/<script[^>]+type="module"[^>]+src="(?!https:)/.test(html)) fail(name, 'local module script is blocked from disk; inline it');
  if (/<img[^>]+src="(?!data:|https:)/.test(html)) fail(name, 'local image file: inline it as SVG or data URI');
  if (/console\.log\(/.test(html)) fail(name, 'leftover console.log');

  for (const m of html.matchAll(/https?:\/\/[^\s"'`)<>]+/g)) {
    const url = m[0];
    let host;
    try { host = new URL(url).host; } catch { fail(name, `bad URL ${url}`); continue; }
    if (url.startsWith('http://') && host !== 'www.w3.org') fail(name, `insecure URL ${url}`);
    if (!ALLOWED_HOSTS.has(host)) fail(name, `host not allowed: ${host}`);
    const isLib = SCRIPT_HOSTS.has(host) && !url.endsWith('/');
    if (isLib && !PINNED.test(url)) fail(name, `library URL not pinned to an exact version: ${url}`);
  }

  for (const [i, block] of [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].entries()) {
    const css = block[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/"[^"]*"|'[^']*'/g, '');
    let depth = 0;
    for (const ch of css) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth < 0) break;
    }
    if (depth !== 0) fail(name, `<style> block ${i + 1} has unbalanced braces`);
  }
}

// 3. Gallery and README are in sync with the manifest.
try {
  const { index, readme } = render();
  if (index !== readFileSync(join(root, 'index.html'), 'utf8')) fail('index.html', 'out of date, run npm run build');
  if (readme !== readFileSync(join(root, 'README.md'), 'utf8')) fail('README.md', 'out of date, run npm run build');
} catch (e) {
  fail('build', e.message);
}

if (errors.length) {
  console.error(errors.map((e) => `  x ${e}`).join('\n'));
  console.error(`\n${errors.length} problem(s).`);
  process.exit(1);
}
console.log(`OK: ${files.length} page(s) checked.`);
