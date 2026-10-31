# The review loop add on

Four skills that sit around the core workflow without changing any of it. They add the parts the core leaves to you: a loop with caps, a per change risk rating, shared review rules, and a stranger test.

```
/architect → /review-loop <feature> → /fresh-eyes → /document → /sync
                  │  per round: /develop → /check verify → /check review
                  └─ /risk-rate sets review cadence · /review-rules feeds /check review
```

## Skills

- `/review-loop <feature>` runs rounds of `/develop`, `/check verify` and `/check review`. It copies the spec's `AC-N` lines into `.review-loop/criteria.md` and ticks one only when `/check verify` marks it met with evidence. It stops at 3 rounds (rethink the approach, then escalate), escalates when a finding class survives 2 fix rounds, reviews only the round's changes after round 1, and never counts a repeated finding as new.
- `/risk-rate` rates one change by what happens to a customer if it breaks. `low` reviews once, `medium` every round, `high` every round plus a second opinion on a different model.
- `/review-rules init` writes `REVIEW.md`. `learn` adds one approved line after a review missed something.
- `/fresh-eyes` sends a tester with no source access through the live app and writes `.fresh-eyes/report.md`.

## Hooks (Claude Code, optional)

- `skills/review-loop/scripts/eval-gate.mjs` is a Stop hook. It blocks stopping while `.review-loop/state.md` says `running` and criteria are unticked, and releases itself after 3 blocks.
- `skills/fresh-eyes/scripts/block-source-reads.mjs` is a PreToolUse hook. It denies source reads while `.fresh-eyes/active` exists. Best effort, not a sandbox.

Wiring snippets are in each skill. Tests: `npm run test:hooks`.

## What it does not change

No existing skill file is edited, so pulling upstream stays conflict free. `/check review` reads `REVIEW.md` only if it finds it through `AGENTS.md`, so `/review-rules init` offers to add one pointer line there.
