/* ---------------------------------------------------------------------------
 * recipes-errors.js — task 11: error handling.
 * Failure is the one thing every program must handle and almost no two
 * languages handle alike.
 * ------------------------------------------------------------------------- */
window.RECIPES_ERRORS = [
  {
    id: 'errors',
    group: 'Paradigms',
    title: 'Error handling',
    prompt: 'Write a division that reports failure instead of crashing when the divisor is zero. Compute divide(10,2) and divide(10,0), and print: ok=5 err=division by zero',
    why: 'The difference is not syntactic. It decides whether failure travels in the type, in the control flow, in a return value, in a global flag, or in the operating system — and therefore whether it is possible to ignore it by accident.',
    takeaway: 'The examples report division failure using result values, exceptions, status codes or relations. Rust warns about unused Result values; a type does not make ignoring failure impossible. SQLite returns NULL for division by zero, but other SQL engines can raise errors. Logic programs can model unsuccessful cases as missing answers or explicit error facts, while their runtimes can still report execution errors.',
    snippets: {
      asm: {
        file: 'errors.s', effort: 5, expect: 'ok=5 err=division by zero',
        run: 'clang -arch arm64 errors.s -o errors && ./errors',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #16                 // one variadic slot

    mov   w0, #10                     // 10 / 2 — the good case
    mov   w1, #2
    bl    _divide
    mov   w19, w0                     // quotient
    mov   w20, w1                     // status: 0 = ok, 1 = error

    mov   w0, #10                     // 10 / 0 — the bad case
    mov   w1, #0
    bl    _divide
    mov   w21, w0
    mov   w22, w1                     // status comes back alongside the result

    str   x19, [sp]                   // print "ok=5 err="
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf

    cbnz  w22, print_error            // the status decides the branch
    str   x21, [sp]
    adrp  x0, okfmt@PAGE
    add   x0, x0, okfmt@PAGEOFF
    bl    _printf
    b     finish
print_error:
    adrp  x0, msg@PAGE                // the "error" is only another branch
    add   x0, x0, msg@PAGEOFF
    bl    _puts
finish:
    add   sp, sp, #16
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

// int divide(int a, int b): quotient in w0, status in w1.
_divide:
    cbz   w1, divide_by_zero
    sdiv  w0, w0, w1
    mov   w1, #0                      // 0 = success
    ret
divide_by_zero:
    mov   w0, #0
    mov   w1, #1                      // 1 = the caller must deal with this
    ret

    .section __DATA,__data
fmt:    .asciz "ok=%d err="
okfmt:  .asciz "%d\\n"
msg:    .asciz "division by zero"`,
        note: 'No exceptions and no error type: a second return register and a branch. Every error mechanism in this list ultimately compiles to this, and the only real difference is who is forced to remember to check the status.'
      },
      c: {
        file: 'errors.c', effort: 3, 
        run: 'clang errors.c -o errors && ./errors',
        code: `#include <stdio.h>

/* Returns the quotient and reports success through an out-parameter. */
int divide(int a, int b, int *ok) {
    if (b == 0) { *ok = 0; return 0; }
    *ok = 1;
    return a / b;
}

int main(void) {
    int ok_flag;

    int good = divide(10, 2, &ok_flag);
    printf("ok=%d err=", good);

    int bad = divide(10, 0, &ok_flag);
    if (ok_flag) printf("%d\\n", bad);
    else         puts("division by zero");
    return 0;
}`,
        expect: 'ok=5 err=division by zero',
        note: 'The status travels through an out-parameter that the caller must pass and then remember to inspect. Nothing warns about an ignored out-parameter, which is why "check the return value" is the oldest piece of advice in the language.'
      },
      cpp: {
        file: 'errors.cpp', effort: 2, 
        run: 'clang++ -std=c++20 errors.cpp -o errors && ./errors',
        code: `#include <iostream>
#include <stdexcept>
#include <string>

int divide(int a, int b) {
    if (b == 0) throw std::invalid_argument("division by zero");
    return a / b;
}

int main() {
    int ok = divide(10, 2);

    std::string err;
    try {
        divide(10, 0);
    } catch (const std::invalid_argument &e) {
        err = e.what();
    }

    std::cout << "ok=" << ok << " err=" << err << std::endl;
}`,
        expect: 'ok=5 err=division by zero',
        note: 'Exceptions propagate through stack unwinding and ordinary RAII cleanup. Runtime and code-size costs depend on the implementation; std::expected (C++23) offers a value-based alternative.'
      },
      rust: {
        file: 'errors.rs', effort: 1, 
        run: 'rustc errors.rs -o errors && ./errors',
        code: `fn divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err("division by zero".to_string())
    } else {
        Ok(a / b)
    }
}

fn main() {
    let ok = divide(10, 2).unwrap();        // here the caller chooses to panic

    let err = match divide(10, 0) {
        Ok(value) => value.to_string(),
        Err(message) => message,
    };

    println!("ok={} err={}", ok, err);
}`,
        expect: 'ok=5 err=division by zero',
        note: 'Failure is in the type, and Result is #[must_use], so ignoring it produces a compiler warning. `?` propagates it upward in one character. Panic exists, but it is for bugs rather than for expected failure.'
      },
      go: {
        file: 'errors.go', effort: 2, 
        run: 'go run errors.go',
        code: `package main

import (
	"errors"
	"fmt"
)

func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}

func main() {
	ok, _ := divide(10, 2)          // the underscore is a deliberate discard
	_, err := divide(10, 0)
	fmt.Printf("ok=%d err=%v\\n", ok, err)
}`,
        expect: 'ok=5 err=division by zero',
        note: 'The error is an ordinary value travelling in the second return slot. Verbose by design: Go wants the failure visible at every call site rather than hidden behind a keyword that can unwind past it.'
      },
      java: {
        file: 'Errors.java', effort: 2, 
        run: 'java Errors.java',
        code: `public class Errors {
    static class DivisionByZero extends Exception {     // a checked exception
        DivisionByZero() { super("division by zero"); }
    }

    static int divide(int a, int b) throws DivisionByZero {
        if (b == 0) throw new DivisionByZero();
        return a / b;
    }

    public static void main(String[] args) {
        try {
            int ok = divide(10, 2);
            String err;
            try {
                divide(10, 0);
                err = "";
            } catch (DivisionByZero e) {
                err = e.getMessage();
            }
            System.out.printf("ok=%d err=%s%n", ok, err);
        } catch (DivisionByZero e) {
            System.out.println("not reached: 10/2 cannot fail");
        }
    }
}`,
        expect: 'ok=5 err=division by zero',
        note: 'Because the exception is checked, the signature says it may fail and the compiler forces you either to handle it or to declare it. Most later languages copied this feature and then dropped it, and the nesting above shows part of why.'
      },
      csharp: {
        file: 'Program.cs', effort: 2, 
        run: 'dotnet run Program.cs',
        code: `// Two idioms coexist: the Try pattern for failure you expect…
static bool TryDivide(int a, int b, out int result) {
    if (b == 0) { result = 0; return false; }
    result = a / b;
    return true;
}

// …and exceptions for failure you do not.
static int Divide(int a, int b) =>
    b == 0 ? throw new DivideByZeroException("division by zero") : a / b;

TryDivide(10, 2, out int ok);

string err;
try { Divide(10, 0); err = ""; }
catch (DivideByZeroException e) { err = e.Message; }

Console.WriteLine($"ok={ok} err={err}");`,
        expect: 'ok=5 err=division by zero',
        note: 'The framework shows the split everywhere: TryParse, TryGetValue and TryAdd for things that routinely fail, exceptions for everything else. Throw expressions and out parameters keep both forms compact.'
      },
      python: {
        file: 'errors.py', effort: 1, 
        run: 'python3 errors.py',
        code: `def divide(a, b):
    if b == 0:
        raise ValueError("division by zero")
    return a // b

ok = divide(10, 2)

try:
    divide(10, 0)
    err = None
except ValueError as e:
    err = str(e)

print(f"ok={ok} err={err}")`,
        expect: 'ok=5 err=division by zero',
        note: 'Exceptions are ordinary control flow here — "easier to ask forgiveness than permission" — so a function that raises is not a design failure, it is simply how the case gets reported.'
      },
      js: {
        file: 'errors.js', effort: 2, 
        run: 'node errors.js',
        code: `function divide(a, b) {
  if (b === 0) throw new Error('division by zero');
  return a / b;
}

const ok = divide(10, 2);

let err;
try {
  divide(10, 0);
  err = '';
} catch (e) {
  err = e.message;
}

console.log('ok=%d err=%s', ok, err);
// Note: without the guard, 10 / 0 would be Infinity — not an error.`,
        expect: 'ok=5 err=division by zero',
        note: 'The guard is doing real work: JavaScript arithmetic does not raise on division by zero, it returns Infinity or NaN and carries on. A silently wrong number is exactly the hazard exceptions are meant to prevent.'
      },
      bash: {
        file: 'errors.sh', effort: 3, 
        run: 'bash errors.sh',
        code: `#!/usr/bin/env bash
divide() {                      # status 0 = ok, 1 = error; the result is stdout
  if (( $2 == 0 )); then
    return 1
  fi
  echo $(( $1 / $2 ))
  return 0
}

ok=$(divide 10 2)

if err=$(divide 10 0); then
  :
else
  err="division by zero"        # the failed call bound nothing
fi

printf 'ok=%s err=%s\\n' "$ok" "$err"`,
        expect: 'ok=5 err=division by zero',
        note: 'Note that `if err=$(divide 10 0)` tests the *status* while binding whatever the command printed: a command returns two things at once, and confusing which one you are testing is the classic scripting bug.'
      },
      sql: {
        file: 'errors.sql', effort: 2, 
        run: `sqlite3 :memory: < errors.sql`,
        code: `-- Dividing by zero is not an error in SQL: it is NULL.
-- NULL is a third truth value, and COALESCE turns it into a message.
WITH attempts(a, b) AS (VALUES (10, 2), (10, 0))
SELECT 'ok=' || (SELECT CAST(a / b AS TEXT) FROM attempts WHERE b = 2)
    || ' err=' || COALESCE((SELECT CAST(a / b AS TEXT) FROM attempts WHERE b = 0),
                           'division by zero')
    AS result;`,
        expect: 'ok=5 err=division by zero',
        note: 'In SQLite, division by zero produces NULL, which COALESCE can replace. NULL is a missing-data marker; comparisons involving it may produce UNKNOWN. Other SQL engines can raise an error instead.'
      },
      haskell: {
        file: 'errors.hs', effort: 1, 
        run: 'runghc errors.hs',
        code: `divide :: Int -> Int -> Either String Int
divide _ 0 = Left "division by zero"
divide a b = Right (a \`div\` b)      -- backticks make a function into an operator

main :: IO ()
main = do
  let ok  = divide 10 2
      err = divide 10 0
  putStrLn $ "ok=" ++ either id show ok
          ++ " err=" ++ either id show err`,
        expect: 'ok=5 err=division by zero',
        note: 'There is no exception in this code, and no way to use the result as if it were a plain Int: Left and Right are two constructors of one type, and `either` consumes both cases at once.'
      },
      ocaml: {
        file: 'errors.ml', effort: 1, 
        run: 'ocaml errors.ml',
        code: `let divide a b = if b = 0 then Error "division by zero" else Ok (a / b)

let show = function
  | Ok value -> string_of_int value
  | Error message -> message

let () =
  Printf.printf "ok=%s err=%s\\n" (show (divide 10 2)) (show (divide 10 0))

(* OCaml has exceptions as well, and uses them freely — its own integer
   division raises Division_by_zero rather than returning a result type.
   Two mechanisms, chosen pragmatically. *)`,
        expect: 'ok=5 err=division by zero',
        note: 'This is the pragmatic functional language: a result type for expected failure, exceptions for everything else, and no pretence that one mechanism covers every case.'
      },
      prolog: {
        file: 'errors.pl', effort: 3, 
        run: 'swipl -q -g main -t halt errors.pl',
        code: `:- initialization(main).

%% Failure is the primary mechanism: if B is 0 the first clause fails, the
%% engine backtracks, and the second clause describes that same case.
divide(A, B, R) :- B =\\= 0, !, R is A / B.
divide(_, 0, 'division by zero').

main :-
    divide(10, 2, Ok),
    divide(10, 0, Err),
    format("ok=~g err=~w~n", [Ok, Err]).`,
        expect: 'ok=5 err=division by zero',
        note: 'There is no exception here: the second clause also *describes* the failing case, and the cut stops the engine looking for further options. Prolog has exceptions too, but "no proof found" is the paradigm\'s native answer to a bad question.'
      },
      datalog: {
        file: 'errors.dl', effort: 3, na: true,
        note: 'A Datalog error-handling example is omitted here. Success and failure could be encoded as explicit relations. An unsatisfied body derives no tuple, but type errors, invalid operations and resource failures can still occur in the engine. An empty result is not a general error-handling strategy.'
      }
    }
  }
];
