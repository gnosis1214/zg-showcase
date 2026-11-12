// Rebuilds the gallery cards in index.html and the page list in README.md
// from showcases.json. Run: npm run build   (or: node scripts/build.mjs --check)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');

export function loadShowcases() {
  const list = JSON.parse(read('showcases.json'));
  // Newest first: date, then pm before am.
  return [...list].sort((a, b) => (b.date + b.slot).localeCompare(a.date + a.slot));
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtDate = (iso) => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function card(s) {
  const [c1, c2, c3] = s.palette;
  const tech = s.techniques.slice(0, 4).map((t) => `<li>${esc(t)}</li>`).join('');
  return `    <a class="zg-card" href="pages/${esc(s.file)}" data-type="${s.type === 'product' ? 'product' : 'other'}" style="--c1:${esc(c1)};--c2:${esc(c2)};--c3:${esc(c3)}">
      <div class="zg-card__art"><small>${esc(s.category)}</small><span>${esc(s.brand)}</span></div>
      <div class="zg-card__body">
        <div class="zg-card__meta"><span>${s.type === 'product' ? 'Product showcase' : 'Landing page'}</span><span>${fmtDate(s.date)}</span></div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.summary)}</p>
        <ul>${tech}</ul>
      </div>
      <span class="zg-card__go" aria-hidden="true">&#8599;</span>
    </a>`;
}

function readmeRow(s) {
  return `| ${s.date} ${s.slot} | [${s.title}](pages/${s.file}) | ${s.category} | ${s.techniques.slice(0, 3).join(', ')} |`;
}

function between(src, start, end, body, file) {
  const a = src.indexOf(start);
  const b = src.indexOf(end);
  if (a < 0 || b < a) throw new Error(`Markers ${start} / ${end} missing in ${file}`);
  return src.slice(0, a + start.length) + '\n' + body + (body ? '\n' : '') + src.slice(b);
}

export function render() {
  const list = loadShowcases();
  let index = read('index.html');
  index = between(index, '<!-- zg:cards:start -->', '<!-- zg:cards:end -->', list.map(card).join('\n'), 'index.html');
  index = index.replace(/<!-- zg:count -->\d+<!-- \/zg:count -->/, `<!-- zg:count -->${list.length}<!-- /zg:count -->`);

  let readme = read('README.md');
  const table = list.length
    ? ['| Date | Page | Category | Highlights |', '|---|---|---|---|', ...list.map(readmeRow)].join('\n')
    : '_No pages yet._';
  readme = between(readme, '<!-- zg:list:start -->', '<!-- zg:list:end -->', table, 'README.md');
  return { index, readme };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { index, readme } = render();
  if (process.argv.includes('--check')) {
    const stale = [];
    if (index !== read('index.html')) stale.push('index.html');
    if (readme !== read('README.md')) stale.push('README.md');
    if (stale.length) {
      console.error(`Out of date: ${stale.join(', ')}. Run npm run build.`);
      process.exit(1);
    }
    console.log('Gallery and README are up to date.');
  } else {
    writeFileSync(join(root, 'index.html'), index);
    writeFileSync(join(root, 'README.md'), readme);
    console.log(`Built gallery with ${loadShowcases().length} page(s).`);
  }
}
