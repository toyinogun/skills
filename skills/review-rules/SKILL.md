---
name: review-rules
allowed-tools: Read, Grep, Glob, Write, Edit
argument-hint: init | learn <what happened>
description: "Run `/review-rules` to create REVIEW.md, the rules every code review in this repo follows, or to add one approved rule to it after a review missed a bug or raised a false alarm. Use init once per repo, learn whenever a review got it wrong."
---

## Output style (plain words, no dashes, no hyphens)

<!-- OUTPUT-STYLE:START -->
Write everything this skill produces, files and messages alike, in plain simple language. Talk to the reader as `you`, warm and direct like a colleague, and present every step as a recommendation they may run or skip, never an order. Keep technical terms that carry real meaning; explain each in plain words. Never use a dash or a hyphen as punctuation: no em dash, no en dash, and no hyphenated compounds. Write `read only`, not `read-only`. Say it in simple words, or reword the sentence. Code, file paths, command flags, and values other skills match on keep their hyphens. Use short sentences, commas, or parentheses. Clear beats clever.
<!-- OUTPUT-STYLE:END -->

## What this skill does

`REVIEW.md` tells reviewers what matters in this repo, so `/check review` stops guessing. It stays short and the rest of the project context stays in `AGENTS.md`.

## Artifact ownership

- `REVIEW.md` at the repo root: this skill only.
- Root `AGENTS.md` belongs to `/audit`. This skill adds at most one pointer line to it, and only after the engineer says yes.

## Execution

### `init`

1. Read `AGENTS.md`, the manifest, the folder layout, and recent fix or revert commits (`git log -i --grep=revert --grep=fix`). If `REVIEW.md` exists, switch to `learn`.
2. Write `REVIEW.md` with these sections, filled from what you found:
   - What failure looks like here: one line per area (API, UI, data, config). Example shapes: "docs lie", "config misroutes", "a query leaks another user's rows".
   - Severity: blockers stop a merge, majors should be fixed first, minors and nits do not block, existing bugs the change did not introduce are reported apart.
   - Ignore: formatting, generated files, vendored code, and any paths the engineer names.
   - Evidence rule: every finding cites a file and line. No finding from a name or a guess.
   - Output: open with the count of findings, say plainly when nothing needs fixing, at most 3 nits.
   - Rules learned: an empty list.
3. Offer to add one line to root `AGENTS.md`, `Review rules: see REVIEW.md`, so `/check review` finds it. Add it only on a yes.
4. Print what you wrote and ask the engineer to correct the failure descriptions, since they know the repo best.

### `learn <what happened>`

Input is a bug a review missed, or a flag that turned out not to be a problem.

1. Propose one line that would have prevented it: `When <situation>, <check or ignore> because <short reason>`.
2. If an existing rule already covers it, tighten that rule instead of adding one.
3. Append under Rules learned only after the engineer approves. Do not edit other sections unasked.

Short beats complete. Cut any rule a reviewer would follow anyway, and never reword the engineer's own lines.
