/* ---------------------------------------------------------------------------
 * site.test.mjs — smoke tests for the shipped static site.
 *
 * Built-in runner only (node --test + node:assert/strict), so the project
 * stays a zero-dependency static site. These tests read the real files in the
 * repository: nothing is mocked and nothing is assumed.
 *
 * Run: npm test        (or npm run check, which adds the artifact contract)
 * ------------------------------------------------------------------------- */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = p => fs.existsSync(path.join(ROOT, p));

const html = read('index.html');
const SITE_URL = 'https://pol.aserdargun.com/';
const APP_TITLE = 'POL - Programming Languages';

/* ------------------------------ tiny helpers ----------------------------- */

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`));
  return m ? m[1] : null;
};

const tags = name => html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];

/** Meta lookup by property= (Open Graph) or name= (description, Twitter). */
const meta = key => {
  for (const tag of tags('meta')) {
    if (attr(tag, 'property') === key || attr(tag, 'name') === key) {
      return attr(tag, 'content');
    }
  }
  return null;
};

const title = (html.match(/<title>([^<]*)<\/title>/) || [, ''])[1].trim();
const description = meta('description');
const lang = attr((html.match(/<html\b[^>]*>/) || [''])[0], 'lang');

/** Local hrefs/srcs: skips fragments, absolute URLs and non-file schemes. */
const localRefs = () => {
  const out = [];
  for (const tag of [...tags('script'), ...tags('link'), ...tags('a')]) {
    for (const name of ['src', 'href']) {
      const value = attr(tag, name);
      if (!value) continue;
      if (/^(#|https?:|mailto:|data:|javascript:)/i.test(value)) continue;
      out.push(value);
    }
  }
  return out;
};

/* ------------------------- 1. the data the page loads -------------------- */

const dataRefs = tags('script')
  .map(tag => attr(tag, 'src'))
  .filter(src => src && src.startsWith('data/'));

/* Evaluated the way the browser does it: one window, every data file in turn.
 * Done lazily and defensively so a missing or broken data file is reported as
 * a failing test rather than crashing the whole file before it runs. */
let cache = null;
function loadData() {
  if (cache) return cache;
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  let error = null;
  for (const src of dataRefs) {
    try {
      vm.runInContext(read(src), sandbox, { filename: src });
    } catch (err) {
      error = err;
      break;
    }
  }
  cache = { W: sandbox.window, error };
  return cache;
}

test('every data file the page loads exists and evaluates without throwing', () => {
  assert.ok(dataRefs.length >= 8, `index.html loads ${dataRefs.length} data files`);
  for (const src of dataRefs) {
    assert.ok(exists(src), `${src} is referenced by index.html but does not exist`);
  }
  const { error } = loadData();
  assert.equal(error, null, error && `a data file failed to evaluate: ${error.message}`);
});

test('every data file on disk is actually loaded by the page', () => {
  const onDisk = fs.readdirSync(path.join(ROOT, 'data')).filter(f => f.endsWith('.js'));
  for (const f of onDisk) {
    assert.ok(dataRefs.includes(`data/${f}`), `data/${f} exists but no <script> loads it`);
  }
});

test('each data file contributes at least one global to window', () => {
  for (const src of dataRefs) {
    if (!exists(src)) continue; // reported by the test above
    const local = { window: {}, console };
    vm.createContext(local);
    vm.runInContext(read(src), local, { filename: src });
    assert.ok(
      Object.keys(local.window).length > 0,
      `${src} defines nothing on window, so the app cannot read it`
    );
  }
});

test('the loaded corpus is the one the README describes: 15 languages, 13 tasks', () => {
  const { W, error } = loadData();
  assert.equal(error, null, error && `the corpus could not be loaded: ${error.message}`);
  assert.equal(W.LANGUAGES.length, 15);
  assert.equal(W.LANGUAGE_ORDER.length, 15);
  assert.equal(new Set(W.LANGUAGE_ORDER).size, 15, 'language ids must be unique');
  const tasks = Object.keys(W).filter(k => k.startsWith('RECIPES_')).flatMap(k => W[k]);
  assert.equal(tasks.length, 13);
  assert.equal(new Set(tasks.map(t => t.id)).size, 13, 'task ids must be unique');
  for (const t of tasks) {
    assert.ok(t.prompt, `${t.id}: no prompt`);
    assert.ok(t.takeaway, `${t.id}: no takeaway`);
    assert.ok(Object.keys(t.snippets || {}).length >= 5, `${t.id}: fewer than five languages`);
  }
});

/* --------------------------- 2. asset references ------------------------- */

test('every local src/href in index.html resolves to a file that exists', () => {
  const refs = localRefs();
  assert.ok(refs.length >= 8, `only ${refs.length} local references found`);
  for (const ref of new Set(refs)) {
    assert.ok(exists(ref), `index.html points at ${ref}, which does not exist`);
  }
});

test('no reference is absolute, so the artifact stays relocatable', () => {
  for (const tag of [...tags('script'), ...tags('link'), ...tags('a')]) {
    for (const name of ['src', 'href']) {
      const value = attr(tag, name);
      if (value) {
        assert.ok(!value.startsWith('/'), `absolute ${name}="${value}" breaks under a subpath`);
      }
    }
  }
});

test('the noscript fallback still points at the language catalog', () => {
  const noscript = (html.match(/<noscript>[\s\S]*?<\/noscript>/) || [''])[0];
  assert.ok(noscript, 'the <noscript> fallback is gone');
  assert.match(noscript, /href="programming-languages\.md"/);
  assert.ok(exists('programming-languages.md'));
});

/* ------------------------------ 3. head metadata ------------------------- */

test('<html lang> is present and correct', () => {
  assert.equal(lang, 'en');
});

test('the page has a non-empty <title> in the portfolio naming convention', () => {
  assert.equal(title, APP_TITLE);
});

test('the page has a non-empty meta description', () => {
  assert.ok(description, 'no meta description');
  assert.ok(description.length > 50, `meta description is too short: ${description}`);
});

test('the canonical link is the production address', () => {
  const link = tags('link').find(t => attr(t, 'rel') === 'canonical');
  assert.ok(link, 'no <link rel="canonical">');
  assert.equal(attr(link, 'href'), SITE_URL);
});

test('Open Graph metadata mirrors the page it describes', () => {
  assert.equal(meta('og:type'), 'website');
  assert.equal(meta('og:title'), title);
  assert.equal(meta('og:description'), description);
  assert.equal(meta('og:url'), SITE_URL);
  assert.ok(meta('og:site_name'), 'no og:site_name');
});

test('Twitter card metadata mirrors the page it describes', () => {
  assert.equal(meta('twitter:card'), 'summary');
  assert.equal(meta('twitter:title'), title);
  assert.equal(meta('twitter:description'), description);
});

test('any social image that is declared also exists in the repository', () => {
  const images = [meta('og:image'), meta('twitter:image')].filter(Boolean);
  for (const value of images) {
    const local = value.startsWith(SITE_URL)
      ? value.slice(SITE_URL.length)
      : (value.startsWith('http') ? null : value.replace(/^\.?\//, ''));
    if (local === null) continue; // an off-site image is the author's call
    assert.ok(exists(local), `social image ${value} does not resolve to a file in the repo`);
  }
});

/* --------------------------- 4. shipped source hygiene ------------------ */

test('no TODO/FIXME markers are left in the shipped HTML, JS or CSS', () => {
  const files = ['index.html', 'app.js', 'assets/highlight.js', 'assets/styles.css'];
  for (const file of files) {
    const hits = read(file).match(/\b(?:TODO|FIXME|XXX|HACK)\b/g);
    assert.equal(hits, null, `${file} contains leftover markers: ${hits && hits.join(', ')}`);
  }
});

test('app.js re-applies the same title the static head declares', () => {
  const m = read('app.js').match(/\bTITLE\s*=\s*['"]([^'"]+)['"]/);
  assert.ok(m, 'app.js no longer declares a TITLE');
  assert.equal(m[1], APP_TITLE);
});
