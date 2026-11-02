# Cowboy

A two player online cowboy duel built on papit. Read `BRIEF.md` first.

## Start here
`.claude/plan.md` is the confirmed plan. Its "Where we are" section says what's next, and its technical notes hold what was learned from the papit code. Keep that section current when you stop.

## How we work
- "do next task" runs one task from `.claude/plan.md`, then stops with a very short status:
  ```
  task 3 of 30 done
  <one-line summary>
  <what changed>
  <notes, only if any>

  next: task 4, <title>
  ```
- Thin slices: something visible early, then behaviour, then edge cases, then tests and docs.
- Reuse `@papit/*` before building. No runtime dependencies outside it without flagging it to the owner.
- Say when an idea is wrong, name a better one, then follow the owner's decision.
- Work inline, no subagents.
- Commit when a piece of work is done. Never push unless asked.

## Papit
The repo is at `~/Developer/projects/papit`. Start with its `.claude/CATALOG.md`, then the package READMEs. Trust the code over the docs. A bug or missing piece in papit gets reported to the owner, not patched from here.
