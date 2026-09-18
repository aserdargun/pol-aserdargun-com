/* ---------------------------------------------------------------------------
 * concepts.js — the fundamentals.
 *
 * Each concept answers the same two questions:
 *   same[]   what every one of the fifteen languages does identically
 *   differs  where they genuinely diverge, as positions on an axis
 *
 * The positions are not "better/worse" scales. They are the actual design
 * choices, and almost every position here is defensible.
 * ------------------------------------------------------------------------- */
window.CONCEPTS = [
  {
    id: 'program',
    title: 'What a program is',
    tagline: 'The deepest difference in the list, and the one everything else follows from.',
    same: [
      'Every one of the fifteen can express a computation that produces a value or an effect — all fifteen solve the same thirteen tasks in this app.',
      'Every one has a notion of a named, reusable unit of work: a label, a function, a predicate, a rule, a query block, or a class.',
      'Every one is ultimately executed by the same kind of machine: a CPU executing instructions, or an interpreter that itself is one.'
    ],
    differs: [
      {
        axis: 'A program is…',
        positions: [
          { label: 'a sequence of instructions over memory', langs: ['asm', 'c', 'cpp', 'rust', 'go', 'bash'] },
          { label: 'a set of objects exchanging messages', langs: ['java', 'csharp', 'python', 'js'] },
          { label: 'a collection of mathematical definitions', langs: ['haskell', 'ocaml'] },
          { label: 'a set of facts and inference rules', langs: ['prolog', 'datalog'] },
          { label: 'a description of a result set', langs: ['sql'] }
        ]
      },
      {
        axis: 'Who decides the order of execution',
        positions: [
          { label: 'You do, line by line', langs: ['asm', 'c', 'cpp', 'rust', 'go', 'java', 'csharp', 'python', 'js', 'bash'] },
          { label: 'The order is fixed by the data dependencies', langs: ['haskell', 'ocaml'] },
          { label: 'The engine chooses (search)', langs: ['prolog'] },
          { label: 'The engine chooses (fixpoint, any order)', langs: ['datalog', 'sql'] }
        ]
      },
      {
        axis: 'What "running it" means',
        positions: [
          { label: 'The binary runs directly on the CPU', langs: ['asm', 'c', 'cpp', 'rust', 'go'] },
          { label: 'A virtual machine executes bytecode or IL', langs: ['java', 'csharp', 'python'] },
          { label: 'A JavaScript engine JIT-compiles functions', langs: ['js'] },
          { label: 'Another program (the shell) launches programs', langs: ['bash'] },
          { label: 'A query or a proof is evaluated against data', langs: ['sql', 'prolog', 'datalog'] },
          { label: 'GHC compiles to native code through graph reduction', langs: ['haskell', 'ocaml'] }
        ]
      },
      {
        axis: 'Smallest complete program',
        positions: [
          { label: 'One line, no ceremony', langs: ['python', 'js', 'bash', 'sql', 'haskell', 'ocaml', 'rust'], note: 'rust needs fn main, but it is one declaration' },
          { label: 'An entry symbol and a stack frame', langs: ['asm', 'c', 'cpp'] },
          { label: 'A package plus an entry function', langs: ['go'], note: 'package main + func main' },
          { label: 'A class with a specific static method', langs: ['java', 'csharp'] },
          { label: 'A fact and an output directive', langs: ['datalog'] },
          { label: 'A predicate and a query', langs: ['prolog'] }
        ]
      }
    ]
  },

  {
    id: 'types',
    title: 'Types',
    tagline: 'Four independent questions that people usually bundle into one: when, how strictly, how much is inferred, and what is not allowed to be null.',
    same: [
      'All fifteen distinguish numbers from text somewhere, even if only by convention (Assembly and Bash: by which instruction or command you use).',
      'All fifteen can express "a collection of things of the same kind" — as a language feature, a library type, or a relation.',
      'In all fifteen the types exist to catch mistakes early. What differs is what "early" means and what counts as a mistake.'
    ],
    differs: [
      {
        axis: 'When types are checked',
        positions: [
          { label: 'Never (the hardware has words, not types)', langs: ['asm'] },
          { label: 'At compile time, always', langs: ['c', 'cpp', 'rust', 'go', 'java', 'csharp', 'haskell', 'ocaml'] },
          { label: 'At run time, when the value is used', langs: ['python', 'js', 'bash', 'prolog'] },
          { label: 'At declaration time, then partly at run time', langs: ['sql'], note: 'column types are static; coercion and NULL are dynamic surprises' },
          { label: 'Statically, but by the engine before it runs', langs: ['datalog'], note: 'Soufflé rejects ill-typed programs' }
        ]
      },
      {
        axis: 'How much is inferred for you',
        positions: [
          { label: 'Nothing — every type is written', langs: ['asm', 'c', 'go'], note: 'Go has := but not for struct fields or parameters' },
          { label: 'Locals only (var / auto)', langs: ['cpp', 'java', 'csharp'] },
          { label: 'Every local binding, not signatures', langs: ['rust'] },
          { label: 'Everything, including function signatures', langs: ['haskell', 'ocaml'] },
          { label: 'Optional hints that are not enforced', langs: ['python'], note: 'checked by mypy/pyright, not by the interpreter' },
          { label: 'Not applicable — the types live in the data', langs: ['sql', 'datalog', 'prolog', 'bash'] }
        ]
      },
      {
        axis: 'Generics: how do you write code for any type?',
        positions: [
          { label: 'Monomorphised at compile time (zero cost, code bloat)', langs: ['cpp', 'rust'] },
          { label: 'Erased at run time (one implementation, casts inserted)', langs: ['java'] },
          { label: 'Reified at run time (the type is real)', langs: ['csharp'] },
          { label: 'Dictionary passing / boxed shapes', langs: ['go'] },
          { label: 'Parametric polymorphism by type inference', langs: ['haskell', 'ocaml'] },
          { label: 'Not needed — nothing is typed', langs: ['python', 'js', 'bash', 'prolog', 'datalog', 'sql'] },
          { label: 'Not available at all', langs: ['asm', 'c'] }
        ]
      },
      {
        axis: 'Is the absence of a value part of the type?',
        positions: [
          { label: 'Yes — Option/Maybe, and null cannot be assigned', langs: ['rust', 'haskell', 'ocaml'] },
          { label: 'Yes by annotation — nullable reference types', langs: ['csharp'], note: 'the compiler warns, the runtime does not enforce' },
          { label: 'No — null/undefined/nil is a value of every type', langs: ['c', 'cpp', 'go', 'java', 'python', 'js'] },
          { label: 'No such thing: it is simply NULL, a third truth value', langs: ['sql'] },
          { label: 'Not applicable — absent data is simply a fact that is not there', langs: ['prolog', 'datalog', 'asm', 'bash'] }
        ]
      },
      {
        axis: 'Static types, in practice',
        positions: [
          { label: 'Strong enough to make refactoring mechanical', langs: ['haskell', 'ocaml', 'rust', 'csharp', 'java', 'cpp'] },
          { label: 'Fine, with escape hatches you must be disciplined about', langs: ['c', 'go'] },
          { label: 'Optional: the ecosystem decides', langs: ['python', 'js'], note: 'TypeScript is JS with this gap filled' }
        ]
      }
    ]
  },

  {
    id: 'memory',
    title: 'Memory',
    tagline: 'Five genuinely different answers to "who frees this, and when?" — and this app can demonstrate every one of them.',
    same: [
      'All fifteen allocate and reuse memory; several just make the decision for you.',
      'All fifteen can leak memory. Garbage collection prevents dangling pointers, not leaks — a reachable object graph you forgot about is a leak in every language.',
      'All fifteen ultimately use the same machine: a stack, a heap, and addresses. The differences are all about who is allowed to write the addresses down.'
    ],
    differs: [
      {
        axis: 'Who frees the memory',
        positions: [
          { label: 'You do, at the instruction level', langs: ['asm', 'c'], note: 'every byte, every time, or the program dies or leaks' },
          { label: 'You do, but the type system guarantees it (RAII)', langs: ['cpp', 'rust'], note: 'destructors; in Rust the borrow checker proves it safe' },
          { label: 'A garbage collector does, and you cannot interfere', langs: ['go', 'java', 'csharp', 'js', 'haskell', 'ocaml'] },
          { label: 'Reference counting plus cycle collection', langs: ['python'] },
          { label: 'The engine does — storage is not your concern', langs: ['sql', 'datalog'] },
          { label: 'The operating system does, when the process exits', langs: ['bash', 'prolog'], note: 'the shell reaps processes; the Prolog engine owns its stacks' }
        ]
      },
      {
        axis: 'What a memory bug looks like',
        positions: [
          { label: 'Silent corruption, or a segfault minutes later', langs: ['asm', 'c'] },
          { label: 'Undefined behaviour the optimizer is allowed to exploit', langs: ['c', 'cpp'] },
          { label: 'Refused at compile time, with a diagram of the borrow', langs: ['rust'] },
          { label: 'A pause, or an out-of-memory kill', langs: ['go', 'java', 'csharp', 'js', 'haskell', 'ocaml', 'python'] }
        ]
      },
      {
        axis: 'Determinism of destruction',
        positions: [
          { label: 'Exactly when the scope ends, guaranteed', langs: ['cpp', 'rust'], note: 'RAII: the foundation of lock guards, file handles, sockets' },
          { label: 'At some point after it becomes unreachable', langs: ['go', 'java', 'csharp', 'js', 'haskell', 'ocaml'], note: 'hence IDisposable, using, with, defer' },
          { label: 'Immediately at zero references (mostly)', langs: ['python'] },
          { label: 'Not applicable', langs: ['asm', 'c', 'bash', 'sql', 'datalog', 'prolog'] }
        ]
      },
      {
        axis: 'Can you see the layout?',
        positions: [
          { label: 'You choose every byte and alignment', langs: ['asm', 'c', 'rust'], note: 'repr(C), #[repr(packed)], manual structs' },
          { label: 'Mostly, with rules you can learn', langs: ['cpp', 'csharp'], note: 'Span<T>, structs, stackalloc; vtable for virtual calls' },
          { label: 'No, and you should not care', langs: ['java', 'go', 'python', 'js', 'haskell', 'ocaml'], note: 'Go and Java hide layout but still care about allocation counts' },
          { label: 'There is no layout you own', langs: ['sql', 'datalog', 'bash', 'prolog'] }
        ]
      }
    ]
  },

  {
    id: 'control',
    title: 'Control flow and repetition',
    tagline: 'Every language here repeats work; only about half of them have a loop keyword, and two of the fifteen deliberately do not.',
    same: [
      'All fifteen can branch on a condition (in Datalog, by writing two rules with disjoint guards).',
      'All fifteen can repeat: with a loop, with recursion, with a query, or by iterating to a fixpoint.',
      'All fifteen can express the thirteen tasks in this app — including the ones where the "loop" is implicit in the engine.'
    ],
    differs: [
      {
        axis: 'How repetition is written',
        positions: [
          { label: 'goto and conditional branches', langs: ['asm'] },
          { label: 'for / while loops, plus recursion', langs: ['c', 'cpp', 'rust', 'go', 'java', 'csharp', 'python', 'js', 'bash', 'ocaml'] },
          { label: 'Recursion and higher-order functions over lists', langs: ['haskell'], note: 'plus list comprehensions and ranges' },
          { label: 'Recursive rules, evaluated as a query', langs: ['sql'], note: 'WITH RECURSIVE is the only looping construct' },
          { label: 'Backtracking over a search space', langs: ['prolog'], note: 'forall/2 and findall/3 drive enumeration; recursion does the rest' },
          { label: 'Recursive rules evaluated to a fixpoint', langs: ['datalog'], note: 'and termination is guaranteed by the language' }
        ]
      },
      {
        axis: 'How a loop says "stop"',
        positions: [
          { label: 'You set the flag; nothing checks it for you', langs: ['asm'] },
          { label: 'A condition you write, or break/return/continue', langs: ['c', 'cpp', 'rust', 'go', 'java', 'csharp', 'python', 'js', 'bash'] },
          { label: 'The list runs out', langs: ['haskell', 'ocaml', 'rust', 'python', 'js'], note: 'iteration over a finite structure' },
          { label: 'The result stops changing', langs: ['sql', 'datalog', 'prolog'], note: 'fixpoint: nothing new can be derived' },
          { label: 'A cut (!) commits to a choice', langs: ['prolog'] }
        ]
      },
      {
        axis: 'Is the loop itself a value?',
        positions: [
          { label: 'No — it is a statement', langs: ['asm', 'c', 'go', 'java', 'csharp', 'bash'] },
          { label: 'Yes — an iterator or a sequence you can compose', langs: ['rust', 'python', 'js', 'cpp'], note: 'lazy chains, generators, ranges' },
          { label: 'Yes — a lazy list, which may be infinite', langs: ['haskell', 'ocaml'] },
          { label: 'Not applicable — the engine owns the iteration', langs: ['sql', 'datalog', 'prolog'] }
        ]
      },
      {
        axis: 'What happens with an infinite loop',
        positions: [
          { label: 'The program hangs — it is your bug', langs: ['asm', 'c', 'cpp', 'rust', 'go', 'java', 'csharp', 'python', 'js', 'bash'] },
          { label: 'You get an infinite lazy structure, which is sometimes the point', langs: ['haskell'] },
          { label: 'It runs out of memory or recursion depth', langs: ['ocaml', 'python'] },
          { label: 'The engine may not terminate — a real risk in logic programming', langs: ['prolog'] },
          { label: 'Cannot happen — Datalog rules over finite data always terminate', langs: ['datalog'] },
          { label: 'The query runs until the plan says it is done', langs: ['sql'] }
        ]
      }
    ]
  },

  {
    id: 'abstraction',
    title: 'Abstraction',
    tagline: 'From "a label you branch to" to "a value you compose": the machinery a language gives you for not repeating yourself.',
    same: [
      'All fifteen can name a computation and use it more than once — that much is universal and very old.',
      'All fifteen can build a library of such names, and all fifteen have one.',
      'In all fifteen, the cost of the abstraction is a design decision someone made deliberately, not an accident.'
    ],
    differs: [
      {
        axis: 'The basic unit',
        positions: [
          { label: 'A label plus a calling convention', langs: ['asm'] },
          { label: 'A function', langs: ['c', 'go', 'rust', 'bash'] },
          { label: 'A method on a class', langs: ['java', 'csharp'] },
          { label: 'A function, and functions are values', langs: ['python', 'js', 'haskell', 'ocaml', 'cpp', 'rust'] },
          { label: 'A predicate or a rule', langs: ['prolog', 'datalog'] },
          { label: 'A table, a view, or a query', langs: ['sql'] }
        ]
      },
      {
        axis: 'Passing behaviour around (higher-order)',
        positions: [
          { label: 'Native, and the normal way to write code', langs: ['haskell', 'ocaml', 'python', 'js', 'rust', 'csharp'] },
          { label: 'Native, but the culture prefers plain loops', langs: ['go', 'java', 'cpp'] },
          { label: 'A function pointer you must call correctly', langs: ['c', 'asm'] },
          { label: 'A goal you can pass and call: maplist, include, aggregate', langs: ['prolog'] },
          { label: 'Absent — the verbs are syntax, not values', langs: ['sql'] },
          { label: 'Absent — there are no functions', langs: ['datalog', 'bash'], note: 'bash approximates it by passing a function name as a string' }
        ]
      },
      {
        axis: 'Grouping and reuse across types',
        positions: [
          { label: 'Classes and inheritance or interfaces', langs: ['java', 'csharp', 'cpp', 'python'] },
          { label: 'Traits — shared behaviour without a hierarchy', langs: ['rust'] },
          { label: 'Type classes and parametric polymorphism', langs: ['haskell'] },
          { label: 'Modules and functors (the most powerful of the group)', langs: ['ocaml'] },
          { label: 'Implicit interfaces: if it has the method, it fits', langs: ['go'] },
          { label: 'Prototypes: objects inherit from objects', langs: ['js'] },
          { label: 'C macros and link-time conventions', langs: ['c', 'asm'] },
          { label: 'Arity and clause order', langs: ['prolog', 'datalog'] },
          { label: 'Views, CTEs and schemas', langs: ['sql'] }
        ]
      },
      {
        axis: 'Abstraction cost at run time',
        positions: [
          { label: 'Nothing, if you get it right — that is the contract', langs: ['rust', 'cpp'], note: 'monomorphisation and inlining' },
          { label: 'A dynamic dispatch through a vtable or a shape', langs: ['java', 'csharp', 'go', 'python', 'js'] },
          { label: 'Whatever the engine decides — it may rewrite your query', langs: ['sql', 'datalog'] },
          { label: 'A search strategy choice in the engine', langs: ['prolog'] },
          { label: 'A jump to an address you chose', langs: ['asm', 'c'] }
        ]
      }
    ]
  },

  {
    id: 'data',
    title: 'Modelling data',
    tagline: 'Records, objects, sum types, relations and dynamic maps: five ways to say "this is what a thing is".',
    same: [
      'All fifteen can group several values into one thing that travels together.',
      'All fifteen can build a collection of those things and look one up.',
      'All fifteen can express "exactly one of these alternatives" — but in several of them nothing stops you constructing a value that is none of them, and that difference is the interesting one.'
    ],
    differs: [
      {
        axis: 'A record is…',
        positions: [
          { label: 'A memory layout with named offsets', langs: ['asm', 'c'] },
          { label: 'A struct or class with a constructor', langs: ['cpp', 'rust', 'go', 'java', 'csharp', 'python'] },
          { label: 'An object literal, or a class instance', langs: ['js'] },
          { label: 'A row in a table', langs: ['sql'] },
          { label: 'A compound term, or a fact with several arguments', langs: ['prolog', 'datalog'] },
          { label: 'Parallel arrays and separate variables', langs: ['bash'] }
        ]
      },
      {
        axis: 'Alternatives (sum types)',
        positions: [
          { label: 'A language feature, closed and exhaustive', langs: ['haskell', 'ocaml', 'rust'] },
          { label: 'Closed by sealed/abstract hierarchies plus patterns', langs: ['java', 'csharp'] },
          { label: 'std::variant, with a visitor you must make total', langs: ['cpp'] },
          { label: 'A tag field and a switch — nothing checked', langs: ['c', 'js'] },
          { label: 'Dataclasses plus match, checked at run time only', langs: ['python'] },
          { label: 'An interface plus a type switch — open, and silently extensible', langs: ['go'] },
          { label: 'A predicate per case; the caller decides how to report other input', langs: ['prolog'] },
          { label: 'A kind column plus a CHECK constraint', langs: ['sql'] },
          { label: 'Not expressible: no function symbols, no compound values', langs: ['datalog'] },
          { label: 'Not expressible: no compound values at all', langs: ['bash'] }
        ]
      },
      {
        axis: 'Collections: what ships with the language',
        positions: [
          { label: 'Nothing: you build it or import it', langs: ['asm'] },
          { label: 'Arrays are syntax; everything else is a library', langs: ['c', 'cpp'] },
          { label: 'Lists, maps, sets built in and idiomatic', langs: ['python', 'js', 'java', 'csharp', 'go', 'bash'], note: 'bash maps need 4.0+' },
          { label: 'Linked lists come with the language; maps are a library', langs: ['haskell', 'ocaml'] },
          { label: 'Lists and terms; assert/retract for a mutable store', langs: ['prolog'] },
          { label: 'Relations are the only data structure', langs: ['datalog', 'sql'] }
        ]
      },
      {
        axis: 'Mutation: may a value change?',
        positions: [
          { label: 'Always, and that is the default', langs: ['asm', 'c', 'cpp', 'java', 'csharp', 'go', 'python', 'js', 'bash', 'ocaml'] },
          { label: 'Only where explicitly marked (let mut, ref)', langs: ['rust'], note: 'and only one mutable borrow at a time' },
          { label: 'Never — you build a new value instead', langs: ['haskell'] },
          { label: 'Data is immutable; you declare new facts instead', langs: ['datalog', 'prolog'], note: 'assert/retract exist but are not the idiom' },
          { label: 'UPDATE is a statement, not a property of a value', langs: ['sql'] }
        ]
      }
    ]
  },

  {
    id: 'failure',
    title: 'Failure and uncertainty',
    tagline: 'The clearest dividing line in the whole list: does failure travel in the type, in the control flow, in a register, or not at all?',
    same: [
      'All fifteen can distinguish "the answer is 5" from "there is no answer", and every one of them can be made to print a message about it.',
      'All fifteen can be made to fail catastrophically — some by design, some by accident.',
      'In all fifteen, the mechanism was chosen for the caller\'s convenience, not for the runtime\'s.'
    ],
    differs: [
      {
        axis: 'Where failure lives',
        positions: [
          { label: 'In a register and a branch', langs: ['asm'] },
          { label: 'In a return value or an out-parameter you must check', langs: ['c', 'go'] },
          { label: 'In the type: Result, Option, Either', langs: ['rust', 'haskell', 'ocaml'] },
          { label: 'In the control flow: throw and unwind', langs: ['cpp', 'java', 'csharp', 'python', 'js'] },
          { label: 'In an exit status', langs: ['bash'] },
          { label: 'In the data: NULL, the third truth value', langs: ['sql'] },
          { label: 'Nowhere: a goal that cannot be proved simply fails', langs: ['prolog'] },
          { label: 'Nowhere: a rule that derives nothing derives nothing', langs: ['datalog'] }
        ]
      },
      {
        axis: 'Can the caller forget to handle it?',
        positions: [
          { label: 'Yes, and nothing will warn you', langs: ['asm', 'c', 'bash', 'js', 'python', 'cpp'], note: 'except a linter or a must-use annotation' },
          { label: 'Not silently: Rust warns on an unused Result', langs: ['rust'] },
          { label: 'Not at all: the type will not typecheck otherwise', langs: ['haskell', 'ocaml'], note: 'if you use Either/option rather than exceptions' },
          { label: 'Not if the exception is checked (Java)', langs: ['java'], note: 'the compiler forces declaring or catching' },
          { label: 'There is nothing to handle', langs: ['sql', 'datalog', 'prolog'] }
        ]
      },
      {
        axis: 'What "not found" looks like',
        positions: [
          { label: 'A sentinel value: -1, NULL, NaN', langs: ['c', 'cpp', 'asm'] },
          { label: 'A distinguished value of the type: undefined, null, nil', langs: ['js', 'go', 'java', 'python'] },
          { label: 'A distinct constructor: None, Nothing, Err, Left', langs: ['rust', 'haskell', 'ocaml'] },
          { label: 'No rows — which is not an error', langs: ['sql'] },
          { label: 'The goal fails and the engine backtracks', langs: ['prolog', 'datalog'] },
          { label: 'An empty string and a non-zero status', langs: ['bash'] }
        ]
      }
    ]
  },

  {
    id: 'effects',
    title: 'Side effects and I/O',
    tagline: 'Who is allowed to touch the outside world, and does the language make that visible in the code?',
    same: [
      'All fifteen can read a file, print to the screen, and talk to the network — that is what makes them useful rather than pure mathematics.',
      'All fifteen separate "compute a value" from "produce an effect" somewhere: at the type level, the statement level, or only in the programmer\'s head.',
      'All fifteen make testing harder when effects are tangled with logic. Hiding effects behind a seam is a universally good idea.'
    ],
    differs: [
      {
        axis: 'Are effects visible in the type or the syntax?',
        positions: [
          { label: 'Yes, statically: IO a cannot be called from pure code', langs: ['haskell'] },
          { label: 'By convention and by monad-ish types (Lwt, Eio)', langs: ['ocaml'] },
          { label: 'In the syntax: any statement may do anything', langs: ['asm', 'c', 'cpp', 'go', 'java', 'csharp', 'python', 'js', 'bash'] },
          { label: 'In the data model: a query is read-only by default', langs: ['sql'] },
          { label: 'Not applicable: there is no I/O in the language at all', langs: ['datalog'], note: 'input and output are engine directives' },
          { label: 'Effects are the only thing a predicate does', langs: ['prolog'] }
        ]
      },
      {
        axis: 'What a "pure" function can do',
        positions: [
          { label: 'Nothing at all but return a value', langs: ['haskell'] },
          { label: 'Anything, unless you restrict yourself', langs: ['asm', 'c', 'cpp', 'rust', 'go', 'java', 'csharp', 'python', 'js', 'bash', 'ocaml'] },
          { label: 'Read data, and that is it — writing needs a statement', langs: ['sql'] },
          { label: 'Derive new facts and nothing else', langs: ['datalog'] },
          { label: 'Print, fail, or unify — all three are the same kind of thing', langs: ['prolog'] }
        ]
      },
      {
        axis: 'Effect handling that other languages copy from here',
        positions: [
          { label: 'async/await for I/O concurrency', langs: ['js', 'csharp', 'python', 'rust'], note: 'all of it descends from Haskell\'s and C#\'s designs' },
          { label: 'RAII: effects tied to scope exit', langs: ['cpp', 'rust'], note: 'borrowed by C# (using/dispose) and Python (with)' },
          { label: 'STM: composable atomic effects', langs: ['haskell'] },
          { label: 'Transactions: effects that can be undone', langs: ['sql'] }
        ]
      }
    ]
  },

  {
    id: 'evaluation',
    title: 'From source to behaviour',
    tagline: 'Compiled, interpreted, JIT-compiled, planned or proved — five strategies with very different failure modes.',
    same: [
      'Every one of the fifteen has a lexer, a parser and some intermediate form. Some just hide it.',
      'Every one of them can tell you what went wrong with line numbers, and every one of them is worse at it than its users wish.',
      'In all fifteen, the translation step is where a whole class of bugs is caught — for free — before anything runs.'
    ],
    differs: [
      {
        axis: 'The execution strategy',
        positions: [
          { label: 'Assembled and linked to native code', langs: ['asm', 'c', 'cpp', 'rust', 'go', 'haskell', 'ocaml'] },
          { label: 'Bytecode plus a JIT', langs: ['java', 'csharp'] },
          { label: 'Bytecode interpreted (CPython); a JIT is optional', langs: ['python'] },
          { label: 'Source parsed and executed as it is read', langs: ['bash'] },
          { label: 'JIT-compiled by a browser or Node engine', langs: ['js'] },
          { label: 'A query plan, chosen by the optimizer', langs: ['sql'] },
          { label: 'SLD resolution, compiled or interpreted', langs: ['prolog'] },
          { label: 'Rules compiled to C++ or evaluated semi-naively', langs: ['datalog'] }
        ]
      },
      {
        axis: 'Evaluation order',
        positions: [
          { label: 'Strict, left to right, as written', langs: ['asm', 'c', 'cpp', 'java', 'csharp', 'go', 'python', 'js', 'bash', 'rust', 'ocaml'] },
          { label: 'Lazy: nothing is evaluated until its value is needed', langs: ['haskell'], note: 'which is why infinite lists are legal' },
          { label: 'Set-at-a-time; order is undefined without ORDER BY', langs: ['sql'] },
          { label: 'Depth-first search with backtracking', langs: ['prolog'] },
          { label: 'Bottom-up to a fixpoint, in any order the engine likes', langs: ['datalog'] }
        ]
      },
      {
        axis: 'When you find out about a mistake',
        positions: [
          { label: 'Before you can run it at all', langs: ['asm', 'c', 'cpp', 'rust', 'go', 'java', 'csharp', 'haskell', 'ocaml', 'datalog'] },
          { label: 'Usually before, sometimes at startup', langs: ['python', 'js'] },
          { label: 'When you run the specific line', langs: ['bash'], note: 'and a script with an error in line 50 does lines 1–49 first' },
          { label: 'When the query fails, at plan time or run time', langs: ['sql'] }
        ]
      },
      {
        axis: 'Startup cost versus steady-state speed',
        positions: [
          { label: 'Instant start, slow per operation', langs: ['bash', 'python'] },
          { label: 'Start in milliseconds, run at native speed', langs: ['asm', 'c', 'cpp', 'rust', 'go', 'ocaml'] },
          { label: 'Warm-up then fast — the JIT needs profiles', langs: ['java', 'csharp', 'js'] },
          { label: 'Constant cost proportional to the data', langs: ['sql', 'datalog', 'prolog'] }
        ]
      }
    ]
  },

  {
    id: 'concurrency',
    title: 'Concurrency',
    tagline: 'Five real models, one single-threaded outlier, and two languages where the question does not arise.',
    same: [
      'All ten languages with concurrency can do work while other work is in progress, and all of them make it harder to reason about the program.',
      'In every one of them, the hard part is shared mutable state — the languages that removed sharing removed the hard part with it.',
      'Every one of them has a way to wait for completion: join, WaitGroup, await, wait, or a transaction boundary.'
    ],
    differs: [
      {
        axis: 'The primitive',
        positions: [
          { label: 'OS threads, created through a library, with atomics', langs: ['asm', 'c', 'cpp'] },
          { label: 'OS threads, with the language checking what may be shared', langs: ['rust'], note: 'Send/Sync make data races a compile error' },
          { label: 'Green threads (goroutines) plus channels, scheduled by the runtime', langs: ['go'] },
          { label: 'Threads, executor pools, and now virtual threads', langs: ['java'] },
          { label: 'Tasks and async/await over a thread pool', langs: ['csharp'] },
          { label: 'One thread, an event loop, and promises', langs: ['js'] },
          { label: 'Threads (GIL-bound), asyncio, or separate processes', langs: ['python'] },
          { label: 'Background processes and pipelines', langs: ['bash'] },
          { label: 'Green threads plus software transactional memory', langs: ['haskell'] },
          { label: 'Domains: real parallelism with shared memory', langs: ['ocaml'], note: 'OCaml 5 and later' },
          { label: 'Not expressed in the language: the engine owns the threads', langs: ['sql', 'datalog'] },
          { label: 'Not part of the paradigm at all', langs: ['prolog'] }
        ]
      },
      {
        axis: 'How you avoid the races',
        positions: [
          { label: 'A lock around the shared data, manually', langs: ['asm', 'c', 'cpp', 'java', 'csharp', 'python', 'ocaml'] },
          { label: 'Channels: share by communicating instead', langs: ['go', 'rust'] },
          { label: 'Atomic operations on a single cell', langs: ['java', 'csharp', 'rust', 'c'] },
          { label: 'Do not share: keep everything local and combine at the end', langs: ['js', 'bash'] },
          { label: 'STM: transactional variables, composable blocks', langs: ['haskell'] },
          { label: 'Isolation levels: you declare what you tolerate', langs: ['sql'] },
          { label: 'Immutability makes it moot', langs: ['haskell', 'datalog'] }
        ]
      },
      {
        axis: 'The characteristic failure',
        positions: [
          { label: 'A data race that shows up once a week in production', langs: ['asm', 'c', 'cpp'] },
          { label: 'A deadlock between two locks', langs: ['java', 'csharp', 'python', 'ocaml', 'cpp'] },
          { label: 'A goroutine leak, or a channel that nobody closes', langs: ['go'] },
          { label: 'A starved event loop: one blocking call freezes everything', langs: ['js'] },
          { label: 'The GIL: threads that do not actually run in parallel', langs: ['python'] },
          { label: 'A retried transaction, which is the point', langs: ['haskell', 'sql'] },
          { label: 'Nothing: Datalog answers are order-independent by construction', langs: ['datalog'] }
        ]
      }
    ]
  },

  {
    id: 'tooling',
    title: 'Getting real work done',
    tagline: 'Build, dependency, test, debug, format: the least glamorous axis, and the one you touch every hour of every day.',
    same: [
      'All fifteen have a way to run a program, and all fifteen have some way to say "this should produce that" and check it.',
      'All fifteen have an editor story: syntax highlighting at minimum, language servers for most.',
      'In all fifteen, the size and health of the ecosystem is a stronger predictor of what gets built than the language design is.'
    ],
    differs: [
      {
        axis: 'Build and package management',
        positions: [
          { label: 'One integrated tool, nothing to configure', langs: ['rust', 'go'], note: 'cargo and go modules — widely considered the best in the list' },
          { label: 'The platform toolchain: dotnet, Maven/Gradle, opam, cabal', langs: ['csharp', 'java', 'ocaml', 'haskell'] },
          { label: 'pip plus venv/uv, or npm/pnpm', langs: ['python', 'js'] },
          { label: 'Make, CMake, Conan, vcpkg — no single answer', langs: ['c', 'cpp'] },
          { label: 'An assembler and a linker, and a Makefile if you like', langs: ['asm'] },
          { label: 'Whatever the distribution ships; scripts are the build', langs: ['bash'] },
          { label: 'Nothing to build: the database is the runtime', langs: ['sql'], note: 'migrations are the closest thing to a build step' },
          { label: 'A compiler binary plus a solver integration', langs: ['prolog', 'datalog'], note: 'Soufflé compiles Datalog to C++' }
        ]
      },
      {
        axis: 'Testing',
        positions: [
          { label: 'Built in: cargo test, go test, doctests', langs: ['rust', 'go', 'haskell', 'python'], note: 'Haskell\'s doctests keep examples honest' },
          { label: 'A dominant framework: JUnit, xUnit, pytest, Jest', langs: ['java', 'csharp', 'python', 'js'] },
          { label: 'Conventions and tools of your own choosing', langs: ['c', 'cpp', 'bash', 'ocaml'] },
          { label: 'Assertions in-language: you describe what should hold', langs: ['prolog', 'datalog', 'sql'] },
          { label: 'Manual: you check the output by eye', langs: ['asm'] }
        ]
      },
      {
        axis: 'Observability and debugging',
        positions: [
          { label: 'A debugger at the machine level: registers, memory, stack', langs: ['asm', 'c', 'cpp', 'rust'] },
          { label: 'A debugger plus sanitizers and profilers', langs: ['go', 'java', 'csharp'] },
          { label: 'Print, pdb/breakpoint, and rich tracebacks', langs: ['python', 'js', 'bash'] },
          { label: 'EXPLAIN ANALYZE: you debug the query plan', langs: ['sql'] },
          { label: 'A tracer and a profiler (GHC), or the engine\'s own output', langs: ['haskell', 'datalog'] },
          { label: 'The classic tool here is the trace itself', langs: ['prolog'] }
        ]
      },
      {
        axis: 'What the language does not give you',
        positions: [
          { label: 'Nothing: the ecosystem is enormous', langs: ['python', 'js', 'java', 'csharp'] },
          { label: 'Very little missing, but versions matter', langs: ['rust', 'go', 'cpp'] },
          { label: 'You will write what you cannot find — and there is a lot of that', langs: ['asm', 'c', 'ocaml', 'haskell'] },
          { label: 'You are inside one system, and it does everything — differently', langs: ['sql', 'prolog', 'datalog', 'bash'] }
        ]
      }
    ]
  },

  {
    id: 'universals',
    title: 'The eight things every language here has',
    tagline: 'If you are looking for the similarities, this is the list. Everything else in this app is a difference.',
    same: [
      '1 · A way to name a value and get it back. Registers, variables, bindings, columns, unification.',
      '2 · A way to group values. Structs, objects, lists, rows, terms, relations.',
      '3 · A way to choose. Branching, guards, CASE, pattern matching, clause selection.',
      '4 · A way to repeat. Loops, recursion, queries, backtracking, fixpoints.',
      '5 · A way to abstract. Labels, functions, methods, predicates, views — with parameters.',
      '6 · A way to fail, and to tell a failure from an answer.',
      '7 · A way to touch the world outside the program: input, output, storage.',
      '8 · A way to translate source into behaviour, with error messages when it cannot.'
    ],
    differs: [
      {
        axis: 'And one more thing, which is not a language feature at all',
        positions: [
          { label: 'You still have to know what you are doing', langs: ['asm', 'c', 'cpp', 'rust', 'go', 'java', 'csharp', 'python', 'js', 'bash', 'sql', 'haskell', 'ocaml', 'prolog', 'datalog'], note: 'No language in this list has ever had a solution for an unclear problem, a wrong data model, or a reader who cannot follow the reasoning. That part is the same in all fifteen, and it is the part that takes the longest to learn.' }
        ]
      }
    ]
  }
];

