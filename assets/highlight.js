/* ---------------------------------------------------------------------------
 * highlight.js — a small, dependency-free syntax highlighter.
 *
 * It is deliberately a scanner rather than a pile of regexes: comments are
 * recognised before strings, strings before numbers, words last. That gives
 * one pass over the text and no catastrophic backtracking.
 *
 * Everything outside a recognised token is HTML-escaped, so the output is
 * always safe to insert with innerHTML.
 * ------------------------------------------------------------------------- */
(function () {
  'use strict';

  const C_KEYWORDS = ['int', 'char', 'void', 'return', 'if', 'else', 'for', 'while', 'do',
    'sizeof', 'struct', 'union', 'enum', 'typedef', 'const', 'unsigned', 'signed', 'static',
    'break', 'continue', 'switch', 'case', 'default', 'goto', 'extern', 'long', 'short',
    'float', 'double', 'inline', 'register', 'volatile', 'auto', 'NULL', 'malloc', 'free',
    'typedef', 'exit', 'printf', 'puts', 'fprintf', 'strcmp', 'strcpy', 'strtok', 'strlen',
    'main', 'include', 'define', 'stderr', 'stdout'];

  const C_TYPES = ['size_t', 'FILE', 'uint8_t', 'int32_t', 'int64_t', 'bool', 'ptrdiff_t', 'ssize_t'];

  const SPECS = {
    asm: {
      line: ['//', '#'],
      block: [['/*', '*/']],
      strings: ['"'],
      keywords: ['mov', 'movz', 'movk', 'ldr', 'ldrb', 'str', 'strb', 'ldp', 'stp', 'add', 'sub',
        'mul', 'madd', 'msub', 'sdiv', 'udiv', 'cmp', 'cbz', 'cbnz', 'b', 'bl', 'blr', 'ret', 'br',
        'adrp', 'svc', 'nop', 'fmov', 'scvtf', 'fmul', 'fadd', 'csel', 'tst', 'lsl', 'sxtw', 'lsl',
        'b.eq', 'b.ne', 'b.gt', 'b.ge', 'b.lt', 'b.le', 'b.gt', 'eq', 'ne', 'gt', 'ge', 'lt', 'le',
        'section', 'globl', 'byte', 'word', 'quad', 'double', 'asciz', 'ascii', 'space', 'p2align',
        'align', 'text', 'data', '_main', 'wzr', 'xzr', 'sp']
    },
    c: {
      line: ['//'],
      block: [['/*', '*/']],
      strings: ['"', "'"],
      keywords: C_KEYWORDS,
      types: C_TYPES
    },
    cpp: {
      line: ['//'],
      block: [['/*', '*/']],
      strings: ['"', "'"],
      keywords: C_KEYWORDS.concat(['class', 'public', 'private', 'protected', 'virtual', 'template',
        'typename', 'namespace', 'using', 'new', 'delete', 'this', 'nullptr', 'true', 'false',
        'constexpr', 'noexcept', 'operator', 'friend', 'explicit', 'mutable', 'try', 'catch',
        'throw', 'override', 'final', 'auto', 'static_cast', 'dynamic_cast', 'const_cast',
        'reinterpret_cast', 'std', 'cout', 'cin', 'endl', 'vector', 'string', 'map', 'set',
        'queue', 'deque', 'mutex', 'thread', 'variant', 'visit', 'lock_guard', 'accumulate',
        'transform', 'copy_if', 'max_element', 'back_inserter', 'optional', 'move', 'swap']),
      types: ['size_t', 'int32_t', 'int64_t', 'bool', 'string', 'uint64_t']
    },
    rust: {
      line: ['//'],
      block: [['/*', '*/']],
      strings: ['"'],
      keywords: ['fn', 'let', 'mut', 'const', 'static', 'if', 'else', 'match', 'for', 'in', 'while',
        'loop', 'return', 'struct', 'enum', 'impl', 'trait', 'use', 'pub', 'mod', 'crate', 'where',
        'as', 'ref', 'move', 'dyn', 'box', 'unsafe', 'async', 'await', 'true', 'false', 'self',
        'Self', 'super', 'type', 'break', 'continue', 'extern'],
      builtins: ['Some', 'None', 'Ok', 'Err', 'Result', 'Option', 'String', 'Vec', 'HashMap',
        'HashSet', 'BTreeMap', 'VecDeque', 'Arc', 'Mutex', 'println', 'print', 'format', 'vec',
        'unwrap', 'expect', 'iter', 'map', 'collect', 'filter', 'sum', 'join', 'to_string',
        'spawn', 'join', 'lock', 'clone']
    },
    go: {
      line: ['//'],
      block: [['/*', '*/']],
      strings: ['"', '`'],
      keywords: ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'map',
        'chan', 'go', 'defer', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default',
        'select', 'break', 'continue', 'fallthrough'],
      builtins: ['nil', 'true', 'false', 'string', 'int', 'float64', 'bool', 'error', 'byte', 'rune',
        'make', 'append', 'len', 'cap', 'copy', 'delete', 'new', 'panic', 'recover', 'fmt', 'Printf',
        'Println', 'Sprintf', 'errors', 'New', 'sort', 'Strings', 'Slice', 'sync', 'WaitGroup',
        'Mutex', 'strings', 'strconv', 'time']
    },
    java: {
      line: ['//'],
      block: [['/*', '*/']],
      strings: ['"', "'"],
      keywords: ['public', 'private', 'protected', 'static', 'final', 'void', 'class', 'interface',
        'record', 'sealed', 'permits', 'extends', 'implements', 'new', 'return', 'if', 'else',
        'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch',
        'finally', 'throw', 'throws', 'import', 'package', 'this', 'super', 'instanceof', 'var',
        'abstract', 'synchronized', 'volatile', 'enum', 'null', 'true', 'false'],
      types: ['int', 'double', 'float', 'long', 'boolean', 'char', 'byte', 'short', 'String',
        'Integer', 'Double', 'List', 'Map', 'Set', 'ArrayList', 'HashMap', 'TreeSet', 'LinkedHashMap',
        'Math', 'StringBuilder', 'StringJoiner', 'Objects', 'Arrays', 'Stream', 'Collectors',
        'Comparator', 'AtomicInteger', 'ExecutorService', 'Executors', 'Deque', 'ArrayDeque'],
      builtins: ['System', 'out', 'println', 'printf', 'stream', 'map', 'filter', 'collect', 'toList',
        'sum', 'max', 'orElseThrow', 'valueOf', 'get', 'put', 'add', 'join']
    },
    csharp: {
      line: ['//'],
      block: [['/*', '*/']],
      strings: ['"', "'"],
      keywords: ['using', 'namespace', 'class', 'record', 'abstract', 'sealed', 'static', 'void',
        'var', 'new', 'return', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case',
        'default', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'public', 'private',
        'protected', 'internal', 'out', 'ref', 'in', 'async', 'await', 'is', 'interface', 'struct',
        'readonly', 'const', 'null', 'true', 'false', 'this', 'base', 'override', 'virtual', 'when'],
      types: ['int', 'double', 'float', 'long', 'bool', 'char', 'string', 'object', 'List',
        'Dictionary', 'SortedDictionary', 'SortedSet', 'Queue', 'Task', 'Interlocked', 'Math',
        'Enumerable', 'Array'],
      builtins: ['Console', 'WriteLine', 'Select', 'Where', 'Sum', 'Max', 'OrderBy', 'OrderByDescending',
        'GroupBy', 'ThenBy', 'Take', 'ToArray', 'ToList', 'Aggregate', 'Yield', 'WhenAll', 'Join']
    },
    python: {
      line: ['#'],
      block: [],
      strings: ['"', "'"],
      keywords: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or',
        'import', 'from', 'as', 'class', 'try', 'except', 'finally', 'raise', 'with', 'lambda',
        'global', 'nonlocal', 'pass', 'assert', 'yield', 'del', 'is', 'match', 'case', 'None',
        'True', 'False', 'async', 'await', 'self'],
      builtins: ['print', 'len', 'range', 'sum', 'max', 'min', 'abs', 'sorted', 'list', 'dict',
        'set', 'tuple', 'str', 'int', 'float', 'map', 'filter', 'zip', 'enumerate', 'any', 'all',
        'Counter', 'split', 'join', 'append', 'items', 'values', 'keys', 'get', 'format']
    },
    js: {
      line: ['//'],
      block: [['/*', '*/']],
      strings: ['"', "'", '`'],
      keywords: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'do',
        'of', 'in', 'class', 'new', 'this', 'try', 'catch', 'finally', 'throw', 'async', 'await',
        'typeof', 'instanceof', 'switch', 'case', 'default', 'break', 'continue', 'import', 'export',
        'from', 'null', 'undefined', 'true', 'false', 'delete', 'yield'],
      builtins: ['console', 'log', 'Math', 'Object', 'Array', 'Set', 'Map', 'JSON', 'Promise',
        'join', 'map', 'filter', 'reduce', 'sort', 'slice', 'push', 'shift', 'split', 'length',
        'forEach', 'entries', 'keys', 'values', 'toFixed', 'Number', 'String', 'setImmediate']
    },
    bash: {
      line: ['#'],
      block: [],
      strings: ['"', "'"],
      keywords: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done', 'case',
        'esac', 'function', 'local', 'declare', 'return', 'in', 'exit', 'set', 'export', 'readonly',
        'shift', 'source', 'true', 'false', 'break', 'continue', 'printf', 'echo', 'read', 'wait',
        'trap', 'test', 'typeset'],
      builtins: ['mktemp', 'awk', 'sed', 'grep', 'sort', 'uniq', 'tr', 'head', 'tail', 'cut', 'paste',
        'wc', 'cat', 'rm', 'mkdir', 'basename', 'dirname', 'xargs', 'env', 'bc']
    },
    sql: {
      caseInsensitive: true,
      line: ['--'],
      block: [['/*', '*/']],
      strings: ["'", '"'],
      keywords: ['select', 'from', 'where', 'group', 'by', 'order', 'having', 'limit', 'offset',
        'join', 'inner', 'left', 'right', 'outer', 'cross', 'on', 'as', 'with', 'recursive', 'union',
        'all', 'case', 'when', 'then', 'else', 'end', 'insert', 'into', 'values', 'update', 'set',
        'delete', 'create', 'table', 'view', 'index', 'and', 'or', 'not', 'null', 'is', 'distinct',
        'asc', 'desc', 'in', 'exists', 'between', 'like', 'primary', 'key', 'foreign', 'references',
        'constraint', 'check', 'default', 'begin', 'commit', 'rollback', 'explain', 'analyze'],
      builtins: ['sum', 'count', 'max', 'min', 'avg', 'cast', 'coalesce', 'group_concat', 'printf',
        'instr', 'substr', 'length', 'upper', 'lower', 'round', 'abs', 'ifnull', 'nullif', 'text',
        'integer', 'real']
    },
    haskell: {
      line: ['--'],
      block: [['{-', '-}']],
      strings: ['"', "'"],
      keywords: ['module', 'where', 'import', 'qualified', 'hiding', 'let', 'in', 'data', 'type',
        'newtype', 'deriving', 'instance', 'class', 'case', 'of', 'if', 'then', 'else', 'do', 'infix',
        'foreign', 'default', 'forall'],
      builtins: ['main', 'putStrLn', 'print', 'show', 'map', 'filter', 'foldr', 'foldl', 'sum',
        'maximum', 'minimum', 'nub', 'sort', 'sortBy', 'group', 'words', 'unwords', 'intercalate',
        'length', 'head', 'tail', 'otherwise', 'error', 'id', 'pure', 'return', 'IO', 'Int', 'Double',
        'Bool', 'Char', 'String', 'Integer', 'Maybe', 'Either', 'Just', 'Nothing', 'Left', 'Right',
        'True', 'False', 'fst', 'snd', 'zip', 'take', 'drop', 'until', 'M']
    },
    ocaml: {
      line: [],
      block: [['(*', '*)']],
      strings: ['"', "'"],
      keywords: ['let', 'rec', 'in', 'match', 'with', 'function', 'type', 'of', 'if', 'then', 'else',
        'for', 'to', 'downto', 'do', 'done', 'while', 'begin', 'end', 'module', 'open', 'exception',
        'try', 'raise', 'and', 'or', 'not', 'fun', 'mutable', 'ref', 'as', 'when', 'sig', 'struct',
        'val', 'mutable'],
      builtins: ['print_endline', 'printf', 'sprintf', 'string_of_int', 'string_of_float', 'int_of_string',
        'float_of_string', 'List', 'String', 'Array', 'Hashtbl', 'Printf', 'compare', 'compare',
        'true', 'false', 'None', 'Some', 'Ok', 'Error', 'Mutex', 'Domain', 'Thread', 'min_int',
        'max_int', 'failwith', 'ignore', 'exit']
    },
    prolog: {
      line: ['%'],
      block: [['/*', '*/']],
      strings: ['"', "'"],
      keywords: ['initialization', 'use_module', 'module', 'library', 'is', 'mod', 'not', 'fail',
        'true', 'false', 'repeat', 'halt', 'format', 'write', 'writeln', 'nl', 'length', 'member',
        'append', 'findall', 'setof', 'bagof', 'forall', 'between', 'nth1', 'last', 'aggregate_all',
        'maplist', 'include', 'exclude', 'sort', 'msort', 'atomic_list_concat', 'number', 'atom',
        'var', 'nonvar', 'assert', 'retract', 'call', 'cut', 'if', 'then', 'else'],
      builtins: ['X', 'Y', 'Z']
    },
    datalog: {
      line: ['//'],
      block: [['/*', '*/']],
      strings: ['"'],
      keywords: ['decl', 'input', 'output', 'type', 'printsize', 'number', 'symbol', 'count', 'sum',
        'min', 'max', 'mean', 'contains', 'range', 'cat', 'ord', 'strlen', 'substr', 'to_number',
        'to_string'],
      builtins: ['true', 'false']
    }
  };

  const esc = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const span = (cls, text) => '<span class="tok-' + cls + '">' + esc(text) + '</span>';

  const WORD_START = /[A-Za-z_@.$]/;
  const WORD_CHAR = /[A-Za-z0-9_@.$]/;

  function highlight(code, lang) {
    const spec = SPECS[lang] || SPECS.c;
    const words = new Set(spec.keywords || []);
    const types = new Set(spec.types || []);
    const builtins = new Set(spec.builtins || []);
    const line = spec.line || [];
    const block = spec.block || [];
    const strings = spec.strings || ['"'];
    const lower = (w) => (spec.caseInsensitive ? w.toLowerCase() : w);

    let out = '';
    let i = 0;
    const n = code.length;

    while (i < n) {
      const ch = code[i];

      /* block comments first: they swallow everything, including quotes */
      let handled = false;
      for (const [open, close] of block) {
        if (code.startsWith(open, i)) {
          const end = code.indexOf(close, i + open.length);
          const j = end === -1 ? n : end + close.length;
          out += span('com', code.slice(i, j));
          i = j;
          handled = true;
          break;
        }
      }
      if (handled) continue;

      /* then line comments */
      let lineToken = null;
      for (const token of line) {
        if (code.startsWith(token, i)) { lineToken = token; break; }
      }
      if (lineToken) {
        let j = code.indexOf('\n', i);
        if (j === -1) j = n;
        out += span('com', code.slice(i, j));
        i = j;
        continue;
      }

      /* strings */
      if (strings.includes(ch)) {
        let j = i + 1;
        while (j < n) {
          if (code[j] === '\\') { j += 2; continue; }
          if (code[j] === ch) { j++; break; }
          if (code[j] === '\n' && ch !== '`') break;
          j++;
        }
        out += span('str', code.slice(i, j));
        i = j;
        continue;
      }

      /* numbers */
      if (ch >= '0' && ch <= '9' && !(i > 0 && /[A-Za-z0-9_.]/.test(code[i - 1]))) {
        let j = i;
        while (j < n && /[0-9a-fA-FxXoObB_.]/.test(code[j])) j++;
        out += span('num', code.slice(i, j));
        i = j;
        continue;
      }

      /* words: keywords, types, builtins, or plain */
      if (WORD_START.test(ch)) {
        let j = i;
        while (j < n && WORD_CHAR.test(code[j])) j++;
        const word = code.slice(i, j);
        const key = lower(word);
        let cls = '';
        if (words.has(key)) cls = 'kw';
        else if (types.has(key)) cls = 'ty';
        else if (builtins.has(key)) cls = 'bi';
        out += cls ? span(cls, word) : esc(word);
        i = j;
        continue;
      }

      out += esc(ch);
      i++;
    }

    return out;
  }

  window.highlightCode = highlight;
  window.escapeHtml = esc;
  window.HIGHLIGHT_LANGS = Object.keys(SPECS);
})();
