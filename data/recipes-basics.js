/* ---------------------------------------------------------------------------
 * recipes-basics.js — tasks 1–4.
 *
 * Every task states the algorithm in plain English once (the `prompt`), then
 * solves exactly that with each language. Where a language cannot express the
 * task, it says so and explains why, because the absence is a fact about the
 * language worth knowing.
 *
 * Snippet fields
 *   code    the program
 *   file    suggested filename (also what `run` assumes)
 *   run     the command that builds or runs it
 *   expect  exact stdout the program should produce (null = not applicable)
 *   note    one sentence on why it looks like this
 *   effort  1 trivial · 2 easy · 3 moderate · 4 awkward · 5 fighting the language
 * ------------------------------------------------------------------------- */
window.RECIPES_BASICS = [
  {
    id: 'hello',
    group: 'Basics',
    title: 'Hello, World!',
    prompt: 'Print exactly the text "Hello, World!" to standard output and exit successfully.',
    why: 'The smallest program exposes the whole delivery pipeline: what must exist before a single character reaches the screen. Comparing them shows what a language assumes for you — an entry point, a runtime, a session, a compiler.',
    takeaway: 'All fifteen produce the same twelve characters, and the ceremony ranges from one line (Bash, Python, SQL) to an entry symbol, a saved frame and a libc call (Assembly). The interesting split is not "easy versus hard" but *what the language thinks a program is*: a sequence of instructions (C, Assembly), a declaration of facts (Prolog, Datalog), a query (SQL), or an expression to evaluate (Haskell, OCaml).',
    snippets: {
      asm: {
        file: 'hello.s', effort: 4,
        run: 'clang -arch arm64 hello.s -o hello && ./hello',
        code: `    .section __TEXT,__text
    .globl _main
_main:                              // entry point the C runtime calls
    stp   x29, x30, [sp, #-16]!     // save frame pointer and link register
    adrp  x0, msg@PAGE              // x0 = first argument: a pointer to the text
    add   x0, x0, msg@PAGEOFF
    bl    _printf                   // call into libc
    mov   w0, #0                    // return 0 = success
    ldp   x29, x30, [sp], #16
    ret

    .section __DATA,__data
msg:
    .asciz "Hello, World!\\n"        // NUL-terminated, exactly as C expects`,
        expect: 'Hello, World!',
        note: 'MacOS on arm64: the symbol is _main, the text is a labelled .asciz, and printing means calling libc with the address in register x0. On Linux/x86-64 the same program uses different registers, a different calling convention and no leading underscore.'
      },
      c: {
        file: 'hello.c', effort: 1,
        run: 'clang hello.c -o hello && ./hello',
        code: `#include <stdio.h>

int main(void) {
    puts("Hello, World!");
    return 0;
}`,
        expect: 'Hello, World!',
        note: '`main` returning int, stdio included, and the C runtime calling you. Everything else in C has the same shape.'
      },
      cpp: {
        file: 'hello.cpp', effort: 1,
        run: 'clang++ -std=c++20 hello.cpp -o hello && ./hello',
        code: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
}`,
        expect: 'Hello, World!',
        note: 'Streams instead of printf, and `return 0` is implied for main — a small example of C++ absorbing ceremony into the language.'
      },
      rust: {
        file: 'main.rs', effort: 1,
        run: 'rustc main.rs -o hello && ./hello',
        code: `fn main() {
    println!("Hello, World!");
}`,
        expect: 'Hello, World!',
        note: '`println!` looks like a function but is a macro — the exclamation mark is part of the call. The format string is checked at compile time.'
      },
      go: {
        file: 'main.go', effort: 1,
        run: 'go run main.go',
        code: `package main

import "fmt"

func main() {
	fmt.Println("Hello, World!")
}`,
        expect: 'Hello, World!',
        note: 'The package declaration, and fmt as an explicit import. Go refuses to compile an unused import or variable.'
      },
      java: {
        file: 'Hello.java', effort: 3,
        run: 'java Hello.java',
        code: `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
        expect: 'Hello, World!',
        note: 'Everything lives in a class, and the entry point is one specific static method signature. Since Java 11 a single file can be run without a separate compile step.'
      },
      csharp: {
        file: 'Program.cs', effort: 1,
        run: 'dotnet run Program.cs',
        code: `Console.WriteLine("Hello, World!");

// The traditional form, when you want an explicit entry point:
// class Program {
//     static void Main() => Console.WriteLine("Hello, World!");
// }`,
        expect: 'Hello, World!',
        note: 'Top-level statements (C# 9+) let the file itself be the program body, which brings C# close to a scripting language. The class-and-Main form below it is what the compiler generates for you.'
      },
      python: {
        file: 'hello.py', effort: 1,
        run: 'python3 hello.py',
        code: `print("Hello, World!")`,
        expect: 'Hello, World!',
        note: 'No entry point, no imports, no boilerplate. Execution starts at line one — a design choice inherited from scripting languages.'
      },
      js: {
        file: 'hello.js', effort: 1,
        run: 'node hello.js',
        code: `console.log('Hello, World!');`,
        expect: 'Hello, World!',
        note: 'In a browser this prints to the developer console instead: the same line works in Node because `console` belongs to the runtime, not to the language.'
      },
      bash: {
        file: 'hello.sh', effort: 1,
        run: 'bash hello.sh',
        code: `#!/usr/bin/env bash
printf 'Hello, World!\\n'`,
        expect: 'Hello, World!',
        note: '`printf` is another program (or a built-in) run by the shell. Nothing is printed by the language itself except through a command that prints.'
      },
      sql: {
        file: 'hello.sql', effort: 1,
        run: `sqlite3 :memory: "SELECT 'Hello, World!';"`,
        code: `SELECT 'Hello, World!' AS greeting;`,
        expect: 'Hello, World!',
        note: 'A query, not a program: "printing" means returning a one-row, one-column result set. There is no exit code and no standard output in the language itself.'
      },
      haskell: {
        file: 'hello.hs', effort: 1,
        run: 'runghc hello.hs',
        code: `main :: IO ()
main = putStrLn "Hello, World!"`,
        expect: 'Hello, World!',
        note: '`main` has the type IO (), which says out loud that this program performs effects. A pure function of type String -> String could not print anything at all.'
      },
      ocaml: {
        file: 'hello.ml', effort: 1,
        run: 'ocaml hello.ml',
        code: `let () = print_endline "Hello, World!"`,
        expect: 'Hello, World!',
        note: '`let () = ...` is a pattern match: bind the unit pattern, meaning "run this for its effect". Effects need no special type here, unlike Haskell.'
      },
      prolog: {
        file: 'hello.pl', effort: 2,
        run: 'swipl -q -g main -t halt hello.pl',
        code: `:- initialization(main).

main :-
    write('Hello, World!'), nl.`,
        expect: 'Hello, World!',
        note: 'A Prolog program is a set of predicates, not a sequence of statements. This predicate succeeds once and prints as a side effect; `nl` writes the newline.'
      },
      datalog: {
        file: 'hello.dl', effort: 2, expect: null,
        run: 'souffle hello.dl',
        code: `.decl greeting(text: symbol)
greeting("Hello, World!").

.output greeting`,
        note: 'There is no print statement: you declare a relation and ask for it to be output. Soufflé writes the relation as tab-separated tuples, so "hello world" arrives as a table, not as text.'
      }
    }
  },

  {
    id: 'variables',
    group: 'Basics',
    title: 'Values, types and mutation',
    prompt: 'Hold an integer (42), a floating-point number (3.14), a string ("Ada"), a list of strings and a small lookup table. Increment the integer by one, then print everything on one line as: age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
    why: 'Names, types and mutability are the first real design decisions a language makes. This task makes the same five values exist in all fifteen and shows what each language calls a "variable" — a box, a binding, a cell, or nothing at all.',
    takeaway: 'The similarity is total at the top: every language holds these five things and prints them in the same format. The differences sit in three places. First, *whether a name is a box or a binding*: Assembly, C and Bash give you a memory location; Haskell, OCaml and Prolog give you a name for a value that never changes. Second, *what a collection is*: in C a list is a convention and in C++ and Rust a library type, while Python and JavaScript build one in. Third, *maps*: built in for Python, JavaScript, Java, C#, Go, Bash and SQL; a library for C++, Rust and Haskell; and absent in Assembly, Prolog and Datalog, where something else does the job.',
    snippets: {
      asm: {
        file: 'variables.s', effort: 5, expect: 'age=43 pi=3.14 name=Ada tags=[c,rust]',
        run: 'clang -arch arm64 variables.s -o variables && ./variables',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #32                 // room for four variadic arguments
    adrp  x19, nums@PAGE              // x19 = address of the numeric block
    add   x19, x19, nums@PAGEOFF
    ldr   w1, [x19]                   // "mutating" is load, add, store
    add   w1, w1, #1
    str   w1, [x19]
    str   x1, [sp]                    // vararg 1: the int — one 8-byte slot each
    ldr   d0, [x19, #8]               // the double sits at offset 8
    str   d0, [sp, #8]                // vararg 2: the double
    adrp  x2, name@PAGE
    add   x2, x2, name@PAGEOFF
    str   x2, [sp, #16]               // vararg 3: the string pointer
    adrp  x3, tags@PAGE
    add   x3, x3, tags@PAGEOFF
    str   x3, [sp, #24]               // vararg 4: the list, already formatted
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf
    add   sp, sp, #32
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

    .section __DATA,__data
fmt:   .asciz "age=%d pi=%.2f name=%s tags=%s"
name:  .asciz "Ada"
tags:  .asciz "[c,rust]"
    .p2align 3                        // keep the numeric block 8-byte aligned
nums:  .quad 42                       // an int, then a double right behind it
       .double 3.14`,
        note: 'A "variable" here is a labelled address. There is no list type and no map: you would hand-build a table layout and write the lookup loop yourself, which is exactly what C++ and Python do for you. Apple\'s arm64 ABI also passes variadic arguments on the stack rather than in registers, which is why x1 and d0 are stored to [sp] before calling printf.',
        partial: 'There is no map, so the line stops after the list.'
      },
      c: {
        file: 'variables.c', effort: 3,
        run: 'clang variables.c -o variables && ./variables',
        code: `#include <stdio.h>

typedef struct { const char *key; int value; } Pair;

int main(void) {
    int age = 42;                       /* a box in memory */
    double pi = 3.14;
    const char *name = "Ada";           /* a pointer to static text */
    const char *tags[] = {"c", "rust"}; /* an array: the length is not carried */
    Pair scores[] = {{"alice", 1}, {"bob", 2}};   /* a "map" is a convention */

    age = age + 1;
    printf("age=%d pi=%.2f name=%s tags=[%s,%s] scores={%s:%d,%s:%d}\\n",
           age, pi, name,
           tags[0], tags[1],
           scores[0].key, scores[0].value, scores[1].key, scores[1].value);
    return 0;
}`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: '`int` is a box you mutate in place. The list and the map carry neither length nor type — you keep track of both, and print each element by hand.'
      },
      cpp: {
        file: 'variables.cpp', effort: 2,
        run: 'clang++ -std=c++20 variables.cpp -o variables && ./variables',
        code: `#include <iostream>
#include <map>
#include <string>
#include <vector>

int main() {
    int age = 42;
    double pi = 3.14;
    std::string name = "Ada";
    std::vector<std::string> tags = {"c", "rust"};
    std::map<std::string, int> scores = {{"alice", 1}, {"bob", 2}};

    age += 1;
    std::cout << "age=" << age << " pi=" << pi << " name=" << name << " tags=[";
    for (std::size_t i = 0; i < tags.size(); ++i)
        std::cout << tags[i] << (i + 1 < tags.size() ? "," : "");
    std::cout << "] scores={";
    for (auto it = scores.begin(); it != scores.end(); ++it) {
        std::cout << it->first << ":" << it->second;
        if (std::next(it) != scores.end()) std::cout << ",";
    }
    std::cout << "}" << std::endl;
}`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: 'The collections are library types that know their own size, and `std::map` is ordered by key — the format comes out right without sorting anything.'
      },
      rust: {
        file: 'variables.rs', effort: 2,
        run: 'rustc variables.rs -o variables && ./variables',
        code: `use std::collections::BTreeMap;

fn main() {
    let mut age = 42;                 // mut: mutation is opt-in
    let pi = 3.14;
    let name = "Ada";
    let tags = ["c", "rust"];
    let mut scores = BTreeMap::new();
    scores.insert("alice", 1);
    scores.insert("bob", 2);

    age += 1;
    let scores_text: Vec<String> = scores.iter()
        .map(|(k, v)| format!("{}:{}", k, v))
        .collect();
    println!("age={} pi={} name={} tags=[{}] scores={{{}}}",
             age, pi, name, tags.join(","), scores_text.join(","));
}`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: 'Mutation is not the default: `let mut` is required to change a value, and the compiler tells you every place a value is moved or borrowed. BTreeMap is a sorted map, so the output order is deterministic.'
      },
      go: {
        file: 'variables.go', effort: 2,
        run: 'go run variables.go',
        code: `package main

import (
	"fmt"
	"sort"
	"strings"
)

func main() {
	age := 42
	pi := 3.14
	name := "Ada"
	tags := []string{"c", "rust"}
	scores := map[string]int{"alice": 1, "bob": 2}

	age++
	keys := make([]string, 0, len(scores))
	for k := range scores {
		keys = append(keys, k)
	}
	sort.Strings(keys)                        // map order is random by design
	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		parts = append(parts, fmt.Sprintf("%s:%d", k, scores[k]))
	}
	fmt.Printf("age=%d pi=%v name=%s tags=[%s] scores={%s}\\n",
		age, pi, name, strings.Join(tags, ","), strings.Join(parts, ","))
}`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: 'Map iteration order is deliberately randomised by the runtime, so printing a map deterministically means sorting the keys. `:=` declares and infers in one step.'
      },
      java: {
        file: 'Variables.java', effort: 3,
        run: 'java Variables.java',
        code: `import java.util.*;

public class Variables {
    public static void main(String[] args) {
        int age = 42;                    // primitive: a box
        double pi = 3.14;
        String name = "Ada";             // object: a reference
        List<String> tags = List.of("c", "rust");
        Map<String, Integer> scores = new LinkedHashMap<>();  // keeps insertion order
        scores.put("alice", 1);
        scores.put("bob", 2);

        age += 1;
        StringBuilder text = new StringBuilder();
        for (Map.Entry<String, Integer> e : scores.entrySet()) {
            if (text.length() > 0) text.append(",");
            text.append(e.getKey()).append(":").append(e.getValue());
        }
        System.out.printf("age=%d pi=%.2f name=%s tags=[%s] scores={%s}%n",
                age, pi, name, String.join(",", tags), text);
    }
}`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: 'Two worlds in one program: `int` is a primitive you mutate, while String and the collections are heap objects reached by reference. LinkedHashMap preserves insertion order where HashMap does not.'
      },
      csharp: {
        file: 'Program.cs', effort: 2,
        run: 'dotnet run Program.cs',
        code: `using System.Collections.Generic;
using System.Linq;

int age = 42;
double pi = 3.14;
string name = "Ada";
var tags = new List<string> { "c", "rust" };
var scores = new SortedDictionary<string, int> { ["alice"] = 1, ["bob"] = 2 };

age += 1;
var scoresText = string.Join(",", scores.Select(kv => kv.Key + ":" + kv.Value));
Console.WriteLine($"age={age} pi={pi} name={name} tags=[{string.Join(",", tags)}] scores={{{scoresText}}}");`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: '`var` infers the type, `int` and `double` are value types while the collections are objects, and LINQ\'s Select replaces the loop Java still writes.'
      },
      python: {
        file: 'variables.py', effort: 1,
        run: 'python3 variables.py',
        code: `age = 42
pi = 3.14
name = "Ada"
tags = ["c", "rust"]
scores = {"alice": 1, "bob": 2}

age += 1
scores_text = ",".join(f"{k}:{v}" for k, v in scores.items())
print(f"age={age} pi={pi} name={name} tags=[{','.join(tags)}] scores={{{scores_text}}}")`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: 'No declarations and no types. `age = 42` binds a name, and the same name can point at a string on the next line — the name is not a box.'
      },
      js: {
        file: 'variables.js', effort: 1,
        run: 'node variables.js',
        code: `let age = 42;                       // let: rebindable
const pi = 3.14;                    // const: the binding cannot be reassigned
const name = 'Ada';
const tags = ['c', 'rust'];
const scores = { alice: 1, bob: 2 };

age += 1;
console.log('age=%s pi=%s name=%s tags=[%s] scores={%s}',
  age, pi, name, tags.join(','),
  Object.entries(scores).map(([k, v]) => k + ':' + v).join(','));
console.log('types: %s %s %s %s', typeof age, typeof pi, typeof name, typeof tags);`,
        expect: ['age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
                 'types: number number string object'].join('\n'),
        note: 'One numeric type covers both 42 and 3.14, and everything else is an object. `const` protects the binding, not the value: a const object can still be mutated inside.'
      },
      bash: {
        file: 'variables.sh', effort: 2,
        run: 'bash variables.sh',
        code: `#!/usr/bin/env bash
age=42
age=$((age + 1))                          # the only arithmetic: integers
pi=3.14
name="Ada"
tags=(c rust)                             # indexed array

# A "map" is two parallel arrays. Bash 4+ would allow
# declare -A scores=( [alice]=1 [bob]=2 ), but macOS still ships bash 3.2.
score_keys=(alice bob)
score_vals=(1 2)

tag_text=$(IFS=,; echo "\${tags[*]}")
score_text=""
i=0
while (( i < \${#score_keys[@]} )); do
  score_text+="\${score_keys[$i]}:\${score_vals[$i]},"
  i=$((i + 1))
done
score_text=\${score_text%,}

printf 'age=%s pi=%s name=%s tags=[%s] scores={%s}\\n' \\
  "$age" "$pi" "$name" "$tag_text" "$score_text"`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: 'Everything is a string; `$(( ))` coerces to integers and back. There is no map type in the language as such: bash 4+ added `declare -A`, and macOS still ships bash 3.2, so the portable version here is a pair of parallel arrays with a hand-written loop.'
      },
      sql: {
        file: 'variables.sql', effort: 2,
        run: `sqlite3 :memory: < variables.sql`,
        code: `-- The "variables" are columns of a row. Types live in the column definitions.
WITH data AS (
  SELECT 43              AS age,      -- already incremented
         3.14            AS pi,
         'Ada'           AS name,
         'c,rust'        AS tags,     -- a real list would be a child table
         'alice:1,bob:2' AS scores
)
SELECT 'age=' || age || ' pi=' || pi || ' name=' || name ||
       ' tags=[' || tags || '] scores={' || scores || '}' AS line
FROM data;`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: 'A "variable" is a column and a "collection" would be another table. `||` concatenates, and SQL converts the numbers to text on the way. Note that no row order is guaranteed without ORDER BY.'
      },
      haskell: {
        file: 'variables.hs', effort: 2,
        run: 'runghc variables.hs',
        code: `import qualified Data.Map.Strict as M

age :: Int            -- a name for a value, not a box
age = 43              -- 43 is what it means, forever
pi :: Double
pi = 3.14
name :: String
name = "Ada"
tags :: [String]
tags = ["c", "rust"]
scores :: M.Map String Int
scores = M.fromList [("alice", 1), ("bob", 2)]

joinWith :: String -> [String] -> String
joinWith sep = foldr (\\a b -> if null b then a else a ++ sep ++ b) ""

main :: IO ()
main = putStrLn $ "age=" ++ show age ++ " pi=" ++ show pi ++ " name=" ++ name
  ++ " tags=[" ++ joinWith "," tags ++ "] scores={"
  ++ joinWith "," [k ++ ":" ++ show v | (k, v) <- M.toList scores] ++ "}"`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: 'There is no assignment anywhere: these are equations. "Increment" is expressed as a new binding — the value is written as 43 rather than computed in place.'
      },
      ocaml: {
        file: 'variables.ml', effort: 2,
        run: 'ocaml variables.ml',
        code: `let pi = 3.14
let name = "Ada"
let tags = ["c"; "rust"]
let scores = [("alice", 1); ("bob", 2)]

let join sep xs = String.concat sep xs

let () =
  let age = 42 in
  let age = age + 1 in        (* shadowing: a new binding, not mutation *)
  Printf.printf "age=%d pi=%s name=%s tags=[%s] scores={%s}\\n"
    age (string_of_float pi) name (join "," tags)
    (join "," (List.map (fun (k, v) -> Printf.sprintf "%s:%d" k v) scores))`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: '`let age = age + 1` mutates nothing — it introduces a new `age` that hides the old one. Real mutation needs `ref` or a mutable field, which is why it is opt-in.'
      },
      prolog: {
        file: 'variables.pl', effort: 3,
        run: 'swipl -q -g main -t halt variables.pl',
        code: `:- initialization(main).

main :-
    Age0 = 42,
    Age is Age0 + 1,          % is/2 evaluates, =/2 unifies
    Pi = 3.14,
    Name = "Ada",
    Tags = [c, rust],
    Scores = [alice-1, bob-2],
    format("age=~w pi=~w name=~w tags=[~w,~w] scores={~w:~w,~w:~w}~n",
           [Age, Pi, Name, c, rust, alice, 1, bob, 2]),
    length(Tags, _),
    length(Scores, _).`,
        expect: 'age=43 pi=3.14 name=Ada tags=[c,rust] scores={alice:1,bob:2}',
        note: 'Variables are logic variables, written with a capital letter, and may be unbound. `=` unifies, which can bind; `is` evaluates arithmetic. Other languages spell both with one symbol.'
      },
      datalog: {
        file: 'variables.dl', effort: 3, expect: null,
        run: 'souffle variables.dl',
        code: `// Facts are the data. A "variable" in Datalog is a placeholder inside a
// rule, not storage: nothing here can be assigned to.
.decl person(name: symbol, age: number)
.decl tags_of(name: symbol, tag: symbol)
.decl score(name: symbol, points: number)

person("Ada", 43).
tags_of("Ada", "c").
tags_of("Ada", "rust").
score("alice", 1).
score("bob", 2).

// Derived relations play the role of computed variables.
.decl tag_count(name: symbol, count: number)
tag_count(n, c) :- person(n, _), c = count : { tags_of(n, _) }.

.output person, tag_count, score`,
        note: 'There is no assignment and no mutable state anywhere in the language. Data is asserted as facts, and a rule can only define a new relation in terms of existing ones.'
      }
    }
  },

  {
    id: 'fizzbuzz',
    group: 'Basics',
    title: 'Conditionals and loops (FizzBuzz)',
    prompt: 'For the numbers 1 to 15 inclusive, print one line per number. Multiples of 3 print "Fizz", multiples of 5 print "Buzz", multiples of both print "FizzBuzz", and everything else prints the number itself.',
    why: 'This is the smallest task that needs a loop, a chain of conditions, and a decision about how divisibility is expressed. It is also the classic interview filter, which makes it a fair way to see how much syntax a trivial program demands.',
    takeaway: 'Every language has the same three ingredients, spelled differently: a counting loop, a remainder operator and ordered branching. The real differences are *where the loop comes from* and *what the language offers instead*. Haskell and OCaml use recursion, list ranges or an imperative `for`; SQL has no loop and generates its numbers with a recursive CTE; Bash expands `{1..15}` before the loop even runs; Prolog enumerates with forall/between; Datalog derives the numbers with a recursive rule. Assembly has no loop at all — only a label and a backward branch.',
    snippets: {
      asm: {
        file: 'fizzbuzz.s', effort: 5,
        run: 'clang -arch arm64 fizzbuzz.s -o fizzbuzz && ./fizzbuzz',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #16                   // one variadic slot
    mov   w19, #1                       // w19 = i
loop:
    cmp   w19, #15
    b.gt  done
    mov   w0, w19                       // w0 = i, w1 = divisor
    mov   w1, #15
    bl    _mod
    cbz   w0, hit_fizzbuzz
    mov   w0, w19
    mov   w1, #3
    bl    _mod
    cbz   w0, hit_fizz
    mov   w0, w19
    mov   w1, #5
    bl    _mod
    cbz   w0, hit_buzz
    str   x19, [sp]                     // varargs go on the stack, not in w1
    adrp  x0, numfmt@PAGE               // nothing divides it: the number
    add   x0, x0, numfmt@PAGEOFF
    bl    _printf
    b     next
hit_fizzbuzz:
    adrp  x0, fbfmt@PAGE
    add   x0, x0, fbfmt@PAGEOFF
    bl    _printf
    b     next
hit_fizz:
    adrp  x0, fzfmt@PAGE
    add   x0, x0, fzfmt@PAGEOFF
    bl    _printf
    b     next
hit_buzz:
    adrp  x0, bzfmt@PAGE
    add   x0, x0, bzfmt@PAGEOFF
    bl    _printf
next:
    add   w19, w19, #1                  // the whole "loop"
    b     loop
done:
    add   sp, sp, #16
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

// int mod(int a, int b): remainder via divide, multiply and subtract
_mod:
    sdiv  w2, w0, w1
    msub  w0, w2, w1, w0
    ret

    .section __DATA,__data
numfmt:  .asciz "%d\\n"
fzfmt:   .asciz "Fizz\\n"
bzfmt:   .asciz "Buzz\\n"
fbfmt:   .asciz "FizzBuzz\\n"`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'The `%` operator is not hardware: it is a divide, a multiply and a subtract, written out in `_mod`. Comparing and branching to a label is how every `if` is built, and there is no loop syntax at all — only a branch back to a label.'
      },
      c: {
        file: 'fizzbuzz.c', effort: 1,
        run: 'clang fizzbuzz.c -o fizzbuzz && ./fizzbuzz',
        code: `#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 15; i++) {
        if (i % 15 == 0)      puts("FizzBuzz");
        else if (i % 3 == 0)  puts("Fizz");
        else if (i % 5 == 0)  puts("Buzz");
        else                  printf("%d\\n", i);
    }
    return 0;
}`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'A counting `for` loop and `%`. The order of the conditions matters: testing 3 first would print "Fizz" for 15.'
      },
      cpp: {
        file: 'fizzbuzz.cpp', effort: 1,
        run: 'clang++ -std=c++20 fizzbuzz.cpp -o fizzbuzz && ./fizzbuzz',
        code: `#include <iostream>

int main() {
    for (int i = 1; i <= 15; ++i) {
        if (i % 15 == 0)     std::cout << "FizzBuzz\\n";
        else if (i % 3 == 0) std::cout << "Fizz\\n";
        else if (i % 5 == 0) std::cout << "Buzz\\n";
        else                 std::cout << i << '\\n';
    }
}`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'Identical logic to C with streams instead of stdio. The idiomatic C++ alternative builds the word first and appends the number only when it is empty.'
      },
      rust: {
        file: 'fizzbuzz.rs', effort: 2,
        run: 'rustc fizzbuzz.rs -o fizzbuzz && ./fizzbuzz',
        code: `fn fizzbuzz(i: u32) -> String {
    match (i % 3, i % 5) {
        (0, 0) => "FizzBuzz".to_string(),
        (0, _) => "Fizz".to_string(),
        (_, 0) => "Buzz".to_string(),
        _      => i.to_string(),
    }
}

fn main() {
    for i in 1..=15 {
        println!("{}", fizzbuzz(i));
    }
}`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'Pattern matching on the pair of remainders instead of an if-chain: the compiler checks that every combination is covered, so a missing case is a compile error.'
      },
      go: {
        file: 'fizzbuzz.go', effort: 1,
        run: 'go run fizzbuzz.go',
        code: `package main

import "fmt"

func main() {
	for i := 1; i <= 15; i++ {
		switch {
		case i%15 == 0:
			fmt.Println("FizzBuzz")
		case i%3 == 0:
			fmt.Println("Fizz")
		case i%5 == 0:
			fmt.Println("Buzz")
		default:
			fmt.Println(i)
		}
	}
}`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'A `switch` with no operand is Go\'s idiomatic if-chain, evaluated top to bottom. Conditions need no parentheses — Go treats them as noise.'
      },
      java: {
        file: 'FizzBuzz.java', effort: 2,
        run: 'java FizzBuzz.java',
        code: `public class FizzBuzz {
    public static void main(String[] args) {
        for (int i = 1; i <= 15; i++) {
            if (i % 15 == 0)      System.out.println("FizzBuzz");
            else if (i % 3 == 0)  System.out.println("Fizz");
            else if (i % 5 == 0)  System.out.println("Buzz");
            else                  System.out.println(i);
        }
    }
}`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'Exactly the C structure. Modern Java would build the word in a StringBuilder and append the number only when it is still empty.'
      },
      csharp: {
        file: 'Program.cs', effort: 2,
        run: 'dotnet run Program.cs',
        code: `string FizzBuzz(int i) => (i % 3, i % 5) switch {
    (0, 0) => "FizzBuzz",
    (0, _) => "Fizz",
    (_, 0) => "Buzz",
    _      => i.ToString(),
};

for (int i = 1; i <= 15; i++)
    Console.WriteLine(FizzBuzz(i));`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'A switch expression over a tuple, closest in spirit to the Rust version. Expression-oriented bodies are a language-wide pattern in modern C#.'
      },
      python: {
        file: 'fizzbuzz.py', effort: 1,
        run: 'python3 fizzbuzz.py',
        code: `for i in range(1, 16):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: '`range(1, 16)` is a lazy sequence, not a loop counter: the same for-in construct iterates lists, files and generators, which is why Python needs only one loop keyword.'
      },
      js: {
        file: 'fizzbuzz.js', effort: 1,
        run: 'node fizzbuzz.js',
        code: `for (let i = 1; i <= 15; i++) {
  if (i % 15 === 0) console.log('FizzBuzz');
  else if (i % 3 === 0) console.log('Fizz');
  else if (i % 5 === 0) console.log('Buzz');
  else console.log(i);
}`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'C\'s loop with C\'s syntax, but `===` rather than `==`: the strict operator skips the type coercion that the loose one performs.'
      },
      bash: {
        file: 'fizzbuzz.sh', effort: 2,
        run: 'bash fizzbuzz.sh',
        code: `#!/usr/bin/env bash
for i in {1..15}; do
  if   (( i % 15 == 0 )); then echo "FizzBuzz"
  elif (( i % 3  == 0 )); then echo "Fizz"
  elif (( i % 5  == 0 )); then echo "Buzz"
  else                         echo "$i"
  fi
done`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: '`{1..15}` is brace expansion, done by the shell before the loop runs, and `(( ))` is integer arithmetic. Outside those two places every value is still a string.'
      },
      sql: {
        file: 'fizzbuzz.sql', effort: 3,
        run: `sqlite3 :memory: < fizzbuzz.sql`,
        code: `-- SQL has no loop: the numbers are generated by a recursive CTE.
WITH RECURSIVE n(i) AS (
  SELECT 1
  UNION ALL
  SELECT i + 1 FROM n WHERE i < 15
)
SELECT CASE
         WHEN i % 15 = 0 THEN 'FizzBuzz'
         WHEN i %  3 = 0 THEN 'Fizz'
         WHEN i %  5 = 0 THEN 'Buzz'
         ELSE CAST(i AS TEXT)
       END AS fizzbuzz
FROM n;`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'Recursion replaces the loop and CASE replaces the if-chain. This is the same shape Prolog and Datalog use: describe the set of results rather than the steps that produce them.'
      },
      haskell: {
        file: 'fizzbuzz.hs', effort: 2,
        run: 'runghc fizzbuzz.hs',
        code: `fizzbuzz :: Int -> String
fizzbuzz n
  | n \`mod\` 15 == 0 = "FizzBuzz"
  | n \`mod\`  3 == 0 = "Fizz"
  | n \`mod\`  5 == 0 = "Buzz"
  | otherwise        = show n

main :: IO ()
main = mapM_ (putStrLn . fizzbuzz) [1 .. 15]`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'Guards are if/else without the keyword, `[1 .. 15]` is a lazy list, and mapM_ sequences the effects. The recursion is hidden inside the list and the standard library.'
      },
      ocaml: {
        file: 'fizzbuzz.ml', effort: 2,
        run: 'ocaml fizzbuzz.ml',
        code: `let fizzbuzz n =
  if n mod 15 = 0 then "FizzBuzz"
  else if n mod 3 = 0 then "Fizz"
  else if n mod 5 = 0 then "Buzz"
  else string_of_int n

let () =
  for i = 1 to 15 do
    print_endline (fizzbuzz i)
  done`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'OCaml keeps an imperative `for` loop for this kind of work, even though the same thing can be written as List.init 15 (fun i -> fizzbuzz (i + 1)) |> List.iter print_endline.'
      },
      prolog: {
        file: 'fizzbuzz.pl', effort: 3,
        run: 'swipl -q -g main -t halt fizzbuzz.pl',
        code: `:- initialization(main).

fizzbuzz(N, fizzbuzz) :- 0 is N mod 15, !.
fizzbuzz(N, fizz)     :- 0 is N mod 3,  !.
fizzbuzz(N, buzz)     :- 0 is N mod 5,  !.
fizzbuzz(N, N).                       % otherwise the number itself

main :-
    forall(between(1, 15, N),
           (fizzbuzz(N, Out), format("~w~n", [Out]))).`,
        expect: ['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz'].join('\n'),
        note: 'Clauses are tried in order and `!` (the cut) commits to the first match — Prolog\'s version of "stop looking". `forall/2` drives the enumeration where other languages write a loop.'
      },
      datalog: {
        file: 'fizzbuzz.dl', effort: 4, expect: null,
        run: 'souffle fizzbuzz.dl',
        code: `.decl n(i: number)
n(1).
n(i + 1) :- n(i), i < 15.          // the recursion that replaces the loop

.decl word(i: number, text: symbol)
word(i, "FizzBuzz") :- n(i), i % 15 = 0.
word(i, "Fizz")     :- n(i), i %  3 = 0, i % 15 != 0.
word(i, "Buzz")     :- n(i), i %  5 = 0, i % 15 != 0.

// Plain numbers are a separate relation: there is no "else" branch.
.decl plain(i: number)
plain(i) :- n(i), i % 3 != 0, i % 5 != 0.

.output word, plain`,
        note: 'No loop: the set of numbers is derived by a recursive rule that stops at 15, which is how Datalog says "for i in 1..15". Note the forced explicitness — you cannot fall through to a default, only define relations that hold.'
      }
    }
  },

  {
    id: 'functions',
    group: 'Basics',
    title: 'Functions and calls',
    prompt: 'Define an addition of two integers, a square of one integer, and a clamp that limits a value to the range 0..100 when called with one argument. Call them as add(3,4), square(3) and clamp(150), and print: add=7 square=9 clamp=100',
    why: 'Abstraction is the oldest idea in programming and every language here has it. The differences appear in the details: can arguments have defaults, can functions be overloaded, can they return more than one value, and are functions values in their own right.',
    takeaway: 'The syntax of a function differs far more than its semantics. The genuine divides are: *default arguments* (C++, C#, Python, JavaScript, Bash) versus languages that refuse them (C, Go, Rust, Java, Haskell, OCaml, Prolog — you write a wrapper, an overload, or an options type instead); *multiple return values* (Go natively, Python and C# by tuple, most languages not at all); and *whether a function is a value you can pass around* — trivial in Haskell, OCaml, JavaScript and Python, a function pointer or interface in C, C++, Rust, Go and Java, and simply a branch target in Assembly.',
    snippets: {
      asm: {
        file: 'functions.s', effort: 4, expect: 'add=7 square=9 clamp=100',
        run: 'clang -arch arm64 functions.s -o functions && ./functions',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #32               // three variadic slots
    mov   w0, #3                    // add(3, 4)
    mov   w1, #4
    bl    _add
    mov   w19, w0                   // result comes back in w0

    mov   w0, #3                    // square(3)
    bl    _square
    mov   w20, w0

    mov   w0, #150                  // clamp(150, 0, 100) — all args explicit
    mov   w1, #0
    mov   w2, #100
    bl    _clamp
    mov   w21, w0

    str   x19, [sp]                 // results are handed to printf as varargs
    str   x20, [sp, #8]
    str   x21, [sp, #16]
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf
    add   sp, sp, #32
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

// Arguments arrive in w0, w1, w2 … and the result leaves in w0.
_add:
    add   w0, w0, w1
    ret

_square:
    mul   w0, w0, w0
    ret

_clamp:
    cmp   w0, w1                    // x < lo ?
    b.lt  clamp_lo
    cmp   w0, w2                    // x > hi ?
    b.gt  clamp_hi
    ret
clamp_lo:
    mov   w0, w1
    ret
clamp_hi:
    mov   w0, w2
    ret

    .section __DATA,__data
fmt:  .asciz "add=%d square=%d clamp=%d\\n"`,
        note: 'A function is a label you branch to, with arguments placed in agreed registers and the result returned in w0. Default arguments are impossible — the caller always passes all three, so "clamp with one argument" is really "clamp with the other two filled in at the call site".'
      },
      c: {
        file: 'functions.c', effort: 2,
        run: 'clang functions.c -o functions && ./functions',
        code: `#include <stdio.h>

int add(int a, int b)    { return a + b; }
int square(int x)        { return x * x; }
int clamp(int x, int lo, int hi) {
    if (x < lo) return lo;
    if (x > hi) return hi;
    return x;
}

/* C has no default arguments: you write a second function instead. */
int clamp_100(int x)     { return clamp(x, 0, 100); }

int main(void) {
    printf("add=%d square=%d clamp=%d\\n", add(3, 4), square(3), clamp_100(150));
    return 0;
}`,
        expect: 'add=7 square=9 clamp=100',
        note: 'A return type in front, a declaration the compiler needs before the call, and a wrapper function where Python would write a default argument.'
      },
      cpp: {
        file: 'functions.cpp', effort: 2,
        run: 'clang++ -std=c++20 functions.cpp -o functions && ./functions',
        code: `#include <iostream>

int add(int a, int b) { return a + b; }
int add(double a, double b) { return static_cast<int>(a + b); }  // overload
int square(int x)     { return x * x; }
int clamp(int x, int lo = 0, int hi = 100) {                     // defaults
    if (x < lo) return lo;
    if (x > hi) return hi;
    return x;
}

int main() {
    std::cout << "add=" << add(3, 4) << " square=" << square(3)
              << " clamp=" << clamp(150) << std::endl;
}`,
        expect: 'add=7 square=9 clamp=100',
        note: 'Default arguments and overloading: two functions named `add` coexist, resolved at compile time, and `clamp(150)` compiles to the same three-argument call that C writes by hand.'
      },
      rust: {
        file: 'functions.rs', effort: 2,
        run: 'rustc functions.rs -o functions && ./functions',
        code: `fn add(a: i32, b: i32) -> i32 { a + b }   // the last expression is the result
fn square(x: i32) -> i32 { x * x }
fn clamp(x: i32, lo: i32, hi: i32) -> i32 { x.clamp(lo, hi) }

fn main() {
    println!("add={} square={} clamp={}", add(3, 4), square(3), clamp(150, 0, 100));
}`,
        expect: 'add=7 square=9 clamp=100',
        note: 'No defaults and no overloading — Rust uses a named constructor or an options struct for that. Note the missing `return`: the final expression is the value.'
      },
      go: {
        file: 'functions.go', effort: 2,
        run: 'go run functions.go',
        code: `package main

import "fmt"

func add(a, b int) int { return a + b }
func square(x int) int { return x * x }

// Multiple return values are idiomatic in Go.
func clamp(x, lo, hi int) (int, bool) {
	clamped := false
	if x < lo {
		x, clamped = lo, true
	} else if x > hi {
		x, clamped = hi, true
	}
	return x, clamped
}

func main() {
	sum, sq := add(3, 4), square(3)
	value, _ := clamp(150, 0, 100)
	fmt.Printf("add=%d square=%d clamp=%d\\n", sum, sq, value)
}`,
        expect: 'add=7 square=9 clamp=100',
        note: 'No defaults and no overloading, but functions return tuples — the same mechanism that carries the (result, error) pair through every Go program. Note the shared parameter list `a, b int`.'
      },
      java: {
        file: 'Functions.java', effort: 2,
        run: 'java Functions.java',
        code: `public class Functions {
    static int add(int a, int b) { return a + b; }
    static int square(int x)     { return x * x; }
    static int clamp(int x, int lo, int hi) { return Math.min(Math.max(x, lo), hi); }
    static int clamp(int x) { return clamp(x, 0, 100); }   // overload, not a default

    public static void main(String[] args) {
        System.out.printf("add=%d square=%d clamp=%d%n", add(3, 4), square(3), clamp(150));
    }
}`,
        expect: 'add=7 square=9 clamp=100',
        note: 'Overloading is Java\'s answer to default arguments: two methods, one name, resolved by arity. Methods live in a class, so a bare function cannot exist outside one.'
      },
      csharp: {
        file: 'Program.cs', effort: 1,
        run: 'dotnet run Program.cs',
        code: `int Add(int a, int b) => a + b;
int Square(int x) => x * x;
int Clamp(int x, int lo = 0, int hi = 100) => Math.Clamp(x, lo, hi);

Console.WriteLine($"add={Add(3, 4)} square={Square(3)} clamp={Clamp(150)}");
Console.WriteLine($"named arguments too: clamp with hi:50 = {Clamp(150, hi: 50)}");`,
        expect: ['add=7 square=9 clamp=100', 'named arguments too: clamp with hi:50 = 50'].join('\n'),
        note: 'Optional parameters and named arguments are both built in — a small feature that changes how libraries are called. Local functions replace the private static method you would need in Java.'
      },
      python: {
        file: 'functions.py', effort: 1,
        run: 'python3 functions.py',
        code: `def add(a, b):
    return a + b

def square(x):
    return x * x

def clamp(x, lo=0, hi=100):
    return max(lo, min(x, hi))

print(f"add={add(3, 4)} square={square(3)} clamp={clamp(150)}")
print(f"keyword arguments too: {clamp(150, hi=50)}")`,
        expect: ['add=7 square=9 clamp=100', 'keyword arguments too: 50'].join('\n'),
        note: 'Default values are evaluated once, when the function is defined, and can be overridden by name. No type is declared anywhere: this function will happily add two strings.'
      },
      js: {
        file: 'functions.js', effort: 2,
        run: 'node functions.js',
        code: `function add(a, b) { return a + b; }
const square = x => x * x;                    // arrow function
function clamp(x, lo = 0, hi = 100) {         // default parameter
  return Math.min(Math.max(x, lo), hi);
}

console.log('add=%d square=%d clamp=%d', add(3, 4), square(3), clamp(150));
console.log('arguments are not checked: %s', add('3', 4));   // 34, not 7`,
        expect: ['add=7 square=9 clamp=100', 'arguments are not checked: 34'].join('\n'),
        note: 'Two function forms: `function` gets its own `this`, arrow functions capture the enclosing one. Missing and extra arguments are silently tolerated, and strings coerce.'
      },
      bash: {
        file: 'functions.sh', effort: 3,
        run: 'bash functions.sh',
        code: `#!/usr/bin/env bash
add()    { echo $(( $1 + $2 )); }     # args are positional; the result is printed
square() { echo $(( $1 * $1 )); }

clamp() {                             # clamp x [lo] [hi]
  local x=$1 lo=\${2:-0} hi=\${3:-100}
  (( x < lo )) && x=$lo
  (( x > hi )) && x=$hi
  echo "$x"
}

printf 'add=%s square=%s clamp=%s\\n' "$(add 3 4)" "$(square 3)" "$(clamp 150)"`,
        expect: 'add=7 square=9 clamp=100',
        note: 'A shell function returns text through stdout and a status through $?. "Return a value" means print it and capture it with $( ), and default arguments are written as \${2:-0}.'
      },
      sql: {
        file: 'functions.sql', effort: 4,
        run: `sqlite3 :memory: < functions.sql`,
        code: `-- Core SQL has no user-defined functions. The portable substitutes are
-- expressions and named CTEs; real dialects add CREATE FUNCTION.
WITH add_pair(a, b)      AS (VALUES (3, 4)),  -- "add" is a reserved word
     square(x)            AS (VALUES (3)),
     clamp_row(x, lo, hi) AS (VALUES (150, 0, 100))
SELECT 'add=' || (SELECT a + b FROM add_pair)
    || ' square=' || (SELECT x * x FROM square)
    || ' clamp=' || (SELECT CASE WHEN x < lo THEN lo
                                 WHEN x > hi THEN hi
                                 ELSE x END FROM clamp_row) AS result;`,
        expect: 'add=7 square=9 clamp=100',
        note: 'Only built-in operators and functions exist in the standard; anything else is a query, or a procedural extension in a particular dialect (PL/pgSQL, PL/SQL, T-SQL). The CTE had to be renamed from `add` to `add_pair`, because ADD is a reserved word in SQLite.'
      },
      haskell: {
        file: 'functions.hs', effort: 1,
        run: 'runghc functions.hs',
        code: `add :: Int -> Int -> Int
add a b = a + b

square :: Int -> Int
square x = x * x

clamp :: Int -> Int -> Int -> Int
clamp x lo hi = max lo (min x hi)

main :: IO ()
main = do
  putStrLn $ "add=" ++ show (add 3 4)
          ++ " square=" ++ show (square 3)
          ++ " clamp=" ++ show (clamp 150 0 100)
  -- Every function really takes one argument, so (add 1) is already a function:
  putStrLn $ "partial application: " ++ show (map (add 1) [1, 2, 3])`,
        expect: ['add=7 square=9 clamp=100', 'partial application: [2,3,4]'].join('\n'),
        note: '`Int -> Int -> Int` means "takes an Int and returns a function from Int to Int". Default arguments would be pointless here, because calling with fewer arguments is already legal and useful.'
      },
      ocaml: {
        file: 'functions.ml', effort: 1,
        run: 'ocaml functions.ml',
        code: `let add a b = a + b
let square x = x * x
let clamp x lo hi = max lo (min x hi)

(* Optional arguments are marked in the type: ?lo:int -> ?hi:int -> int -> int *)
let clamp100 ?(lo = 0) ?(hi = 100) x = max lo (min x hi)

let () =
  Printf.printf "add=%d square=%d clamp=%d\\n" (add 3 4) (square 3) (clamp 150 0 100);
  Printf.printf "with optional arguments: %d\\n" (clamp100 150)`,
        expect: ['add=7 square=9 clamp=100', 'with optional arguments: 100'].join('\n'),
        note: 'Currying is the default: `add 3 4` is two calls, and `add 3` is a perfectly good function. Optional and labelled arguments exist, but they are a language feature rather than a special calling convention.'
      },
      prolog: {
        file: 'functions.pl', effort: 3,
        run: 'swipl -q -g main -t halt functions.pl',
        code: `:- initialization(main).

add(A, B, R)      :- R is A + B.
square(X, R)      :- R is X * X.
clamp(X, Lo, Hi, R) :- R is max(Lo, min(X, Hi)).

main :-
    add(3, 4, Sum),
    square(3, Sq),
    clamp(150, 0, 100, C),
    format("add=~w square=~w clamp=~w~n", [Sum, Sq, C]).`,
        expect: 'add=7 square=9 clamp=100',
        note: 'A "function" is a relation: the result is just another argument. `add(A, B, 7)` will even search for the pairs that make seven, which a function call cannot do.'
      },
      datalog: {
        file: 'functions.dl', effort: 4, expect: null,
        run: 'souffle functions.dl',
        code: `.decl input(a: number, b: number, x: number, lo: number, hi: number)
input(3, 4, 3, 0, 100).

// There are no functions: a result is a relation whose arguments are bound
// by the values of the inputs.
.decl result(operation: symbol, value: number)
result("add", a + b)     :- input(a, b, _, _, _).
result("square", x * x)  :- input(_, _, x, _, _).
result("clamp", v)       :- input(_, _, x, lo, hi), v = max(lo, min(x, hi)).

.output result`,
        note: 'You cannot call anything. Each rule states a relation between inputs and an output, and the engine computes the whole set of solutions at once.'
      }
    }
  }
];
