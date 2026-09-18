# Every Programming Language Still Available in the World

A working catalog of programming languages you can still install, compile, run, and get help with today — as of September 2026.

---

## 1. Start here: "all" needs a definition

There is no single, finite list of "all programming languages still available," because the answer depends on where you draw the line. Here is the honest shape of it:

| Question | Count | Source |
| --- | --- | --- |
| Languages ever created (documented) | **~8,945** | Historical Encyclopedia of Programming Languages (HOPL) |
| Notable languages indexed today | **~700** | Wikipedia, *List of programming languages* (excludes markup + esoteric) |
| Languages with measurable popularity | **100** | TIOBE ranks a top 50 and lists a further 50; monitors more |
| Languages with real, ongoing industry use | **~50–100** | Consensus across TIOBE, IEEE Spectrum, GitHub, Stack Overflow |
| Languages people would call "mainstream" | **~20** | Top of every ranking |

So: **thousands exist, a few hundred are genuinely usable, and a few dozen matter commercially.**

In this document, **"still available"** means a language that satisfies *all* of these:

1. A working implementation can be downloaded and run today (official or open-source), and
2. At least one of the following is true: a vendor supports it, a standards body maintains it, an active community ships releases, or a package/module ecosystem depends on it.

That deliberately excludes languages with no surviving toolchain (e.g. Algol 60 reference implementations that no longer build on modern systems, most 1970s vendor-specific dialects, and abandoned research languages). Where a language survives only inside legacy systems, it is marked **○ legacy** rather than dropped.

**Legend**

| Mark | Meaning |
| --- | --- |
| ● | Mainstream — heavy industry or platform use |
| ◐ | Established niche — real, sustained use in a domain |
| ○ | Legacy / maintained — still runs critical systems, still gets updates |
| ✦ | Rising — actively adopted, growing, post-2015 origin or surge |

---

## 2. The measured top 20 (TIOBE, September 2026)

| # | Language | Rating | Why it is still here |
| --- | --- | --- | --- |
| 1 | **Python** | 17.76% | AI, data science, scripting, backends, education. Largest single ecosystem. |
| 2 | **C** | 10.28% | Operating systems, kernels, firmware, embedded, language runtimes. |
| 3 | **C++** | 8.67% | Games, browsers, trading, CAD, HPC, LLVM, everything performance-critical. |
| 4 | **Java** | 7.54% | Enterprise backends, Android, big-data infrastructure. |
| 5 | **C#** | 4.22% | .NET services, Windows apps, Unity games. TIOBE language of the year 2025. |
| 6 | **JavaScript** | 2.76% | The only language native to every browser. Node/Deno/Bun on servers. |
| 7 | **Visual Basic** | 2.55% | Line-of-business Windows apps, Office/VBA automation. |
| 8 | **SQL** | 2.16% | The universal data language. Underpins every relational system. |
| 9 | **R** | 1.69% | Statistics, biostatistics, epidemiology, academic research. |
| 10 | **Rust** | 1.34% | Memory-safe systems code. Entered the TIOBE top 10 for the first time in July 2026. |
| 11 | **Fortran** | 1.24% | Numerical HPC, weather and climate models, physics simulation. |
| 12 | **Go** | 1.10% | Cloud infrastructure, microservices, CLI tooling, Kubernetes ecosystem. |
| 13 | **Delphi / Object Pascal** | 1.08% | Windows desktop and business apps, still actively sold and updated. |
| 14 | **PHP** | 1.04% | A very large share of the existing web (WordPress, Laravel, Symfony). |
| 15 | **Scratch** | 0.99% | Block-based teaching language; massive in K-12 education. |
| 16 | **Assembly** | 0.89% | Bootloaders, device drivers, crypto, reverse engineering, teaching. |
| 17 | **Ada** | 0.85% | Safety-critical avionics, rail, defence, medical. Re-entered the top 20 in 2026. |
| 18 | **Swift** | 0.83% | Apple platforms: iOS, macOS, watchOS, visionOS. |
| 19 | **Objective-C** | 0.81% | Long tail of Apple and enterprise codebases. Also back in the top 20. |
| 20 | **COBOL** | 0.78% | Banking, insurance, payroll, government. Hundreds of billions of lines in production. |

### Reading the rankings critically

Rankings disagree wildly because each measures something different, and you should not treat any one of them as truth:

