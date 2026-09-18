#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 * check-ui.mjs — two independent checks on the presentation layer.
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
  { hash: '#/', expect: ['Fifteen ways to write the same program', 'Prolog', 'Capability matrix'] },
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
