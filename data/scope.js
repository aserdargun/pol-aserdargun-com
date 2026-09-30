// Kapsam yüzeyi: POL neden bu 15 dili kapsıyor, neler dışarıda?
//
// Bu görünüm, katalog dosyasındaki (programming-languages.md) 32 alanlık listeyi
// ve `cs-coverage-assessment.md` dosyasındaki değerlendirmeyi uygulama içine taşır.
// Daha önce yalnız no-JS yedeği ve "Further reading" listesi içinde erişilebilirdi.
//
// Kural: buradaki her değerlendirme editoryal yargıdır; ölçülmüş öğrenme çıktısı değildir.

window.SCOPE_RATINGS = [
  {
    id: 'strong',
    label: 'Strong',
    areas: [
      'Algorithms', 'architecture', 'operating systems', 'compilers', 'concurrency',
      'distributed systems', 'networking', 'security and low-level', 'embedded and real-time',
      'practical AI/ML', 'software engineering', 'object-oriented design',
    ],
  },
  {
    id: 'adequate',
    label: 'Adequate',
    areas: ['metaprogramming', 'language lineage', 'web and HCI'],
  },
  {
    id: 'weak',
    label: 'Weak',
    areas: [
      'programming-language theory and type systems', 'functional programming',
      'relational and declarative', 'numerical computing', 'graphics',
      'symbolic AI', 'data engineering',
    ],
  },
  {
    id: 'absent',
    label: 'Absent',
    areas: ['formal methods and verification', 'logic programming', 'hardware description'],
  },
]

window.COVERED_LANGUAGES = [
  'Assembly', 'C', 'C++', 'Rust', 'Go', 'Java', 'C#', 'Python', 'JavaScript',
  'Bash', 'SQL', 'Haskell', 'OCaml', 'Prolog', 'Datalog',
]

window.EXCLUDED_FAMILIES = [
  ['Lisp macros and metaprogramming depth', 'Metaprogramming is rated adequate via the Haskell and OCaml records.'],
  ['Actor-oriented languages', 'No runnable record; listed in the catalog only.'],
  ['Array and numerical languages (J, APL, Julia)', 'Numerical computing is rated weak.'],
  ['Hardware description languages (VHDL, Verilog)', 'Hardware description is rated absent.'],
  ['Proof assistants (Coq, Lean, Isabelle)', 'Formal methods and verification are rated absent.'],
]

window.SCOPE_CAVEAT =
  'These are editorial judgments about possible teaching vehicles, not tested learning outcomes. POL is not a complete computer science course.'