- **TIOBE** counts search-engine hits, courses, and vendor presence. It *under*-rates TypeScript (position 39) while **GitHub Octoverse 2025 put TypeScript at #1 and Python at #2** by repository activity.
- **Stack Overflow 2025** (31,771 respondents) shows Python's adoption accelerating — a 7 percentage point jump in a year — and names **Rust the most admired language (72%)**, followed by Gleam (70%), Elixir (66%), and Zig (64%).
- **IEEE Spectrum** blends search traffic, Stack Exchange questions, GitHub activity, and research papers.

The stable signal across all of them: **Python, JavaScript/TypeScript, C-family languages, Java, C#, Go, and Rust.** Everything else is domain-dependent.

---

## 3. Positions 21–50 (the serious second tier)

| # | Language | Rating | Role |
| --- | --- | --- | --- |
| 21 | Julia ✦ | 0.74% | Scientific computing, numerical performance, differential equations. |
| 22 | Ruby ◐ | 0.73% | Rails web apps, DevOps tooling, scripting. |
| 23 | Perl ○ | 0.70% | Bio­informatics, text munging, huge legacy codebases. |
| 24 | SAS ◐ | 0.70% | Regulated-industry statistics (pharma, banking, insurance). |
| 25 | Classic Visual Basic ○ | 0.68% | VB6-era business software, still installed and maintained. |
| 26 | Kotlin ◐✦ | 0.67% | Preferred Android language, JVM backends, multiplatform. |
| 27 | MATLAB ◐ | 0.61% | Engineering, control systems, signal processing, academia. |
| 28 | Caml (OCaml) ◐ | 0.60% | Compilers, trading, formal methods, Jane Street's stack. |
| 29 | Prolog ◐ | 0.60% | Logic programming, rules engines, NLP, scheduling. |
| 30 | GML ◐ | 0.59% | GameMaker's scripting language; large indie-games base. |
| 31 | Lua ◐ | 0.57% | Embedded scripting: games, Neovim, Redis, Nginx, routers. |
| 32 | PowerShell ● | 0.49% | Windows and cross-platform automation; Microsoft's shell language. |
| 33 | D ◐ | 0.47% | Systems programming with GC optional; still maintained. |
| 34 | PL/SQL ● | 0.46% | Oracle database logic. Deeply embedded in enterprise. |
| 35 | ABAP ○ | 0.46% | SAP ERP customization. Every large SAP shop needs it. |
| 36 | Transact-SQL ● | 0.46% | Microsoft SQL Server dialect plus procedural extensions. |
| 37 | VBScript ○ | 0.46% | Windows administration legacy; deprecated but still present. |
| 38 | OCaml ◐ | 0.43% | See "Caml"; type-safe functional with native performance. |
| 39 | TypeScript ●✦ | 0.43% | Typed JavaScript. **#1 on GitHub by activity in 2025.** |
| 40 | Zig ✦ | 0.43% | C replacement, cross-compilation toolchain, Bun's compiler. |
| 41 | Dart ◐ | 0.43% | Flutter's language for cross-platform mobile and desktop. |
| 42 | X++ ○ | 0.42% | Microsoft Dynamics 365 ERP extension language. |
| 43 | Lisp ◐ | 0.42% | The family root: Common Lisp, Scheme, Emacs Lisp, Clojure. |
| 44 | Scala ◐ | 0.39% | JVM functional/object hybrid; Spark's primary language. |
| 45 | LabVIEW ◐ | 0.37% | Graphical dataflow for instrumentation and test benches. |
| 46 | Ladder Logic ● | 0.34% | PLC programming for industrial automation. |
| 47 | VHDL ◐ | 0.32% | FPGA and ASIC design (see §8). |
| 48 | XSLT ◐ | 0.31% | XML transformation; still load-bearing in publishing and government. |
| 49 | Haskell ◐ | 0.30% | Purely functional; compilers, finance, verification. |
| 50 | (Visual) FoxPro ○ | 0.30% | xBase-era database apps, still patched, still running businesses. |

---

## 4. Positions 51–100

TIOBE lists these alphabetically because the differences between them are within noise. Grouped here by family for readability.

**Shells & script:** Bash, Bourne shell, C shell, tcsh, Z shell, Awk, MS-DOS batch, AppleScript, PowerShell-adjacent tooling.

**JVM:** Clojure ◐✦, Groovy ◐, J#, JScript (legacy Microsoft).

**Functional / ML family:** F# ◐, Standard ML, Scheme ◐, Erlang ◐, Elixir ◐✦.