/* ---------------------------------------------------------------------------
 * MATRIX — one row per capability, one column per language.
 *   y  native, idiomatic, first-class
 *   p  possible: a library, a convention, or hard work
 *   n  absent in the language
 *   x  not applicable: the question is answered elsewhere by design
 * ------------------------------------------------------------------------- */
window.MATRIX_LEGEND = { y: 'native', p: 'possible / library / awkward', n: 'absent', x: 'not applicable by design' };

window.MATRIX = [
  {
    capability: 'Static type checking',
    why: 'Is a whole class of mistakes found before the program runs?',
    cells: { asm: 'n', c: 'y', cpp: 'y', rust: 'y', go: 'y', java: 'y', csharp: 'y', python: 'p', js: 'p', bash: 'n', sql: 'p', haskell: 'y', ocaml: 'y', prolog: 'n', datalog: 'p' },
    notes: { python: 'type hints are checked by external tools, not the interpreter', js: 'only via TypeScript', sql: 'column types exist; coercion and NULL are dynamic', datalog: 'per implementation; Soufflé checks statically' }
  },
  {
    capability: 'Type inference',
    why: 'Do you have to write the types down, or does the language work them out?',
    cells: { asm: 'n', c: 'n', cpp: 'p', rust: 'p', go: 'p', java: 'p', csharp: 'p', python: 'x', js: 'x', bash: 'x', sql: 'n', haskell: 'y', ocaml: 'y', prolog: 'x', datalog: 'x' },
    notes: { cpp: 'auto and templates; not for signatures', java: 'var and lambdas only', csharp: 'var, target-typed new', rust: 'local inference, explicit signatures', go: ':= only', python: 'untyped; hints are optional', js: 'untyped', prolog: 'untyped: everything is a term' }
  },
  {
    capability: 'First-class functions',
    why: 'Can you store a function in a variable and pass it to another function?',
    cells: { asm: 'p', c: 'p', cpp: 'y', rust: 'y', go: 'y', java: 'y', csharp: 'y', python: 'y', js: 'y', bash: 'p', sql: 'n', haskell: 'y', ocaml: 'y', prolog: 'y', datalog: 'n' },
    notes: { asm: 'an address you blr to', c: 'function pointers, no captures', bash: 'a function name as a string', prolog: 'goals are values: maplist, call/1', sql: 'the verbs are syntax, not values', datalog: 'no functions of any kind' }
  },
  {
    capability: 'Closures',
    why: 'Does a function remember the variables where it was defined?',
    cells: { asm: 'n', c: 'n', cpp: 'y', rust: 'y', go: 'y', java: 'y', csharp: 'y', python: 'y', js: 'y', bash: 'n', sql: 'n', haskell: 'y', ocaml: 'y', prolog: 'p', datalog: 'n' },
    notes: { cpp: 'lambda captures by value or reference', java: 'captured locals must be effectively final', bash: 'state has to travel as text or files', prolog: 'closure/3 exists but passing goals covers most uses' }
  },
  {
    capability: 'Sum types (tagged alternatives)',
    why: 'Can you say "exactly one of these, and the compiler checks you handled it"?',
    cells: { asm: 'p', c: 'p', cpp: 'p', rust: 'y', go: 'n', java: 'y', csharp: 'y', python: 'p', js: 'n', bash: 'n', sql: 'p', haskell: 'y', ocaml: 'y', prolog: 'p', datalog: 'n' },
    notes: { asm: 'a tag word you branch on', c: 'a tagged union you maintain by hand', cpp: 'std::variant; totality is on you', java: 'sealed interfaces + records (21+)', csharp: 'abstract records + switch expressions', python: 'dataclasses + match, checked at run time', sql: 'a kind column and a CHECK constraint', prolog: 'compound terms, matched by clause head' }
  },
  {
    capability: 'Exhaustive pattern matching',
    why: 'Does forgetting a case fail the build?',
    cells: { asm: 'n', c: 'n', cpp: 'n', rust: 'y', go: 'n', java: 'y', csharp: 'p', python: 'n', js: 'n', bash: 'n', sql: 'n', haskell: 'y', ocaml: 'p', prolog: 'p', datalog: 'n' },
    notes: { java: 'only with sealed hierarchies', csharp: 'no warning when the `_` arm swallows a new case', ocaml: 'a warning, not an error — and it names the missing cases', prolog: 'a catch-all clause hides the omission', rust: 'this is the headline feature' }
  },
  {
    capability: 'Generics / parametric polymorphism',
    why: 'Can one piece of code work for many types, safely?',
    cells: { asm: 'n', c: 'n', cpp: 'y', rust: 'y', go: 'p', java: 'y', csharp: 'y', python: 'x', js: 'x', bash: 'x', sql: 'n', haskell: 'y', ocaml: 'y', prolog: 'x', datalog: 'n' },
    notes: { cpp: 'templates: monomorphised, zero cost', rust: 'monomorphised, with trait bounds', go: 'added in 1.18; GC-shape stencilling', java: 'erased at run time', csharp: 'reified: the type is real at run time', haskell: 'Hindley–Milner inference, the origin of the idea', ocaml: 'inference plus functors at module level' }
  },
  {
    capability: 'Garbage collection',
    why: 'Does something else free the memory?',
    cells: { asm: 'n', c: 'n', cpp: 'n', rust: 'n', go: 'y', java: 'y', csharp: 'y', python: 'y', js: 'y', bash: 'x', sql: 'x', haskell: 'y', ocaml: 'y', prolog: 'x', datalog: 'x' },
    notes: { rust: 'ownership instead: no GC, and no leaks by mistake', python: 'reference counting plus a cycle collector', bash: 'each command is its own process', sql: 'the engine owns the pages', prolog: 'the engine owns its stacks and trail' }
  },
  {
    capability: 'Deterministic destruction',
    why: 'Do you know exactly when a resource is released?',
    cells: { asm: 'p', c: 'p', cpp: 'y', rust: 'y', go: 'p', java: 'p', csharp: 'p', python: 'p', js: 'p', bash: 'x', sql: 'x', haskell: 'p', ocaml: 'p', prolog: 'x', datalog: 'x' },
    notes: { cpp: 'destructors: RAII is the foundation of the standard library', rust: 'Drop, and the borrow checker proving there is no aliasing', go: 'defer for explicit cleanup', java: 'try-with-resources', csharp: 'using and IDisposable', python: 'with and __exit__', js: 'try/finally only', haskell: 'bracket and withFile' }
  },
  {
    capability: 'Exceptions (throw/catch)',
    why: 'Can a failure travel up the stack without being declared?',
    cells: { asm: 'n', c: 'n', cpp: 'y', rust: 'n', go: 'p', java: 'y', csharp: 'y', python: 'y', js: 'y', bash: 'p', sql: 'p', haskell: 'p', ocaml: 'y', prolog: 'p', datalog: 'n' },
    notes: { rust: 'Result instead; panic for bugs', go: 'panic/recover, meant for the truly exceptional', bash: 'exit statuses and traps', sql: 'errors yes, but division by zero is just NULL', haskell: 'exceptions exist in IO; Either is the idiomatic path', prolog: 'failure is the primary mechanism' }
  },
  {
    capability: 'Concurrency',
    why: 'Does the language itself have something to say about doing two things at once?',
    cells: { asm: 'p', c: 'y', cpp: 'y', rust: 'y', go: 'y', java: 'y', csharp: 'y', python: 'p', js: 'p', bash: 'y', sql: 'x', haskell: 'y', ocaml: 'y', prolog: 'n', datalog: 'x' },
    notes: { asm: 'atomics and threads via the OS, with no safety net', c: 'pthreads', rust: 'Send/Sync make data races a compile error', go: 'goroutines and channels', python: 'the GIL limits threads; asyncio for I/O', js: 'one event loop; workers for real parallelism', bash: 'background jobs and wait', haskell: 'STM: atomic blocks that compose', sql: 'isolation levels; the engine owns the threads' }
  },
  {
    capability: 'Lazy evaluation',
    why: 'Can you describe an infinite or very large structure and only compute what is used?',
    cells: { asm: 'n', c: 'n', cpp: 'n', rust: 'p', go: 'n', java: 'p', csharp: 'p', python: 'p', js: 'p', bash: 'x', sql: 'p', haskell: 'y', ocaml: 'n', prolog: 'p', datalog: 'x' },
    notes: { rust: 'iterator adapters are lazy', java: 'streams are lazy', csharp: 'LINQ is lazy until enumerated', python: 'generators', js: 'generators', sql: 'a query is a plan until it is executed', haskell: 'lazy by default, which is what makes [1..] legal' }
  },
  {
    capability: 'Guaranteed tail calls',
    why: 'Can recursion be the way you write loops, without growing the stack?',
    cells: { asm: 'x', c: 'n', cpp: 'n', rust: 'n', go: 'n', java: 'n', csharp: 'n', python: 'n', js: 'n', bash: 'n', sql: 'x', haskell: 'y', ocaml: 'y', prolog: 'p', datalog: 'x' },
    notes: { haskell: 'GHC optimises it; the idiom depends on it', ocaml: 'guaranteed, and the style depends on it', prolog: 'last-call optimisation is standard', java: 'deliberately omitted: it would break stack traces', python: 'not available; the recursion limit is a hard 1000 by default' }
  },
  {
    capability: 'Macros / metaprogramming',
    why: 'Can the program generate or extend the language itself?',
    cells: { asm: 'p', c: 'p', cpp: 'y', rust: 'y', go: 'n', java: 'p', csharp: 'p', python: 'y', js: 'p', bash: 'p', sql: 'p', haskell: 'p', ocaml: 'p', prolog: 'y', datalog: 'n' },
    notes: { asm: 'the assembler has macros; the language does not', c: 'the preprocessor: text substitution, no types', cpp: 'templates are compile-time programs in their own right', rust: 'macro_rules! and procedural macros', python: 'decorators, metaclasses, eval', prolog: 'terms are data: you can build and evaluate goals at run time', ocaml: 'PPX preprocessors' }
  },
  {
    capability: 'No null in the type system',
    why: 'Is the absence of a value impossible to ignore?',
    cells: { asm: 'x', c: 'n', cpp: 'n', rust: 'y', go: 'n', java: 'n', csharp: 'p', python: 'n', js: 'n', bash: 'x', sql: 'n', haskell: 'y', ocaml: 'y', prolog: 'x', datalog: 'x' },
    notes: { rust: 'Option replaces null entirely', csharp: 'nullable reference types warn, they do not enforce', sql: 'NULL is a third truth value and infects every expression', haskell: 'Maybe; Nothing is a value you must handle', ocaml: 'option; and some/None is exhaustive by type' }
  }
];
