#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 * verify.mjs — checks every snippet in the data files.
 *
 *  1. structure: every task has snippets, every snippet has a command
 *  2. escaping: no string literal broken across lines (the classic bug when
 *     code is written inside a JS template literal)
 *  3. behaviour: snippets whose toolchain exists here are actually run and
 *     their stdout compared against the declared `expect`
 *
 * Usage:  node tools/verify.mjs [--only <taskId>] [--quiet] [--portable] [--no-write]
 * Writes: data/verification.js  (window.VERIFICATION — used by the app badge)
 *
 *   --portable  skip snippets that are locked to one platform (the assembly
 *               examples are arm64 macOS), so CI on Linux can run everything
 *               else; structural and escaping checks always run
 *   --no-write  do not rewrite data/verification.js (for read-only CI runs)
 * ------------------------------------------------------------------------- */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
const quiet = argv.includes('--quiet');
const portable = argv.includes('--portable');
const writeManifest = !argv.includes('--no-write');
const ON_ARM64_MACOS = process.platform === 'darwin' && process.arch === 'arm64';

/* Which toolchains exist on this machine, and how to run a file of each kind. */
const RUNNERS = {
  asm:   { bin: 'clang',        ext: '.s',  available: () => which('clang') },
  c:     { bin: 'clang',        ext: '.c',  available: () => which('clang') },
  cpp:   { bin: 'clang++',      ext: '.cpp', available: () => which('clang++') },
  python:{ bin: 'python3',      ext: '.py', available: () => which('python3') },
  js:    { bin: 'node',         ext: '.js', available: () => which('node') },
  bash:  { bin: 'bash',         ext: '.sh', available: () => which('bash') },
  sql:   { bin: 'sqlite3',      ext: '.sql', available: () => which('sqlite3') }
  /* rust, go, java, csharp, haskell, ocaml, prolog, datalog: no local
     toolchain, so these are reviewed by hand and reported as such. */
};

function which(bin) {
  try { execSync(`command -v ${bin}`, { stdio: 'pipe' }); return true; }
  catch { return false; }
}

/* ---------------------------- load the data ------------------------------ */
const dataFiles = fs.readdirSync(path.join(ROOT, 'data'))
  .filter(f => f.endsWith('.js'))
  .sort();

const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const f of dataFiles) {
  const src = fs.readFileSync(path.join(ROOT, 'data', f), 'utf8');
  vm.runInContext(src, sandbox, { filename: `data/${f}` });
}
const W = sandbox.window;
const tasks = Object.keys(W)
  .filter(k => k.startsWith('RECIPES_'))
  .flatMap(k => W[k]);
const langIds = W.LANGUAGE_ORDER;

const errors = [];
const warnings = [];
const results = { executed: [], failed: [], reviewed: [], skipped: [], platformSkipped: [] };

/* ------------------------- 1. structural checks -------------------------- */
for (const task of tasks) {
  if (!task.id) errors.push('task without id');
  if (!task.prompt) errors.push(`${task.id}: missing prompt`);
  if (!task.takeaway) errors.push(`${task.id}: missing takeaway`);
  const langs = Object.keys(task.snippets || {});
  if (langs.length < 5) errors.push(`${task.id}: only ${langs.length} languages`);
  for (const id of langs) {
    if (!langIds.includes(id)) errors.push(`${task.id}/${id}: unknown language id`);
    const s = task.snippets[id];
    if (s.na) {
      if (!s.note) errors.push(`${task.id}/${id}: not-applicable entry without a reason`);
      continue;
    }
    if (!s.code) errors.push(`${task.id}/${id}: no code`);
    if (!s.run) errors.push(`${task.id}/${id}: no run command`);
    if (!s.file) errors.push(`${task.id}/${id}: no filename`);
    if (!s.note) warnings.push(`${task.id}/${id}: no note`);
    if (s.expect == null && !s.partial && !['datalog'].includes(id))
      warnings.push(`${task.id}/${id}: no expected output and not marked partial`);
  }
  const missing = langIds.filter(l => !langs.includes(l));
  if (missing.length) warnings.push(`${task.id}: missing ${missing.join(', ')}`);
}

/* --------------------- 2. broken string literal check -------------------- */
const QUOTE_CHECKED = new Set(['asm', 'c', 'cpp', 'rust', 'go', 'java', 'csharp', 'python', 'haskell']);
function brokenString(code) {
  // looks for a double-quoted literal that is still open when the line ends
  let inStr = false, inChar = false;
  const lines = code.split('\n');
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const prev = line[i - 1];
      if (ch === '\\' && (inStr || inChar)) { i++; continue; }        // escape
      if (inStr) { if (ch === '"') inStr = false; continue; }
      if (inChar) { if (ch === "'") inChar = false; continue; }
      if (ch === '"' && !inChar) inStr = true;
      else if (ch === "'" && line[i + 1] && line[i + 2] === "'") { i += 2; }  // char 'a'
      else if (ch === '/' && line[i + 1] === '/') break;                       // line comment
    }
    if (inStr) return n + 1;
  }
  return 0;
}

