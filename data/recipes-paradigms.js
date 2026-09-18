/* ---------------------------------------------------------------------------
 * recipes-paradigms.js — tasks 9–10: higher-order functions, and sum types
 * with pattern matching. These two are where the paradigms separate most
 * sharply: what a language lets you pass around, and what it lets you model.
 * ------------------------------------------------------------------------- */
window.RECIPES_PARADIGMS = [
  {
    id: 'hof',
    group: 'Paradigms',
    title: 'Higher-order functions',
    prompt: 'Given the numbers 1, 2, 3, 4 produce the list with every value doubled, the sublist of even values, and the total sum. Print: doubled=[2,4,6,8] evens=[2,4] sum=10',
    why: 'Passing a function to a function is the single idea that separates the two halves of this list. Where it is native, whole libraries become one-liners. Where it is missing, the same work is a loop with a branch inside — and the language usually grows a workaround (interfaces, delegates, predicates, macros) to get the capability back.',
    takeaway: 'In Haskell, OCaml, Python, JavaScript, Rust, C#, C++ and Java a function is an ordinary value: it can be stored, passed, returned and composed. In C it is a pointer you must still call correctly; in Assembly it is an address you branch to, and the CPU has no idea it is a function at all. Go has the feature without the culture of chaining, so the plain loop stays more idiomatic. Prolog has the most general version of the idea: maplist takes a *predicate*, not a function, and will apply it to every solution of a goal. SQL and Datalog have nothing to pass — the closest SQL gets is a CASE expression, and Datalog has no functions at all.',
    snippets: {
      asm: {
        file: 'hof.s', effort: 5, expect: 'doubled=[2,4,6,8]',
        run: 'clang -arch arm64 hof.s -o hof && ./hof',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #32                // four variadic slots
    adrp  x19, nums@PAGE
    add   x19, x19, nums@PAGEOFF
    adrp  x21, _double@PAGE          // the function, as a value in a register
    add   x21, x21, _double@PAGEOFF
    mov   w20, #0                    // index
map_loop:
    cmp   w20, #4
    b.ge  map_done
    ldr   w0, [x19, w20, SXTW #2]    // the argument
    blr   x21                        // indirect call — this is the whole idea
    str   x0, [sp, x20, LSL #3]      // result straight into the printf slots
    add   w20, w20, #1
    b     map_loop
map_done:
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf
    add   sp, sp, #32
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

// The "function value" is simply its address.
_double:
    add   w0, w0, w0
    ret

    .section __DATA,__data
fmt:  .asciz "doubled=[%d,%d,%d,%d]\\n"
    .p2align 2
nums: .word 1, 2, 3, 4`,
        note: 'x21 holds the address of the code to run, and `blr x21` calls whatever is there. Function pointers, virtual methods, callbacks and delegates are all this one instruction; everything else is bookkeeping about types.',
        partial: 'Maps one function over the array; the filter and the fold are left as an exercise.'
      },
      c: {
        file: 'hof.c', effort: 3, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'clang hof.c -o hof && ./hof',
        code: `#include <stdio.h>

int dbl(int x)        { return x * 2; }
int is_even(int x)    { return x % 2 == 0; }
int add(int a, int b) { return a + b; }

/* map, filter and fold: three loops that take a function pointer. */
void map(int *xs, int n, int (*f)(int)) {
    for (int i = 0; i < n; i++) xs[i] = f(xs[i]);
}
void filter(const int *xs, int n, int (*keep)(int), int *out, int *out_n) {
    *out_n = 0;
    for (int i = 0; i < n; i++) if (keep(xs[i])) out[(*out_n)++] = xs[i];
}
int fold(const int *xs, int n, int (*f)(int, int), int init) {
    int acc = init;
    for (int i = 0; i < n; i++) acc = f(acc, xs[i]);
    return acc;
}

int main(void) {
    int xs[4] = {1, 2, 3, 4}, doubled[4], evens[4], n_evens;

    for (int i = 0; i < 4; i++) doubled[i] = xs[i];   /* keep the original */
    map(doubled, 4, dbl);
    filter(xs, 4, is_even, evens, &n_evens);

    printf("doubled=[%d,%d,%d,%d] evens=[%d,%d] sum=%d\\n",
           doubled[0], doubled[1], doubled[2], doubled[3],
           evens[0], evens[1], fold(xs, 4, add, 0));
    return 0;
}`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'You can absolutely do this in C — but you write the map, the filter and the fold yourself, and generic enough to be worth having. That is exactly what the C++ standard library went and did.'
      },
      cpp: {
        file: 'hof.cpp', effort: 1, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'clang++ -std=c++20 hof.cpp -o hof && ./hof',
        code: `#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> xs = {1, 2, 3, 4};

    std::vector<int> doubled;
    std::transform(xs.begin(), xs.end(), std::back_inserter(doubled),
                   [](int n) { return n * 2; });

    std::vector<int> evens;
    std::copy_if(xs.begin(), xs.end(), std::back_inserter(evens),
                 [](int n) { return n % 2 == 0; });

    int sum = std::accumulate(xs.begin(), xs.end(), 0);

    std::cout << "doubled=[";
    for (std::size_t i = 0; i < doubled.size(); ++i) std::cout << (i ? "," : "") << doubled[i];
    std::cout << "] evens=[";
    for (std::size_t i = 0; i < evens.size(); ++i) std::cout << (i ? "," : "") << evens[i];
    std::cout << "] sum=" << sum << std::endl;
}`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'A lambda is an object with a call operator, and the algorithms take it by value — so a capture is copied into that object, and everything still inlines to the machine code a hand-written loop would produce.'
      },
      rust: {
        file: 'hof.rs', effort: 1, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'rustc hof.rs -o hof && ./hof',
        code: `fn main() {
    let xs = vec![1, 2, 3, 4];

    let doubled: Vec<i32> = xs.iter().map(|n| n * 2).collect();
    let evens: Vec<i32> = xs.iter().copied().filter(|n| n % 2 == 0).collect();
    let sum: i32 = xs.iter().sum();

    let show = |v: &Vec<i32>| v.iter().map(|n| n.to_string()).collect::<Vec<_>>().join(",");
    println!("doubled=[{}] evens=[{}] sum={}", show(&doubled), show(&evens), sum);
}`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'Closures are anonymous types implementing Fn, FnMut or FnOnce, and iterator chains are zero-cost: each adapter compiles away. `collect()` is where the laziness stops and a real vector appears.'
      },
      go: {
        file: 'hof.go', effort: 2, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'go run hof.go',
        code: `package main

import (
	"fmt"
	"strconv"
	"strings"
)

func mapInts(xs []int, f func(int) int) []int {
	out := make([]int, len(xs))
	for i, x := range xs {
		out[i] = f(x)
	}
	return out
}

func filterInts(xs []int, keep func(int) bool) []int {
	var out []int
	for _, x := range xs {
		if keep(x) {
			out = append(out, x)
		}
	}
	return out
}

func reduceInts(xs []int, f func(int, int) int, init int) int {
	acc := init
	for _, x := range xs {
		acc = f(acc, x)
	}
	return acc
}

// %v renders a slice as "[2 4 6 8]", so the joining is still on you.
func joinInts(xs []int) string {
	parts := make([]string, len(xs))
	for i, n := range xs {
		parts[i] = strconv.Itoa(n)
	}
	return strings.Join(parts, ",")
}

func main() {
	xs := []int{1, 2, 3, 4}
	fmt.Printf("doubled=[%s] evens=[%s] sum=%d\\n",
		joinInts(mapInts(xs, func(n int) int { return n * 2 })),
		joinInts(filterInts(xs, func(n int) bool { return n%2 == 0 })),
		reduceInts(xs, func(a, b int) int { return a + b }, 0))
}`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'Functions are values and closures exist, but the standard library deliberately ships no Map/Filter/Reduce — Go\'s answer to looping is a loop. Note that %v renders a slice as "[2 4 6 8]", so even the output has to be assembled by hand.'
      },
      java: {
        file: 'Hof.java', effort: 2, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'java Hof.java',
        code: `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Hof {
    public static void main(String[] args) {
        List<Integer> xs = List.of(1, 2, 3, 4);

        BiFunction<List<Integer>, Function<Integer, Integer>, List<Integer>> mapFun =
                (list, f) -> list.stream().map(f).toList();
        BiFunction<List<Integer>, Predicate<Integer>, List<Integer>> filterFun =
                (list, keep) -> list.stream().filter(keep).toList();

        List<Integer> doubled = mapFun.apply(xs, n -> n * 2);
        List<Integer> evens = filterFun.apply(xs, n -> n % 2 == 0);
        int sum = xs.stream().mapToInt(Integer::intValue).sum();

        // List.toString() inserts ", " between elements, so join explicitly.
        System.out.printf("doubled=[%s] evens=[%s] sum=%d%n",
                doubled.stream().map(String::valueOf).collect(Collectors.joining(",")),
                evens.stream().map(String::valueOf).collect(Collectors.joining(",")),
                sum);
    }
}`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'The function types (Function, BiFunction, Predicate, Supplier) are interfaces with one abstract method, so a lambda fits them. That is why Java has no separate function type: it reused the interface it already had.'
      },
      csharp: {
        file: 'Program.cs', effort: 1, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'dotnet run Program.cs',
        code: `var xs = new List<int> { 1, 2, 3, 4 };

var doubled = xs.Select(n => n * 2).ToList();
var evens = xs.Where(n => n % 2 == 0).ToList();

// Method-group conversion: an existing method becomes a delegate.
int Double(int n) => n * 2;
var alsoDoubled = xs.Select(Double).ToList();

Console.WriteLine($"doubled=[{string.Join(",", doubled)}] evens=[{string.Join(",", evens)}] sum={xs.Sum()}");
Console.WriteLine($"method group works too: [{string.Join(",", alsoDoubled)}]");`,
        expect: ['doubled=[2,4,6,8] evens=[2,4] sum=10', 'method group works too: [2,4,6,8]'].join('\n'),
        note: 'Delegates (Func<T,R>) plus extension methods put the whole vocabulary on any IEnumerable. Note that LINQ is lazy until ToList: the query is described, not evaluated, until something asks for the values.'
      },
      python: {
        file: 'hof.py', effort: 1, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'python3 hof.py',
        code: `xs = [1, 2, 3, 4]

doubled = list(map(lambda n: n * 2, xs))        # function-passing style
evens = [n for n in xs if n % 2 == 0]           # comprehension style
total = sum(xs)

print(f"doubled=[{','.join(map(str, doubled))}] evens=[{','.join(map(str, evens))}] sum={total}")`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'Python offers both idioms, and the culture prefers comprehensions because they are faster and read better. Note that `sum` is a built-in function, but `doubled` had to be joined by hand.'
      },
      js: {
        file: 'hof.js', effort: 1, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'node hof.js',
        code: `const xs = [1, 2, 3, 4];

const doubled = xs.map(n => n * 2);
const evens = xs.filter(n => n % 2 === 0);
const sum = xs.reduce((a, b) => a + b, 0);

console.log('doubled=[%s] evens=[%s] sum=%d', doubled.join(','), evens.join(','), sum);

// Chains read left to right, and closures keep the surrounding variables alive:
const oddDoubled = xs.filter(n => n % 2 === 1).map(n => n * 2).reduce((a, b) => a + b, 0);
console.log('odd doubled total=%d', oddDoubled);`,
        expect: ['doubled=[2,4,6,8] evens=[2,4] sum=10', 'odd doubled total=8'].join('\n'),
        note: 'Arrays, Maps and Sets all carry these methods as ordinary properties, and every arrow function closes over its environment — which is why JavaScript feels functional despite being dynamically typed.'
      },
      bash: {
        file: 'hof.sh', effort: 4, expect: 'doubled=[2,4,6,8]\nevens=[2,4]',
        run: 'bash hof.sh',
        code: `#!/usr/bin/env bash
# A shell function cannot be "passed" — but its *name* can, and "$f" calls it.
apply() {                 # apply <function> <value>
  local f=$1 v=$2
  "$f" "$v"
}
double()  { echo $(( $1 * 2 )); }
is_even() { (( $1 % 2 == 0 )) && echo "$1"; }

nums=(1 2 3 4)
doubled=()
for n in "\${nums[@]}"; do doubled+=("$(apply double "$n")"); done

evens=()
for n in "\${nums[@]}"; do
  if out=$(apply is_even "$n"); then evens+=("$out"); fi
done

printf 'doubled=[%s]\\n' "$(IFS=,; echo "\${doubled[*]}")"
printf 'evens=[%s]\\n'   "$(IFS=,; echo "\${evens[*]}")"`,
        note: 'The shell\'s "function value" is its name: `"$f" "$v"` dispatches on a string. It works, but every call is a fresh command substitution with all the quoting and status-code hazards that implies — this is the limit of what strings-and-processes can express.'
      },
      sql: {
        file: 'hof.sql', effort: 3, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: `sqlite3 :memory: < hof.sql`,
        code: `-- There is no way to pass a function to a function. What SQL gives you
-- instead: expressions evaluated per row, and aggregates over the set.
WITH xs(n) AS (VALUES (1), (2), (3), (4)),
     doubled AS (SELECT n * 2 AS n FROM xs ORDER BY n),
     evens   AS (SELECT n FROM xs WHERE n % 2 = 0 ORDER BY n)
SELECT 'doubled=[' || (SELECT group_concat(n, ',') FROM doubled)
    || '] evens=[' || (SELECT group_concat(n, ',') FROM evens)
    || '] sum=' || (SELECT SUM(n) FROM xs) AS result;`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'Map is a projection, filter is a WHERE clause and fold is an aggregate — the three verbs exist, but they are syntax rather than values, so you cannot store one in a variable or build a new one at runtime.'
      },
      haskell: {
        file: 'hof.hs', effort: 1, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'runghc hof.hs',
        code: `xs :: [Int]
xs = [1, 2, 3, 4]

main :: IO ()
main = putStrLn $ "doubled=" ++ show (map (* 2) xs)
                ++ " evens=" ++ show (filter even xs)
                ++ " sum=" ++ show (foldr (+) 0 xs)`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'map, filter and fold are ordinary library functions over any list, `(* 2)` is a section (an operator partially applied), and Haskell happens to print lists in exactly the bracket format the task asked for.'
      },
      ocaml: {
        file: 'hof.ml', effort: 1, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'ocaml hof.ml',
        code: `let xs = [1; 2; 3; 4]

(* A function that takes a function: idiomatic, not exotic. *)
let transform f xs = List.map f xs
let keep p xs = List.filter p xs

let () =
  Printf.printf "doubled=[%s] evens=[%s] sum=%d\\n"
    (String.concat "," (List.map string_of_int (transform (fun n -> n * 2) xs)))
    (String.concat "," (List.map string_of_int (keep (fun n -> n mod 2 = 0) xs)))
    (List.fold_left ( + ) 0 xs)`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'Functions are curried, so `keep (fun n -> n mod 2 = 0)` is already a complete transformation waiting for a list — the higher-order style falls out of the type system rather than being bolted on.'
      },
      prolog: {
        file: 'hof.pl', effort: 3, expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        run: 'swipl -q -g main -t halt hof.pl',
        code: `:- initialization(main).
:- use_module(library(apply)).        % maplist/3 and friends
:- use_module(library(aggregate)).

main :-
    Xs = [1, 2, 3, 4],
    maplist(double, Xs, Doubled),     % pass a PREDICATE, not a function
    include(even, Xs, Evens),         % include/3 keeps what the goal proves
    aggregate_all(sum(N), member(N, Xs), Sum),
    atomic_list_concat(Doubled, ',', DTxt),
    atomic_list_concat(Evens, ',', ETxt),
    format("doubled=[~w] evens=[~w] sum=~w~n", [DTxt, ETxt, Sum]).

double(X, Y) :- Y is X * 2.
even(X) :- 0 is X mod 2.`,
        expect: 'doubled=[2,4,6,8] evens=[2,4] sum=10',
        note: 'maplist takes a *goal* and applies it, so the same call works with any predicate that has the right arity — including one assembled at runtime with =.. (univ). This is the most general form of the idea in the whole list.'
      },
      datalog: {
        file: 'hof.dl', effort: 4, na: true,
        note: 'Datalog has no functions at all — neither first-class nor first-order ones. Rules can be reused and the engine may parallelise them, but "passing behaviour as a value" is outside the paradigm entirely: there is nothing to pass.'
      }
    }
  },

  {
    id: 'adt',
    group: 'Paradigms',
    title: 'Sum types and pattern matching',
    prompt: 'Model a shape that is either a circle with a radius or a rectangle with a width and a height. Compute the area of circle(2) and rectangle(3,4), and treat an unrecognised shape as 0. Use 3.14159 for pi. Print: circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
    why: 'Data modelling is the decision that ages worst. A shape is exactly one of two things, and the way a language expresses "exactly one of" determines whether the compiler can help you: whether you can forget a case, whether you can construct an impossible value, and whether adding a third shape breaks your program at build time or at three in the morning.',
    takeaway: 'Haskell, OCaml and Rust put this at the centre of the language: `Circle Double | Rect Double Double` is closed, exhaustive, and a match that forgets a case does not compile. Java 21 and C# arrive at the same guarantee from the object-oriented side with sealed hierarchies, records and switch patterns, and C++ does it with std::variant, whose visitor must handle every alternative. Python 3.10 added structural pattern matching and dataclasses, JavaScript has only a tag field compared by hand, and Go has no sum type at all — an interface plus a type switch is the closest analogue, and the compiler will not tell you when a case is missing. C writes it as a struct with a discriminant, which is exactly what the functional languages compile to. In SQL the discriminant is a column; in Prolog it is a compound term matched by clause heads; and in Datalog you cannot compute an area at all, because with no function symbols there are no values to compute.',
    snippets: {
      asm: {
        file: 'adt.s', effort: 5, expect: 'circle(2)=12.57 rect(3,4)=12.00',
        run: 'clang -arch arm64 adt.s -o adt && ./adt',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #32                // two variadic slots (doubles)
    adrp  x19, shape@PAGE
    add   x19, x19, shape@PAGEOFF
    ldr   w20, [x19]                 // the discriminant: 0 = circle, 1 = rect
    fmov  d0, #0.0                   // default area: the "unknown" case
    cbz   w20, circle
    cmp   w20, #1
    b.ne  area_done
    ldr   w21, [x19, #4]             // the rectangle's two integers
    ldr   w22, [x19, #8]
    mul   w23, w21, w22
    scvtf d0, w23                    // integer area → double for printf
    b     area_done
circle:
    ldr   d1, [x19, #8]              // the circle's radius, a double
    fmul  d1, d1, d1                 // r²
    adrp  x0, pic@PAGE
    add   x0, x0, pic@PAGEOFF
    ldr   d2, [x0]
    fmul  d0, d1, d2                 // π r²
area_done:
    str   d0, [sp]                   // vararg 1: the circle's area
    mov   w21, #3                    // the rectangle, computed in line
    mov   w22, #4
    mul   w23, w21, w22
    scvtf d0, w23
    str   d0, [sp, #8]               // vararg 2: 3 × 4
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf
    add   sp, sp, #32
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

    .section __DATA,__data
fmt:   .asciz "circle(2)=%.2f rect(3,4)=%.2f\\n"
    .p2align 3
shape: .word 0                        // the tag
       .word 0                        // padding
       .double 2.0                    // radius — or, for a rect, w and h
pic:   .double 3.14159`,
        note: 'This is what a sum type *is*: a tag plus a payload whose meaning depends on the tag. The machine has no idea which is which, so a forgotten case here is a silently wrong answer rather than an error.',
        partial: 'Two shapes are computed inline; the unknown case is the fmov default but is not exercised.'
      },
      c: {
        file: 'adt.c', effort: 3, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'clang adt.c -o adt && ./adt',
        code: `#include <stdio.h>

enum shape_kind { SHAPE_CIRCLE, SHAPE_RECT, SHAPE_UNKNOWN };

struct shape {
    enum shape_kind kind;
    union {
        double radius;                  /* valid when kind == SHAPE_CIRCLE */
        struct { double w, h; } rect;   /* valid when kind == SHAPE_RECT  */
    } as;
};

double area(struct shape s) {
    switch (s.kind) {
        case SHAPE_CIRCLE:  return 3.14159 * s.as.radius * s.as.radius;
        case SHAPE_RECT:    return s.as.rect.w * s.as.rect.h;
        case SHAPE_UNKNOWN: break;
    }
    return 0.0;                          /* the compiler makes you write this */
}

int main(void) {
    struct shape circle = {SHAPE_CIRCLE, .as.radius = 2.0};
    struct shape rect   = {SHAPE_RECT,   .as.rect = {3.0, 4.0}};
    struct shape other  = {SHAPE_UNKNOWN, .as.radius = 0};

    printf("circle(2)=%.2f rect(3,4)=%.2f unknown=%.2f\\n",
           area(circle), area(rect), area(other));
    return 0;
}`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'The tagged union is the machine-level truth that Haskell, Rust and OCaml dress up with syntax. The cost is visible: nothing stops you reading `as.rect` from a circle, and a missing case is an `if` you must remember rather than an error.'
      },
      cpp: {
        file: 'adt.cpp', effort: 3, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'clang++ -std=c++20 adt.cpp -o adt && ./adt',
        code: `#include <iomanip>
#include <iostream>
#include <type_traits>
#include <variant>

struct Circle  { double r; };
struct Rect    { double w, h; };
struct Unknown {};

using Shape = std::variant<Circle, Rect, Unknown>;

double area(const Shape &s) {
    return std::visit([](const auto &shape) -> double {
        using T = std::decay_t<decltype(shape)>;
        if constexpr (std::is_same_v<T, Circle>)    return 3.14159 * shape.r * shape.r;
        else if constexpr (std::is_same_v<T, Rect>) return shape.w * shape.h;
        else                                       return 0.0;
    }, s);
}

int main() {
    std::cout << std::fixed << std::setprecision(2)
              << "circle(2)=" << area(Shape{Circle{2.0}})
              << " rect(3,4)=" << area(Shape{Rect{3.0, 4.0}})
              << " unknown=" << area(Shape{Unknown{}}) << std::endl;
}`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'std::variant knows which alternative is active and throws on a bad access, but an unhandled alternative in the visitor is still a runtime error unless you use the overload-set idiom that makes the compiler check exhaustiveness.'
      },
      rust: {
        file: 'adt.rs', effort: 1, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'rustc adt.rs -o adt && ./adt',
        code: `enum Shape {
    Circle(f64),
    Rect(f64, f64),
    Unknown,
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle(r) => 3.14159 * r * r,
        Shape::Rect(w, h) => w * h,
        Shape::Unknown => 0.0,
    }   // delete any arm and this stops compiling
}

fn main() {
    let shapes = [Shape::Circle(2.0), Shape::Rect(3.0, 4.0), Shape::Unknown];
    println!("circle(2)={:.2} rect(3,4)={:.2} unknown={:.2}",
             area(&shapes[0]), area(&shapes[1]), area(&shapes[2]));
}`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'An enum carries data and match must be exhaustive. Adding a Triangle variant breaks this function at compile time, with the file and line in the error — that is the whole argument for sum types in one sentence.'
      },
      go: {
        file: 'adt.go', effort: 3, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'go run adt.go',
        code: `package main

import "fmt"

// Go has no sum types. An interface with a private method is the idiom:
// only types in this package can satisfy it, so the set is closed in practice.
type Shape interface{ isShape() }

type Circle struct{ R float64 }
type Rect struct{ W, H float64 }
type Unknown struct{}

func (Circle) isShape()  {}
func (Rect) isShape()    {}
func (Unknown) isShape() {}

func area(s Shape) float64 {
	switch v := s.(type) {          // the type switch: closest thing to match
	case Circle:
		return 3.14159 * v.R * v.R
	case Rect:
		return v.W * v.H
	default:
		return 0
	}
}

func main() {
	fmt.Printf("circle(2)=%.2f rect(3,4)=%.2f unknown=%.2f\\n",
		area(Circle{2}), area(Rect{3, 4}), area(Unknown{}))
}`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'It works, and a new shape is silently absorbed by the `default` branch — the compiler says nothing. Go considers that an acceptable price for simplicity; the functional camp considers it the exact problem the feature was invented to solve.'
      },
      java: {
        file: 'Shapes.java', effort: 2, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'java Shapes.java',
        code: `public class Shapes {
    sealed interface Shape permits Circle, Rect, Unknown {}
    record Circle(double r) implements Shape {}
    record Rect(double w, double h) implements Shape {}
    record Unknown() implements Shape {}

    static double area(Shape s) {
        return switch (s) {                      // no default needed: it must be total
            case Circle c  -> 3.14159 * c.r() * c.r();
            case Rect r    -> r.w() * r.h();
            case Unknown u -> 0.0;
        };
    }

    public static void main(String[] args) {
        System.out.printf("circle(2)=%.2f rect(3,4)=%.2f unknown=%.2f%n",
                area(new Circle(2)), area(new Rect(3, 4)), area(new Unknown()));
    }
}`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'The object-oriented route to the same guarantee: `sealed` closes the hierarchy, records carry the data, and a switch over patterns must cover every permitted type. Java 21 made this idiom real, and it is the biggest change to the language since generics.'
      },
      csharp: {
        file: 'Program.cs', effort: 1, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'dotnet run Program.cs',
        code: `abstract record Shape;
record Circle(double R) : Shape;
record Rect(double W, double H) : Shape;
record Other : Shape;

double Area(Shape s) => s switch {
    Circle c => 3.14159 * c.R * c.R,
    Rect r   => r.W * r.H,
    _        => 0.0,            // where the "unknown" case lives
};

Console.WriteLine($"circle(2)={Area(new Circle(2)):F2} rect(3,4)={Area(new Rect(3, 4)):F2} unknown={Area(new Other()):F2}");`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'Records give value semantics and deconstruction for free, and the switch expression covers the known patterns. Because the hierarchy is not sealed, the compiler cannot prove totality — hence the `_` arm.'
      },
      python: {
        file: 'adt.py', effort: 2, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'python3 adt.py',
        code: `from dataclasses import dataclass
from typing import Union

@dataclass(frozen=True)
class Circle:
    r: float

@dataclass(frozen=True)
class Rect:
    w: float
    h: float

Shape = Union[Circle, Rect, str]        # the "unknown" case is anything else

def area(shape: Shape) -> float:
    match shape:                        # structural pattern matching, 3.10+
        case Circle(r):  return 3.14159 * r * r
        case Rect(w, h): return w * h
        case _:          return 0.0

print(f"circle(2)={area(Circle(2)):.2f} rect(3,4)={area(Rect(3, 4)):.2f} "
      f"unknown={area('hexagon'):.2f}")`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'Dataclasses plus `match` give the syntax of a sum type without the guarantee: matching happens at runtime, an unrecognised shape silently hits `case _`, and a typo in a class name is a complaint from a type checker rather than an error from the interpreter.'
      },
      js: {
        file: 'adt.js', effort: 2, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'node adt.js',
        code: `// There is no sum type. The tag is a property, and matching is a switch.
const circle = { kind: 'circle', r: 2 };
const rect = { kind: 'rect', w: 3, h: 4 };
const other = { kind: 'blob' };

function area(shape) {
  switch (shape.kind) {
    case 'circle': return 3.14159 * shape.r ** 2;
    case 'rect':   return shape.w * shape.h;
    default:       return 0;
  }
}

console.log('circle(2)=%s rect(3,4)=%s unknown=%s',
  area(circle).toFixed(2), area(rect).toFixed(2), area(other).toFixed(2));

// TypeScript approximates this with discriminated unions; the runtime
// behaviour above is what they compile to.`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'A tag plus a switch is the C idiom again, with one difference: the object can carry anything in any branch, so there is no shape of data for a checker to compare against.'
      },
      bash: {
        file: 'adt.sh', effort: 4, na: true,
        note: 'Bash has no compound values: an array holds strings, and no single value can carry both a tag and a payload. You would keep them in separate variables and remember which ones are valid — the matching half of the idea cannot be expressed at all.'
      },
      sql: {
        file: 'adt.sql', effort: 2, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: `sqlite3 :memory: < adt.sql`,
        code: `-- A variant is a row: the discriminant is a column, the payload more columns.
WITH shapes(kind, a, b) AS (
  VALUES ('circle', 2.0, NULL), ('rect', 3.0, 4.0), ('blob', NULL, NULL)
)
SELECT 'circle(2)=' || printf('%.2f', (SELECT 3.14159 * a * a FROM shapes WHERE kind = 'circle'))
    || ' rect(3,4)=' || printf('%.2f', (SELECT a * b FROM shapes WHERE kind = 'rect'))
    || ' unknown=' || printf('%.2f', COALESCE((SELECT a * b FROM shapes WHERE kind = 'blob'), 0.0))
    AS result;`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'CASE and a kind column do the work of pattern matching, and the unknown case arrives naturally as NULL, which COALESCE turns into zero. A CHECK constraint tying tag to payload is the database version of exhaustiveness.'
      },
      haskell: {
        file: 'adt.hs', effort: 1, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'runghc adt.hs',
        code: `import Numeric (showFFloat)

data Shape
  = Circle Double
  | Rect Double Double
  | Unknown
  deriving Show

area :: Shape -> Double
area (Circle r) = 3.14159 * r * r
area (Rect w h) = w * h
area Unknown    = 0

fmt :: Double -> String
fmt x = showFFloat (Just 2) x ""

main :: IO ()
main = putStrLn $ "circle(2)=" ++ fmt (area (Circle 2))
                ++ " rect(3,4)=" ++ fmt (area (Rect 3 4))
                ++ " unknown=" ++ fmt (area Unknown)`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'This is where the idea comes from: a type is a set of alternatives and matching is how you consume one. Add a Triangle constructor and every function that matches on Shape stops compiling until it handles the new case.'
      },
      ocaml: {
        file: 'adt.ml', effort: 1, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'ocaml adt.ml',
        code: `type shape =
  | Circle of float
  | Rect of float * float
  | Unknown

let area = function
  | Circle r -> 3.14159 *. r *. r
  | Rect (w, h) -> w *. h
  | Unknown -> 0.

let () =
  Printf.printf "circle(2)=%.2f rect(3,4)=%.2f unknown=%.2f\\n"
    (area (Circle 2.)) (area (Rect (3., 4.))) (area Unknown)`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'The `function` keyword is a pattern match over the argument, and a missing case produces a warning that names the cases you forgot. This is the feature Rust inherited most directly.'
      },
      prolog: {
        file: 'adt.pl', effort: 2, expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        run: 'swipl -q -g main -t halt adt.pl',
        code: `:- initialization(main).

%% The clauses ARE the pattern match: each head discriminates on shape.
area(circle(R), A)  :- A is 3.14159 * R * R.
area(rect(W, H), A) :- A is W * H.
area(_, 0).                          % catch-all: the "unknown" shape

main :-
    area(circle(2), A1),
    area(rect(3, 4), A2),
    area(hexagon, A3),
    format("circle(2)=~2f rect(3,4)=~2f unknown=~2f~n", [A1, A2, A3]).`,
        expect: 'circle(2)=12.57 rect(3,4)=12.00 unknown=0.00',
        note: 'Matching is not a statement here, it is the definition of the predicate: Prolog tries each clause head in order and the first that unifies wins. `hexagon` matches the third clause because a variable matches anything.'
      },
      datalog: {
        file: 'adt.dl', effort: 4, na: true,
        note: 'With no function symbols there are no compound values to match on and no arithmetic to perform on them: you cannot write Circle(2) as a term and compute its area. What you can write is a relation — area(circle, 2, 12.57) — which means supplying the answers as data rather than computing them.'
      }
    }
  }
];
