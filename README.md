# Same program, fifteen languages

An app that shows the fundamentals of programming languages by doing the same thirteen
tasks in fifteen languages — the similarities first, then the real differences.

**Assembly · C · C++ · Rust · Go · Java · C# · Python · JavaScript · Bash · SQL · Haskell · OCaml · Prolog · Datalog**

---

## Running it

No build step, no dependencies, no network:

```bash
open index.html            # macOS: opens it in your browser
```

or serve the folder if you prefer a real origin:

```bash
python3 -m http.server 8000     # then visit http://localhost:8000
```

Everything is loaded with plain `<script>` tags, so it also works straight off the
filesystem. The only external requirement is a browser.

## What is in it

| | count | what it is |
|---|---|---|
| Languages | 15 | profiled on the same twelve axes, in the order C grew up: machine → systems → managed → dynamic → shell → relational → functional → logic |
| Tasks | 13 | each one isolates a different fundamental, stated once in plain English |
| Code examples | 195 | the same task solved in every language that can express it |
| Executed & output-checked | 88 | run on the machine this was built on, with stdout compared to the documented result |
| Hand-reviewed | 107 | no toolchain available locally; written and read carefully instead |
| Deliberately impossible | 8 | tasks a language genuinely cannot express — each with the reason why |

The tasks, in the order the app presents them:

**Basics** — Hello World · values, types and mutation · conditionals and loops (FizzBuzz) · functions
**Data & algorithms** — recursion (factorial) · collections (sum, filter, max) · sorting (insertion sort) · text processing (word frequency)
**Paradigms** — higher-order functions · sum types and pattern matching · error handling
**Systems reality** — concurrency · graph reachability (the flagship imperative-versus-declarative comparison)

Plus three reference sections: twelve **fundamentals** pages (each stating what all fifteen do
identically before listing the positions they take), a **capability matrix** of 14 capabilities ×
15 languages, and a **compare** view that puts any two or three languages side by side.

## How the content is organised

```
index.html                 the shell: header, nav, script order
favicon.svg                the app icon: the portfolio family template, no raster payload
icon.png apple-icon.png    the same icon at 180×180, rendered from favicon.svg
app.js                     router and every view (no framework)
assets/styles.css          two themes, one column of reading width
assets/highlight.js        dependency-free tokenizer for all fifteen languages
data/languages.js          the fifteen profiles, twelve axes each
data/concepts.js           the fundamentals + the capability matrix
data/recipes-basics.js     tasks 1–4
data/recipes-data.js       tasks 5–8
data/recipes-paradigms.js  tasks 9–10
data/recipes-errors.js     task 11
data/recipes-systems.js    tasks 12–13
data/verification.js       generated: which snippets were executed
tools/verify.mjs           runs every snippet, compares stdout, writes verification.js
tools/check-ui.mjs         identity + highlighter invariants + headless-browser render checks
```

### A snippet

```js
{
  file: 'fizzbuzz.c',        // what the run command assumes
  effort: 1,                 // 1 trivial … 5 fights you — rendered as a dot meter
  run: 'clang fizzbuzz.c -o fizzbuzz && ./fizzbuzz',
  code: `...`,
  expect: '1\n2\nFizz\n...', // exact stdout, or null when it is not printable
  note: 'why it looks like this in this language',
  partial: 'scope reduced, and why',   // optional
  na: true                             // optional: not expressible, with note as the reason
}
```

A task carries `prompt` (the algorithm, stated once), `why` (why this task earns its place)
and `takeaway` (what the fifteen versions show collectively). The app renders `takeaway` as the
"What it shows" panel and derives everything else — counts, efforts, badges — from the data.

## Verifying it

```bash
node tools/verify.mjs        # runs every snippet it can; exits non-zero on any mismatch
node tools/verify.mjs --only graph
node tools/verify.mjs --portable --no-write   # what CI runs: skips the arm64-macOS-only
                                              # assembly, and does not rewrite the manifest
node tools/check-ui.mjs      # tokenizer invariants + renders 13 routes in headless Chrome
node tools/check-ui.mjs --shots
```

CI runs the same corpus check on every push to `main`
([.github/workflows/deploy-swa-pol-aserdargun-com.yml](.github/workflows/deploy-swa-pol-aserdargun-com.yml))
and then uploads the repository as the Azure Static Web Apps artifact — there is no build step
to run, so the validation *is* the release gate.