/* ---------------------------- 3. run snippets ---------------------------- */
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'polyglot-verify-'));
const norm = s => s.replace(/[ \t]+$/gm, '').replace(/^\n+|\n+$/g, '');

for (const task of tasks) {
  if (only && task.id !== only) continue;
  for (const [lang, s] of Object.entries(task.snippets)) {
    if (s.na) { results.reviewed.push(`${task.id}/${lang} (n/a)`); continue; }
    if (QUOTE_CHECKED.has(lang)) {
      const line = brokenString(s.code);
      if (line) errors.push(`${task.id}/${lang}: string literal left open at line ${line} (escaping bug)`);
    }
    const runner = RUNNERS[lang];
    if (!runner || !runner.available()) {
      results.reviewed.push(`${task.id}/${lang}`);
      continue;
    }
    /* The assembly snippets are written for arm64 macOS: the symbol names,
       the addressing and the varargs convention are all platform-specific. */
    if (portable && lang === 'asm' && !ON_ARM64_MACOS) {
      results.platformSkipped.push(`${task.id}/${lang}`);
      continue;
    }
    if (s.expect == null) { results.skipped.push(`${task.id}/${lang}`); continue; }

    const dir = fs.mkdtempSync(path.join(tmpRoot, `${task.id}-${lang}-`));
    fs.writeFileSync(path.join(dir, s.file), s.code);
    try {
      const out = execSync(s.run, { cwd: dir, stdio: 'pipe', timeout: 60000, shell: '/bin/bash' }).toString();
      if (norm(out) === norm(s.expect)) {
        results.executed.push(`${task.id}/${lang}`);
      } else {
        results.failed.push({ where: `${task.id}/${lang}`, got: norm(out), want: norm(s.expect) });
      }
    } catch (e) {
      results.failed.push({
        where: `${task.id}/${lang}`,
        got: `<error> ${(e.stderr || e.stdout || String(e)).toString().slice(0, 700)}`,
        want: norm(s.expect)
      });
    }
  }
}

/* ------------------------------- report --------------------------------- */
if (!quiet) {
  const total = tasks.reduce((n, t) => n + Object.keys(t.snippets).length, 0);
  console.log(`\ndata files : ${dataFiles.join(', ')}`);
  console.log(`tasks      : ${tasks.length}   snippets: ${total}`);
  console.log(`executed   : ${results.executed.length} (output matched)`);
  console.log(`failed     : ${results.failed.length}`);
  console.log(`not run    : ${results.reviewed.length} (no local toolchain) · ${results.skipped.length} (no expected output)`);
  if (results.platformSkipped.length)
    console.log(`platform   : ${results.platformSkipped.length} skipped (assembly targets arm64 macOS)`);

  if (results.failed.length) {
    console.log('\n--- FAILURES ---');
    for (const f of results.failed) {
      console.log(`\n[${f.where}]`);
      console.log('  expected: ' + JSON.stringify(f.want).slice(0, 400));
      console.log('  actual  : ' + JSON.stringify(f.got).slice(0, 900));
    }
  }
  if (errors.length) {
    console.log('\n--- ERRORS ---');
    for (const e of errors.slice(0, 60)) console.log('  ' + e);
  }
  if (warnings.length) {
    console.log('\n--- WARNINGS ---');
    for (const w of warnings.slice(0, 60)) console.log('  ' + w);
  }
}

/* ------------------- write the verification manifest --------------------- */
const manifest = {};
for (const id of results.executed) {
  const [task, lang] = id.split('/');
  (manifest[task] ||= {})[lang] = 'executed';
}
if (!writeManifest) {
  console.log('\nmanifest not written (--no-write)');
  process.exit(results.failed.length || errors.length ? 1 : 0);
}

const manifestPath = path.join(ROOT, 'data', 'verification.js');
const body = Object.entries(manifest).map(([task, langs]) =>
  `    '${task}': { ${Object.keys(langs).map(l => `'${l}': 'executed'`).join(', ')} }`
).join(',\n');
fs.writeFileSync(manifestPath, `/* Generated by tools/verify.mjs — do not edit by hand.
 * 'executed' means the snippet ran here and produced exactly the documented
 * output. Everything else is hand-reviewed. */
window.VERIFICATION = {
${body}
};
`);

console.log(`\nmanifest written: data/verification.js`);
process.exit(results.failed.length || errors.length ? 1 : 0);