**Logic & constraint:** Prolog (already ranked), plus the Prolog descendants below in §7.

**Data & analytics:** GAMS ◐, Q ◐ (kdb+), SAS (ranked), R (ranked).

**Industrial & control:** Structured Text, Ladder Logic (ranked), Pure Data, EGL, CL (OS/400), XPL, XC, PowerScript, thinBasic, PureBasic, XBase++.

**Web & app:** ActionScript ○, Apex ◐, CFML ○, CoffeeScript ○, ECMAScript (the standard behind JavaScript), Xojo ◐, REBOL ○, Ring, Io, cT, Logo ◐, NetLogo ◐, J.

**Systems & GPU:** Nim ◐, V ✦ (Vlang), Zig (ranked), OpenCL ◐.

**Legacy / mainframe:** BCPL ○, PL/I ○, APL family ◐.

**Blockchain:** Solidity ◐.

**Other:** Tcl ◐, bc, Structured Text, Clojure.

---

## 5. The full catalog, by domain

### 5.1 General-purpose mainstream ●

C, C++, C#, Java, Python, JavaScript, TypeScript, Go, Rust, Swift, Kotlin, PHP, Ruby, Dart, Scala, Elixir, Perl, Lua, R, Julia, Visual Basic (.NET), Delphi/Object Pascal, D, Nim, Crystal ✦, Zig ✦, Odin ✦, V ✦, Haxe ◐, Groovy ◐.

### 5.2 Systems, low-level and performance ◐

Rust, Zig, C, C++, D, Ada, Nim, Odin, Hare ✦, Carbon ✦ (Google experiment, C++ interop), Vale ✦, Hylo ✦ (mutable value semantics), Austral ✦, Pony ✦ (actor model, capability-safe), Modula-2 ○, Oberon ○, BCPL ○, Mesa ○, Cyclone ○, Jai ✦ (game-oriented, long beta), Beef ◐, Virgil ◐, V ✦, C3 ✦, Mojo ✦ (see §5.10).

### 5.3 JVM ●

Java, Kotlin ✦, Scala, Groovy, Clojure ✦, JRuby, Jython, Ceylon ○, Fantom ◐, Xtend ○, Gosu ○, Eta ○, Frege ○.

### 5.4 .NET / Microsoft ●

C#, F#, Visual Basic .NET, IronPython, IronRuby ○, PowerShell, C++/CLI, X++ (Dynamics), AL ◐ (Business Central), DAX ◐ (Power BI / Analysis Services), Power Query M ◐, VBA ● (Office automation), VBScript ○, JScript ○, C# Script, Q# ◐ (quantum).

### 5.5 Web front-end & browser ●

JavaScript, TypeScript, CoffeeScript ○, Elm ◐, PureScript ◐, ReasonML/ReScript ◐, ClojureScript ◐, Dart (Flutter Web + compiled JS), Haxe ◐, GWT ○, Scala.js, Fable ◐, Svelte's compiler language subset, WebAssembly text format ◐.

### 5.6 Server-side & backend scripting ●

PHP, Python, Ruby, JavaScript/TypeScript (Node, Deno, Bun), Java, C#, Go, Elixir, Perl, ColdFusion/CFML ○, Hack ◐ (Meta), Crystal ✦, Laravel-blade-style DSLs, Groovy, Kotlin.

### 5.7 Mobile ●

Swift (Apple), Objective-C ○ (Apple legacy), Kotlin (Android), Java (Android legacy), Dart (Flutter), C# (MAUI, Unity), JavaScript/TypeScript (React Native, Ionic), Lua (Corona/Solar2D), Haxe, Xamarin-era C# ○.

### 5.8 Functional ◐

Haskell, OCaml/Caml, Standard ML ○, F#, Elixir ✦, Erlang, Clojure ✦, Scheme, Racket, Common Lisp, Lisp dialects generally, Scala, Elm, PureScript, Gleam ✦ (typed BEAM), Roc ✦, Grain ✦, Idris ◐ (dependent types), Agda ◐, Lean ◐, Unison ✦, Koka ◐, Eff ◐, Miranda ○, Hope ○, SASL ○, Curry ◐, Mercury ◐, Q ◐ (kdb+, array-functional), J ◐, APL ◐, Dyalog APL ◐.

### 5.9 Logic, constraint and declarative ◐