`verify.mjs` loads the data files in a sandbox, writes each snippet to a temp file, runs the
command in `run`, and compares stdout to `expect`. It then rewrites `data/verification.js`, which
is what the `✓ runs` badge in the UI reads. `check-ui.mjs` checks that the highlighter neither
loses text nor leaks markup, and that each route renders content in a real browser (a thrown
error leaves the app empty, which the DOM check catches).

It also holds the identity contract, because a title that lives in two files will eventually
disagree with itself. The page is titled `POL - Programming Languages` — the portfolio convention
`<CODE> - <app name>`, the same shape every other app on the domain uses. `index.html` carries it
statically so the tab is right before any script runs, `app.js` re-applies it on every route, and
`check-ui.mjs` fails if the two strings differ.

The same check guards the icon set. Every app in the portfolio ships one dark rounded square with
a lime circle, one black glyph and its three-letter code; POL's glyph is a brace pair with a
single mark inside it. Three files carry it — `favicon.svg` (the scalable original),
`icon.png` and `apple-icon.png` (180×180, rendered from that SVG) — and `check-ui.mjs` fails if
any of them is missing, if a link stops being relative, if the PNGs stop being 180×180, or if the
SVG stops being self-contained (no script, no network reference, no raster payload) or drifts
away from the family palette (`#121310` / `#c8ff36`). The references stay relative (`./icon.png`)
because the same artifact is also served from a subpath, which an absolute `/icon.png` would
break — the deploy workflow enforces that too.

When this was last run:

```
tasks      : 13   snippets: 195
executed   : 88 (output matched)
failed     : 0
not run    : 107 (no local toolchain)
highlighter: 187 snippets tokenized, 0 problems
browser    : 13 routes rendered
```

## Adding to it

**A task:** add an entry to the right `data/recipes-*.js` file, or make a new one and add a
`<script>` tag to `index.html` plus the filename to the concat list at the top of `app.js`.
Run `node tools/verify.mjs --only <taskId>` — it will tell you which languages are missing and
which snippets disagree with their declared output.

**A language:** add an object to `window.LANGUAGES` with the twelve axes from `window.AXES`,
add a tokenizer spec in `assets/highlight.js` and a keyword list to `tools/verify.mjs`, then
fill in the snippets. The profiles, matrix column, chips and filters all follow automatically.

## What was verified where

Verified by execution on macOS (arm64), with the toolchains that were installed:
Assembly (`clang`, arm64 macOS ABI), C, C++, Python 3, JavaScript (Node), Bash, SQL (SQLite).

Reviewed by hand, because no local toolchain existed: Rust, Go, Java, C#, Haskell, OCaml,
Prolog, Datalog. Two consequences worth knowing before you copy anything:

- The assembly examples target **arm64 macOS** specifically: `_main`, `adrp`/`add` address pairs,
  and the Apple ABI rule that variadic arguments travel on the stack. A Linux/x86-64 version of
  the same programs is a different program.
- The SQL runs on SQLite, so the dialect is SQLite's (`printf`, `group_concat`, `||`). The Datalog
  is Soufflé syntax (`.decl`, `.output`, aggregates as `count : { … }`). Both are noted in the
  snippets themselves.

## Where the content comes from

This app is the practical companion to the two documents already in this repository:

- [programming-languages.md](programming-languages.md) — which languages are still installable,
  how they are ranked, and what "still available" actually means
- [cs-coverage-assessment.md](cs-coverage-assessment.md) — the assessment that identified the
  blind spots this set was assembled to close: SQL for relational thinking, Haskell and OCaml for
  functional programming as a foundation, and Prolog and Datalog for logic and declarative search

Those documents explain *which* languages; this app shows *what the differences actually look like
in code*, with the similarities marked first at every step.

## Known limits, stated plainly

- Fifteen languages cannot cover every paradigm. Array languages (APL, J), homoiconic Lisp,
  actor runtimes (Erlang), hardware description languages and proof assistants are all absent, and
  their absence means this app cannot claim to show "everything programming has produced".
- Where a toolchain was missing, the code was reviewed rather than run. The badges in the UI say
  which is which, per snippet.
- Toolchain behaviour changes between versions. The Bash examples deliberately avoid bash 4+
  features because macOS still ships 3.2; on a modern Linux they could be written more shortly.
- The highlighter is a small scanner, not a parser. It is configured for the code in this
  repository, and a pathological input could in principle mis-tokenise (it will still be escaped,
  never injected as markup).
