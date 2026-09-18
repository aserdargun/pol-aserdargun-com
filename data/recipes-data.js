/* ---------------------------------------------------------------------------
 * recipes-data.js — tasks 5–8: recursion, collections, sorting, text.
 * ------------------------------------------------------------------------- */
window.RECIPES_DATA = [
  {
    id: 'factorial',
    group: 'Data & Algorithms',
    title: 'Recursion',
    prompt: 'Compute 5! twice: once with a function that calls itself, and once with a loop. Print: factorial(5)=120 iterative(5)=120',
    why: 'Recursion is where the two halves of programming meet: the mathematical definition and the machine that has to run it. This task shows how each language expresses a self-calling function, and what it costs — a stack frame, a tail call, a fixpoint, or nothing at all because the pattern is hidden inside the standard library.',
    takeaway: 'The recursive definition is nearly identical everywhere: a base case, a smaller call, a combination. What differs is the *machinery around it*. Assembly shows what a call actually costs: you push a frame, save n, call, reload. C, C++ and Java give you functions but no guarantee that the compiler will turn tail recursion into a loop — Haskell and OCaml do the opposite and treat recursion as the normal way to repeat. SQL, Datalog and Prolog have no stack in user code at all: recursion is a rule that derives new rows or facts until nothing new appears, and Datalog additionally *guarantees* it terminates.',
    snippets: {
      asm: {
        file: 'factorial.s', effort: 5,
        run: 'clang -arch arm64 factorial.s -o factorial && ./factorial',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #32                // two variadic slots
    mov   w0, #5
    bl    _fact_rec                  // factorial by recursion
    mov   w19, w0
    mov   w0, #5
    bl    _fact_it                   // factorial by iteration
    mov   w20, w0
    str   x19, [sp]
    str   x20, [sp, #8]
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf
    add   sp, sp, #32
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

// Each recursive call gets a frame of its own: 32 bytes for the saved
// frame pointer, the return address, and n itself.
_fact_rec:
    cmp   w0, #1
    b.le  fr_base
    stp   x29, x30, [sp, #-32]!
    str   w0, [sp, #16]              // save n across the recursive call
    sub   w0, w0, #1                 // the "smaller problem"
    bl    _fact_rec
    ldr   w1, [sp, #16]              // get n back
    mul   w0, w0, w1                 // combine: n * f(n-1)
    ldp   x29, x30, [sp], #32
    ret
fr_base:
    mov   w0, #1
    ret

// Iteration needs no frames: one loop and one register.
_fact_it:
    mov   w1, #1                     // accumulator
fit_loop:
    cmp   w0, #1
    b.le  fit_done
    mul   w1, w1, w0
    sub   w0, w0, #1
    b     fit_loop
fit_done:
    mov   w0, w1
    ret

    .section __DATA,__data
fmt:  .asciz "factorial(5)=%d iterative(5)=%d\\n"`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'The recursive version is not free: every call pushes a 32-byte frame and the stack grows with n. The iterative version keeps everything in two registers — this is the trade-off that every language above is making for you.'
      },
      c: {
        file: 'factorial.c', effort: 1,
        run: 'clang factorial.c -o factorial && ./factorial',
        code: `#include <stdio.h>

int fact_rec(int n) {
    if (n <= 1) return 1;
    return n * fact_rec(n - 1);
}

int fact_it(int n) {
    int acc = 1;
    for (; n > 1; n--) acc *= n;
    return acc;
}

int main(void) {
    printf("factorial(5)=%d iterative(5)=%d\\n", fact_rec(5), fact_it(5));
    return 0;
}`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'Both forms are equally available. The compiler may or may not turn the recursion into a loop — C promises nothing about tail calls, so deep recursion is a stack-overflow risk.'
      },
      cpp: {
        file: 'factorial.cpp', effort: 1,
        run: 'clang++ -std=c++20 factorial.cpp -o factorial && ./factorial',
        code: `#include <iostream>
#include <numeric>
#include <vector>

int fact_rec(int n) { return n <= 1 ? 1 : n * fact_rec(n - 1); }

int fact_fold(int n) {
    std::vector<int> factors;
    for (int i = 2; i <= n; ++i) factors.push_back(i);
    return std::accumulate(factors.begin(), factors.end(), 1, std::multiplies<int>());
}

int main() {
    std::cout << "factorial(5)=" << fact_rec(5)
              << " iterative(5)=" << fact_fold(5) << std::endl;
}`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'The iterative half is written as a fold over a range — C++ borrowing the functional shape through <numeric> rather than writing a loop.'
      },
      rust: {
        file: 'factorial.rs', effort: 2,
        run: 'rustc factorial.rs -o factorial && ./factorial',
        code: `fn fact_rec(n: u32) -> u32 {
    if n <= 1 { 1 } else { n * fact_rec(n - 1) }
}

fn fact_fold(n: u32) -> u32 {
    (2..=n).product()          // product() is a fold over the range
}

fn main() {
    println!("factorial(5)={} iterative(5)={}", fact_rec(5), fact_fold(5));
}`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'Rust will not guarantee tail-call optimisation either — deep recursion can still overflow the stack, so the idiomatic answer is an iterator. The compiler did check that n cannot be negative.'
      },
      go: {
        file: 'factorial.go', effort: 1,
        run: 'go run factorial.go',
        code: `package main

import "fmt"

func factRec(n int) int {
	if n <= 1 {
		return 1
	}
	return n * factRec(n-1)
}

func factIt(n int) int {
	acc := 1
	for i := 2; i <= n; i++ {
		acc *= i
	}
	return acc
}

func main() {
	fmt.Printf("factorial(5)=%d iterative(5)=%d\\n", factRec(5), factIt(5))
}`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'Go also refuses to promise tail-call optimisation; the idiom is a plain loop. Note that a goroutine\'s stack grows dynamically, so recursion is less likely to blow up than in C.'
      },
      java: {
        file: 'Factorial.java', effort: 2,
        run: 'java Factorial.java',
        code: `public class Factorial {
    static int factRec(int n) {
        return n <= 1 ? 1 : n * factRec(n - 1);
    }

    static int factIt(int n) {
        int acc = 1;
        for (int i = 2; i <= n; i++) acc *= i;
        return acc;
    }

    public static void main(String[] args) {
        System.out.printf("factorial(5)=%d iterative(5)=%d%n", factRec(5), factIt(5));
    }
}`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'The JVM has no tail-call optimisation by design (it would break stack traces and security checks), so recursion here is a stylistic choice with a real stack cost.'
      },
      csharp: {
        file: 'Program.cs', effort: 1,
        run: 'dotnet run Program.cs',
        code: `int FactRec(int n) => n <= 1 ? 1 : n * FactRec(n - 1);
int FactIt(int n) => Enumerable.Range(2, Math.Max(0, n - 1)).Aggregate(1, (a, b) => a * b);

Console.WriteLine($"factorial(5)={FactRec(5)} iterative(5)={FactIt(5)}");`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'The iterative version is expressed as an Aggregate over a generated range — LINQ again hiding the loop, in the same way the C++ version hid it in std::accumulate.'
      },
      python: {
        file: 'factorial.py', effort: 1,
        run: 'python3 factorial.py',
        code: `def fact_rec(n):
    if n <= 1:
        return 1
    return n * fact_rec(n - 1)

def fact_it(n):
    acc = 1
    for i in range(2, n + 1):
        acc *= i
    return acc

print(f"factorial(5)={fact_rec(5)} iterative(5)={fact_it(5)}")
print("recursion limit is", __import__("sys").getrecursionlimit())`,
        expect: ['factorial(5)=120 iterative(5)=120', 'recursion limit is 1000'].join('\n'),
        note: 'No tail-call optimisation and a hard recursion limit (1000 by default): recursion in Python is a technique for small problems, and a loop or functools.reduce for larger ones.'
      },
      js: {
        file: 'factorial.js', effort: 2,
        run: 'node factorial.js',
        code: `function factRec(n) {
  return n <= 1 ? 1 : n * factRec(n - 1);
}

function factIt(n) {
  let acc = 1;
  for (let i = 2; i <= n; i++) acc *= i;
  return acc;
}

console.log('factorial(5)=%d iterative(5)=%d', factRec(5), factIt(5));
console.log('stack depth is limited; the engine throws RangeError, not a crash');`,
        expect: ['factorial(5)=120 iterative(5)=120',
                 'stack depth is limited; the engine throws RangeError, not a crash'].join('\n'),
        note: 'Proper tail calls exist in the specification but are only implemented where the engine chooses; a runaway recursion throws a catchable RangeError instead of corrupting memory.'
      },
      bash: {
        file: 'factorial.sh', effort: 3,
        run: 'bash factorial.sh',
        code: `#!/usr/bin/env bash
fact_rec() {                       # recursion works, each call is a shell frame
  local n=$1
  if (( n <= 1 )); then
    echo 1
  else
    local sub
    sub=$(fact_rec $(( n - 1 )))
    echo $(( n * sub ))
  fi
}

fact_it() {
  local n=$1 acc=1
  while (( n > 1 )); do
    acc=$(( acc * n ))
    n=$(( n - 1 ))
  done
  echo "$acc"
}

printf 'factorial(5)=%s iterative(5)=%s\\n' "$(fact_rec 5)" "$(fact_it 5)"`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'Both work, but the recursive version spawns a command substitution per level — in a shell, the cost of a "function call" is measured in processes, so the loop is the right answer in practice.'
      },
      sql: {
        file: 'factorial.sql', effort: 3,
        run: `sqlite3 :memory: < factorial.sql`,
        code: `-- Recursion with no stack in your code: this CTE derives rows (2, 2), (3, 6), …
WITH RECURSIVE f(n, acc) AS (
  SELECT 1, 1
  UNION ALL
  SELECT n + 1, acc * (n + 1) FROM f WHERE n < 5
)
SELECT 'factorial(5)=' || acc || ' iterative(5)=' || acc FROM f WHERE n = 5;`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'There is only one way to recurse, and it is not a function call at all: the CTE produces a set, and the engine decides how many rows to materialise. The "iterative" and "recursive" forms are the same query here.'
      },
      haskell: {
        file: 'factorial.hs', effort: 1,
        run: 'runghc factorial.hs',
        code: `factRec :: Integer -> Integer
factRec 0 = 1                       -- pattern matching on the base case
factRec n = n * factRec (n - 1)

-- Tail recursion with an accumulator: constant stack space.
factAcc :: Integer -> Integer
factAcc n = go n 1
  where go 0 acc = acc
        go k acc = go (k - 1) (k * acc)

main :: IO ()
main = putStrLn $ "factorial(5)=" ++ show (factRec 5)
                ++ " iterative(5)=" ++ show (factAcc 5)`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'Recursion is the normal way to repeat, and GHC optimises the accumulator form into a loop. Note also that Integer is arbitrary precision: factRec 100 would be exact, not overflowed.'
      },
      ocaml: {
        file: 'factorial.ml', effort: 1,
        run: 'ocaml factorial.ml',
        code: `let rec fact_rec n = if n <= 1 then 1 else n * fact_rec (n - 1)

(* Tail-recursive version: OCaml does guarantee the optimisation. *)
let fact_acc n =
  let rec go k acc = if k <= 1 then acc else go (k - 1) (k * acc) in
  go n 1

let () =
  Printf.printf "factorial(5)=%d iterative(5)=%d\\n" (fact_rec 5) (fact_acc 5)`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: '`let rec` marks a function as recursive — without it the name is not in scope inside its own body. OCaml compiles tail calls to jumps, so fact_acc runs in constant stack.'
      },
      prolog: {
        file: 'factorial.pl', effort: 2,
        run: 'swipl -q -g main -t halt factorial.pl',
        code: `:- initialization(main).

%% Two clauses: the base case, then the recursive one.
fact(0, 1).
fact(N, F) :-
    N > 0,
    N1 is N - 1,
    fact(N1, F1),
    F is N * F1.

main :-
    fact(5, F),
    format("factorial(5)=~w iterative(5)=~w~n", [F, F]).`,
        expect: 'factorial(5)=120 iterative(5)=120',
        note: 'The recursive clause reads as the mathematical definition, and unification means `fact(5, F)` also runs in reverse — `fact(N, 120)` enumerates candidates. That is not a function call, it is a relation.'
      },
      datalog: {
        file: 'factorial.dl', effort: 3, expect: null,
        run: 'souffle factorial.dl',
        code: `.decl fact(n: number, value: number)
fact(0, 1).                                   // the base case
fact(n + 1, value * (n + 1)) :-               // the recursive case
    fact(n, value), n < 5.

.output fact`,
        note: 'Recursion as a rule: new rows keep being derived until the rule adds nothing. The `n < 5` guard is what terminates it — and because Datalog forbids function symbols, every program written this way is guaranteed to terminate.'
      }
    }
  },

  {
    id: 'collections',
    group: 'Data & Algorithms',
    title: 'Collections: sum, filter, maximum',
    prompt: 'Given the numbers 1, 2, 3, 4, 5 find their total, the subset that is even, and the largest value. Print exactly: sum=15 evens=[2,4] max=5',
    why: 'Containers are where the difference between a library and a language becomes visible. Some languages ship lists and maps as syntax; others expect you to build them or import them; two of the fifteen have no container in the language at all and expect you to model the data relationally.',
    takeaway: 'The three operations are the same everywhere and differ mainly in *who writes the loop*: you do, in C and Assembly; the standard library does, in Python, JavaScript, Rust, Go and the functional languages. The deeper split is between *sequence* and *set*. Python, JavaScript, C++, Rust, Java, C#, Go and Bash all think in sequences you iterate in order. SQL, Prolog and Datalog think in sets and relations: "the evens" is not a filtered array, it is a selection, and the order of the answer is not defined unless you ask for one.',
    snippets: {
      asm: {
        file: 'collections.s', effort: 5, expect: 'sum=15 evens=[2,4] max=5',
        run: 'clang -arch arm64 collections.s -o collections && ./collections',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #32                // three variadic slots
    adrp  x19, nums@PAGE
    add   x19, x19, nums@PAGEOFF
    mov   w20, #0                    // index
    mov   w21, #0                    // sum
    mov   w22, #0                    // max
    mov   w24, #0                    // even count, for formatting
scan:
    cmp   w20, #5
    b.ge  scan_done
    ldr   w23, [x19, w20, SXTW #2]   // nums[i]
    add   w21, w21, w23              // sum += nums[i]
    cmp   w23, w22
    csel  w22, w23, w22, gt          // max = (nums[i] > max) ? nums[i] : max
    add   w20, w20, #1
    b     scan
scan_done:
    // a second pass with a conditional store builds the evens list
    adrp  x25, buff@PAGE
    add   x25, x25, buff@PAGEOFF
    mov   w20, #0
    mov   w26, #0
evens:
    cmp   w20, #5
    b.ge  evens_done
    ldr   w23, [x19, w20, SXTW #2]
    tst   w23, #1                    // the hardware test for "even"
    b.ne  skip
    str   w23, [x25, w26, SXTW #2]
    add   w26, w26, #1
skip:
    add   w20, w20, #1
    b     evens
evens_done:
    ldr   w4, [x25]                  // buff[0]
    ldr   w5, [x25, #4]              // buff[1] — we know there are exactly two
    str   x21, [sp]                  // every %d below is a vararg: sum,
    str   x4,  [sp, #8]              // evens[0], evens[1] and max,
    str   x5,  [sp, #16]             // one 8-byte slot each
    str   x22, [sp, #24]
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf
    add   sp, sp, #32
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

    .section __DATA,__data
fmt:  .asciz "sum=%d evens=[%d,%d] max=%d\\n"
    .p2align 2
nums: .word 1, 2, 3, 4, 5
buff: .space 20                       // room for the filtered values`,
        note: 'The list is three things you keep in step yourself: a pointer, a length, and the discipline not to run past it. `tst w23, #1` is the even test — bit 0 clear means even, which is what `% 2 == 0` compiles to.',
        partial: 'The filtered list is built into a fixed buffer; nothing bounds-checks it.'
      },
      c: {
        file: 'collections.c', effort: 3, expect: 'sum=15 evens=[2,4] max=5',
        run: 'clang collections.c -o collections && ./collections',
        code: `#include <stdio.h>

int main(void) {
    int nums[5] = {1, 2, 3, 4, 5};
    int evens[5], even_count = 0;
    int sum = 0, max = nums[0];

    for (int i = 0; i < 5; i++) {
        sum += nums[i];
        if (nums[i] > max) max = nums[i];
        if (nums[i] % 2 == 0) evens[even_count++] = nums[i];
    }

    printf("sum=%d evens=[", sum);
    for (int i = 0; i < even_count; i++)
        printf("%s%d", i ? "," : "", evens[i]);
    printf("] max=%d\\n", max);
    return 0;
}`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'Three loops collapsed into one pass, and the caller owns the output buffer and its capacity. The formatting loop is written by hand because there is no join.'
      },
      cpp: {
        file: 'collections.cpp', effort: 2, expect: 'sum=15 evens=[2,4] max=5',
        run: 'clang++ -std=c++20 collections.cpp -o collections && ./collections',
        code: `#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};

    int sum = std::accumulate(nums.begin(), nums.end(), 0);
    int max = *std::max_element(nums.begin(), nums.end());

    std::vector<int> evens;
    std::copy_if(nums.begin(), nums.end(), std::back_inserter(evens),
                 [](int n) { return n % 2 == 0; });

    std::cout << "sum=" << sum << " evens=[";
    for (std::size_t i = 0; i < evens.size(); ++i)
        std::cout << (i ? "," : "") << evens[i];
    std::cout << "] max=" << max << std::endl;
}`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'The algorithms moved into <numeric> and <algorithm>: accumulate, max_element, copy_if. The container is a library type that knows its own size, and the loop still appears only where output is formatted.'
      },
      rust: {
        file: 'collections.rs', effort: 2, expect: 'sum=15 evens=[2,4] max=5',
        run: 'rustc collections.rs -o collections && ./collections',
        code: `fn main() {
    let nums = vec![1, 2, 3, 4, 5];

    let sum: i32 = nums.iter().sum();
    let max = *nums.iter().max().unwrap();
    let evens: Vec<i32> = nums.iter().copied().filter(|n| n % 2 == 0).collect();

    let evens_text = evens.iter().map(|n| n.to_string()).collect::<Vec<_>>().join(",");
    println!("sum={} evens=[{}] max={}", sum, evens_text, max);
}`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'Iterators are lazy: the chain compiles to the same single pass a C loop makes, and `unwrap()` is where Rust makes you acknowledge that a list could be empty.'
      },
      go: {
        file: 'collections.go', effort: 2, expect: 'sum=15 evens=[2,4] max=5',
        run: 'go run collections.go',
        code: `package main

import (
	"fmt"
	"strconv"
	"strings"
)

func main() {
	nums := []int{1, 2, 3, 4, 5}

	sum, max := 0, nums[0]
	var evens []int
	for _, n := range nums {
		sum += n
		if n > max {
			max = n
		}
		if n%2 == 0 {
			evens = append(evens, n)
		}
	}

	parts := make([]string, 0, len(evens))
	for _, n := range evens {
		parts = append(parts, strconv.Itoa(n))
	}
	fmt.Printf("sum=%d evens=[%s] max=%d\\n", sum, strings.Join(parts, ","), max)
}`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'One loop, as in C, with `append` handling growth and `range` giving both index and value. Strings need explicit conversion — Go has one numeric type per width and no implicit casting.'
      },
      java: {
        file: 'Collections.java', effort: 3, expect: 'sum=15 evens=[2,4] max=5',
        run: 'java Collections.java',
        code: `import java.util.*;
import java.util.stream.*;

public class Collections {
    public static void main(String[] args) {
        List<Integer> nums = List.of(1, 2, 3, 4, 5);

        int sum = nums.stream().mapToInt(Integer::intValue).sum();
        int max = nums.stream().mapToInt(Integer::intValue).max().orElseThrow();
        String evens = nums.stream()
                .filter(n -> n % 2 == 0)
                .map(String::valueOf)
                .collect(Collectors.joining(","));

        System.out.printf("sum=%d evens=[%s] max=%d%n", sum, evens, max);
    }
}`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'Streams are the Java answer to "who writes the loop": the same pipeline as the Rust iterator chain. Note `orElseThrow` — an empty list is not allowed to silently become 0.'
      },
      csharp: {
        file: 'Program.cs', effort: 1, expect: 'sum=15 evens=[2,4] max=5',
        run: 'dotnet run Program.cs',
        code: `var nums = new List<int> { 1, 2, 3, 4, 5 };

Console.WriteLine($"sum={nums.Sum()} evens=[{string.Join(",", nums.Where(n => n % 2 == 0))}] max={nums.Max()}");`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'LINQ makes the whole computation one expression, and this is the shortest program of the fifteen that still uses a real type system and a real container type.'
      },
      python: {
        file: 'collections.py', effort: 1, expect: 'sum=15 evens=[2,4] max=5',
        run: 'python3 collections.py',
        code: `nums = [1, 2, 3, 4, 5]

evens = [n for n in nums if n % 2 == 0]      # list comprehension
print(f"sum={sum(nums)} evens=[{','.join(map(str, evens))}] max={max(nums)}")`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'The comprehension is the language\'s signature construction: one expression that builds a list, replacing the loop and the append. sum and max are ordinary built-in functions over any iterable.'
      },
      js: {
        file: 'collections.js', effort: 1, expect: 'sum=15 evens=[2,4] max=5',
        run: 'node collections.js',
        code: `const nums = [1, 2, 3, 4, 5];

const sum = nums.reduce((a, b) => a + b, 0);
const max = Math.max(...nums);
const evens = nums.filter(n => n % 2 === 0);

console.log('sum=%d evens=[%s] max=%d', sum, evens.join(','), max);`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'Arrays carry higher-order methods as properties, so the operations are available without an import. `Math.max(...nums)` spreads the array into arguments — a neat trick that breaks on very large arrays.'
      },
      bash: {
        file: 'collections.sh', effort: 3, expect: 'sum=15 evens=[2,4] max=5',
        run: 'bash collections.sh',
        code: `#!/usr/bin/env bash
nums=(1 2 3 4 5)
sum=0
max=\${nums[0]}
evens=()
for n in "\${nums[@]}"; do
  sum=$(( sum + n ))
  (( n > max )) && max=$n
  (( n % 2 == 0 )) && evens+=("$n")
done
printf 'sum=%s evens=[%s] max=%s\\n' "$sum" "$(IFS=,; echo "\${evens[*]}")" "$max"`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'Arrays exist but they are string collections with integer indices; the arithmetic happens inside $(( )). Building the joined string needs the IFS trick, because there is no join function.'
      },
      sql: {
        file: 'collections.sql', effort: 2, expect: 'sum=15 evens=[2,4] max=5',
        run: `sqlite3 :memory: < collections.sql`,
        code: `-- A list is a table of rows. "Filter" is a WHERE clause; there is no loop.
WITH nums(n) AS (VALUES (1), (2), (3), (4), (5)),
     evens AS (SELECT group_concat(n, ',') AS list FROM (SELECT n FROM nums WHERE n % 2 = 0 ORDER BY n))
SELECT 'sum=' || (SELECT SUM(n) FROM nums)
    || ' evens=[' || (SELECT list FROM evens)
    || '] max=' || (SELECT MAX(n) FROM nums) AS result;`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'SUM, MAX and WHERE are built into the language, so the "algorithm" is implicit. Note that group_concat needs an explicit ORDER BY to be predictable — sets have no inherent order.'
      },
      haskell: {
        file: 'collections.hs', effort: 1, expect: 'sum=15 evens=[2,4] max=5',
        run: 'runghc collections.hs',
        code: `nums :: [Int]
nums = [1, 2, 3, 4, 5]

main :: IO ()
main = putStrLn $ "sum=" ++ show (sum nums)
                ++ " evens=[" ++ intercalate "," (map show (filter even nums))
                ++ "] max=" ++ show (maximum nums)

intercalate :: String -> [String] -> String
intercalate sep = foldr (\\a b -> if null b then a else a ++ sep ++ b) ""`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'sum, maximum and filter are ordinary functions over lists — nothing is special-cased, and `even` is itself a function. The join has to be written out (or imported from Data.List).'
      },
      ocaml: {
        file: 'collections.ml', effort: 2, expect: 'sum=15 evens=[2,4] max=5',
        run: 'ocaml collections.ml',
        code: `let nums = [1; 2; 3; 4; 5]

let sum = List.fold_left ( + ) 0 nums
let max = List.fold_left max min_int nums
let evens = List.filter (fun n -> n mod 2 = 0) nums

let () =
  Printf.printf "sum=%d evens=[%s] max=%d\\n"
    sum
    (String.concat "," (List.map string_of_int evens))
    max`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: '`List.fold_left` and `List.filter` are the equivalents, and `( + )` is a function like any other — that is what makes it legal to pass the operator into the fold.'
      },
      prolog: {
        file: 'collections.pl', effort: 3, expect: 'sum=15 evens=[2,4] max=5',
        run: 'swipl -q -g main -t halt collections.pl',
        code: `:- initialization(main).
:- use_module(library(aggregate)).

nums([1, 2, 3, 4, 5]).

main :-
    nums(Ns),
    aggregate_all(sum(N), member(N, Ns), Sum),
    aggregate_all(max(N), member(N, Ns), Max),
    findall(N, (member(N, Ns), 0 is N mod 2), Evens),
    atomic_list_concat(Evens, ',', EvenText),
    format("sum=~w evens=[~w] max=~w~n", [Sum, EvenText, Max]).`,
        expect: 'sum=15 evens=[2,4] max=5',
        note: 'Aggregation is a library over the search space rather than a language feature: `aggregate_all(sum(N), member(N, Ns), Sum)` says "sum N over every solution of member(N, Ns)". The loop is the backtracking itself.'
      },
      datalog: {
        file: 'collections.dl', effort: 4, expect: null,
        run: 'souffle collections.dl',
        code: `.decl nums(n: number)
nums(1). nums(2). nums(3). nums(4). nums(5).

.decl total(sum: number)
total(s) :- s = sum : { nums(_) }.

.decl largest(max: number)
largest(m) :- m = max : { nums(_) }.

.decl even(n: number)
even(n) :- nums(n), n % 2 = 0.

.output total, largest, even`,
        note: 'Aggregates are written as expressions over a sub-query, and "the evens" is simply a relation — no list is built and no order is implied. This is why Datalog engines can parallelise freely.'
      }
    }
  },

  {
    id: 'sorting',
    group: 'Data & Algorithms',
    title: 'Sorting (insertion sort)',
    prompt: 'Sort the numbers 5, 3, 8, 1, 9, 2 into ascending order using insertion sort — take each element and insert it into the already-sorted part. Print: sorted=[1,2,3,5,8,9]',
    why: 'Sorting is the canonical algorithm exercise, and choosing insertion sort keeps the comparison fair: it is short enough to write everywhere, but it still demands an index, a comparison, and a shift. Comparing the results shows which languages make you write the algorithm and which ones consider it a primitive.',
    takeaway: 'In C, C++, Rust, Go, Java, C#, Python, JavaScript, Bash, Haskell and OCaml you write the same nested loop or its functional equivalent. In Haskell and OCaml the algorithm becomes a fold with an insert helper — same idea, no indices. In Prolog it is a relation over lists. In Assembly the whole thing is a loop over memory addresses, with the element size baked into the addressing mode. SQL does not sort with an algorithm at all: ORDER BY is a *request*, and the engine decides whether to sort, index or merge. And Datalog has no ordering concept whatsoever: results are sets.',
    snippets: {
      asm: {
        file: 'sorting.s', effort: 5, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'clang -arch arm64 sorting.s -o sorting && ./sorting',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #48                // six variadic slots
    adrp  x19, data@PAGE
    add   x19, x19, data@PAGEOFF

    mov   w20, #1                    // i = 1
outer:
    cmp   w20, #6
    b.ge  print
    ldr   w21, [x19, w20, SXTW #2]   // key = a[i]
    sub   w22, w20, #1               // j = i - 1
inner:
    cmp   w22, #0
    b.lt  place
    ldr   w23, [x19, w22, SXTW #2]   // a[j]
    cmp   w23, w21
    b.le  place
    add   w24, w22, #1
    str   w23, [x19, w24, SXTW #2]   // shift a[j] right
    sub   w22, w22, #1
    b     inner
place:
    add   w24, w22, #1
    str   w21, [x19, w24, SXTW #2]   // drop key into the hole
    add   w20, w20, #1
    b     outer

print:
    mov   w20, #0
copy_out:
    cmp   w20, #6
    b.ge  print_now
    ldr   w1, [x19, w20, SXTW #2]
    str   x1, [sp, x20, LSL #3]      // pack the values for printf
    add   w20, w20, #1
    b     copy_out
print_now:
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf
    add   sp, sp, #48
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

    .section __DATA,__data
fmt:  .asciz "sorted=[%d,%d,%d,%d,%d,%d]\\n"
    .p2align 2
data: .word 5, 3, 8, 1, 9, 2`,
        note: 'Everything the algorithm needs is explicit: the element size (4 bytes, scaled into the address), the index arithmetic, the compare-and-branch, and six registers used as loop variables. There is no array bounds check and no sort function to call.'
      },
      c: {
        file: 'sorting.c', effort: 2, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'clang sorting.c -o sorting && ./sorting',
        code: `#include <stdio.h>

int main(void) {
    int a[] = {5, 3, 8, 1, 9, 2};
    int n = sizeof a / sizeof a[0];

    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }

    printf("sorted=[");
    for (int i = 0; i < n; i++) printf("%s%d", i ? "," : "", a[i]);
    printf("]\\n");
    return 0;
}`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'The classic nested shift, in place, with `sizeof a / sizeof a[0]` as the way to recover an array length — the container does not carry it.'
      },
      cpp: {
        file: 'sorting.cpp', effort: 2, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'clang++ -std=c++20 sorting.cpp -o sorting && ./sorting',
        code: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> a = {5, 3, 8, 1, 9, 2};

    for (std::size_t i = 1; i < a.size(); ++i) {     // the algorithm, by hand
        int key = a[i];
        std::size_t j = i;
        while (j > 0 && a[j - 1] > key) { a[j] = a[j - 1]; --j; }
        a[j] = key;
    }

    std::cout << "sorted=[";
    for (std::size_t i = 0; i < a.size(); ++i) std::cout << (i ? "," : "") << a[i];
    std::cout << "]" << std::endl;

    // What you would actually write in production:
    // std::sort(a.begin(), a.end());
}`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'Written out to match the other languages, with the one-line alternative noted. std::sort is introsort — a hybrid of quicksort, heapsort and insertion sort for small ranges.'
      },
      rust: {
        file: 'sorting.rs', effort: 2, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'rustc sorting.rs -o sorting && ./sorting',
        code: `fn insertion_sort(a: &mut Vec<i32>) {
    for i in 1..a.len() {
        let key = a[i];
        let mut j = i;
        while j > 0 && a[j - 1] > key {
            a[j] = a[j - 1];
            j -= 1;
        }
        a[j] = key;
    }
}

fn main() {
    let mut a = vec![5, 3, 8, 1, 9, 2];
    insertion_sort(&mut a);
    let text: Vec<String> = a.iter().map(|n| n.to_string()).collect();
    println!("sorted=[{}]", text.join(","));
    // Sorting a copy would be: let mut b = a.clone(); b.sort();
}`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'The mutable borrow `&mut Vec<i32>` is the whole story: the function is allowed to change the caller\'s data, and the compiler proves nothing else is reading it at the same time. Index bounds are checked at runtime.'
      },
      go: {
        file: 'sorting.go', effort: 2, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'go run sorting.go',
        code: `package main

import (
	"fmt"
	"strconv"
	"strings"
)

func insertionSort(a []int) {
	for i := 1; i < len(a); i++ {
		key, j := a[i], i
		for j > 0 && a[j-1] > key {
			a[j] = a[j-1]
			j--
		}
		a[j] = key
	}
}

func main() {
	a := []int{5, 3, 8, 1, 9, 2}
	insertionSort(a)                 // slices are references: this mutates a
	parts := make([]string, len(a))
	for i, n := range a {
		parts[i] = strconv.Itoa(n)
	}
	fmt.Printf("sorted=[%s]\\n", strings.Join(parts, ","))
}`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'A slice is a pointer, a length and a capacity, so passing `a` to the function passes a reference to the same backing array — no `&` needed, and no copy made.'
      },
      java: {
        file: 'Sorting.java', effort: 3, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'java Sorting.java',
        code: `import java.util.*;

public class Sorting {
    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i], j = i;
            while (j > 0 && a[j - 1] > key) { a[j] = a[j - 1]; j--; }
            a[j] = key;
        }
    }

    public static void main(String[] args) {
        int[] a = {5, 3, 8, 1, 9, 2};
        insertionSort(a);
        StringJoiner text = new StringJoiner(",");
        for (int n : a) text.add(String.valueOf(n));
        System.out.println("sorted=[" + text + "]");
        // java.util.Arrays.sort(a) is the one-liner;
        // Arrays.stream(a).sorted().boxed().toList() the functional one.
    }
}`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'An int[] is a fixed-size array you index; a List<Integer> would be the collection type. Arrays are passed by reference, so the sort mutates the caller\'s array — exactly as in Go.'
      },
      csharp: {
        file: 'Program.cs', effort: 2, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'dotnet run Program.cs',
        code: `int[] a = { 5, 3, 8, 1, 9, 2 };

for (int i = 1; i < a.Length; i++) {          // the algorithm, by hand
    int key = a[i], j = i;
    while (j > 0 && a[j - 1] > key) { a[j] = a[j - 1]; j--; }
    a[j] = key;
}

Console.WriteLine($"sorted=[{string.Join(",", a)}]");
// What you would actually write: Array.Sort(a); or a.OrderBy(n => n).ToArray();`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'Int32[] is a real array of values — no boxing, no per-element object — and string.Join renders it in one call.'
      },
      python: {
        file: 'sorting.py', effort: 2, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'python3 sorting.py',
        code: `def insertion_sort(a):
    for i in range(1, len(a)):
        key, j = a[i], i
        while j > 0 and a[j - 1] > key:
            a[j] = a[j - 1]
            j -= 1
        a[j] = key
    return a

nums = [5, 3, 8, 1, 9, 2]
insertion_sort(nums)
print(f"sorted=[{','.join(map(str, nums))}]")
# The one-liner would be: sorted(nums)`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'Note the deliberate omission of return: the list was mutated in place, which is the Python idiom for lists but would be a bug for tuples or strings — those are immutable and `sorted()` returns a new object instead.'
      },
      js: {
        file: 'sorting.js', effort: 2, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'node sorting.js',
        code: `function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i;
    while (j > 0 && a[j - 1] > key) { a[j] = a[j - 1]; j--; }
    a[j] = key;
  }
  return a;
}

const nums = [5, 3, 8, 1, 9, 2];
console.log('sorted=[%s]', insertionSort(nums).join(','));
// The built-in is nums.sort((x, y) => x - y): without the comparator it sorts
// as strings, so [10, 9] would come out as [10, 9] "alphabetically".`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'The same C-shaped loop, but the built-in sort is a trap: JavaScript\'s Array.prototype.sort compares strings unless you pass a comparator — a direct consequence of having one numeric type and coercive equality.'
      },
      bash: {
        file: 'sorting.sh', effort: 4, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'bash sorting.sh',
        code: `#!/usr/bin/env bash
a=(5 3 8 1 9 2)
n=\${#a[@]}

for (( i = 1; i < n; i++ )); do
  key=\${a[i]}
  j=$(( i - 1 ))
  while (( j >= 0 && a[j] > key )); do
    a[j + 1]=\${a[j]}
    j=$(( j - 1 ))
  done
  a[j + 1]=$key
done

printf 'sorted=[%s]\\n' "$(IFS=,; echo "\${a[*]}")"

# What you would actually write:  printf '%s\\n' 5 3 8 1 9 2 | sort -n | paste -sd,`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'C-style `for (( ))` loops exist in bash, so the algorithm survives translation — but every element is still a string being compared numerically by an integer coercion, and the sort tool one line below is what a real script would use.'
      },
      sql: {
        file: 'sorting.sql', effort: 1, expect: 'sorted=[1,2,3,5,8,9]',
        run: `sqlite3 :memory: < sorting.sql`,
        code: `-- There is no algorithm here, and that is the point: ORDER BY is a
-- request, and the engine chooses how to satisfy it (sort, index, merge).
WITH nums(n) AS (VALUES (5), (3), (8), (1), (9), (2)),
     ordered AS (SELECT n FROM nums ORDER BY n)
SELECT 'sorted=[' || group_concat(n, ',') || ']' AS result FROM ordered;`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'You cannot express insertion sort in plain SQL, and you would not want to. The declarative statement of the goal is one line — and the query planner is free to use an index instead of sorting at all.'
      },
      haskell: {
        file: 'sorting.hs', effort: 2, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'runghc sorting.hs',
        code: `insert :: Int -> [Int] -> [Int]
insert x [] = [x]
insert x (y : ys)
  | x <= y    = x : y : ys
  | otherwise = y : insert x ys

insertionSort :: [Int] -> [Int]
insertionSort = foldr insert []        -- insert each element into a sorted list

main :: IO ()
main = putStrLn $ "sorted=[" ++ join "," (map show (insertionSort [5, 3, 8, 1, 9, 2])) ++ "]"
  where join sep = foldr (\\a b -> if null b then a else a ++ sep ++ b) ""`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'The inner loop became `insert`, written with pattern matching, and the outer loop became `foldr`. No indices, no mutation, no swap — the same algorithm in a different coordinate system.'
      },
      ocaml: {
        file: 'sorting.ml', effort: 2, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'ocaml sorting.ml',
        code: `let rec insert x = function
  | [] -> [x]
  | y :: ys when x <= y -> x :: y :: ys
  | y :: ys -> y :: insert x ys

let insertion_sort = List.fold_right insert

let () =
  let sorted = insertion_sort [5; 3; 8; 1; 9; 2] in
  Printf.printf "sorted=[%s]\\n" (String.concat "," (List.map string_of_int sorted))`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: '`function` gives a one-argument pattern match, and `List.fold_right insert` is the whole outer loop. The compiler warns if the pattern match could miss a case, so `[]` and `y :: ys` are known to be complete.'
      },
      prolog: {
        file: 'sorting.pl', effort: 3, expect: 'sorted=[1,2,3,5,8,9]',
        run: 'swipl -q -g main -t halt sorting.pl',
        code: `:- initialization(main).

insert(X, [], [X]).
insert(X, [Y | Ys], [X, Y | Ys]) :- X =< Y, !.
insert(X, [Y | Ys], [Y | Zs])    :- insert(X, Ys, Zs).

insertion_sort([], []).
insertion_sort([X | Xs], Sorted) :-
    insertion_sort(Xs, Rest),
    insert(X, Rest, Sorted).

main :-
    insertion_sort([5, 3, 8, 1, 9, 2], Sorted),
    atomic_list_concat(Sorted, ',', Text),
    format("sorted=[~w]~n", [Text]).`,
        expect: 'sorted=[1,2,3,5,8,9]',
        note: 'The base cases and the recursive case are separate clauses, and the third argument of insert is the *result*, not an output parameter. Note that this same predicate can be run with the result given and the input unbound.'
      },
      datalog: {
        file: 'sorting.dl', effort: 4, expect: null,
        run: 'souffle sorting.dl',
        code: `.decl nums(n: number)
nums(5). nums(3). nums(8). nums(1). nums(9). nums(2).

// Relations are SETS: there is no order and no "first element" to compare.
// What Datalog can express is "the rank of n", not "the sorted list".
.decl rank(n: number, r: number)
rank(n, r) :- nums(n), r = 1 + count : { nums(m) : m < n }.

.output rank`,
        note: 'There is no insertion sort here, and there cannot be: Datalog has no sequences, no indices and no notion of "before". Sorting as a *list* is meaningless; what you can compute is a rank, and ordering is imposed at output time by the consumer.'
      }
    }
  },

  {
    id: 'wordcount',
    group: 'Data & Algorithms',
    title: 'Text processing (word frequency)',
    prompt: 'Take the sentence "the cat sat on the mat the cat", count how often each word appears, and print the two most frequent words as word=count, most frequent first: the=3 then cat=2',
    why: 'Text is where programming languages meet the real world of messy input and formatted output. This task needs iteration, a lookup structure, comparison and formatting — so it exposes the difference between languages that make strings first-class and those that treat them as byte arrays.',
    takeaway: 'The same algorithm — split, count, sort, print two lines — requires a hash map in seven languages, a library counter in two more, a hand-built association list in C and Assembly, and a genuinely different shape in the declarative three. The most striking result is Bash: one pipeline of four small programs (`tr`, `sort`, `uniq`, `awk`) does what the others need a data structure for, because it delegates the counting to the operating system. In SQL, Prolog and Datalog the sentence must first become a set of rows, tokens or facts before the query can even be written — that impedance is the price of declarativity.',
    snippets: {
      asm: {
        file: 'wordcount.s', effort: 5, expect: 'the=3',
        run: 'clang -arch arm64 wordcount.s -o wordcount && ./wordcount',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #16
    adrp  x19, words@PAGE
    add   x19, x19, words@PAGEOFF
    mov   w20, #0                    // index
    mov   w21, #0                    // how many times "the" appears
wc_loop:
    cmp   w20, #8
    b.ge  wc_done
    ldr   x0, [x19, x20, LSL #3]     // words[i] — 8-byte pointer, scaled
    adrp  x1, needle@PAGE
    add   x1, x1, needle@PAGEOFF
    bl    _strcmp
    cbnz  w0, wc_next
    add   w21, w21, #1
wc_next:
    add   w20, w20, #1
    b     wc_loop
wc_done:
    str   x21, [sp]
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf
    add   sp, sp, #16
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

    .section __DATA,__data
needle: .asciz "the"
fmt:    .asciz "the=%d\\n"
    .p2align 3
words:  .quad w0, w1, w2, w3, w4, w5, w6, w7
w0:     .asciz "the"
w1:     .asciz "cat"
w2:     .asciz "sat"
w3:     .asciz "on"
w4:     .asciz "the"
w5:     .asciz "mat"
w6:     .asciz "the"
w7:     .asciz "cat"`,
        note: 'A pointer table, a strcmp call and a counter — for one fixed word. The general version needs dynamic memory, a hash function, collision handling and a sort, which is a few hundred lines of this: precisely the work every other language here is doing behind a function call.',
        partial: 'This counts occurrences of the single known word "the", not all words.'
      },
      c: {
        file: 'wordcount.c', effort: 4, expect: 'the=3\ncat=2',
        run: 'clang wordcount.c -o wordcount && ./wordcount',
        code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char text[] = "the cat sat on the mat the cat";
    char *words[16];
    int counts[16];
    int n = 0;

    for (char *w = strtok(text, " "); w != NULL; w = strtok(NULL, " ")) {
        int found = -1;
        for (int i = 0; i < n; i++)
            if (strcmp(words[i], w) == 0) { found = i; break; }
        if (found < 0) { words[n] = w; counts[n] = 1; n++; }
        else counts[found]++;
    }

    for (int rank = 0; rank < 2; rank++) {          /* top two, by hand */
        int best = -1;
        for (int i = 0; i < n; i++) {
            if (counts[i] < 0) continue;
            if (best < 0 || counts[i] > counts[best]) best = i;
        }
        printf("%s=%d\\n", words[best], counts[best]);
        counts[best] = -1;                          /* mark as used */
    }
    return 0;
}`,
        expect: 'the=3\ncat=2',
        note: 'strtok destroys the string it splits, the linear search stands in for a hash table, and the "top two" is a selection loop. Forty lines for what Counter does in one in Python.'
      },
      cpp: {
        file: 'wordcount.cpp', effort: 2, expect: 'the=3\ncat=2',
        run: 'clang++ -std=c++20 wordcount.cpp -o wordcount && ./wordcount',
        code: `#include <algorithm>
#include <iostream>
#include <map>
#include <sstream>
#include <vector>

int main() {
    std::string text = "the cat sat on the mat the cat";
    std::map<std::string, int> counts;
    std::istringstream stream(text);
    for (std::string word; stream >> word; )
        counts[word]++;                            // inserts 0 first if absent

    std::vector<std::pair<std::string, int>> pairs(counts.begin(), counts.end());
    std::sort(pairs.begin(), pairs.end(), [](const auto &a, const auto &b) {
        return a.second != b.second ? a.second > b.second : a.first < b.first;
    });

    for (std::size_t i = 0; i < 2 && i < pairs.size(); ++i)
        std::cout << pairs[i].first << "=" << pairs[i].second << "\\n";
}`,
        expect: 'the=3\ncat=2',
        note: 'The stream extraction operator does the splitting, map::operator[] does the insert-or-increment, and the comparator spells out the tie-break rule that other languages leave implicit.'
      },
      rust: {
        file: 'wordcount.rs', effort: 2, expect: 'the=3\ncat=2',
        run: 'rustc wordcount.rs -o wordcount && ./wordcount',
        code: `use std::collections::HashMap;

fn main() {
    let text = "the cat sat on the mat the cat";

    let mut counts: HashMap<&str, usize> = HashMap::new();
    for word in text.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }

    let mut pairs: Vec<(&str, usize)> = counts.into_iter().collect();
    pairs.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));   // count desc, word asc

    for (word, n) in pairs.iter().take(2) {
        println!("{}={}", word, n);
    }
}`,
        expect: 'the=3\ncat=2',
        note: 'HashMap iteration order is random, so the explicit sort is not cosmetic — without it this program prints a different order on different runs. `entry().or_insert()` is the insert-or-default idiom.'
      },
      go: {
        file: 'wordcount.go', effort: 2, expect: 'the=3\ncat=2',
        run: 'go run wordcount.go',
        code: `package main

import (
	"fmt"
	"sort"
	"strings"
)

func main() {
	text := "the cat sat on the mat the cat"

	counts := make(map[string]int)
	for _, word := range strings.Fields(text) {
		counts[word]++
	}

	type pair struct {
		word  string
		count int
	}
	pairs := make([]pair, 0, len(counts))
	for w, c := range counts {
		pairs = append(pairs, pair{w, c})
	}
	sort.Slice(pairs, func(i, j int) bool {
		if pairs[i].count != pairs[j].count {
			return pairs[i].count > pairs[j].count
		}
		return pairs[i].word < pairs[j].word
	})

	for _, p := range pairs[:2] {
		fmt.Printf("%s=%d\\n", p.word, p.count)
	}
}`,
        expect: 'the=3\ncat=2',
        note: 'strings.Fields splits on any whitespace run, and the local `pair` struct exists only to make sorting possible — Go has no built-in way to sort a map by value.'
      },
      java: {
        file: 'WordCount.java', effort: 3, expect: 'the=3\ncat=2',
        run: 'java WordCount.java',
        code: `import java.util.*;
import java.util.stream.*;

public class WordCount {
    public static void main(String[] args) {
        String text = "the cat sat on the mat the cat";

        Map<String, Long> counts = Arrays.stream(text.split(" "))
                .collect(Collectors.groupingBy(w -> w, Collectors.counting()));

        counts.entrySet().stream()
              .sorted(Comparator.comparingLong((Map.Entry<String, Long> e) -> e.getValue())
                                .reversed()
                                .thenComparing(Map.Entry::getKey))
              .limit(2)
              .forEach(e -> System.out.printf("%s=%d%n", e.getKey(), e.getValue()));
    }
}`,
        expect: 'the=3\ncat=2',
        note: 'Two passes over the data expressed as two stream pipelines: group and count, then sort and take. The comparator has to be annotated with its type because the generic inference cannot work it out from the lambda alone.'
      },
      csharp: {
        file: 'Program.cs', effort: 1, expect: 'the=3\ncat=2',
        run: 'dotnet run Program.cs',
        code: `var text = "the cat sat on the mat the cat";

var top = text.Split(' ')
              .GroupBy(w => w)
              .Select(g => new { Word = g.Key, Count = g.Count() })
              .OrderByDescending(x => x.Count)
              .ThenBy(x => x.Word)
              .Take(2);

foreach (var item in top)
    Console.WriteLine($"{item.Word}={item.Count}");`,
        expect: 'the=3\ncat=2',
        note: 'The same four operations as the Java version, in the order they read in English: group, project, order, take. Anonymous types spare you a declared pair class.'
      },
      python: {
        file: 'wordcount.py', effort: 1, expect: 'the=3\ncat=2',
        run: 'python3 wordcount.py',
        code: `from collections import Counter

text = "the cat sat on the mat the cat"

counts = Counter(text.split())
for word, n in counts.most_common(2):
    print(f"{word}={n}")`,
        expect: 'the=3\ncat=2',
        note: 'Four lines, because the counting data structure ships with the standard library. Counter is a dict subclass, so it still supports every ordinary dict operation.'
      },
      js: {
        file: 'wordcount.js', effort: 1, expect: 'the=3\ncat=2',
        run: 'node wordcount.js',
        code: `const text = 'the cat sat on the mat the cat';

const counts = text.split(' ').reduce((acc, word) => {
  acc[word] = (acc[word] || 0) + 1;
  return acc;
}, {});

Object.entries(counts)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 2)
  .forEach(([word, n]) => console.log('%s=%d', word, n));`,
        expect: 'the=3\ncat=2',
        note: 'A plain object doubles as a hash map. Property order for string keys is insertion order, but sorting explicitly is still required here because the counts do not arrive in order.'
      },
      bash: {
        file: 'wordcount.sh', effort: 2, expect: 'the=3\ncat=2',
        run: 'bash wordcount.sh',
        code: `#!/usr/bin/env bash
echo "the cat sat on the mat the cat" |
  tr ' ' '\\n' |        # one word per line
  sort |               # group identical words
  uniq -c |            # count each group
  sort -rn |           # most frequent first
  head -2 |            # the top two
  awk '{ print $2 "=" $1 }'   # printf "%s=%d"

# Four small programs, one pipe. No data structure was declared.`,
        expect: 'the=3\ncat=2',
        note: 'This is the whole idea of the shell: tr splits, sort groups, uniq counts, sort ranks, awk formats. Each stage is a separate process, and the "data structure" is the stream between them.'
      },
      sql: {
        file: 'wordcount.sql', effort: 3, expect: 'the=3\ncat=2',
        run: `sqlite3 :memory: < wordcount.sql`,
        code: `-- The sentence has to become rows before it can be queried: that
-- conversion is the impedance mismatch between text and tables.
WITH words(w) AS (
  VALUES ('the'),('cat'),('sat'),('on'),('the'),('mat'),('the'),('cat')
)
SELECT w || '=' || COUNT(*) AS line
FROM words
GROUP BY w
ORDER BY COUNT(*) DESC, w
LIMIT 2;`,
        expect: 'the=3\ncat=2',
        note: 'Counting is a GROUP BY and ranking is an ORDER BY — no hash map appears in your code, yet the engine will build one. Note the data is a table of words: SQL has no split function in the standard.'
      },
      haskell: {
        file: 'wordcount.hs', effort: 2, expect: 'the=3\ncat=2',
        run: 'runghc wordcount.hs',
        code: `import Data.List (group, sort, sortBy)
import Data.Ord (comparing, Down (..))

text :: String
text = "the cat sat on the mat the cat"

-- group . sort puts equal words next to each other; length counts them.
counts :: [(String, Int)]
counts = [(head g, length g) | g <- group (sort (words text))]

ranked :: [(String, Int)]
ranked = sortBy (comparing (Down . snd) <> comparing fst) counts

main :: IO ()
main = mapM_ (\\(w, n) -> putStrLn (w ++ "=" ++ show n)) (take 2 ranked)`,
        expect: 'the=3\ncat=2',
        note: 'A list comprehension does the counting: sort the words, group the equal ones, take the head and the length of each group. No map is built at all — grouping a sorted list is a different algorithm from hashing.'
      },
      ocaml: {
        file: 'wordcount.ml', effort: 2, expect: 'the=3\ncat=2',
        run: 'ocaml wordcount.ml',
        code: `let text = "the cat sat on the mat the cat"

let () =
  let counts = Hashtbl.create 16 in
  List.iter
    (fun w ->
       let previous = try Hashtbl.find counts w with Not_found -> 0 in
       Hashtbl.replace counts w (previous + 1))
    (String.split_on_char ' ' text);

  (* take is written out here: no dependency on a newer stdlib version. *)
  let rec take n = function
    | [] -> []
    | x :: xs -> if n <= 0 then [] else x :: take (n - 1) xs in

  let pairs = Hashtbl.fold (fun w n acc -> (w, n) :: acc) counts [] in
  let ranked = List.sort (fun (w1, n1) (w2, n2) ->
      if n1 <> n2 then compare n2 n1 else compare w1 w2) pairs in
  List.iter (fun (w, n) -> Printf.printf "%s=%d\\n" w n) (take 2 ranked)`,
        expect: 'the=3\ncat=2',
        note: 'The standard library puts a hash table in front of you (Hashtbl) and an association list behind it, and exceptions carry the "not found" case — the same pattern OCaml uses to implement its own containers.'
      },
      prolog: {
        file: 'wordcount.pl', effort: 3, expect: 'the=3\ncat=2',
        run: 'swipl -q -g main -t halt wordcount.pl',
        code: `:- initialization(main).
:- use_module(library(aggregate)).

words([the, cat, sat, on, the, mat, the, cat]).

main :-
    words(Ws),
    setof(W, member(W, Ws), Distinct),            % every distinct word
    findall(N-W,                                     % count each one
            (member(W, Distinct), aggregate_all(count, member(W, Ws), N)),
            Pairs),
    sort(1, @>=, Pairs, [N1-W1, N2-W2 | _]),        % by count, descending
    format("~w=~w~n~w=~w~n", [W1, N1, W2, N2]).`,
        expect: 'the=3\ncat=2',
        note: 'setof and findall *materialise* the search space: the "loop" is the backtracking of member/2, and counting is a library aggregate over its solutions. Nothing was hashed; the words were enumerated.'
      },
      datalog: {
        file: 'wordcount.dl', effort: 4, expect: null,
        run: 'souffle wordcount.dl',
        code: `// Relations are sets, so a repeated word would collapse into one fact.
// Multiplicity has to be encoded as a position.
.decl token(pos: number, word: symbol)
token(1, "the"). token(2, "cat"). token(3, "sat"). token(4, "on").
token(5, "the"). token(6, "mat"). token(7, "the"). token(8, "cat").

.decl frequency(word: symbol, n: number)
frequency(w, n) :- token(_, w), n = count : { token(_, w) }.

.decl distinct_word(w: symbol)
distinct_word(w) :- token(_, w).

.output frequency, distinct_word`,
        note: 'The set semantics show up immediately: you cannot store "the" three times, so you store three positions that mention it. Ordering and "the top two" are left to the output stage — a Datalog program defines the whole frequency relation, not a ranking.'
      }
    }
  }
];