Prolog, Datalog, Mercury, Answer Set Programming (Clingo, Potassco), Constraint Handling Rules, MiniZinc ◐, Picat ◐, Oz/Mozart ○, Gödel ○, SQL-PSMs, CLIPS ◐ (expert systems), Jess ○, Drools rules DSL ◐, XSLT, XQuery, Prolog-based engines in IBM ILOG CPLEX/OPL.

### 5.10 AI, machine learning and tensor languages ✦

Python (dominant), Mojo ✦ (reached 1.0 in August 2026, open-sourced), R, Julia, CUDA C/C++ ◐, Triton ◐ (OpenAI's GPU kernel language), OpenCL C ◐, SYCL ◐, Halide ◐, JAX-adjacent DSLs, TensorFlow Graph/MLIR dialects ◐, Stan ◐ (probabilistic modelling), PyMC/Pyro are libraries but their model DSLs qualify, Prolog (symbolic AI), Lisp ○ (historical AI), Cython ◐, Numba IR ◐, Max/MSP ◐ and Pure Data ◐ (for audio ML/creative work).

### 5.11 Scientific, numerical and statistical ●

Fortran (still in the top 15 after 69 years), MATLAB, R, Julia, SAS, Stata ◐ (its own ado/mata language), SPSS Syntax ◐, Mathematica / Wolfram Language ◐, Maple ◐, IDL ◐, Octave ◐ (MATLAB-compatible), Scilab ◐, Modelica ◐ (multi-domain physical modelling), Simulink block diagrams ● (graphical, effectively a language), GPSS ○, Simula ○ (the original OOP language), Chapel ◐ (HPC parallel), Coarray Fortran ◐, UPC ○, Fortress ○, X10 ○.

### 5.12 Data engineering, big data and query ◐

SQL, PL/SQL, Transact-SQL, PL/pgSQL, MySQL stored procedures, BigQuery SQL (GoogleSQL), Snowflake SQL + Snowflake Scripting, Spark SQL, HiveQL ○, Pig Latin ○ (still supported), KQL ◐ (Kusto/Azure Data Explorer), DAX ◐, MDX ◐, Power Query M ◐, Cypher ◐ (graph, Neo4j), Gremlin ◐, SPARQL ◐ (RDF), GraphQL ◐ (query language), Datalog ◐, Q ◐ (kdb+), K ◐, ABAP (SAP data layer), XQuery, jq ◐ (JSON transformation), JSONPath DSLs, Avro/Protobuf IDLs ◐, dbt Jinja-SQL ◐.

### 5.13 GPU, HPC and parallel ◐

CUDA C/C++, OpenCL C, SYCL, HIP ◐ (AMD), Triton, Chapel, Fortran with coarrays, OpenACC/OpenMP directives (pragma languages), NESL ○, Cilk ○, Legion ◐, Regent ◐, Julia GPU kernels, Metal Shading Language ◐, DirectCompute HLSL ◐, WebGPU WGSL ◐.

### 5.14 Embedded, real-time and safety-critical ●

C, C++, Ada, MISRA-C (a restricted C dialect), Rust (increasingly certified: Ferrocene), Assembly per architecture, Forth ◐, Erlang/Elixir (fault-tolerant systems), TinyML-adjacent C, MicroPython ◐, CircuitPython ◐, Arduino C++, Espruino JS ◐, Simulink/Stateflow ●, SCADE ◐, Lustre ◐ (synchronous dataflow), Esterel ○, VHDL/Verilog for hardware-software co-design, IEC 61131-3 family (below).

### 5.15 Hardware description and verification ◐

Verilog, SystemVerilog, VHDL, Verilog-AMS/SystemC ◐, Chisel ◐ (Scala-based), Amaranth ◐ and Migen ◐ (Python-based), SpinalHDL ◐, Bluespec ◐, MyHDL ◐, OpenCL-HLS C++, PSL/SVA assertion languages ◐, TLA+ ◐ (specification), Alloy ◐, Coq/Rocq, Isabelle, Lean, Agda, Idris, ACL2 ◐, Dafny ◐, F* ◐, Why3 ◐, SPARK ◐ (Ada subset for proof), VDM ○, Z notation ○, B-Method ◐, Event-B ◐, Promela ◐ (SPIN model checker), Maude ◐.

### 5.16 Industrial automation and PLC ◐

The IEC 61131-3 five: **Ladder Diagram (Ladder Logic)**, **Structured Text**, **Function Block Diagram**, **Sequential Function Chart**, **Instruction List** (deprecated but in use). Plus vendor dialects: Siemens SCL/AWL, Rockwell RSLogix, Beckhoff TwinCAT, CODESYS, ABAP-adjacent SCADA scripting, GRAFCET ◐, Robot languages: RAPID ◐ (ABB), KRL ◐ (KUKA), Karel ◐ (FANUC), URScript ◐ (Universal Robots), VAL3 ◐, G-code ● (CNC/machining).

### 5.17 Database, storage and query engines ◐

SQL (all dialects), PL/SQL, Transact-SQL, PL/pgSQL, PL/I-adjacent stored procedures, Redis Lua scripting, MongoDB aggregation DSL + JavaScript, Cassandra CQL, HBase filters, Riak ○, Neo4j Cypher, SPARQL, InfluxQL ◐ and Flux ◐ (time series), PromQL ◐ (monitoring queries), KQL, Elasticsearch Query DSL, Solr, SQLite SQL, DuckDB SQL, KDB+/Q, GraphQL, OData query language ◐.

### 5.18 Shells, scripting and system administration ●

Bash, Zsh, Fish ◐, Ksh, Dash, Bourne shell, C shell, tcsh, PowerShell, Windows Batch, cmd, Nushell ✦, Elvish ◐, Oil/Oilshell ◐, Xonsh ◐, rc/Plan 9 shell ○, AWK, sed, Perl, Python, Ruby, Tcl (with Expect ◐), REXX ○, NetRexx ○, JCL ● (mainframe job control), AppleScript, AutoHotkey ◐, AutoIt ◐, VBScript ○, KiXtart ○, CFEngine/Ansible-style configuration DSLs (see §5.21).

### 5.19 Text processing, documents and markup-ish DSLs ◐

Perl, AWK, sed, XSLT, XQuery, XPath, jq, Regular expressions (a real language family), TeX/LaTeX ●, METAFONT ◐, PostScript ● (also a programming language), PDF-drawing DSLs, troff/groff ◐, AsciiDoc, Markdown ●, reStructuredText, SGML ○, XML Schema/DTD ◐, XSL-FO, BibTeX ◐.

### 5.20 Graphics, shaders and game scripting ◐

GLSL, HLSL, Metal Shading Language, WGSL, Cg ○, RenderMan Shading Language ◐, OpenSL ES, CUDA for graphics, GML (GameMaker), GDScript ◐ (Godot), Lua (Roblox Luau ◐), Unreal Blueprints ◐ (visual), Unity C# + ShaderLab/Bolt-visual, Verse ✦ (Epic, for UEFN), ActionScript ○ (Flash legacy), Haxe, C# in Unity, Blueprint-style node graphs generally, Blender's Python API, MEL ◐ and Python in Maya, VEX ◐ (Houdini), Processing ◐, p5.js ●, openFrameworks C++, Shadertoy GLSL.

### 5.21 Configuration, infrastructure and policy DSLs ◐

HCL ● (Terraform), YAML (arguably), JSON (arguably data only), Dhall ◐, CUE ◐, Jsonnet ◐, Pulumi TypeScript/Python/Go/YAML, Ansible YAML playbooks, Chef Ruby DSL, Puppet DSL, Salt SLS, Nix ● (a genuine functional language for builds), Dockerfile ◐, Make ● (a real language), CMake ◐, Gradle Groovy/Kotlin DSL, Bazel Starlark ◐, Bicep ◐ (Azure), CloudFormation YAML/JSON, Kubernetes CEL ◐, Rego ◐ (OPA policy), Sentry/Atlassian-style config, Protocol Buffers IDL ◐, Thrift IDL ◐, GraphQL SDL, OpenAPI (spec), SQL migrations, Winglang ✦, Pkl ✦ (Apple's config language).

### 5.22 Business, ERP, mainframe and enterprise legacy ○

COBOL (IBM Enterprise COBOL 6.5 still receiving 2026 PTF updates; GnuCOBOL is thriving open source), PL/I, RPG (IBM i), CL (OS/400 control language), ABAP, X++ (Dynamics 365), AL (Business Central), PeopleSoft PeopleCode ◐, Oracle Forms PL/SQL ○, Natural ◐ (Software AG), ADSO ○, Mantis ○, Magic ○, Progress ABL / OpenEdge ◐, PowerBuilder PowerScript ◐, Visual FoxPro ○, xBase/Clipper ○, VB6 ○, ColdFusion CFML ○, NetCOBOL, Micro Focus COBOL/Borland ○ (now OpenText), EGL ○, 4GLs generally, SQL*Plus, Report Program Generator, REXX, JCL, MUMPS/M ◐ (healthcare: Epic, VistA), Cache ObjectScript ◐, DIBOL ○, TAL ○ (Tandem NonStop), Ada in defence contracting.

### 5.23 Smart contracts and blockchain ◐

Solidity, Vyper ✦, Yul ✦ (EVM IR), Huff ✦, Cairo ◐ (StarkNet), Rust (Solana, Polkadot), Move ◐ (Aptos/Sui), Michelson ◐ (Tezos), Plutus ◐ (Cardano, Haskell-based), Aiken ✦ (Cardano), Clarity ◐ (Stacks), Scilla ○ (Zilliqa), Simplicity ✦, Cadence ◐ (Flow), Motoko ◐ (Internet Computer), Solana's Sealevel programs, Bitcoin Script ◐, Miniscript ◐, Tact ✦ (TON), FunC ◐ (TON).

### 5.24 Simulation, modelling and domain DSLs ◐

Modelica, Simulink/Stateflow, Vensim/Stella system dynamics ◐, GPSS ○, Arena SIMAN ○, AnyLogic Java-based ◐, OpenModelica, MATLAB/Simulink, Ptolemy II ◐, FMU/FMI (interface standard), Ansys APDL ◐, Abaqus Python scripting, OpenFOAM C++ DSL, GAMS ◐ (optimization modelling), AMPL ◐, MiniZinc ◐, JuMP ◐ (Julia), Pyomo ◐, CVXPY ◐, CPLEX OPL ◐, PuLP, Lindo ◐, Arena, Witness ○, Plant Simulation ○ (Siemens), FlexSim ◐.

### 5.25 Education and visual languages ●

Scratch (ranked #15 globally), Blockly ◐, Snap! ◐, Alice ◐, App Inventor ◐, NetLogo ◐, Logo (and its Turtle dialects), Processing, p5.js, Racket (as teaching language), Python (as teaching language), BBC micro:bit MakeCode ◐, Arduino Blocks, Twine ◐, Ren'Py ◐, Inform 7 ◐ (natural-language-ish IF authoring), Godot GDScript for learners, Small Basic ○, Pascal (still the teaching language in many curricula), PascalABC.NET ◐, Flowgorithm ◐, Raptor ◐, Kodu ○, Stagecast ○, Squeak/Smalltalk ◐, Etoys ○.

### 5.26 Object-oriented lineage, still maintained ◐

Smalltalk (Pharo ◐, Squeak ◐, GNU Smalltalk ◐, VisualWorks ◐), Simula ○ (the origin), Objective-C, C++, Java, C#, Eiffel ◐ (Design by Contract — still maintained), Beta ○, CLOS ◐, Self ○, Newspeak ○, Ruby, Python, Dart, Scala, Kotlin.

### 5.27 Esoteric but genuinely maintained ◐

These have working interpreters, communities, and releases — they are "available," just not useful.

Brainfuck, Befunge, INTERCAL, LOLCODE, Whitespace, Malbolge, Shakespeare, Piet, Chef, Unlambda, FALSE, Befunge-93/98, GolfScript, CJam, Jelly, 05AB1E, Hexagony, Ook!, Cow, Thue, ///, Semicolon, Deadfish, JSFuck, Rockstar, Velato, Taxi, ZOMBIE, Whenever, ArnoldC, Chicken, Emojicode, Trumpscript, Legit, ChucK-adjacent oddities.

### 5.28 Historical languages still technically installable ○

FORTRAN (original, via emulation), ALGOL 58/60/68, Lisp 1.5, COBOL-60, BASIC (many dialects), Dartmouth BASIC, PL/I, APL\360, SNOBOL, Icon ◐, SETL ○, PL/M ○, Pascal, Turbo Pascal ○, Modula ○, Mesa ○, Euclid ○, CLU ○, Alphard ○, Gypsy ○, Concurrent Pascal ○, Occam ○ (transputer), Ada 83, CPL ○, B ○, BCPL ○, JOSS ○, IPL ○, FLOW-MATIC ○, Autocode ○, MAD ○, JOVIAL ○ (still used in some avionics), Coral ○, CMS-2 ○, TACPOL ○, SPL ○, RTL/2 ○, Forth (still used in firmware), PostScript, MUMPS, Snobol4.

### 5.29 New and rising (2015–2026) ✦

Rust, TypeScript, Kotlin, Swift, Go, Zig, Mojo, Gleam, Roc, Odin, V (Vlang), Hare, Carbon, Vale, Hylo, Austral, Crystal, Nim, Pony, Jai, Beef, Unison, Grain, Inko, Virgil, C3, Ante, Koka, Effekt, Verse, Flix, Koto, Luau, Winglang, Pkl, Aiken, Tact, Vyper, Bosque, Slint UI DSL, HVM/Bend ✦ (parallel functional), Lean 4, Wren ◐, Janet ◐, Fennel ◐, Carp ◐.

### 5.30 Array, vector and APL-family ◐

APL (Dyalog, GNU APL), J, K, Q, BQN ✦, Ivy ◐, NumPy (a library, not a language), MATLAB (matrix-first), R (vectorized), Fortran (array intrinsics), Chapel, Julia, Wolfram Language.

### 5.31 Concurrency-oriented ◐

Erlang, Elixir, Gleam, Go (goroutines), Rust (async/ownership), Pony (actors, capabilities), Akka/Scala, Clojure (STM), Occam ○, Ada (tasking), Chapel, X10 ○, Orc ○, JoCaml ○, Concurrent ML ◐, Java virtual threads, Kotlin coroutines, Swift concurrency, Crystal (fibers).

### 5.32 Proof assistants and formal languages ◐

Coq/Rocq, Lean 4, Isabelle/HOL, Agda, Idris, F*, Dafny, ACL2, Mizar ○, HOL Light ◐, HOL4 ◐, Matita ○, NuPRL ○, PVS ◐, TLA+, Alloy, Event-B, B-Method, SPARK, Why3, Maude, Athena ○, Twelf ◐, Beluga ◐, Cedille ○, Andromeda ○, Arend ◐, Cubical Agda.

---

## 6. What "still available" actually looks like in practice

A language stays available through one of five mechanisms. This is worth knowing, because it tells you how much risk you take by depending on one.

| Mechanism | Example | Risk profile |
| --- | --- | --- |
| **Standards body + multiple vendors** | Fortran (ISO/IEC 1539, dozen-plus compilers), Ada (ISO, GNAT + AdaCore), C/C++ (ISO, GCC/Clang/MSVC), COBOL (ISO, IBM + GnuCOBOL + Micro Focus) | Very low risk. Will outlive most of us. |
| **Single-vendor platform commitment** | Swift (Apple), C# (.NET, Microsoft), Kotlin (JetBrains/Google), ABAP (SAP), X++ (Microsoft), Apex (Salesforce) | Low. Dies only if the platform dies. |
| **Open-source community with corporate backing** | Rust (Foundation), Go (Google), TypeScript (Microsoft), Python (PSF), Elixir (community + Dashbit), Zig (ZSF) | Low to medium. Governance matters. |
| **Niche community, no corporate owner** | Crystal, Nim, D, Hare, Hylo, Vale, Odin | Medium. Alive but you may be on your own. |
| **Frozen but running critical systems** | VB6, Classic Visual Basic, Visual FoxPro, PL/I, RPG, MUMPS, Turbo Pascal-era code | Available, not growing. Maintenance-only future. |

Signals that a language is genuinely available *right now*:

- Releases shipped in the last 12 months (Mojo 1.0 in August 2026, IBM Enterprise COBOL 6.5 PTFs through July 2026, Intel `ifx` Fortran 2026.0).
- A package manager with active registries (PyPI, npm, crates.io, Hackage, Hex, Maven Central, NuGet, Packagist, LuaRocks).
- Books published in the last 3 years, and Stack Overflow tags with recent activity.
- Support in at least two editors/IDEs with language servers.
- Presence in CI systems and container images.

Signals it is only *nominally* available:

- No release in 5+ years and no maintained fork.
- Only installable by compiling a 1990s toolchain.
- No package ecosystem, no language server, no documentation updates.
- Depends on an operating system that no longer ships.

---

## 7. Languages that moved in 2026 (worth noting)

- **Rust entered the TIOBE top 10 for the first time** in July 2026 and held it in September.
- **MATLAB fell out of the top 20** for the first time in more than a decade, now around position 27 — Python, R, and Julia have collectively taken its territory.
- **Julia** climbed back to position 21, close to re-entering the top 20.
- **Ada and Objective-C re-entered the top 20**, displacing Perl and Ruby.
- **Python dipped below 18%** on TIOBE's scale but still leads every major ranking, with Stack Overflow showing a 7-point adoption jump.
- **TypeScript hit #1 on GitHub Octoverse 2025**, driven substantially by AI-assisted and typed-language development.
- **Mojo reached 1.0 and was open-sourced** (August 2026), making it the first genuinely new language to target AI infrastructure with a Python-like surface.
- **Gleam** became the second-most-admired language (70%) on the Stack Overflow survey in its first appearance.

---

## 8. How to go deeper: authoritative lists

If you want the exhaustive enumerations rather than this curated view:

| Source | What it gives you | Link |
| --- | --- | --- |
| Historical Encyclopedia of Programming Languages (HOPL) | ~8,945 languages, historical and current, with dates and lineage | https://hopl.info/ |
| Wikipedia, *List of programming languages* | ~700 notable languages, alphabetical, excludes markup and esoterics | https://en.wikipedia.org/wiki/List_of_programming_languages |
| TIOBE Index | Top 50 ranked plus positions 51–100, updated monthly | https://www.tiobe.com/tiobe-index/ |
| GitHub Octoverse | What is actually being committed to, by repository activity | https://octoverse.github.com/ |
| Stack Overflow Developer Survey | What developers actually use, admire, and want | https://survey.stackoverflow.co/2025/technology |
| IEEE Spectrum Top Programming Languages | Blended ranking across search, Q&A, GitHub, and papers | https://spectrum.ieee.org/top-programming-languages-2025 |
| Esolang wiki | Thousands of esoteric languages, most with working interpreters | https://esolangs.org/ |
| Rosetta Code | Same tasks solved in 900+ languages — the best practical proof of availability | https://rosettacode.org/ |
| Programming Language Database / PLDB | Structured data on thousands of languages | https://pldb.io/ |

---

## 9. The short answer

If the question is "which languages can I actually write and run software in today," the answer is roughly:

- **~20** languages you can build a career on without explanation: Python, JavaScript, TypeScript, Java, C#, C, C++, Go, Rust, SQL, Swift, Kotlin, PHP, Ruby, R, Scala, Dart, Fortran, COBOL.
- **~100** languages with real, supported niches you could legitimately choose for the right job.
- **~700** languages with enough of a footprint to be worth knowing exists.
- **~8,945** languages ever documented; the rest are history, research, or jokes.

Everything in this document is installable today. Nothing here is extinct — that is the whole point of the list.

### Sources

- [TIOBE Index, September 2026](https://www.tiobe.com/tiobe-index/)
- [TIOBE Index for September 2026 — TechRepublic summary](https://www.techrepublic.com/article/news-tiobe-index-language-rankings)
- [GitHub Octoverse 2025](https://octoverse.github.com/) and [GitHub blog announcement](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1)
- [Stack Overflow Developer Survey 2025 — Technology](https://survey.stackoverflow.co/2025/technology)
- [IEEE Spectrum Top Programming Languages 2025](https://spectrum.ieee.org/top-programming-languages-2025) and its [methodology](https://spectrum.ieee.org/top-programming-languages-methodology-2025)
- [Fortran-lang: language status and compilers](https://fortran-lang.org/compilers)
- [Fortran Compiler Updates, 2026](https://degenerateconic.com/fortran-compiler-updates-2026.html)
- [IBM Enterprise COBOL for z/OS fix list and new features](https://www.ibm.com/support/pages/fix-list-and-new-features-enterprise-cobol-zos)
- [GnuCOBOL / SuperBOL](https://superbol.eu/en/solutions/gnucobol)
- [IEEE Spectrum: Long-Enduring COBOL May Still Have a Shelf Life](https://spectrum.ieee.org/cobol-programming-shelf-life)
- [Mojo programming language (Wikipedia)](https://en.wikipedia.org/wiki/Mojo_(programming_language)) and [mojolang.org](https://mojolang.org/)
- [Niche Modern Programming Languages 2026 deep dive](https://www.youngju.dev/blog/culture/2026-05-16-niche-modern-languages-2026-crystal-pony-mojo-carbon-hare-roc-vale-virgil-deep-dive.en)
- [How many programming languages are there? (HOPL count)](https://www.testgorilla.com/blog/how-many-programming-languages/)
- [Wikimedia: List of programming languages](https://en.wikipedia.org/wiki/List_of_programming_languages)

---

*Compiled 17 September 2026. Counts and rankings shift monthly; the top 20 and the "still available" criteria are the parts least likely to change.*
