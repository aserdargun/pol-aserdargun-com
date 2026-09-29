# POL working contract

- Build the English-only programming-foundations companion: the same thirteen tasks written in fifteen languages, similarities first and the real differences after. POL shows code; it does not execute programs in the browser, and must not acquire a compiler, runtime, or sandboxed evaluator.
- Keep the task set and the per-language sources as the single source of truth. The same task number must resolve to the same concept in every language, and a language that cannot express a task says so rather than faking a translation.
- Every snippet is displayed, never run. Do not add an evaluation affordance, and do not claim a language feature works without pointing at the dialect boundary it belongs to.
- This application is English-only by design. Do not introduce a Turkish surface, and keep the About and sources view linking the portfolio, the dialect boundaries, and the official references.
- Verify `npm run check` and review `git diff --check` before handoff.
- Local work only unless the user authorizes external publication. Preserve unrelated work and processes.
