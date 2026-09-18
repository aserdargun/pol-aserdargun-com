#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 * check-ui.mjs — three independent checks on the presentation layer.
 *
 *  0. identity: the title and the favicon are the app's fixed identity in the
 *     portfolio. index.html may not rename the app, app.js may not drift away
 *     from it, and the icon must be a self-contained SVG that the artifact
 *     actually ships.
 *
 *  1. highlighter: every snippet is rendered through the tokenizer and the
 *     output is checked for balanced spans and fully escaped text (this is
 *     what keeps innerHTML honest).
 *  2. real browser: headless Chrome loads index.html for several routes and
 *     the rendered DOM is inspected, which catches any runtime error in the
 *     app (a thrown error leaves #app empty).
 *
 * Usage: node tools/check-ui.mjs [--shots]
 * ------------------------------------------------------------------------- */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.argv.includes('--shots');
const problems = [];

/* ---------------------------- 0. identity -------------------------------- */
/* The portfolio convention: every app is titled "<CODE> - <App name>" and
   ships the same icon set, drawn in the same palette. Both live here so a
   rename cannot land in one place, and so the app cannot quietly stop
   looking like the rest of the domain. */
const IDENTITY = {
  title: 'POL - Programming Languages',
  /* file name → the link index.html must carry for it */
  icons: [
    { file: 'favicon.svg', rel: 'icon', attrs: 'type="image/svg+xml"' },
    { file: 'icon.png', rel: 'icon', attrs: 'type="image/png" sizes="180x180"' },
    { file: 'apple-icon.png', rel: 'apple-touch-icon', attrs: 'sizes="180x180"' }
  ],
  family: { background: '#121310', accent: '#c8ff36' },
  pngSize: 180
};
const hrefOf = (tag) => ((tag.match(/href="([^"]+)"/) || [])[1] || '');
/* Match by file name so an absolute or remote href is still recognised as the
   declaration of that icon — and then reported for being absolute. */
const iconFileOf = (tag) => hrefOf(tag).split('/').pop();

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const titleTag = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
if (titleTag !== IDENTITY.title) {
  problems.push(`index.html title is ${JSON.stringify(titleTag)}, expected ${JSON.stringify(IDENTITY.title)}`);
}

/* Each icon of the set must be declared, relatively, with the attributes the
   family uses: a declaration that drifts is how a tab silently falls back to
   the default globe. */
const linkTags = html.match(/<link[^>]*rel="[^"]*icon[^"]*"[^>]*>/g) || [];
for (const icon of IDENTITY.icons) {
  const tag = linkTags.find((t) => iconFileOf(t) === icon.file);
  if (!tag) {
    problems.push(`index.html does not link ${icon.file}`);
    continue;
  }
  const href = hrefOf(tag);
  if (!href || href.startsWith('/') || /^[a-z]+:/i.test(href)) {
    problems.push(`${icon.file}: the href must be relative to index.html, found ${JSON.stringify(href)}`);
  } else if (!fs.existsSync(path.resolve(ROOT, href))) {
    problems.push(`${icon.file}: the link points at a file that does not exist`);
  }
  if ((tag.match(/rel="([^"]+)"/) || [])[1] !== icon.rel) {
    problems.push(`${icon.file}: rel is not ${JSON.stringify(icon.rel)} — ${tag}`);
  }
  for (const attr of icon.attrs.split(' ')) {
    if (!tag.includes(attr)) problems.push(`${icon.file}: the link is missing ${attr} — ${tag}`);
  }
}

/* The icon is the whole app in a tab: it renders offline, with no script, no
   network reference and no raster payload, in the family palette. */
const iconPath = path.join(ROOT, 'favicon.svg');
if (!fs.existsSync(iconPath)) {
  problems.push('favicon.svg is missing');
} else {
  const svg = fs.readFileSync(iconPath, 'utf8');
  if (!/^\s*(<\?xml[^>]*\?>\s*)?<svg[\s>]/.test(svg)) problems.push('favicon.svg: not an SVG document');
  if (!/viewBox="/.test(svg)) problems.push('favicon.svg: no viewBox, it will not scale');
  for (const [what, re] of [['a <script> element', /<script/i], ['an external reference', /(xlink:)?href="(?!#)/i],
    ['a raster payload', /data:image\/(png|jpe?g|gif|webp)/i], ['an embedded font', /@font-face/i]]) {
    if (re.test(svg)) problems.push(`favicon.svg: contains ${what}`);
  }
  if (/<image[\s>]/i.test(svg)) problems.push('favicon.svg: contains a raster <image>');
  for (const [what, hex] of Object.entries(IDENTITY.family)) {
    if (!svg.includes(hex)) problems.push(`favicon.svg: does not use the family ${what} colour ${hex}`);
  }
}

/* The raster fallbacks must be the same square the family ships, or a device
   that ignores the SVG gets a differently sized icon. */
for (const icon of IDENTITY.icons.filter((i) => i.file.endsWith('.png'))) {
  const file = path.join(ROOT, icon.file);
  if (!fs.existsSync(file)) {
    problems.push(`${icon.file} is missing`);
    continue;
  }
  const buf = fs.readFileSync(file);
  if (buf.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    problems.push(`${icon.file}: not a PNG`);
    continue;
  }
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  if (w !== IDENTITY.pngSize || h !== IDENTITY.pngSize) {
    problems.push(`${icon.file} is ${w}x${h}, the family ships ${IDENTITY.pngSize}x${IDENTITY.pngSize}`);
  }
}

/* app.js rewrites document.title on every route, so it must not be able to
   disagree with the static document it was loaded from. */
const js = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const jsTitle = (js.match(/const TITLE = '([^']*)'/) || [])[1];
if (jsTitle !== IDENTITY.title) {
  problems.push(`app.js TITLE is ${JSON.stringify(jsTitle)}, expected ${JSON.stringify(IDENTITY.title)}`);
}
if (!/document\.title = TITLE;/.test(js)) {
  problems.push('app.js sets document.title from something other than TITLE');
}

console.log(`identity: title ${JSON.stringify(titleTag)}, icons ${IDENTITY.icons.map((i) => i.file).join(' + ')}`);

/* ------------------------- 1. the highlighter ---------------------------- */
const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const f of fs.readdirSync(path.join(ROOT, 'data')).filter((f) => f.endsWith('.js'))) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'), sandbox, { filename: f });
}
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/highlight.js'), 'utf8'), sandbox, { filename: 'highlight.js' });
const W = sandbox.window;
const tasks = Object.keys(W).filter((k) => k.startsWith('RECIPES_')).flatMap((k) => W[k]);

let checked = 0;
for (const task of tasks) {
  for (const [lang, s] of Object.entries(task.snippets)) {
    if (s.na) continue;
    const html = W.highlightCode(s.code, lang);
    checked++;

    const open = (html.match(/<span class="tok-/g) || []).length;
    const close = (html.match(/<\/span>/g) || []).length;
    if (open !== close) problems.push(`${task.id}/${lang}: ${open} spans opened, ${close} closed`);

    const stripped = html.replace(/<\/?span[^>]*>/g, '');
    if (stripped.includes('<') || stripped.includes('>')) problems.push(`${task.id}/${lang}: raw angle bracket leaked`);
    const amp = stripped.match(/&(?!(amp|lt|gt|quot|#39);)/g);
    if (amp) problems.push(`${task.id}/${lang}: ${amp.length} unescaped ampersand(s)`);

    /* the text content must be identical to the source: nothing gained or lost */
    const text = stripped
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    if (text !== s.code) problems.push(`${task.id}/${lang}: highlighting changed the text`);
  }
}
console.log(`highlighter: ${checked} snippets tokenized, ${problems.length} problem(s)`);

/* --------------------------- 2. real browser ----------------------------- */
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const routes = [
  { hash: '#/', expect: [IDENTITY.title, 'Fifteen ways to write the same program', 'Prolog', 'Capability matrix'] },
  { hash: '#/tasks', expect: ['Conditionals and loops', 'Graph reachability'] },
  { hash: '#/task/graph', expect: ['reachable=b,c,d,e', 'Warshall', 'recursive CTE'] },
  { hash: '#/task/factorial', expect: ['factorial(5)=120', 'Datalog'] },
  { hash: '#/task/hof', expect: ['Not expressible in this language', 'sum=10'] },
  { hash: '#/languages', expect: ['Datalog', 'Machine'] },
  { hash: '#/language/python', expect: ['The twelve axes', 'average ceremony', 'duck'] },
  { hash: '#/concepts', expect: ['Fundamentals', 'sum types'] },
  { hash: '#/concept/types', expect: ['How much is inferred', 'Generics'] },
  { hash: '#/concept/universals', expect: ['The eight things every language here has'] },
  { hash: '#/matrix', expect: ['Capability matrix', 'Guaranteed tail calls', 'not applicable by design'] },
  { hash: '#/compare?langs=python,rust', expect: ['Compare', 'Same task, side by side', 'borrow'] },
  { hash: '#/search?q=backtracking', expect: ['matches for', 'backtrack'] }
];

if (!fs.existsSync(CHROME)) {
  console.log('chrome not found — skipped the browser check');
} else {
  const outDir = path.join(ROOT, '.shots');
  if (shots) fs.mkdirSync(outDir, { recursive: true });

  for (const route of routes) {
    const url = 'file://' + path.join(ROOT, 'index.html') + route.hash;
    const args = ['--headless', '--disable-gpu', '--virtual-time-budget=4000', '--dump-dom', url];
    let dom = '';
    try {
      dom = execFileSync(CHROME, args, { stdio: 'pipe', timeout: 60000 }).toString();
    } catch (e) {
      problems.push(`${route.hash}: chrome failed — ${String(e.message).slice(0, 200)}`);
      continue;
    }
    const app = (dom.match(/<main id="app">([\s\S]*)<\/main>/) || [])[1] || '';
    const text = app.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length < 200) {
      problems.push(`${route.hash}: #app is essentially empty (${text.length} chars) — a script error?`);
    }
    for (const needle of route.expect) {
      if (!dom.includes(needle)) problems.push(`${route.hash}: expected to find ${JSON.stringify(needle)}`);
    }
    console.log(`browser: ${route.hash.padEnd(28)} ${String(text.length).padStart(6)} chars of text rendered`);

    if (shots) {
      const name = (route.hash.replace(/[#/?=,&]/g, '_').replace(/^_+/, '') || 'overview') + '.png';
      execFileSync(CHROME, ['--headless', '--disable-gpu', '--virtual-time-budget=4000',
        '--window-size=1400,1200', `--screenshot=${path.join(outDir, name)}`, url],
        { stdio: 'pipe', timeout: 60000 });
    }
  }
  if (shots) console.log('screenshots written to ' + outDir);
}

if (problems.length) {
  console.log('\n--- PROBLEMS ---');
  for (const p of problems.slice(0, 40)) console.log('  ' + p);
  process.exit(1);
}
console.log('\nno problems found');
