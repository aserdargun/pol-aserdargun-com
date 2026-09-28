#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 * check-site.mjs — artifact and structure contract for the shipped site.
 *
 * The same assertions the Azure deploy workflow makes inline, promoted to a
 * script so that a pull request finds a missing or un-relocatable file before
 * a deployment does. There is no build step: what is committed is what ships,
 * so this check is the release gate's cheap half.
 *
 * Usage: node tools/check-site.mjs   (exit code 1 on any failure)
 * ------------------------------------------------------------------------- */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = p => path.join(ROOT, p);

/* Every file the page loads. Add here when a <script>/<link> is added. */
const REQUIRED = [
  'index.html',
  'app.js',
  'favicon.svg',
  'icon.png',
  'apple-icon.png',
  'assets/styles.css',
  'assets/highlight.js',
  'data/languages.js',
  'data/concepts.js',
  'data/verification.js',
  'data/recipes-basics.js',
  'data/recipes-data.js',
  'data/recipes-paradigms.js',
  'data/recipes-errors.js',
  'data/recipes-systems.js'
];

const errors = [];

for (const f of REQUIRED) {
  if (!fs.existsSync(rel(f)) || !fs.statSync(rel(f)).isFile()) {
    errors.push(`missing from the artifact: ${f}`);
  }
}

const html = fs.readFileSync(rel('index.html'), 'utf8');

/* The artifact is also served from a subpath, so an absolute reference breaks
 * it. The icon set depends on this rule, which is why the favicon comment in
 * index.html calls it out. */
for (const m of html.matchAll(/\b(?:src|href)\s*=\s*["'](\/[^/][^"']*)["']/g)) {
  errors.push(`index.html contains an absolute path: ${m[1]} (breaks under a subpath)`);
}

if (errors.length) {
  console.error('artifact check failed:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const dataFiles = fs.readdirSync(rel('data')).filter(f => f.endsWith('.js'));
console.log(`artifact verified: ${REQUIRED.length} required files, ${dataFiles.length} data files, no build step required`);
