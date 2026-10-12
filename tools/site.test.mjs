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

const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').trim();
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
  }
});

/* The corpus is a 13x15 rectangle, and the page's headline claim ("Fifteen ways
 * to write the same program", "the same thirteen tasks, with code or explicit
 * scope notes for each language") is only true while it is full. Every hole is
 * invisible from the outside: app.js renders whichever languages it finds, so a
 * dropped entry quietly shortens a task page instead of failing. Worse, a
 * misspelled language id is never rendered at all, and a scope note stripped
 * from an `na` entry contradicts AGENTS.md ("a language that cannot express a
 * task says so rather than faking a translation"). The floor of five languages
 * this assertion used to carry could not see any of it.
 */
test('every task resolves to every language, and every gap states itself', () => {
  const { W, error } = loadData();
  assert.equal(error, null, error && `the corpus could not be loaded: ${error.message}`);
  const tasks = Object.keys(W).filter(k => k.startsWith('RECIPES_')).flatMap(k => W[k]);
  const known = new Set(W.LANGUAGES.map(l => l.id));

  for (const t of tasks) {
    const snippets = t.snippets || {};
    /* A key the language registry does not know is dead weight: visibleLangs()
     * walks the registry, so the snippet is never rendered and never counted. */
    for (const lang of Object.keys(snippets)) {
      assert.ok(known.has(lang),
        `${t.id}: snippet is keyed "${lang}", which is not one of the ${known.size} registered languages`);
    }
    /* The rectangle itself: a language that cannot express the task must say so
     * with an `na` note, not vanish from the row. */
    for (const lang of known) {
      assert.ok(Object.hasOwn(snippets, lang),
        `${t.id}: no entry for ${lang} — every task needs code or an explicit scope note for every language`);
    }
    for (const [lang, s] of Object.entries(snippets)) {
      if (s.na) {
        assert.ok(String(s.note || '').trim(),
          `${t.id}/${lang}: marked outside scope with an empty note — an omission must state the reason`);
      } else {
        assert.ok(String(s.code || '').trim(), `${t.id}/${lang}: no code and no scope note`);
        assert.ok(String(s.note || '').trim(), `${t.id}/${lang}: no note explaining the example`);
      }
    }
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

/* --------------------------- 5. printed page contract -------------------- */

/** The text of the stylesheet's print block, or '' when there is none. */
const printCss = () => {
  const css = read('assets/styles.css');
  const at = css.indexOf('@media print');
  return at === -1 ? '' : css.slice(at);
};

test('printing a code page yields ink on paper, not light text on a dropped panel', () => {
  const css = printCss();
  assert.notEqual(css, '', 'assets/styles.css has no @media print block');
  // Print media drops backgrounds, so the dark panel is gone: the text tokens
  // themselves have to become ink, for the shipped dark theme and the light one.
  assert.match(css, /--fg:\s*#000000/i, 'print block does not reset --fg to ink');
  assert.match(css, /--bg-code:\s*#ffffff/i, 'print block does not reset --bg-code to paper');
  for (const token of ['--tok-kw', '--tok-ty', '--tok-bi', '--tok-str', '--tok-num', '--tok-com']) {
    assert.match(css, new RegExp(`${token}:\\s*#`, 'i'), `print block leaves ${token} tuned for a dark panel`);
  }
  // The on-screen scroll container would silently clip long lines onto paper.
  assert.match(css, /pre\.code\s*\{[^}]*white-space:\s*pre-wrap/, 'long code lines are still clipped instead of wrapped in print');
  assert.match(css, /\.code-wrap\s*\{[^}]*overflow-x:\s*visible/, 'the code scroll container is still hiding overflow in print');
});

test('printed pages drop the chrome that only makes sense on screen', () => {
  const css = printCss();
  assert.notEqual(css, '', 'assets/styles.css has no @media print block');
  // Sticky and fixed chrome repeats on every sheet; interactive actions are dead
  // weight on paper.
  assert.match(css, /header\.top\s*\{[^}]*position:\s*static/, 'the sticky header still repeats in print');
  assert.match(css, /#toast\s*\{[^}]*display:\s*none/, 'the transient toast still prints');
  assert.match(css, /\.search[^{]*\{[^}]*display:\s*none/, 'the search and theme controls still print');
  assert.match(css, /\[data-act\^=["']copy["']\]\s*\{[^}]*display:\s*none/, 'the copy actions still print');
  // Table headers belong on every sheet, not only the first one.
  assert.match(css, /thead\s*\{[^}]*display:\s*table-header-group/, 'table headers are not repeated on each printed page');
});
