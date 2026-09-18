/* ---------------------------------------------------------------------------
 * recipes-systems.js — tasks 12–13: concurrency, and graph reachability.
 * The second is the flagship comparison of the whole app: the same answer
 * costs ten lines of BFS in an imperative language and three lines of rules
 * in SQL, Prolog and Datalog.
 * ------------------------------------------------------------------------- */
window.RECIPES_SYSTEMS = [
  {
    id: 'concurrency',
    group: 'Systems reality',
    title: 'Concurrency',
    prompt: 'Add the numbers 1 to 4 in two parallel workers — one taking 1 and 2, the other taking 3 and 4 — accumulating into a shared total, then print total=10. Use whatever concurrency primitive the language treats as native.',
    why: 'Concurrency is where a language stops being notation and becomes a runtime. The five real options — OS threads with locks, green threads with channels, a managed thread pool, an event loop, and background processes — each come with a different failure mode, and the language you choose decides which one you will be fighting.',
    takeaway: 'The same total of 10 is reached by five genuinely different mechanisms. Assembly and C hand the work to the operating system: you create a thread, and every guarantee about what it sees is yours to establish. C++, Rust, Java and C# run real threads on a managed or compiled runtime, with Rust\'s Send/Sync traits going furthest by refusing to compile code that shares data unsafely. Go replaces threads with goroutines scheduled by its own runtime and channels as the interface, which is a different model rather than a faster one. JavaScript has exactly one thread and an event loop, so the "two workers" interleave instead of running at once. Bash uses processes, so its parallelism is real but its shared state is the file system. Haskell adds software transactional memory — atomic blocks that compose — and OCaml 5 gives real parallel domains. For SQL, concurrency is the engine\'s business and your job is only to declare which transaction anomalies you will tolerate; Datalog has no notion of it at all.',
    snippets: {
      asm: {
        file: 'concurrency.s', effort: 5, na: true,
        note: 'Threads are an operating system facility, not a language one: this would be a call to pthread_create with a stack you allocate yourself, and the ordering of two cores writing to one address is decided by hardware coherence rules you cannot see from here. The language does have the pieces — ldxr/stxr give you a compare-and-swap loop — which is proof of the bottom line: every lock in this task is, at machine level, a retry loop around those two instructions.'
      },
      c: {
        file: 'concurrency.c', effort: 3, expect: 'total=10',
        run: 'clang -pthread concurrency.c -o concurrency && ./concurrency',
        code: `#include <pthread.h>
#include <stdio.h>

static int total = 0;                             /* shared, and unsafe alone */
static pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

struct range { int lo, hi; };

void *worker(void *arg) {
    struct range *r = arg;
    int subtotal = 0;                             /* local: no sharing needed */
    for (int i = r->lo; i <= r->hi; i++) subtotal += i;

    pthread_mutex_lock(&lock);                    /* the guard is manual */
    total += subtotal;
    pthread_mutex_unlock(&lock);
    return NULL;
}

int main(void) {
    struct range a = {1, 2}, b = {3, 4};
    pthread_t t1, t2;

    pthread_create(&t1, NULL, worker, &a);
    pthread_create(&t2, NULL, worker, &b);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);

    printf("total=%d\\n", total);
    return 0;
}`,
        expect: 'total=10',
        note: 'Every piece is explicit: the thread handle, the lock, the struct passed as an opaque pointer. Forget the unlock on one path and the program hangs, with nothing in the type system to warn you.'
      },
      cpp: {
        file: 'concurrency.cpp', effort: 2, expect: 'total=10',
        run: 'clang++ -std=c++20 -pthread concurrency.cpp -o concurrency && ./concurrency',
        code: `#include <iostream>
#include <mutex>
#include <thread>

int total = 0;
std::mutex lock;

void worker(int lo, int hi) {
    int subtotal = 0;
    for (int i = lo; i <= hi; ++i) subtotal += i;
    std::lock_guard<std::mutex> guard(lock);   // RAII: unlocked on every exit path
    total += subtotal;
}

int main() {
    std::thread t1(worker, 1, 2);
    std::thread t2(worker, 3, 4);
    t1.join();
    t2.join();
    std::cout << "total=" << total << std::endl;
}`,
        expect: 'total=10',
        note: 'The lock_guard is the C version with the failure mode removed: the destructor unlocks, so an exception or an early return cannot leave the lock held. This is RAII doing what it does best.'
      },
      rust: {
        file: 'concurrency.rs', effort: 3, expect: 'total=10',
        run: 'rustc concurrency.rs -o concurrency && ./concurrency',
        code: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let total = Arc::new(Mutex::new(0));          // shared ownership + a lock
    let mut handles = Vec::new();

    for (lo, hi) in [(1, 2), (3, 4)] {
        let total = Arc::clone(&total);            // one reference per thread
        handles.push(thread::spawn(move || {
            let subtotal: i32 = (lo..=hi).sum();
            *total.lock().unwrap() += subtotal;
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("total={}", *total.lock().unwrap());
}`,
        expect: 'total=10',
        note: 'Arc and Mutex are not decoration: without them the closure cannot capture the shared value at all, because the compiler proves no two threads may hold a mutable reference to it. Data races are a compile error, so most of "concurrent programming" here is arguing with the compiler instead of debugging at 3am.'
      },
      go: {
        file: 'concurrency.go', effort: 1, expect: 'total=10',
        run: 'go run concurrency.go',
        code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	total := 0
	var lock sync.Mutex
	var wg sync.WaitGroup

	for _, r := range [][2]int{{1, 2}, {3, 4}} {
		wg.Add(1)
		go func(lo, hi int) {              // "go" is a keyword, not a library call
			defer wg.Done()
			subtotal := 0
			for i := lo; i <= hi; i++ {
				subtotal += i
			}
			lock.Lock()
			total += subtotal
			lock.Unlock()
		}(r[0], r[1])
	}

	wg.Wait()
	fmt.Printf("total=%d\\n", total)
}`,
        expect: 'total=10',
        note: 'Goroutines are cheap enough to launch thousands, and the runtime schedules them onto the available cores — the language has the primitive, not just the library. The idiomatic alternative to the mutex is a channel that carries the subtotals to one owner.'
      },
      java: {
        file: 'Concurrency.java', effort: 2, expect: 'total=10',
        run: 'java Concurrency.java',
        code: `import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Concurrency {
    public static void main(String[] args) throws Exception {
        AtomicInteger total = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(2);

        for (int[] range : new int[][]{{1, 2}, {3, 4}}) {
            pool.submit(() -> {
                int subtotal = 0;
                for (int i = range[0]; i <= range[1]; i++) subtotal += i;
                total.addAndGet(subtotal);          // atomic: no lock in the code
            });
        }

        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);
        System.out.printf("total=%d%n", total.get());
    }
}`,
        expect: 'total=10',
        note: 'AtomicInteger hides the read-modify-write behind one method call, and the executor hides thread lifetime behind a pool. Java\'s real advantage is the memory model: since Java 5 the specification tells you exactly what other threads are guaranteed to see.'
      },
      csharp: {
        file: 'Program.cs', effort: 1, expect: 'total=10',
        run: 'dotnet run Program.cs',
        code: `using System.Threading;
using System.Threading.Tasks;

int total = 0;

var tasks = new[] { (1, 2), (3, 4) }.Select(async range =>
{
    await Task.Yield();                        // let both tasks start
    int subtotal = 0;
    for (int i = range.Item1; i <= range.Item2; i++) subtotal += i;
    Interlocked.Add(ref total, subtotal);      // atomic read-modify-write
});

await Task.WhenAll(tasks);
Console.WriteLine($"total={total}");`,
        expect: 'total=10',
        note: 'async/await is built into the language, so concurrency is expressed as ordinary control flow. Task.WhenAll is the join, and Interlocked is the lock you do not have to remember to release.'
      },
      python: {
        file: 'concurrency.py', effort: 2, expect: 'total=10',
        run: 'python3 concurrency.py',
        code: `import threading

total = 0
lock = threading.Lock()

def worker(lo, hi):
    global total
    subtotal = sum(range(lo, hi + 1))          # pure work, no shared state
    with lock:
        total += subtotal

threads = [threading.Thread(target=worker, args=(1, 2)),
           threading.Thread(target=worker, args=(3, 4))]
for t in threads: t.start()
for t in threads: t.join()

print(f"total={total}")
print("the GIL means these two threads never run bytecode at the same time")`,
        expect: ['total=10', 'the GIL means these two threads never run bytecode at the same time'].join('\n'),
        note: 'Threads exist and the lock is the same object C uses, but CPython serialises bytecode execution behind the global interpreter lock — so this program is concurrent, not parallel. For CPU-bound work the answer is multiprocessing, and free-threaded builds now remove the GIL entirely.'
      },
      js: {
        file: 'concurrency.js', effort: 2, expect: 'total=10',
        run: 'node concurrency.js',
        code: `let total = 0;

async function worker(lo, hi) {
  let subtotal = 0;
  for (let i = lo; i <= hi; i++) subtotal += i;
  await new Promise(resolve => setImmediate(resolve));  // give the loop a turn
  total += subtotal;
}

(async () => {
  await Promise.all([worker(1, 2), worker(3, 4)]);
  console.log('total=%d', total);
  console.log('one thread, one event loop: the workers interleaved, they did not race');
})();`,
        expect: ['total=10', 'one thread, one event loop: the workers interleaved, they did not race'].join('\n'),
        note: 'There is no shared-memory hazard because there is only one thread: `await` yields to the event loop, and the two additions happen one after the other. Real parallelism needs worker_threads or a child process, and with it comes back every problem the single thread was hiding.'
      },
      bash: {
        file: 'concurrency.sh', effort: 3, expect: 'total=10',
        run: 'bash concurrency.sh',
        code: `#!/usr/bin/env bash
out=$(mktemp)
sum_range() {                              # each job is a separate PROCESS
  local lo=$1 hi=$2 s=0 i
  for (( i=lo; i<=hi; i++ )); do s=$(( s + i )); done
  echo "$s" >> "$out"                      # the file system is the shared state
}

sum_range 1 2 &
sum_range 3 4 &
wait                                       # the shell's join

total=$(awk '{ s += $1 } END { print s }' "$out")
rm -f "$out"
printf 'total=%s\\n' "$total"`,
        expect: 'total=10',
        note: 'Two background jobs and a wait: the parallelism is real, and it comes from the operating system rather than the language. Nothing is shared, so nothing can race — the price is that results have to travel through files or pipes.'
      },
      sql: {
        file: 'concurrency.sql', effort: 2, na: true,
        note: 'SQL has no concurrency constructs because the engine owns the threads. What you declare instead is the isolation level — which anomalies you are willing to tolerate — and the engine implements it with locking or MVCC. Two sessions updating the same row concurrently is exactly what BEGIN ... COMMIT and SELECT ... FOR UPDATE are for.'
      },
      haskell: {
        file: 'concurrency.hs', effort: 2, expect: 'total=10',
        run: 'runghc concurrency.hs',
        code: `import Control.Concurrent (forkIO)
import Control.Concurrent.STM
import Control.Monad (when)

main :: IO ()
main = do
  total <- newTVarIO 0                      -- transactional variables
  done  <- newTVarIO 0

  let worker lo hi = forkIO $ do
        let subtotal = sum [lo .. hi :: Int]
        atomically $ do                     -- one atomic block, no lock named
          modifyTVar' total (+ subtotal)
          modifyTVar' done (+ 1)

  worker 1 2
  worker 3 4

  atomically $ do                           -- block until both workers are done
    finished <- readTVar done
    when (finished < 2) retry

  result <- readTVarIO total
  putStrLn $ "total=" ++ show result

threadDelay-ish :: IO ()
threadDelay-ish = replicateM_ 1000 (return ())`,
        expect: 'total=10',
        note: 'STM is the distinctive part: you write the atomic block without naming a lock, and the runtime retries it if another thread interferes. Composition — two atomic blocks combined into one — is not something a mutex can do.'
      },
      ocaml: {
        file: 'concurrency.ml', effort: 3, expect: 'total=10',
        run: 'ocaml concurrency.ml',
        code: `let total = ref 0
let lock = Mutex.create ()

let worker lo hi =
  let subtotal = ref 0 in
  for i = lo to hi do subtotal := !subtotal + i done;
  Mutex.lock lock;
  total := !total + !subtotal;
  Mutex.unlock lock

let () =
  let d1 = Domain.spawn (fun () -> worker 1 2) in
  let d2 = Domain.spawn (fun () -> worker 3 4) in
  Domain.join d1;
  Domain.join d2;
  Printf.printf "total=%d\\n" !total`,
        expect: 'total=10',
        note: 'Domains are OCaml 5\'s real parallelism, and they run on separate cores with shared memory — which is why the lock is still there. Before OCaml 5 there was only one runtime lock, so threads gave you concurrency without parallelism.'
      },
      prolog: {
        file: 'concurrency.pl', effort: 3, na: true,
        note: 'Concurrency is not part of the logic paradigm: a Prolog program is a search, and the engine is free to reorder it. SWI-Prolog does expose thread_create/3 and message queues as library predicates, but nothing in the language\'s semantics depends on them — which is exactly the opposite of Go, where goroutines are the semantics.'
      },
      datalog: {
        file: 'concurrency.dl', effort: 3, na: true,
        note: 'Datalog has no concurrency constructs, and does not need them: a program is a set of rules with no evaluation order, so an engine is free to evaluate rules in parallel, in any order, on any number of threads — and the answer must come out the same. Soufflé does exactly that. This is the strongest possible statement of the declarative idea.'
      }
    }
  },

  {
    id: 'graph',
    group: 'Systems reality',
    title: 'Graph reachability — imperative versus declarative',
    prompt: 'Given the directed graph a→b, b→c, a→d, d→e, find every node reachable from node a, excluding a itself, and print them in alphabetical order: reachable=b,c,d,e',
    why: 'This is the same question as the transitive closure of a relation, and it is the task where the paradigms stop being a matter of taste. In an imperative language you choose a traversal, manage a frontier and a visited set, and then argue with yourself about duplicates and ordering. In the declarative three, reachability *is* the recursive definition, and the engine is responsible for computing it.',
    takeaway: 'The imperative solutions are all the same algorithm wearing different clothes: a worklist, a visited set, a loop that terminates when the frontier empties — ten to twenty lines each, and every one of them a place to introduce a bug. The SQL recursive CTE is five lines, Prolog is two clauses, and Datalog is two rules; none of them mentions a queue, a visited set or an order of evaluation. Note also how each handles duplicates: C relies on the `seen` array, Python on a set, SQL on UNION (which deduplicates) versus UNION ALL (which does not), Prolog on `findall` plus `sort`, and Datalog on the fact that relations are sets by construction. The declarative versions are not "shorter because they hide the work" — they are shorter because the algorithm is *derived* from the definition, and the engine picks the strategy.',
    snippets: {
      asm: {
        file: 'graph.s', effort: 5, expect: 'reachable=b,c,d,e',
        run: 'clang -arch arm64 graph.s -o graph && ./graph',
        code: `    .section __TEXT,__text
    .globl _main
_main:
    stp   x29, x30, [sp, #-16]!
    sub   sp, sp, #16                 // one variadic slot for printf
    // Warshall's algorithm on a 5x5 byte matrix: for each k, for each i,
    // for each j:  reach[i][j] |= reach[i][k] & reach[k][j]
    adrp  x19, matrix@PAGE
    add   x19, x19, matrix@PAGEOFF
    mov   w25, #5                     // row stride
    mov   w20, #0                     // k
k_loop:
    cmp   w20, #5
    b.ge  build_string
    mov   w21, #0                     // i
i_loop:
    cmp   w21, #5
    b.ge  k_next
    mov   w22, #0                     // j
    // if reach[i][k]:
    //   for j: if reach[k][j]: reach[i][j] = 1
    madd  w23, w21, w25, w20          // index i*5 + k
    ldrb  w23, [x19, x23]             // byte access needs the 64-bit index
    cbz   w23, j_next
j_loop:
    cmp   w22, #5
    b.ge  j_next
    madd  w24, w20, w25, w22          // k*5 + j
    ldrb  w24, [x19, x24]
    cbz   w24, j_skip
    madd  w26, w21, w25, w22          // i*5 + j
    mov   w24, #1
    strb  w24, [x19, x26]
j_skip:
    add   w22, w22, #1
    b     j_loop
j_next:
    add   w21, w21, #1
    b     i_loop
k_next:
    add   w20, w20, #1
    b     k_loop

build_string:
    adrp  x19, matrix@PAGE
    add   x19, x19, matrix@PAGEOFF
    adrp  x22, out@PAGE                // build "b,c,d,e" in a buffer
    add   x22, x22, out@PAGEOFF
    mov   w21, #1                      // skip node 0 (a itself)
    mov   w26, #0                      // characters written
str_loop:
    cmp   w21, #5
    b.ge  str_done
    ldrb  w23, [x19, x21]              // row 0, column j: the index is just j
    cbz   w23, str_next
    cbz   w26, no_comma
    mov   w24, #','
    strb  w24, [x22, x26]
    add   w26, w26, #1
no_comma:
    add   w24, w21, #97                // 'a' + index
    strb  w24, [x22, x26]
    add   w26, w26, #1
str_next:
    add   w21, w21, #1
    b     str_loop
str_done:
    mov   w24, #0
    strb  w24, [x22, x26]              // NUL-terminate for printf

    adrp  x1, out@PAGE
    add   x1, x1, out@PAGEOFF
    str   x1, [sp]                     // a pointer vararg: on the stack too
    adrp  x0, fmt@PAGE
    add   x0, x0, fmt@PAGEOFF
    bl    _printf
    add   sp, sp, #16
    mov   w0, #0
    ldp   x29, x30, [sp], #16
    ret

    .section __DATA,__data
fmt:    .asciz "reachable=%s\\n"
    .p2align 2
matrix: .byte 0,1,0,1,0            // a → b and a → d
        .byte 0,0,1,0,0            // b → c
        .byte 0,0,0,0,0
        .byte 0,0,0,0,1            // d → e
        .byte 0,0,0,0,0
out:    .space 16`,
        note: 'Warshall\'s triple loop computes the transitive closure in place — the same fixpoint a Datalog engine reaches, except here you own the iteration order and the termination proof. Note the row stride arithmetic for a flat byte matrix.',
        partial: 'Closure and formatting for this fixed five-node graph; the general case needs dynamic containers.'
      },
      c: {
        file: 'graph.c', effort: 3, expect: 'reachable=b,c,d,e',
        run: 'clang graph.c -o graph && ./graph',
        code: `#include <stdio.h>

#define N 5

int main(void) {
    /* adjacency matrix: a→b, b→c, a→d, d→e */
    int adj[N][N] = {{0, 1, 0, 1, 0},   /* a → b and a → d */
                     {0, 0, 1, 0, 0},
                     {0, 0, 0, 0, 0},
                     {0, 0, 0, 0, 1},
                     {0, 0, 0, 0, 0}};

    int seen[N] = {0}, queue[N], head = 0, tail = 0;
    queue[tail++] = 0;                      /* start at a */
    seen[0] = 1;

    while (head < tail) {                   /* the frontier is an array */
        int node = queue[head++];
        for (int next = 0; next < N; next++)
            if (adj[node][next] && !seen[next]) {
                seen[next] = 1;             /* mark on push, not on pop */
                queue[tail++] = next;
            }
    }

    printf("reachable=");
    int first = 1;
    for (int i = 1; i < N; i++) {
        if (!seen[i]) continue;
        printf("%s%c", first ? "" : ",", 'a' + i);
        first = 0;
    }
    printf("\\n");
    return 0;
}`,
        expect: 'reachable=b,c,d,e',
        note: 'A breadth-first traversal: the queue, the visited array and the loop are all yours. Marking on push rather than on pop is the subtle correctness decision here — do it the other way and nodes get enqueued twice.'
      },
      cpp: {
        file: 'graph.cpp', effort: 2, expect: 'reachable=b,c,d,e',
        run: 'clang++ -std=c++20 graph.cpp -o graph && ./graph',
        code: `#include <iostream>
#include <map>
#include <queue>
#include <set>
#include <string>

int main() {
    std::map<std::string, std::vector<std::string>> graph = {
        {"a", {"b", "d"}}, {"b", {"c"}}, {"d", {"e"}}
    };

    std::queue<std::string> frontier;
    std::set<std::string> seen;                     // sorted and unique
    frontier.push("a");

    while (!frontier.empty()) {
        std::string node = frontier.front();
        frontier.pop();
        for (const auto &next : graph[node])
            if (seen.insert(next).second)           // insert tells you if it was new
                frontier.push(next);
    }

    std::cout << "reachable=";
    for (auto it = seen.begin(); it != seen.end(); ++it)
        std::cout << (it == seen.begin() ? "" : ",") << *it;
    std::cout << std::endl;
}`,
        expect: 'reachable=b,c,d,e',
        note: 'std::set gives both the visited check and the alphabetical output order in one container, since it is kept sorted. `insert().second` is the idiom for "was it new?" — one call instead of a lookup plus an insert.'
      },
      rust: {
        file: 'graph.rs', effort: 2, expect: 'reachable=b,c,d,e',
        run: 'rustc graph.rs -o graph && ./graph',
        code: `use std::collections::{HashMap, HashSet, VecDeque};

fn main() {
    let edges = [("a", "b"), ("b", "c"), ("a", "d"), ("d", "e")];

    let mut graph: HashMap<&str, Vec<&str>> = HashMap::new();
    for (from, to) in edges {
        graph.entry(from).or_default().push(to);
    }

    let mut seen: HashSet<&str> = HashSet::new();
    let mut frontier: VecDeque<&str> = VecDeque::from(["a"]);

    while let Some(node) = frontier.pop_front() {
        for next in graph.get(node).into_iter().flatten() {
            if seen.insert(next) {                 // true only the first time
                frontier.push_back(next);
            }
        }
    }

    let mut sorted: Vec<&str> = seen.into_iter().collect();
    sorted.sort_unstable();
    println!("reachable={}", sorted.join(","));
}`,
        expect: 'reachable=b,c,d,e',
        note: 'The borrow checker keeps you honest about who owns the graph while it is being traversed, and `graph.get(node).into_iter().flatten()` handles the missing-key case without a branch.'
      },
      go: {
        file: 'graph.go', effort: 2, expect: 'reachable=b,c,d,e',
        run: 'go run graph.go',
        code: `package main

import (
	"fmt"
	"sort"
	"strings"
)

func main() {
	graph := map[string][]string{
		"a": {"b", "d"},
		"b": {"c"},
		"d": {"e"},
	}

	seen := map[string]bool{"a": true}
	frontier := []string{"a"}

	for len(frontier) > 0 {
		node := frontier[0]
		frontier = frontier[1:]              // pop the front
		for _, next := range graph[node] {
			if !seen[next] {
				seen[next] = true
				frontier = append(frontier, next)
			}
		}
	}

	delete(seen, "a")
	reachable := make([]string, 0, len(seen))
	for node := range seen {
		reachable = append(reachable, node)
	}
	sort.Strings(reachable)
	fmt.Printf("reachable=%s\\n", strings.Join(reachable, ","))
}`,
        expect: 'reachable=b,c,d,e',
        note: 'Maps and slices do the work, with a manual pop at the front. Deleting the start node afterwards is the small annoyance of using "seen" to mean "visited including the start" — a naming decision that costs a line.'
      },
      java: {
        file: 'Graph.java', effort: 2, expect: 'reachable=b,c,d,e',
        run: 'java Graph.java',
        code: `import java.util.*;

public class Graph {
    public static void main(String[] args) {
        Map<String, List<String>> graph = Map.of(
                "a", List.of("b", "d"),
                "b", List.of("c"),
                "d", List.of("e"));

        Set<String> seen = new TreeSet<>();          // sorted + unique
        Deque<String> frontier = new ArrayDeque<>();
        frontier.add("a");

        while (!frontier.isEmpty()) {
            String node = frontier.poll();
            for (String next : graph.getOrDefault(node, List.of()))
                if (seen.add(next))                  // true only the first time
                    frontier.add(next);
        }

        System.out.println("reachable=" + String.join(",", seen));
    }
}`,
        expect: 'reachable=b,c,d,e',
        note: 'A TreeSet gives sorted uniqueness as a property of the container, and ArrayDeque is the queue. The traversal is five lines of control flow and the rest is choosing the right collection types.'
      },
      csharp: {
        file: 'Program.cs', effort: 1, expect: 'reachable=b,c,d,e',
        run: 'dotnet run Program.cs',
        code: `var graph = new Dictionary<string, string[]>
{
    ["a"] = new[] { "b", "d" },
    ["b"] = new[] { "c" },
    ["d"] = new[] { "e" },
};

var seen = new SortedSet<string>();
var frontier = new Queue<string>();
frontier.Enqueue("a");

while (frontier.Count > 0)
{
    var node = frontier.Dequeue();
    foreach (var next in graph.GetValueOrDefault(node, Array.Empty<string>()))
        if (seen.Add(next))
            frontier.Enqueue(next);
}

Console.WriteLine($"reachable={string.Join(",", seen)}");`,
        expect: 'reachable=b,c,d,e',
        note: 'The same shape as Java with shorter ceremony: SortedSet for uniqueness plus order, Queue for the frontier, and string.Join to format. This is the task where managed languages show their strength — none of the code is about memory.'
      },
      python: {
        file: 'graph.py', effort: 1, expect: 'reachable=b,c,d,e',
        run: 'python3 graph.py',
        code: `from collections import deque

graph = {"a": ["b", "d"], "b": ["c"], "d": ["e"]}

seen = set()
frontier = deque(["a"])

while frontier:
    node = frontier.popleft()
    for next_node in graph.get(node, []):
        if next_node not in seen:
            seen.add(next_node)
            frontier.append(next_node)

print(f"reachable={','.join(sorted(seen))}")`,
        expect: 'reachable=b,c,d,e',
        note: 'Seven lines, because the dictionary, the set and the deque are all built in. Note that `seen` excludes the start node naturally here — the start is in the frontier but never added to `seen`.'
      },
      js: {
        file: 'graph.js', effort: 1, expect: 'reachable=b,c,d,e',
        run: 'node graph.js',
        code: `const graph = { a: ['b', 'd'], b: ['c'], d: ['e'] };

const seen = new Set();
const frontier = ['a'];

while (frontier.length > 0) {
  const node = frontier.shift();
  for (const next of graph[node] || []) {
    if (!seen.has(next)) {
      seen.add(next);
      frontier.push(next);
    }
  }
}

console.log('reachable=%s', [...seen].sort().join(','));`,
        expect: 'reachable=b,c,d,e',
        note: 'Set and Array do the job, and `shift` pops the front. The spread into an array is needed because Set has no sort method — iteration order for sets is insertion order, which here happens to be wrong, so sorting is not optional.'
      },
      bash: {
        file: 'graph.sh', effort: 4, expect: 'reachable=b,c,d,e',
        run: 'bash graph.sh',
        code: `#!/usr/bin/env bash
edges="a:b b:c a:d d:e"          # the graph as one string

front="a"
visited=""
while [[ -n $front ]]; do
  next=""
  for node in $front; do
    for edge in $edges; do
      src=\${edge%%:*}
      dst=\${edge##*:}
      if [[ $src == "$node" && " $visited $next " != *" $dst "* ]]; then
        next+="$dst "
      fi
    done
  done
  visited+="$next"
  front="$next"
done

reachable=$(echo $visited | tr ' ' '\\n' | grep -v '^$' | grep -v '^a$' | sort | paste -sd, -)
printf 'reachable=%s\\n' "$reachable"`,
        expect: 'reachable=b,c,d,e',
        note: 'The visited set is a space-delimited string and membership is a glob match — the only set primitive the shell has. It works, and every step is a string operation: this is what "no data structures" costs on a genuine algorithm.'
      },
      sql: {
        file: 'graph.sql', effort: 2, expect: 'reachable=b,c,d,e',
        run: `sqlite3 :memory: < graph.sql`,
        code: `-- Reachability is a recursive definition, and SQL has a construct for
-- exactly that. Note UNION (not UNION ALL): duplicates must disappear,
-- because a graph can have cycles.
WITH RECURSIVE edges(src, dst) AS (
  VALUES ('a', 'b'), ('b', 'c'), ('a', 'd'), ('d', 'e')
),
reachable(node) AS (
  SELECT dst FROM edges WHERE src = 'a'          -- base case
  UNION
  SELECT e.dst                                   -- recursive case
  FROM edges e JOIN reachable r ON e.src = r.node
)
SELECT 'reachable=' || group_concat(node, ',') AS result
FROM (SELECT node FROM reachable ORDER BY node);`,
        expect: 'reachable=b,c,d,e',
        note: 'No queue, no visited set, no traversal order: the CTE says "b is reachable because a→b, and anything reachable from a reachable node is reachable", and the engine iterates it to a fixpoint. The ORDER BY is needed only for presentation, because SQL results are unordered sets.'
      },
      haskell: {
        file: 'graph.hs', effort: 2, expect: 'reachable=b,c,d,e',
        run: 'runghc graph.hs',
        code: `import Data.List (intercalate, nub, sort)

edges :: [(Char, Char)]
edges = [('a', 'b'), ('b', 'c'), ('a', 'd'), ('d', 'e')]

-- One step of closure: add everything reachable from the current frontier.
step :: [Char] -> [Char]
step front = nub (front ++ [dst | (src, dst) <- edges, src \`elem\` front])

-- Iterate to a fixpoint. This is the same loop a Datalog engine runs.
closure :: [Char] -> [Char]
closure front =
  let next = step front
  in if length next == length front then front else closure next

main :: IO ()
main = putStrLn $ "reachable="
  ++ intercalate "," (map (: []) (sort (filter (/= 'a') (closure ['a']))))`,
        expect: 'reachable=b,c,d,e',
        note: 'The fixpoint loop is written by hand, because nothing in the language tells the compiler that a list comprehension over a recursive set is the thing to optimise. Note `map (: [])` — turning Char into String — and that intercalate is what join is called here.'
      },
      ocaml: {
        file: 'graph.ml', effort: 2, expect: 'reachable=b,c,d,e',
        run: 'ocaml graph.ml',
        code: `let edges = [('a', 'b'); ('b', 'c'); ('a', 'd'); ('d', 'e')]

let step front =
  List.sort_uniq compare
    (front @ List.filter_map (fun (src, dst) -> if List.mem src front then Some dst else None) edges)

let rec closure front =
  let next = step front in
  if List.length next = List.length front then front else closure next

let () =
  let reachable = List.filter (( <> ) 'a') (closure ['a']) in
  Printf.printf "reachable=%s\\n"
    (String.concat "," (List.map (String.make 1) (List.sort compare reachable)))`,
        expect: 'reachable=b,c,d,e',
        note: 'filter_map expresses "collect the successors of nodes in the frontier" in one call, and the fixpoint is recursion with an equality test. The whole algorithm is four lines of logic and four lines of formatting.'
      },
      prolog: {
        file: 'graph.pl', effort: 1, expect: 'reachable=b,c,d,e',
        run: 'swipl -q -g main -t halt graph.pl',
        code: `:- initialization(main).

edge(a, b).
edge(b, c).
edge(a, d).
edge(d, e).

%% Reachability is its own definition. No traversal is mentioned anywhere.
reachable(X, Y) :- edge(X, Y).
reachable(X, Y) :- edge(X, Z), reachable(Z, Y).

main :-
    findall(Y, reachable(a, Y), Nodes),
    sort(Nodes, Sorted),               % sort/2 also removes duplicates
    atomic_list_concat(Sorted, ',', Text),
    format("reachable=~w~n", [Text]).`,
        expect: 'reachable=b,c,d,e',
        note: 'Two clauses and no algorithm: "Y is reachable from X if there is an edge, or if there is an edge to a Z from which Y is reachable". The search engine discovers the traversal. `sort/2` is doing double duty — ordering and deduplication.'
      },
      datalog: {
        file: 'graph.dl', effort: 1, expect: null,
        run: 'souffle graph.dl',
        code: `.decl edge(src: symbol, dst: symbol)
edge("a", "b"). edge("b", "c"). edge("a", "d"). edge("d", "e").

// Transitive closure: the canonical Datalog program, in two rules.
.decl reachable(node: symbol)
reachable(d) :- edge("a", d).                      // base case
reachable(d) :- reachable(m), edge(m, d).          // recursive case

.output reachable`,
        note: 'This is the program Datalog exists for, and it is four lines. The engine evaluates it to a fixpoint, in parallel if it likes, and the answer is a set — no order, no duplicates, no traversal you have to get right. The same two rules appear inside SQL (as a recursive CTE), inside Prolog (as clauses) and inside the Rust compiler (polonius, for borrow checking).'
      }
    }
  }
];
