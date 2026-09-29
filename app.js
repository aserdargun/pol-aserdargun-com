/* ---------------------------------------------------------------------------
 * app.js — the whole application: router, views, rendering.
 * No framework, no build step, no network. Everything it needs is in ./data.
 * ------------------------------------------------------------------------- */
(function () {
  'use strict';

  /* The identity contract: index.html carries the same title, and
     tools/check-ui.mjs fails if the two ever drift apart. */
  const TITLE = 'POL - Programming Languages';

  /* ------------------------------- data ---------------------------------- */
  const LANGUAGES = window.LANGUAGES || [];
  const BY_ID = window.LANGUAGE_BY_ID || {};
  const FAMILIES = window.FAMILIES || {};
  const AXES = window.AXES || [];
  const TASKS = [].concat(
    window.RECIPES_BASICS || [],
    window.RECIPES_DATA || [],
    window.RECIPES_PARADIGMS || [],
    window.RECIPES_ERRORS || [],
    window.RECIPES_SYSTEMS || []
  );
  const CONCEPTS = window.CONCEPTS || [];
  const MATRIX = window.MATRIX || [];
  const MATRIX_LEGEND = window.MATRIX_LEGEND || {};
  const VERIF = window.VERIFICATION || {};
  const hl = window.highlightCode || ((code) => window.escapeHtml(code));
  const esc = window.escapeHtml || ((s) => s);

  const TASK_BY_ID = {};
  TASKS.forEach((t) => { TASK_BY_ID[t.id] = t; });

  /* Every snippet is registered so the copy button can find its raw text. */
  const SNIPPETS = {};
  TASKS.forEach((task) => {
    Object.entries(task.snippets || {}).forEach(([lang, snip]) => {
      SNIPPETS[task.id + ':' + lang] = snip;
    });
  });

  const stats = {
    languages: LANGUAGES.length,
    tasks: TASKS.length,
    snippets: Object.values(SNIPPETS).filter((s) => !s.na).length,
    executed: Object.entries(SNIPPETS).filter(([key, s]) => !s.na && (VERIF[key.split(':')[0]] || {})[key.split(':')[1]] === 'executed').length,
    outsideScope: Object.values(SNIPPETS).filter((s) => s.na).length
  };

  /* ------------------------------ helpers -------------------------------- */
  const familyOf = (id) => (BY_ID[id] && BY_ID[id].family) || 'systems';
  const familyLabel = (fam) => (FAMILIES[fam] && FAMILIES[fam].label) || fam;
  const familyColor = (fam) => (FAMILIES[fam] && FAMILIES[fam].color) || '#888';

  function chip(id, opts) {
    if (!BY_ID[id]) return '';
    const f = familyOf(id);
    const cls = 'chip' + (opts && opts.active ? ' active' : '') + (opts && opts.small ? ' small' : '');
    const action = opts && opts.action ? ` data-act="${opts.action}"` : '';
    return `<a class="${cls}" style="--c:${familyColor(f)}" href="#/language/${id}"${action} title="${esc(
      BY_ID[id].tagline)}">${esc(BY_ID[id].name)}</a>`;
  }

  function effortMeter(level) {
    if (!level) return '';
    const marks = [1, 2, 3, 4, 5].map((n) => `<i class="${n <= level ? 'on' : ''}"></i>`).join('');
    const label = ['', 'trivial', 'easy', 'moderate', 'awkward', 'fights you'][level];
    return `<span class="effort" title="How much ceremony this language needs for this task: ${label}">${marks}</span>`;
  }

  function verifiedBadge(taskId, lang) {
    const state = (VERIF[taskId] || {})[lang];
    if (state === 'executed') {
      return `<span class="badge ok" title="This snippet was executed on the machine building this app, and its output matched the documented result after whitespace normalization. This checks the supplied example, not every possible input.">✓ runs</span>`;
    }
    return `<span class="badge" title="Hand-reviewed. No passing execution is recorded by the configured verifier for this snippet.">reviewed</span>`;
  }

  function snippetCard(task, lang, _opts) {
    const snip = task.snippets[lang];
    const key = task.id + ':' + lang;
    const l = BY_ID[lang];
    const head = `<div class="card-head">
      ${chip(lang)}
      ${l ? `<span class="meta">${esc(String(l.year))}</span>` : ''}
      ${effortMeter(snip.effort)}
      ${snip.na ? '' : verifiedBadge(task.id, lang)}
      ${snip.partial ? `<span class="badge warn" title="${esc(snip.partial)}">reduced</span>` : ''}
      <span class="spacer"></span>
      ${snip.na ? '' : `<button class="btn ghost" data-act="copy" data-snip="${key}">copy</button>`}
    </div>`;

    if (snip.na) {
      return `<article class="snippet na" id="s-${task.id}-${lang}">
        ${head}
        <p class="na-title">Outside this example’s scope</p>
        <p class="note">${esc(snip.note)}</p>
      </article>`;
    }

    const run = snip.run
      ? `<div class="runrow"><span class="k">run</span><code>${esc(snip.run)}</code>
           <button class="btn ghost tiny" data-act="copyrun" data-snip="${key}">copy</button></div>`
      : '';
    const expect = snip.expect
      ? `<div class="expect"><span class="k">output</span><pre>${esc(snip.expect)}</pre></div>`
      : '';
    const partial = snip.partial ? `<p class="partial">Reduced scope: ${esc(snip.partial)}</p>` : '';

    return `<article class="snippet" id="s-${task.id}-${lang}">
      ${head}
      <div class="code-wrap"><pre class="code"><code>${hl(snip.code, lang)}</code></pre></div>
      <p class="note">${esc(snip.note)}</p>
      ${partial}
      ${run}
      ${expect}
    </article>`;
  }

  /* --------------------------- snippet layout ---------------------------- */
  function visibleLangs(task, filter) {
    const ids = Object.keys(task.snippets);
    const order = LANGUAGES.map((l) => l.id).filter((id) => ids.includes(id));
    return filter && filter.size ? order.filter((id) => filter.has(id)) : order;
  }

  function taskSnippetSection(task, filter) {
    const langs = visibleLangs(task, filter);
    if (!langs.length) return `<p class="muted">No language selected. Pick one above.</p>`;
    return `<div class="grid">${langs.map((id) => snippetCard(task, id)).join('')}</div>`;
  }

  function filterBar(task, filter) {
    const ids = Object.keys(task.snippets);
    const order = LANGUAGES.map((l) => l.id).filter((id) => ids.includes(id));
    const all = !filter || filter.size === 0;
    return `<div class="filterbar">
      <span class="k">only</span>
      <button class="chip ${all ? 'active' : ''}" data-act="filter" data-lang="all" aria-pressed="${all}" style="--c:#888">all ${ids.length}</button>
      ${order.map((id) => `<button class="chip small ${filter && filter.has(id) ? 'active' : ''}" style="--c:${familyColor(familyOf(id))}" data-act="filter" data-lang="${id}" aria-pressed="${!!(filter && filter.has(id))}">${esc(BY_ID[id].name)}</button>`).join('')}
      <span class="spacer"></span>
      <button class="btn ghost" data-act="copy-all" data-task="${task.id}">copy visible languages</button>
    </div>`;
  }

  /* ------------------------------- views --------------------------------- */
  function viewAbout() {
    return `<h1>About POL &amp; sources</h1>
      <p class="lede">POL is the English-language programming foundations tool in the aserdargun.com learning system. It supports GPU study and broader software learning.</p>
      <section class="panel"><h2>Your learning path</h2>
        <p>Compare types, memory, control flow and concurrency here, then connect those ideas to compute architecture and kernel experiments.</p>
        <div class="hero-links"><a class="btn ghost" href="https://aserdargun.com/">Portfolio &amp; learning map</a><a class="btn ghost" href="https://gpu.aserdargun.com/">GPU · compute foundations</a><a class="btn ghost" href="https://gex.aserdargun.com/">GEX · kernel experiments</a></div>
        <p class="small muted">These links describe a learning path. POL displays code and documented output; it does not execute programs or GPU kernels in your browser.</p></section>
      <section class="panel"><h2>Scope &amp; verification</h2>
        <p>${stats.tasks} tasks × ${stats.languages} languages contain ${stats.snippets} code examples and ${stats.outsideScope} scope notes. ${stats.executed} examples have a recorded passing output check; ${stats.snippets - stats.executed} are reviewed without a recorded passing run.</p>
        <p>Assembly targets arm64 macOS, SQL targets SQLite, logic examples use SWI-Prolog and Soufflé conventions. Standard libraries, runtime versions and dialects affect the comparisons. A scope note marks an omitted implementation, not necessarily an impossible task.</p>
        <p>Execution checks compare the supplied inputs and expected output after trimming boundary newlines and trailing spaces. They do not establish general correctness, portability or performance. Effort scores are editorial estimates of ceremony in these examples.</p>
        <p>The corpus is available offline. External portfolio links and official documentation require a connection.</p></section>
      <section class="panel"><h2>Primary references</h2><p>Technical corrections checked on 21 September 2026. Consult the matching runtime version when running an example.</p>
        <ul>${[
          ['https://www.swi-prolog.org/pldoc/doc_for?object=(is)/2', 'SWI-Prolog · arithmetic evaluation and input modes'],
          ['https://souffle-lang.github.io/tutorial', 'Soufflé · arithmetic extensions and termination'],
          ['https://ocaml.org/manual/5.3/lablexamples.html', 'OCaml · optional and labelled arguments'],
          ['https://downloads.haskell.org/ghc/latest/docs/users_guide/using-warnings.html', 'GHC · incomplete-pattern warnings'],
          ['https://doc.rust-lang.org/nomicon/what-unsafe-does.html', 'Rust · safe and unsafe boundaries'],
          ['https://docs.python.org/3/c-api/memory.html', 'CPython · memory management'],
          ['https://www.sqlite.org/lang_expr.html', 'SQLite · expression and NULL semantics'],
          ['https://eel.is/c++draft/variant.visit', 'C++ working draft · variant visitation'],
          ['https://souffle-lang.github.io/types', 'Soufflé · records and algebraic data types'],
          ['https://www.swi-prolog.org/pldoc/man?section=threadcreate', 'SWI-Prolog · thread APIs']
        ].map(([url, title]) => `<li><a href="${url}">${title}</a></li>`).join('')}</ul></section>
      <section class="panel"><h2>Further reading</h2><ul><li><a href="programming-languages.md">Programming language catalog and dated ranking sources</a></li><li><a href="cs-coverage-assessment.md">CS coverage: original ten-language assessment and current scope</a></li><li><a href="https://github.com/aserdargun/pol-aserdargun-com">Source repository and verification tools</a></li></ul></section>`;
  }

  function viewOverview() {
    const byGroup = {};
    TASKS.forEach((t) => { (byGroup[t.group] = byGroup[t.group] || []).push(t); });

    return `
    <section class="hero">
      <h1>Fifteen ways to write the same program</h1>
      <p class="lede">Assembly, C, C++, Rust, Go, Java, C#, Python, JavaScript, Bash, SQL, Haskell,
      OCaml, Prolog and Datalog — the same thirteen tasks, with code or explicit scope notes for each language and the
      similarities and the real differences pointed at.</p>
      <div class="stats">
        <div><b>${stats.languages}</b><span>languages</span></div>
        <div><b>${stats.tasks}</b><span>tasks</span></div>
        <div><b>${stats.snippets}</b><span>code examples</span></div>
        <div><b>${stats.executed}</b><span>run &amp; output-checked</span></div>
        <div><b>${stats.outsideScope}</b><span>scope notes</span></div>
      </div>
      <div class="hero-links">
        <a class="btn" href="#/tasks">Start with the tasks</a>
        <a class="btn ghost" href="#/concepts">The fundamentals</a>
        <a class="btn ghost" href="#/matrix">Capability matrix</a>
        <a class="btn ghost" href="#/compare">Compare two languages</a>
      </div>
    </section>

    <section class="panel">
      <h2>How to read this</h2>
      <div class="three">
        <div>
          <h3>Similarities come first</h3>
          <p>All fifteen languages have the same eight fundamentals: names, groupings, choices,
          repetition, abstraction, failure, I/O, and a translation step. Every task page states what
          the examples have in common before it shows what differs.</p>
        </div>
        <div>
          <h3>Differences are design, not quality</h3>
          <p>Rust does not have a garbage collector and Python does not have a borrow checker because
          they are solving different problems. When the selected dialect or example omits a task, the scope note explains why. An omission is not proof that the language cannot express it.</p>
        </div>
        <div>
          <h3>The code is real</h3>
          <p>${stats.executed} of ${stats.snippets} examples were executed where this app was built and
          their output compared against the stated result; the remaining ${stats.snippets - stats.executed} code examples are hand-reviewed. ${stats.outsideScope} additional entries explain scope limits. A snippet
          marked <span class="badge ok">✓ runs</span> was machine-checked.</p>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2>The fifteen, in the order this app compares them</h2>
      <div class="lang-grid">
        ${LANGUAGES.map((l) => `
          <a class="lang-card" href="#/language/${l.id}" style="--c:${familyColor(l.family)}">
            <div class="lang-top"><b>${esc(l.name)}</b><span class="year">${esc(String(l.year))}</span></div>
            <span class="fam">${esc(familyLabel(l.family))}</span>
            <p>${esc(l.tagline)}</p>
          </a>`).join('')}
      </div>
    </section>

    <section class="panel">
      <h2>The tasks</h2>
      ${Object.entries(byGroup).map(([group, list]) => `
        <div class="group">
          <h3 class="group-title">${esc(group)}</h3>
          <ol class="task-list">
            ${list.map((t) => `<li>
              <a href="#/task/${t.id}">${esc(t.title)}</a>
              <span class="meta">${Object.keys(t.snippets).length} languages</span>
              <p>${esc(t.prompt)}</p>
            </li>`).join('')}
          </ol>
        </div>`).join('')}
    </section>`;
  }

  function viewTasks() {
    const byGroup = {};
    TASKS.forEach((t) => { (byGroup[t.group] = byGroup[t.group] || []).push(t); });
    return `<h1>Tasks</h1>
      <p class="lede">Thirteen tasks, chosen so that each one isolates a different fundamental.
      Every task has an entry for each language; scope notes identify omitted implementations.</p>
      ${Object.entries(byGroup).map(([group, list]) => `
        <section class="panel">
          <h3 class="group-title">${esc(group)}</h3>
          ${list.map((t) => `
            <article class="task-card">
              <a class="task-title" href="#/task/${t.id}">${esc(t.title)}</a>
              <p class="prompt"><span class="k">do this</span> ${esc(t.prompt)}</p>
              <p class="muted">${esc(t.takeaway.split('.')[0])}.</p>
              <div class="chips">${Object.keys(t.snippets).map((id) => chip(id, { small: true })).join('')}</div>
            </article>`).join('')}
        </section>`).join('')}`;
  }

  function viewTask(task, filter) {
    const langs = Object.keys(task.snippets);
    const siblings = TASKS;
    const idx = siblings.findIndex((t) => t.id === task.id);

    return `
    <nav class="crumbs">
      <a href="#/tasks">tasks</a> <span class="sep">/</span> <span>${esc(task.group)}</span>
    </nav>
    <h1>${esc(task.title)}</h1>
    <div class="prompt-box"><span class="k">the task, stated once</span><p>${esc(task.prompt)}</p></div>
    <div class="two">
      <div class="panel"><h3>Why this task</h3><p>${esc(task.why)}</p></div>
      <div class="panel accent"><h3>What it shows</h3><p>${esc(task.takeaway)}</p></div>
    </div>
    ${filterBar(task, filter)}
    ${taskSnippetSection(task, filter)}
    <nav class="pager">
      ${idx > 0 ? `<a class="btn ghost" href="#/task/${siblings[idx - 1].id}">← ${esc(siblings[idx - 1].title)}</a>` : ''}
      ${idx < siblings.length - 1 ? `<a class="btn ghost" href="#/task/${siblings[idx + 1].id}">${esc(siblings[idx + 1].title)} →</a>` : ''}
    </nav>
    <p class="muted small">${langs.length} languages attempted this task; ${langs.length -
      Object.keys(task.snippets).filter((l) => task.snippets[l].na).length} include code; execution badges identify the checked examples.</p>`;
  }

  function viewLanguages() {
    return `<h1>Languages</h1>
      <p class="lede">Each profile answers the same twelve questions, so that the profiles can be
      compared rather than just read. The axes are shown in the same order for all fifteen.</p>
      <div class="lang-grid">
        ${LANGUAGES.map((l) => `
          <a class="lang-card" href="#/language/${l.id}" style="--c:${familyColor(l.family)}">
            <div class="lang-top"><b>${esc(l.name)}</b><span class="year">${esc(String(l.year))}</span></div>
            <span class="fam">${esc(familyLabel(l.family))}</span>
            <p>${esc(l.tagline)}</p>
            <p class="muted small">${esc(l.paradigm.split('.')[0])}.</p>
          </a>`).join('')}
      </div>`;
  }

  function viewLanguage(l, _filter) {
    const axes = AXES.map((axis) => {
      let value = l[axis.key];
      if (Array.isArray(value)) value = value.map((v) => `<li>${esc(v)}</li>`).join('');
      else value = `<p>${esc(String(value))}</p>`;
      return `<div class="axis">
        <div class="axis-head"><span class="k">${esc(axis.label)}</span><span class="q">${esc(axis.q)}</span></div>
        ${Array.isArray(l[axis.key]) ? `<ul>${value}</ul>` : value}
      </div>`;
    }).join('');

    const tasksWith = TASKS.filter((t) => t.snippets[l.id]);
    const asNa = tasksWith.filter((t) => t.snippets[l.id].na);
    const efforts = tasksWith.map((t) => t.snippets[l.id].effort).filter(Boolean);
    const avg = efforts.length ? (efforts.reduce((a, b) => a + b, 0) / efforts.length) : 0;

    return `
    <nav class="crumbs"><a href="#/languages">languages</a> <span class="sep">/</span> <span>${esc(l.name)}</span></nav>
    <h1>${esc(l.name)} <span class="fam-pill" style="--c:${familyColor(l.family)}">${esc(familyLabel(l.family))}</span></h1>
    <p class="lede">${esc(l.tagline)}</p>
    <div class="stats small">
      <div><b>${esc(String(l.year))}</b><span>first appeared</span></div>
      <div><b>${esc(l.creator)}</b><span>origin</span></div>
      <div><b>${avg.toFixed(1)} / 5</b><span>average ceremony in this app</span></div>
      <div><b>${tasksWith.length - asNa.length}</b><span>tasks attempted</span></div>
      <div><b>${asNa.length}</b><span>scope notes</span></div>
    </div>
    <div class="two">
      <div class="panel"><h3>Notice this first</h3><p>${esc(l.notice)}</p></div>
      <div class="panel"><h3>Lineage</h3><p>${esc(l.lineage)}</p></div>
    </div>
    <section class="panel">
      <h2>The twelve axes</h2>
      <div class="axis-grid">${axes}</div>
    </section>
    <section class="panel">
      <h2>${esc(l.name)} on each task</h2>
      <div class="grid">
        ${tasksWith.map((t) => snippetCard(t, l.id)).join('')}
      </div>
    </section>`;
  }

  function viewConcepts() {
    return `<h1>Fundamentals</h1>
      <p class="lede">Eleven concepts that every language in this app has to answer, plus the list of
      the eight things they all share. Each concept states what is common first, then lays out the
      real positions languages take.</p>
      <div class="grid">
        ${CONCEPTS.map((c) => `
          <a class="concept-card" href="#/concept/${c.id}">
            <b>${esc(c.title)}</b>
            <p>${esc(c.tagline)}</p>
            <span class="meta">${c.differs.length} axes of difference</span>
          </a>`).join('')}
      </div>`;
  }

  function viewConcept(c) {
    return `
    <nav class="crumbs"><a href="#/concepts">fundamentals</a> <span class="sep">/</span> <span>${esc(c.title)}</span></nav>
    <h1>${esc(c.title)}</h1>
    <p class="lede">${esc(c.tagline)}</p>
    <section class="panel accent">
      <h2>What the examples have in common</h2>
      <ul class="same">${c.same.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    </section>
    ${c.differs.map((d) => `
      <section class="panel">
        <h2>${esc(d.axis)}</h2>
        <div class="positions">
          ${d.positions.map((p) => `
            <div class="position">
              <div class="pos-label">${esc(p.label)}</div>
              <div class="chips">${p.langs.map((id) => chip(id, { small: true })).join('')}</div>
              ${p.note ? `<p class="muted small">${esc(p.note)}</p>` : ''}
            </div>`).join('')}
        </div>
      </section>`).join('')}`;
  }

  function viewMatrix() {
    const cell = (row, langId) => {
      const v = row.cells[langId] || 'n';
      const note = (row.notes && row.notes[langId]) ? ' — ' + row.notes[langId] : '';
      const label = `${BY_ID[langId] ? BY_ID[langId].name : langId}: ${MATRIX_LEGEND[v]}${note}`;
      return `<td class="cell ${v}" title="${esc(label)}"><a href="#/language/${langId}" aria-label="${esc(row.capability + ": " + label)}">${v === 'y' ? '●' : v === 'p' ? '◐' : v === 'n' ? '○' : '—'}</a></td>`;
    };
    return `<h1>Capability matrix</h1>
      <p class="lede">${MATRIX.length} capabilities against ${LANGUAGES.length} languages. Each cell links to its language profile; focus or hover for its note.
      The point of this table is that no column is all dots: languages make different trade-offs. Ratings describe the selected dialects and implementations; they are not performance scores.</p>
      <div class="legend">
        ${Object.entries(MATRIX_LEGEND).map(([k, v]) => `<span class="legend-item"><i class="cell ${k}">${k === 'y' ? '●' : k === 'p' ? '◐' : k === 'n' ? '○' : '—'}</i>${esc(v)}</span>`).join('')}
      </div>
      <div class="matrix-wrap">
        <table class="matrix">
          <thead><tr><th class="cap">capability</th>${LANGUAGES.map((l) => `<th style="--c:${familyColor(l.family)}">${esc(l.name)}</th>`).join('')}</tr></thead>
          <tbody>
            ${MATRIX.map((row) => `<tr><th class="cap"><span>${esc(row.capability)}</span><small>${esc(row.why)}</small></th>${LANGUAGES.map((l) => cell(row, l.id)).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
      <section class="panel">
        <h2>The reasons, row by row</h2>
        ${MATRIX.map((row) => `
          <div class="axis">
            <div class="axis-head"><span class="k">${esc(row.capability)}</span><span class="q">${esc(row.why)}</span></div>
            <ul>${LANGUAGES.filter((l) => row.notes && row.notes[l.id]).map((l) =>
              `<li><b>${esc(l.name)}</b> — ${esc(row.notes[l.id])}</li>`).join('')}</ul>
          </div>`).join('')}
      </section>`;
  }

  function viewCompare(params) {
    const picks = comparePicks(params);
    const options = (sel) => LANGUAGES.map((l) =>
      `<option value="${l.id}"${sel === l.id ? ' selected' : ''}>${esc(l.name)}</option>`).join('');

    const rows = AXES.map((axis) => `
      <tr><th>${esc(axis.label)}</th>${picks.map((id) => {
        let v = BY_ID[id][axis.key];
        if (Array.isArray(v)) v = v.join(' · ');
        return `<td>${esc(String(v))}</td>`;
      }).join('')}</tr>`).join('');

    const shared = TASKS.filter((t) => picks.every((id) => t.snippets[id]));

    return `<h1>Compare</h1>
      <p class="lede">Pick two or three languages and see the same tasks side by side, plus their
      answers to the twelve axes. Anything with the same shape in both columns is a similarity worth
      noticing; anything that is only in one column is a design decision.</p>
      <div class="controls">
        <label>first <select data-act="compare-slot" data-slot="0">${options(picks[0])}</select></label>
        <label>second <select data-act="compare-slot" data-slot="1">${options(picks[1])}</select></label>
        <label>third <select data-act="compare-slot" data-slot="2"><option value="">—</option>${options(picks[2])}</select></label>
      </div>
      <section class="panel">
        <h2>The twelve axes, side by side</h2>
        <div class="matrix-wrap"><table class="axes-table">
          <thead><tr><th>axis</th>${picks.map((id) => `<th>${esc(BY_ID[id].name)}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </section>
      <section class="panel">
        <h2>Same task, side by side</h2>
        <p class="muted">${shared.length} tasks have entries for all ${picks.length} languages; scope notes identify omitted code.</p>
        ${shared.map((t) => `
          <div class="compare-task">
            <h3><a href="#/task/${t.id}">${esc(t.title)}</a></h3>
            <p class="prompt"><span class="k">do this</span> ${esc(t.prompt)}</p>
            <div class="compare-row">${picks.map((id) => snippetCard(t, id)).join('')}</div>
          </div>`).join('')}
      </section>`;
  }

  function viewSearch(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return `<h1>Search</h1><p class="lede">Type in the box above. Searches every snippet,
      note, run command, task, language profile and concept.</p>`;
    const hits = [];
    const push = (title, sub, href) => hits.push({ title, sub, href });

    TASKS.forEach((t) => {
      Object.entries(t.snippets).forEach(([lang, s]) => {
        const haystack = [s.code, s.note, s.run, s.expect, s.partial, t.title, t.prompt, t.why, t.takeaway].join('\n').toLowerCase();
        if (haystack.includes(q)) {
          const lines = (s.code || '').split('\n').filter((l) => l.toLowerCase().includes(q));
          push(`${t.title} — ${BY_ID[lang] ? BY_ID[lang].name : lang}`,
               lines.length ? lines.slice(0, 3).join(' / ') : s.note,
               `#/task/${t.id}?langs=${lang}`);
        }
      });
    });
    CONCEPTS.forEach((c) => {
      const haystack = JSON.stringify(c).toLowerCase();
      if (haystack.includes(q)) push(`Fundamental: ${c.title}`, c.tagline, `#/concept/${c.id}`);
    });
    LANGUAGES.forEach((l) => {
      if (JSON.stringify(l).toLowerCase().includes(q)) push(`Language: ${l.name}`, l.tagline, `#/language/${l.id}`);
    });

    return `<h1>Search</h1>
      <p class="lede"><b>${hits.length}</b> matches for “${esc(query)}”.</p>
      <div class="grid">
        ${hits.map((h) => `<a class="concept-card" href="${h.href}">
          <b>${esc(h.title)}</b><p class="muted small">${esc(String(h.sub).slice(0, 220))}</p></a>`).join('')}
      </div>`;
  }

  function viewNotFound(route) {
    return `<h1>Not found</h1><p class="lede">Nothing is at <code>${esc(route)}</code>.</p>
      <p><a class="btn" href="#/">Back to the overview</a></p>`;
  }

  /* ------------------------------ routing -------------------------------- */
  const filters = {};
  function comparePicks(params) {
    const picks = [...new Set((params.get('langs') || 'python,rust').split(',').filter((id) => BY_ID[id]))].slice(0, 3);
    for (const id of ['python', 'rust']) {
      if (picks.length < 2 && !picks.includes(id)) picks.push(id);
    }
    return picks;
  }

  function parseHash() {
    const raw = (location.hash || '#/').replace(/^#/, '');
    const [path, query] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    return { parts, params: new URLSearchParams(query || '') };
  }

  function render() {
    const { parts, params } = parseHash();
    const view = parts[0] || '';
    let html;

    if (!view) html = viewOverview();
    else if (view === 'tasks') html = viewTasks();
    else if (view === 'task') {
      const t = TASK_BY_ID[parts[1]];
      if (t) filters[t.id] = new Set((params.get('langs') || '').split(',').filter((id) => BY_ID[id]));
      html = t ? viewTask(t, filters[t.id]) : viewNotFound(parts.join('/'));
    } else if (view === 'languages') html = viewLanguages();
    else if (view === 'language') {
      const l = BY_ID[parts[1]];
      html = l ? viewLanguage(l) : viewNotFound(parts.join('/'));
    } else if (view === 'concepts') html = viewConcepts();
    else if (view === 'concept') {
      const c = CONCEPTS.find((x) => x.id === parts[1]);
      html = c ? viewConcept(c) : viewNotFound(parts.join('/'));
    } else if (view === 'matrix') html = viewMatrix();
    else if (view === 'compare') html = viewCompare(params);
    else if (view === 'about') html = viewAbout();
    else if (view === 'search') html = viewSearch(params.get('q') || '');
    else html = viewNotFound(parts.join('/'));

    const app = document.getElementById('app');
    app.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    document.querySelectorAll('.nav a').forEach((a) => {
      const section = { task: 'tasks', language: 'languages', concept: 'concepts' }[view] || view;
      const active = a.getAttribute('href') === '#/' + section;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const input = document.getElementById('search-input');
    if (input && view === 'search') input.value = params.get('q') || '';
    document.title = TITLE;
  }

  /* ------------------------------ actions -------------------------------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    }
  }

  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.skip-link')) {
      event.preventDefault();
      document.getElementById('app').focus();
      return;
    }
    const target = event.target.closest('[data-act]');
    if (!target) return;
    const act = target.dataset.act;

    if (act === 'copy' || act === 'copyrun') {
      const snip = SNIPPETS[target.dataset.snip];
      if (!snip) return;
      copyText(act === 'copy' ? snip.code : snip.run).then((ok) =>
        toast(ok ? (act === 'copy' ? 'code copied' : 'command copied') : 'copy failed'));
      event.preventDefault();
      return;
    }

    if (act === 'copy-all') {
      const task = TASK_BY_ID[target.dataset.task];
      const langs = visibleLangs(task, filters[task.id]);
      const text = langs.map((id) => {
        const s = task.snippets[id];
        const name = BY_ID[id] ? BY_ID[id].name : id;
        if (s.na) return `/* ${name}: outside this example’s scope — ${s.note} */`;
        return `/* ${name} — ${s.file} */\n${s.code}`;
      }).join('\n\n');
      copyText(text).then((ok) => toast(ok ? `copied ${langs.length} examples` : 'copy failed'));
      event.preventDefault();
      return;
    }

    if (act === 'filter') {
      const { parts } = parseHash();
      const taskId = parts[1];
      const lang = target.dataset.lang;
      if (lang === 'all') delete filters[taskId];
      else {
        const set = filters[taskId] || new Set();
        if (set.has(lang)) set.delete(lang); else set.add(lang);
        if (set.size) filters[taskId] = set; else delete filters[taskId];
      }
      const selected = filters[taskId];
      location.hash = `#/task/${taskId}${selected && selected.size ? '?langs=' + [...selected].join(',') : ''}`;
      return;
    }

    if (act === 'theme') {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('pl-theme', next); } catch { /* storage is optional */ }
      return;
    }

    if (act === 'cell') {
      location.hash = `#/language/${target.dataset.lang}`;
    }
  });

  document.addEventListener('change', (event) => {
    const sel = event.target.closest('[data-act="compare-slot"]');
    if (!sel) return;
    const compareSlots = comparePicks(parseHash().params);
    compareSlots[Number(sel.dataset.slot)] = sel.value;
    const picked = compareSlots.filter(Boolean);
    location.hash = `#/compare?langs=${picked.join(',')}`;
  });

  document.addEventListener('keydown', (event) => {
    const typing = /input|textarea|select/i.test((document.activeElement || {}).tagName || '');
    if (event.key === '/' && !typing) {
      event.preventDefault();
      document.getElementById('search-input').focus();
    } else if (event.key === 'Escape' && typing) {
      document.activeElement.blur();
    }
  });

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const q = searchInput.value.trim();
    location.hash = q ? `#/search?q=${encodeURIComponent(q)}` : '#/';
  });
  searchInput.addEventListener('input', () => {
    if (parseHash().parts[0] === 'search') {
      const q = searchInput.value.trim();
      history.replaceState(null, '', q ? `#/search?q=${encodeURIComponent(q)}` : '#/search');
      render();
    }
  });

  window.addEventListener('hashchange', render);

  try {
    const theme = localStorage.getItem('pl-theme');
    if (['dark', 'light'].includes(theme)) document.documentElement.dataset.theme = theme;
  } catch { /* the run already reported the failure */ }
  render();
})();
